'use client'

import { ProfileForm } from './ProfileForm'
import type { Profile, ProfileInput } from '@/lib/cafe-cursor/types'
import { BottomSheet } from './BottomSheet'
import { PersonCard } from './PersonCard'

type EditProfileSheetProps = {
  open: boolean
  profile: Profile | null
  onOpenChange: (open: boolean) => void
  onSave: (input: ProfileInput) => void
}

export function EditProfileSheet({ open, profile, onOpenChange, onSave }: EditProfileSheetProps) {
  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Edit profile"
      description="Your QR changes when your profile changes."
    >
      {profile && (
        <div className="mb-5">
          <PersonCard person={profile} />
        </div>
      )}
      <ProfileForm profile={profile} submitLabel="Save profile" onSubmit={onSave} />
    </BottomSheet>
  )
}
