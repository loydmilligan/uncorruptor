/**
 * AISettings Component
 * UI for configuring OpenRouter API key and AI model selection
 * Features: API key show/hide toggle, model selection dropdown, validation
 */

import { useState } from 'react'
import { Eye, EyeOff, AlertCircle, CheckCircle, Zap } from 'lucide-react'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { AISettings as AISettingsType, AIModel } from '../../lib/storage'
import { AI_MODELS, getModelInfo } from '../../lib/aiModels'

interface AISettingsProps {
  settings: AISettingsType
  onChange: (settings: AISettingsType) => void
  validation?: { valid: boolean; errors: string[] }
}

export function AISettings({ settings, onChange, validation }: AISettingsProps) {
  const [showAPIKey, setShowAPIKey] = useState(false)
  const [localSettings, setLocalSettings] = useState(settings)

  const handleAPIKeyChange = (value: string) => {
    const updated = { ...localSettings, apiKey: value }
    setLocalSettings(updated)
    onChange(updated)
  }

  const handleModelChange = (value: AIModel) => {
    const updated = { ...localSettings, model: value }
    setLocalSettings(updated)
    onChange(updated)
  }

  const toggleShowAPIKey = () => {
    setShowAPIKey(!showAPIKey)
  }

  const isConfigured = localSettings.apiKey && localSettings.apiKey.trim() !== ''
  const hasErrors = validation && !validation.valid && validation.errors.length > 0
  const currentModel = getModelInfo(localSettings.model)

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">AI Configuration</h3>
        <p className="text-sm text-muted-foreground">
          Configure your OpenRouter API key and select an AI model for tag suggestions and claim
          extraction.
        </p>
      </div>

      {/* Current Model Indicator */}
      {isConfigured && currentModel && (
        <div className="flex items-center gap-3 p-3 rounded-lg border border-primary/50 bg-primary/5">
          <Zap className="h-5 w-5 text-primary" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Active Model:</span>
              <span className="text-sm">{currentModel.name}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  currentModel.tier === 'Free'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                }`}
              >
                {currentModel.tier}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{currentModel.description}</p>
          </div>
        </div>
      )}

      {/* API Key Input */}
      <div className="space-y-2">
        <Label htmlFor="api-key">OpenRouter API Key</Label>
        <div className="relative">
          <Input
            id="api-key"
            type={showAPIKey ? 'text' : 'password'}
            value={localSettings.apiKey}
            onChange={(e) => handleAPIKeyChange(e.target.value)}
            placeholder="sk-or-v1-..."
            className={hasErrors ? 'border-destructive' : ''}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
            onClick={toggleShowAPIKey}
            aria-label={showAPIKey ? 'Hide API key' : 'Show API key'}
          >
            {showAPIKey ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Get your API key from{' '}
          <a
            href="https://openrouter.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            openrouter.ai
          </a>
        </p>

        {/* Configuration Status */}
        {isConfigured && !hasErrors && (
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
            <CheckCircle className="h-4 w-4" />
            <span>API Key Configured</span>
          </div>
        )}

        {/* Validation Errors */}
        {hasErrors && (
          <div className="flex items-start gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              {validation.errors
                .filter((err) => err.startsWith('API Key'))
                .map((err, i) => (
                  <p key={i}>{err.replace('API Key: ', '')}</p>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Model Selection */}
      <div className="space-y-2">
        <Label htmlFor="model">AI Model</Label>
        <div className="space-y-2">
          {AI_MODELS.map((model) => (
            <label
              key={model.id}
              className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                localSettings.model === model.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <input
                type="radio"
                name="model"
                value={model.id}
                checked={localSettings.model === model.id}
                onChange={() => handleModelChange(model.id)}
                className="mt-1"
              />
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{model.name}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      model.tier === 'Free'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    }`}
                  >
                    {model.tier}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{model.description}</p>
              </div>
            </label>
          ))}
        </div>
        {validation &&
          validation.errors.filter((err) => err.startsWith('AI Model')).length > 0 && (
            <div className="flex items-start gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                {validation.errors
                  .filter((err) => err.startsWith('AI Model'))
                  .map((err, i) => (
                    <p key={i}>{err.replace('AI Model: ', '')}</p>
                  ))}
              </div>
            </div>
          )}
      </div>

      {/* Usage Information */}
      <div className="rounded-lg border border-border bg-muted/50 p-4 space-y-2">
        <h4 className="font-medium text-sm">How AI Features Work</h4>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>AI tag suggestions analyze event descriptions to recommend relevant tags</li>
          <li>Claim extraction identifies factual assertions, opinions, and speculation in articles</li>
          <li>Your API key is stored securely in your browser and never sent to our servers</li>
          <li>Free tier has no cost but may have slower response times</li>
        </ul>
      </div>
    </div>
  )
}
