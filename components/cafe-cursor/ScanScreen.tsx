'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { BrowserQRCodeReader, type IScannerControls } from '@zxing/browser'
import { Camera, Keyboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type ScanScreenProps = {
  onDecode: (value: string) => boolean
}

export function ScanScreen({ onDecode }: ScanScreenProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const controlsRef = useRef<IScannerControls | null>(null)
  const [cameraEnabled, setCameraEnabled] = useState(false)
  const [manualValue, setManualValue] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!cameraEnabled || !videoRef.current) return

    let cancelled = false
    const reader = new BrowserQRCodeReader()

    async function startScanner() {
      try {
        const controls = await reader.decodeFromVideoDevice(
          undefined,
          videoRef.current ?? undefined,
          result => {
            const text = result?.getText()
            if (!text) return
            if (onDecode(text)) {
              controlsRef.current?.stop()
            }
          },
        )
        if (cancelled) {
          controls.stop()
          return
        }
        controlsRef.current = controls
      } catch {
        setError('Camera unavailable. You can paste a QR payload instead.')
      }
    }

    startScanner()

    return () => {
      cancelled = true
      controlsRef.current?.stop()
      controlsRef.current = null
    }
  }, [cameraEnabled, onDecode])

  function submitManual(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!manualValue.trim()) return
    onDecode(manualValue.trim())
  }

  return (
    <section className="mx-auto flex min-h-[calc(100dvh-5.5rem)] max-w-md flex-col px-5 pb-28 pt-5">
      <div className="mb-5">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--cc-muted)]">Scan</p>
        <h1 className="mt-2 text-3xl font-normal tracking-[-0.04em]">Point at their QR.</h1>
      </div>

      <div className="relative flex min-h-[54vh] flex-1 overflow-hidden rounded-[1.5rem] border border-white/10 bg-[var(--cc-surface)]">
        {cameraEnabled ? (
          <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
              <Camera className="h-8 w-8 text-[var(--cc-muted)]" aria-hidden="true" />
            </div>
            <p className="text-lg">Scan contacts at the event.</p>
            <p className="mt-2 text-sm leading-6 text-[var(--cc-muted)]">
              Camera is used only for QR scanning and nothing is uploaded.
            </p>
            <Button
              type="button"
              onClick={() => setCameraEnabled(true)}
              className="mt-6 h-11 rounded-full bg-[var(--cc-accent)] px-6 text-white hover:bg-[var(--cc-accent-hover)]"
            >
              Start camera
            </Button>
          </div>
        )}

        <div className="pointer-events-none absolute inset-8 rounded-[1.25rem] border border-white/20" />
        <p className="absolute inset-x-0 bottom-5 text-center text-sm text-white/80">Point at their QR</p>
      </div>

      {error && <p className="mt-3 text-sm text-[var(--cc-accent)]">{error}</p>}

      <details className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
        <summary className="flex cursor-pointer items-center gap-2 text-sm text-[var(--cc-muted)]">
          <Keyboard className="h-4 w-4" aria-hidden="true" />
          Enter link manually
        </summary>
        <form onSubmit={submitManual} className="mt-4 flex gap-2">
          <Input
            value={manualValue}
            onChange={event => setManualValue(event.target.value)}
            placeholder="Paste QR payload"
            className="h-11 rounded-full border-white/10 bg-black/10 text-[var(--cc-text)]"
          />
          <Button type="submit" className="h-11 rounded-full bg-white/10 px-5 text-[var(--cc-text)] hover:bg-white/15">
            Open
          </Button>
        </form>
      </details>
    </section>
  )
}
