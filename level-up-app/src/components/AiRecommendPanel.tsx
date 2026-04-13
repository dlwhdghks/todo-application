import { useState } from "react";
import type { Quest } from "../types";
import { generateId, getTodayString } from "../utils/questUtils";
import "./AiRecommendPanel.css";

interface Recommendation {
  title: string;
  time: string;
  reason: string;
}

interface Props {
  quests: Quest[];
  nickname: string;
  level: number;
  onAddQuest: (quest: Quest, inviteFriendIds: string[]) => void;
  onClose: () => void;
}

export function AiRecommendPanel({ quests, nickname, level, onAddQuest, onClose }: Props) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [addedIndexes, setAddedIndexes] = useState<number[]>([]);

  async function fetchRecommendations() {
    setLoading(true);
    setError("");
    setAddedIndexes([]);

    try {
      // 최근 퀘스트 30개만 전달
      const recentQuests = quests.slice(0, 30).map((q) => ({
        title: q.title,
        date: q.date,
        time: q.time,
        repeat: q.repeat,
      }));

      const res = await fetch("/api/recommend-open", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quests: recentQuests,
          nickname,
          level,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || `Server error (${res.status})`);
      }

      const data = await res.json();
      setRecommendations(data.recommendations || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI recommendation failed.");
    } finally {
      setLoading(false);
    }
  }

  function handleAdd(rec: Recommendation, index: number) {
    const quest: Quest = {
      id: generateId(),
      title: rec.title,
      date: getTodayString(),
      time: rec.time,
      repeat: "none",
      color: "#8b5cf6",
      completedDates: [],
      createdAt: Date.now(),
    };
    onAddQuest(quest, []);
    setAddedIndexes((prev) => [...prev, index]);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="ai-panel" onClick={(e) => e.stopPropagation()}>
        <h3 className="ai-panel-title pixel-font">AI Quest</h3>
        <p className="ai-panel-subtitle">
          Based on your quest history
        </p>

        {recommendations.length === 0 && !loading && (
          <button
            className="ai-generate-btn"
            onClick={fetchRecommendations}
            disabled={loading}
          >
            Get Recommendations
          </button>
        )}

        {loading && (
          <div className="ai-loading">
            <span className="ai-loading-text pixel-font">Thinking...</span>
          </div>
        )}

        {error && <p className="ai-error">{error}</p>}

        {recommendations.length > 0 && (
          <div className="ai-recommendations">
            {recommendations.map((rec, i) => (
              <div key={i} className="ai-rec-card">
                <div className="ai-rec-info">
                  <span className="ai-rec-title">{rec.title}</span>
                  <span className="ai-rec-time">{rec.time}</span>
                  <span className="ai-rec-reason">{rec.reason}</span>
                </div>
                <button
                  className={`ai-rec-add-btn ${addedIndexes.includes(i) ? "added" : ""}`}
                  onClick={() => handleAdd(rec, i)}
                  disabled={addedIndexes.includes(i)}
                >
                  {addedIndexes.includes(i) ? "Added" : "+"}
                </button>
              </div>
            ))}

            <button
              className="ai-retry-btn"
              onClick={fetchRecommendations}
              disabled={loading}
            >
              Retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
