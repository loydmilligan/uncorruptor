import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { publicationService } from '../services/publicationService.js'
import { publicationQuerySchema, lookupPublicationSchema } from '../models/publication.js'
import { sendSuccess } from '../lib/response.js'
import { handleError, ValidationError } from '../lib/errors.js'
import { ZodError } from 'zod'

export async function publicationRoutes(fastify: FastifyInstance) {
  // GET /api/publications - List all publications
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const query = publicationQuerySchema.parse(request.query)
      const publications = await publicationService.list(query)
      sendSuccess(reply, publications)
    } catch (error) {
      if (error instanceof ZodError) {
        handleError(new ValidationError('Invalid query parameters', formatZodErrors(error)), reply)
        return
      }
      handleError(error, reply)
    }
  })

  // GET /api/publications/lookup - Lookup publication by domain
  fastify.get('/lookup', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { domain } = lookupPublicationSchema.parse(request.query)
      const publication = await publicationService.lookupByDomain(domain)
      sendSuccess(reply, publication)
    } catch (error) {
      if (error instanceof ZodError) {
        handleError(new ValidationError('Invalid query parameters', formatZodErrors(error)), reply)
        return
      }
      handleError(error, reply)
    }
  })

  // GET /api/publications/:id - Get publication by ID
  fastify.get('/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const publication = await publicationService.getById(request.params.id)
      sendSuccess(reply, publication)
    } catch (error) {
      handleError(error, reply)
    }
  })
}

function formatZodErrors(error: ZodError): Record<string, string[]> {
  const formatted: Record<string, string[]> = {}
  for (const issue of error.issues) {
    const path = issue.path.join('.')
    if (!formatted[path]) {
      formatted[path] = []
    }
    formatted[path].push(issue.message)
  }
  return formatted
}
