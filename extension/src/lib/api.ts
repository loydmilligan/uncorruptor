/**
 * API client for the extension
 */

export interface Event {
  id: string
  title: string
  description: string | null
  startDate: string
  endDate: string | null
  adminPeriod: string
  tags: Array<{
    id: string
    name: string
    isPrimary: boolean
  }>
}

export interface Tag {
  id: string
  name: string
  description: string | null
  color: string
}

export interface CreateEventPayload {
  title: string
  description?: string
  startDate: string
  endDate?: string
  tagIds: string[]
  primaryTagId?: string
}

export interface AddSourcePayload {
  url: string
  articleTitle?: string
  biasRating: number
  publicationId?: string
}

/**
 * Get the API URL from settings
 */
async function getApiUrl(): Promise<string> {
  const result = await chrome.storage.sync.get(['apiUrl'])
  return result.apiUrl || 'http://localhost:3001'
}

/**
 * Search for events
 */
export async function searchEvents(query: string): Promise<Event[]> {
  const apiUrl = await getApiUrl()
  const response = await fetch(`${apiUrl}/api/events?search=${encodeURIComponent(query)}&pageSize=20`)

  if (!response.ok) {
    throw new Error(`Failed to search events: ${response.statusText}`)
  }

  const data = await response.json()
  return data.data || []
}

/**
 * Get all tags
 */
export async function getTags(): Promise<Tag[]> {
  const apiUrl = await getApiUrl()
  const response = await fetch(`${apiUrl}/api/tags`)

  if (!response.ok) {
    throw new Error(`Failed to fetch tags: ${response.statusText}`)
  }

  const data = await response.json()
  return data.data || []
}

/**
 * Create a new event
 */
export async function createEvent(payload: CreateEventPayload): Promise<Event> {
  const apiUrl = await getApiUrl()

  try {
    const response = await fetch(`${apiUrl}/api/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error?.message || `Failed to create event: ${response.statusText}`)
    }

    const data = await response.json()
    return data.data
  } catch (error) {
    // If offline, queue the action
    await chrome.runtime.sendMessage({
      action: 'queueAction',
      actionType: 'createEvent',
      payload,
    })
    throw error
  }
}

/**
 * Add a source to an existing event
 */
export async function addSource(eventId: string, payload: AddSourcePayload): Promise<void> {
  const apiUrl = await getApiUrl()

  try {
    const response = await fetch(`${apiUrl}/api/events/${eventId}/sources`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error?.message || `Failed to add source: ${response.statusText}`)
    }
  } catch (error) {
    // If offline, queue the action
    await chrome.runtime.sendMessage({
      action: 'queueAction',
      actionType: 'addSource',
      payload: { eventId, ...payload },
    })
    throw error
  }
}

/**
 * Test API connection
 */
export async function testConnection(): Promise<boolean> {
  const apiUrl = await getApiUrl()

  try {
    const response = await fetch(`${apiUrl}/health`, {
      method: 'GET',
    })
    return response.ok
  } catch {
    return false
  }
}
