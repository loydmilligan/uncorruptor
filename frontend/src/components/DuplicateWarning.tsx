/**
 * Duplicate Warning Component
 * Shows warning when similar events are found
 */

import { AlertTriangle } from 'lucide-react'
import { Link } from 'react-router-dom'

interface DuplicateEvent {
  id: string
  title: string
  startDate: string
}

interface DuplicateWarningProps {
  duplicates: DuplicateEvent[]
}

export function DuplicateWarning({ duplicates }: DuplicateWarningProps) {
  if (duplicates.length === 0) return null

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-yellow-800 mb-1">
            Possible Duplicate Events Found
          </h3>
          <p className="text-sm text-yellow-700 mb-3">
            We found {duplicates.length} similar event{duplicates.length > 1 ? 's' : ''} with matching title and date:
          </p>
          <ul className="space-y-2">
            {duplicates.map((event) => (
              <li key={event.id} className="text-sm">
                <Link
                  to={`/events/${event.id}`}
                  className="text-blue-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {event.title} ({event.startDate})
                </Link>
              </li>
            ))}
          </ul>
          <p className="text-xs text-yellow-700 mt-3">
            Please review these events before creating a new one to avoid duplicates.
          </p>
        </div>
      </div>
    </div>
  )
}
