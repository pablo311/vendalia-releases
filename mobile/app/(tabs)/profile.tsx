import { useState, useEffect } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, ActivityIndicator, Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { useTheme } from '@/lib/ThemeContext'
import type { Profile } from '@/lib/types'
import { LogOut, Save, Store, TrendingUp, Sun, Moon, Smartphone } from 'lucide-react-native'

export default function ProfileScreen() {
  const { t, mode, setMode } = useTheme()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [company, setCompany] = useState('')
  const [bio, setBio] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        setProfile(data as Profile)
        setFullName(data.full_name ?? '')
        setPhone(data.phone_number ?? '')
        setCompany(data.company_name ?? '')
        setBio(data.bio ?? '')
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleSave() {
    if (!profile) return
    setSaving(true)
    const { error } = await supabase.from('profiles').update({ full_name: fullName, phone_number: phone, company_name: company, bio }).eq('id', profile.id)
    setSaving(false)
    if (error) { Alert.alert('Error', 'No se pudo guardar.'); return }
    Alert.alert('¡Listo!', 'Perfil actualizado.')
  }

  async function handleSignOut() {
    Alert.alert('Cerrar sesión', '¿Querés salir?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: async () => { await supabase.auth.signOut(); router.replace('/(auth)/login') } },
    ])
  }

  if (loading) return <View style={[styles.center, { backgroundColor: t.bg }]}><ActivityIndicator size="large" color={t.brand} /></View>

  const initials = fullName
    ? fullName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : profile?.email?.[0]?.toUpperCase() ?? '?'

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: t.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { backgroundColor: t.card, borderBottomColor: t.border }]}>
          <Text style={[styles.headerTitle, { color: t.text }]}>Mi Perfil</Text>
          <TouchableOpacity onPress={handleSignOut} style={styles.signOutBtn} activeOpacity={0.7}>
            <LogOut size={18} color="#ef4444" strokeWidth={1.8} />
          </TouchableOpacity>
        </View>

        <View style={[styles.avatarSection, { backgroundColor: t.card }]}>
          <View style={[styles.avatar, { backgroundColor: t.brand }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={[styles.avatarName, { color: t.text }]}>{fullName || 'Sin nombre'}</Text>
          <View style={styles.roleBadge}>
            {profile?.role === 'seller'
              ? <Store size={12} color={t.brand} strokeWidth={2} />
              : <TrendingUp size={12} color={t.brand} strokeWidth={2} />}
            <Text style={[styles.roleText, { color: t.brand }]}>{profile?.role === 'seller' ? 'Vendedor' : 'Inversor'}</Text>
          </View>
          <Text style={[styles.avatarEmail, { color: t.text4 }]}>{profile?.email}</Text>
        </View>

        <View style={styles.form}>
          {[
            { label: 'Nombre completo', value: fullName, set: setFullName, placeholder: 'Tu nombre' },
            { label: 'Teléfono', value: phone, set: setPhone, placeholder: '+595 9xx xxx xxx', keyboard: 'phone-pad' as const },
            { label: 'Empresa (opcional)', value: company, set: setCompany, placeholder: 'Nombre de tu empresa' },
          ].map(({ label, value, set, placeholder, keyboard }) => (
            <View key={label} style={styles.field}>
              <Text style={[styles.label, { color: t.text2 }]}>{label}</Text>
              <TextInput
                style={[styles.input, { backgroundColor: t.card, borderColor: t.border2, color: t.text }]}
                value={value} onChangeText={set} placeholder={placeholder}
                placeholderTextColor={t.text4} keyboardType={keyboard}
              />
            </View>
          ))}
          <View style={styles.field}>
            <Text style={[styles.label, { color: t.text2 }]}>Bio (opcional)</Text>
            <TextInput
              style={[styles.input, styles.textarea, { backgroundColor: t.card, borderColor: t.border2, color: t.text }]}
              value={bio} onChangeText={setBio} placeholder="Contá algo sobre vos..."
              placeholderTextColor={t.text4} multiline numberOfLines={3} textAlignVertical="top"
            />
          </View>

          {/* Theme selector */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: t.text2 }]}>Apariencia</Text>
            <View style={[styles.themeRow, { backgroundColor: t.card, borderColor: t.border2 }]}>
              {([
                { key: 'system', label: 'Sistema', Icon: Smartphone },
                { key: 'light',  label: 'Claro',   Icon: Sun },
                { key: 'dark',   label: 'Oscuro',  Icon: Moon },
              ] as const).map(({ key, label, Icon }) => {
                const active = mode === key
                return (
                  <TouchableOpacity
                    key={key}
                    style={[styles.themeOption, active && { backgroundColor: t.brand }]}
                    onPress={() => setMode(key)}
                    activeOpacity={0.75}
                  >
                    <Icon size={14} color={active ? '#fff' : t.text3} strokeWidth={1.8} />
                    <Text style={[styles.themeOptionText, { color: active ? '#fff' : t.text3 }]}>{label}</Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving} activeOpacity={0.85}>
            {saving
              ? <ActivityIndicator color="#fff" size="small" />
              : <><Save size={16} color="#fff" strokeWidth={2} /><Text style={styles.saveBtnText}>Guardar cambios</Text></>}
          </TouchableOpacity>
        </View>
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16, borderBottomWidth: 1 },
  headerTitle: { fontSize: 22, fontWeight: '800' },
  signOutBtn: { padding: 8 },
  avatarSection: { alignItems: 'center', paddingVertical: 24, marginBottom: 16 },
  avatar: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 28 },
  avatarName: { fontSize: 18, fontWeight: '700' },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  roleText: { fontSize: 12, fontWeight: '600' },
  avatarEmail: { fontSize: 13, marginTop: 4 },
  form: { paddingHorizontal: 20, gap: 14 },
  field: { gap: 6 },
  label: { fontSize: 13, fontWeight: '600' },
  input: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 13, fontSize: 15 },
  textarea: { minHeight: 90, paddingTop: 13 },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#a855f7', borderRadius: 16, paddingVertical: 15, marginTop: 8 },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  themeRow: { flexDirection: 'row', borderWidth: 1, borderRadius: 14, overflow: 'hidden' },
  themeOption: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 10 },
  themeOptionText: { fontSize: 12, fontWeight: '600' },
})
