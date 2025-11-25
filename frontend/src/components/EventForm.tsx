import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { TagSelector } from './TagSelector'
import { DuplicateWarning } from './DuplicateWarning'
import { useDuplicateCheck } from '@/hooks/useDuplicateCheck'
import type { Event } from '@/services/api'

interface EventFormData {
  title: string
  description?: string
  startDate: string
  endDate?: string
  tagIds: string[]
  primaryTagId?: string
}

interface EventFormProps {
  event?: Event | null
  onSubmit: (data: EventFormData) => void
  onCancel: () => void
  isSubmitting?: boolean
}

export function EventForm({ event, onSubmit, onCancel, isSubmitting }: EventFormProps) {
  const [title, setTitle] = useState(event?.title || '')
  const [description, setDescription] = useState(event?.description || '')
  const [startDate, setStartDate] = useState(event?.startDate || '')
  const [endDate, setEndDate] = useState(event?.endDate || '')
  const [tagIds, setTagIds] = useState<string[]>(event?.tags?.map((t) => t.id) || [])
  const [primaryTagId, setPrimaryTagId] = useState<string | undefined>(
    event?.tags?.find((t) => t.isPrimary)?.id
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Check for duplicates only when creating a new event (no existing event ID)
  const shouldCheckDuplicates = !event?.id && title.length > 3 && startDate.length > 0
  const { data: duplicates } = useDuplicateCheck(title, startDate, shouldCheckDuplicates)

  useEffect(() => {
    if (event) {
      setTitle(event.title)
      setDescription(event.description || '')
      setStartDate(event.startDate)
      setEndDate(event.endDate || '')
      setTagIds(event.tags?.map((t) => t.id) || [])
      setPrimaryTagId(event.tags?.find((t) => t.isPrimary)?.id)
    }
  }, [event])

  // When tagIds changes, ensure primaryTagId is still valid
  useEffect(() => {
    if (primaryTagId && !tagIds.includes(primaryTagId)) {
      setPrimaryTagId(undefined)
    }
  }, [tagIds, primaryTagId])

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!title.trim()) {
      newErrors.title = 'Title is required'
    } else if (title.length > 500) {
      newErrors.title = 'Title must be 500 characters or less'
    }

    if (!startDate) {
      newErrors.startDate = 'Start date is required'
    } else {
      const start = new Date(startDate)
      const today = new Date()
      today.setHours(23, 59, 59, 999)
      if (start > today) {
        newErrors.startDate = 'Start date cannot be in the future'
      }
    }

    if (endDate && startDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      if (end < start) {
        newErrors.endDate = 'End date cannot be before start date'
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
        startDate,
        endDate: endDate || undefined,
        tagIds,
        primaryTagId,
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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date *</Label>
          <Input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className={errors.startDate ? 'border-destructive' : ''}
          />
          {errors.startDate && <p className="text-sm text-destructive">{errors.startDate}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">End Date (optional)</Label>
          <Input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate || undefined}
            className={errors.endDate ? 'border-destructive' : ''}
          />
          {errors.endDate && <p className="text-sm text-destructive">{errors.endDate}</p>}
          <p className="text-xs text-muted-foreground">Leave empty for single-day or ongoing events</p>
        </div>
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

      {/* Duplicate Warning */}
      {duplicates && duplicates.length > 0 && (
        <DuplicateWarning duplicates={duplicates} />
      )}

      <div className="space-y-2">
        <Label>Tags</Label>
        <TagSelector
          selectedTagIds={tagIds}
          onChange={setTagIds}
          primaryTagId={primaryTagId}
          onPrimaryChange={setPrimaryTagId}
        />
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
