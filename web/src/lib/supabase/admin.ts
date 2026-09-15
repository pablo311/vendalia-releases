import 'server-only'
import { createClient } from '@supabase/supabase-js'

// Desde la migración 006 la API pública no expone emails. Las notificaciones
// los leen acá, en el servidor, con la service_role key. No exportar el cliente.
export async function getContactEmail(profileId: string): Promise<string | null> {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    console.error('SUPABASE_SERVICE_ROLE_KEY no está configurada: no se envía la notificación por email')
    return null
  }

  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data, error } = await admin.from('profiles').select('email').eq('id', profileId).single()
  if (error) {
    console.error('No se pudo leer el email de contacto:', error.message)
    return null
  }
  return data.email
}
