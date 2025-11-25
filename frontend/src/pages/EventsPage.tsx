import { useSearchParams, Link } from 'react-router-dom'
import { useEvents, type EventFilters } from '@/hooks/useEvents'
import { useTags } from '@/hooks/useTags'
import { EventCard } from '@/components/EventCard'
import { FilterPanel, type FilterPanelFilters } from '@/components/FilterPanel'
import { Button } from '@/components/ui/button'
import { EmptyEventsState, EmptySearchState } from '@/components/EmptyState'
import { ErrorState } from '@/components/ErrorBoundary'

export function EventsPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  // Parse filters from URL
  const filters: EventFilters = {
    page: parseInt(searchParams.get('page') || '1', 10),
    pageSize: 20,
    search: searchParams.get('search') || undefined,
    tags: searchParams.get('tags') || undefined,
    adminPeriod: searchParams.get('adminPeriod') || undefined,
    startDate: searchParams.get('startDate') || undefined,
    endDate: searchParams.get('endDate') || undefined,
  }

  const { data, isLoading, error } = useEvents(filters)
  const { data: tagsData } = useTags()

  const events = data?.data || []
  const pagination = data?.pagination
  const tags = tagsData?.data || []

  // Convert filters to FilterPanel format
  const panelFilters: FilterPanelFilters = {
    search: filters.search,
    startDate: filters.startDate,
    endDate: filters.endDate,
    adminPeriod: filters.adminPeriod,
    tags: filters.tags?.split(',').filter(Boolean),
  }

  const handleFiltersChange = (newFilters: FilterPanelFilters) => {
    const newParams = new URLSearchParams()

    if (newFilters.search) {
      newParams.set('search', newFilters.search)
    }
    if (newFilters.startDate) {
      newParams.set('startDate', newFilters.startDate)
    }
    if (newFilters.endDate) {
      newParams.set('endDate', newFilters.endDate)
    }
    if (newFilters.adminPeriod) {
      newParams.set('adminPeriod', newFilters.adminPeriod)
    }
    if (newFilters.tags && newFilters.tags.length > 0) {
      newParams.set('tags', newFilters.tags.join(','))
    }

    // Reset to page 1 when filters change
    newParams.set('page', '1')
    setSearchParams(newParams)
  }

  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.set('page', String(page))
    setSearchParams(newParams)
  }

  const selectedTags = filters.tags?.split(',').filter(Boolean) || []
  const hasFilters =
    filters.search ||
    filters.startDate ||
    filters.endDate ||
    selectedTags.length > 0 ||
    filters.adminPeriod

  const handleClearFilters = () => {
    setSearchParams(new URLSearchParams())
  }

  if (error) {
    return <ErrorState message={`Error loading events: ${error.message}`} />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Events</h1>
        <div className="flex gap-2">
          <Link to="/events/bulk-upload">
            <Button variant="outline">Bulk Import</Button>
          </Link>
          <Link to="/events/new">
            <Button>+ New Event</Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <FilterPanel
        filters={panelFilters}
        availableTags={tags}
        onFiltersChange={handleFiltersChange}
      />

      {/* Results */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : events.length === 0 ? (
        hasFilters ? (
          <EmptySearchState onClear={handleClearFilters} />
        ) : (
          <EmptyEventsState onCreate={() => window.location.href = '/events/new'} />
        )
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => handlePageChange(pagination.page - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => handlePageChange(pagination.page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
