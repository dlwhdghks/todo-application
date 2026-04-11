import type { VercelRequest, VercelResponse } from "@vercel/node";
import { authenticateRequest } from "../../_lib/auth";
import { getAdminClient } from "../../_lib/supabase";

// POST /api/quests/:id/complete   - 특정 날짜의 완료/미완료 토글
// body: { date: "YYYY-MM-DD" }
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const userId = await authenticateRequest(req);
  if (!userId) {
    return res.status(401).json({ error: "Invalid or missing API token" });
  }

  const { id } = req.query;
  if (typeof id !== "string") {
    return res.status(400).json({ error: "Invalid quest id" });
  }

  const { date } = req.body;
  if (!date) {
    return res.status(400).json({ error: "date is required (YYYY-MM-DD)" });
  }

  const supabase = getAdminClient();

  // 이미 완료되었는지 확인
  const { data: existing } = await supabase
    .from("quest_completions")
    .select("id")
    .eq("quest_id", id)
    .eq("user_id", userId)
    .eq("completed_date", date)
    .single();

  if (existing) {
    // 완료 취소
    await supabase.from("quest_completions").delete().eq("id", existing.id);

    // EXP -10
    const { data: progress } = await supabase
      .from("user_progress")
      .select("level, exp")
      .eq("user_id", userId)
      .single();

    if (progress) {
      let newExp = progress.exp - 10;
      let newLevel = progress.level;
      while (newExp < 0) {
        newLevel -= 1;
        newExp += 100;
      }
      if (newLevel < 1) { newLevel = 1; newExp = 0; }
      await supabase
        .from("user_progress")
        .update({ level: newLevel, exp: newExp })
        .eq("user_id", userId);
    }

    return res.status(200).json({ questId: id, date, completed: false });
  } else {
    // 완료 처리
    await supabase.from("quest_completions").insert({
      quest_id: id,
      user_id: userId,
      completed_date: date,
    });

    // EXP +10
    const { data: progress } = await supabase
      .from("user_progress")
      .select("level, exp")
      .eq("user_id", userId)
      .single();

    if (progress) {
      let newExp = progress.exp + 10;
      let newLevel = progress.level;
      while (newExp >= 100) {
        newExp -= 100;
        newLevel += 1;
      }
      await supabase
        .from("user_progress")
        .update({ level: newLevel, exp: newExp })
        .eq("user_id", userId);
    }

    return res.status(200).json({ questId: id, date, completed: true });
  }
}
