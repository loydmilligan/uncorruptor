import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { TagSelector } from './TagSelector'
import type { Event } from '@/services/api'

interface EventFormProps {
  event?: Event | null
  onSubmit: (data: { title: string; description?: string; eventDate: string; tagIds: string[] }) => void
  onCancel: () => void
  isSubmitting?: boolean
}

export function EventForm({ event, onSubmit, onCancel, isSubmitting }: EventFormProps) {
  const [title, setTitle] = useState(event?.title || '')
  const [description, setDescription] = useState(event?.description || '')
  const [eventDate, setEventDate] = useState(event?.eventDate || '')
  const [tagIds, setTagIds] = useState<string[]>(event?.tags?.map((t) => t.id) || [])
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (event) {
      setTitle(event.title)
      setDescription(event.description || '')
      setEventDate(event.eventDate)
      setTagIds(event.tags?.map((t) => t.id) || [])
    }
  }, [event])

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!title.trim()) {
      newErrors.title = 'Title is required'
    } else if (title.length > 500) {
      newErrors.title = 'Title must be 500 characters or less'
    }

    if (!eventDate) {
      newErrors.eventDate = 'Event date is required'
    } else {
      const date = new Date(eventDate)
      const today = new Date()
      today.setHours(23, 59, 59, 999)
      if (date > today) {
        newErrors.eventDate = 'Event date cannot be in the future'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        eventDate,
        tagIds,
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter event title..."
          className={errors.title ? 'border-destructive' : ''}
        />
        {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="eventDate">Event Date *</Label>
        <Input
          id="eventDate"
          type="date"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
          max={new Date().toISOString().split('T')[0]}
          className={errors.eventDate ? 'border-destructive' : ''}
        />
        {errors.eventDate && <p className="text-sm text-destructive">{errors.eventDate}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the event in detail..."
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label>Tags</Label>
        <TagSelector selectedTagIds={tagIds} onChange={setTagIds} />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : event ? 'Update Event' : 'Create Event'}
        </Button>
      </div>
    </form>
  )
}
