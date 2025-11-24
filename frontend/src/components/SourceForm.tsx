import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { BiasRatingSelector } from './BiasRatingSelector'
import { usePublicationLookup, extractDomain } from '@/hooks/usePublications'
import type { Source } from '@/services/api'

interface SourceFormProps {
  source?: Source | null
  onSubmit: (data: { url: string; articleTitle?: string; biasRating: number; publicationId?: string }) => void
  onCancel: () => void
  isSubmitting?: boolean
}

export function SourceForm({ source, onSubmit, onCancel, isSubmitting }: SourceFormProps) {
  const [url, setUrl] = useState(source?.url || '')
  const [articleTitle, setArticleTitle] = useState(source?.articleTitle || '')
  const [biasRating, setBiasRating] = useState(source?.biasRating ?? 0)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Extract domain for publication lookup
  const domain = extractDomain(url)
  const { data: publicationData } = usePublicationLookup(domain || undefined)
  const suggestedPublication = publicationData?.data

  // Auto-fill bias rating from publication if no source exists (new source)
  useEffect(() => {
    if (!source && suggestedPublication && biasRating === 0) {
      setBiasRating(suggestedPublication.defaultBias)
    }
  }, [suggestedPublication, source, biasRating])

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!url.trim()) {
      newErrors.url = 'URL is required'
    } else {
      try {
        new URL(url)
      } catch {
        newErrors.url = 'Must be a valid URL'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      onSubmit({
        url: url.trim(),
        articleTitle: articleTitle.trim() || undefined,
        biasRating,
        publicationId: suggestedPublication?.id,
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="url">Source URL *</Label>
        <Input
          id="url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/article"
          className={errors.url ? 'border-destructive' : ''}
        />
        {errors.url && <p className="text-sm text-destructive">{errors.url}</p>}
        {suggestedPublication && (
          <p className="text-sm text-muted-foreground">
            Detected: <span className="font-medium">{suggestedPublication.name}</span>
            {suggestedPublication.credibility && (
              <span className="ml-1">({suggestedPublication.credibility} credibility)</span>
            )}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="articleTitle">Article Title</Label>
        <Input
          id="articleTitle"
          value={articleTitle}
          onChange={(e) => setArticleTitle(e.target.value)}
          placeholder="Optional - title of the article"
        />
      </div>

      <div className="space-y-2">
        <Label>Bias Rating *</Label>
        <BiasRatingSelector value={biasRating} onChange={setBiasRating} />
        {suggestedPublication && suggestedPublication.defaultBias !== biasRating && (
          <p className="text-xs text-muted-foreground">
            Note: {suggestedPublication.name} typically rated at {suggestedPublication.defaultBias > 0 ? '+' : ''}{suggestedPublication.defaultBias}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : source ? 'Update Source' : 'Add Source'}
        </Button>
      </div>
    </form>
  )
}
