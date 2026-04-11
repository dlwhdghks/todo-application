import { useState } from "react";
import "./NicknameForm.css";

interface Props {
  onSubmit: (nickname: string) => Promise<void>;
}

export function NicknameForm({ onSubmit }: Props) {
  const [nickname, setNickname] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nickname.trim()) return;

    setSubmitting(true);
    setError("");
    try {
      await onSubmit(nickname.trim());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  return (
    <div className="nickname-container">
      <div className="nickname-card">
        <h1 className="nickname-title pixel-font">Welcome!</h1>
        <p className="nickname-subtitle">Choose your adventurer name</p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            className="nickname-input"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Enter nickname..."
            maxLength={20}
            autoFocus
          />

          {error && <p className="nickname-error">{error}</p>}

          <button
            type="submit"
            className="nickname-submit-btn"
            disabled={submitting || !nickname.trim()}
          >
            {submitting ? "..." : "Start Adventure"}
          </button>
        </form>
      </div>
    </div>
  );
}
