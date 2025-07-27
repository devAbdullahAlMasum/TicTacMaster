# TicTacMaster Theme System

## Overview

The TicTacMaster theme system is a comprehensive, JSON-based theming solution that allows for dynamic styling of the entire application. It provides a flexible way to define colors, component styles, and animations through JSON configuration files.

## Architecture

### Core Components

1. **Theme JSON Files** (`themes/` and `public/themes/`)
   - Define color palettes, component styles, and animations
   - Located in both source (`themes/`) and public (`public/themes/`) directories
   - Automatically loaded and cached by the theme manager

2. **Theme Manager** (`lib/theme-manager.ts`)
   - Handles loading, caching, and applying themes
   - Provides utility functions for component styling
   - Manages theme-aware class generation

3. **Theme System Hook** (`hooks/use-theme-system.tsx`)
   - React context and hooks for theme management
   - Integrates with Next.js themes
   - Provides convenient access to theme utilities

4. **Enhanced Components** (`components/ui/enhanced-*.tsx`)
   - Theme-aware versions of UI components
   - Automatically apply theme styles
   - Support for loading states and enhanced interactions

## Available Themes

### Built-in Themes

1. **Light** - Clean, bright theme with blue accents
2. **Dark** - Modern dark theme with blue accents
3. **Ocean** - Cyan and blue ocean-inspired theme
4. **Forest** - Green and emerald nature-inspired theme
5. **Sunset** - Orange and red warm theme

## Theme Structure

### JSON Schema

```json
{
  "name": "Theme Name",
  "type": "light" | "dark",
  "colors": {
    "primary": { "50": "#color", ... "950": "#color" },
    "secondary": { "50": "#color", ... "950": "#color" },
    "accent": { "50": "#color", ... "950": "#color" }
  },
  "components": {
    "background": {
      "primary": "bg-class",
      "secondary": "bg-class",
      "tertiary": "bg-class",
      "gradient": "bg-gradient-class"
    },
    "text": {
      "primary": "text-class",
      "secondary": "text-class",
      "tertiary": "text-class",
      "accent": "text-class",
      "muted": "text-class"
    },
    "button": {
      "primary": {
        "base": "base-classes",
        "hover": "hover-classes",
        "active": "active-classes",
        "disabled": "disabled-classes"
      }
    },
    "gameBoard": {
      "cell": {
        "base": "cell-base-classes",
        "hover": "cell-hover-classes",
        "winner": "winner-cell-classes",
        "disabled": "disabled-cell-classes"
      },
      "symbol": {
        "x": "x-symbol-classes",
        "o": "o-symbol-classes"
      }
    }
  },
  "animations": {
    "transition": "transition-classes",
    "hover": "hover-animation-classes",
    "pulse": "pulse-classes",
    "bounce": "bounce-classes",
    "fade": "fade-classes"
  }
}
```

## Usage

### Basic Theme Usage

```tsx
import { useThemeSystem } from "@/hooks/use-theme-system"

function MyComponent() {
  const { getStyles, currentTheme } = useThemeSystem()
  
  return (
    <div className={getStyles("background.primary")}>
      <h1 className={getStyles("text.primary")}>Hello World</h1>
      <button className={getStyles("button.primary")}>
        Click me
      </button>
    </div>
  )
}
```

### Enhanced Components

```tsx
import { EnhancedButton } from "@/components/ui/enhanced-button"
import { EnhancedCard } from "@/components/ui/enhanced-card"

function MyComponent() {
  return (
    <EnhancedCard variant="elevated" interactive>
      <EnhancedButton 
        variant="primary" 
        size="lg"
        icon={<Icon />}
        loading={isLoading}
      >
        Action Button
      </EnhancedButton>
    </EnhancedCard>
  )
}
```

### Theme Selection

```tsx
import { ThemeSelector } from "@/components/theme-selector"

function Settings() {
  return (
    <div>
      <h2>Choose Theme</h2>
      <ThemeSelector variant="card" />
    </div>
  )
}
```

## Creating Custom Themes

### 1. Create Theme JSON

Create a new JSON file in `themes/` directory:

```json
{
  "name": "Custom Theme",
  "type": "light",
  "colors": {
    // Define your color palette
  },
  "components": {
    // Define component styles
  },
  "animations": {
    // Define animations
  }
}
```

### 2. Copy to Public Directory

```bash
cp themes/custom.json public/themes/
```

### 3. Register Theme

Add your theme to `AVAILABLE_THEMES` in `lib/theme-manager.ts`:

```ts
export const AVAILABLE_THEMES = [
  "light",
  "dark", 
  "ocean",
  "forest",
  "sunset",
  "custom"  // Add your theme
] as const
```

## Best Practices

### 1. Color Consistency
- Use consistent color scales (50-950)
- Ensure proper contrast ratios
- Test in both light and dark modes

### 2. Component Styling
- Keep component styles modular
- Use semantic naming
- Provide fallbacks for missing styles

### 3. Performance
- Themes are cached automatically
- Minimize theme switching frequency
- Use CSS custom properties for dynamic values

### 4. Accessibility
- Ensure sufficient color contrast
- Support high contrast mode
- Test with screen readers

## API Reference

### Theme Manager Functions

- `loadTheme(themeName)` - Load and cache a theme
- `getThemeClasses(theme, component, variant)` - Get component classes
- `getComponentStyles(theme, componentPath)` - Get styles by path
- `applyThemeToDocument(theme)` - Apply theme to document
- `getButtonClasses(theme, variant, size, className)` - Get button classes
- `getCardClasses(theme, className)` - Get card classes
- `getInputClasses(theme, hasError, className)` - Get input classes

### Theme System Hooks

- `useThemeSystem()` - Main theme system hook
- `useThemeStyles()` - Get theme styles utilities
- `useThemeComponents()` - Get component styling utilities
- `useThemeSelector()` - Get theme selection utilities

## Troubleshooting

### Common Issues

1. **Theme not loading**
   - Check if JSON file exists in `public/themes/`
   - Verify JSON syntax is valid
   - Check browser console for errors

2. **Styles not applying**
   - Ensure component is wrapped in `ThemeSystemProvider`
   - Check if theme is loaded (`currentTheme` is not null)
   - Verify class names in theme JSON

3. **Performance issues**
   - Themes are cached, but initial load may be slow
   - Consider preloading critical themes
   - Minimize theme switching frequency

### Debug Mode

Enable debug logging by setting localStorage:

```js
localStorage.setItem('theme-debug', 'true')
```

This will log theme loading and application events to the console.
