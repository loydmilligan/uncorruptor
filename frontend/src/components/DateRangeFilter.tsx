import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

interface DateRangeFilterProps {
  startDate?: string
  endDate?: string
  onDateRangeChange: (startDate: string | undefined, endDate: string | undefined) => void
  className?: string
}

export function DateRangeFilter({
  startDate: initialStartDate,
  endDate: initialEndDate,
  onDateRangeChange,
  className
}: DateRangeFilterProps) {
  const [startDate, setStartDate] = useState(initialStartDate || '')
  const [endDate, setEndDate] = useState(initialEndDate || '')

  const handleApply = () => {
    onDateRangeChange(
      startDate || undefined,
      endDate || undefined
    )
  }

  const handleClear = () => {
    setStartDate('')
    setEndDate('')
    onDateRangeChange(undefined, undefined)
  }

  const hasValues = startDate || endDate

  return (
    <div className={className}>
      <div className="flex flex-wrap items-end gap-2">
        <div className="flex-1 min-w-[150px]">
          <Label htmlFor="start-date" className="text-sm font-medium mb-1 block">
            Start Date
          </Label>
          <Input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            max={endDate || undefined}
          />
        </div>
        <div className="flex-1 min-w-[150px]">
          <Label htmlFor="end-date" className="text-sm font-medium mb-1 block">
            End Date
          </Label>
          <Input
            id="end-date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate || undefined}
          />
        </div>
        <Button type="button" variant="secondary" onClick={handleApply}>
          Apply
        </Button>
        {hasValues && (
          <Button type="button" variant="ghost" onClick={handleClear}>
            Clear
          </Button>
        )}
      </div>
    </div>
  )
}
