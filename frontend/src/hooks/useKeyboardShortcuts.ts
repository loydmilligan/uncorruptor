/**
 * Keyboard Shortcuts Hook
 * Global keyboard shortcuts for the application
 */

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export function useKeyboardShortcuts() {
  const navigate = useNavigate()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input/textarea
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      // Check for Cmd/Ctrl key combinations
      const isCmdOrCtrl = e.metaKey || e.ctrlKey

      if (isCmdOrCtrl) {
        switch (e.key.toLowerCase()) {
          case 'k':
            // Cmd/Ctrl + K: Focus search (if available)
            e.preventDefault()
            const searchInput = document.querySelector<HTMLInputElement>('input[type="search"], input[placeholder*="Search" i]')
            searchInput?.focus()
            break

          case 'n':
            // Cmd/Ctrl + N: New event
            e.preventDefault()
            navigate('/events/new')
            break

          case 'h':
            // Cmd/Ctrl + H: Home/Events
            e.preventDefault()
            navigate('/events')
            break

          case 'd':
            // Cmd/Ctrl + D: Dashboard
            e.preventDefault()
            navigate('/dashboard')
            break
        }
      } else {
        // Single key shortcuts (without modifiers)
        switch (e.key.toLowerCase()) {
          case '?':
            // Show keyboard shortcuts help
            e.preventDefault()
            showShortcutsHelp()
            break

          case 'escape':
            // Close modals or clear search
            const searchInput = document.querySelector<HTMLInputElement>('input[type="search"], input[placeholder*="Search" i]')
            if (searchInput && document.activeElement === searchInput) {
              searchInput.blur()
            }
            break
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [navigate])
}

function showShortcutsHelp() {
  const shortcuts = [
    { key: 'Cmd/Ctrl + K', description: 'Focus search' },
    { key: 'Cmd/Ctrl + N', description: 'Create new event' },
    { key: 'Cmd/Ctrl + H', description: 'Go to events' },
    { key: 'Cmd/Ctrl + D', description: 'Go to dashboard' },
    { key: '?', description: 'Show this help' },
    { key: 'Esc', description: 'Close search' },
  ]

  const message = shortcuts
    .map((s) => `${s.key}: ${s.description}`)
    .join('\n')

  alert(`Keyboard Shortcuts:\n\n${message}`)
}
