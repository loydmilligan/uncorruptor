import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sourcesApi, type Source, type ApiResponse } from '@/services/api'

export function useSources(eventId: string | undefined) {
  return useQuery({
    queryKey: ['sources', eventId],
    queryFn: async () => {
      if (!eventId) return { data: [] }
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/events/${eventId}/sources`)
      if (!response.ok) throw new Error('Failed to fetch sources')
      return response.json()
    },
    enabled: !!eventId,
  })
}

export function useCreateSource(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { url: string; articleTitle?: string; biasRating: number; publicationId?: string }) =>
      sourcesApi.create(eventId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sources', eventId] })
      queryClient.invalidateQueries({ queryKey: ['events', eventId] })
    },
  })
}

export function useUpdateSource(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ sourceId, data }: { sourceId: string; data: Partial<{ url: string; articleTitle?: string; biasRating: number; isArchived: boolean }> }) =>
      sourcesApi.update(eventId, sourceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sources', eventId] })
      queryClient.invalidateQueries({ queryKey: ['events', eventId] })
    },
  })
}

export function useDeleteSource(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (sourceId: string) => sourcesApi.delete(eventId, sourceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sources', eventId] })
      queryClient.invalidateQueries({ queryKey: ['events', eventId] })
    },
  })
}
