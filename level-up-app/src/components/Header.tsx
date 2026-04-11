import "./Header.css";

interface Props {
  onOpenFriends: () => void;
  onOpenNotifications: () => void;
  onOpenAi: () => void;
  pendingCount: number;
}

export function Header({ onOpenFriends, onOpenNotifications, onOpenAi, pendingCount }: Props) {
  return (
    <header className="header">
      <button className="header-party-btn" onClick={onOpenFriends} title="Party">
        &#9876;
      </button>

      <h1 className="header-title pixel-font">Level Up</h1>
      <p className="header-subtitle">Complete quests. Gain EXP. Level up.</p>

      <div className="header-right-btns">
        <button className="header-ai-btn" onClick={onOpenAi} title="AI Quest">
          AI
        </button>
        <button
          className={`header-notif-btn ${pendingCount > 0 ? "has-pending" : ""}`}
          onClick={onOpenNotifications}
          title="Notifications"
        >
          &#9993;
          {pendingCount > 0 && (
            <span className="notif-badge">{pendingCount}</span>
          )}
        </button>
      </div>
    </header>
  );
}
