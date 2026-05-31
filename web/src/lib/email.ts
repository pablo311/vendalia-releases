import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = 'Vendalia <notificaciones@vendalia.com>'

export async function sendNewInquiryEmail({
  sellerEmail,
  sellerName,
  buyerName,
  listingTitle,
  message,
  inquiryId,
}: {
  sellerEmail: string
  sellerName: string
  buyerName: string
  listingTitle: string
  message: string
  inquiryId: string
}) {
  if (!process.env.RESEND_API_KEY) return

  await resend.emails.send({
    from: FROM,
    to: sellerEmail,
    subject: `Nueva consulta sobre "${listingTitle}"`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px 24px;background:#fff;">
        <div style="background:linear-gradient(to right,#a855f7,#22d3ee);border-radius:12px;padding:2px;margin-bottom:24px;">
          <div style="background:#fff;border-radius:10px;padding:16px 20px;">
            <span style="font-weight:700;font-size:18px;color:#111827;">Vendalia</span>
          </div>
        </div>
        <h2 style="font-size:20px;font-weight:700;color:#111827;margin:0 0 8px;">
          Nueva consulta de inversor
        </h2>
        <p style="color:#6b7280;font-size:14px;margin:0 0 24px;">
          Hola <strong>${sellerName}</strong>, <strong>${buyerName}</strong> está interesado en tu negocio.
        </p>
        <div style="background:#f9fafb;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
          <p style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;margin:0 0 4px;">Anuncio</p>
          <p style="color:#111827;font-size:15px;font-weight:600;margin:0;">${listingTitle}</p>
        </div>
        <div style="background:#f9fafb;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
          <p style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;margin:0 0 8px;">Mensaje</p>
          <p style="color:#374151;font-size:14px;margin:0;line-height:1.6;">${message}</p>
        </div>
        <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'https://vendalia.com'}/dashboard/messages/${inquiryId}"
          style="display:inline-block;background:linear-gradient(to right,#a855f7,#22d3ee);color:#fff;font-weight:700;font-size:14px;padding:12px 24px;border-radius:12px;text-decoration:none;">
          Responder ahora →
        </a>
        <p style="color:#9ca3af;font-size:12px;margin-top:32px;">
          Recibís este email porque sos vendedor en Vendalia.
          <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'https://vendalia.com'}/dashboard/profile" style="color:#a855f7;">Gestionar notificaciones</a>
        </p>
      </div>
    `,
  })
}

export async function sendNewMessageEmail({
  recipientEmail,
  recipientName,
  senderName,
  listingTitle,
  messagePreview,
  inquiryId,
}: {
  recipientEmail: string
  recipientName: string
  senderName: string
  listingTitle: string
  messagePreview: string
  inquiryId: string
}) {
  if (!process.env.RESEND_API_KEY) return

  await resend.emails.send({
    from: FROM,
    to: recipientEmail,
    subject: `Nuevo mensaje de ${senderName}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px 24px;background:#fff;">
        <div style="background:linear-gradient(to right,#a855f7,#22d3ee);border-radius:12px;padding:2px;margin-bottom:24px;">
          <div style="background:#fff;border-radius:10px;padding:16px 20px;">
            <span style="font-weight:700;font-size:18px;color:#111827;">Vendalia</span>
          </div>
        </div>
        <h2 style="font-size:20px;font-weight:700;color:#111827;margin:0 0 8px;">
          Nuevo mensaje recibido
        </h2>
        <p style="color:#6b7280;font-size:14px;margin:0 0 24px;">
          Hola <strong>${recipientName}</strong>, <strong>${senderName}</strong> te envió un mensaje.
        </p>
        <div style="background:#f9fafb;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
          <p style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;margin:0 0 4px;">Re: anuncio</p>
          <p style="color:#111827;font-size:15px;font-weight:600;margin:0;">${listingTitle}</p>
        </div>
        <div style="background:#f9fafb;border-radius:12px;padding:16px 20px;margin-bottom:24px;border-left:3px solid #a855f7;">
          <p style="color:#374151;font-size:14px;margin:0;line-height:1.6;">${messagePreview}</p>
        </div>
        <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'https://vendalia.com'}/dashboard/messages/${inquiryId}"
          style="display:inline-block;background:linear-gradient(to right,#a855f7,#22d3ee);color:#fff;font-weight:700;font-size:14px;padding:12px 24px;border-radius:12px;text-decoration:none;">
          Ver conversación →
        </a>
        <p style="color:#9ca3af;font-size:12px;margin-top:32px;">
          Vendalia · <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'https://vendalia.com'}/dashboard/profile" style="color:#a855f7;">Gestionar notificaciones</a>
        </p>
      </div>
    `,
  })
}
