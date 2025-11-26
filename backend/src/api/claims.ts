/**
 * Claims API Routes
 * CRUD operations for extracted claims
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { claimService } from '../services/claimService.js';
import { createClaimSchema, updateClaimSchema } from '../models/claim.js';
import { sendSuccess, sendCreated, sendNoContent, sendPaginated } from '../lib/response.js';
import { handleError, ValidationError } from '../lib/errors.js';
import { ZodError } from 'zod';
import { ClaimCategory } from '@prisma/client';

function formatZodErrors(error: ZodError): Record<string, string[]> {
  const formatted: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const path = issue.path.join('.');
    if (!formatted[path]) {
      formatted[path] = [];
    }
    formatted[path].push(issue.message);
  }
  return formatted;
}

export async function claimRoutes(fastify: FastifyInstance) {
  /**
   * GET /api/claims - List claims with filtering
   */
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const query = request.query as any;

      // Parse query parameters
      const params = {
        sourceId: query.sourceId,
        category: query.category as ClaimCategory | undefined,
        minConfidence: query.minConfidence ? parseFloat(query.minConfidence) : undefined,
        page: query.page ? parseInt(query.page) : 1,
        pageSize: query.pageSize ? parseInt(query.pageSize) : 20,
      };

      const result = await claimService.list(params);
      sendPaginated(reply, result.data, result.page, result.pageSize, result.total);
    } catch (error) {
      handleError(error, reply);
    }
  });

  /**
   * GET /api/claims/:id - Get single claim
   */
  fastify.get('/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const claim = await claimService.getById(request.params.id);
      sendSuccess(reply, claim);
    } catch (error) {
      handleError(error, reply);
    }
  });

  /**
   * POST /api/claims - Create a new claim
   */
  fastify.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const input = createClaimSchema.parse(request.body);
      const claim = await claimService.create(input);
      sendCreated(reply, claim);
    } catch (error) {
      if (error instanceof ZodError) {
        handleError(new ValidationError('Invalid claim data', formatZodErrors(error)), reply);
        return;
      }
      handleError(error, reply);
    }
  });

  /**
   * POST /api/claims/bulk - Create multiple claims for a source
   */
  fastify.post('/bulk', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = request.body as any;

      if (!body.sourceId || !Array.isArray(body.claims)) {
        throw new ValidationError('Invalid request', {
          sourceId: body.sourceId ? [] : ['Source ID is required'],
          claims: Array.isArray(body.claims) ? [] : ['Claims must be an array'],
        });
      }

      // Validate each claim
      const validatedClaims = body.claims.map((claim: any) => {
        const validated = createClaimSchema.omit({ sourceId: true }).parse(claim);
        return validated;
      });

      const claims = await claimService.createMany(body.sourceId, validatedClaims);
      sendCreated(reply, { claims, count: claims.length });
    } catch (error) {
      if (error instanceof ZodError) {
        handleError(new ValidationError('Invalid claim data', formatZodErrors(error)), reply);
        return;
      }
      handleError(error, reply);
    }
  });

  /**
   * PATCH /api/claims/:id - Update a claim
   */
  fastify.patch('/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const input = updateClaimSchema.parse(request.body);
      const claim = await claimService.update(request.params.id, input);
      sendSuccess(reply, claim);
    } catch (error) {
      if (error instanceof ZodError) {
        handleError(new ValidationError('Invalid claim data', formatZodErrors(error)), reply);
        return;
      }
      handleError(error, reply);
    }
  });

  /**
   * DELETE /api/claims/:id - Delete a claim
   */
  fastify.delete('/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      await claimService.delete(request.params.id);
      sendNoContent(reply);
    } catch (error) {
      handleError(error, reply);
    }
  });

  /**
   * GET /api/claims/source/:sourceId/stats - Get claim statistics for a source
   */
  fastify.get('/source/:sourceId/stats', async (request: FastifyRequest<{ Params: { sourceId: string } }>, reply: FastifyReply) => {
    try {
      const stats = await claimService.getSourceStats(request.params.sourceId);
      sendSuccess(reply, stats);
    } catch (error) {
      handleError(error, reply);
    }
  });
}
