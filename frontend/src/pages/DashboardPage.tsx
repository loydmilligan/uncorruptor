/**
 * Dashboard Page
 * Main dashboard with visualizations and statistics
 */

import { useNavigate } from 'react-router-dom'
import {
  useDashboardSummary,
  useEventsByTag,
  useTimeline,
  useAdminComparison,
} from '../hooks/useDashboard'
import { StatCard } from '../components/charts/StatCard'
import { EventsByTagChart } from '../components/charts/EventsByTagChart'
import { TimelineChart } from '../components/charts/TimelineChart'
import { AdminComparisonChart } from '../components/charts/AdminComparisonChart'
import { FileText, ExternalLink, MessageSquare, Tag } from 'lucide-react'

export default function DashboardPage() {
  const navigate = useNavigate()

  const { data: summary, isLoading: summaryLoading } = useDashboardSummary()
  const { data: eventsByTag, isLoading: tagLoading } = useEventsByTag()
  const { data: timeline, isLoading: timelineLoading } = useTimeline()
  const { data: comparison, isLoading: comparisonLoading } = useAdminComparison()

  const isLoading = summaryLoading || tagLoading || timelineLoading || comparisonLoading

  // Drill-down handlers
  const handleTagClick = (tagId: string, tagName: string) => {
    // Navigate to events page with tag filter
    navigate(`/events?tag=${tagId}`)
  }

  const handleMonthClick = (month: string, eventIds: string[]) => {
    // Navigate to events page with date filter
    const [year, monthNum] = month.split('-')
    const startDate = `${year}-${monthNum}-01`
    const endDate = new Date(parseInt(year), parseInt(monthNum), 0)
      .toISOString()
      .split('T')[0]
    navigate(`/events?startDate=${startDate}&endDate=${endDate}`)
  }

  const handleAdminClick = (administration: string) => {
    // Navigate to events page with admin period filter
    if (administration.includes('2017')) {
      navigate('/events?startDate=2017-01-20&endDate=2021-01-20')
    } else if (administration.includes('2025')) {
      navigate('/events?startDate=2025-01-20&endDate=2029-01-20')
    }
  }

  const handleAllEventsClick = () => {
    navigate('/events')
  }

  const handleEventsWithNarrativesClick = () => {
    navigate('/events?hasCounterNarrative=true')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Overview of accountability events and analysis
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          label="Total Events"
          value={summary?.totalEvents || 0}
          icon={<FileText size={20} />}
          onClick={handleAllEventsClick}
        />
        <StatCard
          label="Total Sources"
          value={summary?.totalSources || 0}
          icon={<ExternalLink size={20} />}
        />
        <StatCard
          label="With Counter-Narratives"
          value={summary?.eventsWithCounterNarratives || 0}
          icon={<MessageSquare size={20} />}
          subtitle={
            summary?.totalEvents
              ? `${Math.round(
                  ((summary.eventsWithCounterNarratives || 0) / summary.totalEvents) * 100
                )}% of events`
              : undefined
          }
          onClick={handleEventsWithNarrativesClick}
        />
        <StatCard
          label="Most Common Tag"
          value={summary?.mostCommonTag?.name || 'N/A'}
          icon={<Tag size={20} />}
          subtitle={
            summary?.mostCommonTag
              ? `${summary.mostCommonTag.count} events`
              : undefined
          }
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Events by Tag */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Events by Category
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Click on a category to view filtered events
          </p>
          <EventsByTagChart data={eventsByTag || []} onTagClick={handleTagClick} />
        </div>

        {/* Timeline */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Timeline
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Events over time - click a month to view events
          </p>
          <TimelineChart data={timeline || []} onMonthClick={handleMonthClick} />
        </div>
      </div>

      {/* Admin Comparison - Full Width */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Administration Comparison
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Comparing Trump 1st and 2nd administrations - click to filter by period
        </p>
        <AdminComparisonChart
          data={comparison || []}
          onAdminClick={handleAdminClick}
        />
      </div>
    </div>
  )
}
