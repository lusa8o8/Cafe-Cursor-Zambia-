import { z } from 'zod'
import type { Profile, ProfileInput } from './types'

const optionalTextSchema = z
  .string()
  .optional()
  .transform(value => {
    const trimmed = value?.trim()
    return trimmed ? trimmed : undefined
  })

const dataUrlSchema = z
  .string()
  .optional()
  .transform(value => {
    const trimmed = value?.trim()
    if (!trimmed || !trimmed.startsWith('data:image/')) return undefined
    return trimmed
  })

const profileInputSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  role: optionalTextSchema,
  oneLiner: optionalTextSchema,
  github: optionalTextSchema,
  linkedin: optionalTextSchema,
  avatarDataUrl: dataUrlSchema,
})

export function normalizeUrl(value: string | undefined, hostHint?: string) {
  const trimmed = value?.trim()
  if (!trimmed) return undefined

  const withoutAt = trimmed.replace(/^@+/, '')
  const candidate =
    withoutAt.startsWith('http://') || withoutAt.startsWith('https://')
      ? withoutAt
      : hostHint && !withoutAt.includes('.')
        ? `https://${hostHint}/${withoutAt}`
        : `https://${withoutAt}`

  try {
    const url = new URL(candidate)
    if (!['http:', 'https:'].includes(url.protocol)) return undefined
    return url.toString().replace(/\/$/, '')
  } catch {
    return undefined
  }
}

export function validateProfileInput(input: ProfileInput) {
  const parsed = profileInputSchema.parse(input)

  return {
    ...parsed,
    github: normalizeUrl(parsed.github, 'github.com'),
    linkedin: normalizeUrl(parsed.linkedin, 'linkedin.com/in'),
  }
}

export function createProfile(
  input: ProfileInput,
  options: { id?: string; now?: Date } = {},
): Profile {
  const parsed = validateProfileInput(input)
  const now = (options.now ?? new Date()).toISOString()

  return {
    id: options.id ?? crypto.randomUUID(),
    ...parsed,
    updatedAt: now,
  }
}
