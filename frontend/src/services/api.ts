const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export interface ApiError {
  code: string
  message: string
  details?: Record<string, string[]>
}

export interface ApiResponse<T> {
  success: true
  data: T
}

export interface PaginatedResponse<T> {
  success: true
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export interface ApiErrorResponse {
  success: false
  error: ApiError
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    const data = await response.json()

    if (!response.ok || data.success === false) {
      const error = data.error || { code: 'UNKNOWN_ERROR', message: 'An unknown error occurred' }
      throw new ApiRequestError(error.code, error.message, error.details)
    }

    return data
  }

  async get<T>(endpoint: string, params?: Record<string, string | number | undefined>): Promise<T> {
    let url = endpoint
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value))
        }
      })
      const queryString = searchParams.toString()
      if (queryString) {
        url = `${endpoint}?${queryString}`
      }
    }
    return this.request<T>(url)
  }

  async post<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async put<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    })
  }
}

export class ApiRequestError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: Record<string, string[]>
  ) {
    super(message)
    this.name = 'ApiRequestError'
  }
}

export const api = new ApiClient(API_BASE_URL)

// Type definitions for API entities
export interface Tag {
  id: string
  name: string
  description: string | null
  color: string
  isDefault: boolean
  createdAt: string
}

export interface TagWithPrimary extends Tag {
  isPrimary: boolean
}

export interface Publication {
  id: string
  name: string
  domain: string
  defaultBias: number
  credibility: 'high' | 'mixed' | 'low' | null
}

export interface Source {
  id: string
  eventId: string
  publicationId: string | null
  url: string
  articleTitle: string | null
  biasRating: number
  dateAccessed: string
  isArchived: boolean
  createdAt: string
  publication: Publication | null
}

export interface CounterNarrative {
  id: string
  eventId: string
  narrativeText: string
  adminStrength: 'weak' | 'moderate' | 'strong'
  concernStrength: 'weak' | 'moderate' | 'strong'
  sourceRefs: string | null
  createdAt: string
  updatedAt: string
}

export type AdminPeriod = 'TRUMP_1' | 'TRUMP_2' | 'OTHER'

export interface Event {
  id: string
  title: string
  description: string | null
  startDate: string
  endDate: string | null
  adminPeriod: AdminPeriod
  createdAt: string
  updatedAt: string
  tags: TagWithPrimary[]
  sources?: Source[]
  counterNarrative?: CounterNarrative | null
  _count?: {
    sources: number
  }
}

// API endpoint helpers
export const eventsApi = {
  list: (params?: { page?: number; pageSize?: number; search?: string; tags?: string; adminPeriod?: string; startDate?: string; endDate?: string }) =>
    api.get<PaginatedResponse<Event>>('/events', params),

  get: (id: string) =>
    api.get<ApiResponse<Event>>(`/events/${id}`),

  create: (data: { title: string; description?: string; startDate: string; endDate?: string; tagIds: string[]; primaryTagId?: string }) =>
    api.post<ApiResponse<Event>>('/events', data),

  update: (id: string, data: Partial<{ title: string; description?: string; startDate: string; endDate?: string | null; tagIds: string[]; primaryTagId?: string | null }>) =>
    api.put<ApiResponse<Event>>(`/events/${id}`, data),

  delete: (id: string) =>
    api.delete<void>(`/events/${id}`),
}

export const tagsApi = {
  list: () =>
    api.get<ApiResponse<Tag[]>>('/tags'),

  create: (data: { name: string; description?: string; color?: string }) =>
    api.post<ApiResponse<Tag>>('/tags', data),

  delete: (id: string) =>
    api.delete<void>(`/tags/${id}`),
}

export const sourcesApi = {
  create: (eventId: string, data: { url: string; articleTitle?: string; biasRating: number; publicationId?: string }) =>
    api.post<ApiResponse<Source>>(`/events/${eventId}/sources`, data),

  update: (eventId: string, sourceId: string, data: Partial<{ url: string; articleTitle?: string; biasRating: number; isArchived: boolean }>) =>
    api.put<ApiResponse<Source>>(`/events/${eventId}/sources/${sourceId}`, data),

  delete: (eventId: string, sourceId: string) =>
    api.delete<void>(`/events/${eventId}/sources/${sourceId}`),
}

export const publicationsApi = {
  list: () =>
    api.get<ApiResponse<Publication[]>>('/publications'),

  lookup: (domain: string) =>
    api.get<ApiResponse<Publication | null>>('/publications/lookup', { domain }),
}

export const counterNarrativeApi = {
  update: (eventId: string, data: { narrativeText: string; adminStrength: string; concernStrength: string; sourceRefs?: string }) =>
    api.put<ApiResponse<CounterNarrative>>(`/events/${eventId}/counter-narrative`, data),

  delete: (eventId: string) =>
    api.delete<void>(`/events/${eventId}/counter-narrative`),
}

export const dashboardApi = {
  summary: () =>
    api.get<ApiResponse<{ totalEvents: number; totalSources: number; eventsByTag: Record<string, number>; eventsByPeriod: Record<string, number> }>>('/dashboard/summary'),

  timeline: (params?: { startDate?: string; endDate?: string; granularity?: 'day' | 'week' | 'month' }) =>
    api.get<ApiResponse<Array<{ date: string; count: number }>>>('/dashboard/timeline', params),

  comparison: () =>
    api.get<ApiResponse<{ trump1: Record<string, number>; trump2: Record<string, number> }>>('/dashboard/comparison'),
}
