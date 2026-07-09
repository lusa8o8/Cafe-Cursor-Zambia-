import { describe, expect, it } from 'vitest'
import { upsertContactFromProfile } from '../contacts'
import { contactsToCsv, contactsToVCard } from '../export'
import { decodeQrPayload, encodeQrPayload } from '../qr-payload'
import { createCafeCursorStorage } from '../storage'
import type { Contact, Profile } from '../types'
import { createProfile } from '../validation'

function memoryStorage() {
  const entries = new Map<string, string>()

  return {
    getItem: (key: string) => entries.get(key) ?? null,
    setItem: (key: string, value: string) => entries.set(key, value),
    removeItem: (key: string) => entries.delete(key),
  }
}

const baseDate = new Date('2026-06-24T18:00:00.000Z')

function profile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: 'profile-1',
    name: 'Ada Cursor',
    role: 'Builder',
    oneLiner: 'Building with Cursor in Lusaka',
    github: 'https://github.com/adacursor',
    linkedin: 'https://linkedin.com/in/adacursor',
    updatedAt: baseDate.toISOString(),
    ...overrides,
  }
}

function contact(overrides: Partial<Contact> = {}): Contact {
  return {
    id: 'contact-1',
    profileId: 'profile-1',
    name: 'Ada Cursor',
    role: 'Builder',
    github: 'https://github.com/adacursor',
    linkedin: 'https://linkedin.com/in/adacursor',
    eventTag: 'Cafe Cursor Zambia',
    metAt: baseDate.toISOString(),
    updatedAt: baseDate.toISOString(),
    ...overrides,
  }
}

describe('Cafe Cursor boring core', () => {
  it('requires a name and normalizes social handles into stable URLs', () => {
    expect(() => createProfile({ name: '   ' }, { now: baseDate })).toThrow('Name is required')

    expect(
      createProfile(
        {
          name: '  Ada Cursor  ',
          github: '@adacursor',
          linkedin: 'adacursor',
        },
        { id: 'profile-1', now: baseDate },
      ),
    ).toMatchObject({
      id: 'profile-1',
      name: 'Ada Cursor',
      github: 'https://github.com/adacursor',
      linkedin: 'https://linkedin.com/in/adacursor',
    })
  })

  it('round-trips only supported Cafe Cursor QR payloads', () => {
    const encoded = encodeQrPayload(profile())

    expect(decodeQrPayload(encoded)?.profile.name).toBe('Ada Cursor')
    expect(decodeQrPayload('not json')).toBeNull()
    expect(
      decodeQrPayload(JSON.stringify({ app: 'other-app', v: 1, profile: profile() })),
    ).toBeNull()
  })

  it('upserts duplicate scans instead of creating duplicate contacts', () => {
    const first = contact({ id: 'existing-contact', role: 'Founder' })
    const result = upsertContactFromProfile([first], profile({ role: 'Builder' }), {
      now: baseDate,
    })

    expect(result.created).toBe(false)
    expect(result.contacts).toHaveLength(1)
    expect(result.contacts[0]).toMatchObject({
      id: 'existing-contact',
      role: 'Builder',
    })
  })

  it('keeps storage reads safe if data is absent or corrupted', () => {
    const storage = memoryStorage()
    const appStorage = createCafeCursorStorage(storage)

    expect(appStorage.getProfile()).toBeNull()
    expect(appStorage.getContacts()).toEqual([])

    storage.setItem('cafe-cursor-zambia:contacts:v1', '{broken')
    expect(appStorage.getContacts()).toEqual([])
  })

  it('escapes export formats for contacts with notes and punctuation', () => {
    const exportedContact = contact({
      name: 'Ada "Cursor", Zambia',
      note: 'Follow up, soon',
    })

    expect(contactsToCsv([exportedContact])).toContain('"Ada ""Cursor"", Zambia"')
    expect(contactsToCsv([exportedContact])).toContain('"Follow up, soon"')
    expect(contactsToVCard([exportedContact])).toContain('FN:Ada "Cursor"\\, Zambia')
  })
})
