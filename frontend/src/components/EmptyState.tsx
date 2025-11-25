/**
 * Empty State Component
 * Displays friendly messages when lists are empty
 */

import { ReactNode } from 'react'
import { FileText, Search, Tag, ExternalLink } from 'lucide-react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
        {icon || <FileText className="w-8 h-8 text-gray-400" />}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-center mb-6 max-w-md">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

// Preset empty states for common scenarios
export function EmptyEventsState({ onCreate }: { onCreate?: () => void }) {
  return (
    <EmptyState
      icon={<FileText className="w-8 h-8 text-gray-400" />}
      title="No events yet"
      description="Get started by creating your first accountability event to track important moments."
      action={
        onCreate
          ? {
              label: 'Create First Event',
              onClick: onCreate,
            }
          : undefined
      }
    />
  )
}

export function EmptySearchState({ onClear }: { onClear?: () => void }) {
  return (
    <EmptyState
      icon={<Search className="w-8 h-8 text-gray-400" />}
      title="No results found"
      description="Try adjusting your search criteria or filters to find what you're looking for."
      action={
        onClear
          ? {
              label: 'Clear Filters',
              onClick: onClear,
            }
          : undefined
      }
    />
  )
}

export function EmptyTagsState({ onCreate }: { onCreate?: () => void }) {
  return (
    <EmptyState
      icon={<Tag className="w-8 h-8 text-gray-400" />}
      title="No tags yet"
      description="Create custom tags to organize and categorize your events."
      action={
        onCreate
          ? {
              label: 'Create First Tag',
              onClick: onCreate,
            }
          : undefined
      }
    />
  )
}

export function EmptySourcesState() {
  return (
    <EmptyState
      icon={<ExternalLink className="w-8 h-8 text-gray-400" />}
      title="No sources yet"
      description="Add sources to this event to provide evidence and references."
    />
  )
}
