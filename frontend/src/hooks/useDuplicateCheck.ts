/**
 * Hook for checking duplicate events
 */

import { useQuery } from '@tanstack/react-query'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

interface DuplicateEvent {
  id: string
  title: string
  startDate: string
}

export function useDuplicateCheck(title: string, startDate: string, enabled: boolean = true) {
  return useQuery<DuplicateEvent[]>({
    queryKey: ['duplicates', title, startDate],
    queryFn: async () => {
      if (!title || !startDate) return []

      const params = new URLSearchParams({ title, startDate })
      const response = await fetch(`${API_URL}/events/check-duplicates?${params}`)

      if (!response.ok) {
        throw new Error('Failed to check for duplicates')
      }

      const data = await response.json()
      return data.data || []
    },
    enabled: enabled && !!title && !!startDate,
    staleTime: 1000 * 60, // 1 minute
  })
}
