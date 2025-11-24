import { cn } from '@/lib/utils'

type StrengthRating = 'weak' | 'moderate' | 'strong'

interface StrengthRatingSelectorProps {
  value: StrengthRating | undefined
  onChange: (value: StrengthRating) => void
  label?: string
  className?: string
}

const ratings: { value: StrengthRating; label: string; color: string }[] = [
  { value: 'weak', label: 'Weak', color: 'bg-yellow-100 border-yellow-400 text-yellow-800' },
  { value: 'moderate', label: 'Moderate', color: 'bg-orange-100 border-orange-400 text-orange-800' },
  { value: 'strong', label: 'Strong', color: 'bg-red-100 border-red-400 text-red-800' },
]

export function StrengthRatingSelector({
  value,
  onChange,
  label,
  className,
}: StrengthRatingSelectorProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {label && <p className="text-sm font-medium">{label}</p>}
      <div className="flex gap-2">
        {ratings.map((rating) => (
          <button
            key={rating.value}
            type="button"
            onClick={() => onChange(rating.value)}
            className={cn(
              'px-3 py-1.5 text-sm font-medium rounded-md border-2 transition-all',
              value === rating.value
                ? rating.color
                : 'bg-background border-border text-muted-foreground hover:border-primary/50'
            )}
          >
            {rating.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function getStrengthLabel(value: string): string {
  const labels: Record<string, string> = {
    weak: 'Weak',
    moderate: 'Moderate',
    strong: 'Strong',
  }
  return labels[value] || value
}

export function getStrengthColor(value: string): string {
  const colors: Record<string, string> = {
    weak: 'text-yellow-700 bg-yellow-100',
    moderate: 'text-orange-700 bg-orange-100',
    strong: 'text-red-700 bg-red-100',
  }
  return colors[value] || 'text-gray-700 bg-gray-100'
}
