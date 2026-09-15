import { before, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { as, createDb, CHAT_MESSAGE, DENIED, IDS, INQUIRY, LISTINGS } from './db.mjs'

let db

before(async () => {
  db = await createDb()
})

describe('perfiles: rol', () => {
  it('un usuario no puede asignarse el rol admin', async () => {
    await assert.rejects(
      as(db, 'authenticated', IDS.investor, (tx) =>
        tx.query("UPDATE public.profiles SET role = 'admin' WHERE id = $1", [IDS.investor])),
      DENIED,
    )
  })

  it('un usuario puede pasar de inversor a vendedor', async () => {
    const result = await as(db, 'authenticated', IDS.investor, (tx) =>
      tx.query("UPDATE public.profiles SET role = 'seller' WHERE id = $1", [IDS.investor]))
    assert.equal(result.affectedRows, 1)
  })

  it('el registro ignora role=admin en los metadatos', async () => {
    const id = '00000000-0000-0000-0000-0000000000ff'
    const role = await as(db, null, null, async (tx) => {
      await tx.query(
        'INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES ($1, $2, $3)',
        [id, 'intruso@vendalia.test', JSON.stringify({ role: 'admin' })],
      )
      const { rows } = await tx.query('SELECT role FROM public.profiles WHERE id = $1', [id])
      return rows[0].role
    })
    assert.equal(role, 'investor')
  })

  it('un usuario no puede cambiar el email de su perfil', async () => {
    await assert.rejects(
      as(db, 'authenticated', IDS.investor, (tx) =>
        tx.query("UPDATE public.profiles SET email = 'otro@vendalia.test' WHERE id = $1", [IDS.investor])),
      DENIED,
    )
  })

  it('una función SECURITY DEFINER llamada por un usuario tampoco puede asignar admin', async () => {
    await assert.rejects(
      as(db, null, null, async (tx) => {
        await tx.exec(`
          CREATE FUNCTION public.test_promote(p_id UUID) RETURNS VOID
          LANGUAGE sql SECURITY DEFINER SET search_path = public
          AS $f$ UPDATE public.profiles SET role = 'admin' WHERE id = p_id $f$;
        `)
        await tx.query(
          "SELECT set_config('role', 'authenticated', TRUE), set_config('request.jwt.claim.sub', $1, TRUE)",
          [IDS.investor],
        )
        await tx.query('SELECT public.test_promote($1)', [IDS.investor])
      }),
      DENIED,
    )
  })

  it('el superusuario (SQL Editor) sí puede nombrar admins', async () => {
    const result = await as(db, null, null, (tx) =>
      tx.query("UPDATE public.profiles SET role = 'admin' WHERE id = $1", [IDS.outsider]))
    assert.equal(result.affectedRows, 1)
  })
})

describe('perfiles: datos personales', () => {
  it('anon ve nombres pero no emails ni teléfonos', async () => {
    const { rows } = await as(db, 'anon', null, (tx) =>
      tx.query('SELECT id, full_name, role FROM public.profiles'))
    assert.equal(rows.length, 4)

    for (const column of ['email', 'phone_number', 'phone']) {
      await assert.rejects(
        as(db, 'anon', null, (tx) => tx.query(`SELECT ${column} FROM public.profiles`)),
        DENIED,
        `anon pudo leer ${column}`,
      )
    }
  })

  it('un usuario autenticado no puede leer el email de otro', async () => {
    await assert.rejects(
      as(db, 'authenticated', IDS.investor, (tx) =>
        tx.query('SELECT email FROM public.profiles WHERE id = $1', [IDS.seller])),
      DENIED,
    )
  })

  it('get_my_profile devuelve el email y el teléfono propios', async () => {
    const { rows } = await as(db, 'authenticated', IDS.investor, (tx) =>
      tx.query('SELECT * FROM public.get_my_profile()'))
    assert.equal(rows.length, 1)
    assert.equal(rows[0].id, IDS.investor)
    assert.equal(rows[0].email, 'investor@vendalia.test')
    assert.equal(rows[0].phone_number, '+595981000000')
  })

  it('get_my_profile sin sesión no devuelve nada', async () => {
    const { rows } = await as(db, 'anon', null, (tx) =>
      tx.query('SELECT * FROM public.get_my_profile()'))
    assert.equal(rows.length, 0)
  })

  it('el onboarding puede guardar todos sus campos', async () => {
    const result = await as(db, 'authenticated', IDS.investor, (tx) =>
      tx.query(
        `UPDATE public.profiles
         SET role = 'seller', full_name = 'Ana', phone_number = '+595981111111',
             company_name = 'Café SA', bio = 'Bio', onboarding_done = TRUE
         WHERE id = $1`,
        [IDS.investor],
      ))
    assert.equal(result.affectedRows, 1)
  })

  it('las consultas con los nombres de los participantes siguen funcionando', async () => {
    const { rows } = await as(db, 'authenticated', IDS.seller, (tx) =>
      tx.query(
        `SELECT i.id, s.full_name AS sender_name, r.full_name AS receiver_name
         FROM public.inquiries i
         JOIN public.profiles s ON s.id = i.sender_id
         JOIN public.profiles r ON r.id = i.receiver_id
         WHERE i.id = $1`,
        [INQUIRY],
      ))
    assert.deepEqual(rows[0], { id: INQUIRY, sender_name: 'investor', receiver_name: 'seller' })
  })

  it('service_role puede leer emails para enviar notificaciones', async () => {
    const { rows } = await as(db, 'service_role', null, (tx) =>
      tx.query('SELECT email FROM public.profiles WHERE id = $1', [IDS.seller]))
    assert.equal(rows[0].email, 'seller@vendalia.test')
  })
})

describe('admin', () => {
  it('leer perfiles y anuncios con sesión no dispara recursión en las políticas', async () => {
    await as(db, 'authenticated', IDS.investor, async (tx) => {
      await tx.query('SELECT id, full_name FROM public.profiles')
      await tx.query('SELECT id FROM public.listings')
    })
  })

  it('admin_list_profiles rechaza a quien no es admin', async () => {
    await assert.rejects(
      as(db, 'authenticated', IDS.investor, (tx) =>
        tx.query('SELECT * FROM public.admin_list_profiles()')),
      DENIED,
    )
  })

  it('admin_list_profiles devuelve los emails al admin', async () => {
    const { rows } = await as(db, 'authenticated', IDS.admin, (tx) =>
      tx.query('SELECT email FROM public.admin_list_profiles()'))
    assert.equal(rows.length, 4)
    assert.ok(rows.every((row) => row.email.endsWith('@vendalia.test')))
  })

  it('el admin ve anuncios pausados ajenos y un inversor no', async () => {
    const query = (tx) => tx.query('SELECT id FROM public.listings WHERE id = $1', [LISTINGS.paused])
    const forAdmin = await as(db, 'authenticated', IDS.admin, query)
    const forInvestor = await as(db, 'authenticated', IDS.investor, query)
    assert.equal(forAdmin.rows.length, 1)
    assert.equal(forInvestor.rows.length, 0)
  })
})

describe('anuncios', () => {
  it('el dueño no puede transferir un anuncio a otro usuario', async () => {
    await assert.rejects(
      as(db, 'authenticated', IDS.seller, (tx) =>
        tx.query('UPDATE public.listings SET user_id = $1 WHERE id = $2', [IDS.outsider, LISTINGS.active])),
      DENIED,
    )
  })

  it('el dueño puede pausar su anuncio', async () => {
    const result = await as(db, 'authenticated', IDS.seller, (tx) =>
      tx.query("UPDATE public.listings SET status = 'paused' WHERE id = $1", [LISTINGS.active]))
    assert.equal(result.affectedRows, 1)
  })
})

describe('consultas y chat', () => {
  const insertInquiry = (receiverId) => (tx) =>
    tx.query(
      `INSERT INTO public.inquiries (listing_id, sender_id, receiver_id, message)
       VALUES ($1, $2, $3, 'Hola')`,
      [LISTINGS.active, IDS.outsider, receiverId],
    )

  it('no se puede mandar una consulta a quien no es dueño del anuncio', async () => {
    await assert.rejects(
      as(db, 'authenticated', IDS.outsider, insertInquiry(IDS.investor)),
      DENIED,
    )
  })

  it('la consulta al dueño del anuncio se acepta', async () => {
    const result = await as(db, 'authenticated', IDS.outsider, insertInquiry(IDS.seller))
    assert.equal(result.affectedRows, 1)
  })

  it('el receptor no puede reescribir el texto de una consulta', async () => {
    await assert.rejects(
      as(db, 'authenticated', IDS.seller, (tx) =>
        tx.query("UPDATE public.inquiries SET message = 'otro texto' WHERE id = $1", [INQUIRY])),
      DENIED,
    )
  })

  it('el receptor puede marcar la consulta como leída', async () => {
    const result = await as(db, 'authenticated', IDS.seller, (tx) =>
      tx.query('UPDATE public.inquiries SET is_read = TRUE WHERE id = $1', [INQUIRY]))
    assert.equal(result.affectedRows, 1)
  })

  it('un participante no puede reescribir mensajes de chat ajenos', async () => {
    await assert.rejects(
      as(db, 'authenticated', IDS.seller, (tx) =>
        tx.query("UPDATE public.chat_messages SET content = 'editado' WHERE id = $1", [CHAT_MESSAGE])),
      DENIED,
    )
  })

  it('un participante puede marcar como leídos los mensajes ajenos', async () => {
    const result = await as(db, 'authenticated', IDS.seller, (tx) =>
      tx.query('UPDATE public.chat_messages SET is_read = TRUE WHERE id = $1', [CHAT_MESSAGE]))
    assert.equal(result.affectedRows, 1)
  })
})

describe('storage', () => {
  const upload = (folder) => (tx) =>
    tx.query(
      "INSERT INTO storage.objects (bucket_id, name) VALUES ('listings-images', $1)",
      [`${folder}/foto.jpg`],
    )

  it('no se pueden subir imágenes a la carpeta de otro usuario', async () => {
    await assert.rejects(as(db, 'authenticated', IDS.investor, upload(IDS.seller)), DENIED)
  })

  it('se pueden subir imágenes a la carpeta propia', async () => {
    const result = await as(db, 'authenticated', IDS.seller, upload(IDS.seller))
    assert.equal(result.affectedRows, 1)
  })
})
