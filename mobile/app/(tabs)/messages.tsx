import { useState, useEffect, useCallback } from 'react'
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { useTheme } from '@/lib/ThemeContext'
import { useLanguage } from '@/lib/LanguageContext'
import { MessageCircle } from 'lucide-react-native'

interface ConversationItem {
  id: string; otherName: string; listingTitle: string
  lastText: string; lastDate: string; unread: number; initial: string
}

export default function MessagesScreen() {
  const { t } = useTheme()
  const { i18n } = useLanguage()
  const [conversations, setConversations] = useState<ConversationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchConversations = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data: inquiries } = await supabase
      .from('inquiries')
      .select(`id, message, created_at,
        listings(title, is_confidential),
        sender:profiles!inquiries_sender_id_fkey(id, full_name, email),
        receiver:profiles!inquiries_receiver_id_fkey(id, full_name, email)`)
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false })

    const enriched = await Promise.all((inquiries ?? []).map(async (inq: any) => {
      const { data: lastMsg } = await supabase
        .from('chat_messages').select('content, created_at, sender_id')
        .eq('inquiry_id', inq.id).order('created_at', { ascending: false }).limit(1).single()
      const { count: unread } = await supabase
        .from('chat_messages').select('id', { count: 'exact', head: true })
        .eq('inquiry_id', inq.id).eq('is_read', false).neq('sender_id', user.id)
      const other = inq.sender?.id === user.id ? inq.receiver : inq.sender
      const otherName = other?.full_name ?? other?.email ?? 'Usuario'
      return {
        id: inq.id, otherName,
        listingTitle: inq.listings?.is_confidential ? 'Negocio confidencial' : (inq.listings?.title ?? ''),
        lastText: lastMsg?.content ?? inq.message,
        lastDate: lastMsg?.created_at ?? inq.created_at,
        unread: unread ?? 0, initial: otherName[0]?.toUpperCase() ?? '?',
      }
    }))
    enriched.sort((a, b) => new Date(b.lastDate).getTime() - new Date(a.lastDate).getTime())
    setConversations(enriched)
    setLoading(false)
    setRefreshing(false)
  }, [])

  useEffect(() => { fetchConversations() }, [fetchConversations])
  const onRefresh = () => { setRefreshing(true); fetchConversations() }

  if (loading) return <View style={[styles.center, { backgroundColor: t.bg }]}><ActivityIndicator size="large" color={t.brand} /></View>

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: t.bg }]}>
      <View style={[styles.header, { backgroundColor: t.card, borderBottomColor: t.border }]}>
        <Text style={[styles.headerTitle, { color: t.text }]}>{i18n('messages')}</Text>
        <Text style={[styles.headerSub, { color: t.text4 }]}>{conversations.length} {i18n('conversations')}</Text>
      </View>

      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.row, { backgroundColor: t.card }]}
            onPress={() => router.push(`/messages/${item.id}`)}
            activeOpacity={0.8}
          >
            <View style={[styles.avatar, { backgroundColor: t.brand }]}>
              <Text style={styles.avatarText}>{item.initial}</Text>
              {item.unread > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadText}>{item.unread > 9 ? '9+' : item.unread}</Text>
                </View>
              )}
            </View>
            <View style={styles.rowContent}>
              <View style={styles.rowTop}>
                <Text style={[styles.rowName, { color: item.unread > 0 ? t.text : t.text2 }, item.unread > 0 && styles.rowNameBold]} numberOfLines={1}>{item.otherName}</Text>
                <Text style={[styles.rowDate, { color: t.text4 }]}>{new Date(item.lastDate).toLocaleDateString('es-PY', { day: '2-digit', month: 'short' })}</Text>
              </View>
              <Text style={[styles.rowListing, { color: t.brand }]} numberOfLines={1}>{item.listingTitle}</Text>
              <Text style={[styles.rowLastMsg, { color: item.unread > 0 ? t.text2 : t.text4 }]} numberOfLines={1}>{item.lastText}</Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={t.brand} />}
        ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: t.border, marginLeft: 76 }]} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MessageCircle size={44} color={t.border2} strokeWidth={1.5} />
            <Text style={[styles.emptyText, { color: t.text4 }]}>{i18n('noConversations')}</Text>
          </View>
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 14, borderBottomWidth: 1 },
  headerTitle: { fontSize: 22, fontWeight: '800' },
  headerSub: { fontSize: 13, marginTop: 2 },
  list: { paddingVertical: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 14 },
  separator: { height: 1 },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 18 },
  unreadBadge: { position: 'absolute', top: -2, right: -2, backgroundColor: '#a855f7', borderRadius: 10, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  unreadText: { fontSize: 9, fontWeight: '800', color: '#fff' },
  rowContent: { flex: 1, gap: 2 },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  rowName: { fontSize: 14, fontWeight: '600', flex: 1 },
  rowNameBold: { fontWeight: '700' },
  rowDate: { fontSize: 11 },
  rowListing: { fontSize: 12, fontWeight: '500' },
  rowLastMsg: { fontSize: 12 },
  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80, gap: 12 },
  emptyText: { fontSize: 14, fontWeight: '500' },
})
