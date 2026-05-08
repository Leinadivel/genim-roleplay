import { resend } from './resend'
import { welcomeEmailTemplate } from './templates/welcome-email'

export async function sendWelcomeEmail({
  email,
  name,
}: {
  email: string
  name?: string | null
}) {
  return resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: email,
    subject: 'Welcome to Genim',
    html: welcomeEmailTemplate(name || undefined),
  })
}