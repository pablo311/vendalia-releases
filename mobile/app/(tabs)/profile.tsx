import { useState, useEffect } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, ActivityIndicator, Alert, Linking,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { useTheme } from '@/lib/ThemeContext'
import { useLanguage } from '@/lib/LanguageContext'
import type { Profile } from '@/lib/types'
import { LogOut, Save, Store, TrendingUp, Sun, Moon, Smartphone, Shield, FileText, Trash2, ChevronRight } from 'lucide-react-native'

export default function ProfileScreen() {
  const { t, mode, setMode } = useTheme()
  const { i18n, lang, setLang } = useLanguage()
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
    if (error) { Alert.alert('Error', i18n('saveError')); return }
    Alert.alert(i18n('profileUpdated'), i18n('profileUpdatedMsg'))
  }

  async function handleSignOut() {
    Alert.alert(i18n('signOut'), i18n('signOutConfirm'), [
      { text: i18n('cancel'), style: 'cancel' },
      { text: i18n('exit'), style: 'destructive', onPress: async () => { await supabase.auth.signOut(); router.replace('/(auth)/login') } },
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
          <Text style={[styles.headerTitle, { color: t.text }]}>{i18n('myProfile')}</Text>
          <TouchableOpacity onPress={handleSignOut} style={styles.signOutBtn} activeOpacity={0.7}>
            <LogOut size={18} color="#ef4444" strokeWidth={1.8} />
          </TouchableOpacity>
        </View>

        <View style={[styles.avatarSection, { backgroundColor: t.card }]}>
          <View style={[styles.avatar, { backgroundColor: t.brand }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={[styles.avatarName, { color: t.text }]}>{fullName || i18n('noName')}</Text>
          <View style={styles.roleBadge}>
            {profile?.role === 'seller'
              ? <Store size={12} color={t.brand} strokeWidth={2} />
              : <TrendingUp size={12} color={t.brand} strokeWidth={2} />}
            <Text style={[styles.roleText, { color: t.brand }]}>{profile?.role === 'seller' ? i18n('seller') : i18n('investor')}</Text>
          </View>
          <Text style={[styles.avatarEmail, { color: t.text4 }]}>{profile?.email}</Text>
        </View>

        <View style={styles.form}>
          {[
            { label: i18n('fullName'), value: fullName, set: setFullName, placeholder: i18n('namePlaceholder') },
            { label: i18n('phone'), value: phone, set: setPhone, placeholder: '+595 9xx xxx xxx', keyboard: 'phone-pad' as const },
            { label: i18n('company'), value: company, set: setCompany, placeholder: i18n('companyPlaceholder') },
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
            <Text style={[styles.label, { color: t.text2 }]}>{i18n('bio')}</Text>
            <TextInput
              style={[styles.input, styles.textarea, { backgroundColor: t.card, borderColor: t.border2, color: t.text }]}
              value={bio} onChangeText={setBio} placeholder={i18n('bioPlaceholder')}
              placeholderTextColor={t.text4} multiline numberOfLines={3} textAlignVertical="top"
            />
          </View>

          {/* Theme selector */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: t.text2 }]}>{i18n('appearance')}</Text>
            <View style={[styles.segmentRow, { backgroundColor: t.card, borderColor: t.border2 }]}>
              {([
                { key: 'system', label: i18n('system'), Icon: Smartphone },
                { key: 'light',  label: i18n('light'),  Icon: Sun },
                { key: 'dark',   label: i18n('dark'),   Icon: Moon },
              ] as const).map(({ key, label, Icon }) => {
                const active = mode === key
                return (
                  <TouchableOpacity
                    key={key}
                    style={[styles.segmentOption, active && { backgroundColor: t.brand }]}
                    onPress={() => setMode(key)}
                    activeOpacity={0.75}
                  >
                    <Icon size={14} color={active ? '#fff' : t.text3} strokeWidth={1.8} />
                    <Text style={[styles.segmentText, { color: active ? '#fff' : t.text3 }]}>{label}</Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          </View>

          {/* Language selector */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: t.text2 }]}>{i18n('language')}</Text>
            <View style={[styles.segmentRow, { backgroundColor: t.card, borderColor: t.border2 }]}>
              {(['es', 'en'] as const).map((l) => {
                const active = lang === l
                return (
                  <TouchableOpacity
                    key={l}
                    style={[styles.segmentOption, active && { backgroundColor: t.brand }]}
                    onPress={() => setLang(l)}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.segmentText, { color: active ? '#fff' : t.text3 }]}>
                      {l === 'es' ? '🇪🇸  Español' : '🇬🇧  English'}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving} activeOpacity={0.85}>
            {saving
              ? <ActivityIndicator color="#fff" size="small" />
              : <><Save size={16} color="#fff" strokeWidth={2} /><Text style={styles.saveBtnText}>{i18n('saveChanges')}</Text></>}
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
  segmentRow: { flexDirection: 'row', borderWidth: 1, borderRadius: 14, overflow: 'hidden' },
  segmentOption: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 10 },
  segmentText: { fontSize: 12, fontWeight: '600' },
})
