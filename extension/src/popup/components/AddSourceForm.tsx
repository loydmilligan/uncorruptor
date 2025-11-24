import React, { useState } from 'react'
import { addSource, type AddSourcePayload } from '../../lib/api'
import EventSearch from './EventSearch'

interface AddSourceFormProps {
  pageData: any
  onBack: () => void
  onSuccess: () => void
}

export default function AddSourceForm({ pageData, onBack, onSuccess }: AddSourceFormProps) {
  const [selectedEventId, setSelectedEventId] = useState<string>('')
  const [url, setUrl] = useState(pageData?.url || '')
  const [articleTitle, setArticleTitle] = useState(pageData?.title || '')
  const [biasRating, setBiasRating] = useState(3)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!selectedEventId) {
      setError('Please select an event')
      return
    }

    if (!url.trim()) {
      setError('URL is required')
      return
    }

    setSubmitting(true)

    const payload: AddSourcePayload = {
      url: url.trim(),
      articleTitle: articleTitle.trim() || undefined,
      biasRating,
    }

    try {
      await addSource(selectedEventId, payload)
      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Failed to add source')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="form-container">
      <div className="form-header">
        <button className="back-button" onClick={onBack}>
          ←
        </button>
        <h2>Add Source to Event</h2>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Select Event *</label>
          <EventSearch
            onSelect={(eventId) => setSelectedEventId(eventId)}
            selectedEventId={selectedEventId}
          />
        </div>

        <div className="form-group">
          <label htmlFor="url">Source URL *</label>
          <input
            id="url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/article"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="articleTitle">Article Title</label>
          <input
            id="articleTitle"
            type="text"
            value={articleTitle}
            onChange={(e) => setArticleTitle(e.target.value)}
            placeholder="Article title"
          />
          <small>Defaults to page title if not provided</small>
        </div>

        <div className="form-group">
          <label htmlFor="biasRating">
            Bias/Reliability Rating: {biasRating} / 5
          </label>
          <input
            id="biasRating"
            type="range"
            min="1"
            max="5"
            value={biasRating}
            onChange={(e) => setBiasRating(Number(e.target.value))}
          />
          <small>
            1 = Highly Biased/Unreliable, 5 = Neutral/Highly Reliable
          </small>
        </div>

        <div className="form-actions">
          <button type="button" onClick={onBack}>
            Cancel
          </button>
          <button type="submit" disabled={submitting || !selectedEventId}>
            {submitting ? 'Adding...' : 'Add Source'}
          </button>
        </div>
      </form>
    </div>
  )
}
