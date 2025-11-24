import { useState } from 'react'
import { useTags } from '@/hooks/useTags'
import { TagBadge } from './TagBadge'
import { cn } from '@/lib/utils'
import type { Tag } from '@/services/api'

interface TagSelectorProps {
  selectedTagIds: string[]
  onChange: (tagIds: string[]) => void
  className?: string
}

export function TagSelector({ selectedTagIds, onChange, className }: TagSelectorProps) {
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
  }

  return (
    <div className={cn('relative', className)}>
      {/* Selected tags */}
      <div className="flex flex-wrap gap-1.5 mb-2">
        {selectedTags.map((tag) => (
          <TagBadge
            key={tag.id}
            name={tag.name}
            color={tag.color}
            onRemove={() => handleRemove(tag.id)}
          />
        ))}
      </div>

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
