'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import type { Contact } from '@/lib/cafe-cursor/types'
import { BottomSheet } from './BottomSheet'
import { PersonCard } from './PersonCard'

type ContactDetailSheetProps = {
  open: boolean
  contact: Contact | null
  onOpenChange: (open: boolean) => void
  onSaveNote: (contactId: string, note: string) => void
  onDelete: (contactId: string) => void
}

export function ContactDetailSheet({
  open,
  contact,
  onOpenChange,
  onSaveNote,
  onDelete,
}: ContactDetailSheetProps) {
  const [note, setNote] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    setNote(contact?.note ?? '')
    setConfirmDelete(false)
  }, [contact?.id, contact?.note])

  if (!contact) return null

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} title="Contact detail">
      <PersonCard person={contact} note={contact.note} />

      <div className="mt-5 space-y-2">
        <label htmlFor="contact-note" className="text-sm text-[var(--cc-muted)]">
          Note
        </label>
        <Textarea
          id="contact-note"
          value={note}
          onChange={event => setNote(event.target.value)}
          onBlur={() => onSaveNote(contact.id, note)}
          placeholder="Add what you talked about"
          className="min-h-24 rounded-xl border-white/10 bg-white/5 text-[var(--cc-text)]"
        />
      </div>

      <div className="mt-6 border-t border-white/10 pt-5">
        {confirmDelete ? (
          <div className="space-y-3">
            <p className="text-sm text-[var(--cc-muted)]">Delete this contact from this device?</p>
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setConfirmDelete(false)}
                className="rounded-full bg-white/5 text-[var(--cc-text)] hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => onDelete(contact.id)}
                className="rounded-full"
              >
                Delete
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="text-sm text-red-300 transition hover:text-red-200"
          >
            Delete contact
          </button>
        )}
      </div>
    </BottomSheet>
  )
}
