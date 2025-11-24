import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { eventsApi, type Event, type PaginatedResponse, type ApiResponse } from '@/services/api'

export interface EventFilters {
  page?: number
  pageSize?: number
  search?: string
  tags?: string
  adminPeriod?: string
  startDate?: string
  endDate?: string
}

export function useEvents(filters: EventFilters = {}) {
  return useQuery({
    queryKey: ['events', filters],
    queryFn: () => eventsApi.list(filters),
  })
}

export function useEvent(id: string | undefined) {
  return useQuery({
    queryKey: ['events', id],
    queryFn: () => eventsApi.get(id!),
    enabled: !!id,
  })
}

export function useCreateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { title: string; description?: string; eventDate: string; tagIds: string[] }) =>
      eventsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

export function useUpdateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<{ title: string; description?: string; eventDate: string; tagIds: string[] }> }) =>
      eventsApi.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['events', variables.id] })
    },
  })
}

export function useDeleteEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => eventsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}
