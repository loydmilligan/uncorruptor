/**
 * useSettings Hook
 * React hook for managing application settings with localStorage persistence
 * Provides AI settings, theme preferences, and cross-tab synchronization
 */

import { useState, useEffect, useCallback } from 'react'
import {
  SettingsStorage,
  AISettings,
  AppSettings,
  ThemeMode,
  AIModel,
  addStorageListener,
  validateAPIKey,
} from '../lib/storage'

export interface UseSettingsReturn {
  // AI Settings
  aiSettings: AISettings
  setAISettings: (settings: AISettings) => void
  setAPIKey: (apiKey: string) => void
  setModel: (model: AIModel) => void
  isAIConfigured: boolean

  // Theme
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void

  // All Settings
  allSettings: AppSettings
  setAllSettings: (settings: AppSettings) => void

  // Validation
  validateSettings: () => { valid: boolean; errors: string[] }

  // Utilities
  clearAISettings: () => void
  clearAllSettings: () => void
}

/**
 * React hook for settings management with localStorage persistence
 *
 * Features:
 * - AI settings (API key, model selection)
 * - Theme preferences (light/dark)
 * - Cross-tab synchronization (automatic)
 * - Settings validation
 *
 * @returns Settings state and management functions
 */
export function useSettings(): UseSettingsReturn {
  // Initialize state from localStorage
  const [aiSettings, setAISettingsState] = useState<AISettings>(() =>
    SettingsStorage.getAISettings()
  )

  const [theme, setThemeState] = useState<ThemeMode>(() =>
    SettingsStorage.getTheme()
  )

  // Sync state to localStorage when changed
  const setAISettings = useCallback((settings: AISettings) => {
    setAISettingsState(settings)
    SettingsStorage.setAISettings(settings)
  }, [])

  const setAPIKey = useCallback((apiKey: string) => {
    setAISettingsState((prev) => {
      const newSettings = { ...prev, apiKey }
      SettingsStorage.setAISettings(newSettings)
      return newSettings
    })
  }, [])

  const setModel = useCallback((model: AIModel) => {
    setAISettingsState((prev) => {
      const newSettings = { ...prev, model }
      SettingsStorage.setAISettings(newSettings)
      return newSettings
    })
  }, [])

  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme)
    SettingsStorage.setTheme(newTheme)
  }, [])

  const setAllSettings = useCallback((settings: AppSettings) => {
    setAISettingsState(settings.ai)
    setThemeState(settings.theme)
    SettingsStorage.setAllSettings(settings)
  }, [])

  // Cross-tab synchronization - listen for storage changes from other tabs
  useEffect(() => {
    const removeListener = addStorageListener((changes) => {
      if (changes.ai) {
        setAISettingsState(changes.ai)
      }
      if (changes.theme) {
        setThemeState(changes.theme)
      }
    })

    return () => {
      removeListener()
    }
  }, [])

  // Validate settings
  const validateSettings = useCallback((): { valid: boolean; errors: string[] } => {
    const errors: string[] = []

    // Validate API key if configured
    if (aiSettings.apiKey && aiSettings.apiKey.trim() !== '') {
      const keyValidation = validateAPIKey(aiSettings.apiKey)
      if (!keyValidation.valid && keyValidation.error) {
        errors.push(`API Key: ${keyValidation.error}`)
      }
    }

    // Validate model selection
    if (!aiSettings.model) {
      errors.push('AI Model: Model selection is required')
    }

    // Validate theme
    if (theme !== 'light' && theme !== 'dark') {
      errors.push('Theme: Invalid theme value')
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }, [aiSettings, theme])

  // Utility functions
  const clearAISettings = useCallback(() => {
    const defaultSettings: AISettings = {
      apiKey: '',
      model: 'z-ai/glm-4.5-air:free',
    }
    setAISettingsState(defaultSettings)
    SettingsStorage.clearAISettings()
  }, [])

  const clearAllSettings = useCallback(() => {
    const defaultSettings: AppSettings = {
      ai: {
        apiKey: '',
        model: 'z-ai/glm-4.5-air:free',
      },
      theme: 'light',
    }
    setAISettingsState(defaultSettings.ai)
    setThemeState(defaultSettings.theme)
    SettingsStorage.clearAllSettings()
  }, [])

  const isAIConfigured = SettingsStorage.isAIConfigured()

  const allSettings: AppSettings = {
    ai: aiSettings,
    theme,
  }

  return {
    aiSettings,
    setAISettings,
    setAPIKey,
    setModel,
    isAIConfigured,
    theme,
    setTheme,
    allSettings,
    setAllSettings,
    validateSettings,
    clearAISettings,
    clearAllSettings,
  }
}
