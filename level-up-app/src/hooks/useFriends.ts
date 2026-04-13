import { useState, useEffect, useCallback } from "react";
import { supabase } from "../utils/supabase";
import type { Quest } from "../types";

export interface FriendInfo {
  userId: string;
  nickname: string;
  level: number;
}

export function useFriends(userId: string) {
  const [friends, setFriends] = useState<FriendInfo[]>([]);
  const [loading, setLoading] = useState(true);

  // 친구 목록 불러오기
  const fetchFriends = useCallback(async () => {
    // 내가 추가한 친구 + 나를 추가한 친구 모두 가져오기
    const { data: rows, error } = await supabase
      .from("friendships")
      .select("user_id, friend_id")
      .or(`user_id.eq.${userId},friend_id.eq.${userId}`);

    if (error || !rows) {
      setLoading(false);
      return;
    }

    // 친구 ID 목록 추출
    const friendIds = rows.map((r) =>
      r.user_id === userId ? r.friend_id : r.user_id
    );

    // 중복 제거
    const uniqueIds = [...new Set(friendIds)];

    if (uniqueIds.length === 0) {
      setFriends([]);
      setLoading(false);
      return;
    }

    // 닉네임 가져오기
    const { data: profiles } = await supabase
      .from("user_profiles")
      .select("user_id, nickname")
      .in("user_id", uniqueIds);

    // 레벨 가져오기
    const { data: progresses } = await supabase
      .from("user_progress")
      .select("user_id, level")
      .in("user_id", uniqueIds);

    const friendList: FriendInfo[] = uniqueIds.map((id) => {
      const profile = profiles?.find((p) => p.user_id === id);
      const progress = progresses?.find((p) => p.user_id === id);
      return {
        userId: id,
        nickname: profile?.nickname ?? "Unknown",
        level: progress?.level ?? 1,
      };
    });

    setFriends(friendList);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  // 친구 코드로 친구 추가
  async function addFriendByCode(code: string): Promise<string | null> {
    // 친구 코드로 유저 찾기
    const { data: profile, error: findErr } = await supabase
      .from("user_profiles")
      .select("user_id, nickname")
      .eq("friend_code", code.toUpperCase())
      .single();

    if (findErr || !profile) {
      return "존재하지 않는 친구 코드입니다.";
    }

    if (profile.user_id === userId) {
      return "자신의 코드는 입력할 수 없습니다.";
    }

    // 이미 친구인지 확인
    const alreadyFriend = friends.some((f) => f.userId === profile.user_id);
    if (alreadyFriend) {
      return "이미 친구입니다.";
    }

    // 친구 관계 추가
    const { error: insertErr } = await supabase.from("friendships").insert({
      user_id: userId,
      friend_id: profile.user_id,
    });

    if (insertErr) {
      return "친구 추가에 실패했습니다.";
    }

    // 목록 갱신
    await fetchFriends();
    return null; // 성공
  }

  // 친구의 퀘스트 목록 가져오기
  async function getFriendQuests(friendId: string): Promise<Quest[]> {
    const { data: questRows } = await supabase
      .from("quests")
      .select("*")
      .eq("user_id", friendId);

    const { data: completionRows } = await supabase
      .from("quest_completions")
      .select("*")
      .eq("user_id", friendId);

    if (!questRows) return [];

    return questRows.map((row) => ({
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
  }

  // 친구 삭제
  async function removeFriend(friendId: string) {
    // 양방향 삭제 (내가 추가한 것 + 상대가 추가한 것)
    await supabase
      .from("friendships")
      .delete()
      .or(
        `and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`
      );

    await fetchFriends();
  }

  return { friends, loading, addFriendByCode, getFriendQuests, removeFriend };
}
