import type { UserProgress } from "../types";
import "./ProgressPanel.css";

interface Props {
  progress: UserProgress;
  showLevelUp: boolean;
  nickname?: string;
}

export function ProgressPanel({ progress, showLevelUp, nickname }: Props) {
  // EXP 바를 10칸 픽셀 블록으로 표현
  const filledBlocks = Math.floor(progress.exp / 10);

  return (
    <div className="progress-panel">
      {nickname && (
        <div className="progress-nickname">{nickname}</div>
      )}
      <div className="progress-info">
        <span className="progress-level pixel-font">
          Lv.{progress.level}
        </span>
        <span className="progress-exp pixel-font">
          {progress.exp}/100 EXP
        </span>
      </div>
      <div className="progress-bar-pixel">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className={`pixel-block ${i < filledBlocks ? "filled" : ""}`}
          />
        ))}
      </div>
      {showLevelUp && (
        <div className="level-up-message pixel-font">LEVEL UP!</div>
      )}
    </div>
  );
}
