'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { contactsToCsv, contactsToText, contactsToVCard, createDownload } from '@/lib/cafe-cursor/export'
import type { Contact } from '@/lib/cafe-cursor/types'
import { BottomSheet } from './BottomSheet'

type ExportSheetProps = {
  open: boolean
  contacts: Contact[]
  onOpenChange: (open: boolean) => void
}

export function ExportSheet({ open, contacts, onOpenChange }: ExportSheetProps) {
  const [copied, setCopied] = useState(false)

  async function copyAll() {
    await navigator.clipboard.writeText(contactsToText(contacts))
    setCopied(true)
  }

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Export contacts"
      description="Stored only on this device."
    >
      <div className="space-y-3">
        <Button
          type="button"
          onClick={() => createDownload('cafe-cursor-zambia.vcf', contactsToVCard(contacts), 'text/vcard')}
          className="h-12 w-full rounded-full bg-[var(--cc-accent)] text-white hover:bg-[var(--cc-accent-hover)]"
          disabled={contacts.length === 0}
        >
          Export as .vcf
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => createDownload('cafe-cursor-zambia.csv', contactsToCsv(contacts), 'text/csv')}
          className="h-12 w-full rounded-full border border-white/10 bg-white/5 text-[var(--cc-text)] hover:bg-white/10"
          disabled={contacts.length === 0}
        >
          Export as .csv
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={copyAll}
          className="h-12 w-full rounded-full border border-white/10 bg-white/5 text-[var(--cc-text)] hover:bg-white/10"
          disabled={contacts.length === 0}
        >
          {copied ? 'Copied' : 'Copy all as text'}
        </Button>
      </div>

      <p className="mt-5 rounded-2xl bg-white/5 p-4 text-sm leading-6 text-[var(--cc-muted)]">
        Cafe Cursor keeps your event contacts in this browser only. Export before clearing browser data.
      </p>
    </BottomSheet>
  )
}
