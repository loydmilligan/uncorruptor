/**
 * Dashboard Hook
 * Fetches and manages dashboard data
 */

import { useQuery } from '@tanstack/react-query'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export interface DashboardSummary {
  totalEvents: number
  totalSources: number
  eventsWithCounterNarratives: number
  mostCommonTag: {
    name: string
    count: number
  } | null
}

export interface EventsByTag {
  tagName: string
  tagId: string
  count: number
  color?: string
}

export interface TimelineData {
  month: string
  count: number
  events: Array<{
    id: string
    title: string
    startDate: string
  }>
}

export interface AdminComparisonData {
  administration: string
  eventCount: number
  categories: {
    [tagName: string]: number
  }
}

/**
 * Fetch dashboard summary statistics
 */
export function useDashboardSummary() {
  return useQuery<DashboardSummary>({
    queryKey: ['dashboard', 'summary'],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/dashboard/summary`)
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard summary')
      }
      const data = await response.json()
      return data.data
    },
  })
}

/**
 * Fetch events by tag distribution
 */
export function useEventsByTag() {
  return useQuery<EventsByTag[]>({
    queryKey: ['dashboard', 'events-by-tag'],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/dashboard/events-by-tag`)
      if (!response.ok) {
        throw new Error('Failed to fetch events by tag')
      }
      const data = await response.json()
      return data.data
    },
  })
}

/**
 * Fetch timeline data
 */
export function useTimeline(startDate?: Date, endDate?: Date) {
  const params = new URLSearchParams()
  if (startDate) {
    params.append('startDate', startDate.toISOString())
  }
  if (endDate) {
    params.append('endDate', endDate.toISOString())
  }

  const queryString = params.toString()

  return useQuery<TimelineData[]>({
    queryKey: ['dashboard', 'timeline', queryString],
    queryFn: async () => {
      const url = queryString
        ? `${API_URL}/dashboard/timeline?${queryString}`
        : `${API_URL}/dashboard/timeline`

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Failed to fetch timeline')
      }
      const data = await response.json()
      return data.data
    },
  })
}

/**
 * Fetch admin comparison data
 */
export function useAdminComparison() {
  return useQuery<AdminComparisonData[]>({
    queryKey: ['dashboard', 'comparison'],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/dashboard/comparison`)
      if (!response.ok) {
        throw new Error('Failed to fetch admin comparison')
      }
      const data = await response.json()
      return data.data
    },
  })
}
