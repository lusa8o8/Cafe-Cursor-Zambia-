import { getSession, getSessionByCode } from '@/lib/session-manager';

export async function POST(request: Request) {
  const { id, code } = await request.json();

  let session = null;
  if (id) {
    session = await getSession(id);
  } else if (code) {
    session = await getSessionByCode(code);
  }

  if (!session) {
    return Response.json({ error: 'Invalid or expired session' }, { status: 404 });
  }

  return Response.json({
    id: session.id,
    code: session.code,
    expiresAt: session.expiresAt,
    fileCount: session.files.length,
  });
}
