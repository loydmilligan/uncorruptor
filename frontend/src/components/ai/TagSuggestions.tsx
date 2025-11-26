/**
 * TagSuggestions Component
 * Displays AI-powered tag suggestions with confidence scores and one-click addition
 */

import { AlertCircle, CheckCircle, Loader2, Sparkles, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import type { TagSuggestion } from '../../services/aiService';

interface TagSuggestionsProps {
  suggestions: TagSuggestion[];
  isLoading: boolean;
  error: string | null;
  onAddTag: (tagName: string) => void;
  onCancel: () => void;
  onClose: () => void;
}

export function TagSuggestions({
  suggestions,
  isLoading,
  error,
  onAddTag,
  onCancel,
  onClose,
}: TagSuggestionsProps) {
  // Don't render if not loading and no suggestions or error
  if (!isLoading && suggestions.length === 0 && !error) {
    return null;
  }

  return (
    <div className="border rounded-lg p-4 bg-card space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-medium">AI Tag Suggestions</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Getting AI suggestions...</span>
          </div>
          <Button variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <div className="flex-1 text-sm">{error}</div>
        </div>
      )}

      {/* Suggestions List */}
      {!isLoading && suggestions.length > 0 && (
        <div className="space-y-2">
          {suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion.tagName}-${index}`}
              className="flex items-center justify-between p-3 rounded-lg border bg-background hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <Badge variant="outline" className="font-mono text-xs">
                  {suggestion.tagName}
                </Badge>

                {/* Confidence Score */}
                <div className="flex items-center gap-1.5">
                  <div className="text-xs text-muted-foreground">Confidence:</div>
                  <div className="flex items-center gap-1">
                    <div
                      className="h-1.5 w-16 bg-muted rounded-full overflow-hidden"
                      title={`${Math.round(suggestion.confidence * 100)}%`}
                    >
                      <div
                        className={`h-full ${
                          suggestion.confidence >= 0.7
                            ? 'bg-green-500'
                            : suggestion.confidence >= 0.5
                            ? 'bg-yellow-500'
                            : 'bg-orange-500'
                        }`}
                        style={{ width: `${suggestion.confidence * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium">
                      {Math.round(suggestion.confidence * 100)}%
                    </span>
                  </div>
                </div>

                {/* Existing Tag Indicator */}
                {suggestion.isExisting && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <CheckCircle className="h-3 w-3" />
                    <span>Existing</span>
                  </div>
                )}
              </div>

              {/* Add Button */}
              <Button
                size="sm"
                variant="outline"
                onClick={() => onAddTag(suggestion.tagName)}
              >
                Add
              </Button>
            </div>
          ))}

          <p className="text-xs text-muted-foreground pt-2">
            Click "Add" to add a suggested tag to your event. Existing tags will be matched
            automatically.
          </p>
        </div>
      )}
    </div>
  );
}
