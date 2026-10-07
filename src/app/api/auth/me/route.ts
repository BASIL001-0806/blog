import { extractToken, lookupUserByToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { token, seen } = await extractToken(req);
  const user = await lookupUserByToken(token);
  return Response.json(
    { user, transports: seen, tokenPresent: Boolean(token) },
    { headers: { "Cache-Control": "no-store" } }
  );
}
