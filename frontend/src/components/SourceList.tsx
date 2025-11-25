import { useState } from 'react'
import { BiasRatingBadge, BiasScale } from './BiasRatingBadge'
import { SourceForm } from './SourceForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useCreateSource, useUpdateSource, useDeleteSource } from '@/hooks/useSources'
import { EmptySourcesState } from './EmptyState'
import type { Source } from '@/services/api'

interface SourceListProps {
  eventId: string
  sources: Source[]
  isLoading?: boolean
}

export function SourceList({ eventId, sources, isLoading }: SourceListProps) {
  const [isAddingSource, setIsAddingSource] = useState(false)
  const [editingSourceId, setEditingSourceId] = useState<string | null>(null)

  const createSource = useCreateSource(eventId)
  const updateSource = useUpdateSource(eventId)
  const deleteSource = useDeleteSource(eventId)

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
      {/* Source list */}
      {sources.length > 0 ? (
        <div className="space-y-3">
          {sources.map((source) => (
            <Card key={source.id} className={source.isArchived ? 'opacity-60' : ''}>
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
                    <div className="flex gap-2 pt-1">
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
