import type { Quest } from "../types";

// 오늘 날짜를 "YYYY-MM-DD" 형식으로 반환
export function getTodayString(): string {
  return formatDate(new Date());
}

// Date 객체를 "YYYY-MM-DD" 형식 문자열로 변환
export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// 현재 시간을 "HH:MM" 형식으로 반환
export function getCurrentTime(): string {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

// 특정 날짜에 퀘스트가 보여야 하는지 판단
// - "none": 퀘스트의 원래 날짜와 같을 때만
// - "daily": 퀘스트 생성일 이후 매일
// - "weekly": 퀘스트 생성일 이후, 같은 요일에만
export function isQuestVisibleOnDate(quest: Quest, dateStr: string): boolean {
  if (quest.repeat === "none") {
    return quest.date === dateStr;
  }

  // 반복 퀘스트는 생성 날짜 이후에만 표시
  if (dateStr < quest.date) return false;

  if (quest.repeat === "daily") {
    return true;
  }

  if (quest.repeat === "weekly") {
    const questDay = new Date(quest.date).getDay(); // 0(일) ~ 6(토)
    const targetDay = new Date(dateStr).getDay();
    return questDay === targetDay;
  }

  return false;
}

// 해당 날짜에 퀘스트가 완료되었는지 확인
export function isQuestCompletedOnDate(
  quest: Quest,
  dateStr: string
): boolean {
  return quest.completedDates.includes(dateStr);
}

// 시작 날짜부터 N일간의 날짜 문자열 배열 생성
export function getDateRange(startDate: Date, days: number): string[] {
  const dates: string[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    dates.push(formatDate(d));
  }
  return dates;
}

// 고유 ID 생성 (간단한 랜덤 문자열)
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// 지연된(overdue) 퀘스트 찾기: 오늘 이전 날짜에 미완료 상태인 퀘스트
export function getOverdueQuests(
  quests: Quest[],
  todayStr: string
): { quest: Quest; date: string }[] {
  const overdueItems: { quest: Quest; date: string }[] = [];

  for (const quest of quests) {
    if (quest.repeat === "none") {
      // 반복 없는 퀘스트: 날짜가 오늘 이전이고 미완료면 overdue
      if (quest.date < todayStr && !isQuestCompletedOnDate(quest, quest.date)) {
        overdueItems.push({ quest, date: quest.date });
      }
    }
    // 반복 퀘스트는 overdue 처리하지 않음 (매일/매주 새로 나타나므로)
  }

  // 날짜순 정렬
  overdueItems.sort((a, b) => a.date.localeCompare(b.date));
  return overdueItems;
}
