import type { Quest, UserProgress, ViewMode } from "../types";

// localStorage 키 이름들
const KEYS = {
  QUESTS: "levelup-quests",
  PROGRESS: "levelup-progress",
  VIEW_MODE: "levelup-viewmode",
};

// --- 퀘스트 저장/불러오기 ---

export function loadQuests(): Quest[] {
  const data = localStorage.getItem(KEYS.QUESTS);
  if (!data) return [];
  return JSON.parse(data);
}

export function saveQuests(quests: Quest[]) {
  localStorage.setItem(KEYS.QUESTS, JSON.stringify(quests));
}

// --- 레벨/경험치 저장/불러오기 ---

export function loadProgress(): UserProgress {
  const data = localStorage.getItem(KEYS.PROGRESS);
  if (!data) return { level: 1, exp: 0 };
  return JSON.parse(data);
}

export function saveProgress(progress: UserProgress) {
  localStorage.setItem(KEYS.PROGRESS, JSON.stringify(progress));
}

// --- 보기 모드 저장/불러오기 ---

export function loadViewMode(): ViewMode {
  const data = localStorage.getItem(KEYS.VIEW_MODE);
  if (data === "7days" || data === "14days") return data;
  return "today";
}

export function saveViewMode(mode: ViewMode) {
  localStorage.setItem(KEYS.VIEW_MODE, mode);
}
