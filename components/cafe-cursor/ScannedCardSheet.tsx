'use client'

import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Contact, QrPayload } from '@/lib/cafe-cursor/types'
import { BottomSheet } from './BottomSheet'
import { PersonCard } from './PersonCard'

type ScannedCardSheetProps = {
  open: boolean
  payload: QrPayload | null
  duplicate?: Contact
  onOpenChange: (open: boolean) => void
  onSave: (note?: string) => Contact | null
}

export function ScannedCardSheet({
  open,
  payload,
  duplicate,
  onOpenChange,
  onSave,
}: ScannedCardSheetProps) {
  const [saved, setSaved] = useState(false)
  const [note, setNote] = useState('')

  useEffect(() => {
    setSaved(false)
    setNote('')
  }, [payload?.profile.id])

  if (!payload) return null

  function handleSave() {
    onSave(note)
    setSaved(true)
  }

  const alreadySaved = Boolean(duplicate) || saved

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Scanned card"
      description="Save the person you just met."
    >
      <PersonCard person={payload.profile} />

      {alreadySaved ? (
        <div className="mt-5 rounded-2xl border border-[#4ade80]/20 bg-[#4ade80]/10 p-4 text-sm text-[#b7f7cd]">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4" aria-hidden="true" />
            Already saved
          </div>
          <div className="mt-4 space-y-2">
            <label htmlFor="scan-note" className="text-[var(--cc-muted)]">
              Add a note?
            </label>
            <Input
              id="scan-note"
              value={note}
              onChange={event => setNote(event.target.value)}
              onBlur={() => note.trim() && onSave(note)}
              placeholder="e.g. Follow up about Cursor workshop"
              className="h-11 rounded-full border-white/10 bg-black/10 text-[var(--cc-text)]"
            />
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
            className="mt-4 h-11 w-full rounded-full border border-white/10 bg-white/5 text-[var(--cc-text)] hover:bg-white/10"
          >
            Done
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          onClick={handleSave}
          className="mt-5 h-12 w-full rounded-full bg-[var(--cc-accent)] text-base text-white hover:bg-[var(--cc-accent-hover)]"
        >
          Save contact
        </Button>
      )}
    </BottomSheet>
  )
}
