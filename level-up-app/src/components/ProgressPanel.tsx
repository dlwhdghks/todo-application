import type { UserProgress } from "../types";
import "./ProgressPanel.css";

interface Props {
  progress: UserProgress;
  showLevelUp: boolean;
}

export function ProgressPanel({ progress, showLevelUp }: Props) {
  const expPercent = (progress.exp / 100) * 100;

  return (
    <div className="progress-panel">
      <div className="progress-info">
        <span className="progress-level">Lv. {progress.level}</span>
        <span className="progress-exp">
          EXP {progress.exp} / 100
        </span>
      </div>
      <div className="progress-bar-bg">
        <div
          className="progress-bar-fill"
          style={{ width: `${expPercent}%` }}
        />
      </div>
      {showLevelUp && (
        <div className="level-up-message">Level Up!</div>
      )}
    </div>
  );
}
