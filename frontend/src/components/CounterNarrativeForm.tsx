import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { StrengthRatingSelector } from './StrengthRatingSelector'
import type { CounterNarrative } from '@/services/api'

type StrengthRating = 'weak' | 'moderate' | 'strong'

interface CounterNarrativeFormProps {
  counterNarrative?: CounterNarrative | null
  onSubmit: (data: {
    narrativeText: string
    adminStrength: string
    concernStrength: string
    sourceRefs?: string
  }) => void
  onCancel: () => void
  isSubmitting?: boolean
}

export function CounterNarrativeForm({
  counterNarrative,
  onSubmit,
  onCancel,
  isSubmitting,
}: CounterNarrativeFormProps) {
  const [narrativeText, setNarrativeText] = useState(counterNarrative?.narrativeText || '')
  const [adminStrength, setAdminStrength] = useState<StrengthRating | undefined>(
    counterNarrative?.adminStrength as StrengthRating | undefined
  )
  const [concernStrength, setConcernStrength] = useState<StrengthRating | undefined>(
    counterNarrative?.concernStrength as StrengthRating | undefined
  )
  const [sourceRefs, setSourceRefs] = useState(counterNarrative?.sourceRefs || '')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (counterNarrative) {
      setNarrativeText(counterNarrative.narrativeText)
      setAdminStrength(counterNarrative.adminStrength as StrengthRating)
      setConcernStrength(counterNarrative.concernStrength as StrengthRating)
      setSourceRefs(counterNarrative.sourceRefs || '')
    }
  }, [counterNarrative])

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!narrativeText.trim()) {
      newErrors.narrativeText = 'Narrative text is required'
    } else if (narrativeText.length > 10000) {
      newErrors.narrativeText = 'Narrative must be 10000 characters or less'
    }

    if (!adminStrength) {
      newErrors.adminStrength = 'Admin argument strength is required'
    }

    if (!concernStrength) {
      newErrors.concernStrength = 'Concern strength is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate() && adminStrength && concernStrength) {
      onSubmit({
        narrativeText: narrativeText.trim(),
        adminStrength,
        concernStrength,
        sourceRefs: sourceRefs.trim() || undefined,
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="narrativeText">Administration&apos;s Position *</Label>
        <Textarea
          id="narrativeText"
          value={narrativeText}
          onChange={(e) => setNarrativeText(e.target.value)}
          placeholder="Describe the administration's stated position or justification for this event..."
          rows={5}
          className={errors.narrativeText ? 'border-destructive' : ''}
        />
        {errors.narrativeText && <p className="text-sm text-destructive">{errors.narrativeText}</p>}
        <p className="text-xs text-muted-foreground">
          {narrativeText.length}/10000 characters
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <StrengthRatingSelector
            value={adminStrength}
            onChange={setAdminStrength}
            label="Administration Argument Strength *"
          />
          {errors.adminStrength && <p className="text-sm text-destructive">{errors.adminStrength}</p>}
          <p className="text-xs text-muted-foreground">
            How strong is the administration&apos;s argument?
          </p>
        </div>

        <div className="space-y-2">
          <StrengthRatingSelector
            value={concernStrength}
            onChange={setConcernStrength}
            label="Concern Level *"
          />
          {errors.concernStrength && <p className="text-sm text-destructive">{errors.concernStrength}</p>}
          <p className="text-xs text-muted-foreground">
            How concerning is this event overall?
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="sourceRefs">Supporting References (optional)</Label>
        <Textarea
          id="sourceRefs"
          value={sourceRefs}
          onChange={(e) => setSourceRefs(e.target.value)}
          placeholder="Add any additional context, references, or links that support the counter-narrative analysis..."
          rows={3}
        />
        <p className="text-xs text-muted-foreground">
          Include any references that support or contradict the administration&apos;s position
        </p>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : counterNarrative ? 'Update' : 'Add Counter-Narrative'}
        </Button>
      </div>
    </form>
  )
}
