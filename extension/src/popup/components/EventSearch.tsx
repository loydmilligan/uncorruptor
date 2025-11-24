import React, { useState, useEffect, useRef } from 'react'
import { searchEvents, type Event } from '../../lib/api'

interface EventSearchProps {
  onSelect: (eventId: string) => void
  selectedEventId: string
}

export default function EventSearch({ onSelect, selectedEventId }: EventSearchProps) {
  const [query, setQuery] = useState('')
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (query.trim().length < 2) {
      setEvents([])
      return
    }

    // Debounce search
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      performSearch(query)
    }, 300)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [query])

  const performSearch = async (searchQuery: string) => {
    setLoading(true)
    setError(null)

    try {
      const results = await searchEvents(searchQuery)
      setEvents(results)
    } catch (err: any) {
      setError('Failed to search events')
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (event: Event) => {
    onSelect(event.id)
    setQuery(event.title)
    setEvents([])
  }

  const selectedEvent = selectedEventId
    ? events.find((e) => e.id === selectedEventId)
    : null

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for an event..."
        style={{ width: '100%' }}
      />

      {loading && <div className="loading">Searching...</div>}

      {error && <div className="error-message">{error}</div>}

      {events.length > 0 && (
        <div className="event-search-results">
          {events.map((event) => (
            <div
              key={event.id}
              className={`event-search-item ${selectedEventId === event.id ? 'selected' : ''}`}
              onClick={() => handleSelect(event)}
            >
              <div className="event-search-title">{event.title}</div>
              <div className="event-search-meta">
                {event.startDate}
                {event.tags.length > 0 && ` • ${event.tags.map((t) => t.name).join(', ')}`}
              </div>
            </div>
          ))}
        </div>
      )}

      {query.trim().length >= 2 && events.length === 0 && !loading && (
        <div style={{ padding: '10px', fontSize: '13px', color: '#6b7280' }}>
          No events found
        </div>
      )}

      {selectedEvent && events.length === 0 && (
        <div className="event-search-results">
          <div className="event-search-item selected">
            <div className="event-search-title">{selectedEvent.title}</div>
            <div className="event-search-meta">
              {selectedEvent.startDate}
              {selectedEvent.tags.length > 0 &&
                ` • ${selectedEvent.tags.map((t) => t.name).join(', ')}`}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
