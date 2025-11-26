/**
 * useTheme Hook
 * React hook for managing theme (light/dark mode) with CSS class toggling
 * Applies theme instantly to document root element
 */

import { useEffect } from 'react'
import { useSettings } from './useSettings'
import { ThemeMode } from '../lib/storage'

export interface UseThemeReturn {
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void
  isDark: boolean
}

/**
 * React hook for theme management
 *
 * Features:
 * - Syncs theme with useSettings hook
 * - Applies 'dark' class to document root (<html> or :root)
 * - Provides toggle function for easy switching
 * - Instant theme application (no flicker)
 *
 * @returns Theme state and management functions
 */
export function useTheme(): UseThemeReturn {
  const { theme, setTheme } = useSettings()

  // Apply theme class to document root whenever theme changes
  useEffect(() => {
    const root = document.documentElement

    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const isDark = theme === 'dark'

  return {
    theme,
    setTheme,
    toggleTheme,
    isDark,
  }
}
