import { getSessionFiles } from '@/lib/session-manager';

export async function POST(request: Request) {
  const sessionId = request.headers.get('x-session-id');
  const fileId = request.headers.get('x-file-id');

  if (!sessionId || !fileId) {
    return Response.json({ error: 'Missing session or file ID' }, { status: 400 });
  }

  const files = await getSessionFiles(sessionId);
  const file = files.find(f => f.id === fileId);

  if (!file) {
    return Response.json({ error: 'File not found' }, { status: 404 });
  }

  // Return the blob URL so client can download
  return Response.json({ url: file.blobUrl, name: file.name });
}
