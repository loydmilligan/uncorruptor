import { AdminPeriod } from '@prisma/client'
import { z } from 'zod'

// Zod schemas for validation
export const createEventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500, 'Title must be 500 characters or less'),
  description: z.string().optional(),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format',
  }),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format',
  }).optional(),
  tagIds: z.array(z.string().uuid()).default([]),
  primaryTagId: z.string().uuid().optional(),
})

export const updateEventSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().optional(),
  startDate: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: 'Invalid date format',
    })
    .optional(),
  endDate: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: 'Invalid date format',
    })
    .nullable()
    .optional(),
  tagIds: z.array(z.string().uuid()).optional(),
  primaryTagId: z.string().uuid().nullable().optional(),
})

export const eventQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  tags: z.string().optional(), // comma-separated tag IDs
  adminPeriod: z.enum(['TRUMP_1', 'TRUMP_2', 'OTHER']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  sortBy: z.enum(['startDate', 'createdAt', 'title']).default('startDate'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

// TypeScript types
export type CreateEventInput = z.infer<typeof createEventSchema>
export type UpdateEventInput = z.infer<typeof updateEventSchema>
export type EventQueryParams = z.infer<typeof eventQuerySchema>

// Response types
export interface TagWithPrimary {
  id: string
  name: string
  description: string | null
  color: string
  isDefault: boolean
  isPrimary: boolean
}

export interface EventResponse {
  id: string
  title: string
  description: string | null
  startDate: string
  endDate: string | null
  adminPeriod: AdminPeriod
  createdAt: string
  updatedAt: string
  tags: TagWithPrimary[]
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
