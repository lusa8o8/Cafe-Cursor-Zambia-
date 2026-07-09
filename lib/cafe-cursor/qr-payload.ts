import { z } from 'zod'
import {
  CAFE_CURSOR_QR_APP_ID,
  CAFE_CURSOR_QR_VERSION,
  type Profile,
  type QrPayload,
} from './types'

const profileSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  role: z.string().optional(),
  oneLiner: z.string().optional(),
  github: z.string().url().optional(),
  linkedin: z.string().url().optional(),
  avatarDataUrl: z.string().optional(),
  updatedAt: z.string().datetime(),
})

const qrPayloadSchema = z.object({
  app: z.literal(CAFE_CURSOR_QR_APP_ID),
  v: z.literal(CAFE_CURSOR_QR_VERSION),
  profile: profileSchema,
})

export function encodeQrPayload(profile: Profile) {
  const payload: QrPayload = {
    app: CAFE_CURSOR_QR_APP_ID,
    v: CAFE_CURSOR_QR_VERSION,
    profile,
  }

  return JSON.stringify(payload)
}

export function decodeQrPayload(value: string): QrPayload | null {
  try {
    const parsed = JSON.parse(value)
    return qrPayloadSchema.parse(parsed)
  } catch {
    return null
  }
}

export function isCafeCursorPayload(value: string) {
  return decodeQrPayload(value) !== null
}
