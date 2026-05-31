import { useState, useEffect } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Image, ActivityIndicator, TextInput, Alert, Dimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { useTheme } from '@/lib/ThemeContext'
import { useLanguage } from '@/lib/LanguageContext'
import { CATEGORY_LABELS, type Listing } from '@/lib/types'
import { ArrowLeft, MapPin, Calendar, TrendingUp, Lock, Send } from 'lucide-react-native'

const { width } = Dimensions.get('window')

function formatPrice(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`
  return `$${n}`
}

export default function ListingDetailScreen() {
  const { t } = useTheme()
  const { i18n } = useLanguage()
  const { id } = useLocalSearchParams<{ id: string }>()
  const [listing, setListing] = useState<Listing | null>(null)
  const [sellerName, setSellerName] = useState('')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [inquirySent, setInquirySent] = useState(false)

  useEffect(() => {
    async function load() {
      const [{ data: listingData }, { data: { user } }] = await Promise.all([
        supabase.from('listings').select('*').eq('id', id).single(),
        supabase.auth.getUser(),
      ])
      setListing(listingData as Listing)
      setCurrentUserId(user?.id ?? null)

      if (listingData) {
        const { data: seller } = await supabase
          .from('profiles').select('full_name, email').eq('id', listingData.user_id).single()
        setSellerName(seller?.full_name ?? seller?.email ?? 'Vendedor')
      }
      setLoading(false)
    }
    load()
  }, [id])

  async function sendInquiry() {
    if (!message.trim()) { Alert.alert(i18n('noMessage')); return }
    if (!currentUserId) { router.push('/(auth)/login'); return }
    if (!listing) return
    setSending(true)

    const { data, error } = await supabase
      .from('inquiries')
      .insert({ listing_id: listing.id, sender_id: currentUserId, receiver_id: listing.user_id, message: message.trim() })
      .select('id').single()

    setSending(false)
    if (error) { Alert.alert('Error', i18n('sendError')); return }
    setInquirySent(true)
    Alert.alert(i18n('inquirySentTitle'), i18n('goToChat'), [
      { text: 'No' },
      { text: i18n('goChat'), onPress: () => router.push(`/messages/${data.id}`) },
    ])
  }

  if (loading) {
    return <View style={[styles.center, { backgroundColor: t.bg }]}><ActivityIndicator size="large" color={t.brand} /></View>
  }
  if (!listing) {
    return <View style={[styles.center, { backgroundColor: t.bg }]}><Text style={{ color: t.text }}>{i18n('notFound')}</Text></View>
  }

  const isConfidential = listing.is_confidential
  const title = isConfidential ? `${i18n('confidentialBusiness')} ${CATEGORY_LABELS[listing.category]}` : listing.title
  const hasImages = !isConfidential && listing.images.length > 0
  const isMine = currentUserId === listing.user_id

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: t.bg }]}>
      {/* Back button */}
      <TouchableOpacity style={[styles.backBtn, { backgroundColor: t.card }]} onPress={() => router.back()} activeOpacity={0.7}>
        <ArrowLeft size={20} color={t.text2} strokeWidth={2} />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image */}
        <View style={styles.imageContainer}>
          {hasImages
            ? <Image source={{ uri: listing.images[0] }} style={styles.heroImage} />
            : (
              <View style={[styles.heroPlaceholder, { backgroundColor: t.brandLight }]}>
                {isConfidential ? <Lock size={48} color="#c4b5fd" /> : <TrendingUp size={48} color="#c4b5fd" />}
              </View>
            )}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{CATEGORY_LABELS[listing.category]}</Text>
          </View>
        </View>

        <View style={styles.content}>
          {/* Title + price */}
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: t.text }]}>{title}</Text>
            <Text style={[styles.price, { color: t.brand }]}>{formatPrice(listing.price)}</Text>
          </View>

          {/* Meta */}
          <View style={styles.meta}>
            {!isConfidential && (
              <View style={styles.metaItem}>
                <MapPin size={14} color={t.text4} strokeWidth={1.5} />
                <Text style={[styles.metaText, { color: t.text3 }]}>{listing.location}</Text>
              </View>
            )}
            <View style={styles.metaItem}>
              <Calendar size={14} color={t.text4} strokeWidth={1.5} />
              <Text style={[styles.metaText, { color: t.text3 }]}>{new Date(listing.created_at).toLocaleDateString('es-PY', { day: '2-digit', month: 'short', year: 'numeric' })}</Text>
            </View>
          </View>

          {/* Stats */}
          {listing.annual_revenue && (
            <View style={styles.statsRow}>
              <View style={[styles.statCard, { backgroundColor: t.card, borderColor: t.border }]}>
                <Text style={[styles.statValue, { color: t.text }]}>{formatPrice(listing.annual_revenue)}</Text>
                <Text style={[styles.statLabel, { color: t.text4 }]}>{i18n('revenueYear')}</Text>
              </View>
            </View>
          )}

          {/* Description */}
          {!isConfidential && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: t.text }]}>{i18n('description')}</Text>
              <Text style={[styles.description, { color: t.text2 }]}>{listing.description}</Text>
            </View>
          )}

          {/* Seller */}
          <View style={[styles.sellerCard, { backgroundColor: t.card, borderColor: t.border }]}>
            <View style={[styles.sellerAvatar, { backgroundColor: t.brand }]}>
              <Text style={styles.sellerInitial}>{sellerName[0]?.toUpperCase()}</Text>
            </View>
            <View>
              <Text style={[styles.sellerName, { color: t.text }]}>{sellerName}</Text>
              <Text style={[styles.sellerRole, { color: t.text4 }]}>{i18n('seller')}</Text>
            </View>
          </View>

          {/* Inquiry form */}
          {!isMine && (
            <View style={[styles.inquiryBox, { backgroundColor: t.card, borderColor: t.border }]}>
              <Text style={[styles.inquiryTitle, { color: t.text }]}>{i18n('sendInquiry')}</Text>
              {inquirySent ? (
                <View style={styles.sentBox}>
                  <Text style={styles.sentText}>{i18n('inquirySent')}</Text>
                  <TouchableOpacity onPress={() => router.push('/(tabs)/messages')} activeOpacity={0.8}>
                    <Text style={styles.sentLink}>{i18n('viewMessages')}</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <TextInput
                    style={[styles.inquiryInput, { backgroundColor: t.bg, borderColor: t.border2, color: t.text }]}
                    value={message}
                    onChangeText={setMessage}
                    placeholder={i18n('inquiryPlaceholder')}
                    placeholderTextColor={t.text4}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                  <TouchableOpacity style={styles.sendBtn} onPress={sendInquiry} disabled={sending} activeOpacity={0.85}>
                    {sending
                      ? <ActivityIndicator color="#fff" size="small" />
                      : <><Send size={16} color="#fff" strokeWidth={2} /><Text style={styles.sendBtnText}>{i18n('sendInquiry')}</Text></>}
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}

          <View style={{ height: 32 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  backBtn: {
    position: 'absolute', top: 56, left: 16, zIndex: 10,
    borderRadius: 12, width: 40, height: 40,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.08, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 3,
  },
  imageContainer: { width, height: 260, position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  heroPlaceholder: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  categoryBadge: { position: 'absolute', bottom: 12, left: 16, backgroundColor: '#a855f7', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  categoryText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  content: { padding: 20, gap: 16 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  title: { fontSize: 20, fontWeight: '800', flex: 1 },
  price: { fontSize: 20, fontWeight: '800' },
  meta: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 13 },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: { flex: 1, borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 1 },
  statValue: { fontSize: 16, fontWeight: '800' },
  statLabel: { fontSize: 11, marginTop: 2 },
  section: { gap: 8 },
  sectionTitle: { fontSize: 15, fontWeight: '700' },
  description: { fontSize: 14, lineHeight: 22 },
  sellerCard: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 16, padding: 14, borderWidth: 1 },
  sellerAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  sellerInitial: { color: '#fff', fontWeight: '700', fontSize: 18 },
  sellerName: { fontSize: 14, fontWeight: '700' },
  sellerRole: { fontSize: 12 },
  inquiryBox: { borderRadius: 16, padding: 16, gap: 12, borderWidth: 1 },
  inquiryTitle: { fontSize: 15, fontWeight: '700' },
  inquiryInput: {
    borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 14,
    textAlignVertical: 'top', minHeight: 80,
  },
  sendBtn: {
    backgroundColor: '#a855f7', borderRadius: 14, paddingVertical: 13,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  sendBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  sentBox: { alignItems: 'center', gap: 8, paddingVertical: 8 },
  sentText: { fontSize: 15, fontWeight: '600', color: '#059669' },
  sentLink: { fontSize: 13, color: '#a855f7', fontWeight: '600' },
})
