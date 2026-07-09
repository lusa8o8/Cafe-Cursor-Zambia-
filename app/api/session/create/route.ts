import { createSession } from '@/lib/session-manager';

export async function POST() {
  const session = await createSession();
  return Response.json(session);
}
