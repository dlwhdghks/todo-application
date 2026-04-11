import type { VercelRequest, VercelResponse } from "@vercel/node";
import { authenticateRequest } from "../_lib/auth";
import { getAdminClient } from "../_lib/supabase";

// PATCH  /api/quests/:id   - 퀘스트 수정
// DELETE /api/quests/:id   - 퀘스트 삭제
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const userId = await authenticateRequest(req);
  if (!userId) {
    return res.status(401).json({ error: "Invalid or missing API token" });
  }

  const { id } = req.query;
  if (typeof id !== "string") {
    return res.status(400).json({ error: "Invalid quest id" });
  }

  const supabase = getAdminClient();

  if (req.method === "PATCH") {
    const { title, date, time, repeat, color } = req.body;

    const updates: Record<string, string> = {};
    if (title) updates.title = title;
    if (date) updates.date = date;
    if (time) updates.time = time;
    if (repeat) updates.repeat = repeat;
    if (color) updates.color = color;

    const { error } = await supabase
      .from("quests")
      .update(updates)
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ id, ...updates });
  }

  if (req.method === "DELETE") {
    const { error } = await supabase
      .from("quests")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ deleted: id });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
