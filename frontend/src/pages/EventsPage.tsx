import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useEvents, type EventFilters } from '@/hooks/useEvents'
import { useTags } from '@/hooks/useTags'
import { EventCard } from '@/components/EventCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function EventsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '')

  const filters: EventFilters = {
    page: parseInt(searchParams.get('page') || '1', 10),
    pageSize: 20,
    search: searchParams.get('search') || undefined,
    tags: searchParams.get('tags') || undefined,
    adminPeriod: searchParams.get('adminPeriod') || undefined,
  }

  const { data, isLoading, error } = useEvents(filters)
  const { data: tagsData } = useTags()

  const events = data?.data || []
  const pagination = data?.pagination
  const tags = tagsData?.data || []

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const newParams = new URLSearchParams(searchParams)
    if (searchInput.trim()) {
      newParams.set('search', searchInput.trim())
    } else {
      newParams.delete('search')
    }
    newParams.set('page', '1')
    setSearchParams(newParams)
  }

  const handleTagFilter = (tagId: string) => {
    const newParams = new URLSearchParams(searchParams)
    const currentTags = newParams.get('tags')?.split(',').filter(Boolean) || []

    if (currentTags.includes(tagId)) {
      const filtered = currentTags.filter((id) => id !== tagId)
      if (filtered.length > 0) {
        newParams.set('tags', filtered.join(','))
      } else {
        newParams.delete('tags')
      }
    } else {
      newParams.set('tags', [...currentTags, tagId].join(','))
    }
    newParams.set('page', '1')
    setSearchParams(newParams)
  }

  const handleAdminPeriodFilter = (period: string | null) => {
    const newParams = new URLSearchParams(searchParams)
    if (period) {
      newParams.set('adminPeriod', period)
    } else {
      newParams.delete('adminPeriod')
    }
    newParams.set('page', '1')
    setSearchParams(newParams)
  }

  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.set('page', String(page))
    setSearchParams(newParams)
  }

  const clearFilters = () => {
    setSearchInput('')
    setSearchParams(new URLSearchParams())
  }

  const selectedTags = filters.tags?.split(',').filter(Boolean) || []
  const hasFilters = filters.search || selectedTags.length > 0 || filters.adminPeriod

  if (error) {
    return (
      <div className="p-6">
        <div className="text-destructive">Error loading events: {error.message}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Events</h1>
        <Link to="/events/new">
          <Button>+ New Event</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            type="search"
            placeholder="Search events..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="max-w-sm"
          />
          <Button type="submit" variant="secondary">
            Search
          </Button>
          {hasFilters && (
            <Button type="button" variant="ghost" onClick={clearFilters}>
              Clear
            </Button>
          )}
        </form>

        {/* Admin Period Filter */}
        <div className="flex gap-2">
          <Button
            variant={!filters.adminPeriod ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleAdminPeriodFilter(null)}
          >
            All Periods
          </Button>
          <Button
            variant={filters.adminPeriod === 'TRUMP_1' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleAdminPeriodFilter('TRUMP_1')}
          >
            Trump 1
          </Button>
          <Button
            variant={filters.adminPeriod === 'TRUMP_2' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleAdminPeriodFilter('TRUMP_2')}
          >
            Trump 2
          </Button>
        </div>

        {/* Tag Filter */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => handleTagFilter(tag.id)}
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-all"
                style={{
                  backgroundColor: selectedTags.includes(tag.id) ? tag.color : `${tag.color}20`,
                  color: selectedTags.includes(tag.id) ? 'white' : tag.color,
                  border: `1px solid ${tag.color}`,
                }}
              >
                {tag.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            {hasFilters ? 'No events match your filters' : 'No events yet'}
          </p>
          <Link to="/events/new">
            <Button>Create your first event</Button>
          </Link>
        </div>
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
