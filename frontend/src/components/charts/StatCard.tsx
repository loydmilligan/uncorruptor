/**
 * Stat Card Component
 * Display a single statistic with label and optional icon
 */

import { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: string | number
  icon?: ReactNode
  subtitle?: string
  onClick?: () => void
}

export function StatCard({ label, value, icon, subtitle, onClick }: StatCardProps) {
  const cardClasses = `
    bg-white border border-gray-200 rounded-lg p-6 shadow-sm
    ${onClick ? 'cursor-pointer hover:shadow-md hover:border-blue-300 transition-all' : ''}
  `

  return (
    <div className={cardClasses} onClick={onClick}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600">{label}</span>
        {icon && <span className="text-gray-400">{icon}</span>}
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      {subtitle && <div className="text-sm text-gray-500">{subtitle}</div>}
    </div>
  )
}
