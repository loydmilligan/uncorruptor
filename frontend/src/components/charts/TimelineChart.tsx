/**
 * Timeline Chart
 * Bar chart showing events over time
 */

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { TimelineData } from '../../hooks/useDashboard'

interface TimelineChartProps {
  data: TimelineData[]
  onMonthClick?: (month: string, eventIds: string[]) => void
}

const CHART_COLOR = '#3b82f6' // blue
const HOVER_COLOR = '#2563eb' // darker blue

export function TimelineChart({ data, onMonthClick }: TimelineChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No data available
      </div>
    )
  }

  // Format month for display (YYYY-MM to MMM YYYY)
  const formatMonth = (month: string) => {
    const [year, monthNum] = month.split('-')
    const date = new Date(parseInt(year), parseInt(monthNum) - 1)
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }

  // Prepare data for chart
  const chartData = data.map((item) => ({
    month: item.month,
    displayMonth: formatMonth(item.month),
    count: item.count,
    eventIds: item.events.map((e) => e.id),
  }))

  const handleClick = (entry: any) => {
    if (onMonthClick && entry) {
      onMonthClick(entry.month, entry.eventIds)
    }
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="displayMonth"
            angle={-45}
            textAnchor="end"
            height={80}
            fontSize={12}
          />
          <YAxis
            label={{ value: 'Number of Events', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload
                return (
                  <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
                    <p className="font-semibold">{data.displayMonth}</p>
                    <p className="text-sm text-gray-600">
                      {data.count} event{data.count !== 1 ? 's' : ''}
                    </p>
                  </div>
                )
              }
              return null
            }}
          />
          <Bar
            dataKey="count"
            fill={CHART_COLOR}
            onClick={handleClick}
            cursor={onMonthClick ? 'pointer' : 'default'}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={CHART_COLOR}
                onMouseEnter={(e: any) => {
                  e.target.setAttribute('fill', HOVER_COLOR)
                }}
                onMouseLeave={(e: any) => {
                  e.target.setAttribute('fill', CHART_COLOR)
                }}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
