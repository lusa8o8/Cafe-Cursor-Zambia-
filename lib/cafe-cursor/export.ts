import type { Contact } from './types'

function escapeCsvCell(value: string | undefined) {
  const cell = value ?? ''
  if (!/[",\n\r]/.test(cell)) return cell
  return `"${cell.replace(/"/g, '""')}"`
}

function escapeVCardText(value: string | undefined) {
  return (value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
}

function contactUrlLines(contact: Contact) {
  return [contact.github, contact.linkedin]
    .filter((url): url is string => Boolean(url))
    .map(url => `URL:${url}`)
}

export function contactsToCsv(contacts: Contact[]) {
  const rows = [
    ['Name', 'Role', 'One-liner', 'GitHub', 'LinkedIn', 'Note', 'Event', 'Met at'],
    ...contacts.map(contact => [
      contact.name,
      contact.role,
      contact.oneLiner,
      contact.github,
      contact.linkedin,
      contact.note,
      contact.eventTag,
      contact.metAt,
    ]),
  ]

  return rows.map(row => row.map(escapeCsvCell).join(',')).join('\n')
}

export function contactToVCard(contact: Contact) {
  const noteParts = [contact.oneLiner, contact.note, contact.eventTag].filter(Boolean)

  return [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${escapeVCardText(contact.name)}`,
    contact.role ? `TITLE:${escapeVCardText(contact.role)}` : undefined,
    ...contactUrlLines(contact),
    noteParts.length ? `NOTE:${escapeVCardText(noteParts.join('\n'))}` : undefined,
    `REV:${contact.updatedAt}`,
    'END:VCARD',
  ]
    .filter(Boolean)
    .join('\n')
}

export function contactsToVCard(contacts: Contact[]) {
  return contacts.map(contactToVCard).join('\n')
}

export function contactsToText(contacts: Contact[]) {
  return contacts
    .map(contact => {
      const lines = [
        contact.name,
        contact.role,
        contact.oneLiner,
        contact.github ? `GitHub: ${contact.github}` : undefined,
        contact.linkedin ? `LinkedIn: ${contact.linkedin}` : undefined,
        contact.note ? `Note: ${contact.note}` : undefined,
        `Met: ${contact.eventTag} (${new Date(contact.metAt).toLocaleDateString()})`,
      ].filter(Boolean)

      return lines.join('\n')
    })
    .join('\n\n')
}

export function createDownload(filename: string, contents: string, type: string) {
  const blob = new Blob([contents], { type })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}
