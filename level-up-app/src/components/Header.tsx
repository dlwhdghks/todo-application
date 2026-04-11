import "./Header.css";

interface Props {
  onOpenFriends: () => void;
}

export function Header({ onOpenFriends }: Props) {
  return (
    <header className="header">
      <button className="header-party-btn" onClick={onOpenFriends} title="Party">
        &#9876;
      </button>
      <h1 className="header-title pixel-font">Level Up</h1>
      <p className="header-subtitle">Complete quests. Gain EXP. Level up.</p>
    </header>
  );
}
