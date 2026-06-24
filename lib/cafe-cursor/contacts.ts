import { CAFE_CURSOR_EVENT_TAG, type Contact, type Profile } from './types'

function normalizeComparable(value: string | undefined) {
  return value?.trim().toLowerCase().replace(/\/$/, '')
}

export function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0] ?? '?'
  const second = parts.length > 1 ? parts[parts.length - 1]?.[0] : undefined
  return `${first}${second ?? ''}`.toUpperCase()
}

export function findDuplicateContact(contacts: Contact[], profile: Profile) {
  const github = normalizeComparable(profile.github)
  const linkedin = normalizeComparable(profile.linkedin)
  const nameRole = `${normalizeComparable(profile.name)}:${normalizeComparable(profile.role)}`

  return contacts.find(contact => {
    if (contact.profileId === profile.id) return true
    if (github && normalizeComparable(contact.github) === github) return true
    if (linkedin && normalizeComparable(contact.linkedin) === linkedin) return true
    return `${normalizeComparable(contact.name)}:${normalizeComparable(contact.role)}` === nameRole
  })
}

export function profileToContact(
  profile: Profile,
  options: { id?: string; metAt?: Date; note?: string } = {},
): Contact {
  const metAt = (options.metAt ?? new Date()).toISOString()

  return {
    id: options.id ?? crypto.randomUUID(),
    profileId: profile.id,
    name: profile.name,
    role: profile.role,
    oneLiner: profile.oneLiner,
    github: profile.github,
    linkedin: profile.linkedin,
    avatarDataUrl: profile.avatarDataUrl,
    note: options.note?.trim() || undefined,
    eventTag: CAFE_CURSOR_EVENT_TAG,
    metAt,
    updatedAt: metAt,
  }
}

export function upsertContactFromProfile(
  contacts: Contact[],
  profile: Profile,
  options: { now?: Date; note?: string } = {},
) {
  const existing = findDuplicateContact(contacts, profile)
  const now = (options.now ?? new Date()).toISOString()

  if (!existing) {
    const contact = profileToContact(profile, {
      metAt: options.now,
      note: options.note,
    })

    return {
      contact,
      contacts: [contact, ...contacts],
      created: true,
    }
  }

  const updated: Contact = {
    ...existing,
    profileId: profile.id,
    name: profile.name,
    role: profile.role,
    oneLiner: profile.oneLiner,
    github: profile.github,
    linkedin: profile.linkedin,
    avatarDataUrl: profile.avatarDataUrl,
    note: options.note?.trim() || existing.note,
    updatedAt: now,
  }

  return {
    contact: updated,
    contacts: contacts.map(contact => (contact.id === existing.id ? updated : contact)),
    created: false,
  }
}

export function sortContactsByMostRecent(contacts: Contact[]) {
  return [...contacts].sort((a, b) => Date.parse(b.metAt) - Date.parse(a.metAt))
}
