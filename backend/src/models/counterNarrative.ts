import { z } from 'zod'

// Zod schemas for validation
export const counterNarrativeSchema = z.object({
  narrative: z.string().min(1, 'Narrative text is required').max(10000, 'Narrative text must be 10000 characters or less'),
  adminPosition: z.string().max(1000).optional(),
})

// TypeScript types
export type CounterNarrativeInput = z.infer<typeof counterNarrativeSchema>

// Response type
export interface CounterNarrativeResponse {
  id: string
  eventId: string
  narrative: string
  adminPosition: string | null
  createdAt: string
  updatedAt: string
}
