import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tagsApi, type Tag, type ApiResponse } from '@/services/api'

export function useTags() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: () => tagsApi.list(),
  })
}

export function useCreateTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { name: string; description?: string; color?: string }) =>
      tagsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] })
    },
  })
}

export function useDeleteTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => tagsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}
