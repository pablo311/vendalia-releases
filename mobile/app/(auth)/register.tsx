import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native'
import { router } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import { supabase } from '@/lib/supabase'
import { useTheme } from '@/lib/ThemeContext'
import { useLanguage } from '@/lib/LanguageContext'

WebBrowser.maybeCompleteAuthSession()

export default function RegisterScreen() {
  const { t } = useTheme()
  const { i18n } = useLanguage()

  const [role, setRole] = useState<'investor' | 'seller'>('investor')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  async function handleRegister() {
    if (!fullName || !email || !password) { Alert.alert(i18n('fillAllFields')); return }
    if (password.length < 6) { Alert.alert(i18n('shortPassword'), i18n('minPassword')); return }
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email: email.trim(), password,
      options: { data: { full_name: fullName, role } },
    })
    setLoading(false)
    if (error) { Alert.alert('Error', error.message); return }
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('profiles').update({ role, full_name: fullName, onboarding_done: true }).eq('id', user.id)
    }
    router.replace('/(tabs)')
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    const redirectTo = 'vendalia://auth/callback'
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo, skipBrowserRedirect: true },
    })
    if (error || !data.url) { setGoogleLoading(false); Alert.alert('Error', i18n('googleError')); return }
    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo)
    setGoogleLoading(false)
    if (result.type === 'success' && result.url) {
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
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}><Text style={styles.logoV}>V</Text></View>
          <Text style={[styles.logoText, { color: t.text }]}>Vendalia</Text>
        </View>

        <Text style={[styles.title, { color: t.text }]}>{i18n('createAccount')}</Text>
        <Text style={[styles.subtitle, { color: t.text3 }]}>{i18n('chooseRole')}</Text>

        <View style={styles.roleRow}>
          {(['investor', 'seller'] as const).map((r) => (
            <TouchableOpacity
              key={r}
              onPress={() => setRole(r)}
              style={[styles.roleCard, { backgroundColor: t.card, borderColor: role === r ? t.brand : t.border2 }, role === r && { backgroundColor: t.brandLight }]}
              activeOpacity={0.8}
            >
              <Text style={styles.roleEmoji}>{r === 'investor' ? '📈' : '🏪'}</Text>
              <Text style={[styles.roleLabel, { color: role === r ? t.brand : t.text3 }]}>
                {r === 'investor' ? i18n('investor') : i18n('seller')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.googleBtn, { backgroundColor: t.card, borderColor: t.border2 }]}
          onPress={handleGoogle} disabled={googleLoading} activeOpacity={0.85}
        >
          {googleLoading
            ? <ActivityIndicator color={t.text3} size="small" />
            : <><Text style={styles.googleIcon}>G</Text><Text style={[styles.googleText, { color: t.text }]}>{i18n('continueGoogle')}</Text></>}
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={[styles.dividerLine, { backgroundColor: t.border2 }]} />
          <Text style={[styles.dividerText, { color: t.text4 }]}>{i18n('orEmail')}</Text>
          <View style={[styles.dividerLine, { backgroundColor: t.border2 }]} />
        </View>

        <View style={styles.form}>
          {[
            { label: i18n('fullName'), value: fullName, onChange: setFullName, placeholder: 'Juan Pérez', caps: 'words' as const },
            { label: i18n('email'), value: email, onChange: setEmail, placeholder: 'tu@email.com', caps: 'none' as const, keyboard: 'email-address' as const },
            { label: i18n('password'), value: password, onChange: setPassword, placeholder: i18n('minPassword'), secure: true },
          ].map(({ label, value, onChange, placeholder, caps, keyboard, secure }) => (
            <View key={label} style={styles.field}>
              <Text style={[styles.label, { color: t.text2 }]}>{label}</Text>
              <TextInput
                style={[styles.input, { backgroundColor: t.card, borderColor: t.border2, color: t.text }]}
                value={value} onChangeText={onChange} placeholder={placeholder}
                placeholderTextColor={t.text4} autoCapitalize={caps ?? 'sentences'}
                keyboardType={keyboard} secureTextEntry={secure}
              />
            </View>
          ))}

          <TouchableOpacity style={styles.btn} onPress={handleRegister} disabled={loading} activeOpacity={0.85}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>{i18n('createAccount')}</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.back()} style={styles.link}>
            <Text style={[styles.linkText, { color: t.text3 }]}>{i18n('alreadyAccount')} <Text style={styles.linkBold}>{i18n('login')}</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 },
  logoContainer: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 24, justifyContent: 'center' },
  logoIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#a855f7', alignItems: 'center', justifyContent: 'center' },
  logoV: { color: '#fff', fontSize: 20, fontWeight: '800' },
  logoText: { fontSize: 24, fontWeight: '800' },
  title: { fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: 14, textAlign: 'center', marginBottom: 16 },
  roleRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  roleCard: { flex: 1, borderWidth: 2, borderRadius: 16, padding: 16, alignItems: 'center', gap: 8 },
  roleEmoji: { fontSize: 28 },
  roleLabel: { fontSize: 13, fontWeight: '600' },
  googleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderWidth: 1.5, borderRadius: 16, paddingVertical: 14, marginBottom: 4 },
  googleIcon: { fontSize: 18, fontWeight: '800', color: '#4285F4' },
  googleText: { fontSize: 15, fontWeight: '600' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 4 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: 12 },
  form: { gap: 14 },
  field: { gap: 6 },
  label: { fontSize: 13, fontWeight: '600' },
  input: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 13, fontSize: 15 },
  btn: { borderRadius: 16, paddingVertical: 15, alignItems: 'center', marginTop: 4, backgroundColor: '#a855f7' },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  link: { alignItems: 'center', marginTop: 4 },
  linkText: { fontSize: 13 },
  linkBold: { color: '#a855f7', fontWeight: '700' },
})
