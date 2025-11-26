import { cn } from '@/lib/utils'

interface TagBadgeProps {
  name: string
  color: string
  className?: string
  isPrimary?: boolean
  onRemove?: () => void
}

// Helper to adjust tag colors for dark mode (increase opacity for better contrast)
function getTagStyles(color: string, isDark: boolean) {
  if (isDark) {
    // Dark mode: higher opacity for better visibility
    return {
      backgroundColor: `${color}30`,
      color: color,
      border: `1px solid ${color}60`,
    }
  } else {
    // Light mode: lower opacity
    return {
      backgroundColor: `${color}20`,
      color: color,
      border: `1px solid ${color}40`,
    }
  }
}

export function TagBadge({ name, color, className, isPrimary, onRemove }: TagBadgeProps) {
  // Check if dark mode is active by looking at document class
  // This will re-render when theme changes because parent components re-render
  const isDark = document.documentElement.classList.contains('dark')

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
        isPrimary && 'ring-2 ring-yellow-500 ring-offset-1',
        className
      )}
      style={getTagStyles(color, isDark)}
    >
      {name}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onRemove()
          }}
          className="ml-1 hover:opacity-70"
        >
          <svg
            className="h-3 w-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </span>
  )
}
