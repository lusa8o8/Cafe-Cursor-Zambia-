'use client'

import { ProfileForm } from './ProfileForm'
import type { ProfileInput } from '@/lib/cafe-cursor/types'

type SetupScreenProps = {
  onSave: (input: ProfileInput) => void
}

export function SetupScreen({ onSave }: SetupScreenProps) {
  return (
    <main className="min-h-dvh bg-[var(--cc-bg)] px-5 py-8 text-[var(--cc-text)]">
      <div className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-md flex-col justify-center">
        <div className="mb-8">
          <div className="mb-5 inline-flex rounded-full bg-[#f7c7a3]/10 px-3 py-1 font-mono text-xs uppercase tracking-[0.18em] text-[#f7c7a3]">
            Cafe Cursor · Zambia
          </div>
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-[var(--cc-surface-raised)] text-2xl">
            CC
          </div>
          <h1 className="text-4xl font-normal tracking-[-0.04em]">Build your event card.</h1>
          <p className="mt-3 text-base leading-7 text-[var(--cc-muted)]">
            No account. No setup maze. Add your name, generate a QR, and get back to the
            conversation.
          </p>
        </div>

        <ProfileForm submitLabel="Generate my QR" onSubmit={onSave} />

        <p className="mt-5 text-center font-mono text-xs uppercase tracking-[0.16em] text-[var(--cc-muted)]">
          Stored only on this device
        </p>
      </div>
    </main>
  )
}
