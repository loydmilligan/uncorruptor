/**
 * Claim Extraction Service
 * Uses AI to extract and categorize verifiable claims from article content
 */

import { createAIService } from './ai.js';
import { fetchAndParse, summarizeContent, PaywallError } from './articleParser.js';
import { ClaimCategory } from '@prisma/client';

export interface ExtractClaimsRequest {
  url: string;
  articleTitle?: string;
  domainContext?: {
    normalizedDomain: string;
    avgBiasRating?: number;
    totalSources?: number;
  };
  apiKey: string;
  model: string;
}

export interface ExtractedClaim {
  claimText: string;
  category: ClaimCategory;
  confidenceScore: number;
}

export interface ExtractionResult {
  claims: ExtractedClaim[];
  articleTitle: string;
  articleExcerpt?: string;
  wordCount: number;
  wasTruncated: boolean;
}

/**
 * Build system prompt for claim extraction
 */
function buildSystemPrompt(): string {
  return `You are an expert fact-checker and claim analyst for an accountability tracking system.

Your task is to extract verifiable claims from news articles and categorize them.

**Claim Categories:**
1. FACTUAL_ASSERTION - Objective statements that can be verified through evidence, data, or records
   - Examples: "The unemployment rate rose to 5.2%", "The bill was passed on January 15th"

2. OPINION_ANALYSIS - Subjective interpretations, predictions, or value judgments
   - Examples: "This policy will benefit the economy", "The decision was poorly timed"

3. SPECULATION - Forward-looking statements, hypotheticals, or unverified possibilities
   - Examples: "Officials are considering new regulations", "Sources suggest a change may occur"

**Instructions:**
- Extract 3-10 key claims from the article
- Focus on claims about administration actions, policies, or accountability issues
- Each claim should be a complete, standalone statement
- Assign a confidence score (0.0-1.0) based on:
  * Clarity of the claim (0.3)
  * Verifiability (0.4)
  * Significance to accountability (0.3)
- Prioritize claims that are:
  * Directly relevant to government accountability
  * Clearly stated in the article
  * Verifiable through public records or evidence

**Output Format:**
Return a JSON array of claims with this exact structure:
\`\`\`json
[
  {
    "claimText": "The exact claim as stated or paraphrased from article",
    "category": "FACTUAL_ASSERTION" | "OPINION_ANALYSIS" | "SPECULATION",
    "confidenceScore": 0.85
  }
]
\`\`\`

Return ONLY the JSON array, no additional text or explanation.`;
}

/**
 * Build user prompt with article content and optional domain context
 */
function buildUserPrompt(
  articleTitle: string,
  content: string,
  domainContext?: {
    normalizedDomain: string;
    avgBiasRating?: number;
    totalSources?: number;
  }
): string {
  let prompt = `Extract verifiable claims from this article:\n\n`;
  prompt += `**Title:** ${articleTitle}\n\n`;

  if (domainContext) {
    prompt += `**Source Context:**\n`;
    prompt += `- Domain: ${domainContext.normalizedDomain}\n`;
    if (domainContext.avgBiasRating !== undefined) {
      prompt += `- Historical bias rating: ${domainContext.avgBiasRating.toFixed(1)} (${domainContext.totalSources} sources)\n`;
    }
    prompt += `\n`;
  }

  prompt += `**Article Content:**\n${content}\n\n`;
  prompt += `Extract 3-10 key claims with their categories and confidence scores.`;

  return prompt;
}

/**
 * Extract claims from article URL using AI
 */
export async function extractClaims(request: ExtractClaimsRequest): Promise<ExtractionResult> {
  // Fetch and parse article
  let articleContent;
  try {
    articleContent = await fetchAndParse(request.url);
  } catch (error) {
    if (error instanceof PaywallError) {
      throw new Error(`Cannot extract claims: ${error.message}`);
    }
    throw error;
  }

  // Check if content needs summarization
  const wasTruncated = articleContent.textContent.split(/\s+/).length > 5000;
  const processedContent = summarizeContent(articleContent.textContent, 5000);

  // Create AI service
  const aiService = createAIService(request.apiKey, request.model);

  // Build prompts
  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt(
    request.articleTitle || articleContent.title,
    processedContent,
    request.domainContext
  );

  // Call AI service
  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  const response = await aiService.chatCompletion(messages, {
    temperature: 0.3, // Lower temperature for more consistent categorization
    maxTokens: 2000,
  });

  // Parse JSON response
  let claims: ExtractedClaim[];
  try {
    claims = aiService.parseJsonResponse<ExtractedClaim[]>(response);

    // Validate each claim
    claims = claims
      .filter((claim) => {
        return (
          claim.claimText &&
          claim.category &&
          Object.values(ClaimCategory).includes(claim.category) &&
          typeof claim.confidenceScore === 'number' &&
          claim.confidenceScore >= 0 &&
          claim.confidenceScore <= 1
        );
      })
      .map((claim) => ({
        ...claim,
        // Ensure confidence score is bounded
        confidenceScore: Math.max(0, Math.min(1, claim.confidenceScore)),
      }));

    if (claims.length === 0) {
      throw new Error('AI returned no valid claims');
    }
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    throw new Error('AI returned invalid claim data format');
  }

  return {
    claims,
    articleTitle: articleContent.title,
    articleExcerpt: articleContent.excerpt,
    wordCount: articleContent.length,
    wasTruncated,
  };
}
