import { Tabs, Redirect } from 'expo-router'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useTheme } from '@/lib/ThemeContext'
import type { Session } from '@supabase/supabase-js'
import { Home, MessageSquare, LayoutDashboard, User } from 'lucide-react-native'

export default function TabsLayout() {
  const { t } = useTheme()
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
          paddingBottom: 8,
          paddingTop: 8,
          height: 64,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginTop: 2 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Explorar', tabBarIcon: ({ color, size }) => <Home size={size} color={color} strokeWidth={1.8} /> }} />
      <Tabs.Screen name="messages" options={{ title: 'Mensajes', tabBarIcon: ({ color, size }) => <MessageSquare size={size} color={color} strokeWidth={1.8} /> }} />
      <Tabs.Screen name="dashboard" options={{ title: 'Mi Panel', tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} color={color} strokeWidth={1.8} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Perfil', tabBarIcon: ({ color, size }) => <User size={size} color={color} strokeWidth={1.8} /> }} />
    </Tabs>
  )
}
