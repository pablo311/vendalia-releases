---
name: ui-implementor
description: Implementa mejoras UX/UI en pantallas Vendalia Mobile. Lee el audit y aplica cambios en React Native StyleSheet puro. Úsalo para rediseñar pantallas, aplicar mejoras visuales, mejorar flujos, modernizar la UI. Hace commit por pantalla. Sin librerías externas.
---

# UI Implementor — Vendalia Mobile

## Stack

- **React Native 0.85** + **Expo 56**
- **StyleSheet** nativo — sin NativeWind, restyle, UI Kitten
- **lucide-react-native** para iconos (tamaños: 14/16/18/20/24px)
- **react-native-safe-area-context** para SafeAreaView
- Tema vía `useTheme()` de `@/lib/ThemeContext`

## Sistema de diseño (tokens del tema)

```ts
// Colores del tema (acceder via t.*)
t.bg          // fondo principal
t.card        // superficie de cards
t.text        // texto primario
t.text2       // texto secundario
t.text3       // texto terciario
t.text4       // texto deshabilitado/placeholder
t.border      // borde suave
t.border2     // borde más pronunciado
t.brand       // #a855f7 (purple)
```

## Patrones de implementación

### Loading skeleton (en lugar de spinner vacío)
```tsx
// Shimmer simple con Animated
const opacity = useRef(new Animated.Value(0.3)).current
useEffect(() => {
  Animated.loop(Animated.sequence([
    Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
    Animated.timing(opacity, { toValue: 0.3, duration: 600, useNativeDriver: true }),
  ])).start()
}, [])
// <Animated.View style={[styles.skeleton, { opacity }]} />
```

### Empty state
```tsx
<View style={styles.emptyState}>
  <Icon size={48} color={t.text4} strokeWidth={1.5} />
  <Text style={[styles.emptyTitle, { color: t.text }]}>Título</Text>
  <Text style={[styles.emptySubtitle, { color: t.text3 }]}>Descripción</Text>
  <TouchableOpacity style={styles.emptyBtn} onPress={action}>
    <Text style={styles.emptyBtnText}>Acción</Text>
  </TouchableOpacity>
</View>
```

### Error state con retry
```tsx
{error && (
  <View style={styles.errorBanner}>
    <AlertCircle size={16} color="#ef4444" />
    <Text style={styles.errorText}>{error}</Text>
    <TouchableOpacity onPress={retry}>
      <Text style={styles.retryText}>Reintentar</Text>
    </TouchableOpacity>
  </View>
)}
```

### Botón principal
```tsx
// borderRadius: 16, paddingVertical: 15, backgroundColor: t.brand
// Siempre con disabled={loading} y activeOpacity={0.85}
```

### Card
```tsx
// backgroundColor: t.card, borderRadius: 16, borderWidth: 1, borderColor: t.border
// padding: 16, marginBottom: 12
```

## Espaciado (múltiplos de 8)
- xs: 4px | sm: 8px | md: 16px | lg: 24px | xl: 32px

## Tipografía
- H1: 22-24px, fontWeight: '800'
- H2: 18-20px, fontWeight: '700'
- Body: 14-15px, fontWeight: '400'/'500'
- Caption: 12-13px, fontWeight: '500'/'600'

## Proceso

1. Leer `_workspace/01_audit_summary.md`
2. Por cada pantalla (orden: Crítico → Alto):
   - Leer el `.tsx` actual completo
   - Aplicar cambios según audit
   - Guardar
   - `git add` + `git commit -m "ux: {descripción} — {pantalla}"`
3. Escribir `_workspace/02_changes_{screen}.md`
4. Notificar al design-qa
