/**
 * Dashboard API Routes
 * Endpoints for dashboard visualizations and statistics
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { dashboardService } from '../services/dashboardService.js'
import { sendSuccess } from '../lib/response.js'
import { handleError, BadRequestError } from '../lib/errors.js'

export async function dashboardRoutes(fastify: FastifyInstance) {
  /**
   * GET /api/dashboard/summary
   * Get summary statistics for dashboard
   */
  fastify.get('/summary', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const summary = await dashboardService.getSummary()
      sendSuccess(reply, summary)
    } catch (error: any) {
      fastify.log.error(error)
      handleError(error, reply)
    }
  })

  /**
   * GET /api/dashboard/events-by-tag
   * Get event distribution by tag
   */
  fastify.get('/events-by-tag', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = await dashboardService.getEventsByTag()
      sendSuccess(reply, data)
    } catch (error: any) {
      fastify.log.error(error)
      handleError(error, reply)
    }
  })

  /**
   * GET /api/dashboard/timeline
   * Get timeline of events by month
   * Query params:
   *   - startDate: ISO date string (optional)
   *   - endDate: ISO date string (optional)
   */
  fastify.get<{
    Querystring: {
      startDate?: string
      endDate?: string
    }
  }>('/timeline', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { startDate, endDate } = request.query as { startDate?: string; endDate?: string }

      const startDateObj = startDate ? new Date(startDate) : undefined
      const endDateObj = endDate ? new Date(endDate) : undefined

      // Validate dates
      if (startDateObj && isNaN(startDateObj.getTime())) {
        throw new BadRequestError('Invalid startDate format')
      }
      if (endDateObj && isNaN(endDateObj.getTime())) {
        throw new BadRequestError('Invalid endDate format')
      }

      const timeline = await dashboardService.getTimeline(startDateObj, endDateObj)
      sendSuccess(reply, timeline)
    } catch (error: any) {
      fastify.log.error(error)
      handleError(error, reply)
    }
  })

  /**
   * GET /api/dashboard/comparison
   * Compare events across Trump administrations
   */
  fastify.get('/comparison', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const comparison = await dashboardService.getAdminComparison()
      sendSuccess(reply, comparison)
    } catch (error: any) {
      fastify.log.error(error)
      handleError(error, reply)
    }
  })
}
