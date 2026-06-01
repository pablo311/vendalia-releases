import { Tabs, Redirect } from 'expo-router'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useTheme } from '@/lib/ThemeContext'
import { useLanguage } from '@/lib/LanguageContext'
import type { Session } from '@supabase/supabase-js'
import { Home, MessageSquare, LayoutDashboard, User } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function TabsLayout() {
  const { t } = useTheme()
  const { i18n } = useLanguage()
  const { bottom } = useSafeAreaInsets()
  const [session, setSession] = useState<Session | null | undefined>(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  if (session === undefined) return null
  if (!session) return <Redirect href="/(auth)/login" />

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: t.brand,
        tabBarInactiveTintColor: t.text4,
        tabBarStyle: {
          backgroundColor: t.card,
          borderTopColor: t.border,
          borderTopWidth: 1,
          paddingBottom: Math.max(bottom, 8),
          paddingTop: 8,
          height: 64 + Math.max(bottom, 0),
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginTop: 2 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: i18n('explore'), tabBarIcon: ({ color, size }) => <Home size={size} color={color} strokeWidth={1.8} /> }} />
      <Tabs.Screen name="messages" options={{ title: i18n('messages'), tabBarIcon: ({ color, size }) => <MessageSquare size={size} color={color} strokeWidth={1.8} /> }} />
      <Tabs.Screen name="dashboard" options={{ title: i18n('myPanel'), tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} color={color} strokeWidth={1.8} /> }} />
      <Tabs.Screen name="profile" options={{ title: i18n('myProfile'), tabBarIcon: ({ color, size }) => <User size={size} color={color} strokeWidth={1.8} /> }} />
    </Tabs>
  )
}
