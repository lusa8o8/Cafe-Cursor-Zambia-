'use client'

import { Button } from '@/components/ui/button'
import { getInitials } from '@/lib/cafe-cursor/contacts'
import type { Contact } from '@/lib/cafe-cursor/types'

type ContactsScreenProps = {
  contacts: Contact[]
  onOpenContact: (contactId: string) => void
  onScan: () => void
  onExport: () => void
}

function relativeTime(value: string) {
  const delta = Date.now() - Date.parse(value)
  const minutes = Math.max(1, Math.round(delta / 60000))
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  return days === 1 ? 'yesterday' : `${days}d ago`
}

export function ContactsScreen({ contacts, onOpenContact, onScan, onExport }: ContactsScreenProps) {
  return (
    <section className="mx-auto flex min-h-[calc(100dvh-5.5rem)] max-w-md flex-col px-5 pb-28 pt-5">
      <div className="mb-6">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--cc-muted)]">Met</p>
        <h1 className="mt-2 text-3xl font-normal tracking-[-0.04em]">Met at the event</h1>
        <p className="mt-2 text-[var(--cc-muted)]">
          {contacts.length === 1 ? '1 person' : `${contacts.length} people`}
        </p>
      </div>

      {contacts.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-white/10 bg-white/5 p-8 text-center">
          <p className="text-xl tracking-[-0.02em]">Scan someone&apos;s QR to add them here.</p>
          <Button
            type="button"
            onClick={onScan}
            className="mt-6 h-11 rounded-full bg-[var(--cc-accent)] px-6 text-white hover:bg-[var(--cc-accent-hover)]"
          >
            Scan a QR
          </Button>
        </div>
      ) : (
        <>
          <div className="divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10 bg-[var(--cc-surface)]">
            {contacts.map(contact => (
              <button
                key={contact.id}
                type="button"
                onClick={() => onOpenContact(contact.id)}
                className="flex w-full items-center gap-4 px-4 py-4 text-left transition hover:bg-white/5"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#b9f2d0]/10 text-sm text-[#b9f2d0]">
                  {getInitials(contact.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base">{contact.name}</p>
                  <p className="mt-1 truncate text-sm text-[var(--cc-muted)]">
                    {[contact.role, relativeTime(contact.metAt)].filter(Boolean).join(' · ')}
                  </p>
                </div>
              </button>
            ))}
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={onExport}
            className="mt-5 h-11 rounded-full border border-white/10 bg-white/5 text-[var(--cc-text)] hover:bg-white/10"
          >
            Export contacts
          </Button>
        </>
      )}
    </section>
  )
}
