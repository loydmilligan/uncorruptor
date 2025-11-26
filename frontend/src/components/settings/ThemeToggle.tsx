/**
 * ThemeToggle Component
 * Toggle switch for switching between light and dark themes
 */

import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'
import { Label } from '../ui/label'

export function ThemeToggle() {
  const { theme, toggleTheme, isDark } = useTheme()

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">Appearance</h3>
        <p className="text-sm text-muted-foreground">
          Customize the appearance of the application. Theme changes apply instantly.
        </p>
      </div>

      <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/50">
        <div className="flex items-center gap-3">
          {isDark ? (
            <Moon className="h-5 w-5 text-foreground" />
          ) : (
            <Sun className="h-5 w-5 text-foreground" />
          )}
          <div>
            <Label className="text-base font-medium">Dark Mode</Label>
            <p className="text-sm text-muted-foreground">
              {isDark ? 'Dark theme is enabled' : 'Light theme is enabled'}
            </p>
          </div>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={isDark}
          onClick={toggleTheme}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
            isDark ? 'bg-primary' : 'bg-input'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-background shadow-lg transition-transform ${
              isDark ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      <div className="text-sm text-muted-foreground space-y-1">
        <p>Your theme preference is saved automatically and syncs across browser tabs.</p>
        <p>Theme changes take effect immediately without requiring a page reload.</p>
      </div>
    </div>
  )
}
