/**
 * LocalStorage Abstraction
 * Type-safe browser storage for settings persistence
 */

/**
 * AI Model Configuration
 */
export type AIModel = 'z-ai/glm-4.5-air:free' | 'x-ai/grok-code-fast-1';

/**
 * Theme Mode
 */
export type ThemeMode = 'light' | 'dark';

/**
 * AI Settings stored in localStorage
 */
export interface AISettings {
  apiKey: string;
  model: AIModel;
}

/**
 * Application Settings stored in localStorage
 */
export interface AppSettings {
  ai: AISettings;
  theme: ThemeMode;
}

/**
 * Storage keys for different settings
 */
const STORAGE_KEYS = {
  AI_API_KEY: 'accountability_tracker_ai_api_key',
  AI_MODEL: 'accountability_tracker_ai_model',
  THEME: 'accountability_tracker_theme',
} as const;

/**
 * Default settings values
 */
const DEFAULT_SETTINGS: AppSettings = {
  ai: {
    apiKey: '',
    model: 'z-ai/glm-4.5-air:free',
  },
  theme: 'light',
};

/**
 * Storage utility class with type-safe operations
 */
export class SettingsStorage {
  /**
   * Check if localStorage is available
   */
  private static isLocalStorageAvailable(): boolean {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get AI API Key from localStorage
   */
  static getAIApiKey(): string {
    if (!this.isLocalStorageAvailable()) {
      return DEFAULT_SETTINGS.ai.apiKey;
    }

    try {
      return localStorage.getItem(STORAGE_KEYS.AI_API_KEY) || DEFAULT_SETTINGS.ai.apiKey;
    } catch (error) {
      console.error('[Storage] Failed to get AI API key:', error);
      return DEFAULT_SETTINGS.ai.apiKey;
    }
  }

  /**
   * Set AI API Key in localStorage
   */
  static setAIApiKey(apiKey: string): void {
    if (!this.isLocalStorageAvailable()) {
      console.warn('[Storage] localStorage not available, settings will not persist');
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEYS.AI_API_KEY, apiKey);
      // Dispatch storage event for cross-tab synchronization
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: STORAGE_KEYS.AI_API_KEY,
          newValue: apiKey,
          storageArea: localStorage,
        })
      );
    } catch (error) {
      console.error('[Storage] Failed to set AI API key:', error);
      throw new Error('Failed to save API key. Storage quota may be exceeded.');
    }
  }

  /**
   * Get AI Model from localStorage
   */
  static getAIModel(): AIModel {
    if (!this.isLocalStorageAvailable()) {
      return DEFAULT_SETTINGS.ai.model;
    }

    try {
      const model = localStorage.getItem(STORAGE_KEYS.AI_MODEL);
      if (model === 'z-ai/glm-4.5-air:free' || model === 'x-ai/grok-code-fast-1') {
        return model;
      }
      return DEFAULT_SETTINGS.ai.model;
    } catch (error) {
      console.error('[Storage] Failed to get AI model:', error);
      return DEFAULT_SETTINGS.ai.model;
    }
  }

  /**
   * Set AI Model in localStorage
   */
  static setAIModel(model: AIModel): void {
    if (!this.isLocalStorageAvailable()) {
      console.warn('[Storage] localStorage not available, settings will not persist');
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEYS.AI_MODEL, model);
      // Dispatch storage event for cross-tab synchronization
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: STORAGE_KEYS.AI_MODEL,
          newValue: model,
          storageArea: localStorage,
        })
      );
    } catch (error) {
      console.error('[Storage] Failed to set AI model:', error);
      throw new Error('Failed to save model selection. Storage quota may be exceeded.');
    }
  }

  /**
   * Get AI Settings (API key + model) from localStorage
   */
  static getAISettings(): AISettings {
    return {
      apiKey: this.getAIApiKey(),
      model: this.getAIModel(),
    };
  }

  /**
   * Set AI Settings (API key + model) in localStorage
   */
  static setAISettings(settings: AISettings): void {
    this.setAIApiKey(settings.apiKey);
    this.setAIModel(settings.model);
  }

  /**
   * Get Theme from localStorage
   */
  static getTheme(): ThemeMode {
    if (!this.isLocalStorageAvailable()) {
      return DEFAULT_SETTINGS.theme;
    }

    try {
      const theme = localStorage.getItem(STORAGE_KEYS.THEME);
      if (theme === 'light' || theme === 'dark') {
        return theme;
      }
      return DEFAULT_SETTINGS.theme;
    } catch (error) {
      console.error('[Storage] Failed to get theme:', error);
      return DEFAULT_SETTINGS.theme;
    }
  }

  /**
   * Set Theme in localStorage
   */
  static setTheme(theme: ThemeMode): void {
    if (!this.isLocalStorageAvailable()) {
      console.warn('[Storage] localStorage not available, settings will not persist');
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
      // Dispatch storage event for cross-tab synchronization
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: STORAGE_KEYS.THEME,
          newValue: theme,
          storageArea: localStorage,
        })
      );
    } catch (error) {
      console.error('[Storage] Failed to set theme:', error);
      throw new Error('Failed to save theme preference. Storage quota may be exceeded.');
    }
  }

  /**
   * Get all application settings from localStorage
   */
  static getAllSettings(): AppSettings {
    return {
      ai: this.getAISettings(),
      theme: this.getTheme(),
    };
  }

  /**
   * Set all application settings in localStorage
   */
  static setAllSettings(settings: AppSettings): void {
    this.setAISettings(settings.ai);
    this.setTheme(settings.theme);
  }

  /**
   * Clear AI API key from localStorage
   */
  static clearAIApiKey(): void {
    if (!this.isLocalStorageAvailable()) {
      return;
    }

    try {
      localStorage.removeItem(STORAGE_KEYS.AI_API_KEY);
    } catch (error) {
      console.error('[Storage] Failed to clear AI API key:', error);
    }
  }

  /**
   * Clear all AI settings from localStorage
   */
  static clearAISettings(): void {
    if (!this.isLocalStorageAvailable()) {
      return;
    }

    try {
      localStorage.removeItem(STORAGE_KEYS.AI_API_KEY);
      localStorage.removeItem(STORAGE_KEYS.AI_MODEL);
    } catch (error) {
      console.error('[Storage] Failed to clear AI settings:', error);
    }
  }

  /**
   * Clear all application settings from localStorage
   */
  static clearAllSettings(): void {
    if (!this.isLocalStorageAvailable()) {
      return;
    }

    try {
      localStorage.removeItem(STORAGE_KEYS.AI_API_KEY);
      localStorage.removeItem(STORAGE_KEYS.AI_MODEL);
      localStorage.removeItem(STORAGE_KEYS.THEME);
    } catch (error) {
      console.error('[Storage] Failed to clear all settings:', error);
    }
  }

  /**
   * Check if AI is configured (has API key)
   */
  static isAIConfigured(): boolean {
    const apiKey = this.getAIApiKey();
    return apiKey.trim().length > 0;
  }

  /**
   * Get storage usage estimate (approximate)
   */
  static getStorageUsage(): { used: number; available: number } {
    if (!this.isLocalStorageAvailable()) {
      return { used: 0, available: 0 };
    }

    try {
      let used = 0;
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += key.length + (localStorage.getItem(key)?.length || 0);
        }
      }

      // LocalStorage typically has ~5-10MB limit
      // Conservative estimate: 5MB = 5,242,880 bytes
      const available = 5242880;

      return { used, available };
    } catch (error) {
      console.error('[Storage] Failed to calculate storage usage:', error);
      return { used: 0, available: 0 };
    }
  }
}

