import { useState } from "react";
import type { ApiToken } from "../hooks/useApiTokens";
import "./ApiTokenPanel.css";

interface Props {
  tokens: ApiToken[];
  onCreate: (name: string) => Promise<string>;
  onDelete: (id: number) => void;
  onClose: () => void;
}

export function ApiTokenPanel({ tokens, onCreate, onDelete, onClose }: Props) {
  const [name, setName] = useState("");
  const [newToken, setNewToken] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleCreate() {
    if (!name.trim()) return;
    setCreating(true);
    try {
      const token = await onCreate(name.trim());
      setNewToken(token);
      setName("");
    } catch {
      // ignore
    }
    setCreating(false);
  }

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="api-token-panel" onClick={(e) => e.stopPropagation()}>
        <h3 className="api-token-title pixel-font">API Tokens</h3>

        {/* 새로 생성된 토큰 표시 (한 번만 보여줌) */}
        {newToken && (
          <div className="new-token-alert">
            <p className="new-token-label">
              Token created! Copy it now - it won't be shown again in full.
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
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Token name (e.g. my-app)"
            maxLength={30}
          />
          <button
            className="add-friend-btn"
            onClick={handleCreate}
            disabled={creating || !name.trim()}
          >
            {creating ? "..." : "Create"}
          </button>
        </div>

        {/* 토큰 목록 */}
        <div className="token-list">
          {tokens.length === 0 ? (
            <p className="token-empty">No API tokens yet</p>
          ) : (
            tokens.map((t) => (
              <div key={t.id} className="token-item">
                <div className="token-info">
                  <span className="token-name">{t.name}</span>
                  <span className="token-preview">
                    {t.token.slice(0, 10)}...
                  </span>
                  <span className="token-meta">
                    {t.lastUsedAt
                      ? `Last used: ${new Date(t.lastUsedAt).toLocaleDateString()}`
                      : "Never used"}
                  </span>
                </div>
                <button
                  className="token-delete-btn"
                  onClick={() => onDelete(t.id)}
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>

        {/* API 사용법 안내 */}
        <div className="api-docs-section">
          <span className="api-docs-label">API Usage</span>
          <code className="api-docs-example">
            curl -H "Authorization: Bearer YOUR_TOKEN" \<br />
            &nbsp;&nbsp;{window.location.origin}/api/quests
          </code>
          <div className="api-docs-endpoints">
            <span>GET /api/profile</span>
            <span>GET /api/quests</span>
            <span>POST /api/quests</span>
            <span>PATCH /api/quests/:id</span>
            <span>DELETE /api/quests/:id</span>
            <span>POST /api/quests/:id/complete</span>
          </div>
        </div>
      </div>
    </div>
  );
}
