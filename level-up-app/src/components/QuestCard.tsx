import type { Quest } from "../types";
import { isQuestCompletedOnDate } from "../utils/questUtils";
import "./QuestCard.css";

interface Props {
  quest: Quest;
  date: string;
  onToggleComplete: (questId: string, date: string) => void;
  onClick: (quest: Quest) => void;
}

export function QuestCard({ quest, date, onToggleComplete, onClick }: Props) {
  const completed = isQuestCompletedOnDate(quest, date);

  return (
    <div
      className={`quest-card ${completed ? "completed" : ""}`}
      onClick={() => onClick(quest)}
    >
      {/* 왼쪽 색상 바 */}
      <div className="quest-color-bar" style={{ background: quest.color }} />

      {/* 체크박스 - 카드 클릭과 분리하기 위해 stopPropagation 사용 */}
      <input
        type="checkbox"
        className="quest-checkbox"
        checked={completed}
        onChange={(e) => {
          e.stopPropagation();
          onToggleComplete(quest.id, date);
        }}
        onClick={(e) => e.stopPropagation()}
      />

      <div className="quest-info">
        <span className="quest-title">{quest.title}</span>
        <span className="quest-time">{quest.time}</span>
      </div>

      {quest.repeat !== "none" && (
        <span className="quest-repeat-badge">{quest.repeat}</span>
      )}
    </div>
  );
}
