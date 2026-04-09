import { useState, useEffect, useCallback } from "react";
import type { Quest } from "../types";
import { supabase } from "../utils/supabase";

// Supabase에서 퀘스트를 관리하는 훅
export function useSupabaseQuests(userId: string) {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);

  // 퀘스트 목록 불러오기
  const fetchQuests = useCallback(async () => {
    // 퀘스트 기본 정보 가져오기
    const { data: questRows, error: qErr } = await supabase
      .from("quests")
      .select("*")
      .eq("user_id", userId);

    if (qErr) {
      console.error("Failed to fetch quests:", qErr);
      setLoading(false);
      return;
    }

    // 완료 기록 가져오기
    const { data: completionRows, error: cErr } = await supabase
      .from("quest_completions")
      .select("*")
      .eq("user_id", userId);

    if (cErr) {
      console.error("Failed to fetch completions:", cErr);
      setLoading(false);
      return;
    }

    // DB 데이터를 앱에서 쓰는 Quest 형태로 변환
    const questList: Quest[] = (questRows || []).map((row) => ({
      id: row.id,
      title: row.title,
      date: row.date,
      time: row.time,
      repeat: row.repeat as Quest["repeat"],
      color: row.color,
      createdAt: row.created_at,
      completedDates: (completionRows || [])
        .filter((c) => c.quest_id === row.id)
        .map((c) => c.completed_date),
    }));

    setQuests(questList);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchQuests();
  }, [fetchQuests]);

  // 퀘스트 추가
  async function addQuest(quest: Quest) {
    const { error } = await supabase.from("quests").insert({
      id: quest.id,
      user_id: userId,
      title: quest.title,
      date: quest.date,
      time: quest.time,
      repeat: quest.repeat,
      color: quest.color,
      created_at: quest.createdAt,
    });
    if (error) {
      console.error("Failed to add quest:", error);
      return;
    }
    // 화면 즉시 반영
    setQuests((prev) => [...prev, quest]);
  }

  // 퀘스트 수정
  async function updateQuest(updated: Quest) {
    const { error } = await supabase
      .from("quests")
      .update({
        title: updated.title,
        date: updated.date,
        time: updated.time,
        repeat: updated.repeat,
        color: updated.color,
      })
      .eq("id", updated.id);
    if (error) {
      console.error("Failed to update quest:", error);
      return;
    }
    setQuests((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));
  }

  // 퀘스트 삭제
  async function deleteQuest(id: string) {
    const { error } = await supabase.from("quests").delete().eq("id", id);
    if (error) {
      console.error("Failed to delete quest:", error);
      return;
    }
    setQuests((prev) => prev.filter((q) => q.id !== id));
  }

  // 완료/미완료 토글
  async function toggleComplete(questId: string, dateStr: string) {
    const quest = quests.find((q) => q.id === questId);
    if (!quest) return;

    const alreadyDone = quest.completedDates.includes(dateStr);

    if (alreadyDone) {
      // 완료 취소: DB에서 삭제
      await supabase
        .from("quest_completions")
        .delete()
        .eq("quest_id", questId)
        .eq("completed_date", dateStr);
    } else {
      // 완료 처리: DB에 추가
      await supabase.from("quest_completions").insert({
        quest_id: questId,
        user_id: userId,
        completed_date: dateStr,
      });
    }

    // 화면 즉시 반영
    setQuests((prev) =>
      prev.map((q) => {
        if (q.id !== questId) return q;
        return {
          ...q,
          completedDates: alreadyDone
            ? q.completedDates.filter((d) => d !== dateStr)
            : [...q.completedDates, dateStr],
        };
      })
    );
  }

  return { quests, loading, addQuest, updateQuest, deleteQuest, toggleComplete };
}
