import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const supabase = createClient(
  'https://iuwximhtkztnuscpfutn.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// 1. Crear bucket público
const { error: bucketError } = await supabase.storage.createBucket('releases', {
  public: true,
  fileSizeLimit: 200 * 1024 * 1024, // 200MB
})
if (bucketError && bucketError.message !== 'The resource already exists') {
  console.error('Bucket error:', bucketError.message)
  process.exit(1)
}
console.log('✓ Bucket "releases" listo')

// 2. Subir APK
const file = readFileSync('C:/Users/PC/Downloads/VENDALIA-TEST.V4.apk')
const { error: uploadError } = await supabase.storage
  .from('releases')
  .upload('VENDALIA-TEST.V4.apk', file, {
    contentType: 'application/vnd.android.package-archive',
    upsert: true,
  })
if (uploadError) {
  console.error('Upload error:', uploadError.message)
  process.exit(1)
}
console.log('✓ APK subido')

// 3. Obtener URL pública
const { data } = supabase.storage.from('releases').getPublicUrl('VENDALIA-TEST.V4.apk')
console.log('URL pública:', data.publicUrl)
