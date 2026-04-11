import { useState } from "react";
import type { Quest, ViewMode } from "./types";
import { useAuth } from "./hooks/useAuth";
import { useProfile } from "./hooks/useProfile";
import { useSupabaseQuests } from "./hooks/useSupabaseQuests";
import { useSupabaseProgress } from "./hooks/useSupabaseProgress";
import { useFriends } from "./hooks/useFriends";
import { loadViewMode, saveViewMode } from "./utils/localStorage";
import { isQuestCompletedOnDate } from "./utils/questUtils";

import { AuthForm } from "./components/AuthForm";
import { NicknameForm } from "./components/NicknameForm";
import { Header } from "./components/Header";
import { ProgressPanel } from "./components/ProgressPanel";
import { ViewModeTabs } from "./components/ViewModeTabs";
import { QuestForm } from "./components/QuestForm";
import { QuestList } from "./components/QuestList";
import { OverdueQuestSection } from "./components/OverdueQuestSection";
import { EditQuestModal } from "./components/EditQuestModal";
import { ConflictModal } from "./components/ConflictModal";
import { FriendsPanel } from "./components/FriendsPanel";

import "./App.css";

export default function App() {
  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth();

  if (authLoading) {
    return (
      <div className="app loading-screen">
        <p className="pixel-font" style={{ fontSize: 12 }}>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthForm onSignIn={signIn} onSignUp={signUp} />;
  }

  return <MainApp userId={user.id} userEmail={user.email} onSignOut={signOut} />;
}

function MainApp({
  userId,
  userEmail,
  onSignOut,
}: {
  userId: string;
  userEmail: string | undefined;
  onSignOut: () => void;
}) {
  const { profile, loading: profileLoading, createProfile } = useProfile(userId);
  const { quests, addQuest, updateQuest, deleteQuest, toggleComplete } =
    useSupabaseQuests(userId);
  const { progress, addExp, removeExp, showLevelUp } =
    useSupabaseProgress(userId);
  const { friends, addFriendByCode, getFriendQuests } = useFriends(userId);

  const [viewMode, setViewMode] = useState<ViewMode>(() => loadViewMode());
  const [editingQuest, setEditingQuest] = useState<Quest | null>(null);
  const [conflictData, setConflictData] = useState<{
    existing: Quest;
    newQuest: Quest;
  } | null>(null);
  const [showFriends, setShowFriends] = useState(false);

  // 프로필 로딩 중
  if (profileLoading) {
    return (
      <div className="app loading-screen">
        <p className="pixel-font" style={{ fontSize: 12 }}>Loading...</p>
      </div>
    );
  }

  // 닉네임 미설정 -> 닉네임 입력 화면
  if (!profile) {
    return <NicknameForm onSubmit={createProfile} />;
  }

  function handleViewModeChange(mode: ViewMode) {
    setViewMode(mode);
    saveViewMode(mode);
  }

  function handleToggleComplete(questId: string, dateStr: string) {
    const quest = quests.find((q) => q.id === questId);
    if (!quest) return;

    const wasCompleted = isQuestCompletedOnDate(quest, dateStr);
    toggleComplete(questId, dateStr);

    if (wasCompleted) {
      removeExp(10);
    } else {
      addExp(10);
    }
  }

  function handleConflict(existing: Quest, newQuest: Quest) {
    setConflictData({ existing, newQuest });
  }

  function handleConflictConfirm() {
    if (!conflictData) return;
    deleteQuest(conflictData.existing.id);
    addQuest(conflictData.newQuest);
    setConflictData(null);
  }

  function handleSaveEdit(updated: Quest) {
    updateQuest(updated);
    setEditingQuest(null);
  }

  function handleDeleteFromEdit(id: string) {
    deleteQuest(id);
    setEditingQuest(null);
  }

  return (
    <div className="app">
      <Header onOpenFriends={() => setShowFriends(true)} />

      <div className="user-bar">
        <span className="user-email">{userEmail}</span>
        <button className="sign-out-btn" onClick={onSignOut}>
          Sign Out
        </button>
      </div>

      <ProgressPanel
        progress={progress}
        showLevelUp={showLevelUp}
        nickname={profile.nickname}
      />
      <ViewModeTabs viewMode={viewMode} onChange={handleViewModeChange} />

      <QuestForm
        quests={quests}
        onAdd={addQuest}
        onConflict={handleConflict}
      />

      <OverdueQuestSection
        quests={quests}
        onToggleComplete={handleToggleComplete}
        onClickQuest={setEditingQuest}
      />

      <QuestList
        quests={quests}
        viewMode={viewMode}
        onToggleComplete={handleToggleComplete}
        onClickQuest={setEditingQuest}
      />

      {editingQuest && (
        <EditQuestModal
          quest={editingQuest}
          onSave={handleSaveEdit}
          onDelete={handleDeleteFromEdit}
          onClose={() => setEditingQuest(null)}
        />
      )}

      {conflictData && (
        <ConflictModal
          existingQuest={conflictData.existing}
          onConfirm={handleConflictConfirm}
          onCancel={() => setConflictData(null)}
        />
      )}

      {showFriends && (
        <FriendsPanel
          friendCode={profile.friendCode}
          friends={friends}
          onAddFriend={addFriendByCode}
          onGetFriendQuests={getFriendQuests}
          onClose={() => setShowFriends(false)}
        />
      )}
    </div>
  );
}
