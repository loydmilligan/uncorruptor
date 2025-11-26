import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { TagSelector } from './TagSelector'
import { DuplicateWarning } from './DuplicateWarning'
import { TagSuggestions } from './ai/TagSuggestions'
import { useDuplicateCheck } from '@/hooks/useDuplicateCheck'
import { useTagSuggestions } from '@/hooks/useTagSuggestions'
import { useTags, useCreateTag } from '@/hooks/useTags'
import { useSettings } from '@/hooks/useSettings'
import type { Event } from '@/services/api'
import { Sparkles } from 'lucide-react'

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
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Check for duplicates only when creating a new event (no existing event ID)
  const shouldCheckDuplicates = !event?.id && title.length > 3 && startDate.length > 0
  const { data: duplicates } = useDuplicateCheck(title, startDate, shouldCheckDuplicates)

  // AI tag suggestions
  const { suggestions, isLoading, error, getSuggestions, cancel, reset } = useTagSuggestions()
  const { data: tags } = useTags()
  const createTag = useCreateTag()
  const { isAIConfigured } = useSettings()

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

  const handleGetSuggestions = async () => {
    if (!title.trim()) {
      setErrors({ ...errors, title: 'Please enter a title before getting suggestions' })
      return
    }
    setShowSuggestions(true)
    await getSuggestions(title, description || undefined)
  }

  const handleAddTag = async (tagName: string) => {
    if (!tags?.data) return

    // Find or create the tag
    const existingTag = tags.data.find((t) => t.name.toLowerCase() === tagName.toLowerCase())

    if (existingTag) {
      // Add the existing tag if not already selected
      if (!tagIds.includes(existingTag.id)) {
        setTagIds([...tagIds, existingTag.id])
      }
    } else {
      // Create new tag
      try {
        const result = await createTag.mutateAsync({ name: tagName })
        // Add the newly created tag
        if (result.data.id && !tagIds.includes(result.data.id)) {
          setTagIds([...tagIds, result.data.id])
        }
      } catch (err) {
        console.error('Failed to create tag:', err)
      }
    }
  }

  const handleCloseSuggestions = () => {
    setShowSuggestions(false)
    reset()
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

      {/* AI Tag Suggestions Button */}
      {isAIConfigured && !showSuggestions && (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleGetSuggestions}
            disabled={!title.trim()}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Suggest Tags with AI
          </Button>
        </div>
      )}

      {/* Tag Suggestions */}
      {showSuggestions && (
        <TagSuggestions
          suggestions={suggestions}
          isLoading={isLoading}
          error={error}
          onAddTag={handleAddTag}
          onCancel={cancel}
          onClose={handleCloseSuggestions}
        />
      )}

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
