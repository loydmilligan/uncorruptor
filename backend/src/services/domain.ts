/**
 * Domain Intelligence Service
 * Real-time aggregation and bias rating suggestions based on historical domain data
 */

import { PrismaClient, Prisma } from '@prisma/client';
import { extractDomainFromUrl, normalizeDomain } from '../lib/urlParser.js';

const prisma = new PrismaClient();

/**
 * Domain statistics for a specific domain
 */
export interface DomainStats {
  normalizedDomain: string;
  totalSources: number;
  avgBiasRating: number | null;
  usageFrequency: number;
  firstSeen: Date;
  lastUsed: Date;
}

/**
 * Bias rating suggestion with confidence
 */
export interface BiasSuggestion {
  suggestedBias: number | null;
  confidence: number;
  domainStats: DomainStats | null;
}

/**
 * Domain Intelligence Service
 * Tracks source domains and provides bias rating suggestions
 */
export class DomainIntelligenceService {
  /**
   * Record a source addition for domain tracking
   * Updates domain statistics (total sources, avg bias, usage frequency)
   *
   * Call this after successfully adding a source to an event or counter-narrative
   */
  async recordSourceAddition(url: string, biasRating: number): Promise<void> {
    try {
      const normalizedDomain = extractDomainFromUrl(url);

      // Upsert domain record with aggregated statistics
      await prisma.$transaction(async (tx) => {
        // Check if domain exists
        const existingDomain = await tx.domain.findUnique({
          where: { normalizedDomain },
        });

        if (existingDomain) {
          // Domain exists - update statistics
          // Get current source count and average for this domain
          const sourceStats = await tx.source.aggregate({
            where: {
              url: {
                contains: normalizedDomain,
              },
            },
            _count: true,
            _avg: {
              biasRating: true,
            },
          });

          await tx.domain.update({
            where: { normalizedDomain },
            data: {
              totalSources: sourceStats._count,
              avgBiasRating: sourceStats._avg.biasRating
                ? new Prisma.Decimal(sourceStats._avg.biasRating.toFixed(2))
                : null,
              usageFrequency: {
                increment: 1,
              },
              lastUsed: new Date(),
            },
          });
        } else {
          // New domain - create record
          await tx.domain.create({
            data: {
              normalizedDomain,
              totalSources: 1,
              avgBiasRating: new Prisma.Decimal(biasRating.toFixed(2)),
              usageFrequency: 1,
              firstSeen: new Date(),
              lastUsed: new Date(),
            },
          });
        }
      });
    } catch (error) {
      console.error('[DomainService] Failed to record source addition:', error);
      // Don't throw - this is a background tracking operation
      // Failure shouldn't block source creation
    }
  }

  /**
   * Get statistics for a specific domain
   */
  async getDomainStats(domain: string): Promise<DomainStats | null> {
    try {
      const normalizedDomain = normalizeDomain(domain);

      const domainRecord = await prisma.domain.findUnique({
        where: { normalizedDomain },
      });

      if (!domainRecord) {
        return null;
      }

      return {
        normalizedDomain: domainRecord.normalizedDomain,
        totalSources: domainRecord.totalSources,
        avgBiasRating: domainRecord.avgBiasRating
          ? parseFloat(domainRecord.avgBiasRating.toString())
          : null,
        usageFrequency: domainRecord.usageFrequency,
        firstSeen: domainRecord.firstSeen,
        lastUsed: domainRecord.lastUsed,
      };
    } catch (error) {
      console.error('[DomainService] Failed to get domain stats:', error);
      return null;
    }
  }

  /**
   * Get statistics for a domain extracted from a URL
   */
  async getDomainStatsFromUrl(url: string): Promise<DomainStats | null> {
    try {
      const normalizedDomain = extractDomainFromUrl(url);
      return this.getDomainStats(normalizedDomain);
    } catch (error) {
      console.error('[DomainService] Failed to get domain stats from URL:', error);
      return null;
    }
  }

  /**
   * Suggest bias rating for a URL based on historical data
   * Returns null if domain is unknown
   *
   * Confidence calculation:
   * - 0-2 sources: 0.3 (low confidence)
   * - 3-5 sources: 0.6 (medium confidence)
   * - 6-10 sources: 0.8 (high confidence)
   * - 10+ sources: 0.95 (very high confidence)
   */
  async suggestBiasRating(url: string): Promise<BiasSuggestion> {
    try {
      const domainStats = await this.getDomainStatsFromUrl(url);

      if (!domainStats || domainStats.avgBiasRating === null) {
        return {
          suggestedBias: null,
          confidence: 0.0,
          domainStats: null,
        };
      }

      // Calculate confidence based on sample size
      let confidence = 0.3; // Default low confidence
      const sourceCount = domainStats.totalSources;

      if (sourceCount >= 10) {
        confidence = 0.95;
      } else if (sourceCount >= 6) {
        confidence = 0.8;
      } else if (sourceCount >= 3) {
        confidence = 0.6;
      }

      return {
        suggestedBias: Math.round(domainStats.avgBiasRating * 10) / 10, // Round to 1 decimal
        confidence,
        domainStats,
      };
    } catch (error) {
      console.error('[DomainService] Failed to suggest bias rating:', error);
      return {
        suggestedBias: null,
        confidence: 0.0,
        domainStats: null,
      };
    }
  }

