import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, X, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { ExtractedClaim } from '@/hooks/useClaimExtraction';

interface ClaimExtractorProps {
  claims: ExtractedClaim[];
  articleTitle?: string;
  articleExcerpt?: string;
  wordCount?: number;
  wasTruncated?: boolean;
  isLoading: boolean;
  error: string | null;
  onSaveClaims: (selectedClaims: ExtractedClaim[]) => void;
  onCancel: () => void;
  onClose: () => void;
}

const categoryColors: Record<string, string> = {
  FACTUAL_ASSERTION: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  OPINION_ANALYSIS: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  SPECULATION: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
};

const categoryLabels: Record<string, string> = {
  FACTUAL_ASSERTION: 'Factual',
  OPINION_ANALYSIS: 'Opinion',
  SPECULATION: 'Speculation',
};

function getConfidenceColor(score: number): string {
  if (score >= 0.7) return 'bg-green-500';
  if (score >= 0.5) return 'bg-yellow-500';
  return 'bg-orange-500';
}

export function ClaimExtractor({
  claims,
  articleTitle,
  articleExcerpt,
  wordCount,
  wasTruncated,
  isLoading,
  error,
  onSaveClaims,
  onCancel,
  onClose,
}: ClaimExtractorProps) {
  const [selectedClaims, setSelectedClaims] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  const toggleClaim = (claimText: string) => {
    const newSelected = new Set(selectedClaims);
    if (newSelected.has(claimText)) {
      newSelected.delete(claimText);
    } else {
      newSelected.add(claimText);
    }
    setSelectedClaims(newSelected);
  };

  const toggleAll = () => {
    if (selectedClaims.size === claims.length) {
      setSelectedClaims(new Set());
    } else {
      setSelectedClaims(new Set(claims.map(c => c.claimText)));
    }
  };

  const handleSave = async () => {
    const selected = claims.filter(c => selectedClaims.has(c.claimText));
    if (selected.length === 0) return;

    setIsSaving(true);
    try {
      await onSaveClaims(selected);
      onClose();
    } catch (err) {
      console.error('Failed to save claims:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div className="text-center space-y-2">
              <p className="font-medium">Extracting claims from article...</p>
              <p className="text-sm text-muted-foreground">This may take up to 30 seconds</p>
            </div>
            <Button variant="outline" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full border-destructive">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
            <div className="flex-1 space-y-2">
              <p className="font-medium text-destructive">Failed to extract claims</p>
              <p className="text-sm text-muted-foreground">{error}</p>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={onClose}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (claims.length === 0) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Extracted Claims ({claims.length})
            </CardTitle>
            {articleTitle && (
              <CardDescription className="font-medium">{articleTitle}</CardDescription>
            )}
            {(wordCount !== undefined || wasTruncated) && (
              <CardDescription className="text-xs">
                {wordCount && `${wordCount.toLocaleString()} words`}
                {wasTruncated && ' (content truncated for AI processing)'}
              </CardDescription>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {articleExcerpt && (
          <div className="p-3 bg-muted rounded-md">
            <p className="text-sm text-muted-foreground italic">{articleExcerpt}</p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="select-all"
              checked={selectedClaims.size === claims.length && claims.length > 0}
              onCheckedChange={toggleAll}
            />
            <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
              Select all ({selectedClaims.size} of {claims.length})
            </label>
          </div>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={selectedClaims.size === 0 || isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Save Selected
              </>
            )}
          </Button>
        </div>

        <div className="space-y-3">
          {claims.map((claim, index) => (
            <Card
              key={index}
              className={`transition-colors ${
                selectedClaims.has(claim.claimText)
                  ? 'border-primary bg-primary/5'
                  : 'hover:border-muted-foreground/50'
              }`}
            >
              <CardContent className="pt-4 pb-3">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id={`claim-${index}`}
                    checked={selectedClaims.has(claim.claimText)}
                    onCheckedChange={() => toggleClaim(claim.claimText)}
                  />
                  <div className="flex-1 space-y-2">
                    <p className="text-sm leading-relaxed">{claim.claimText}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={categoryColors[claim.category]}>
                        {categoryLabels[claim.category] || claim.category}
                      </Badge>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-muted-foreground">Confidence:</span>
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getConfidenceColor(claim.confidenceScore)}`}
                            style={{ width: `${claim.confidenceScore * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium">
                          {Math.round(claim.confidenceScore * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
