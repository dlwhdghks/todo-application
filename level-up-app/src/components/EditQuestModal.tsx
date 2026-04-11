import { useState } from "react";
import type { Quest } from "../types";
import "./EditQuestModal.css";

const COLOR_OPTIONS = [
  "#e94560",
  "#f5a623",
  "#4ecdc4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#10b981",
  "#6b7280",
];

interface Props {
  quest: Quest;
  onSave: (updated: Quest) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export function EditQuestModal({ quest, onSave, onDelete, onClose }: Props) {
  const [title, setTitle] = useState(quest.title);
  const [date, setDate] = useState(quest.date);
  const [time, setTime] = useState(quest.time);
  const [repeat, setRepeat] = useState(quest.repeat);
  const [color, setColor] = useState(quest.color);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const hasParty = quest.partyMembers && quest.partyMembers.length > 0;

  function handleSave() {
    if (!title.trim()) return;
    onSave({ ...quest, title: title.trim(), date, time, repeat, color });
  }

  function handleDelete() {
    setShowDeleteConfirm(true);
  }

  function confirmDelete() {
    onDelete(quest.id);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">Edit Quest</h3>

        <label className="form-label">
          Title
          <input
            type="text"
            className="form-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>

        <div className="form-row">
          <label className="form-label">
            Date
            <input
              type="date"
              className="form-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
          <label className="form-label">
            Time
            <input
              type="time"
              className="form-input"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </label>
        </div>

        <label className="form-label">
          Repeat
          <select
            className="form-input"
            value={repeat}
            onChange={(e) =>
              setRepeat(e.target.value as "none" | "daily" | "weekly")
            }
          >
            <option value="none">None</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
        </label>

        <div className="form-label">
          Color
          <div className="color-options">
            {COLOR_OPTIONS.map((c) => (
              <button
                key={c}
                type="button"
                className={`color-btn ${color === c ? "selected" : ""}`}
                style={{ background: c }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
        </div>

        {/* 파티 멤버 표시 */}
        {hasParty && (
          <div className="party-members-section">
            <span className="party-members-label">Party Members</span>
            <div className="party-members-list">
              {quest.partyMembers!.map((member, i) => (
                <div key={i} className="party-member-item">
                  {member.isHost && (
                    <span className="party-host-icon" title="Host">&#9818;</span>
                  )}
                  <span className="party-member-name">{member.nickname}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="modal-actions">
          <button className="modal-delete-btn" onClick={handleDelete}>
            Delete
          </button>
          <button className="form-cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="form-submit-btn" onClick={handleSave}>
            Save
          </button>
        </div>

        {showDeleteConfirm && (
          <div className="delete-confirm">
            <p>Are you sure you want to delete this quest?</p>
            <div className="delete-confirm-actions">
              <button
                className="form-cancel-btn"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button className="modal-delete-btn" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