  /**
   * List all tracked domains with statistics
   * Sorted by most recently used
   */
  async listDomains(params?: {
    limit?: number;
    offset?: number;
    sortBy?: 'lastUsed' | 'totalSources' | 'avgBias';
  }): Promise<{ domains: DomainStats[]; total: number }> {
    const limit = params?.limit ?? 50;
    const offset = params?.offset ?? 0;
    const sortBy = params?.sortBy ?? 'lastUsed';

    try {
      // Get total count
      const total = await prisma.domain.count();

      // Build orderBy clause
      let orderBy: Prisma.DomainOrderByWithRelationInput;
      switch (sortBy) {
        case 'totalSources':
          orderBy = { totalSources: 'desc' };
          break;
        case 'avgBias':
          orderBy = { avgBiasRating: 'desc' };
          break;
        case 'lastUsed':
        default:
          orderBy = { lastUsed: 'desc' };
          break;
      }

      // Fetch domains with pagination
      const domainRecords = await prisma.domain.findMany({
        orderBy,
        take: limit,
        skip: offset,
      });

      const domains: DomainStats[] = domainRecords.map((record) => ({
        normalizedDomain: record.normalizedDomain,
        totalSources: record.totalSources,
        avgBiasRating: record.avgBiasRating
          ? parseFloat(record.avgBiasRating.toString())
          : null,
        usageFrequency: record.usageFrequency,
        firstSeen: record.firstSeen,
        lastUsed: record.lastUsed,
      }));

      return { domains, total };
    } catch (error) {
      console.error('[DomainService] Failed to list domains:', error);
      return { domains: [], total: 0 };
    }
  }

  /**
   * Recalculate statistics for a specific domain
   * Useful for fixing discrepancies or after bulk operations
   */
  async recalculateDomainStats(domain: string): Promise<DomainStats | null> {
    try {
      const normalizedDomain = normalizeDomain(domain);

      // Get actual source statistics from database
      const sourceStats = await prisma.source.aggregate({
        where: {
          url: {
            contains: normalizedDomain,
          },
        },
        _count: true,
        _avg: {
          biasRating: true,
        },
      });

      if (sourceStats._count === 0) {
        // No sources for this domain - delete the record
        await prisma.domain.delete({
          where: { normalizedDomain },
        }).catch(() => {
          // Ignore if record doesn't exist
        });
        return null;
      }

      // Update domain record with recalculated stats
      const updatedDomain = await prisma.domain.upsert({
        where: { normalizedDomain },
        update: {
          totalSources: sourceStats._count,
          avgBiasRating: sourceStats._avg.biasRating
            ? new Prisma.Decimal(sourceStats._avg.biasRating.toFixed(2))
            : null,
          lastUsed: new Date(),
        },
        create: {
          normalizedDomain,
          totalSources: sourceStats._count,
          avgBiasRating: sourceStats._avg.biasRating
            ? new Prisma.Decimal(sourceStats._avg.biasRating.toFixed(2))
            : null,
          usageFrequency: sourceStats._count,
          firstSeen: new Date(),
          lastUsed: new Date(),
        },
      });

      return {
        normalizedDomain: updatedDomain.normalizedDomain,
        totalSources: updatedDomain.totalSources,
        avgBiasRating: updatedDomain.avgBiasRating
          ? parseFloat(updatedDomain.avgBiasRating.toString())
          : null,
        usageFrequency: updatedDomain.usageFrequency,
        firstSeen: updatedDomain.firstSeen,
        lastUsed: updatedDomain.lastUsed,
      };
    } catch (error) {
      console.error('[DomainService] Failed to recalculate domain stats:', error);
      return null;
    }
  }

  /**
   * Recalculate statistics for all domains
   * WARNING: This can be slow for large datasets
   */
  async recalculateAllDomainStats(): Promise<{ updated: number; deleted: number }> {
    let updated = 0;
    let deleted = 0;

    try {
      // Get all unique domains from sources
      const sources = await prisma.source.findMany({
        select: { url: true, biasRating: true },
      });

      const domainMap = new Map<string, { count: number; biasSum: number }>();

      for (const source of sources) {
        try {
          const domain = extractDomainFromUrl(source.url);

          if (!domainMap.has(domain)) {
            domainMap.set(domain, { count: 0, biasSum: 0 });
          }

          const stats = domainMap.get(domain)!;
          stats.count++;
          stats.biasSum += source.biasRating;
        } catch {
          // Skip invalid URLs
        }
      }

      // Update or create domain records
      for (const [domain, stats] of domainMap.entries()) {
        await prisma.domain.upsert({
          where: { normalizedDomain: domain },
          update: {
            totalSources: stats.count,
            avgBiasRating: new Prisma.Decimal((stats.biasSum / stats.count).toFixed(2)),
            lastUsed: new Date(),
          },
          create: {
            normalizedDomain: domain,
            totalSources: stats.count,
            avgBiasRating: new Prisma.Decimal((stats.biasSum / stats.count).toFixed(2)),
            usageFrequency: stats.count,
            firstSeen: new Date(),
            lastUsed: new Date(),
          },
        });
        updated++;
      }

      // Delete domains that no longer have sources
      const allDomains = await prisma.domain.findMany({
        select: { normalizedDomain: true },
      });

      for (const domainRecord of allDomains) {
        if (!domainMap.has(domainRecord.normalizedDomain)) {
          await prisma.domain.delete({
            where: { normalizedDomain: domainRecord.normalizedDomain },
          });
          deleted++;
        }
      }

      console.log(`[DomainService] Recalculated stats: ${updated} updated, ${deleted} deleted`);

      return { updated, deleted };
    } catch (error) {
      console.error('[DomainService] Failed to recalculate all domain stats:', error);
      return { updated, deleted };
    }
  }

  /**
   * Close Prisma connection
   */
  async disconnect(): Promise<void> {
    await prisma.$disconnect();
  }
}

/**
 * Create domain intelligence service instance
 */
export function createDomainService(): DomainIntelligenceService {
  return new DomainIntelligenceService();
}
