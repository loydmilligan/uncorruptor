import { z } from 'zod'

// Source schema for bulk import
const bulkSourceSchema = z.object({
  url: z.string().url(),
  articleTitle: z.string().optional(),
  biasRating: z.number().int().min(-3).max(3),
  dateAccessed: z.string().optional(),
  publicationOverride: z.string().optional(),
  metadata: z.record(z.any()).optional(),
})

// Counter-narrative schema for bulk import
const bulkCounterNarrativeSchema = z.object({
  narrativeText: z.string().min(1),
  adminStrength: z.enum(['weak', 'moderate', 'strong']),
  concernStrength: z.enum(['weak', 'moderate', 'strong']),
  sourceRefs: z.string().optional(),
})

// Analysis schemas (future-proofing)
const divergenceAnalysisSchema = z.object({
  score: z.number().min(0).max(10).optional(),
  historicalComparison: z.record(z.any()).optional(),
  electoralPolitics: z.record(z.any()).optional(),
}).optional()

const corruptionAnalysisSchema = z.object({
  slipperySlope: z.record(z.any()).optional(),
  financialImpact: z.record(z.any()).optional(),
}).optional()

const constitutionalAnalysisSchema = z.object({
  clausesAffected: z.array(z.string()).optional(),
  legalChallenges: z.array(z.any()).optional(),
  constitutionalScholarsOpinions: z.array(z.any()).optional(),
}).optional()

const analysisSchema = z.object({
  divergence: divergenceAnalysisSchema,
  corruption: corruptionAnalysisSchema,
  constitutional: constitutionalAnalysisSchema,
  // Allow any additional analysis fields
}).passthrough().optional()

// Relationships schema (future-proofing)
const relationshipsSchema = z.object({
  relatedEvents: z.array(z.record(z.any())).optional(),
  involvedPersons: z.array(z.record(z.any())).optional(),
  involvedOrganizations: z.array(z.record(z.any())).optional(),
}).optional()

// Event schema for bulk import
const bulkEventSchema = z.object({
  // Required fields
  title: z.string().min(1).max(500),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format',
  }),

  // Optional core fields
  endDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format',
  }).optional(),
  description: z.string().optional(),

  // Tags
  tags: z.array(z.string()).default([]),
  primaryTag: z.string().optional(),

  // Sources
  sources: z.array(bulkSourceSchema).default([]),

  // Counter-narrative
  counterNarrative: bulkCounterNarrativeSchema.optional(),

  // Analysis (stored as JSONB for future use)
  analysis: analysisSchema,

  // Relationships (stored as JSONB for future use)
  relationships: relationshipsSchema,

  // Timeline events (future feature)
  timelineEvents: z.array(z.record(z.any())).optional(),

  // Flexible metadata
  metadata: z.record(z.any()).optional(),
})

// Main bulk import schema
export const bulkImportSchema = z.object({
  version: z.string().default('1.0'),
  metadata: z.object({
    generatedBy: z.string().optional(),
    generatedAt: z.string().optional(),
    description: z.string().optional(),
  }).optional(),
  events: z.array(bulkEventSchema),
})

// TypeScript types
export type BulkImportData = z.infer<typeof bulkImportSchema>
export type BulkEventData = z.infer<typeof bulkEventSchema>
export type BulkSourceData = z.infer<typeof bulkSourceSchema>

// Result types
export interface BulkImportResult {
  success: boolean
  totalEvents: number
  successCount: number
  failureCount: number
  skippedCount: number
  results: EventImportResult[]
}

export interface EventImportResult {
  eventTitle: string
  status: 'success' | 'failure' | 'skipped'
  eventId?: string
  error?: string
  details?: string
}
