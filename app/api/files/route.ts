import { getSessionFiles, removeFileFromSession } from '@/lib/session-manager';
import { del } from '@vercel/blob';

export async function GET(request: Request) {
  const sessionId = request.headers.get('x-session-id');
  if (!sessionId) {
    return Response.json({ error: 'Missing session ID' }, { status: 400 });
  }

  const files = getSessionFiles(sessionId);
  return Response.json({ files });
}

export async function DELETE(request: Request) {
  const sessionId = request.headers.get('x-session-id');
  const fileId = request.headers.get('x-file-id');

  if (!sessionId || !fileId) {
    return Response.json({ error: 'Missing session or file ID' }, { status: 400 });
  }

  const files = getSessionFiles(sessionId);
  const file = files.find(f => f.id === fileId);

  if (!file) {
    return Response.json({ error: 'File not found' }, { status: 404 });
  }

  try {
    // Delete from Blob
    await del(file.blobUrl);
    // Remove from session
    removeFileFromSession(sessionId, fileId);
    return Response.json({ success: true });
  } catch (error) {
    console.error('Delete failed:', error);
    return Response.json({ error: 'Delete failed' }, { status: 500 });
  }
}
