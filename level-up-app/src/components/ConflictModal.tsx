import type { Quest } from "../types";
import "./ConflictModal.css";

interface Props {
  existingQuest: Quest;
  onConfirm: () => void; // "예" - 기존 퀘스트 삭제하고 새 퀘스트 추가
  onCancel: () => void; // "아니오" - 새 퀘스트 생성 취소
}

export function ConflictModal({
  existingQuest,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="conflict-modal" onClick={(e) => e.stopPropagation()}>
        <p className="conflict-message">
          이미 해당 시간에 '{existingQuest.title}' 퀘스트가 있습니다. 해당
          퀘스트를 삭제 하고 새로운 퀘스트를 넣을까요?
        </p>
        <div className="conflict-actions">
          <button className="conflict-no-btn" onClick={onCancel}>
            아니오
          </button>
          <button className="conflict-yes-btn" onClick={onConfirm}>
            예
          </button>
        </div>
      </div>
    </div>
  );
}
