import { useEffect } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { supabase } from '@/lib/supabase'

// Handles the deep link: vendalia://auth/callback#access_token=...&refresh_token=...
// Expo Router parses hash fragments and passes them as search params.
export default function AuthCallback() {
  const params = useLocalSearchParams<{ access_token?: string; refresh_token?: string }>()

  useEffect(() => {
    async function handleCallback() {
      const access_token = params.access_token
      const refresh_token = params.refresh_token
      if (access_token && refresh_token) {
        await supabase.auth.setSession({ access_token, refresh_token })
        router.replace('/(tabs)')
      } else {
        router.replace('/(auth)/login')
      }
    }
    handleCallback()
  }, [params])

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" color="#a855f7" />
    </View>
  )
}
