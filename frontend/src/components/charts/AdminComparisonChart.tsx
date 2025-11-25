/**
 * Admin Comparison Chart
 * Grouped bar chart comparing Trump administrations
 */

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { AdminComparisonData } from '../../hooks/useDashboard'

interface AdminComparisonChartProps {
  data: AdminComparisonData[]
  onAdminClick?: (administration: string) => void
}

const COLORS = {
  admin1: '#ef4444', // red
  admin2: '#3b82f6', // blue
}

export function AdminComparisonChart({
  data,
  onAdminClick,
}: AdminComparisonChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No data available
      </div>
    )
  }

  // Get all unique categories across both administrations
  const allCategories = new Set<string>()
  data.forEach((admin) => {
    Object.keys(admin.categories).forEach((cat) => allCategories.add(cat))
  })

  // Prepare data for chart - one row per category
  const chartData = Array.from(allCategories).map((category) => {
    const row: any = { category }
    data.forEach((admin, index) => {
      row[`admin${index + 1}`] = admin.categories[category] || 0
      row[`admin${index + 1}_name`] = admin.administration
    })
    return row
  })

  // Sort by total events (descending)
  chartData.sort((a, b) => {
    const totalA = (a.admin1 || 0) + (a.admin2 || 0)
    const totalB = (b.admin1 || 0) + (b.admin2 || 0)
    return totalB - totalA
  })

  const handleClick = (entry: any, index: number) => {
    if (onAdminClick && index !== undefined) {
      const adminName = data[index]?.administration
      if (adminName) {
        onAdminClick(adminName)
      }
    }
  }

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="category"
            angle={-45}
            textAnchor="end"
            height={100}
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
                    <p className="font-semibold mb-2">{data.category}</p>
                    {payload.map((entry: any, index: number) => (
                      <p key={index} className="text-sm" style={{ color: entry.color }}>
                        {data[`${entry.dataKey}_name`]}: {entry.value}
                      </p>
                    ))}
                  </div>
                )
              }
              return null
            }}
          />
          <Legend
            wrapperStyle={{ paddingTop: '10px' }}
            formatter={(value, entry: any) => {
              const index = parseInt(value.replace('admin', '')) - 1
              return data[index]?.administration || value
            }}
          />
          <Bar
            dataKey="admin1"
            fill={COLORS.admin1}
            onClick={(data, index) => handleClick(data, 0)}
            cursor={onAdminClick ? 'pointer' : 'default'}
          />
          <Bar
            dataKey="admin2"
            fill={COLORS.admin2}
            onClick={(data, index) => handleClick(data, 1)}
            cursor={onAdminClick ? 'pointer' : 'default'}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
