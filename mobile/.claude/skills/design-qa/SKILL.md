---
name: design-qa
description: Valida cambios UX/UI implementados en Vendalia Mobile. Compara código modificado contra el audit, verifica consistencia visual entre pantallas, detecta regresiones. Úsalo para aprobar o rechazar cambios antes del build de preview. Produce reporte QA con status por pantalla.
---

# Design QA — Vendalia Mobile

## Qué valido

### Consistencia cross-pantalla
- Colores: solo tokens del tema (`t.brand`, `t.bg`, `t.card`, etc.) — sin hexadecimales sueltos
- BorderRadius: cards 14-16px, botones 16px, inputs 14px
- Iconos: todos de `lucide-react-native`, tamaño en rango 14-24px
- Espaciado: múltiplos de 8px

### UX patterns implementados
- Loading: ActivityIndicator o skeleton con texto explicativo
- Error: mensaje claro + opción de retry
- Empty state: icono + texto + CTA donde aplique
- Formularios: label visible + validación + feedback

### Código
- Sin imports sin usar
- Sin colores hardcodeados (`#xxx`) fuera del tema
- Sin `console.log` de debug
- Funcionalidad original preservada (no se eliminó lógica de negocio)

## Proceso

1. Leer `_workspace/01_audit_summary.md` — lista de items comprometidos
2. Leer cada `.tsx` modificado
3. Cross-check: ¿se implementó cada item Crítico y Alto?
4. Verificar consistencia cross-pantalla
5. Generar `_workspace/03_qa_report.md`

## Criterios de aprobación

- Todos los items **Crítico** implementados → obligatorio
- ≥ 80% de items **Alto** implementados → recomendado
- Sin regresiones de funcionalidad → obligatorio
- Sin hardcoding de colores → obligatorio

## Output: `_workspace/03_qa_report.md`

```markdown
## QA Report — {fecha}
**Build candidate:** preview

### Resumen
| Pantalla | Críticos | Altos | Estado |
|----------|----------|-------|--------|
| Login    | 2/2      | 3/4   | ✅ OK  |
| Feed     | 1/1      | 2/3   | ✅ OK  |

### Pendientes para próxima fase
- {pantalla}: {item medio/bajo pendiente}

### DECISIÓN: {APROBADO / RECHAZADO}
```
