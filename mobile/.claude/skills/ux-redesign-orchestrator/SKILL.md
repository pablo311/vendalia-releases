---
name: ux-redesign-orchestrator
description: Orquestador del proceso UX Redesign de Vendalia Mobile. Ejecuta el pipeline completo por fases: auditoría → implementación → QA → build preview → documentación. Úsalo cuando se pida mejorar UX, rediseñar pantallas, modernizar la app, mejorar flujo de usuario, o ejecutar una fase específica del redesign. También para "siguiente fase", "continuar rediseño", "fase 2", "build preview UX", "actualizar doc UX".
---

# UX Redesign Orchestrator — Vendalia Mobile

## Arquitectura

**Patrón:** Pipeline secuencial con sub-agentes especializados  
**Modo:** Sub-agentes (resultados por fase → siguiente fase)  
**Workspace:** `mobile/_workspace/`

```
FASE 1: ux-auditor    → _workspace/01_audit_*.md
FASE 2: ui-implementor → commits por pantalla + _workspace/02_changes_*.md  
FASE 3: design-qa     → _workspace/03_qa_report.md
FASE 4: build preview  → EAS Preview APK
FASE 5: documentación  → 03_Vendalia.md actualizado
```

## Phase 0: Verificar contexto

Antes de ejecutar, determinar modo:

```
_workspace/ existe?
├── NO → Modo: INICIO COMPLETO (ejecutar Fase 1→5)
├── SÍ + usuario pide fase específica → Modo: FASE ESPECÍFICA
└── SÍ + usuario pide continuar → Modo: CONTINUAR desde última fase completada
```

Leer `_workspace/00_status.md` si existe para saber en qué fase se quedó.

## Phase 1 — Auditoría UX

**Agente:** ux-auditor  
**Input:** Código fuente de `app/(auth)/`, `app/(tabs)/`, `app/listings/`, `app/messages/`  
**Output:** `_workspace/01_audit_summary.md`

Instrucciones al agente:
- Auditar las 8 pantallas en orden de impacto de usuario (login, feed, detalle, chat, dashboard, perfil, register, callback)
- Usar heurísticas del SKILL.md de ux-auditor
- Producir resumen consolidado con prioridades globales
- Guardar status: `echo "FASE1_COMPLETA" > _workspace/00_status.md`

**Commit al terminar:** `git commit -m "audit: inventario UX fase 1 completo"`

## Phase 2 — Implementación

**Agente:** ui-implementor  
**Input:** `_workspace/01_audit_summary.md` + archivos `.tsx` actuales  
**Output:** Pantallas modificadas + `_workspace/02_changes_*.md`

Orden de implementación (por impacto):
1. `app/(auth)/login.tsx` — primera impresión
2. `app/(tabs)/index.tsx` — pantalla principal
3. `app/listings/[id].tsx` — conversión clave
4. `app/messages/[id].tsx` — retención
5. `app/(tabs)/dashboard.tsx`
6. `app/(tabs)/profile.tsx`
7. `app/(tabs)/messages.tsx`
8. `app/(auth)/register.tsx`

**Regla:** commit por pantalla, mensaje: `ux: {descripción concisa} — {pantalla}`

Actualizar status: `echo "FASE2_COMPLETA" > _workspace/00_status.md`

## Phase 3 — QA Visual

**Agente:** design-qa  
**Input:** `_workspace/01_audit_summary.md` + `_workspace/02_changes_*.md` + archivos modificados  
**Output:** `_workspace/03_qa_report.md`

Si QA rechaza → volver al ui-implementor con items específicos → re-QA.  
Máximo 2 ciclos de corrección antes de escalar al usuario.

Actualizar status: `echo "FASE3_COMPLETA" > _workspace/00_status.md`

**Commit:** `git commit -m "qa: reporte QA visual aprobado"`

## Phase 4 — Build Preview

```bash
cd mobile
eas build --platform android --profile preview --non-interactive
```

Guardar URL del APK en `_workspace/04_build.md`.  
Actualizar status: `echo "FASE4_COMPLETA" > _workspace/00_status.md`

## Phase 5 — Documentación

Actualizar `C:\Users\PC\Desktop\Documentacion Netcore\03_Vendalia.md`:

- Agregar sección `## UX Redesign — Fase {N}` con fecha
- Listar pantallas modificadas y cambios aplicados
- Agregar link al APK de preview
- Actualizar tabla de pendientes técnicos

**Commit:** `git commit -m "docs: documentación UX fase {N} actualizada"`

Actualizar status: `echo "FASE5_COMPLETA — CICLO_COMPLETO" > _workspace/00_status.md`

## Reglas globales

- Cada fase termina con commit antes de iniciar la siguiente
- Si una fase falla, reportar al usuario con contexto exacto — no intentar saltarla
- El build de preview es siempre ANTES de producción
- Stack inmutable: Expo 56, StyleSheet, lucide-react-native — sin instalar paquetes nuevos sin preguntar

## Escenarios de error

| Error | Acción |
|-------|--------|
| Build falla por dependencia | Reportar error y link de logs EAS |
| QA rechaza 2 veces | Escalar al usuario con diff de lo pendiente |
| Pantalla tiene lógica compleja | Documentar en `_workspace/02_changes_*.md` y marcar como "requiere revisión manual" |

## Test scenarios

**Normal:** "mejorá la UX de la app" → ejecuta Fase 1→5 completo  
**Parcial:** "ejecutá solo la auditoría" → Fase 1 únicamente  
**Continuar:** "seguí con la fase 2" → lee status y ejecuta desde Fase 2  
**Build:** "hacé el build de preview UX" → Fase 4 directamente  
