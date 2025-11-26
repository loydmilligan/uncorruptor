import { z } from 'zod'

// Bias rating: -3 (far left) to 3 (far right)
export const biasRatingSchema = z.coerce
  .number()
  .int()
  .min(-3, 'Bias rating must be at least -3')
  .max(3, 'Bias rating must be at most 3')

export const createSourceSchema = z.object({
  url: z.string().url('Must be a valid URL').max(2048),
  articleTitle: z.string().max(500).optional(),
  biasRating: biasRatingSchema,
  publicationId: z.string().uuid().optional(),
  eventId: z.string().uuid().optional(),
  counterNarrativeId: z.string().uuid().optional(),
}).refine(
  (data) => {
    // Must have exactly one of eventId or counterNarrativeId
    const hasEventId = !!data.eventId;
    const hasCounterNarrativeId = !!data.counterNarrativeId;
    return hasEventId !== hasCounterNarrativeId; // XOR: one must be true, not both
  },
  {
    message: 'Must provide either eventId or counterNarrativeId, but not both',
  }
)

export const updateSourceSchema = z.object({
  url: z.string().url('Must be a valid URL').max(2048).optional(),
  articleTitle: z.string().max(500).optional(),
  biasRating: biasRatingSchema.optional(),
  isArchived: z.boolean().optional(),
})

// TypeScript types
export type CreateSourceInput = z.infer<typeof createSourceSchema>
export type UpdateSourceInput = z.infer<typeof updateSourceSchema>

// Response types
export interface SourceResponse {
  id: string
  eventId: string | null
  counterNarrativeId: string | null
  publicationId: string | null
  url: string
  articleTitle: string | null
  biasRating: number
  dateAccessed: string
  isArchived: boolean
  createdAt: string
  publication: PublicationResponse | null
}

export interface PublicationResponse {
  id: string
  name: string
  domain: string
  defaultBias: number
  credibility: string | null
}

// Bias rating labels
export const BIAS_LABELS: Record<number, string> = {
  '-3': 'Far Left',
  '-2': 'Left',
  '-1': 'Center-Left',
  '0': 'Center',
  '1': 'Center-Right',
  '2': 'Right',
  '3': 'Far Right',
}

export function getBiasLabel(rating: number): string {
  return BIAS_LABELS[rating] ?? 'Unknown'
}
