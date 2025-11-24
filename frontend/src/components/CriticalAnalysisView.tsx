import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { getStrengthLabel, getStrengthColor } from './StrengthRatingSelector'
import { cn } from '@/lib/utils'
import type { Event } from '@/services/api'

interface CriticalAnalysisViewProps {
  event: Event
}

export function CriticalAnalysisView({ event }: CriticalAnalysisViewProps) {
  const { counterNarrative } = event

  if (!counterNarrative) {
    return null
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Event Summary (Left Side) */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="text-blue-600">📋</span>
            Event Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-1">Title</h4>
            <p className="font-medium">{event.title}</p>
          </div>

          {event.description && (
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Description</h4>
              <p className="text-sm whitespace-pre-wrap">{event.description}</p>
            </div>
          )}

          {event.sources && event.sources.length > 0 && (
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">
                Sources ({event.sources.length})
              </h4>
              <ul className="text-sm space-y-1">
                {event.sources.slice(0, 3).map((source) => (
                  <li key={source.id} className="truncate">
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {source.articleTitle || source.url}
                    </a>
                  </li>
                ))}
                {event.sources.length > 3 && (
                  <li className="text-muted-foreground">
                    +{event.sources.length - 3} more sources
                  </li>
                )}
              </ul>
            </div>
          )}

          <div className="pt-2 border-t">
            <h4 className="font-medium text-sm text-muted-foreground mb-2">Concern Level</h4>
            <span
              className={cn(
                'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
                getStrengthColor(counterNarrative.concernStrength)
              )}
            >
              {getStrengthLabel(counterNarrative.concernStrength)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Counter-Narrative (Right Side) */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="text-orange-600">⚖️</span>
            Administration&apos;s Position
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-1">Stated Position</h4>
            <p className="text-sm whitespace-pre-wrap">{counterNarrative.narrativeText}</p>
          </div>

          <div className="pt-2 border-t">
            <h4 className="font-medium text-sm text-muted-foreground mb-2">Argument Strength</h4>
            <span
              className={cn(
                'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
                getStrengthColor(counterNarrative.adminStrength)
              )}
            >
              {getStrengthLabel(counterNarrative.adminStrength)}
            </span>
          </div>

          {counterNarrative.sourceRefs && (
            <div className="pt-2 border-t">
              <h4 className="font-medium text-sm text-muted-foreground mb-1">
                Supporting References
              </h4>
              <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                {counterNarrative.sourceRefs}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analysis Summary (Full Width) */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="text-purple-600">📊</span>
            Analysis Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{event.sources?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Sources</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{event.tags?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Tags</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p
                className={cn(
                  'text-xl font-bold capitalize',
                  counterNarrative.adminStrength === 'weak'
                    ? 'text-yellow-600'
                    : counterNarrative.adminStrength === 'moderate'
                      ? 'text-orange-600'
                      : 'text-red-600'
                )}
              >
                {getStrengthLabel(counterNarrative.adminStrength)}
              </p>
              <p className="text-sm text-muted-foreground">Admin Argument</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p
                className={cn(
                  'text-xl font-bold capitalize',
                  counterNarrative.concernStrength === 'weak'
                    ? 'text-yellow-600'
                    : counterNarrative.concernStrength === 'moderate'
                      ? 'text-orange-600'
                      : 'text-red-600'
                )}
              >
                {getStrengthLabel(counterNarrative.concernStrength)}
              </p>
              <p className="text-sm text-muted-foreground">Concern Level</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
