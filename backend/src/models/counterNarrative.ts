import { StrengthRating } from '@prisma/client'
import { z } from 'zod'

// Zod schemas for validation
export const counterNarrativeSchema = z.object({
  narrativeText: z.string().min(1, 'Narrative text is required').max(10000, 'Narrative text must be 10000 characters or less'),
  adminStrength: z.enum(['weak', 'moderate', 'strong'], {
    errorMap: () => ({ message: 'Admin strength must be weak, moderate, or strong' }),
  }),
  concernStrength: z.enum(['weak', 'moderate', 'strong'], {
    errorMap: () => ({ message: 'Concern strength must be weak, moderate, or strong' }),
  }),
  sourceRefs: z.string().max(5000).optional(),
})

// TypeScript types
export type CounterNarrativeInput = z.infer<typeof counterNarrativeSchema>

// Response type
export interface CounterNarrativeResponse {
  id: string
  eventId: string
  narrativeText: string
  adminStrength: StrengthRating
  concernStrength: StrengthRating
  sourceRefs: string | null
  createdAt: string
  updatedAt: string
}
