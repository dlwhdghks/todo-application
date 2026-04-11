import type { Quest } from "../types";
import { isQuestCompletedOnDate } from "../utils/questUtils";
import "./QuestCard.css";

interface Props {
  quest: Quest;
  date: string;
  onToggleComplete?: (questId: string, date: string) => void;
  onClick?: (quest: Quest) => void;
  readOnly?: boolean;
}

export function QuestCard({ quest, date, onToggleComplete, onClick, readOnly }: Props) {
  const completed = isQuestCompletedOnDate(quest, date);

  return (
    <div
      className={`quest-card ${completed ? "completed" : ""}`}
      onClick={() => onClick?.(quest)}
    >
      <div className="quest-color-bar" style={{ background: quest.color }} />

      {!readOnly && (
        <button
          className={`pixel-checkbox ${completed ? "checked" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete?.(quest.id, date);
          }}
        >
          {completed ? "\u2716" : ""}
        </button>
      )}

      <div className="quest-info">
        <span className="quest-title">{quest.title}</span>
        <span className="quest-time">{quest.time}</span>
      </div>

      {quest.repeat !== "none" && (
        <span className="quest-repeat-badge pixel-font">{quest.repeat}</span>
      )}
    </div>
  );
}
