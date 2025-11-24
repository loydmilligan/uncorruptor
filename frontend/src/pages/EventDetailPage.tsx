import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useEvent, useUpdateEvent, useDeleteEvent } from '@/hooks/useEvents'
import { EventForm } from '@/components/EventForm'
import { TagBadge } from '@/components/TagBadge'
import { SourceList } from '@/components/SourceList'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { formatDate, getAdminPeriodLabel } from '@/lib/utils'
import { downloadMarkdown, copyMarkdownToClipboard } from '@/lib/exportMarkdown'

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'failed'>('idle')

  const { data, isLoading, error } = useEvent(id)
  const updateEvent = useUpdateEvent()
  const deleteEvent = useDeleteEvent()

  const event = data?.data

  const handleUpdate = async (formData: {
    title: string
    description?: string
    eventDate: string
    tagIds: string[]
  }) => {
    if (!id) return

    try {
      await updateEvent.mutateAsync({ id, data: formData })
      setIsEditing(false)
    } catch (err) {
      console.error('Failed to update event:', err)
    }
  }

  const handleDelete = async () => {
    if (!id) return
    if (!confirm('Are you sure you want to delete this event?')) return

    try {
      await deleteEvent.mutateAsync(id)
      navigate('/events')
    } catch (err) {
      console.error('Failed to delete event:', err)
    }
  }

  const handleCopyMarkdown = async () => {
    if (!event) return
    const success = await copyMarkdownToClipboard(event)
    setCopyStatus(success ? 'copied' : 'failed')
    setTimeout(() => setCopyStatus('idle'), 2000)
  }

  const handleDownloadMarkdown = () => {
    if (!event) return
    downloadMarkdown(event)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-32 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">Error loading event: {error.message}</p>
        <Link to="/events">
          <Button variant="outline">Back to Events</Button>
        </Link>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Event not found</p>
        <Link to="/events">
          <Button variant="outline">Back to Events</Button>
        </Link>
      </div>
    )
  }

  if (isEditing) {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Edit Event</h1>
        <Card>
          <CardContent className="pt-6">
            <EventForm
              event={event}
              onSubmit={handleUpdate}
              onCancel={() => setIsEditing(false)}
              isSubmitting={updateEvent.isPending}
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/events" className="hover:text-foreground">
          Events
        </Link>
        <span>/</span>
        <span className="text-foreground">{event.title}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-2">{event.title}</h1>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>{formatDate(event.eventDate)}</span>
            <span>•</span>
            <span>{getAdminPeriodLabel(event.adminPeriod)}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleDownloadMarkdown}>
            Download MD
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopyMarkdown}>
            {copyStatus === 'copied' ? 'Copied!' : copyStatus === 'failed' ? 'Failed' : 'Copy MD'}
          </Button>
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteEvent.isPending}
          >
            {deleteEvent.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>

      {/* Tags */}
      {event.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {event.tags.map((tag) => (
            <TagBadge key={tag.id} name={tag.name} color={tag.color} />
          ))}
        </div>
      )}

      {/* Description */}
      {event.description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{event.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Sources */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <SourceList
            eventId={event.id}
            sources={event.sources || []}
          />
        </CardContent>
      </Card>

      {/* Counter-narrative - placeholder for Phase 5 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Counter-Narrative</CardTitle>
        </CardHeader>
        <CardContent>
          {event.counterNarrative ? (
            <div className="space-y-2">
              <p className="whitespace-pre-wrap">{event.counterNarrative.narrativeText}</p>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>Admin argument: {event.counterNarrative.adminStrength}</span>
                <span>Concern strength: {event.counterNarrative.concernStrength}</span>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">
              No counter-narrative added yet. (Counter-narrative management will be added in Phase 5)
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
