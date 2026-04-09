// 퀘스트(할일) 하나를 나타내는 타입
export interface Quest {
  id: string;
  title: string;
  date: string; // "YYYY-MM-DD" 형식
  time: string; // "HH:MM" 형식
  repeat: "none" | "daily" | "weekly";
  color: string; // 카드 왼쪽 색상 바에 사용
  completedDates: string[]; // 완료한 날짜 목록 (반복 퀘스트용)
  createdAt: number; // 생성 시간 (밀리초)
}

// 사용자 레벨/경험치 정보
export interface UserProgress {
  level: number;
  exp: number;
}

// 보기 모드 (오늘 / 7일 / 14일)
export type ViewMode = "today" | "7days" | "14days";
