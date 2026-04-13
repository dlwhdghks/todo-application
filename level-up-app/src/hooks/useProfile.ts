import { useState, useEffect, useCallback } from "react";
import { supabase } from "../utils/supabase";

interface Profile {
  nickname: string;
  friendCode: string;
}

// 유저 프로필(닉네임, 친구 코드)을 관리하는 훅
export function useProfile(userId: string) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error || !data) {
        // 프로필이 없음 -> 닉네임 설정이 필요
        setProfile(null);
      } else {
        setProfile({
          nickname: data.nickname,
          friendCode: data.friend_code,
        });
      }
      setLoading(false);
    }
    fetch();
  }, [userId]);

  // 닉네임 설정 (최초 1회)
  const createProfile = useCallback(
    async (nickname: string) => {
      // 6자리 랜덤 친구 코드 생성
      const friendCode =
        Math.random().toString(36).slice(2, 5).toUpperCase() +
        Math.floor(Math.random() * 1000)
          .toString()
          .padStart(3, "0");

      const { error } = await supabase.from("user_profiles").insert({
        user_id: userId,
        nickname,
        friend_code: friendCode,
      });

      if (error) {
        // 친구 코드 충돌 시 재시도
        if (error.code === "23505") {
          return createProfile(nickname);
        }
        throw error;
      }

      setProfile({ nickname, friendCode });
    },
    [userId]
  );

  // 닉네임 변경
  const updateNickname = useCallback(
    async (newNickname: string) => {
      const { error } = await supabase
        .from("user_profiles")
        .update({ nickname: newNickname })
        .eq("user_id", userId);

      if (error) {
        if (error.code === "23505") {
          throw new Error("This nickname is already taken.");
        }
        throw error;
      }

      setProfile((prev) =>
        prev ? { ...prev, nickname: newNickname } : prev
      );
    },
    [userId]
  );

  return { profile, loading, createProfile, updateNickname };
}
