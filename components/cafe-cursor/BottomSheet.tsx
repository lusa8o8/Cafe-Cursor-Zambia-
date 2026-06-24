'use client'

import type { ReactNode } from 'react'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { cn } from '@/lib/utils'

type BottomSheetProps = {
  open: boolean
  title: string
  description?: string
  children: ReactNode
  onOpenChange: (open: boolean) => void
  className?: string
}

export function BottomSheet({
  open,
  title,
  description,
  children,
  onOpenChange,
  className,
}: BottomSheetProps) {
  if (!open) return null

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        className={cn(
          'mx-auto max-w-md border-white/10 bg-[var(--cc-surface)] text-[var(--cc-text)]',
          className,
        )}
      >
        <DrawerHeader className="text-left">
          <DrawerTitle className="text-xl font-normal tracking-[-0.02em] text-[var(--cc-text)]">
            {title}
          </DrawerTitle>
          {description && (
            <DrawerDescription className="text-[var(--cc-muted)]">{description}</DrawerDescription>
          )}
        </DrawerHeader>
        <div className="max-h-[68vh] overflow-y-auto px-4 pb-6">{children}</div>
      </DrawerContent>
    </Drawer>
  )
}
