import { useState } from "react";
import type { ApiToken } from "../hooks/useApiTokens";
import "./SettingsPanel.css";

interface Props {
  userEmail: string | undefined;
  nickname: string;
  tokens: ApiToken[];
  onCreateToken: (name: string) => Promise<string>;
  onDeleteToken: (id: number) => void;
  onUpdateNickname: (name: string) => Promise<void>;
  onSignOut: () => void;
  onClose: () => void;
}

export function SettingsPanel({
  userEmail,
  nickname,
  tokens,
  onCreateToken,
  onDeleteToken,
  onUpdateNickname,
  onSignOut,
  onClose,
}: Props) {
  const [showApiSection, setShowApiSection] = useState(false);
  const [tokenName, setTokenName] = useState("");
  const [newToken, setNewToken] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);

  // 닉네임 변경
  const [editingNickname, setEditingNickname] = useState(false);
  const [newNickname, setNewNickname] = useState(nickname);
  const [nicknameError, setNicknameError] = useState("");
  const [nicknameSaving, setNicknameSaving] = useState(false);

  async function handleCreateToken() {
    if (!tokenName.trim()) return;
    setCreating(true);
    try {
      const token = await onCreateToken(tokenName.trim());
      setNewToken(token);
      setTokenName("");
    } catch {
      // ignore
    }
    setCreating(false);
  }

  async function handleNicknameSave() {
    if (!newNickname.trim() || newNickname.trim() === nickname) {
      setEditingNickname(false);
      return;
    }
    setNicknameError("");
    setNicknameSaving(true);
    try {
      await onUpdateNickname(newNickname.trim());
      setEditingNickname(false);
    } catch (err: unknown) {
      setNicknameError(
        err instanceof Error ? err.message : "Failed to update nickname"
      );
    }
    setNicknameSaving(false);
  }

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        <h3 className="settings-title pixel-font">Settings</h3>

        {/* 계정 정보 */}
        <div className="settings-section">
          <span className="settings-label">Account</span>
          <span className="settings-email">{userEmail}</span>
        </div>

        {/* 닉네임 */}
        <div className="settings-section">
          <span className="settings-label">Nickname</span>
          {editingNickname ? (
            <div className="nickname-edit-row">
              <input
                type="text"
                className="form-input"
                value={newNickname}
                onChange={(e) => setNewNickname(e.target.value)}
                maxLength={20}
                autoFocus
              />
              <button
                className="add-friend-btn"
                onClick={handleNicknameSave}
                disabled={nicknameSaving}
              >
                {nicknameSaving ? "..." : "Save"}
              </button>
            </div>
          ) : (
            <div className="nickname-display-row">
              <span className="settings-nickname">{nickname}</span>
              <button
                className="nickname-edit-btn"
                onClick={() => {
                  setNewNickname(nickname);
                  setEditingNickname(true);
                  setNicknameError("");
                }}
              >
                Edit
              </button>
            </div>
          )}
          {nicknameError && (
            <p className="nickname-error">{nicknameError}</p>
          )}
        </div>

        {/* API Tokens */}
        <div className="settings-section">
          <button
            className="settings-menu-btn"
            onClick={() => setShowApiSection(!showApiSection)}
          >
            <span>API Tokens</span>
            <span>{showApiSection ? "\u25B2" : "\u25BC"}</span>
          </button>

          {showApiSection && (
            <div className="settings-api-content">
              {/* 새 토큰 생성 알림 */}
              {newToken && (
                <div className="new-token-alert">
                  <p className="new-token-label">
                    Copy now - won't be shown again.
                  </p>
                  <div className="new-token-row">
                    <code className="new-token-value">{newToken}</code>
                    <button
                      className="my-code-copy-btn"
                      onClick={() => handleCopy(newToken)}
                    >
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <button
                    className="new-token-dismiss"
                    onClick={() => setNewToken(null)}
                  >
                    Done
                  </button>
                </div>
              )}

              {/* 토큰 생성 */}
              <div className="create-token-section">
                <input
                  type="text"
                  className="form-input"
                  value={tokenName}
                  onChange={(e) => setTokenName(e.target.value)}
                  placeholder="Token name..."
                  maxLength={30}
                />
                <button
                  className="add-friend-btn"
                  onClick={handleCreateToken}
                  disabled={creating || !tokenName.trim()}
                >
                  {creating ? "..." : "Create"}
                </button>
              </div>

              {/* 토큰 목록 */}
              {tokens.length === 0 ? (
                <p className="token-empty">No API tokens</p>
              ) : (
                <div className="token-list">
                  {tokens.map((t) => (
                    <div key={t.id} className="token-item">
                      <div className="token-info">
                        <span className="token-name">{t.name}</span>
                        <span className="token-preview">
                          {t.token.slice(0, 10)}...
                        </span>
                      </div>
                      <button
                        className="token-delete-btn"
                        onClick={() => onDeleteToken(t.id)}
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* API 사용법 */}
              <div className="api-docs-section">
                <span className="api-docs-label">API Usage</span>
                <code className="api-docs-example">
                  curl -H "Authorization: Bearer TOKEN" \<br />
                  &nbsp;&nbsp;{window.location.origin}/api/quests
                </code>
              </div>
            </div>
          )}
        </div>

        {/* 로그아웃 */}
        <button className="settings-signout-btn" onClick={onSignOut}>
          Sign Out
        </button>
      </div>
    </div>
  );
}
