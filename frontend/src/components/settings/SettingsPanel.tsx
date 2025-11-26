/**
 * SettingsPanel Component
 * Main settings dialog with tabs for AI configuration and theme preferences
 */

import { useState } from 'react'
import { Settings } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'
import { Button } from '../ui/button'
import { AISettings } from './AISettings'
import { ThemeToggle } from './ThemeToggle'
import { useSettings } from '../../hooks/useSettings'

interface SettingsPanelProps {
  trigger?: React.ReactNode
}

type SettingsTab = 'ai' | 'appearance'

export function SettingsPanel({ trigger }: SettingsPanelProps) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<SettingsTab>('ai')
  const { aiSettings, setAISettings, validateSettings } = useSettings()
  const validation = validateSettings()

  const handleSave = () => {
    const validation = validateSettings()
    if (validation.valid) {
      setOpen(false)
    }
    // If invalid, stay open and show errors (already displayed in AISettings)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure AI features and application preferences. Settings are saved automatically to
            your browser.
          </DialogDescription>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-2 border-b">
          <button
            onClick={() => setActiveTab('ai')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'ai'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            AI Configuration
          </button>
          <button
            onClick={() => setActiveTab('appearance')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'appearance'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Appearance
          </button>
        </div>

        {/* Tab Content */}
        <div className="py-4">
          {activeTab === 'ai' && (
            <AISettings settings={aiSettings} onChange={setAISettings} validation={validation} />
          )}
          {activeTab === 'appearance' && <ThemeToggle />}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
