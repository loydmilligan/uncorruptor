import { Button } from '@/components/ui/button'

type AdminPeriod = 'TRUMP_1' | 'TRUMP_2' | 'OTHER' | null

interface AdminPeriodFilterProps {
  value?: string
  onChange: (period: string | null) => void
  className?: string
}

const ADMIN_PERIODS: { value: AdminPeriod; label: string }[] = [
  { value: null, label: 'All Periods' },
  { value: 'TRUMP_1', label: 'Trump 1 (2017-2021)' },
  { value: 'TRUMP_2', label: 'Trump 2 (2025+)' },
  { value: 'OTHER', label: 'Other' }
]

export function AdminPeriodFilter({ value, onChange, className }: AdminPeriodFilterProps) {
  return (
    <div className={className}>
      <div className="flex flex-wrap gap-2">
        {ADMIN_PERIODS.map((period) => (
          <Button
            key={period.value || 'all'}
            variant={value === period.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => onChange(period.value)}
          >
            {period.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
