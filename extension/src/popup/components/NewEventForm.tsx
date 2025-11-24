import React, { useState, useEffect } from 'react'
import { getTags, createEvent, type Tag, type CreateEventPayload } from '../../lib/api'

interface NewEventFormProps {
  pageData: any
  onBack: () => void
  onSuccess: () => void
}

export default function NewEventForm({ pageData, onBack, onSuccess }: NewEventFormProps) {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState(pageData?.title || '')
  const [description, setDescription] = useState(pageData?.description || '')
  const [startDate, setStartDate] = useState(
    pageData?.datePublished || new Date().toISOString().split('T')[0]
  )
  const [endDate, setEndDate] = useState('')
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [primaryTagId, setPrimaryTagId] = useState<string>('')

  useEffect(() => {
    getTags()
      .then((fetchedTags) => {
        setTags(fetchedTags)
        setLoading(false)
      })
      .catch((err) => {
        setError('Failed to load tags')
        setLoading(false)
      })
  }, [])

  const handleTagToggle = (tagId: string) => {
    setSelectedTagIds((prev) => {
      if (prev.includes(tagId)) {
        // Remove tag
        if (primaryTagId === tagId) {
          setPrimaryTagId('')
        }
        return prev.filter((id) => id !== tagId)
      } else {
        // Add tag
        return [...prev, tagId]
      }
    })
  }

  const handlePrimaryTagClick = (tagId: string) => {
    if (!selectedTagIds.includes(tagId)) {
      setSelectedTagIds([...selectedTagIds, tagId])
    }
    setPrimaryTagId(tagId)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError('Title is required')
      return
    }

    if (selectedTagIds.length === 0) {
      setError('Please select at least one tag')
      return
    }

    setSubmitting(true)

    const payload: CreateEventPayload = {
      title: title.trim(),
      description: description.trim() || undefined,
      startDate,
      endDate: endDate || undefined,
      tagIds: selectedTagIds,
      primaryTagId: primaryTagId || undefined,
    }

    try {
      await createEvent(payload)
      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Failed to create event')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="form-container">
        <div className="form-header">
          <button className="back-button" onClick={onBack}>
            ←
          </button>
          <h2>Create New Event</h2>
        </div>
        <div className="loading">Loading tags...</div>
      </div>
    )
  }

  return (
    <div className="form-container">
      <div className="form-header">
        <button className="back-button" onClick={onBack}>
          ←
        </button>
        <h2>Create New Event</h2>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Event title"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Event description"
            rows={3}
          />
        </div>

        <div className="form-group">
          <label htmlFor="startDate">Start Date *</label>
          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="endDate">End Date (optional)</label>
          <input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate}
          />
          <small>Leave blank for single-day events</small>
        </div>

        <div className="form-group">
          <label>Tags * (click to select, double-click for primary)</label>
          <div className="tag-selector">
            {tags.map((tag) => {
              const isSelected = selectedTagIds.includes(tag.id)
              const isPrimary = primaryTagId === tag.id
              return (
                <div
                  key={tag.id}
                  className={`tag-chip ${isSelected ? 'selected' : ''} ${isPrimary ? 'primary' : ''}`}
                  onClick={() => handleTagToggle(tag.id)}
                  onDoubleClick={() => handlePrimaryTagClick(tag.id)}
                  title={isPrimary ? 'Primary tag' : tag.description || tag.name}
                >
                  {tag.name}
                </div>
              )
            })}
          </div>
          <small>Double-click a tag to mark it as primary</small>
        </div>

        <div className="form-actions">
          <button type="button" onClick={onBack}>
            Cancel
          </button>
          <button type="submit" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Event'}
          </button>
        </div>
      </form>
    </div>
  )
}
