import { useState, useEffect } from 'react'
import { BiasRatingBadge, BiasScale } from './BiasRatingBadge'
import { SourceForm } from './SourceForm'
import { ClaimExtractor } from './ai/ClaimExtractor'
import { ClaimsList } from './ClaimsList'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useCreateSource, useUpdateSource, useDeleteSource } from '@/hooks/useSources'
import { useCreateCounterNarrativeSource, useUpdateCounterNarrativeSource, useDeleteCounterNarrativeSource } from '@/hooks/useCounterNarrativeSources'
import { useClaimExtraction } from '@/hooks/useClaimExtraction'
import { claimsApi } from '@/services/api'
import { EmptySourcesState } from './EmptyState'
import { cn } from '@/lib/utils'
import { Sparkles, CheckCircle, AlertCircle } from 'lucide-react'
import type { Source, Claim } from '@/services/api'

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
  const [savedClaims, setSavedClaims] = useState<Record<string, Claim[]>>({})
  const [loadingClaims, setLoadingClaims] = useState<Record<string, boolean>>({})
  const [deletingClaimId, setDeletingClaimId] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Claim extraction hook
  const { result, isLoading: isExtracting, error: extractError, extractClaims, cancel, reset } = useClaimExtraction()

  // Fetch claims for all sources
  useEffect(() => {
    const fetchClaimsForSources = async () => {
      for (const source of sources) {
        if (!savedClaims[source.id] && !loadingClaims[source.id]) {
          setLoadingClaims(prev => ({ ...prev, [source.id]: true }))
          try {
            const response = await claimsApi.list({ sourceId: source.id })
            setSavedClaims(prev => ({ ...prev, [source.id]: response.data }))
          } catch (err) {
            console.error(`Failed to fetch claims for source ${source.id}:`, err)
          } finally {
            setLoadingClaims(prev => ({ ...prev, [source.id]: false }))
          }
        }
      }
    }
    fetchClaimsForSources()
  }, [sources.map(s => s.id).join(',')]) // Only re-run when source IDs change

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
    // Close any currently open extractor and reset state
    if (extractingSourceId) {
      reset()
    }

    setExtractingSourceId(source.id)
    try {
      await extractClaims(source.url, source.articleTitle || undefined, true)
    } catch (err) {
      console.error('Failed to extract claims:', err)
      // Reset state on error
      setExtractingSourceId(null)
      reset()
    }
  }

  const handleSaveClaims = async (claims: Array<{ claimText: string; category: string; confidenceScore: number }>) => {
    if (!extractingSourceId) return

    try {
      // Save claims to database
      await claimsApi.createBulk(extractingSourceId, claims)

      // Refresh claims for this source
      const response = await claimsApi.list({ sourceId: extractingSourceId })
      setSavedClaims(prev => ({ ...prev, [extractingSourceId]: response.data }))

      // Show success message
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)

      // Close extractor
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

  const handleDeleteClaim = async (claimId: string, sourceId: string) => {
    if (!confirm('Are you sure you want to delete this claim?')) return

    setDeletingClaimId(claimId)
    try {
      await claimsApi.delete(claimId)
      // Refresh claims for this source
      const response = await claimsApi.list({ sourceId })
      setSavedClaims(prev => ({ ...prev, [sourceId]: response.data }))
    } catch (err) {
      console.error('Failed to delete claim:', err)
    } finally {
      setDeletingClaimId(null)
    }
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
      {/* Success Message */}
      {saveSuccess && (
        <Card className="border-green-500 bg-green-50 dark:bg-green-950">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Claims saved successfully!</span>
            </div>
          </CardContent>
        </Card>
      )}

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

                    {/* Display saved claims */}
                    {savedClaims[source.id] && savedClaims[source.id].length > 0 && (
                      <div className="mt-3">
                        <ClaimsList
                          claims={savedClaims[source.id]}
                          onDelete={(claimId) => handleDeleteClaim(claimId, source.id)}
                          isDeletingId={deletingClaimId}
                        />
                      </div>
                    )}

                    <div className="flex gap-2 pt-1 flex-wrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleExtractClaims(source)}
                        className="text-purple-600 dark:text-purple-400"
                        disabled={extractingSourceId === source.id}
                      >
                        <Sparkles className="h-4 w-4 mr-1" />
                        {savedClaims[source.id] && savedClaims[source.id].length > 0 ? 'Re-extract' : 'Extract Claims'}
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
