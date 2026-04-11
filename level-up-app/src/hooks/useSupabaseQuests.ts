import { useState, useEffect, useCallback } from "react";
import type { Quest, PartyMember } from "../types";
import { supabase } from "../utils/supabase";

export function useSupabaseQuests(userId: string) {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQuests = useCallback(async () => {
    const { data: questRows, error: qErr } = await supabase
      .from("quests")
      .select("*")
      .eq("user_id", userId);

    if (qErr) {
      console.error("Failed to fetch quests:", qErr);
      setLoading(false);
      return;
    }

    const { data: completionRows, error: cErr } = await supabase
      .from("quest_completions")
      .select("*")
      .eq("user_id", userId);

    if (cErr) {
      console.error("Failed to fetch completions:", cErr);
      setLoading(false);
      return;
    }

    // 내가 보낸 초대 (내가 host인 경우)
    const { data: sentInvites } = await supabase
      .from("quest_invitations")
      .select("quest_id, receiver_id, status")
      .eq("sender_id", userId)
      .eq("status", "accepted");

    // 내가 받은 초대 (다른 사람이 host인 경우)
    const { data: receivedInvites } = await supabase
      .from("quest_invitations")
      .select("quest_id, sender_id, status")
      .eq("receiver_id", userId)
      .eq("status", "accepted");

    // 관련된 유저 ID 수집해서 닉네임 조회
    const relatedUserIds = new Set<string>();
    sentInvites?.forEach((inv) => relatedUserIds.add(inv.receiver_id));
    receivedInvites?.forEach((inv) => relatedUserIds.add(inv.sender_id));

    let profileMap: Record<string, string> = {};
    if (relatedUserIds.size > 0) {
      const { data: profiles } = await supabase
        .from("user_profiles")
        .select("user_id, nickname")
        .in("user_id", [...relatedUserIds]);

      if (profiles) {
        profileMap = Object.fromEntries(
          profiles.map((p) => [p.user_id, p.nickname])
        );
      }
    }

    // 퀘스트별 파티 멤버 매핑
    // 내가 보낸 초대에서 quest_id를 매칭 (원본 퀘스트 ID 기준)
    // 내가 받은 초대에서 원본 quest_id로는 매칭이 안 됨 (복사된 퀘스트)
    // -> 받은 초대의 경우 sender가 host
    const sentByQuest: Record<string, PartyMember[]> = {};
    sentInvites?.forEach((inv) => {
      if (!sentByQuest[inv.quest_id]) sentByQuest[inv.quest_id] = [];
      sentByQuest[inv.quest_id].push({
        nickname: profileMap[inv.receiver_id] ?? "Unknown",
        isHost: false,
      });
    });

    // 받은 초대: quest_id는 원본 퀘스트 ID (host의 퀘스트)
    // 내 복사된 퀘스트와 매칭하려면 title+date+time으로 연결해야 하지만,
    // 간단하게 receivedInvites의 quest_id와 같은 title을 가진 내 퀘스트를 찾아 매핑
    const receivedByTitle: Record<string, PartyMember> = {};
    receivedInvites?.forEach((inv) => {
      // 원본 퀘스트 제목 조회를 위해 나중에 처리
      receivedByTitle[inv.quest_id] = {
        nickname: profileMap[inv.sender_id] ?? "Unknown",
        isHost: true,
      };
    });

    // 원본 퀘스트 제목 조회 (받은 초대)
    const originalQuestIds = Object.keys(receivedByTitle);
    let originalQuests: Record<string, { title: string; date: string; time: string }> = {};
    if (originalQuestIds.length > 0) {
      const { data: originals } = await supabase
        .from("quests")
        .select("id, title, date, time")
        .in("id", originalQuestIds);

      if (originals) {
        originalQuests = Object.fromEntries(
          originals.map((q) => [q.id, { title: q.title, date: q.date, time: q.time }])
        );
      }
    }

    const questList: Quest[] = (questRows || []).map((row) => {
      const members: PartyMember[] = [];

      // 내가 보낸 초대의 멤버
      if (sentByQuest[row.id]) {
        members.push(...sentByQuest[row.id]);
      }

      // 내가 받은 초대인지 확인 (제목+날짜+시간으로 매칭)
      for (const [origId, hostMember] of Object.entries(receivedByTitle)) {
        const orig = originalQuests[origId];
        if (orig && orig.title === row.title && orig.date === row.date && orig.time === row.time) {
          members.push(hostMember);
          break;
        }
      }

      return {
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
        partyMembers: members.length > 0 ? members : undefined,
      };
    });

    setQuests(questList);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchQuests();
  }, [fetchQuests]);

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
    setQuests((prev) => [...prev, quest]);
  }

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

  async function deleteQuest(id: string) {
    const { error } = await supabase.from("quests").delete().eq("id", id);
    if (error) {
      console.error("Failed to delete quest:", error);
      return;
    }
    setQuests((prev) => prev.filter((q) => q.id !== id));
  }

  async function toggleComplete(questId: string, dateStr: string) {
    const quest = quests.find((q) => q.id === questId);
    if (!quest) return;

    const alreadyDone = quest.completedDates.includes(dateStr);

    if (alreadyDone) {
      await supabase
        .from("quest_completions")
        .delete()
        .eq("quest_id", questId)
        .eq("completed_date", dateStr);
    } else {
      await supabase.from("quest_completions").insert({
        quest_id: questId,
        user_id: userId,
        completed_date: dateStr,
      });
    }

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
