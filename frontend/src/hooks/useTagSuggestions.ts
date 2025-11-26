/**
 * useTagSuggestions Hook
 * React hook for fetching AI-powered tag suggestions
 */

import { useState, useCallback } from 'react';
import { suggestTags, type TagSuggestion } from '../services/aiService';
import { useSettings } from './useSettings';

export interface UseTagSuggestionsReturn {
  suggestions: TagSuggestion[];
  isLoading: boolean;
  error: string | null;
  getSuggestions: (title: string, description?: string) => Promise<void>;
  cancel: () => void;
  reset: () => void;
}

/**
 * Hook for fetching AI-powered tag suggestions
 */
export function useTagSuggestions(): UseTagSuggestionsReturn {
  const { aiSettings } = useSettings();
  const [suggestions, setSuggestions] = useState<TagSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const getSuggestions = useCallback(
    async (title: string, description?: string) => {
      // Validate API key is configured
      if (!aiSettings.apiKey || aiSettings.apiKey.trim() === '') {
        setError('Please configure your OpenRouter API key in Settings');
        return;
      }

      // Reset state
      setError(null);
      setSuggestions([]);
      setIsLoading(true);

      // Create abort controller for cancellation
      const controller = new AbortController();
      setAbortController(controller);

      try {
        const results = await suggestTags({
          title,
          description,
          apiKey: aiSettings.apiKey,
          model: aiSettings.model,
        });

        // Only update if not aborted
        if (!controller.signal.aborted) {
          setSuggestions(results);
          setIsLoading(false);
        }
      } catch (err) {
        // Only update if not aborted
        if (!controller.signal.aborted) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to get tag suggestions';
          setError(errorMessage);
          setIsLoading(false);
        }
      }
    },
    [aiSettings]
  );

  const cancel = useCallback(() => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
    setIsLoading(false);
    setError(null);
  }, [abortController]);

  const reset = useCallback(() => {
    setSuggestions([]);
    setError(null);
    setIsLoading(false);
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
  }, [abortController]);

  return {
    suggestions,
    isLoading,
    error,
    getSuggestions,
    cancel,
    reset,
  };
}
