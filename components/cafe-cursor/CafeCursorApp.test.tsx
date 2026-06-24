import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { encodeQrPayload } from '@/lib/cafe-cursor/qr-payload'
import type { Profile } from '@/lib/cafe-cursor/types'
import { CafeCursorApp } from './CafeCursorApp'

const scannedProfile: Profile = {
  id: 'scanned-profile',
  name: 'Mwamba Builder',
  role: 'Founder',
  github: 'https://github.com/mwamba',
  updatedAt: '2026-06-24T18:00:00.000Z',
}

afterEach(() => {
  cleanup()
  localStorage.clear()
})

describe('CafeCursorApp', () => {
  it('creates a profile, accepts a decoded payload, and saves a contact', async () => {
    render(<CafeCursorApp />)

    expect(await screen.findByText('Build your event card.')).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Ada Cursor' } })
    fireEvent.click(screen.getByRole('button', { name: 'Generate my QR' }))

    expect(await screen.findByText('Ada Cursor')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Scan' }))
    fireEvent.click(screen.getByText('Enter link manually'))
    fireEvent.change(screen.getByPlaceholderText('Paste QR payload'), {
      target: { value: encodeQrPayload(scannedProfile) },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Open' }))

    expect(await screen.findByText('Scanned card')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Save contact' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Done' }))

    await waitFor(() => expect(screen.getByRole('button', { name: 'Met' })).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: 'Met' }))
    await waitFor(() => expect(screen.getByText('Mwamba Builder')).toBeInTheDocument())
    expect(screen.getByText('1 person')).toBeInTheDocument()
  })
})
