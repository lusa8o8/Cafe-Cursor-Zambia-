import { v4 as uuidv4 } from 'uuid';
import { put } from '@vercel/blob';
import { addFileToSession, getSession } from '@/lib/session-manager';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: Request) {
  const sessionId = request.headers.get('x-session-id');
  if (!sessionId) {
    return Response.json({ error: 'Missing session ID' }, { status: 400 });
  }

  const session = await getSession(sessionId);
  if (!session) {
    return Response.json({ error: 'Invalid or expired session' }, { status: 404 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return Response.json({ error: 'Missing file' }, { status: 400 });
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return Response.json(
      { error: `File size exceeds 5MB limit (${(file.size / 1024 / 1024).toFixed(2)}MB)` },
      { status: 400 }
    );
  }

  try {
    // Upload to Vercel Blob
    const blob = await put(`transfers/${sessionId}/${uuidv4()}-${file.name}`, file, {
      access: 'private',
      addRandomSuffix: false,
    });

    const fileRecord = {
      id: uuidv4(),
      name: file.name,
      size: file.size,
      mimeType: file.type,
      blobUrl: blob.url,
      uploadedAt: Date.now(),
    };

    await addFileToSession(sessionId, fileRecord);

    return Response.json(fileRecord);
  } catch (error) {
    console.error('Upload failed:', error);
    return Response.json({ error: 'Upload failed' }, { status: 500 });
  }
}
