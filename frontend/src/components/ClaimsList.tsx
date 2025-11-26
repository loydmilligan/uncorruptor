import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import type { Claim } from '@/services/api';

interface ClaimsListProps {
  claims: Claim[];
  onDelete?: (claimId: string) => void;
  isDeletingId?: string | null;
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

export function ClaimsList({ claims, onDelete, isDeletingId }: ClaimsListProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (claims.length === 0) {
    return null;
  }

  const displayClaims = isExpanded ? claims : claims.slice(0, 2);
  const hasMore = claims.length > 2;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h5 className="text-xs font-medium text-muted-foreground">
          Extracted Claims ({claims.length})
        </h5>
        {hasMore && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 text-xs"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-3 w-3 mr-1" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3 mr-1" />
                Show All ({claims.length})
              </>
            )}
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {displayClaims.map((claim) => (
          <Card key={claim.id} className="bg-muted/30">
            <CardContent className="p-3">
              <div className="space-y-2">
                <p className="text-xs leading-relaxed">{claim.claimText}</p>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Badge className={categoryColors[claim.category]} style={{ fontSize: '0.65rem', padding: '0.125rem 0.375rem' }}>
                      {categoryLabels[claim.category] || claim.category}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <span className="text-[0.65rem] text-muted-foreground">Confidence:</span>
                      <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getConfidenceColor(claim.confidenceScore)}`}
                          style={{ width: `${claim.confidenceScore * 100}%` }}
                        />
                      </div>
                      <span className="text-[0.65rem] font-medium">
                        {Math.round(claim.confidenceScore * 100)}%
                      </span>
                    </div>
                  </div>
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(claim.id)}
                      disabled={isDeletingId === claim.id}
                      className="h-6 px-2 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
