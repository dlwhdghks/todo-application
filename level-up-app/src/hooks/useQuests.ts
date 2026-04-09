import { useState, useEffect } from "react";
import type { Quest } from "../types";
import { loadQuests, saveQuests } from "../utils/localStorage";

// 퀘스트 목록을 관리하는 커스텀 훅
// - 추가, 수정, 삭제, 완료 토글 기능 제공
// - 변경 시 자동으로 localStorage에 저장
export function useQuests() {
  const [quests, setQuests] = useState<Quest[]>(() => loadQuests());

  // quests가 바뀔 때마다 localStorage에 저장
  useEffect(() => {
    saveQuests(quests);
  }, [quests]);

  // 퀘스트 추가
  function addQuest(quest: Quest) {
    setQuests((prev) => [...prev, quest]);
  }

  // 퀘스트 수정
  function updateQuest(updated: Quest) {
    setQuests((prev) =>
      prev.map((q) => (q.id === updated.id ? updated : q))
    );
  }

  // 퀘스트 삭제
  function deleteQuest(id: string) {
    setQuests((prev) => prev.filter((q) => q.id !== id));
  }

  // 특정 날짜의 완료/미완료 토글
  function toggleComplete(questId: string, dateStr: string) {
    setQuests((prev) =>
      prev.map((q) => {
        if (q.id !== questId) return q;
        const alreadyDone = q.completedDates.includes(dateStr);
        return {
          ...q,
          completedDates: alreadyDone
            ? q.completedDates.filter((d) => d !== dateStr)
            : [...q.completedDates, dateStr],
        };
      })
    );
  }

  return { quests, addQuest, updateQuest, deleteQuest, toggleComplete };
}
