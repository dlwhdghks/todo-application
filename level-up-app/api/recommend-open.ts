import type { VercelRequest, VercelResponse } from "@vercel/node";

// POST /api/recommend-open
// body: { quests, nickname, level }
// OpenAI만 호출. 인증은 프론트 Supabase 세션에서 이미 됨.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "OpenAI API key not configured" });
  }

  const { quests, nickname, level } = req.body;

  const questList = (quests || [])
    .map((q: { title: string; date: string; time: string; repeat: string }) =>
      `- ${q.title} (${q.date} ${q.time}, repeat: ${q.repeat})`
    )
    .join("\n");

  const today = new Date().toISOString().split("T")[0];

  const prompt = `You are a quest recommender for a gamified to-do app called "Level Up".

User: ${nickname || "Unknown"} (Level ${level || 1})

Their recent quests:
${questList || "(no quests yet)"}

Today is ${today}. Based on their quest history and patterns, recommend exactly 3 new quests that would be helpful and relevant for them. Consider their interests, habits, and what they might be missing.

Respond in Korean. Return ONLY a JSON array with exactly 3 objects, each with:
- title: quest name (short, actionable)
- time: suggested time in "HH:MM" format
- reason: one short sentence why this quest fits them

Return ONLY the JSON array, no other text.`;

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
