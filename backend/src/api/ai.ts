/**
 * AI API Routes
 * Endpoints for AI-powered features (tag suggestions, claim extraction)
 */

import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { suggestTags } from '../services/tagSuggestion.js';
import { extractClaims } from '../services/claimExtraction.js';
import { sendSuccess } from '../lib/response.js';
import { handleError } from '../lib/errors.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Request validation schemas
const suggestTagsSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().max(5000).optional(),
  apiKey: z.string().min(1),
  model: z.string().min(1),
});

const extractClaimsSchema = z.object({
  url: z.string().url(),
  articleTitle: z.string().max(500).optional(),
  apiKey: z.string().min(1),
  model: z.string().min(1),
  includeDomainContext: z.boolean().optional(),
});

/**
 * Register AI routes
 */
export async function aiRoutes(fastify: FastifyInstance) {
  /**
   * POST /api/ai/suggest-tags
   * Get AI-powered tag suggestions for an event
   */
  fastify.post('/ai/suggest-tags', async (request, reply) => {
    try {
      // Validate request body
      const body = suggestTagsSchema.parse(request.body);

      // Get existing tags from database
      const tagsData = await prisma.tag.findMany({
        select: { name: true },
      });
      const existingTags = tagsData.map((t) => t.name);

      // Generate suggestions
      const suggestions = await suggestTags({
        title: body.title,
        description: body.description,
        existingTags,
        apiKey: body.apiKey,
        model: body.model,
      });

      return sendSuccess(reply, { suggestions });
    } catch (error) {
      return handleError(error, reply);
    }
  });

  /**
   * POST /api/ai/extract-claims
   * Extract and categorize claims from article URL
   */
  fastify.post('/ai/extract-claims', async (request, reply) => {
    try {
      // Validate request body
      const body = extractClaimsSchema.parse(request.body);

      // Optional: Fetch domain context if requested
      let domainContext;
      if (body.includeDomainContext) {
        const { extractDomainFromUrl } = await import('../lib/urlParser.js');
        const normalizedDomain = extractDomainFromUrl(body.url);

        if (normalizedDomain) {
          const domain = await prisma.domain.findUnique({
            where: { normalizedDomain },
          });

          if (domain) {
            domainContext = {
              normalizedDomain: domain.normalizedDomain,
              avgBiasRating: domain.avgBiasRating ? parseFloat(domain.avgBiasRating.toString()) : undefined,
              totalSources: domain.totalSources,
            };
          }
        }
      }

      // Extract claims from article
      const result = await extractClaims({
        url: body.url,
        articleTitle: body.articleTitle,
        domainContext,
        apiKey: body.apiKey,
        model: body.model,
      });

      return sendSuccess(reply, result);
    } catch (error) {
      return handleError(error, reply);
    }
  });
}
