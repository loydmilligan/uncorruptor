import { FastifyInstance } from 'fastify'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'

export async function swagger(fastify: FastifyInstance): Promise<void> {
  await fastify.register(fastifySwagger, {
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'Administration Accountability Tracker API',
        description:
          'API for tracking political accountability events with multi-category tagging, bias-rated sources, and counter-narratives.',
        version: '0.1.0',
      },
      servers: [
        {
          url: 'http://localhost:3000',
          description: 'Local development server',
        },
      ],
      tags: [
        { name: 'events', description: 'Event management operations' },
        { name: 'tags', description: 'Tag management operations' },
        { name: 'sources', description: 'Source management operations' },
        { name: 'publications', description: 'Publication lookup operations' },
        { name: 'counter-narratives', description: 'Counter-narrative management' },
        { name: 'dashboard', description: 'Dashboard and analytics' },
      ],
      components: {
        schemas: {
          AdminPeriod: {
            type: 'string',
            enum: ['TRUMP_1', 'TRUMP_2', 'OTHER'],
            description: 'Administration period classification',
          },
          BiasRating: {
            type: 'integer',
            minimum: -3,
            maximum: 3,
            description: 'Political bias rating (-3: Far Left to 3: Far Right)',
          },
          StrengthRating: {
            type: 'string',
            enum: ['weak', 'moderate', 'strong'],
            description: 'Argument strength rating',
          },
          Event: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              title: { type: 'string', maxLength: 500 },
              description: { type: 'string', nullable: true },
              eventDate: { type: 'string', format: 'date' },
              adminPeriod: { $ref: '#/components/schemas/AdminPeriod' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              tags: {
                type: 'array',
                items: { $ref: '#/components/schemas/Tag' },
              },
              sources: {
                type: 'array',
                items: { $ref: '#/components/schemas/Source' },
              },
              counterNarrative: {
                $ref: '#/components/schemas/CounterNarrative',
                nullable: true,
              },
            },
          },
          Tag: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string', maxLength: 100 },
              description: { type: 'string', nullable: true, maxLength: 500 },
              color: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' },
              isDefault: { type: 'boolean' },
              createdAt: { type: 'string', format: 'date-time' },
            },
          },
          Source: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              eventId: { type: 'string', format: 'uuid' },
              publicationId: { type: 'string', format: 'uuid', nullable: true },
              url: { type: 'string', format: 'uri', maxLength: 2048 },
              articleTitle: { type: 'string', nullable: true, maxLength: 500 },
              biasRating: { $ref: '#/components/schemas/BiasRating' },
              dateAccessed: { type: 'string', format: 'date' },
              isArchived: { type: 'boolean' },
              createdAt: { type: 'string', format: 'date-time' },
              publication: {
                $ref: '#/components/schemas/Publication',
                nullable: true,
              },
            },
          },
          Publication: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string', maxLength: 200 },
              domain: { type: 'string', maxLength: 253 },
              defaultBias: { $ref: '#/components/schemas/BiasRating' },
              credibility: {
                type: 'string',
                enum: ['high', 'mixed', 'low'],
                nullable: true,
              },
            },
          },
          CounterNarrative: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              eventId: { type: 'string', format: 'uuid' },
              narrativeText: { type: 'string' },
              adminStrength: { $ref: '#/components/schemas/StrengthRating' },
              concernStrength: { $ref: '#/components/schemas/StrengthRating' },
              sourceRefs: { type: 'string', nullable: true },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
          Pagination: {
            type: 'object',
            properties: {
              page: { type: 'integer', minimum: 1 },
              pageSize: { type: 'integer', minimum: 1, maximum: 100 },
              total: { type: 'integer', minimum: 0 },
              totalPages: { type: 'integer', minimum: 0 },
            },
          },
          ErrorResponse: {
            type: 'object',
            properties: {
              success: { type: 'boolean', const: false },
              error: {
                type: 'object',
                properties: {
                  code: { type: 'string' },
                  message: { type: 'string' },
                  details: {
                    type: 'object',
                    additionalProperties: {
                      type: 'array',
                      items: { type: 'string' },
                    },
                  },
                },
                required: ['code', 'message'],
              },
            },
            required: ['success', 'error'],
          },
        },
      },
    },
  })

  await fastify.register(fastifySwaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
    },
    staticCSP: true,
  })
}
