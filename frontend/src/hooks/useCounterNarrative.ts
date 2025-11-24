import { useMutation, useQueryClient } from '@tanstack/react-query'
import { counterNarrativeApi, type CounterNarrative } from '@/services/api'

export function useUpdateCounterNarrative() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      eventId,
      data,
    }: {
      eventId: string
      data: {
        narrativeText: string
        adminStrength: string
        concernStrength: string
        sourceRefs?: string
      }
    }) => counterNarrativeApi.update(eventId, data),
    onSuccess: (_, { eventId }) => {
      // Invalidate the event query to refresh the counter-narrative data
      queryClient.invalidateQueries({ queryKey: ['event', eventId] })
    },
  })
}

export function useDeleteCounterNarrative() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (eventId: string) => counterNarrativeApi.delete(eventId),
    onSuccess: (_, eventId) => {
      // Invalidate the event query to refresh the counter-narrative data
      queryClient.invalidateQueries({ queryKey: ['event', eventId] })
    },
  })
}
