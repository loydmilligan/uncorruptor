import { Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { TagBadge } from './TagBadge'
import { formatDateRange, getAdminPeriodShortLabel } from '@/lib/utils'
import type { Event } from '@/services/api'

interface EventCardProps {
  event: Event
}

export function EventCard({ event }: EventCardProps) {
  // Sort tags with primary first
  const sortedTags = [...event.tags].sort((a, b) => {
    if (a.isPrimary && !b.isPrimary) return -1
    if (!a.isPrimary && b.isPrimary) return 1
    return 0
  })

  return (
    <Link to={`/events/${event.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {getAdminPeriodShortLabel(event.adminPeriod)}
            </span>
          </div>
          <CardDescription className="text-sm">
            {formatDateRange(event.startDate, event.endDate)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {event.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {event.description}
            </p>
          )}
          <div className="flex flex-wrap gap-1.5">
            {sortedTags.map((tag) => (
              <TagBadge key={tag.id} name={tag.name} color={tag.color} isPrimary={tag.isPrimary} />
            ))}
          </div>
          {event._count && event._count.sources > 0 && (
            <p className="text-xs text-muted-foreground mt-3">
              {event._count.sources} source{event._count.sources !== 1 ? 's' : ''}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
