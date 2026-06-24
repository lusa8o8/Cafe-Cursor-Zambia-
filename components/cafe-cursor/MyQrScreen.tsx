'use client'

import { useMemo, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Button } from '@/components/ui/button'
import { encodeQrPayload } from '@/lib/cafe-cursor/qr-payload'
import type { Profile } from '@/lib/cafe-cursor/types'
import { PersonCard } from './PersonCard'

type MyQrScreenProps = {
  profile: Profile
  onEdit: () => void
}

export function MyQrScreen({ profile, onEdit }: MyQrScreenProps) {
  const [showCard, setShowCard] = useState(false)
  const [hint, setHint] = useState(false)
  const payload = useMemo(() => encodeQrPayload(profile), [profile])

  return (
    <section className="mx-auto flex min-h-[calc(100dvh-5.5rem)] max-w-md flex-col px-5 pb-28 pt-5">
      <div className="mb-8 flex items-center justify-between">
        <button className="text-sm text-[var(--cc-muted)] transition hover:text-[var(--cc-text)]" onClick={onEdit}>
          Edit
        </button>
        <span className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--cc-muted)]">
          Cafe Cursor
        </span>
      </div>

      <div className="text-center">
        <h1 className="text-[2rem] font-normal leading-tight tracking-[-0.045em]">{profile.name}</h1>
        {profile.role && <p className="mt-2 text-[var(--cc-muted)]">{profile.role}</p>}
      </div>

      <div className="mt-9 flex flex-1 flex-col justify-center">
        {showCard ? (
          <PersonCard person={profile} />
        ) : (
          <button
            type="button"
            onClick={() => setHint(true)}
            onContextMenu={event => {
              event.preventDefault()
              setHint(true)
            }}
            className="mx-auto rounded-[1.35rem] bg-white p-5 shadow-2xl shadow-black/30"
            aria-label="Cafe Cursor QR code"
          >
            <QRCodeSVG value={payload} size={260} bgColor="#ffffff" fgColor="#000000" level="M" />
          </button>
        )}

        <p className="mt-6 text-center font-mono text-xs uppercase tracking-[0.18em] text-[var(--cc-muted)]">
          Cafe Cursor Zambia
        </p>

        {hint && !showCard && (
          <p className="mx-auto mt-3 max-w-xs text-center text-sm text-[var(--cc-muted)]">
            If the venue is dim, turn up brightness before someone scans.
          </p>
        )}
      </div>

      <Button
        type="button"
        variant="secondary"
        onClick={() => setShowCard(current => !current)}
        className="mt-8 h-11 rounded-full border border-white/10 bg-white/5 text-[var(--cc-text)] hover:bg-white/10"
      >
        {showCard ? 'Show QR' : 'Flip to card view'}
      </Button>
    </section>
  )
}
