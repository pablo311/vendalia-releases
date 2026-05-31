import { useTheme as useThemeCtx } from './ThemeContext'

// Convenience hook — returns just the theme object (t).
// For mode/setMode access, import useTheme directly from ThemeContext.
export function useTheme() {
  return useThemeCtx().t
}
