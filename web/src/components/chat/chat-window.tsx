'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Send, Loader2 } from 'lucide-react'

interface Message {
  id: string
  content: string
  sender_id: string
  created_at: string
  is_read: boolean
}

interface ChatWindowProps {
  inquiryId: string
  currentUserId: string
  otherName: string
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr)
  const today = new Date()
  const isToday = d.toDateString() === today.toDateString()
  if (isToday) return d.toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString('es-PY', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export function ChatWindow({ inquiryId, currentUserId, otherName }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sendError, setSendError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = useCallback((smooth = true) => {
    bottomRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant' })
  }, [])

  // Cargar mensajes iniciales y marcar como leídos
  useEffect(() => {
    const supabase = createClient()

    async function load() {
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('inquiry_id', inquiryId)
        .order('created_at', { ascending: true })

      setMessages((data as Message[]) ?? [])
      setLoading(false)

      // Marcar como leídos los mensajes del otro
      await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .eq('inquiry_id', inquiryId)
        .eq('is_read', false)
        .neq('sender_id', currentUserId)
    }

    load()
  }, [inquiryId, currentUserId])

  // Scroll inicial
  useEffect(() => {
    if (!loading) scrollToBottom(false)
  }, [loading, scrollToBottom])

  // Suscripción Realtime
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`chat:${inquiryId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `inquiry_id=eq.${inquiryId}`,
        },
        async (payload) => {
          const newMsg = payload.new as Message
          setMessages((prev) => {
            // Evitar duplicados
            if (prev.find((m) => m.id === newMsg.id)) return prev
            return [...prev, newMsg]
          })
          // Marcar como leído si es del otro
          if (newMsg.sender_id !== currentUserId) {
            await supabase
              .from('chat_messages')
              .update({ is_read: true })
              .eq('id', newMsg.id)
          }
          setTimeout(() => scrollToBottom(), 50)
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [inquiryId, currentUserId, scrollToBottom])

  async function handleSend() {
    const text = input.trim()
    if (!text || sending) return

    setSending(true)
    setSendError(null)
    setInput('')

    const supabase = createClient()
    const { error } = await supabase.from('chat_messages').insert({
      inquiry_id: inquiryId,
      sender_id: currentUserId,
      content: text,
    })

    if (error) {
      setSendError('No se pudo enviar el mensaje. Intentá de nuevo.')
      setInput(text) // restore text so user doesn't lose it
    }

    setSending(false)
    inputRef.current?.focus()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-6 w-6 text-purple-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2.5">
        {messages.length === 0 && (
          <div className="text-center py-10">
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Esta es tu conversación con <span className="font-medium text-gray-600 dark:text-gray-400">{otherName}</span>.
            </p>
            <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">Escribí tu primer mensaje.</p>
          </div>
        )}

        {messages.map((msg, i) => {
          const isMine = msg.sender_id === currentUserId
          const prevMsg = messages[i - 1]
          const showTime = !prevMsg ||
            new Date(msg.created_at).getTime() - new Date(prevMsg.created_at).getTime() > 5 * 60 * 1000

          return (
            <div key={msg.id}>
              {showTime && (
                <p className="text-center text-[11px] text-gray-400 dark:text-gray-500 my-3">
                  {formatTime(msg.created_at)}
                </p>
              )}
              <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isMine
                      ? 'text-white rounded-br-sm'
                      : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-sm shadow-sm'
                  }`}
                  style={isMine ? { background: 'linear-gradient(135deg, #a855f7, #22d3ee)' } : {}}
                >
                  {msg.content}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Send error */}
      {sendError && (
        <p className="px-4 py-2 text-xs text-red-500 bg-red-50 dark:bg-red-950/30 border-t border-red-100 dark:border-red-900/50">
          {sendError}
        </p>
      )}

      {/* Input */}
      <div className="border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3">
        <div className="flex items-end gap-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribí un mensaje... (Enter para enviar)"
            rows={1}
            className="flex-1 resize-none rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400/40 focus:border-purple-400 transition-all max-h-32 overflow-y-auto"
            style={{ minHeight: '46px' }}
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="w-11 h-11 rounded-full flex items-center justify-center text-white cursor-pointer hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #a855f7, #22d3ee)' }}
            aria-label="Enviar"
          >
            {sending
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <Send className="h-4 w-4" strokeWidth={2} />}
          </button>
        </div>
        <p className="text-[10px] text-gray-300 dark:text-gray-600 mt-1.5 text-right">Shift+Enter para nueva línea</p>
      </div>
    </div>
  )
}
