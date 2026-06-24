'use client'

import { QrCode, ScanLine, Users } from 'lucide-react'
import type { CafeCursorTab } from '@/lib/cafe-cursor/use-cafe-cursor-state'
import { cn } from '@/lib/utils'

const tabs = [
  { id: 'qr', label: 'My QR', icon: QrCode },
  { id: 'scan', label: 'Scan', icon: ScanLine },
  { id: 'contacts', label: 'Met', icon: Users },
] satisfies Array<{ id: CafeCursorTab; label: string; icon: typeof QrCode }>

type BottomNavProps = {
  activeTab: CafeCursorTab
  onTabChange: (tab: CafeCursorTab) => void
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[var(--cc-bg)]/95 px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 backdrop-blur">
      <div className="mx-auto grid max-w-md grid-cols-3 gap-2">
        {tabs.map(tab => {
          const Icon = tab.icon
          const active = activeTab === tab.id

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'flex flex-col items-center gap-1 rounded-2xl px-3 py-2 text-xs transition',
                active ? 'text-[var(--cc-text)]' : 'text-[var(--cc-muted)]',
              )}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              {tab.label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
