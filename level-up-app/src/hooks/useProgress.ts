import { useState, useEffect, useCallback } from "react";
import type { UserProgress } from "../types";
import { loadProgress, saveProgress } from "../utils/localStorage";

// 레벨/경험치를 관리하는 커스텀 훅
export function useProgress() {
  const [progress, setProgress] = useState<UserProgress>(() => loadProgress());
  const [showLevelUp, setShowLevelUp] = useState(false);

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  // 경험치 추가 (+10 EXP per quest)
  // 100 EXP마다 레벨업, 나머지는 이월
  const addExp = useCallback((amount: number) => {
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
      return { level: newLevel, exp: newExp };
    });
  }, []);

  // 경험치 차감 (완료 취소 시)
  const removeExp = useCallback((amount: number) => {
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
      return { level: newLevel, exp: newExp };
    });
  }, []);

  return { progress, addExp, removeExp, showLevelUp };
}
