import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native'
import { router } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import { supabase } from '@/lib/supabase'
import { useTheme } from '@/lib/ThemeContext'

WebBrowser.maybeCompleteAuthSession()

export default function LoginScreen() {
  const { t } = useTheme()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  async function handleLogin() {
    if (!email || !password) { Alert.alert('Completá todos los campos'); return }
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    setLoading(false)
    if (error) { Alert.alert('Error', error.message); return }
    router.replace('/(tabs)')
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    const redirectTo = 'vendalia://auth/callback'
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo, skipBrowserRedirect: true },
    })
    if (error || !data.url) {
      setGoogleLoading(false)
      Alert.alert('Error', 'No se pudo iniciar Google. Intentá de nuevo.')
      return
    }
    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo)
    setGoogleLoading(false)

    if (result.type === 'success' && result.url) {
      // Supabase returns tokens in hash fragment: vendalia://auth/callback#access_token=...
      const rawUrl = result.url
      const hashIndex = rawUrl.indexOf('#')
      const queryIndex = rawUrl.indexOf('?')
      const paramStr = hashIndex !== -1
        ? rawUrl.slice(hashIndex + 1)
        : queryIndex !== -1 ? rawUrl.slice(queryIndex + 1) : ''
      const params = new URLSearchParams(paramStr)
      const access_token = params.get('access_token')
      const refresh_token = params.get('refresh_token')
      if (access_token && refresh_token) {
        await supabase.auth.setSession({ access_token, refresh_token })
        router.replace('/(tabs)')
      }
    }
  }

  return (
    <KeyboardAvoidingView style={[styles.flex, { backgroundColor: t.bg }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoV}>V</Text>
          </View>
          <Text style={[styles.logoText, { color: t.text }]}>Vendalia</Text>
        </View>

        <Text style={[styles.title, { color: t.text }]}>Bienvenido de nuevo</Text>
        <Text style={[styles.subtitle, { color: t.text3 }]}>Ingresá a tu cuenta para continuar</Text>

        <View style={styles.form}>
          {/* Google button */}
          <TouchableOpacity
            style={[styles.googleBtn, { backgroundColor: t.card, borderColor: t.border2 }]}
            onPress={handleGoogle}
            disabled={googleLoading}
            activeOpacity={0.85}
          >
            {googleLoading
              ? <ActivityIndicator color={t.text3} size="small" />
              : (
                <>
                  <Text style={styles.googleIcon}>G</Text>
                  <Text style={[styles.googleText, { color: t.text }]}>Continuar con Google</Text>
                </>
              )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: t.border2 }]} />
            <Text style={[styles.dividerText, { color: t.text4 }]}>o con email</Text>
            <View style={[styles.dividerLine, { backgroundColor: t.border2 }]} />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: t.text2 }]}>Email</Text>
            <TextInput
              style={[styles.input, { backgroundColor: t.card, borderColor: t.border2, color: t.text }]}
              value={email}
              onChangeText={setEmail}
              placeholder="tu@email.com"
              placeholderTextColor={t.text4}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: t.text2 }]}>Contraseña</Text>
            <TextInput
              style={[styles.input, { backgroundColor: t.card, borderColor: t.border2, color: t.text }]}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={t.text4}
              secureTextEntry
              autoComplete="password"
            />
          </View>

          <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Ingresar</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/(auth)/register')} style={styles.link}>
            <Text style={[styles.linkText, { color: t.text3 }]}>
              ¿No tenés cuenta? <Text style={styles.linkBold}>Registrarse</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 },
  logoContainer: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 32, justifyContent: 'center' },
  logoIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#a855f7', alignItems: 'center', justifyContent: 'center' },
  logoV: { color: '#fff', fontSize: 20, fontWeight: '800' },
  logoText: { fontSize: 24, fontWeight: '800' },
  title: { fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: 14, textAlign: 'center', marginBottom: 28 },
  form: { gap: 14 },
  googleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    borderWidth: 1.5, borderRadius: 16, paddingVertical: 14,
  },
  googleIcon: { fontSize: 18, fontWeight: '800', color: '#4285F4' },
  googleText: { fontSize: 15, fontWeight: '600' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: 12 },
  field: { gap: 6 },
  label: { fontSize: 13, fontWeight: '600' },
  input: {
    borderWidth: 1, borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 13, fontSize: 15,
  },
  btn: { borderRadius: 16, paddingVertical: 15, alignItems: 'center', marginTop: 4, backgroundColor: '#a855f7' },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  link: { alignItems: 'center', marginTop: 4 },
  linkText: { fontSize: 13 },
  linkBold: { color: '#a855f7', fontWeight: '700' },
})
