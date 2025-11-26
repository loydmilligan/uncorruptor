import { useState, useRef } from 'react';
import { SettingsStorage } from '@/lib/storage';

export interface ExtractedClaim {
  claimText: string;
  category: 'FACTUAL_ASSERTION' | 'OPINION_ANALYSIS' | 'SPECULATION';
  confidenceScore: number;
}

export interface ExtractionResult {
  claims: ExtractedClaim[];
  articleTitle: string;
  articleExcerpt?: string;
  wordCount: number;
  wasTruncated: boolean;
}

export interface UseClaimExtractionReturn {
  result: ExtractionResult | null;
  isLoading: boolean;
  error: string | null;
  extractClaims: (url: string, articleTitle?: string, includeDomainContext?: boolean) => Promise<void>;
  cancel: () => void;
  reset: () => void;
}

export function useClaimExtraction(): UseClaimExtractionReturn {
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const extractClaims = async (
    url: string,
    articleTitle?: string,
    includeDomainContext: boolean = true
  ) => {
    // Cancel any existing request only if one is in flight
    if (abortControllerRef.current && isLoading) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // Clean up any previous state
    setError(null);
    setResult(null);

    // Create new abort controller
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);

    try {
      // Get AI settings from SettingsStorage
      const settings = SettingsStorage.getAISettings();
      if (!settings.apiKey || settings.apiKey.trim() === '') {
        throw new Error('AI settings not configured. Please configure your API key in settings.');
      }

      // Call AI extraction endpoint
      const response = await fetch('http://192.168.5.255:3001/api/ai/extract-claims', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          articleTitle,
          apiKey: settings.apiKey,
          model: settings.model,
          includeDomainContext,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error?.message || `Failed to extract claims: ${response.statusText}`
        );
      }

      const data = await response.json();

      if (!data.success || !data.data) {
        throw new Error('Invalid response from server');
      }

      setResult(data.data);
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        // Request was cancelled, don't update error state
        return;
      }

      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Claim extraction error:', err);
    } finally {
      if (abortControllerRef.current === controller) {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    }
  };

  const cancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  };

  const reset = () => {
    // Only cancel if there's actually a request in flight
    if (isLoading && abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = null;
    setIsLoading(false);
    setResult(null);
    setError(null);
  };

  return {
    result,
    isLoading,
    error,
    extractClaims,
    cancel,
    reset,
  };
}
