import type { Quest, ViewMode } from "../types";
import {
  getTodayString,
  getDateRange,
  isQuestVisibleOnDate,
} from "../utils/questUtils";
import { QuestCard } from "./QuestCard";
import "./QuestList.css";

interface Props {
  quests: Quest[];
  viewMode: ViewMode;
  onToggleComplete: (questId: string, date: string) => void;
  onClickQuest: (quest: Quest) => void;
}

// 보기 모드에 따라 표시할 날짜 수 결정
function getDaysCount(viewMode: ViewMode): number {
  if (viewMode === "7days") return 7;
  if (viewMode === "14days") return 14;
  return 1;
}

// 요일 이름
const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function QuestList({
  quests,
  viewMode,
  onToggleComplete,
  onClickQuest,
}: Props) {
  const today = new Date();
  const days = getDaysCount(viewMode);
  const dates = getDateRange(today, days);
  const todayStr = getTodayString();

  return (
    <div className="quest-list">
      {dates.map((dateStr) => {
        // 해당 날짜에 보여야 할 퀘스트 필터링
        const visible = quests
          .filter((q) => isQuestVisibleOnDate(q, dateStr))
          .sort((a, b) => a.time.localeCompare(b.time)); // 시간순 정렬

        const dateObj = new Date(dateStr);
        const weekday = WEEKDAY_NAMES[dateObj.getDay()];
        const isToday = dateStr === todayStr;

        return (
          <div key={dateStr} className="quest-date-section">
            {/* 여러 날짜 보기일 때만 날짜 헤더 표시 */}
            {days > 1 && (
              <div className={`date-header ${isToday ? "today" : ""}`}>
                <span className="date-weekday">{weekday}</span>
                <span className="date-value">
                  {dateObj.getDate()}
                </span>
              </div>
            )}

            {visible.length === 0 ? (
              <div className="no-quests-box">
                <span className="no-quests-icon">&#9876;</span>
                <p className="no-quests-text pixel-font">No Quests</p>
                <p className="no-quests-hint">
                  + New Quest to start your adventure!
                </p>
              </div>
            ) : (
              <div className="quest-cards">
                {visible.map((quest) => (
                  <QuestCard
                    key={quest.id + dateStr}
                    quest={quest}
                    date={dateStr}
                    onToggleComplete={onToggleComplete}
                    onClick={onClickQuest}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
