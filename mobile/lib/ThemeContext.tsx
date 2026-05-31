import { createContext, useContext, useEffect, useState } from 'react'
import { useColorScheme } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { light, dark, type Theme } from './theme'

type ThemeMode = 'light' | 'dark' | 'system'

interface ThemeContextValue {
  t: Theme
  mode: ThemeMode
  setMode: (m: ThemeMode) => void
  isDark: boolean
}

const ThemeContext = createContext<ThemeContextValue>({
  t: light,
  mode: 'system',
  setMode: () => {},
  isDark: false,
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme()
  const [mode, setModeState] = useState<ThemeMode>('system')

  useEffect(() => {
    AsyncStorage.getItem('themeMode').then((stored) => {
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        setModeState(stored)
      }
    })
  }, [])

  function setMode(m: ThemeMode) {
    setModeState(m)
    AsyncStorage.setItem('themeMode', m)
  }

  const isDark = mode === 'dark' || (mode === 'system' && system === 'dark')
  const t = isDark ? dark : light

  return (
    <ThemeContext.Provider value={{ t, mode, setMode, isDark }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
