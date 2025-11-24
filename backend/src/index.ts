import Fastify from 'fastify'
import cors from '@fastify/cors'
import { swagger } from './plugins/swagger.js'
import { eventRoutes } from './api/events.js'
import { tagRoutes } from './api/tags.js'
import { sourceRoutes } from './api/sources.js'
import { publicationRoutes } from './api/publications.js'
import { counterNarrativeRoutes } from './api/counterNarrative.js'

const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport:
      process.env.NODE_ENV === 'development'
        ? {
            target: 'pino-pretty',
            options: {
              translateTime: 'HH:MM:ss Z',
              ignore: 'pid,hostname',
            },
          }
        : undefined,
  },
})

async function main() {
  // Register CORS - Allow extension and local network access
  await fastify.register(cors, {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, etc)
      if (!origin) {
        callback(null, true)
        return
      }

      // Allow chrome-extension:// origins (for browser extension)
      if (origin.startsWith('chrome-extension://')) {
        callback(null, true)
        return
      }

      // Allow localhost in any form
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        callback(null, true)
        return
      }

      // Allow local network (192.168.x.x and 10.x.x.x)
      if (origin.match(/^https?:\/\/(192\.168\.|10\.)/)) {
        callback(null, true)
        return
      }

      // Allow specific CORS_ORIGIN if set
      if (process.env.CORS_ORIGIN && origin === process.env.CORS_ORIGIN) {
        callback(null, true)
        return
      }

      // Reject all other origins
      callback(new Error('Not allowed by CORS'), false)
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  })

  // Register Swagger
  await fastify.register(swagger)

  // Health check endpoint
  fastify.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() }
  })

  // API routes
  await fastify.register(eventRoutes, { prefix: '/api/events' })
  await fastify.register(tagRoutes, { prefix: '/api/tags' })
  await fastify.register(sourceRoutes, { prefix: '/api/events' }) // Sources are nested under events
  await fastify.register(publicationRoutes, { prefix: '/api/publications' })
  await fastify.register(counterNarrativeRoutes, { prefix: '/api/events' }) // Counter-narratives are nested under events
  // Future routes:
  // await fastify.register(dashboardRoutes, { prefix: '/api/dashboard' })

  // Start server
  const port = parseInt(process.env.PORT || '3000', 10)
  const host = process.env.HOST || '0.0.0.0'

  try {
    await fastify.listen({ port, host })
    console.log(`Server running at http://${host}:${port}`)
    console.log(`Swagger docs at http://${host}:${port}/docs`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

main()
