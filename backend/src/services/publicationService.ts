import { PrismaClient, Prisma } from '@prisma/client'
import type { PublicationQueryParams } from '../models/publication.js'
import { extractDomain } from '../models/publication.js'

const prisma = new PrismaClient()

function transformPublication(publication: Prisma.PublicationGetPayload<object>) {
  return {
    id: publication.id,
    name: publication.name,
    domain: publication.domain,
    defaultBias: publication.defaultBias,
    credibility: publication.credibility,
  }
}

export const publicationService = {
  async list(params: PublicationQueryParams = {}) {
    const { search, bias, credibility } = params

    const where: Prisma.PublicationWhereInput = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { domain: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (bias !== undefined) {
      where.defaultBias = bias
    }

    if (credibility) {
      where.credibility = credibility
    }

    const publications = await prisma.publication.findMany({
      where,
      orderBy: [{ name: 'asc' }],
    })

    return publications.map(transformPublication)
  },

  async lookupByDomain(domain: string) {
    // Normalize domain (remove www. prefix)
    const normalizedDomain = domain.toLowerCase().replace(/^www\./, '')

    const publication = await prisma.publication.findFirst({
      where: {
        OR: [
          { domain: normalizedDomain },
          { domain: `www.${normalizedDomain}` },
        ],
      },
    })

    return publication ? transformPublication(publication) : null
  },

  async lookupByUrl(url: string) {
    const domain = extractDomain(url)
    if (!domain) {
      return null
    }
    return this.lookupByDomain(domain)
  },

  async getById(id: string) {
    const publication = await prisma.publication.findUnique({
      where: { id },
    })

    return publication ? transformPublication(publication) : null
  },
}
