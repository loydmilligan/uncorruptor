import { useState } from 'react'
import { useTags } from '@/hooks/useTags'
import { TagBadge } from './TagBadge'
import { cn } from '@/lib/utils'

interface TagSelectorProps {
  selectedTagIds: string[]
  onChange: (tagIds: string[]) => void
  primaryTagId?: string
  onPrimaryChange?: (tagId: string | undefined) => void
  className?: string
}

export function TagSelector({
  selectedTagIds,
  onChange,
  primaryTagId,
  onPrimaryChange,
  className,
}: TagSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { data: tagsResponse, isLoading } = useTags()

  const tags = tagsResponse?.data || []
  const selectedTags = tags.filter((tag) => selectedTagIds.includes(tag.id))
  const availableTags = tags.filter((tag) => !selectedTagIds.includes(tag.id))

  const handleSelect = (tagId: string) => {
    onChange([...selectedTagIds, tagId])
  }

  const handleRemove = (tagId: string) => {
    onChange(selectedTagIds.filter((id) => id !== tagId))
    // If removing the primary tag, clear it
    if (tagId === primaryTagId && onPrimaryChange) {
      onPrimaryChange(undefined)
    }
  }

  const handleSetPrimary = (tagId: string) => {
    if (onPrimaryChange) {
      onPrimaryChange(tagId === primaryTagId ? undefined : tagId)
    }
  }

  return (
    <div className={cn('relative', className)}>
      {/* Selected tags */}
      <div className="flex flex-wrap gap-1.5 mb-2">
        {selectedTags.map((tag) => (
          <div key={tag.id} className="group relative">
            <TagBadge
              name={tag.name}
              color={tag.color}
              isPrimary={tag.id === primaryTagId}
              onRemove={() => handleRemove(tag.id)}
            />
            {onPrimaryChange && (
              <button
                type="button"
                onClick={() => handleSetPrimary(tag.id)}
                className={cn(
                  'absolute -top-1 -left-1 w-4 h-4 rounded-full text-[10px] font-bold',
                  'flex items-center justify-center transition-all',
                  tag.id === primaryTagId
                    ? 'bg-yellow-500 text-white'
                    : 'bg-gray-200 text-gray-500 opacity-0 group-hover:opacity-100'
                )}
                title={tag.id === primaryTagId ? 'Primary tag' : 'Set as primary'}
              >
                {tag.id === primaryTagId ? '★' : '☆'}
              </button>
            )}
          </div>
        ))}
      </div>

      {onPrimaryChange && selectedTags.length > 0 && (
        <p className="text-xs text-muted-foreground mb-2">
          Hover over a tag and click ☆ to set it as primary
        </p>
      )}

      {/* Dropdown trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 text-sm border rounded-md bg-background hover:bg-accent"
      >
        <span className="text-muted-foreground">
          {selectedTagIds.length === 0 ? 'Select tags...' : 'Add more tags...'}
        </span>
        <svg
          className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
          {isLoading ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">Loading tags...</div>
          ) : availableTags.length === 0 ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              {tags.length === 0 ? 'No tags available' : 'All tags selected'}
            </div>
          ) : (
            availableTags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => {
                  handleSelect(tag.id)
                  setIsOpen(false)
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent text-left"
              >
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: tag.color }}
                />
                <span>{tag.name}</span>
                {tag.description && (
                  <span className="text-muted-foreground text-xs ml-auto">
                    {tag.description}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
