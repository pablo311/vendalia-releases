# Vendalia

Marketplace de negocios en venta. Tres partes, cada una con su `CLAUDE.md`:

- `mobile/`: app Expo (React Native). Pipeline de UX con `ux-auditor`, `ui-implementor` y `design-qa` en `mobile/.claude/`.
- `web/`: Next.js + Supabase. `npm run lint` · `npm run build`.
- `supabase/`: migraciones SQL numeradas y pruebas de RLS (`npm test`, con PGlite).

## Verificación
- CI (`.github/workflows/verificar.yml`) en cada PR: `tsc` de mobile, lint y build de web, pruebas de Supabase. Nada está terminado con el CI en rojo.
- `build-android.yml` arma el APK con EAS; necesita el secret `EXPO_TOKEN` y no corre en PRs de forks.
- Un cambio de pantalla en mobile pasa por `design-qa` y termina con `DONE`.

## Cómo entra el trabajo
- Issues «Bug» o «Pedido de cambio» (`.github/ISSUE_TEMPLATE/`), con criterios de éxito. El PR usa `.github/pull_request_template.md`.

## Reglas
- Datos personales (correo, teléfono) nunca salen por la API pública ni por una política RLS abierta: una política nueva trae su migración en `supabase/` y su prueba en `supabase/tests/`.
- Nada de `.env*` en el repo ni en el chat. Variables de Vercel, Expo y Supabase las cambia Pablo.
- Deploy (Vercel, EAS submit) lo decide Pablo; desde una sesión no se despliega.
