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

const SESSION_TTL = 15 * 60; // 15 minutes in seconds

async function redis(command: string[], token?: string): Promise<any> {
  const url = process.env.KV_REST_API_URL;
  const bearerToken = token || process.env.KV_REST_API_TOKEN;

  if (!url || !bearerToken) {
    throw new Error('Redis credentials not configured');
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${bearerToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
  });

  if (!response.ok) {
    throw new Error(`Redis error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.result;
}

// Generate a 6-digit numeric code
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Create a new session
export async function createSession(): Promise<Session> {
  const id = uuidv4();
  const code = generateCode();
  const now = Date.now();
  const expiresAt = now + SESSION_TTL * 1000;

  const session: Session = {
    id,
    code,
    createdAt: now,
    expiresAt,
    files: [],
  };

  // Store session with TTL
  await redis(['SET', `session:${id}`, JSON.stringify(session), 'EX', SESSION_TTL.toString()]);
  // Store code->id mapping with TTL
  await redis(['SET', `code:${code}`, id, 'EX', SESSION_TTL.toString()]);

  return session;
}

// Get session by ID
export async function getSession(id: string): Promise<Session | null> {
  try {
    const data = await redis(['GET', `session:${id}`]);
    if (!data) return null;
    return JSON.parse(data) as Session;
  } catch {
    return null;
  }
}

// Get session by code
export async function getSessionByCode(code: string): Promise<Session | null> {
  try {
    const id = await redis(['GET', `code:${code}`]);
    if (!id) return null;
    return getSession(id);
  } catch {
    return null;
  }
}

// Add file to session
export async function addFileToSession(sessionId: string, file: FileRecord): Promise<boolean> {
  try {
    const session = await getSession(sessionId);
    if (!session) return false;

    session.files.push(file);

    // Update with remaining TTL
    const ttl = Math.ceil((session.expiresAt - Date.now()) / 1000);
    await redis(['SET', `session:${sessionId}`, JSON.stringify(session), 'EX', ttl.toString()]);
    return true;
  } catch {
    return false;
  }
}

// Remove file from session
export async function removeFileFromSession(sessionId: string, fileId: string): Promise<boolean> {
  try {
    const session = await getSession(sessionId);
    if (!session) return false;

    const index = session.files.findIndex(f => f.id === fileId);
    if (index === -1) return false;

    session.files.splice(index, 1);

    // Update with remaining TTL
    const ttl = Math.ceil((session.expiresAt - Date.now()) / 1000);
    await redis(['SET', `session:${sessionId}`, JSON.stringify(session), 'EX', ttl.toString()]);
    return true;
  } catch {
    return false;
  }
}

// Get files in session
export async function getSessionFiles(sessionId: string): Promise<FileRecord[]> {
  try {
    const session = await getSession(sessionId);
    return session?.files || [];
  } catch {
    return [];
  }
}
