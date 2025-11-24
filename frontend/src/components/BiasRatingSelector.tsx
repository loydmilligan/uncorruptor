import { cn, getBiasLabel } from '@/lib/utils'

interface BiasRatingSelectorProps {
  value: number
  onChange: (rating: number) => void
  className?: string
}

const ratings = [-3, -2, -1, 0, 1, 2, 3]

const ratingColors: Record<number, string> = {
  '-3': 'bg-blue-600 hover:bg-blue-700 text-white',
  '-2': 'bg-blue-400 hover:bg-blue-500 text-white',
  '-1': 'bg-blue-200 hover:bg-blue-300 text-blue-900',
  '0': 'bg-gray-300 hover:bg-gray-400 text-gray-800',
  '1': 'bg-red-200 hover:bg-red-300 text-red-900',
  '2': 'bg-red-400 hover:bg-red-500 text-white',
  '3': 'bg-red-600 hover:bg-red-700 text-white',
}

const selectedRing: Record<number, string> = {
  '-3': 'ring-blue-600',
  '-2': 'ring-blue-400',
  '-1': 'ring-blue-200',
  '0': 'ring-gray-400',
  '1': 'ring-red-200',
  '2': 'ring-red-400',
  '3': 'ring-red-600',
}

export function BiasRatingSelector({ value, onChange, className }: BiasRatingSelectorProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex gap-1">
        {ratings.map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => onChange(rating)}
            className={cn(
              'flex-1 py-2 px-1 rounded text-xs font-medium transition-all',
              ratingColors[rating],
              value === rating && `ring-2 ring-offset-2 ${selectedRing[rating]}`
            )}
            title={getBiasLabel(rating)}
          >
            {rating > 0 ? `+${rating}` : rating}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Far Left</span>
        <span>Center</span>
        <span>Far Right</span>
      </div>
      <p className="text-sm text-center font-medium">{getBiasLabel(value)}</p>
    </div>
  )
}
