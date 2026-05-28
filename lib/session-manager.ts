import { v4 as uuidv4 } from 'uuid';

export interface FileRecord {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  blobUrl: string;
  uploadedAt: number;
}

export interface Session {
  id: string;
  code: string;
  createdAt: number;
  expiresAt: number;
  files: FileRecord[];
}

// In-memory session store
const sessions = new Map<string, Session>();

// Generate a 6-digit numeric code
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Create a new session
export function createSession(): Session {
  const id = uuidv4();
  const code = generateCode();
  const now = Date.now();
  const expiresAt = now + 15 * 60 * 1000; // 15 minutes

  const session: Session = {
    id,
    code,
    createdAt: now,
    expiresAt,
    files: [],
  };

  sessions.set(id, session);
  return session;
}

// Get session by ID
export function getSession(id: string): Session | null {
  const session = sessions.get(id);
  if (!session) return null;
  
  // Check if expired
  if (Date.now() > session.expiresAt) {
    sessions.delete(id);
    return null;
  }

  return session;
}

// Get session by code
export function getSessionByCode(code: string): Session | null {
  for (const session of sessions.values()) {
    if (session.code === code && Date.now() <= session.expiresAt) {
      return session;
    }
  }
  return null;
}

// Add file to session
export function addFileToSession(sessionId: string, file: FileRecord): boolean {
  const session = getSession(sessionId);
  if (!session) return false;

  session.files.push(file);
  return true;
}

// Remove file from session
export function removeFileFromSession(sessionId: string, fileId: string): boolean {
  const session = getSession(sessionId);
  if (!session) return false;

  const index = session.files.findIndex(f => f.id === fileId);
  if (index === -1) return false;

  session.files.splice(index, 1);
  return true;
}

// Get files in session
export function getSessionFiles(sessionId: string): FileRecord[] {
  const session = getSession(sessionId);
  return session?.files || [];
}

// Cleanup expired sessions (call periodically)
export function cleanupExpiredSessions(): void {
  const now = Date.now();
  for (const [id, session] of sessions.entries()) {
    if (now > session.expiresAt) {
      sessions.delete(id);
    }
  }
}
