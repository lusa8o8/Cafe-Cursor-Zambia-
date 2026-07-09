export const CAFE_CURSOR_EVENT_NAME = 'Cafe Cursor Zambia'
export const CAFE_CURSOR_EVENT_TAG = 'Cafe Cursor Zambia'
export const CAFE_CURSOR_QR_APP_ID = 'cafe-cursor-zambia'
export const CAFE_CURSOR_QR_VERSION = 1

export type Profile = {
  id: string
  name: string
  role?: string
  oneLiner?: string
  github?: string
  linkedin?: string
  avatarDataUrl?: string
  updatedAt: string
}

export type ProfileInput = {
  name: string
  role?: string
  oneLiner?: string
  github?: string
  linkedin?: string
  avatarDataUrl?: string
}

export type Contact = {
  id: string
  profileId: string
  name: string
  role?: string
  oneLiner?: string
  github?: string
  linkedin?: string
  avatarDataUrl?: string
  note?: string
  eventTag: string
  metAt: string
  updatedAt: string
}

export type QrPayload = {
  app: typeof CAFE_CURSOR_QR_APP_ID
  v: typeof CAFE_CURSOR_QR_VERSION
  profile: Profile
}

export type ExportFormat = 'csv' | 'vcf' | 'text'
