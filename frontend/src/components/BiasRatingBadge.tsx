import { cn, getBiasLabel, getBiasColor } from '@/lib/utils'

interface BiasRatingBadgeProps {
  rating: number
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const biasColors: Record<number, { bg: string; text: string; border: string }> = {
  '-3': { bg: 'bg-blue-600', text: 'text-white', border: 'border-blue-700' },
  '-2': { bg: 'bg-blue-400', text: 'text-white', border: 'border-blue-500' },
  '-1': { bg: 'bg-blue-200', text: 'text-blue-900', border: 'border-blue-300' },
  '0': { bg: 'bg-gray-300', text: 'text-gray-800', border: 'border-gray-400' },
  '1': { bg: 'bg-red-200', text: 'text-red-900', border: 'border-red-300' },
  '2': { bg: 'bg-red-400', text: 'text-white', border: 'border-red-500' },
  '3': { bg: 'bg-red-600', text: 'text-white', border: 'border-red-700' },
}

const sizeClasses = {
  sm: 'px-1.5 py-0.5 text-xs',
  md: 'px-2 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
}

export function BiasRatingBadge({ rating, showLabel = true, size = 'sm', className }: BiasRatingBadgeProps) {
  const colors = biasColors[rating] || biasColors[0]
  const label = getBiasLabel(rating)

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium border',
        colors.bg,
        colors.text,
        colors.border,
        sizeClasses[size],
        className
      )}
      title={label}
    >
      {showLabel ? label : rating > 0 ? `+${rating}` : rating}
    </span>
  )
}

/**
 * Visual bias scale indicator showing position on spectrum.
 */
export function BiasScale({ rating, className }: { rating: number; className?: string }) {
  // Convert -3 to 3 range to 0-100% position
  const position = ((rating + 3) / 6) * 100

  return (
    <div className={cn('relative h-2 rounded-full bg-gradient-to-r from-blue-500 via-gray-300 to-red-500', className)}>
      <div
        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-gray-600 shadow"
        style={{ left: `calc(${position}% - 6px)` }}
      />
    </div>
  )
}
