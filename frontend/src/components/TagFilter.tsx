import { type Tag } from '@/services/api'

interface TagFilterProps {
  tags: Tag[]
  selectedTagIds: string[]
  onToggleTag: (tagId: string) => void
  className?: string
}

export function TagFilter({ tags, selectedTagIds, onToggleTag, className }: TagFilterProps) {
  if (tags.length === 0) {
    return null
  }

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => {
          const isSelected = selectedTagIds.includes(tag.id)
          return (
            <button
              key={tag.id}
              onClick={() => onToggleTag(tag.id)}
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-all hover:opacity-80"
              style={{
                backgroundColor: isSelected ? tag.color : `${tag.color}20`,
                color: isSelected ? 'white' : tag.color,
                border: `1px solid ${tag.color}`,
              }}
            >
              {tag.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}
