import { useQuery } from '@tanstack/react-query'
import { publicationsApi, type Publication } from '@/services/api'

export function usePublications(search?: string) {
  return useQuery({
    queryKey: ['publications', search],
    queryFn: () => publicationsApi.list(),
  })
}

export function usePublicationLookup(domain: string | undefined) {
  return useQuery({
    queryKey: ['publications', 'lookup', domain],
    queryFn: () => publicationsApi.lookup(domain!),
    enabled: !!domain,
  })
}

/**
 * Extract domain from URL for publication lookup.
 */
export function extractDomain(url: string): string | null {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname.replace(/^www\./, '')
  } catch {
    return null
  }
}
