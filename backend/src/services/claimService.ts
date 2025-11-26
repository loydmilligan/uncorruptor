/**
 * Claim Service
 * Business logic for managing extracted claims
 */

import { PrismaClient, ClaimCategory } from '@prisma/client';
import type { CreateClaimInput, UpdateClaimInput, ClaimResponse, ClaimQueryParams } from '../models/claim.js';
import { NotFoundError } from '../lib/errors.js';

const prisma = new PrismaClient();

function transformClaim(claim: {
  id: string;
  sourceId: string;
  claimText: string;
  category: ClaimCategory;
  confidenceScore: any;
  extractedAt: Date;
}): ClaimResponse {
  return {
    id: claim.id,
    sourceId: claim.sourceId,
    claimText: claim.claimText,
    category: claim.category,
    confidenceScore: parseFloat(claim.confidenceScore.toString()),
    extractedAt: claim.extractedAt.toISOString(),
  };
}

export const claimService = {
  /**
   * Create a new claim
   */
  async create(input: CreateClaimInput): Promise<ClaimResponse> {
    // Verify source exists
    const source = await prisma.source.findUnique({
      where: { id: input.sourceId },
    });

    if (!source) {
      throw new NotFoundError('Source', input.sourceId);
    }

    const claim = await prisma.claim.create({
      data: {
        sourceId: input.sourceId,
        claimText: input.claimText,
        category: input.category,
        confidenceScore: input.confidenceScore,
      },
    });

    return transformClaim(claim);
  },

  /**
   * Create multiple claims in bulk
   */
  async createMany(sourceId: string, claims: Omit<CreateClaimInput, 'sourceId'>[]): Promise<ClaimResponse[]> {
    // Verify source exists
    const source = await prisma.source.findUnique({
      where: { id: sourceId },
    });

    if (!source) {
      throw new NotFoundError('Source', sourceId);
    }

    // Create all claims in a transaction
    const createdClaims = await prisma.$transaction(
      claims.map((claim) =>
        prisma.claim.create({
          data: {
            sourceId,
            claimText: claim.claimText,
            category: claim.category,
            confidenceScore: claim.confidenceScore,
          },
        })
      )
    );

    return createdClaims.map(transformClaim);
  },

  /**
   * Get claim by ID
   */
  async getById(id: string): Promise<ClaimResponse> {
    const claim = await prisma.claim.findUnique({
      where: { id },
    });

    if (!claim) {
      throw new NotFoundError('Claim', id);
    }

    return transformClaim(claim);
  },

  /**
   * List claims with filtering and pagination
   */
  async list(params: ClaimQueryParams): Promise<{
    data: ClaimResponse[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const {
      sourceId,
      category,
      minConfidence,
      page = 1,
      pageSize = 20,
    } = params;

    const skip = (page - 1) * pageSize;
    const take = Math.min(100, pageSize);

    // Build where clause
    const where: any = {};

    if (sourceId) {
      where.sourceId = sourceId;
    }

    if (category) {
      where.category = category;
    }

    if (minConfidence !== undefined) {
      where.confidenceScore = {
        gte: minConfidence,
      };
    }

    // Execute query with pagination
    const [claims, total] = await Promise.all([
      prisma.claim.findMany({
        where,
        skip,
        take,
        orderBy: [
          { confidenceScore: 'desc' },
          { extractedAt: 'desc' },
        ],
      }),
      prisma.claim.count({ where }),
    ]);

    return {
      data: claims.map(transformClaim),
      total,
      page,
      pageSize: take,
    };
  },

  /**
   * Update a claim
   */
  async update(id: string, input: UpdateClaimInput): Promise<ClaimResponse> {
    // Check if claim exists
    const existing = await prisma.claim.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError('Claim', id);
    }

    const claim = await prisma.claim.update({
      where: { id },
      data: input,
    });

    return transformClaim(claim);
  },

  /**
   * Delete a claim
   */
  async delete(id: string): Promise<void> {
    const claim = await prisma.claim.findUnique({
      where: { id },
    });

    if (!claim) {
      throw new NotFoundError('Claim', id);
    }

    await prisma.claim.delete({
      where: { id },
    });
  },

  /**
   * Delete all claims for a source
   */
  async deleteBySource(sourceId: string): Promise<number> {
    const result = await prisma.claim.deleteMany({
      where: { sourceId },
    });

    return result.count;
  },

  /**
   * Get claims by source ID
   */
  async getBySourceId(sourceId: string): Promise<ClaimResponse[]> {
    const claims = await prisma.claim.findMany({
      where: { sourceId },
      orderBy: [
        { confidenceScore: 'desc' },
        { extractedAt: 'desc' },
      ],
    });

    return claims.map(transformClaim);
  },

  /**
   * Get claim statistics for a source
   */
  async getSourceStats(sourceId: string): Promise<{
    total: number;
    byCategory: Record<ClaimCategory, number>;
    avgConfidence: number;
  }> {
    const claims = await prisma.claim.findMany({
      where: { sourceId },
      select: {
        category: true,
        confidenceScore: true,
      },
    });

    const byCategory: Record<ClaimCategory, number> = {
      FACTUAL_ASSERTION: 0,
      OPINION_ANALYSIS: 0,
      SPECULATION: 0,
    };

    let totalConfidence = 0;

    for (const claim of claims) {
      byCategory[claim.category]++;
      totalConfidence += parseFloat(claim.confidenceScore.toString());
    }

    return {
      total: claims.length,
      byCategory,
      avgConfidence: claims.length > 0 ? totalConfidence / claims.length : 0,
    };
  },
};
