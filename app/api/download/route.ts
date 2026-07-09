import { getSessionFiles } from '@/lib/session-manager';

export async function GET(request: Request) {
  const sessionId = request.headers.get('x-session-id');
  const fileId = request.headers.get('x-file-id');

  if (!sessionId || !fileId) {
    return Response.json({ error: 'Missing session or file ID' }, { status: 400 });
  }

  try {
    const files = await getSessionFiles(sessionId);
    const file = files.find(f => f.id === fileId);

    if (!file) {
      return Response.json({ error: 'File not found' }, { status: 404 });
    }

    // Fetch file from private blob storage using the blob URL
    // The blob URL includes auth token for private access
    const response = await fetch(file.blobUrl);
    
    if (!response.ok) {
      console.error(`Blob fetch failed: ${response.status} ${response.statusText}`);
      return Response.json({ error: 'File not found in storage' }, { status: 404 });
    }

    // Return file with proper headers for download
    return new Response(response.body, {
      headers: {
        'Content-Type': file.mimeType || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${file.name}"`,
        'Content-Length': file.size.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Download error:', error);
    return Response.json({ error: 'Download failed' }, { status: 500 });
  }
}
