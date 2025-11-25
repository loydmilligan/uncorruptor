/**
 * Dashboard Service
 * Provides aggregated data for dashboard visualizations
 */

import { prisma } from '../lib/prisma.js'

export interface DashboardSummary {
  totalEvents: number
  totalSources: number
  eventsWithCounterNarratives: number
  mostCommonTag: {
    name: string
    count: number
  } | null
}

export interface EventsByTag {
  tagName: string
  tagId: string
  count: number
  color?: string
}

export interface TimelineData {
  month: string // Format: "2025-01"
  count: number
  events: Array<{
    id: string
    title: string
    startDate: string
  }>
}

export interface AdminComparisonData {
  administration: string // e.g., "Trump 1" or "Trump 2"
  eventCount: number
  categories: {
    [tagName: string]: number
  }
}

export class DashboardService {
  /**
   * Get summary statistics for dashboard
   */
  async getSummary(): Promise<DashboardSummary> {
    const [
      totalEvents,
      totalSources,
      eventsWithCounterNarratives,
      tagCounts,
    ] = await Promise.all([
      prisma.event.count(),
      prisma.source.count(),
      prisma.event.count({
        where: {
          counterNarrative: {
            isNot: null,
          },
        },
      }),
      prisma.tag.findMany({
        include: {
          _count: {
            select: { events: true },
          },
        },
        orderBy: {
          events: {
            _count: 'desc',
          },
        },
        take: 1,
      }),
    ])

    const mostCommonTag = tagCounts[0]
      ? {
          name: tagCounts[0].name,
          count: tagCounts[0]._count.events,
        }
      : null

    return {
      totalEvents,
      totalSources,
      eventsWithCounterNarratives,
      mostCommonTag,
    }
  }

  /**
   * Get event distribution by tag
   */
  async getEventsByTag(): Promise<EventsByTag[]> {
    const tags = await prisma.tag.findMany({
      include: {
        _count: {
          select: { events: true },
        },
      },
      orderBy: {
        events: {
          _count: 'desc',
        },
      },
    })

    return tags.map((tag) => ({
      tagId: tag.id,
      tagName: tag.name,
      count: tag._count.events,
      color: tag.color || undefined,
    }))
  }

  /**
   * Get timeline of events by month
   */
  async getTimeline(startDate?: Date, endDate?: Date): Promise<TimelineData[]> {
    const whereClause = {
      ...(startDate || endDate
        ? {
            startDate: {
              ...(startDate ? { gte: startDate } : {}),
              ...(endDate ? { lte: endDate } : {}),
            },
          }
        : {}),
    }

    const events = await prisma.event.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        startDate: true,
      },
      orderBy: {
        startDate: 'asc',
      },
    })

    // Group by month
    const eventsByMonth = new Map<string, typeof events>()

    events.forEach((event) => {
      const month = event.startDate.toISOString().substring(0, 7) // YYYY-MM
      if (!eventsByMonth.has(month)) {
        eventsByMonth.set(month, [])
      }
      eventsByMonth.get(month)!.push(event)
    })

    // Convert to array and sort
    const timeline: TimelineData[] = Array.from(eventsByMonth.entries())
      .map(([month, monthEvents]) => ({
        month,
        count: monthEvents.length,
        events: monthEvents.map((e) => ({
          id: e.id,
          title: e.title,
          startDate: e.startDate.toISOString(),
        })),
      }))
      .sort((a, b) => a.month.localeCompare(b.month))

    return timeline
  }

  /**
   * Compare events across Trump administrations
   * Admin 1: Jan 20, 2017 - Jan 20, 2021
   * Admin 2: Jan 20, 2025 - Jan 20, 2029
   */
  async getAdminComparison(): Promise<AdminComparisonData[]> {
    const admin1Start = new Date('2017-01-20')
    const admin1End = new Date('2021-01-20')
    const admin2Start = new Date('2025-01-20')
    const admin2End = new Date('2029-01-20')

    const [admin1Events, admin2Events] = await Promise.all([
      prisma.event.findMany({
        where: {
          startDate: {
            gte: admin1Start,
            lte: admin1End,
          },
        },
        include: {
          tags: {
            select: {
              name: true,
            },
          },
        },
      }),
      prisma.event.findMany({
        where: {
          startDate: {
            gte: admin2Start,
            lte: admin2End,
          },
        },
        include: {
          tags: {
            select: {
              name: true,
            },
          },
        },
      }),
    ])

    // Build category counts for each administration
    const buildCategoryCounts = (events: typeof admin1Events) => {
      const counts: { [key: string]: number } = {}
      events.forEach((event) => {
        event.tags.forEach((tag) => {
          counts[tag.name] = (counts[tag.name] || 0) + 1
        })
      })
      return counts
    }

    return [
      {
        administration: 'Trump 1 (2017-2021)',
        eventCount: admin1Events.length,
        categories: buildCategoryCounts(admin1Events),
      },
      {
        administration: 'Trump 2 (2025-2029)',
        eventCount: admin2Events.length,
        categories: buildCategoryCounts(admin2Events),
      },
    ]
  }
}

export const dashboardService = new DashboardService()
