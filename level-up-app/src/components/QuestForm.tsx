import { useState } from "react";
import type { Quest } from "../types";
import type { FriendInfo } from "../hooks/useFriends";
import { getTodayString, getCurrentTime, generateId } from "../utils/questUtils";
import "./QuestForm.css";

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
  onAdd: (quest: Quest, inviteFriendIds: string[]) => void;
  onConflict: (existing: Quest, newQuest: Quest, inviteFriendIds: string[]) => void;
  quests: Quest[];
  friends: FriendInfo[];
  onOpenAi: () => void;
}

export function QuestForm({ onAdd, onConflict, quests, friends, onOpenAi }: Props) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(getTodayString());
  const [time, setTime] = useState(getCurrentTime());
  const [repeat, setRepeat] = useState<"none" | "daily" | "weekly">("none");
  const [color, setColor] = useState(COLOR_OPTIONS[0]);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [showInvite, setShowInvite] = useState(false);

  function resetForm() {
    setTitle("");
    setDate(getTodayString());
    setTime(getCurrentTime());
    setRepeat("none");
    setColor(COLOR_OPTIONS[0]);
    setSelectedFriends([]);
    setShowInvite(false);
  }

  function toggleFriend(friendId: string) {
    setSelectedFriends((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    const newQuest: Quest = {
      id: generateId(),
      title: title.trim(),
      date,
      time,
      repeat,
      color,
      completedDates: [],
      createdAt: Date.now(),
    };

    const conflict = quests.find(
      (q) => q.date === date && q.time === time
    );

    if (conflict) {
      onConflict(conflict, newQuest, selectedFriends);
    } else {
      onAdd(newQuest, selectedFriends);
    }

    resetForm();
    setOpen(false);
  }

  if (!open) {
    return (
      <div className="quest-form-trigger">
        <button className="add-quest-btn" onClick={() => setOpen(true)}>
          + New Quest
        </button>
        <button className="add-quest-ai-btn" onClick={onOpenAi}>
          AI
        </button>
      </div>
    );
  }

  return (
    <form className="quest-form" onSubmit={handleSubmit}>
      <h3 className="quest-form-title">New Quest</h3>

      <label className="form-label">
        Title
        <input
          type="text"
          className="form-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Quest name..."
          autoFocus
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

      {/* 친구 초대 토글 */}
      {friends.length > 0 && (
        <div className="invite-section">
          <label className="invite-toggle">
            <input
              type="checkbox"
              checked={showInvite}
              onChange={(e) => {
                setShowInvite(e.target.checked);
                if (!e.target.checked) setSelectedFriends([]);
              }}
            />
            <span>Invite Party Members</span>
          </label>

          {showInvite && (
            <div className="invite-friends-list">
              {friends.map((friend) => (
                <button
                  key={friend.userId}
                  type="button"
                  className={`invite-friend-btn ${
                    selectedFriends.includes(friend.userId) ? "selected" : ""
                  }`}
                  onClick={() => toggleFriend(friend.userId)}
                >
                  <span className="invite-friend-name">{friend.nickname}</span>
                  <span className="invite-friend-level pixel-font">
                    Lv.{friend.level}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="form-actions">
        <button
          type="button"
          className="form-cancel-btn"
          onClick={() => {
            resetForm();
            setOpen(false);
          }}
        >
          Cancel
        </button>
        <button type="submit" className="form-submit-btn">
          Add Quest
        </button>
      </div>
    </form>
  );
}
