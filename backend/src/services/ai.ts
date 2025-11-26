/**
 * AI Service Client
 * OpenRouter API integration for AI-powered features (tag suggestions, claim extraction)
 */

export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

export interface OpenRouterResponse {
  id: string;
  model: string;
  created: number;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface OpenRouterError {
  error: {
    message: string;
    type: string;
    code: string;
  };
}

/**
 * AI Service Client Configuration
 */
export interface AIServiceConfig {
  apiKey: string;
  model: string;
  appUrl?: string;
  timeout?: number;
}

/**
 * AI Service Error Types
 */
export class AIServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AIServiceError';
  }
}

/**
 * Base AI Service Client
 * Handles OpenRouter API authentication and error handling
 */
export class AIService {
  private readonly apiKey: string;
  private readonly model: string;
  private readonly appUrl: string;
  private readonly timeout: number;
  private readonly baseUrl = 'https://openrouter.ai/api/v1';

  constructor(config: AIServiceConfig) {
    if (!config.apiKey || config.apiKey.trim() === '') {
      throw new AIServiceError(
        'OpenRouter API key is required',
        'INVALID_API_KEY',
        400
      );
    }

    if (!config.model || config.model.trim() === '') {
      throw new AIServiceError(
        'AI model is required',
        'INVALID_MODEL',
        400
      );
    }

    this.apiKey = config.apiKey;
    this.model = config.model;
    this.appUrl = config.appUrl || process.env.APP_URL || 'http://localhost:3001';
    this.timeout = config.timeout || 30000; // 30 seconds default
  }

  /**
   * Make a chat completion request to OpenRouter
   */
  async chatCompletion(
    messages: OpenRouterMessage[],
    options?: {
      temperature?: number;
      maxTokens?: number;
      topP?: number;
    }
  ): Promise<string> {
    const request: OpenRouterRequest = {
      model: this.model,
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 1000,
      top_p: options?.topP ?? 1.0,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': this.appUrl,
          'X-Title': 'Accountability Tracker',
        },
        body: JSON.stringify(request),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle HTTP errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as OpenRouterError;

        if (response.status === 401) {
          throw new AIServiceError(
            'Invalid API key. Please check your OpenRouter API key in settings.',
            'UNAUTHORIZED',
            401,
            errorData
          );
        } else if (response.status === 429) {
          throw new AIServiceError(
            'Rate limit exceeded. Please wait a moment and try again.',
            'RATE_LIMIT',
            429,
            errorData
          );
        } else if (response.status >= 500) {
          throw new AIServiceError(
            'AI service temporarily unavailable. Please try again later.',
            'SERVICE_ERROR',
            response.status,
            errorData
          );
        } else {
          throw new AIServiceError(
            errorData.error?.message || 'OpenRouter API request failed',
            errorData.error?.code || 'UNKNOWN_ERROR',
            response.status,
            errorData
          );
        }
      }

      const data = await response.json() as OpenRouterResponse;

      // Validate response structure
      if (!data.choices || data.choices.length === 0) {
        throw new AIServiceError(
          'No response from AI model',
          'EMPTY_RESPONSE',
          500
        );
      }

      const content = data.choices[0].message.content;

      if (!content || content.trim() === '') {
        throw new AIServiceError(
          'Empty content in AI response',
          'EMPTY_CONTENT',
          500
        );
      }

      return content.trim();

    } catch (error) {
      // Handle abort/timeout
      if (error instanceof Error && error.name === 'AbortError') {
        throw new AIServiceError(
          'AI request timed out. Please try again with a shorter input.',
          'TIMEOUT',
          408
        );
      }

      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new AIServiceError(
          'Network error connecting to AI service. Please check your internet connection.',
          'NETWORK_ERROR',
          503
        );
      }

      // Re-throw AIServiceError
      if (error instanceof AIServiceError) {
        throw error;
      }

      // Wrap unknown errors
      throw new AIServiceError(
        `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
        'UNKNOWN_ERROR',
        500,
        error
      );
    }
  }

  /**
   * Parse JSON response from AI with error handling
   * Many AI responses are JSON-formatted, this helper safely parses them
   */
  parseJsonResponse<T>(content: string): T {
    try {
      // Some models wrap JSON in markdown code blocks
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
      const jsonString = jsonMatch ? jsonMatch[1] : content;

      return JSON.parse(jsonString.trim());
    } catch (error) {
      throw new AIServiceError(
        'Failed to parse AI response as JSON',
        'INVALID_JSON',
        500,
        { content, error }
      );
    }
  }

  /**
   * Retry logic with exponential backoff for rate limits
   */
  async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3
  ): Promise<T> {
    let lastError: AIServiceError | undefined;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (error instanceof AIServiceError && error.code === 'RATE_LIMIT') {
          lastError = error;

          // Exponential backoff: 1s, 2s, 4s
          const delayMs = Math.pow(2, attempt) * 1000;
          console.log(`[AIService] Rate limited, retrying in ${delayMs}ms (attempt ${attempt + 1}/${maxRetries})...`);

          await new Promise(resolve => setTimeout(resolve, delayMs));
          continue;
        }

        // Non-retryable error
        throw error;
      }
    }

    // All retries exhausted
    throw lastError || new AIServiceError(
      'Max retries exceeded',
      'MAX_RETRIES',
      429
    );
  }

  /**
   * Get the configured model
   */
  getModel(): string {
    return this.model;
  }

  /**
   * Test API key validity
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.chatCompletion([
        { role: 'user', content: 'Hello' }
      ], { maxTokens: 10 });
      return true;
    } catch (error) {
      if (error instanceof AIServiceError && error.code === 'UNAUTHORIZED') {
        return false;
      }
      throw error;
    }
  }
}

/**
 * Create AI service instance from API key and model
 */
export function createAIService(apiKey: string, model: string): AIService {
  return new AIService({ apiKey, model });
}
