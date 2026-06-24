'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { findDuplicateContact, sortContactsByMostRecent, upsertContactFromProfile } from './contacts'
import { decodeQrPayload } from './qr-payload'
import { createCafeCursorStorage } from './storage'
import type { Contact, Profile, ProfileInput, QrPayload } from './types'
import { createProfile } from './validation'

export type CafeCursorTab = 'qr' | 'scan' | 'contacts'
export type CafeCursorSheet = 'edit-profile' | 'scanned-card' | 'contact-detail' | 'export' | null

export function useCafeCursorState() {
  const storage = useMemo(() => createCafeCursorStorage(), [])
  const [hydrated, setHydrated] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [activeTab, setActiveTab] = useState<CafeCursorTab>('qr')
  const [activeSheet, setActiveSheet] = useState<CafeCursorSheet>(null)
  const [scannedPayload, setScannedPayload] = useState<QrPayload | null>(null)
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    setProfile(storage.getProfile())
    setContacts(sortContactsByMostRecent(storage.getContacts()))
    setHydrated(true)
  }, [storage])

  useEffect(() => {
    if (!toast) return
    const timeout = window.setTimeout(() => setToast(null), 2200)
    return () => window.clearTimeout(timeout)
  }, [toast])

  const selectedContact = contacts.find(contact => contact.id === selectedContactId) ?? null
  const scannedDuplicate = scannedPayload
    ? findDuplicateContact(contacts, scannedPayload.profile)
    : undefined

  const saveProfile = useCallback(
    (input: ProfileInput) => {
      const nextProfile = createProfile(input, { id: profile?.id })
      storage.saveProfile(nextProfile)
      setProfile(nextProfile)
      setActiveTab('qr')
      setActiveSheet(null)
      setToast(profile ? 'Profile updated' : "You're ready")
    },
    [profile, storage],
  )

  const handleDecodedValue = useCallback((value: string) => {
    const payload = decodeQrPayload(value)
    if (!payload) {
      setToast('That QR is not a Cafe Cursor card')
      return false
    }

    setScannedPayload(payload)
    setActiveSheet('scanned-card')
    if (navigator.vibrate) navigator.vibrate(35)
    return true
  }, [])

  const saveScannedContact = useCallback(
    (note?: string) => {
      if (!scannedPayload) return null
      const result = upsertContactFromProfile(contacts, scannedPayload.profile, { note })
      storage.saveContacts(result.contacts)
      setContacts(sortContactsByMostRecent(result.contacts))
      setToast(result.created ? 'Contact saved' : 'Already saved')
      return result.contact
    },
    [contacts, scannedPayload, storage],
  )

  const updateContactNote = useCallback(
    (contactId: string, note: string) => {
      const nextContacts = contacts.map(contact =>
        contact.id === contactId
          ? { ...contact, note: note.trim() || undefined, updatedAt: new Date().toISOString() }
          : contact,
      )
      storage.saveContacts(nextContacts)
      setContacts(sortContactsByMostRecent(nextContacts))
      setToast('Note saved')
    },
    [contacts, storage],
  )

  const deleteContact = useCallback(
    (contactId: string) => {
      const nextContacts = contacts.filter(contact => contact.id !== contactId)
      storage.saveContacts(nextContacts)
      setContacts(nextContacts)
      setSelectedContactId(null)
      setActiveSheet(null)
      setToast('Contact deleted')
    },
    [contacts, storage],
  )

  const openContact = useCallback((contactId: string) => {
    setSelectedContactId(contactId)
    setActiveSheet('contact-detail')
  }, [])

  return {
    hydrated,
    profile,
    contacts,
    activeTab,
    activeSheet,
    scannedPayload,
    scannedDuplicate,
    selectedContact,
    toast,
    setActiveTab,
    setActiveSheet,
    saveProfile,
    handleDecodedValue,
    saveScannedContact,
    updateContactNote,
    deleteContact,
    openContact,
  }
}
