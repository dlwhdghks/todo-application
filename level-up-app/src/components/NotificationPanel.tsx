import type { Invitation } from "../hooks/useInvitations";
import "./NotificationPanel.css";

interface Props {
  invitations: Invitation[];
  onAccept: (invitationId: number, questId: string) => void;
  onDecline: (invitationId: number) => void;
  onClose: () => void;
}

export function NotificationPanel({
  invitations,
  onAccept,
  onDecline,
  onClose,
}: Props) {
  // pending을 먼저, 나머지는 최신순
  const sorted = [...invitations].sort((a, b) => {
    if (a.status === "pending" && b.status !== "pending") return -1;
    if (a.status !== "pending" && b.status === "pending") return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="notification-panel" onClick={(e) => e.stopPropagation()}>
        <h3 className="notification-title pixel-font">Notifications</h3>

        {sorted.length === 0 ? (
          <p className="notification-empty">No notifications</p>
        ) : (
          <div className="notification-list">
            {sorted.map((inv) => {
              const isHandled = inv.status !== "pending";
              return (
                <div
                  key={inv.id}
                  className={`notification-item ${isHandled ? "handled" : ""}`}
                >
                  <div
                    className="notification-color-bar"
                    style={{ background: inv.questColor }}
                  />
                  <div className="notification-content">
                    <p className="notification-sender">
                      <strong>{inv.senderNickname}</strong> invited you
                    </p>
                    <p className="notification-quest-title">{inv.questTitle}</p>
                    <p className="notification-quest-detail">
                      {inv.questDate} {inv.questTime}
                    </p>

                    {isHandled ? (
                      <span
                        className={`notification-status ${inv.status}`}
                      >
                        {inv.status === "accepted" ? "Accepted" : "Declined"}
                      </span>
                    ) : (
                      <div className="notification-actions">
                        <button
                          className="notification-decline-btn"
                          onClick={() => onDecline(inv.id)}
                        >
                          Decline
                        </button>
                        <button
                          className="notification-accept-btn"
                          onClick={() => onAccept(inv.id, inv.questId)}
                        >
                          Accept
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
