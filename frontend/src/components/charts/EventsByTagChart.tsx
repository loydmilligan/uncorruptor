/**
 * Events By Tag Chart
 * Pie chart showing event distribution across tags
 */

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { EventsByTag } from '../../hooks/useDashboard'

interface EventsByTagChartProps {
  data: EventsByTag[]
  onTagClick?: (tagId: string, tagName: string) => void
}

// Default colors for tags that don't have a color set
const DEFAULT_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
]

export function EventsByTagChart({ data, onTagClick }: EventsByTagChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No data available
      </div>
    )
  }

  // Prepare data for chart
  const chartData = data.map((item, index) => ({
    name: item.tagName,
    value: item.count,
    color: item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
    tagId: item.tagId,
  }))

  const handleClick = (entry: any) => {
    if (onTagClick) {
      onTagClick(entry.tagId, entry.name)
    }
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) =>
              `${name}: ${(percent * 100).toFixed(0)}%`
            }
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            onClick={handleClick}
            cursor={onTagClick ? 'pointer' : 'default'}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
