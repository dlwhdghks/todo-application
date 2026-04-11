import type { VercelRequest, VercelResponse } from "@vercel/node";
import { authenticateRequest } from "./_lib/auth.js";
import { getAdminClient } from "./_lib/supabase.js";

// POST /api/recommend - AI 퀘스트 추천
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const userId = await authenticateRequest(req);
  if (!userId) {
    return res.status(401).json({ error: "Invalid or missing API token" });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "OpenAI API key not configured" });
  }

  const supabase = getAdminClient();

  // 유저의 최근 퀘스트 30개 가져오기
  const { data: quests } = await supabase
    .from("quests")
    .select("title, date, time, repeat")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(30);

  // 유저 프로필
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("nickname")
    .eq("user_id", userId)
    .single();

  const { data: progress } = await supabase
    .from("user_progress")
    .select("level, exp")
    .eq("user_id", userId)
    .single();

  const questList = (quests || [])
    .map((q) => `- ${q.title} (${q.date} ${q.time}, repeat: ${q.repeat})`)
    .join("\n");

  const today = new Date().toISOString().split("T")[0];

  const prompt = `You are a quest recommender for a gamified to-do app called "Level Up".

User: ${profile?.nickname || "Unknown"} (Level ${progress?.level || 1})

Their recent quests:
${questList || "(no quests yet)"}

Today is ${today}. Based on their quest history and patterns, recommend exactly 3 new quests that would be helpful and relevant for them. Consider their interests, habits, and what they might be missing.

Respond in Korean. Return ONLY a JSON array with exactly 3 objects, each with:
- title: quest name (short, actionable)
- time: suggested time in "HH:MM" format
- reason: one short sentence why this quest fits them

Example format:
[{"title":"아침 스트레칭","time":"07:00","reason":"운동 퀘스트가 많으시네요, 아침 루틴으로 추천드려요"},...]

Return ONLY the JSON array, no other text.`;

  // OpenAI API 호출
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    return res.status(500).json({ error: "OpenAI API error", details: errText });
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "[]";

  try {
    const recommendations = JSON.parse(content);
    return res.status(200).json({ recommendations, date: today });
  } catch {
    return res.status(500).json({ error: "Failed to parse AI response", raw: content });
  }
}
