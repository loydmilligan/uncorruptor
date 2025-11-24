import { z } from 'zod'

export const publicationQuerySchema = z.object({
  search: z.string().optional(),
  bias: z.coerce.number().int().min(-3).max(3).optional(),
  credibility: z.enum(['high', 'mixed', 'low']).optional(),
})

export const lookupPublicationSchema = z.object({
  domain: z.string().min(1, 'Domain is required'),
})

// TypeScript types
export type PublicationQueryParams = z.infer<typeof publicationQuerySchema>
export type LookupPublicationParams = z.infer<typeof lookupPublicationSchema>

// Response type
export interface PublicationResponse {
  id: string
  name: string
  domain: string
  defaultBias: number
  credibility: string | null
}

/**
 * Extract domain from URL for publication lookup.
 */
export function extractDomain(url: string): string | null {
  try {
    const urlObj = new URL(url)
    // Remove 'www.' prefix if present
    return urlObj.hostname.replace(/^www\./, '')
  } catch {
    return null
  }
}
