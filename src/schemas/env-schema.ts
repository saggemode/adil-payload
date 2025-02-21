import * as z from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL cannot be empty'),
  GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID cannot be empty'),
  GOOGLE_CLIENT_SECRET: z
    .string()
    .min(1, 'GOOGLE_CLIENT_SECRET cannot be empty'),
  GITHUB_CLIENT_ID: z.string().min(1, 'GITHUB_CLIENT_ID cannot be empty'),
  GITHUB_CLIENT_SECRET: z
    .string()
    .min(1, 'GITHUB_CLIENT_SECRET cannot be empty'),
  AUTH_SECRET: z.string().min(1, 'AUTH_SECRET cannot be empty'),
  PAYPAL_CLIENT_ID: z.string().min(1, 'PAYPAL_CLIENT_ID cannot be empty'),
  CLOUDINARY_NAME: z.string().min(1, 'CLOUDINARY_NAME cannot be empty'),
  CLOUDINARY_KEY: z.string().min(1, 'CLOUDINARY_KEY cannot be empty'),
  CLOUDINARY_SECRET: z.string().min(1, 'CLOUDINARY_SECRET cannot be empty'),
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z
    .string()
    .min(1, 'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME cannot be empty'),
  ACTIVATION_TOKEN_SECRET: z
    .string()
    .min(1, 'ACTIVATION_TOKEN_SECRET cannot be empty'),
  EMAIL_TOKEN_SECRET: z.string().min(1, 'EMAIL_TOKEN_SECRET cannot be empty'),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z
    .string()
    .min(1, 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY cannot be empty'),
  STRIPE_SECRET_KEY: z.string().min(1, 'STRIPE_SECRET_KEY cannot be empty'),
  STRIPE_WEBHOOK_SECRET: z
    .string()
    .min(1, 'STRIPE_WEBHOOK_SECRET cannot be empty'),
  RESEND_API_KEY: z.string().min(1, 'RESEND_API_KEY cannot be empty'),
  JWT_USER_ID_SECRET: z.string().min(1, 'JWT_USER_ID_SECRET cannot be empty'),
  domain: z.string().min(1, 'domain cannot be empty'),
  SMPT_EMAIL: z.string().min(1, 'SMPT_EMAIL cannot be empty'),
  SMTP_GMAIL_PASS: z.string().min(1, 'SMTP_GMAIL_PASS cannot be empty'),
  SMTP_USER: z.string().min(1, 'SMTP_USER cannot be empty'),
  SMTP_PASS: z.string().min(1, 'SMTP_PASS cannot be empty'),
})

export const env = envSchema.parse(process.env)