/**
 * Storage event listener for cross-tab synchronization
 * Call this to listen for storage changes from other tabs
 */
export function addStorageListener(
  callback: (settings: Partial<AppSettings>) => void
): () => void {
  const handler = (event: StorageEvent) => {
    if (!event.key) return;

    const changes: Partial<AppSettings> = {};

    if (event.key === STORAGE_KEYS.AI_API_KEY && event.newValue !== null) {
      changes.ai = { ...SettingsStorage.getAISettings(), apiKey: event.newValue };
    } else if (event.key === STORAGE_KEYS.AI_MODEL && event.newValue !== null) {
      changes.ai = { ...SettingsStorage.getAISettings(), model: event.newValue as AIModel };
    } else if (event.key === STORAGE_KEYS.THEME && event.newValue !== null) {
      changes.theme = event.newValue as ThemeMode;
    }

    if (Object.keys(changes).length > 0) {
      callback(changes);
    }
  };

  window.addEventListener('storage', handler);

  // Return cleanup function
  return () => {
    window.removeEventListener('storage', handler);
  };
}

/**
 * Validate AI API key format (OpenRouter format)
 */
export function validateAPIKey(apiKey: string): { valid: boolean; error?: string } {
  if (!apiKey || apiKey.trim() === '') {
    return { valid: false, error: 'API key cannot be empty' };
  }

  const trimmed = apiKey.trim();

  // OpenRouter API keys start with 'sk-or-v1-'
  if (!trimmed.startsWith('sk-or-v1-')) {
    return {
      valid: false,
      error: 'Invalid API key format. OpenRouter keys start with "sk-or-v1-"',
    };
  }

  // Minimum length check (OpenRouter keys are typically 50+ characters)
  if (trimmed.length < 30) {
    return { valid: false, error: 'API key is too short' };
  }

  return { valid: true };
}
