import type { VercelRequest, VercelResponse } from "@vercel/node";
import { authenticateRequest } from "../_lib/auth.js";
import { getAdminClient } from "../_lib/supabase.js";

// GET  /api/quests       - 퀘스트 목록 조회
// POST /api/quests       - 퀘스트 생성 (+ invite로 친구 초대)
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const userId = await authenticateRequest(req);
  if (!userId) {
    return res.status(401).json({ error: "Invalid or missing API token" });
  }

  const supabase = getAdminClient();

  if (req.method === "GET") {
    const { data: quests } = await supabase
      .from("quests")
      .select("*")
      .eq("user_id", userId)
      .order("date")
      .order("time");

    const { data: completions } = await supabase
      .from("quest_completions")
      .select("quest_id, completed_date")
      .eq("user_id", userId);

    const result = (quests || []).map((q) => ({
      id: q.id,
      title: q.title,
      date: q.date,
      time: q.time,
      repeat: q.repeat,
      color: q.color,
      createdAt: q.created_at,
      completedDates: (completions || [])
        .filter((c) => c.quest_id === q.id)
        .map((c) => c.completed_date),
    }));

    return res.status(200).json(result);
  }

  if (req.method === "POST") {
    const { title, date, time, repeat, color, invite } = req.body;

    if (!title || !date || !time) {
      return res.status(400).json({ error: "title, date, time are required" });
    }

    const id =
      Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

    const { error } = await supabase.from("quests").insert({
      id,
      user_id: userId,
      title,
      date,
      time,
      repeat: repeat || "none",
      color: color || "#e94560",
      created_at: Date.now(),
    });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // 친구 초대 처리
    // invite: 닉네임 배열 (예: ["조셉", "홍길동"])
    const invited: string[] = [];
    const notFound: string[] = [];

    if (invite && Array.isArray(invite) && invite.length > 0) {
      for (const nickname of invite) {
        // 닉네임으로 유저 찾기
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("user_id, nickname")
          .eq("nickname", nickname)
          .single();

        if (!profile || profile.user_id === userId) {
          notFound.push(nickname);
          continue;
        }

        // 친구 관계 확인
        const { data: friendship } = await supabase
          .from("friendships")
          .select("id")
          .or(
            `and(user_id.eq.${userId},friend_id.eq.${profile.user_id}),and(user_id.eq.${profile.user_id},friend_id.eq.${userId})`
          )
          .limit(1)
          .single();

        if (!friendship) {
          notFound.push(nickname + " (not a friend)");
          continue;
        }

        // 초대 발송
        await supabase.from("quest_invitations").insert({
          quest_id: id,
          sender_id: userId,
          receiver_id: profile.user_id,
        });

        invited.push(nickname);
      }
    }

    const response: Record<string, unknown> = {
      id,
      title,
      date,
      time,
      repeat: repeat || "none",
      color: color || "#e94560",
    };

    if (invited.length > 0) response.invited = invited;
    if (notFound.length > 0) response.inviteErrors = notFound;

    return res.status(201).json(response);
  }

  return res.status(405).json({ error: "Method not allowed" });
}
