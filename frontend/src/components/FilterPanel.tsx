import { SearchInput } from '@/components/SearchInput'
import { DateRangeFilter } from '@/components/DateRangeFilter'
import { AdminPeriodFilter } from '@/components/AdminPeriodFilter'
import { TagFilter } from '@/components/TagFilter'
import { Button } from '@/components/ui/button'
import { type Tag } from '@/services/api'

export interface FilterPanelFilters {
  search?: string
  startDate?: string
  endDate?: string
  adminPeriod?: string
  tags?: string[] // array of tag IDs
}

interface FilterPanelProps {
  filters: FilterPanelFilters
  availableTags: Tag[]
  onFiltersChange: (filters: FilterPanelFilters) => void
  className?: string
}

export function FilterPanel({
  filters,
  availableTags,
  onFiltersChange,
  className
}: FilterPanelProps) {
  const handleSearchChange = (search: string) => {
    onFiltersChange({ ...filters, search: search || undefined })
  }

  const handleDateRangeChange = (startDate: string | undefined, endDate: string | undefined) => {
    onFiltersChange({ ...filters, startDate, endDate })
  }

  const handleAdminPeriodChange = (period: string | null) => {
    onFiltersChange({ ...filters, adminPeriod: period || undefined })
  }

  const handleToggleTag = (tagId: string) => {
    const currentTags = filters.tags || []
    const newTags = currentTags.includes(tagId)
      ? currentTags.filter((id) => id !== tagId)
      : [...currentTags, tagId]

    onFiltersChange({ ...filters, tags: newTags.length > 0 ? newTags : undefined })
  }

  const handleClearAll = () => {
    onFiltersChange({})
  }

  const hasFilters =
    filters.search ||
    filters.startDate ||
    filters.endDate ||
    filters.adminPeriod ||
    (filters.tags && filters.tags.length > 0)

  return (
    <div className={className}>
      <div className="space-y-4">
        {/* Search */}
        <div>
          <SearchInput
            value={filters.search}
            onSearch={handleSearchChange}
            placeholder="Search events..."
          />
        </div>

        {/* Date Range */}
        <div>
          <DateRangeFilter
            startDate={filters.startDate}
            endDate={filters.endDate}
            onDateRangeChange={handleDateRangeChange}
          />
        </div>

        {/* Admin Period */}
        <div>
          <label className="text-sm font-medium mb-2 block">Administration Period</label>
          <AdminPeriodFilter
            value={filters.adminPeriod}
            onChange={handleAdminPeriodChange}
          />
        </div>

        {/* Tags */}
        {availableTags.length > 0 && (
          <div>
            <label className="text-sm font-medium mb-2 block">Tags</label>
            <TagFilter
              tags={availableTags}
              selectedTagIds={filters.tags || []}
              onToggleTag={handleToggleTag}
            />
          </div>
        )}

        {/* Clear All */}
        {hasFilters && (
          <div className="pt-2">
            <Button variant="outline" size="sm" onClick={handleClearAll}>
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
