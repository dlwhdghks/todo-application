import { useState } from "react";
import "./AuthForm.css";

interface Props {
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignUp: (email: string, password: string) => Promise<void>;
}

export function AuthForm({ onSignIn, onSignUp }: Props) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);

    try {
      if (isSignUp) {
        await onSignUp(email, password);
        setMessage("Check your email to confirm your account!");
      } else {
        await onSignIn(email, password);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* 픽셀 아트 검 장식 */}
        <div className="auth-pixel-art">
          <span className="auth-sword">&#9876;</span>
        </div>

        <h1 className="auth-title pixel-font">Level Up</h1>
        <p className="auth-tagline pixel-font">
          {isSignUp ? "Join the Adventure" : "Welcome Back"}
        </p>

        <div className="auth-decorline" />

        <form onSubmit={handleSubmit}>
          <label className="form-label">
            Email
            <input
              type="email"
              className="form-input auth-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>

          <label className="form-label">
            Password
            <input
              type="password"
              className="form-input auth-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6 characters minimum"
              minLength={6}
              required
            />
          </label>

          {error && <p className="auth-error">{error}</p>}
          {message && <p className="auth-message">{message}</p>}

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={submitting}
          >
            {submitting
              ? "..."
              : isSignUp
              ? ">> Start Game <<"
              : ">> Continue <<"}
          </button>
        </form>

        <button
          className="auth-toggle-btn"
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError("");
            setMessage("");
          }}
        >
          {isSignUp
            ? "Already have a save? Sign In"
            : "New player? Sign Up"}
        </button>
      </div>
    </div>
  );
}
