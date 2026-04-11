import { useState } from "react";
import type { Quest } from "../types";
import type { FriendInfo } from "../hooks/useFriends";
import { QuestCard } from "./QuestCard";
import { isQuestVisibleOnDate, getTodayString } from "../utils/questUtils";
import "./FriendsPanel.css";

interface Props {
  friendCode: string;
  friends: FriendInfo[];
  onAddFriend: (code: string) => Promise<string | null>;
  onGetFriendQuests: (friendId: string) => Promise<Quest[]>;
  onClose: () => void;
}

export function FriendsPanel({
  friendCode,
  friends,
  onAddFriend,
  onGetFriendQuests,
  onClose,
}: Props) {
  const [codeInput, setCodeInput] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [adding, setAdding] = useState(false);
  const [copied, setCopied] = useState(false);

  // 친구 퀘스트 보기 상태
  const [viewingFriend, setViewingFriend] = useState<FriendInfo | null>(null);
  const [friendQuests, setFriendQuests] = useState<Quest[]>([]);
  const [questsLoading, setQuestsLoading] = useState(false);

  // 친구 코드 복사
  function handleCopy() {
    navigator.clipboard.writeText(friendCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  // 친구 추가
  async function handleAddFriend() {
    if (!codeInput.trim()) return;
    setError("");
    setSuccess("");
    setAdding(true);

    const errMsg = await onAddFriend(codeInput.trim());
    if (errMsg) {
      setError(errMsg);
    } else {
      setSuccess("친구가 추가되었습니다!");
      setCodeInput("");
    }
    setAdding(false);
  }

  // 친구 클릭 -> 퀘스트 보기
  async function handleViewFriend(friend: FriendInfo) {
    setViewingFriend(friend);
    setQuestsLoading(true);
    const quests = await onGetFriendQuests(friend.userId);
    setFriendQuests(quests);
    setQuestsLoading(false);
  }

  // 친구 검색 필터
  const filtered = friends.filter((f) =>
    f.nickname.toLowerCase().includes(search.toLowerCase())
  );

  const todayStr = getTodayString();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="friends-panel" onClick={(e) => e.stopPropagation()}>

        {/* 친구 퀘스트 보기 화면 */}
        {viewingFriend ? (
          <>
            <div className="friends-header">
              <button
                className="friends-back-btn"
                onClick={() => setViewingFriend(null)}
              >
                &larr;
              </button>
              <h3 className="friends-title">
                {viewingFriend.nickname}
                <span className="friends-title-level pixel-font">
                  Lv.{viewingFriend.level}
                </span>
              </h3>
            </div>

            <div className="friend-quests-list">
              {questsLoading ? (
                <p className="friends-empty">Loading...</p>
              ) : friendQuests.filter((q) =>
                  isQuestVisibleOnDate(q, todayStr)
                ).length === 0 ? (
                <p className="friends-empty">No quests today</p>
              ) : (
                friendQuests
                  .filter((q) => isQuestVisibleOnDate(q, todayStr))
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map((quest) => (
                    <QuestCard
                      key={quest.id}
                      quest={quest}
                      date={todayStr}
                      readOnly
                    />
                  ))
              )}
            </div>
          </>
        ) : (
          <>
            <h3 className="friends-title pixel-font">Party</h3>

            {/* 내 친구 코드 */}
            <div className="my-code-section">
              <span className="my-code-label">My Code</span>
              <div className="my-code-row">
                <span className="my-code-value pixel-font">{friendCode}</span>
                <button className="my-code-copy-btn" onClick={handleCopy}>
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            {/* 친구 코드 입력 */}
            <div className="add-friend-section">
              <input
                type="text"
                className="form-input"
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                placeholder="Enter friend code..."
                maxLength={10}
              />
              <button
                className="add-friend-btn"
                onClick={handleAddFriend}
                disabled={adding || !codeInput.trim()}
              >
                {adding ? "..." : "Add"}
              </button>
            </div>
            {error && <p className="friends-error">{error}</p>}
            {success && <p className="friends-success">{success}</p>}

            {/* 친구 검색 */}
            {friends.length > 0 && (
              <input
                type="text"
                className="form-input friends-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search friends..."
              />
            )}

            {/* 친구 목록 */}
            <div className="friends-list">
              {filtered.length === 0 ? (
                <p className="friends-empty">
                  {friends.length === 0
                    ? "No friends yet"
                    : "No results"}
                </p>
              ) : (
                filtered.map((friend) => (
                  <div
                    key={friend.userId}
                    className="friend-item"
                    onClick={() => handleViewFriend(friend)}
                  >
                    <span className="friend-nickname">{friend.nickname}</span>
                    <span className="friend-level pixel-font">
                      Lv.{friend.level}
                    </span>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
