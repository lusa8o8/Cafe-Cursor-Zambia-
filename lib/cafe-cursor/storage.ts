import type { Contact, Profile } from './types'

const PROFILE_KEY = 'cafe-cursor-zambia:profile:v1'
const CONTACTS_KEY = 'cafe-cursor-zambia:contacts:v1'

type StorageArea = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback

  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

function getBrowserStorage(): StorageArea | null {
  if (typeof window === 'undefined') return null
  return window.localStorage
}

export function createCafeCursorStorage(storage: StorageArea | null = getBrowserStorage()) {
  return {
    getProfile(): Profile | null {
      return safeParse<Profile | null>(storage?.getItem(PROFILE_KEY) ?? null, null)
    },

    saveProfile(profile: Profile) {
      storage?.setItem(PROFILE_KEY, JSON.stringify(profile))
    },

    getContacts(): Contact[] {
      return safeParse<Contact[]>(storage?.getItem(CONTACTS_KEY) ?? null, [])
    },

    saveContacts(contacts: Contact[]) {
      storage?.setItem(CONTACTS_KEY, JSON.stringify(contacts))
    },

    saveContact(contact: Contact) {
      const contacts = this.getContacts()
      const index = contacts.findIndex(existing => existing.id === contact.id)
      const nextContacts =
        index === -1
          ? [contact, ...contacts]
          : contacts.map(existing => (existing.id === contact.id ? contact : existing))

      this.saveContacts(nextContacts)
    },

    updateContactNote(contactId: string, note: string) {
      const contacts = this.getContacts().map(contact =>
        contact.id === contactId
          ? {
              ...contact,
              note: note.trim() || undefined,
              updatedAt: new Date().toISOString(),
            }
          : contact,
      )

      this.saveContacts(contacts)
    },

    deleteContact(contactId: string) {
      this.saveContacts(this.getContacts().filter(contact => contact.id !== contactId))
    },

    clear() {
      storage?.removeItem(PROFILE_KEY)
      storage?.removeItem(CONTACTS_KEY)
    },
  }
}

export const cafeCursorStorage = createCafeCursorStorage()
