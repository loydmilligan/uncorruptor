import { AdminPeriod } from '@prisma/client'
import { z } from 'zod'

// Zod schemas for validation
export const createEventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500, 'Title must be 500 characters or less'),
  description: z.string().optional(),
  eventDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format',
  }),
  tagIds: z.array(z.string().uuid()).default([]),
})

export const updateEventSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().optional(),
  eventDate: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: 'Invalid date format',
    })
    .optional(),
  tagIds: z.array(z.string().uuid()).optional(),
})

export const eventQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  tags: z.string().optional(), // comma-separated tag IDs
  adminPeriod: z.enum(['TRUMP_1', 'TRUMP_2', 'OTHER']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  sortBy: z.enum(['eventDate', 'createdAt', 'title']).default('eventDate'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

// TypeScript types
export type CreateEventInput = z.infer<typeof createEventSchema>
export type UpdateEventInput = z.infer<typeof updateEventSchema>
export type EventQueryParams = z.infer<typeof eventQuerySchema>

// Response types
export interface EventResponse {
  id: string
  title: string
  description: string | null
  eventDate: string
  adminPeriod: AdminPeriod
  createdAt: string
  updatedAt: string
  tags: TagResponse[]
  _count?: {
    sources: number
  }
}

export interface TagResponse {
  id: string
  name: string
  description: string | null
  color: string
  isDefault: boolean
}

export interface EventWithDetails extends EventResponse {
  sources: Array<{
    id: string
    url: string
    articleTitle: string | null
    biasRating: number
    isArchived: boolean
  }>
  counterNarrative: {
    id: string
    narrativeText: string
    adminStrength: string
    concernStrength: string
  } | null
}
