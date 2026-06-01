import 'react-native-url-polyfill/auto'
import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://iuwximhtkztnuscpfutn.supabase.co'
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1d3hpbWh0a3p0bnVzY3BmdXRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxODM2MzksImV4cCI6MjA5NTc1OTYzOX0.gbCjJrSxGC0l6jtVkbyIiL_NhHg0RIDVzYjAq22V0_Q'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
