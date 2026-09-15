import { useState, useEffect, useCallback } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { useTheme } from '@/lib/ThemeContext'
import { useLanguage } from '@/lib/LanguageContext'
import { CATEGORY_LABELS, type Listing, type Profile } from '@/lib/types'
import { PlusCircle, TrendingUp, Lock } from 'lucide-react-native'

const STATUS_LABEL_KEY: Record<string, 'active' | 'paused' | 'sold'> = { active: 'active', paused: 'paused', sold: 'sold' }
const STATUS_COLOR: Record<string, string> = { active: '#059669', paused: '#d97706', sold: '#6b7280' }

function formatPrice(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`
  return `$${n}`
}

export default function DashboardScreen() {
  const { t } = useTheme()
  const { i18n } = useLanguage()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [listings, setListings] = useState<Listing[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }
    const [{ data: prof }, { data: listingsData }] = await Promise.all([
      supabase.rpc('get_my_profile').single(),
      supabase.from('listings').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    ])
    setProfile(prof as Profile)
    setListings((listingsData as Listing[]) ?? [])
    const { data: inquiries } = await supabase.from('inquiries').select('id').or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    let totalUnread = 0
    for (const inq of inquiries ?? []) {
      const { count } = await supabase.from('chat_messages').select('id', { count: 'exact', head: true })
        .eq('inquiry_id', inq.id).eq('is_read', false).neq('sender_id', user.id)
      totalUnread += count ?? 0
    }
    setUnreadCount(totalUnread)
    setLoading(false)
    setRefreshing(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])
  const onRefresh = () => { setRefreshing(true); fetchData() }

  if (loading) return <View style={[styles.center, { backgroundColor: t.bg }]}><ActivityIndicator size="large" color={t.brand} /></View>

  const isSeller = profile?.role === 'seller'
  const firstName = profile?.full_name?.split(' ')[0] ?? 'Usuario'
  const activeListing = listings.filter(l => l.status === 'active').length

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: t.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={t.brand} />}>
        <View style={[styles.header, { backgroundColor: t.card, borderBottomColor: t.border }]}>
          <View>
            <Text style={[styles.greeting, { color: t.text4 }]}>{i18n('myPanel')}</Text>
            <Text style={[styles.name, { color: t.text }]}>{i18n('hello')}, {firstName} 👋</Text>
          </View>
          <View style={[styles.avatar, { backgroundColor: t.brand }]}>
            <Text style={styles.avatarText}>{firstName[0]?.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: t.card, borderColor: t.border }]}>
            <Text style={[styles.statNum, { color: t.text }]}>{activeListing}</Text>
            <Text style={[styles.statLabel, { color: t.text4 }]}>{isSeller ? i18n('activeListings') : i18n('sentInquiries')}</Text>
          </View>
          <TouchableOpacity
            style={[styles.statCard, { backgroundColor: unreadCount > 0 ? t.brandLight : t.card, borderColor: unreadCount > 0 ? t.brand : t.border }]}
            onPress={() => router.push('/(tabs)/messages')} activeOpacity={0.8}
          >
            <Text style={[styles.statNum, { color: unreadCount > 0 ? t.brand : t.text }]}>{unreadCount}</Text>
            <Text style={[styles.statLabel, { color: unreadCount > 0 ? t.brand : t.text4 }]}>{i18n('newMessages')}</Text>
          </TouchableOpacity>
        </View>

        {isSeller && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: t.text }]}>{i18n('myListings')}</Text>
              <TouchableOpacity onPress={() => Alert.alert(i18n('comingSoon'), i18n('createFromApp'))} activeOpacity={0.7}>
                <PlusCircle size={22} color={t.brand} strokeWidth={1.8} />
              </TouchableOpacity>
            </View>
            {listings.length === 0 ? (
              <View style={[styles.empty, { backgroundColor: t.card, borderColor: t.border }]}>
                <TrendingUp size={36} color={t.border2} strokeWidth={1.5} />
                <Text style={[styles.emptyText, { color: t.text4 }]}>{i18n('noListingsYet')}</Text>
                <Text style={[styles.emptySubtext, { color: t.text4 }]}>{i18n('publishFromWeb')}</Text>
              </View>
            ) : (
              listings.map((listing) => (
                <TouchableOpacity key={listing.id} style={[styles.listingRow, { backgroundColor: t.card, borderColor: t.border }]}
                  onPress={() => router.push(`/listings/${listing.id}`)} activeOpacity={0.8}>
                  <View style={[styles.listingThumb, { backgroundColor: t.brandLight }]}>
                    {listing.is_confidential ? <Lock size={20} color="#c4b5fd" /> : <TrendingUp size={20} color="#c4b5fd" />}
                  </View>
                  <View style={styles.listingInfo}>
                    <Text style={[styles.listingTitle, { color: t.text }]} numberOfLines={1}>
                      {listing.is_confidential ? `${i18n('confidentialBusiness')} ${CATEGORY_LABELS[listing.category]}` : listing.title}
                    </Text>
                    <Text style={[styles.listingPrice, { color: t.brand }]}>{formatPrice(listing.price)}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: STATUS_COLOR[listing.status] + '22' }]}>
                    <Text style={[styles.statusText, { color: STATUS_COLOR[listing.status] }]}>{i18n(STATUS_LABEL_KEY[listing.status])}</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {!isSeller && (
          <View style={styles.section}>
            <TouchableOpacity style={[styles.ctaCard, { backgroundColor: t.card, borderColor: t.border }]}
              onPress={() => router.push('/(tabs)')} activeOpacity={0.85}>
              <TrendingUp size={28} color={t.brand} strokeWidth={1.8} />
              <Text style={[styles.ctaTitle, { color: t.text }]}>{i18n('exploreBusinesses')}</Text>
              <Text style={[styles.ctaSubtitle, { color: t.text4 }]}>{i18n('findOpportunities')}</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16, borderBottomWidth: 1 },
  greeting: { fontSize: 13, fontWeight: '500' },
  name: { fontSize: 20, fontWeight: '800', marginTop: 2 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 18 },
  statsRow: { flexDirection: 'row', gap: 12, padding: 16 },
  statCard: { flex: 1, borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1 },
  statNum: { fontSize: 28, fontWeight: '800' },
  statLabel: { fontSize: 12, marginTop: 4, textAlign: 'center' },
  section: { paddingHorizontal: 16, marginBottom: 8 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  listingRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1 },
  listingThumb: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  listingInfo: { flex: 1 },
  listingTitle: { fontSize: 13, fontWeight: '600' },
  listingPrice: { fontSize: 13, fontWeight: '700', marginTop: 2 },
  statusBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 11, fontWeight: '700' },
  empty: { alignItems: 'center', paddingVertical: 32, gap: 8, borderRadius: 16, borderWidth: 1 },
  emptyText: { fontSize: 14, fontWeight: '500' },
  emptySubtext: { fontSize: 12 },
  ctaCard: { borderRadius: 20, padding: 24, alignItems: 'center', gap: 10, borderWidth: 1 },
  ctaTitle: { fontSize: 16, fontWeight: '700' },
  ctaSubtitle: { fontSize: 13 },
})
