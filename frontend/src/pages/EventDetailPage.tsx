import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useEvent, useUpdateEvent, useDeleteEvent } from '@/hooks/useEvents'
import { useUpdateCounterNarrative, useDeleteCounterNarrative } from '@/hooks/useCounterNarrative'
import { EventForm } from '@/components/EventForm'
import { TagBadge } from '@/components/TagBadge'
import { SourceList } from '@/components/SourceList'
import { CounterNarrativeForm } from '@/components/CounterNarrativeForm'
import { CriticalAnalysisView } from '@/components/CriticalAnalysisView'
import { getStrengthLabel, getStrengthColor } from '@/components/StrengthRatingSelector'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { formatDateRange, getAdminPeriodLabel } from '@/lib/utils'
import { downloadMarkdown, copyMarkdownToClipboard } from '@/lib/exportMarkdown'
import { cn } from '@/lib/utils'

type ViewMode = 'default' | 'analysis'

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [isEditingCounterNarrative, setIsEditingCounterNarrative] = useState(false)
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'failed'>('idle')
  const [viewMode, setViewMode] = useState<ViewMode>('default')

  const { data, isLoading, error } = useEvent(id)
  const updateEvent = useUpdateEvent()
  const deleteEvent = useDeleteEvent()
  const updateCounterNarrative = useUpdateCounterNarrative()
  const deleteCounterNarrative = useDeleteCounterNarrative()

  const event = data?.data

  const handleUpdate = async (formData: {
    title: string
    description?: string
    startDate: string
    endDate?: string
    tagIds: string[]
    primaryTagId?: string
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

  const handleCounterNarrativeSubmit = async (data: {
    narrativeText: string
    adminStrength: string
    concernStrength: string
    sourceRefs?: string
  }) => {
    if (!id) return

    try {
      await updateCounterNarrative.mutateAsync({ eventId: id, data })
      setIsEditingCounterNarrative(false)
    } catch (err) {
      console.error('Failed to update counter-narrative:', err)
    }
  }

  const handleDeleteCounterNarrative = async () => {
    if (!id) return
    if (!confirm('Are you sure you want to delete this counter-narrative?')) return

    try {
      await deleteCounterNarrative.mutateAsync(id)
    } catch (err) {
      console.error('Failed to delete counter-narrative:', err)
    }
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
            <span>{formatDateRange(event.startDate, event.endDate)}</span>
            <span>•</span>
            <span>{getAdminPeriodLabel(event.adminPeriod)}</span>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          {/* View Mode Toggle */}
          {event.counterNarrative && (
            <Button
              variant={viewMode === 'analysis' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode(viewMode === 'analysis' ? 'default' : 'analysis')}
            >
              {viewMode === 'analysis' ? 'Standard View' : 'Critical Analysis'}
            </Button>
          )}
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
          {[...event.tags].sort((a, b) => {
            if (a.isPrimary && !b.isPrimary) return -1
            if (!a.isPrimary && b.isPrimary) return 1
            return 0
          }).map((tag) => (
            <TagBadge key={tag.id} name={tag.name} color={tag.color} isPrimary={tag.isPrimary} />
          ))}
        </div>
      )}

      {/* Critical Analysis View */}
      {viewMode === 'analysis' && event.counterNarrative && (
        <CriticalAnalysisView event={event} />
      )}

      {/* Default View */}
      {viewMode === 'default' && (
        <>
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

          {/* Counter-Narrative */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Counter-Narrative</CardTitle>
              {!isEditingCounterNarrative && (
                <div className="flex gap-2">
                  {event.counterNarrative && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDeleteCounterNarrative}
                      disabled={deleteCounterNarrative.isPending}
                    >
                      {deleteCounterNarrative.isPending ? 'Deleting...' : 'Delete'}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingCounterNarrative(true)}
                  >
                    {event.counterNarrative ? 'Edit' : 'Add'}
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {isEditingCounterNarrative ? (
                <CounterNarrativeForm
                  counterNarrative={event.counterNarrative}
                  onSubmit={handleCounterNarrativeSubmit}
                  onCancel={() => setIsEditingCounterNarrative(false)}
                  isSubmitting={updateCounterNarrative.isPending}
                />
              ) : event.counterNarrative ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">
                      Administration&apos;s Position
                    </h4>
                    <p className="whitespace-pre-wrap">{event.counterNarrative.narrativeText}</p>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <div>
                      <span className="text-sm text-muted-foreground">Admin Argument: </span>
                      <span
                        className={cn(
                          'inline-flex items-center px-2 py-0.5 rounded text-sm font-medium',
                          getStrengthColor(event.counterNarrative.adminStrength)
                        )}
                      >
                        {getStrengthLabel(event.counterNarrative.adminStrength)}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Concern Level: </span>
                      <span
                        className={cn(
                          'inline-flex items-center px-2 py-0.5 rounded text-sm font-medium',
                          getStrengthColor(event.counterNarrative.concernStrength)
                        )}
                      >
                        {getStrengthLabel(event.counterNarrative.concernStrength)}
                      </span>
                    </div>
                  </div>
                  {event.counterNarrative.sourceRefs && (
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-1">
                        Supporting References
                      </h4>
                      <p className="whitespace-pre-wrap text-sm">{event.counterNarrative.sourceRefs}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  No counter-narrative added yet. Click &quot;Add&quot; to document the administration&apos;s
                  position and rate the argument strength.
                </p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
