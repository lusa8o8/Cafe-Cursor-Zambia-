'use client'

import { ExternalLink } from 'lucide-react'
import { getInitials } from '@/lib/cafe-cursor/contacts'
import type { Contact, Profile } from '@/lib/cafe-cursor/types'

type PersonCardProps = {
  person: Profile | Contact
  note?: string
}

function linkHost(value: string) {
  try {
    return new URL(value).hostname.replace(/^www\./, '')
  } catch {
    return value
  }
}

export function PersonCard({ person, note }: PersonCardProps) {
  const links = [
    person.github ? { label: 'GitHub', href: person.github } : null,
    person.linkedin ? { label: 'LinkedIn', href: person.linkedin } : null,
  ].filter(Boolean) as Array<{ label: string; href: string }>

  return (
    <div className="rounded-2xl border border-white/10 bg-[var(--cc-surface-raised)] p-4">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#f7c7a3]/15 text-lg text-[#f7c7a3]">
          {getInitials(person.name)}
        </div>
        <div className="min-w-0">
          <h3 className="text-2xl font-normal tracking-[-0.03em]">{person.name}</h3>
          {person.role && <p className="mt-1 text-sm text-[var(--cc-muted)]">{person.role}</p>}
          {person.oneLiner && (
            <p className="mt-3 text-sm leading-6 text-[var(--cc-muted)]">{person.oneLiner}</p>
          )}
        </div>
      </div>

      {links.length > 0 && (
        <div className="mt-5 divide-y divide-white/10 overflow-hidden rounded-xl border border-white/10">
          {links.map(link => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between gap-4 bg-black/10 px-4 py-3 text-sm transition hover:bg-white/5"
            >
              <span>{link.label}</span>
              <span className="flex min-w-0 items-center gap-2 text-[var(--cc-muted)]">
                <span className="truncate">{linkHost(link.href)}</span>
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </span>
            </a>
          ))}
        </div>
      )}

      {note && <p className="mt-4 rounded-xl bg-black/10 p-3 text-sm text-[var(--cc-muted)]">{note}</p>}
    </div>
  )
}
