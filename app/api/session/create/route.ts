import { createSession } from '@/lib/session-manager';

export async function POST() {
  const session = createSession();
  return Response.json(session);
}
