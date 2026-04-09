import type { Quest } from "../types";
import { getOverdueQuests, getTodayString } from "../utils/questUtils";
import { QuestCard } from "./QuestCard";
import "./OverdueQuestSection.css";

interface Props {
  quests: Quest[];
  onToggleComplete: (questId: string, date: string) => void;
  onClickQuest: (quest: Quest) => void;
}

export function OverdueQuestSection({
  quests,
  onToggleComplete,
  onClickQuest,
}: Props) {
  const todayStr = getTodayString();
  const overdueItems = getOverdueQuests(quests, todayStr);

  if (overdueItems.length === 0) return null;

  return (
    <div className="overdue-section">
      <h3 className="overdue-title">
        Overdue Quests ({overdueItems.length})
      </h3>
      <div className="overdue-list">
        {overdueItems.map(({ quest, date }) => (
          <div key={quest.id + date} className="overdue-item">
            <span className="overdue-date">{date}</span>
            <QuestCard
              quest={quest}
              date={date}
              onToggleComplete={onToggleComplete}
              onClick={onClickQuest}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
