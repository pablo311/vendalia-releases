import { useState, useEffect, useCallback } from 'react'
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  StyleSheet, Image, ActivityIndicator, ScrollView, RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { useTheme } from '@/lib/ThemeContext'
import { CATEGORY_LABELS, type Listing } from '@/lib/types'
import {
  Search, MapPin, TrendingUp, Lock,
  LayoutGrid, UtensilsCrossed, Store, Cpu,
  ShoppingBag, Briefcase, HeartPulse, Factory, BookOpen,
} from 'lucide-react-native'
import type { LucideIcon } from 'lucide-react-native'

interface Category { key: string; label: string; Icon: LucideIcon }

const CATEGORIES: Category[] = [
  { key: 'all',          label: 'Todos',       Icon: LayoutGrid },
  { key: 'gastronomia',  label: 'Gastronomía', Icon: UtensilsCrossed },
  { key: 'franquicia',   label: 'Franquicias', Icon: Store },
  { key: 'tecnologia',   label: 'Tecnología',  Icon: Cpu },
  { key: 'retail',       label: 'Retail',      Icon: ShoppingBag },
  { key: 'servicios',    label: 'Servicios',   Icon: Briefcase },
  { key: 'salud',        label: 'Salud',       Icon: HeartPulse },
  { key: 'educacion',    label: 'Educación',   Icon: BookOpen },
  { key: 'manufactura',  label: 'Manufactura', Icon: Factory },
]

function formatPrice(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`
  return `$${n}`
}

export default function FeedScreen() {
  const { t } = useTheme()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')

  const fetchListings = useCallback(async () => {
    let q = supabase.from('listings').select('*').eq('status', 'active').order('created_at', { ascending: false })
    if (category !== 'all') q = q.eq('category', category)
    if (search.trim()) q = q.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    const { data } = await q
    setListings((data as Listing[]) ?? [])
    setLoading(false)
    setRefreshing(false)
  }, [category, search])

  useEffect(() => { fetchListings() }, [fetchListings])
  const onRefresh = () => { setRefreshing(true); fetchListings() }

  const renderItem = ({ item }: { item: Listing }) => {
    const title = item.is_confidential ? `Negocio en ${CATEGORY_LABELS[item.category]}` : item.title
    const hasImage = !item.is_confidential && item.images.length > 0

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: t.card, borderColor: t.border }]}
        onPress={() => router.push(`/listings/${item.id}`)}
        activeOpacity={0.8}
      >
        <View style={styles.cardImage}>
          {hasImage
            ? <Image source={{ uri: item.images[0] }} style={styles.image} />
            : (
              <View style={[styles.imagePlaceholder, { backgroundColor: t.brandLight }]}>
                {item.is_confidential
                  ? <Lock size={28} color="#c4b5fd" strokeWidth={1.5} />
                  : <TrendingUp size={28} color="#c4b5fd" strokeWidth={1.5} />}
              </View>
            )}
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{CATEGORY_LABELS[item.category]}</Text>
          </View>
        </View>
        <View style={styles.cardBody}>
          <Text style={[styles.cardTitle, { color: t.text }]} numberOfLines={2}>{title}</Text>
          <View style={styles.cardLocation}>
            <MapPin size={11} color={t.text4} strokeWidth={1.5} />
            <Text style={[styles.cardLocationText, { color: t.text4 }]} numberOfLines={1}>
              {item.is_confidential ? 'Confidencial' : item.location}
            </Text>
          </View>
          <Text style={[styles.cardPrice, { color: t.brand }]}>{formatPrice(item.price)}</Text>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: t.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: t.card, borderBottomColor: t.border }]}>
        <Text style={[styles.headerTitle, { color: t.text }]}>Explorar</Text>
        <View style={[styles.searchRow, { backgroundColor: t.inputBg }]}>
          <Search size={16} color={t.text4} strokeWidth={2} />
          <TextInput
            style={[styles.searchInput, { color: t.text }]}
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar negocios..."
            placeholderTextColor={t.text4}
            returnKeyType="search"
            onSubmitEditing={fetchListings}
          />
        </View>
      </View>

      {/* Category filters */}
      <View style={[styles.filtersWrapper, { backgroundColor: t.card, borderBottomColor: t.border }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
        >
          {CATEGORIES.map(({ key, label, Icon }) => {
            const active = category === key
            return (
              <TouchableOpacity
                key={key}
                onPress={() => setCategory(key)}
                style={[
                  styles.filterChip,
                  { backgroundColor: active ? t.brand : t.chipBg, borderColor: active ? t.brand : t.border2 },
                ]}
                activeOpacity={0.75}
              >
                <Icon size={14} color={active ? '#fff' : t.text3} strokeWidth={1.8} />
                <Text style={[styles.filterText, { color: active ? '#fff' : t.text3 }]}>{label}</Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={t.brand} />
        </View>
      ) : (
        <FlatList
          data={listings}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={t.brand} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <TrendingUp size={40} color={t.border2} strokeWidth={1.5} />
              <Text style={[styles.emptyText, { color: t.text4 }]}>Sin listados disponibles</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12, borderBottomWidth: 1 },
  headerTitle: { fontSize: 22, fontWeight: '800', marginBottom: 10 },
  searchRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  searchInput: { flex: 1, fontSize: 14 },
  filtersWrapper: { borderBottomWidth: 1 },
  filtersContent: { paddingHorizontal: 14, paddingVertical: 10, gap: 8 },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderWidth: 1.5, borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 7,
  },
  filterText: { fontSize: 12, fontWeight: '600' },
  list: { padding: 12, gap: 12 },
  row: { gap: 12 },
  card: { flex: 1, borderRadius: 16, overflow: 'hidden', borderWidth: 1 },
  cardImage: { height: 120, position: 'relative' },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: 8, left: 8, backgroundColor: '#a855f7', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 9, fontWeight: '700', color: '#fff' },
  cardBody: { padding: 10, gap: 4 },
  cardTitle: { fontSize: 12, fontWeight: '700', lineHeight: 16 },
  cardLocation: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  cardLocationText: { fontSize: 11, flex: 1 },
  cardPrice: { fontSize: 14, fontWeight: '800' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 14, fontWeight: '500' },
})
