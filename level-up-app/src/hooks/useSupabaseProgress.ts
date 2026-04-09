import { useState, useEffect, useCallback } from "react";
import type { UserProgress } from "../types";
import { supabase } from "../utils/supabase";

// Supabase에서 레벨/경험치를 관리하는 훅
export function useSupabaseProgress(userId: string) {
  const [progress, setProgress] = useState<UserProgress>({ level: 1, exp: 0 });
  const [showLevelUp, setShowLevelUp] = useState(false);

  // DB에서 불러오기
  useEffect(() => {
    async function fetch() {
      const { data, error } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) {
        // 첫 로그인: 레코드가 없으면 새로 생성
        await supabase
          .from("user_progress")
          .insert({ user_id: userId, level: 1, exp: 0 });
        return;
      }
      setProgress({ level: data.level, exp: data.exp });
    }
    fetch();
  }, [userId]);

  // DB에 저장
  const saveToDb = useCallback(
    async (p: UserProgress) => {
      await supabase
        .from("user_progress")
        .update({ level: p.level, exp: p.exp })
        .eq("user_id", userId);
    },
    [userId]
  );

  // 경험치 추가
  const addExp = useCallback(
    (amount: number) => {
      setProgress((prev) => {
        let newExp = prev.exp + amount;
        let newLevel = prev.level;
        while (newExp >= 100) {
          newExp -= 100;
          newLevel += 1;
        }
        if (newLevel > prev.level) {
          setShowLevelUp(true);
          setTimeout(() => setShowLevelUp(false), 2000);
        }
        const next = { level: newLevel, exp: newExp };
        saveToDb(next);
        return next;
      });
    },
    [saveToDb]
  );

  // 경험치 차감
  const removeExp = useCallback(
    (amount: number) => {
      setProgress((prev) => {
        let newExp = prev.exp - amount;
        let newLevel = prev.level;
        while (newExp < 0) {
          newLevel -= 1;
          newExp += 100;
        }
        if (newLevel < 1) {
          newLevel = 1;
          newExp = 0;
        }
        const next = { level: newLevel, exp: newExp };
        saveToDb(next);
        return next;
      });
    },
    [saveToDb]
  );

  return { progress, addExp, removeExp, showLevelUp };
}
