import type { VercelRequest } from "@vercel/node";
import { getAdminClient } from "./supabase";

// API 요청에서 Bearer token을 추출하고, 해당 유저 ID를 반환
export async function authenticateRequest(
  req: VercelRequest
): Promise<string | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice(7);
  const supabase = getAdminClient();

  // 토큰으로 유저 조회
  const { data, error } = await supabase
    .from("api_tokens")
    .select("user_id")
    .eq("token", token)
    .single();

  if (error || !data) {
    return null;
  }

  // last_used_at 업데이트
  await supabase
    .from("api_tokens")
    .update({ last_used_at: new Date().toISOString() })
    .eq("token", token);

  return data.user_id;
}
