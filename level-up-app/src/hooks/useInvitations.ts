import { useState, useEffect, useCallback } from "react";
import { supabase } from "../utils/supabase";

export interface Invitation {
  id: number;
  questId: string;
  questTitle: string;
  questDate: string;
  questTime: string;
  questColor: string;
  senderNickname: string;
  senderId: string;
  receiverId: string;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
}

export function useInvitations(userId: string) {
  const [invitations, setInvitations] = useState<Invitation[]>([]);

  // 받은 초대 목록 불러오기
  const fetchInvitations = useCallback(async () => {
    const { data: rows, error } = await supabase
      .from("quest_invitations")
      .select("*")
      .eq("receiver_id", userId)
      .order("created_at", { ascending: false });

    if (error || !rows) return;

    // 퀘스트 정보 가져오기
    const questIds = [...new Set(rows.map((r) => r.quest_id))];
    const senderIds = [...new Set(rows.map((r) => r.sender_id))];

    const [{ data: quests }, { data: profiles }] = await Promise.all([
      supabase.from("quests").select("id, title, date, time, color").in("id", questIds),
      supabase.from("user_profiles").select("user_id, nickname").in("user_id", senderIds),
    ]);

    const invList: Invitation[] = rows.map((row) => {
      const quest = quests?.find((q) => q.id === row.quest_id);
      const sender = profiles?.find((p) => p.user_id === row.sender_id);
      return {
        id: row.id,
        questId: row.quest_id,
        questTitle: quest?.title ?? "Unknown",
        questDate: quest?.date ?? "",
        questTime: quest?.time ?? "",
        questColor: quest?.color ?? "#888",
        senderNickname: sender?.nickname ?? "Unknown",
        senderId: row.sender_id,
        receiverId: row.receiver_id,
        status: row.status,
        createdAt: row.created_at,
      };
    });

    setInvitations(invList);
  }, [userId]);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  // 초대 보내기
  async function sendInvitation(questId: string, receiverId: string) {
    const { error } = await supabase.from("quest_invitations").insert({
      quest_id: questId,
      sender_id: userId,
      receiver_id: receiverId,
    });
    if (error) console.error("Failed to send invitation:", error);
  }

  // 여러 친구에게 초대 보내기
  async function sendInvitations(questId: string, receiverIds: string[]) {
    for (const receiverId of receiverIds) {
      await sendInvitation(questId, receiverId);
    }
  }

  // 수락
  async function acceptInvitation(invitationId: number, questId: string) {
    // 초대 상태 업데이트
    await supabase
      .from("quest_invitations")
      .update({ status: "accepted", responded_at: new Date().toISOString() })
      .eq("id", invitationId);

    // 원본 퀘스트 정보 가져와서 내 퀘스트로 복사
    const { data: original } = await supabase
      .from("quests")
      .select("*")
      .eq("id", questId)
      .single();

    if (original) {
      const newId =
        Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
      await supabase.from("quests").insert({
        id: newId,
        user_id: userId,
        title: original.title,
        date: original.date,
        time: original.time,
        repeat: original.repeat,
        color: original.color,
        created_at: Date.now(),
      });
    }

    await fetchInvitations();
  }

  // 거절
  async function declineInvitation(invitationId: number) {
    await supabase
      .from("quest_invitations")
      .update({ status: "declined", responded_at: new Date().toISOString() })
      .eq("id", invitationId);

    await fetchInvitations();
  }

  const pendingCount = invitations.filter((i) => i.status === "pending").length;

  return {
    invitations,
    pendingCount,
    sendInvitations,
    acceptInvitation,
    declineInvitation,
    refreshInvitations: fetchInvitations,
  };
}
