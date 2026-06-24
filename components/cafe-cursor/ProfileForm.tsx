'use client'

import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { Profile, ProfileInput } from '@/lib/cafe-cursor/types'

type ProfileFormProps = {
  profile?: Profile | null
  submitLabel: string
  onSubmit: (input: ProfileInput) => void
}

export function ProfileForm({ profile, submitLabel, onSubmit }: ProfileFormProps) {
  const [values, setValues] = useState<ProfileInput>({
    name: profile?.name ?? '',
    role: profile?.role ?? '',
    oneLiner: profile?.oneLiner ?? '',
    github: profile?.github ?? '',
    linkedin: profile?.linkedin ?? '',
  })
  const [error, setError] = useState<string | null>(null)

  function updateField(field: keyof ProfileInput, value: string) {
    setValues(current => ({ ...current, [field]: value }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!values.name.trim()) {
      setError('Name is required')
      return
    }

    setError(null)
    onSubmit(values)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={values.name}
          onChange={event => updateField('name', event.target.value)}
          placeholder="Your name"
          className="h-12 rounded-xl border-white/10 bg-white/5 text-base text-[var(--cc-text)] placeholder:text-[var(--cc-muted)]"
          aria-invalid={Boolean(error)}
        />
        {error && <p className="text-sm text-[var(--cc-accent)]">{error}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role / title</Label>
        <Input
          id="role"
          value={values.role}
          onChange={event => updateField('role', event.target.value)}
          placeholder="Founder · Developer · Designer"
          className="h-12 rounded-xl border-white/10 bg-white/5 text-base text-[var(--cc-text)] placeholder:text-[var(--cc-muted)]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="oneLiner">One-liner</Label>
        <Textarea
          id="oneLiner"
          value={values.oneLiner}
          onChange={event => updateField('oneLiner', event.target.value)}
          placeholder="Building with Cursor..."
          className="min-h-20 rounded-xl border-white/10 bg-white/5 text-base text-[var(--cc-text)] placeholder:text-[var(--cc-muted)]"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="github">GitHub</Label>
          <Input
            id="github"
            value={values.github}
            onChange={event => updateField('github', event.target.value)}
            placeholder="@username"
            className="h-12 rounded-xl border-white/10 bg-white/5 text-base text-[var(--cc-text)] placeholder:text-[var(--cc-muted)]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="linkedin">LinkedIn</Label>
          <Input
            id="linkedin"
            value={values.linkedin}
            onChange={event => updateField('linkedin', event.target.value)}
            placeholder="linkedin.com/in/..."
            className="h-12 rounded-xl border-white/10 bg-white/5 text-base text-[var(--cc-text)] placeholder:text-[var(--cc-muted)]"
          />
        </div>
      </div>

      <Button
        type="submit"
        className="h-12 w-full rounded-full bg-[var(--cc-accent)] text-base text-white hover:bg-[var(--cc-accent-hover)]"
      >
        {submitLabel}
      </Button>
    </form>
  )
}
