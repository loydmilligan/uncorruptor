/**
 * Claim Model
 * Represents extracted verifiable claims from article sources
 */

import { z } from 'zod';
import { ClaimCategory } from '@prisma/client';

// Zod schemas for validation
export const claimSchema = z.object({
  claimText: z.string().min(1, 'Claim text is required').max(2000, 'Claim text must be 2000 characters or less'),
  category: z.nativeEnum(ClaimCategory, {
    errorMap: () => ({
      message: 'Category must be FACTUAL_ASSERTION, OPINION_ANALYSIS, or SPECULATION',
    }),
  }),
  confidenceScore: z
    .number()
    .min(0, 'Confidence score must be between 0 and 1')
    .max(1, 'Confidence score must be between 0 and 1'),
});

export const createClaimSchema = z.object({
  sourceId: z.string().uuid('Invalid source ID'),
  claimText: z.string().min(1).max(2000),
  category: z.nativeEnum(ClaimCategory),
  confidenceScore: z.number().min(0).max(1),
});

export const updateClaimSchema = z.object({
  claimText: z.string().min(1).max(2000).optional(),
  category: z.nativeEnum(ClaimCategory).optional(),
  confidenceScore: z.number().min(0).max(1).optional(),
});

// TypeScript types
export type ClaimInput = z.infer<typeof claimSchema>;
export type CreateClaimInput = z.infer<typeof createClaimSchema>;
export type UpdateClaimInput = z.infer<typeof updateClaimSchema>;

// Response type
export interface ClaimResponse {
  id: string;
  sourceId: string;
  claimText: string;
  category: ClaimCategory;
  confidenceScore: number;
  extractedAt: string;
}

// List query parameters
export interface ClaimQueryParams {
  sourceId?: string;
  category?: ClaimCategory;
  minConfidence?: number;
  page?: number;
  pageSize?: number;
}
