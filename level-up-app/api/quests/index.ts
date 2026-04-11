import type { VercelRequest, VercelResponse } from "@vercel/node";
import { authenticateRequest } from "../_lib/auth.js";
import { getAdminClient } from "../_lib/supabase.js";

// GET  /api/quests       - 퀘스트 목록 조회
// POST /api/quests       - 퀘스트 생성
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
    const { title, date, time, repeat, color } = req.body;

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

    return res.status(201).json({ id, title, date, time, repeat: repeat || "none", color: color || "#e94560" });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
