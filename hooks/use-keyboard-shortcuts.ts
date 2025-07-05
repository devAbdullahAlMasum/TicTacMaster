import { useEffect } from 'react'

interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  altKey?: boolean
  shiftKey?: boolean
  action: () => void
  description: string
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const matchingShortcut = shortcuts.find(shortcut => 
        shortcut.key.toLowerCase() === event.key.toLowerCase() &&
        (shortcut.ctrlKey || false) === event.ctrlKey &&
        (shortcut.altKey || false) === event.altKey &&
        (shortcut.shiftKey || false) === event.shiftKey
      )

      if (matchingShortcut) {
        event.preventDefault()
        matchingShortcut.action()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts])
}

// Common keyboard shortcuts for the game
export const gameShortcuts = {
  newGame: { key: 'n', ctrlKey: true, description: 'Start new game' },
  restart: { key: 'r', ctrlKey: true, description: 'Restart game' },
  home: { key: 'h', ctrlKey: true, description: 'Go to home' },
  settings: { key: 's', ctrlKey: true, description: 'Open settings' },
  help: { key: '?', description: 'Show help' },
  escape: { key: 'Escape', description: 'Close dialogs' }
}

// Grid navigation shortcuts for game board
export const gridNavigation = {
  up: { key: 'ArrowUp', description: 'Move up' },
  down: { key: 'ArrowDown', description: 'Move down' },
  left: { key: 'ArrowLeft', description: 'Move left' },
  right: { key: 'ArrowRight', description: 'Move right' },
  select: { key: 'Enter', description: 'Select cell' },
  selectAlt: { key: ' ', description: 'Select cell (Space)' }
}