/**
 * AI Service Client
 * API client for AI-powered features (tag suggestions, claim extraction)
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface TagSuggestion {
  tagName: string;
  confidence: number;
  isExisting: boolean;
}

export interface SuggestTagsRequest {
  title: string;
  description?: string;
  apiKey: string;
  model: string;
}

export interface SuggestTagsResponse {
  suggestions: TagSuggestion[];
}

/**
 * Get AI-powered tag suggestions for an event
 */
export async function suggestTags(
  request: SuggestTagsRequest
): Promise<TagSuggestion[]> {
  const response = await fetch(`${API_URL}/ai/suggest-tags`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: 'Failed to get tag suggestions',
    }));
    throw new Error(error.message || 'Failed to get tag suggestions');
  }

  const data: SuggestTagsResponse = await response.json();
  return data.suggestions;
}
