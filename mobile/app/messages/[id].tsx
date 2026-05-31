import { useState, useEffect, useRef, useCallback } from 'react'
import {
  View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { useTheme } from '@/lib/ThemeContext'
import { useLanguage } from '@/lib/LanguageContext'
import { ArrowLeft, Send } from 'lucide-react-native'
import type { ChatMessage } from '@/lib/types'

function formatTime(dateStr: string) {
  const d = new Date(dateStr)
  const today = new Date()
  if (d.toDateString() === today.toDateString()) {
    return d.toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString('es-PY', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default function ChatScreen() {
  const { t } = useTheme()
  const { i18n } = useLanguage()
  const { id: inquiryId } = useLocalSearchParams<{ id: string }>()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [otherName, setOtherName] = useState('')
  const [listingTitle, setListingTitle] = useState('')
  const listRef = useRef<FlatList>(null)

  const scrollToBottom = useCallback(() => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100)
  }, [])

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setCurrentUserId(user.id)

      const { data: inquiry } = await supabase
        .from('inquiries')
        .select(`id, message,
          listings(title, is_confidential, category),
          sender:profiles!inquiries_sender_id_fkey(id, full_name, email),
          receiver:profiles!inquiries_receiver_id_fkey(id, full_name, email)`)
        .eq('id', inquiryId)
        .single()

      if (inquiry) {
        const sender = inquiry.sender as any
        const receiver = inquiry.receiver as any
        const listing = inquiry.listings as any
        const other = sender?.id === user.id ? receiver : sender
        setOtherName(other?.full_name ?? other?.email ?? 'Usuario')
        setListingTitle(listing?.is_confidential ? 'Negocio confidencial' : (listing?.title ?? ''))
      }

      const { data: msgs } = await supabase
        .from('chat_messages').select('*')
        .eq('inquiry_id', inquiryId).order('created_at', { ascending: true })

      setMessages((msgs as ChatMessage[]) ?? [])
      setLoading(false)
      scrollToBottom()

      // Mark as read
      await supabase.from('chat_messages')
        .update({ is_read: true })
        .eq('inquiry_id', inquiryId).eq('is_read', false).neq('sender_id', user.id)
    }
    load()
  }, [inquiryId, scrollToBottom])

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`chat:${inquiryId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `inquiry_id=eq.${inquiryId}` },
        async (payload) => {
          const newMsg = payload.new as ChatMessage
          setMessages(prev => prev.find(m => m.id === newMsg.id) ? prev : [...prev, newMsg])
          if (newMsg.sender_id !== currentUserId) {
            await supabase.from('chat_messages').update({ is_read: true }).eq('id', newMsg.id)
          }
          scrollToBottom()
        })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [inquiryId, currentUserId, scrollToBottom])

  async function handleSend() {
    const text = input.trim()
    if (!text || sending || !currentUserId) return
    setSending(true)
    setInput('')
    await supabase.from('chat_messages').insert({ inquiry_id: inquiryId, sender_id: currentUserId, content: text })
    setSending(false)
  }

  const renderMessage = ({ item, index }: { item: ChatMessage; index: number }) => {
    const isMine = item.sender_id === currentUserId
    const prev = messages[index - 1]
    const showTime = !prev || new Date(item.created_at).getTime() - new Date(prev.created_at).getTime() > 5 * 60 * 1000

    return (
      <View>
        {showTime && <Text style={[styles.timestamp, { color: t.text4 }]}>{formatTime(item.created_at)}</Text>}
        <View style={[styles.bubbleRow, isMine && styles.bubbleRowRight]}>
          <View style={[styles.bubble, isMine ? styles.bubbleMine : [styles.bubbleOther, { backgroundColor: t.card }]]}>
            <Text style={[styles.bubbleText, { color: isMine ? '#fff' : t.text }]}>{item.content}</Text>
          </View>
        </View>
      </View>
    )
  }

  if (loading) {
    return <View style={[styles.center, { backgroundColor: t.bg }]}><ActivityIndicator size="large" color={t.brand} /></View>
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: t.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: t.card, borderBottomColor: t.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <ArrowLeft size={20} color={t.text2} strokeWidth={2} />
        </TouchableOpacity>
        <View style={[styles.headerAvatar, { backgroundColor: t.brand }]}>
          <Text style={styles.headerAvatarText}>{otherName[0]?.toUpperCase()}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={[styles.headerName, { color: t.text }]} numberOfLines={1}>{otherName}</Text>
          <Text style={[styles.headerListing, { color: t.brand }]} numberOfLines={1}>{listingTitle}</Text>
        </View>
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={0}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToBottom}
          ListEmptyComponent={
            <View style={styles.emptyChat}>
              <Text style={[styles.emptyChatText, { color: t.text4 }]}>{i18n('startConversation')}</Text>
            </View>
          }
        />

        {/* Input */}
        <View style={[styles.inputRow, { backgroundColor: t.card, borderTopColor: t.border }]}>
          <TextInput
            style={[styles.input, { backgroundColor: t.inputBg, color: t.text }]}
            value={input}
            onChangeText={setInput}
            placeholder={i18n('writeMessage')}
            placeholderTextColor={t.text4}
            multiline
            returnKeyType="default"
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || sending) && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!input.trim() || sending}
            activeOpacity={0.8}
          >
            {sending
              ? <ActivityIndicator size="small" color="#fff" />
              : <Send size={18} color="#fff" strokeWidth={2} />}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  backBtn: { padding: 4 },
  headerAvatar: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  headerAvatarText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  headerInfo: { flex: 1 },
  headerName: { fontSize: 14, fontWeight: '700' },
  headerListing: { fontSize: 11, marginTop: 1 },
  messageList: { padding: 16, gap: 4, flexGrow: 1 },
  timestamp: { textAlign: 'center', fontSize: 11, marginVertical: 8 },
  bubbleRow: { flexDirection: 'row', marginVertical: 2 },
  bubbleRowRight: { justifyContent: 'flex-end' },
  bubble: { maxWidth: '75%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleMine: { backgroundColor: '#a855f7', borderBottomRightRadius: 4 },
  bubbleOther: { borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  emptyChat: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyChatText: { fontSize: 14 },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1 },
  input: { flex: 1, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, maxHeight: 120 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#a855f7', alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { opacity: 0.4 },
})
