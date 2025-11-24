import { z } from 'zod'

// Hex color regex pattern
const hexColorRegex = /^#[0-9A-Fa-f]{6}$/

// Zod schemas for validation
export const createTagSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less')
    .regex(/^[a-z0-9-]+$/, 'Name must be lowercase alphanumeric with hyphens only')
    .transform((val) => val.toLowerCase()),
  description: z.string().max(500).optional(),
  color: z
    .string()
    .regex(hexColorRegex, 'Color must be a valid hex color (#RRGGBB)')
    .default('#6B7280'),
})

export const updateTagSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Name must be lowercase alphanumeric with hyphens only')
    .transform((val) => val.toLowerCase())
    .optional(),
  description: z.string().max(500).optional(),
  color: z.string().regex(hexColorRegex, 'Color must be a valid hex color (#RRGGBB)').optional(),
})

// TypeScript types
export type CreateTagInput = z.infer<typeof createTagSchema>
export type UpdateTagInput = z.infer<typeof updateTagSchema>

// Response type
export interface TagResponse {
  id: string
  name: string
  description: string | null
  color: string
  isDefault: boolean
  createdAt: string
}

export interface TagWithCount extends TagResponse {
  _count: {
    events: number
  }
}
