import { useMutation, useQueryClient } from '@tanstack/react-query'
import { counterNarrativeApi } from '@/services/api'

export function useCreateCounterNarrativeSource(eventId: string, counterNarrativeId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { url: string; articleTitle?: string; biasRating: number; publicationId?: string }) =>
      counterNarrativeApi.createSource(eventId, counterNarrativeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', eventId] })
    },
  })
}

export function useUpdateCounterNarrativeSource(eventId: string, counterNarrativeId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ sourceId, data }: { sourceId: string; data: Partial<{ url: string; articleTitle?: string; biasRating: number; isArchived: boolean }> }) =>
      counterNarrativeApi.updateSource(eventId, counterNarrativeId, sourceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', eventId] })
    },
  })
}

export function useDeleteCounterNarrativeSource(eventId: string, counterNarrativeId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (sourceId: string) => counterNarrativeApi.deleteSource(eventId, counterNarrativeId, sourceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', eventId] })
    },
  })
}
