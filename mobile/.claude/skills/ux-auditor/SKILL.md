---
name: ux-auditor
description: Audita UX de Vendalia Mobile — analiza cada pantalla React Native, detecta fricciones, inconsistencias y oportunidades de mejora. Produce inventario priorizado. Úsalo para revisar experiencia de usuario, flujo de app, problemas visuales o antes de un rediseño.
---

# UX Auditor — Vendalia Mobile

## Pantallas a auditar

| Pantalla | Ruta |
|----------|------|
| Login | `app/(auth)/login.tsx` |
| Register | `app/(auth)/register.tsx` |
| Explorar (Feed) | `app/(tabs)/index.tsx` |
| Mensajes | `app/(tabs)/messages.tsx` |
| Dashboard | `app/(tabs)/dashboard.tsx` |
| Perfil | `app/(tabs)/profile.tsx` |
| Detalle listing | `app/listings/[id].tsx` |
| Chat | `app/messages/[id].tsx` |

## Heurísticas de evaluación (mobile)

1. **Visibilidad del estado** — ¿El usuario sabe qué está pasando en todo momento?
2. **Control y libertad** — ¿Puede deshacer/volver fácilmente?
3. **Consistencia** — ¿Colores, fuentes, espaciados son uniformes?
4. **Prevención de errores** — ¿Se valida antes de enviar?
5. **Reconocimiento > Recordación** — ¿Las acciones son obvias?
6. **Eficiencia** — ¿Cuántos taps necesita el usuario para completar su tarea?
7. **Feedback** — ¿Cada acción tiene respuesta visual?
8. **Accesibilidad** — ¿Contraste suficiente? ¿Áreas de toque ≥ 44px?

## Escala de impacto

- **Crítico:** Bloquea o confunde al usuario, pérdida de conversión
- **Alto:** Fricción significativa, degrada la experiencia notablemente
- **Medio:** Inconsistencia o incomodidad menor
- **Bajo:** Pulido, nice-to-have

## Proceso

1. Leer cada archivo `.tsx` completo
2. Evaluar contra las 8 heurísticas
3. Documentar en `_workspace/01_audit_{screen}.md`
4. Consolidar en `_workspace/01_audit_summary.md` con prioridades globales

## Temas frecuentes a buscar

- Spinners sin texto explicativo
- `Alert.alert()` como única forma de feedback de error
- Empty states sin CTA
- Inputs sin label visible (solo placeholder)
- Botones sin estado disabled durante loading
- Colores hardcodeados fuera del tema
- Pantallas sin safe area handling
- TouchableOpacity sin `activeOpacity`
- Listas sin pull-to-refresh
- Navegación que corta flujo (replace en vez de push)
