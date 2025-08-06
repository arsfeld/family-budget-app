import { Resend } from 'resend'
import nodemailer from 'nodemailer'

export interface EmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    // Use Nodemailer for local development with Mailpit
    if (process.env.NODE_ENV === 'development' || process.env.SMTP_HOST) {
      const transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST || 'localhost',
        port: parseInt(process.env.SMTP_PORT || '1025'),
        secure: false,
        ignoreTLS: true,
      })

      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'Family Budget <noreply@familybudget.local>',
        to,
        subject,
        html,
      })

      console.log('Email sent via Mailpit:', info.messageId)
      return { success: true, data: info }
    }
    
    // Use Resend for production
    if (!process.env.RESEND_API_KEY) {
      console.warn('No RESEND_API_KEY found, email not sent')
      return { success: false, error: 'Email service not configured' }
    }

    const resend = new Resend(process.env.RESEND_API_KEY)
    const data = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Family Budget <noreply@familybudget.app>',
      to,
      subject,
      html,
    })

    return { success: true, data }
  } catch (error) {
    console.error('Failed to send email:', error)
    return { success: false, error }
  }
}

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${token}`
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Verify your email</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(to right, #4f46e5, #7c3aed); padding: 20px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; text-align: center;">Family Budget</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">Verify your email address</h2>
          <p style="margin-bottom: 20px;">Thank you for signing up! Please click the button below to verify your email address and activate your account.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background: #4f46e5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Verify Email</a>
          </div>
          <p style="color: #6b7280; font-size: 14px;">Or copy and paste this link into your browser:</p>
          <p style="color: #4f46e5; font-size: 14px; word-break: break-all;">${verificationUrl}</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #6b7280; font-size: 12px; text-align: center;">This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.</p>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject: 'Verify your Family Budget account',
    html,
  })
}

export async function sendInvitationEmail(email: string, inviterName: string, familyName: string, token: string) {
  const inviteUrl = `${process.env.NEXTAUTH_URL}/auth/accept-invite?token=${token}`
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Family invitation</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(to right, #4f46e5, #7c3aed); padding: 20px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; text-align: center;">Family Budget</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">You're invited to join ${familyName}!</h2>
          <p style="margin-bottom: 20px;">${inviterName} has invited you to join their family budget on Family Budget. Click the button below to accept the invitation and create your account.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${inviteUrl}" style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Accept Invitation</a>
          </div>
          <p style="color: #6b7280; font-size: 14px;">Or copy and paste this link into your browser:</p>
          <p style="color: #4f46e5; font-size: 14px; word-break: break-all;">${inviteUrl}</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #6b7280; font-size: 12px; text-align: center;">This invitation will expire in 7 days. If you don't know ${inviterName}, you can safely ignore this email.</p>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject: `${inviterName} invited you to join ${familyName} on Family Budget`,
    html,
  })
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Reset your password</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(to right, #4f46e5, #7c3aed); padding: 20px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; text-align: center;">Family Budget</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">Reset your password</h2>
          <p style="margin-bottom: 20px;">We received a request to reset your password. Click the button below to create a new password.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Reset Password</a>
          </div>
          <p style="color: #6b7280; font-size: 14px;">Or copy and paste this link into your browser:</p>
          <p style="color: #4f46e5; font-size: 14px; word-break: break-all;">${resetUrl}</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #6b7280; font-size: 12px; text-align: center;">This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.</p>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject: 'Reset your Family Budget password',
    html,
  })
}