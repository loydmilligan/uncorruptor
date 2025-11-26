/**
 * Tag Suggestion Service
 * AI-powered tag suggestions for events using OpenRouter API
 */

import { createAIService } from './ai.js';

export interface TagSuggestion {
  tagName: string;
  confidence: number;
  isExisting: boolean;
}

export interface SuggestTagsRequest {
  title: string;
  description?: string;
  existingTags: string[];
  apiKey: string;
  model: string;
}

/**
 * Generate tag suggestions using AI
 */
export async function suggestTags(
  request: SuggestTagsRequest
): Promise<TagSuggestion[]> {
  const { title, description, existingTags, apiKey, model } = request;

  // Create AI service instance
  const aiService = createAIService(apiKey, model);

  // Build system prompt
  const systemPrompt = buildSystemPrompt(existingTags);

  // Build user prompt
  const userPrompt = buildUserPrompt(title, description);

  try {
    // Get AI response
    const response = await aiService.chatCompletion(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      {
        temperature: 0.7,
        maxTokens: 500,
      }
    );

    // Parse JSON response
    const parsed = aiService.parseJsonResponse<{
      suggestions: Array<{ tag: string; confidence: number }>;
    }>(response);

    if (!parsed.suggestions || !Array.isArray(parsed.suggestions)) {
      throw new Error('Invalid AI response format: missing suggestions array');
    }

    // Match suggestions against existing tags and format response
    const suggestions: TagSuggestion[] = parsed.suggestions
      .slice(0, 5) // Limit to 5 suggestions
      .map((s) => {
        const tagName = normalizeTagName(s.tag);
        const isExisting = matchesExistingTag(tagName, existingTags);

        return {
          tagName: isExisting ? findExactMatch(tagName, existingTags)! : tagName,
          confidence: Math.max(0, Math.min(1, s.confidence)), // Clamp to 0-1
          isExisting,
        };
      })
      .filter((s) => s.tagName.length > 0); // Remove empty tags

    return suggestions;
  } catch (error) {
    // Re-throw AI service errors
    throw error;
  }
}

/**
 * Build system prompt for tag suggestions
 */
function buildSystemPrompt(existingTags: string[]): string {
  const tagList =
    existingTags.length > 0
      ? existingTags.map((t) => `"${t}"`).join(', ')
      : 'corruption, breaking-norms, nepotism, dishonesty, incompetence';

  return `You are a political accountability analyst helping categorize government events with relevant tags.

Your task is to suggest 3-5 relevant tags for an event based on its title and description.

AVAILABLE TAGS (prefer these if applicable):
${tagList}

GUIDELINES:
1. Suggest 3-5 tags total
2. Prioritize tags from the available list above if they match
3. Tags should be lowercase, hyphenated (e.g., "breaking-norms")
4. Each tag should capture a key aspect: corruption type, policy area, or norm violation
5. Assign confidence scores (0.0-1.0) based on how well the tag fits
6. Only suggest new tags if no existing tags fit well

RESPONSE FORMAT (JSON only, no markdown):
{
  "suggestions": [
    {"tag": "corruption", "confidence": 0.95},
    {"tag": "nepotism", "confidence": 0.80}
  ]
}`;
}

/**
 * Build user prompt with event context
 */
function buildUserPrompt(title: string, description?: string): string {
  if (description && description.trim()) {
    return `Event Title: ${title}

Event Description: ${description}

Suggest 3-5 relevant tags for this event.`;
  } else {
    return `Event Title: ${title}

Suggest 3-5 relevant tags for this event based on the title.`;
  }
}

/**
 * Normalize tag name to lowercase hyphenated format
 */
function normalizeTagName(tag: string): string {
  return tag
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Check if a tag matches an existing tag (case-insensitive, fuzzy)
 */
function matchesExistingTag(tagName: string, existingTags: string[]): boolean {
  const normalized = tagName.toLowerCase();

  return existingTags.some((existing) => {
    const existingNormalized = existing.toLowerCase();

    // Exact match
    if (normalized === existingNormalized) {
      return true;
    }

    // Fuzzy match: check if one contains the other
    if (
      normalized.includes(existingNormalized) ||
      existingNormalized.includes(normalized)
    ) {
      return true;
    }

    return false;
  });
}

/**
 * Find exact matching tag from existing tags list
 */
function findExactMatch(
  tagName: string,
  existingTags: string[]
): string | null {
  const normalized = tagName.toLowerCase();

  for (const existing of existingTags) {
    const existingNormalized = existing.toLowerCase();

    if (normalized === existingNormalized) {
      return existing; // Return with original casing
    }

    if (
      normalized.includes(existingNormalized) ||
      existingNormalized.includes(normalized)
    ) {
      return existing; // Return with original casing
    }
  }

  return null;
}
