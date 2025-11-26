import { useState } from 'react'
import { BiasRatingBadge, BiasScale } from './BiasRatingBadge'
import { SourceForm } from './SourceForm'
import { ClaimExtractor } from './ai/ClaimExtractor'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useCreateSource, useUpdateSource, useDeleteSource } from '@/hooks/useSources'
import { useCreateCounterNarrativeSource, useUpdateCounterNarrativeSource, useDeleteCounterNarrativeSource } from '@/hooks/useCounterNarrativeSources'
import { useClaimExtraction } from '@/hooks/useClaimExtraction'
import { claimsApi } from '@/services/api'
import { EmptySourcesState } from './EmptyState'
import { cn } from '@/lib/utils'
import { Sparkles } from 'lucide-react'
import type { Source } from '@/services/api'

interface SourceListProps {
  eventId: string
  counterNarrativeId?: string
  sources: Source[]
  isLoading?: boolean
  isCounterNarrative?: boolean
}

export function SourceList({ eventId, counterNarrativeId, sources, isLoading, isCounterNarrative = false }: SourceListProps) {
  const [isAddingSource, setIsAddingSource] = useState(false)
  const [editingSourceId, setEditingSourceId] = useState<string | null>(null)
  const [extractingSourceId, setExtractingSourceId] = useState<string | null>(null)

  // Claim extraction hook
  const { result, isLoading: isExtracting, error: extractError, extractClaims, cancel, reset } = useClaimExtraction()

  // Use different hooks based on source type
  const createEventSource = useCreateSource(eventId)
  const updateEventSource = useUpdateSource(eventId)
  const deleteEventSource = useDeleteSource(eventId)

  const createCNSource = useCreateCounterNarrativeSource(eventId, counterNarrativeId || '')
  const updateCNSource = useUpdateCounterNarrativeSource(eventId, counterNarrativeId || '')
  const deleteCNSource = useDeleteCounterNarrativeSource(eventId, counterNarrativeId || '')

  // Select the appropriate hooks based on source type
  const createSource = isCounterNarrative ? createCNSource : createEventSource
  const updateSource = isCounterNarrative ? updateCNSource : updateEventSource
  const deleteSource = isCounterNarrative ? deleteCNSource : deleteEventSource

  const handleCreate = async (data: { url: string; articleTitle?: string; biasRating: number; publicationId?: string }) => {
    try {
      await createSource.mutateAsync(data)
      setIsAddingSource(false)
    } catch (err) {
      console.error('Failed to create source:', err)
    }
  }

  const handleUpdate = async (sourceId: string, data: { url: string; articleTitle?: string; biasRating: number }) => {
    try {
      await updateSource.mutateAsync({ sourceId, data })
      setEditingSourceId(null)
    } catch (err) {
      console.error('Failed to update source:', err)
    }
  }

  const handleDelete = async (sourceId: string) => {
    if (!confirm('Are you sure you want to delete this source?')) return
    try {
      await deleteSource.mutateAsync(sourceId)
    } catch (err) {
      console.error('Failed to delete source:', err)
    }
  }

  const handleToggleArchive = async (source: Source) => {
    try {
      await updateSource.mutateAsync({
        sourceId: source.id,
        data: { isArchived: !source.isArchived },
      })
    } catch (err) {
      console.error('Failed to toggle archive:', err)
    }
  }

  const handleExtractClaims = async (source: Source) => {
    setExtractingSourceId(source.id)
    try {
      await extractClaims(source.url, source.articleTitle || undefined, true)
    } catch (err) {
      console.error('Failed to extract claims:', err)
    }
  }

  const handleSaveClaims = async (claims: Array<{ claimText: string; category: string; confidenceScore: number }>) => {
    if (!extractingSourceId) return

    try {
      // Save claims to database
      await claimsApi.createBulk(extractingSourceId, claims)
      setExtractingSourceId(null)
      reset()
    } catch (err) {
      console.error('Failed to save claims:', err)
      throw err // Re-throw to show error in UI
    }
  }

  const handleCancelExtraction = () => {
    cancel()
    setExtractingSourceId(null)
    reset()
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2].map((i) => (
          <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Claim Extractor */}
      {extractingSourceId && (
        <ClaimExtractor
          claims={result?.claims || []}
          articleTitle={result?.articleTitle}
          articleExcerpt={result?.articleExcerpt}
          wordCount={result?.wordCount}
          wasTruncated={result?.wasTruncated}
          isLoading={isExtracting}
          error={extractError}
          onSaveClaims={handleSaveClaims}
          onCancel={handleCancelExtraction}
          onClose={handleCancelExtraction}
        />
      )}

      {/* Source list */}
      {sources.length > 0 ? (
        <div className="space-y-3">
          {sources.map((source) => (
            <Card
              key={source.id}
              className={cn(
                source.isArchived && 'opacity-60',
                isCounterNarrative && 'border-l-4 border-l-amber-500 dark:border-l-amber-600'
              )}
            >
              <CardContent className="p-4">
                {editingSourceId === source.id ? (
                  <SourceForm
                    source={source}
                    onSubmit={(data) => handleUpdate(source.id, data)}
                    onCancel={() => setEditingSourceId(null)}
                    isSubmitting={updateSource.isPending}
                  />
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-primary hover:underline line-clamp-1"
                        >
                          {source.articleTitle || source.url}
                        </a>
                        {source.publication && (
                          <p className="text-xs text-muted-foreground">
                            {source.publication.name}
                            {source.publication.credibility && ` (${source.publication.credibility})`}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <BiasRatingBadge rating={source.biasRating} size="sm" />
                        {source.isArchived && (
                          <span className="text-xs text-muted-foreground">(archived)</span>
                        )}
                      </div>
                    </div>
                    <BiasScale rating={source.biasRating} className="max-w-xs" />
                    <div className="flex gap-2 pt-1 flex-wrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleExtractClaims(source)}
                        className="text-purple-600 dark:text-purple-400"
                      >
                        <Sparkles className="h-4 w-4 mr-1" />
                        Extract Claims
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingSourceId(source.id)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleArchive(source)}
                      >
                        {source.isArchived ? 'Restore' : 'Archive'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(source.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !isAddingSource ? (
        <EmptySourcesState />
      ) : null}

      {/* Add source form */}
      {isAddingSource ? (
        <Card>
          <CardContent className="p-4">
            <SourceForm
              onSubmit={handleCreate}
              onCancel={() => setIsAddingSource(false)}
              isSubmitting={createSource.isPending}
            />
          </CardContent>
        </Card>
      ) : (
        <Button
          variant="outline"
          onClick={() => setIsAddingSource(true)}
          className="w-full"
        >
          + Add Source
        </Button>
      )}
    </div>
  )
}
