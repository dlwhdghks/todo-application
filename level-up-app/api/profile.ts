import type { VercelRequest, VercelResponse } from "@vercel/node";
import { authenticateRequest } from "./_lib/auth.js";
import { getAdminClient } from "./_lib/supabase.js";

// GET /api/profile - 내 프로필 조회
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const userId = await authenticateRequest(req);
  if (!userId) {
    return res.status(401).json({ error: "Invalid or missing API token" });
  }

  const supabase = getAdminClient();

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("nickname, friend_code")
    .eq("user_id", userId)
    .single();

  const { data: progress } = await supabase
    .from("user_progress")
    .select("level, exp")
    .eq("user_id", userId)
    .single();

  return res.status(200).json({
    nickname: profile?.nickname ?? null,
    friendCode: profile?.friend_code ?? null,
    level: progress?.level ?? 1,
    exp: progress?.exp ?? 0,
  });
}
