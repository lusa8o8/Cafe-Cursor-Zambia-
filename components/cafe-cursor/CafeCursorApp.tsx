'use client'

import { BottomNav } from './BottomNav'
import { ContactDetailSheet } from './ContactDetailSheet'
import { ContactsScreen } from './ContactsScreen'
import { EditProfileSheet } from './EditProfileSheet'
import { ExportSheet } from './ExportSheet'
import { MyQrScreen } from './MyQrScreen'
import { ScanScreen } from './ScanScreen'
import { ScannedCardSheet } from './ScannedCardSheet'
import { ServiceWorkerRegistration } from './ServiceWorkerRegistration'
import { SetupScreen } from './SetupScreen'
import { useCafeCursorState } from '@/lib/cafe-cursor/use-cafe-cursor-state'

export function CafeCursorApp() {
  const state = useCafeCursorState()

  if (!state.hydrated) {
    return <main className="min-h-dvh bg-[var(--cc-bg)]" aria-label="Loading Cafe Cursor" />
  }

  if (!state.profile) {
    return (
      <>
        <ServiceWorkerRegistration />
        <SetupScreen onSave={state.saveProfile} />
      </>
    )
  }

  return (
    <main className="min-h-dvh bg-[var(--cc-bg)] text-[var(--cc-text)]">
      <ServiceWorkerRegistration />
      {state.activeTab === 'qr' && (
        <MyQrScreen profile={state.profile} onEdit={() => state.setActiveSheet('edit-profile')} />
      )}
      {state.activeTab === 'scan' && <ScanScreen onDecode={state.handleDecodedValue} />}
      {state.activeTab === 'contacts' && (
        <ContactsScreen
          contacts={state.contacts}
          onOpenContact={state.openContact}
          onScan={() => state.setActiveTab('scan')}
          onExport={() => state.setActiveSheet('export')}
        />
      )}

      <BottomNav activeTab={state.activeTab} onTabChange={state.setActiveTab} />

      <EditProfileSheet
        open={state.activeSheet === 'edit-profile'}
        profile={state.profile}
        onOpenChange={open => state.setActiveSheet(open ? 'edit-profile' : null)}
        onSave={state.saveProfile}
      />
      <ScannedCardSheet
        open={state.activeSheet === 'scanned-card'}
        payload={state.scannedPayload}
        duplicate={state.scannedDuplicate}
        onOpenChange={open => state.setActiveSheet(open ? 'scanned-card' : null)}
        onSave={state.saveScannedContact}
      />
      <ContactDetailSheet
        open={state.activeSheet === 'contact-detail'}
        contact={state.selectedContact}
        onOpenChange={open => state.setActiveSheet(open ? 'contact-detail' : null)}
        onSaveNote={state.updateContactNote}
        onDelete={state.deleteContact}
      />
      <ExportSheet
        open={state.activeSheet === 'export'}
        contacts={state.contacts}
        onOpenChange={open => state.setActiveSheet(open ? 'export' : null)}
      />

      {state.toast && (
        <div
          role="status"
          className="fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-full border border-white/10 bg-[var(--cc-surface-raised)] px-4 py-2 text-sm shadow-xl"
        >
          {state.toast}
        </div>
      )}
    </main>
  )
}
