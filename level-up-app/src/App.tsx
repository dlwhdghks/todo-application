import { useState } from "react";
import type { Quest, ViewMode } from "./types";
import { useAuth } from "./hooks/useAuth";
import { useProfile } from "./hooks/useProfile";
import { useSupabaseQuests } from "./hooks/useSupabaseQuests";
import { useSupabaseProgress } from "./hooks/useSupabaseProgress";
import { useFriends } from "./hooks/useFriends";
import { useInvitations } from "./hooks/useInvitations";
import { useApiTokens } from "./hooks/useApiTokens";
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
import { NotificationPanel } from "./components/NotificationPanel";
import { SettingsPanel } from "./components/SettingsPanel";
import { AiRecommendPanel } from "./components/AiRecommendPanel";

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
  const {
    invitations,
    pendingCount,
    sendInvitations,
    acceptInvitation,
    declineInvitation,
    refreshInvitations,
  } = useInvitations(userId);
  const { tokens, createToken, deleteToken } = useApiTokens(userId);

  const [viewMode, setViewMode] = useState<ViewMode>(() => loadViewMode());
  const [editingQuest, setEditingQuest] = useState<Quest | null>(null);
  const [conflictData, setConflictData] = useState<{
    existing: Quest;
    newQuest: Quest;
    inviteFriendIds: string[];
  } | null>(null);
  const [showFriends, setShowFriends] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAi, setShowAi] = useState(false);

  if (profileLoading) {
    return (
      <div className="app loading-screen">
        <p className="pixel-font" style={{ fontSize: 12 }}>Loading...</p>
      </div>
    );
  }

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

  async function handleAddQuest(quest: Quest, inviteFriendIds: string[]) {
    await addQuest(quest);
    if (inviteFriendIds.length > 0) {
      await sendInvitations(quest.id, inviteFriendIds);
    }
  }

  function handleConflict(existing: Quest, newQuest: Quest, inviteFriendIds: string[]) {
    setConflictData({ existing, newQuest, inviteFriendIds });
  }

  function handleConflictConfirm() {
    if (!conflictData) return;
    deleteQuest(conflictData.existing.id);
    handleAddQuest(conflictData.newQuest, conflictData.inviteFriendIds);
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

  async function handleAcceptInvitation(invitationId: number, questId: string) {
    await acceptInvitation(invitationId, questId);
    window.location.reload();
  }

  return (
    <div className="app">
      <Header
        onOpenFriends={() => setShowFriends(true)}
        onOpenNotifications={() => {
          setShowNotifications(true);
          refreshInvitations();
        }}
        onOpenSettings={() => setShowSettings(true)}
        pendingCount={pendingCount}
      />

      <ProgressPanel
        progress={progress}
        showLevelUp={showLevelUp}
        nickname={profile.nickname}
      />
      <ViewModeTabs viewMode={viewMode} onChange={handleViewModeChange} />

      <QuestForm
        quests={quests}
        friends={friends}
        onAdd={handleAddQuest}
        onConflict={handleConflict}
        onOpenAi={() => setShowAi(true)}
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

      {showAi && (
        <AiRecommendPanel
          onAddQuest={handleAddQuest}
          onClose={() => setShowAi(false)}
          apiToken={tokens.length > 0 ? tokens[0].token : null}
        />
      )}

      {showSettings && (
        <SettingsPanel
          userEmail={userEmail}
          tokens={tokens}
          onCreateToken={createToken}
          onDeleteToken={deleteToken}
          onSignOut={onSignOut}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showNotifications && (
        <NotificationPanel
          invitations={invitations}
          onAccept={handleAcceptInvitation}
          onDecline={declineInvitation}
          onClose={() => setShowNotifications(false)}
        />
      )}
    </div>
  );
}
