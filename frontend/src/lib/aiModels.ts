/**
 * AI Model Configuration
 * Defines available AI models with their tier and metadata
 */

import { AIModel } from './storage'

export interface AIModelInfo {
  id: AIModel
  name: string
  tier: 'Free' | 'Paid'
  description: string
  costInfo?: string
}

/**
 * Available AI models for the application
 * Models are provided by OpenRouter API
 */
export const AI_MODELS: AIModelInfo[] = [
  {
    id: 'z-ai/glm-4.5-air:free',
    name: 'GLM-4.5-Air',
    tier: 'Free',
    description: 'Free tier model - Good quality, no cost',
    costInfo: 'No cost per request',
  },
  {
    id: 'x-ai/grok-code-fast-1',
    name: 'Grok Code Fast',
    tier: 'Paid',
    description: 'Paid tier model - Faster, higher accuracy',
    costInfo: 'Pay per token used',
  },
]

/**
 * Get model information by ID
 */
export function getModelInfo(modelId: AIModel): AIModelInfo | undefined {
  return AI_MODELS.find((m) => m.id === modelId)
}

/**
 * Get model display name
 */
export function getModelName(modelId: AIModel): string {
  const model = getModelInfo(modelId)
  return model?.name || modelId
}

/**
 * Get model tier (Free/Paid)
 */
export function getModelTier(modelId: AIModel): 'Free' | 'Paid' | 'Unknown' {
  const model = getModelInfo(modelId)
  return model?.tier || 'Unknown'
}

/**
 * Check if model is free tier
 */
export function isFreeModel(modelId: AIModel): boolean {
  return getModelTier(modelId) === 'Free'
}
