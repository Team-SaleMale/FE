// src/components/notifications/NotificationBell.js
import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import "../../styles/common/Header.css";
import api, { get, del, patch } from "../../api/client";

const unifiedTop = 40;

export default function NotificationBell({ user }) {
  // 백엔드 프로필 스키마가 어떻게 올지 몰라서 몇 가지 후보 다 봐줌
  const userId =
    user?.id ?? user?.userId ?? user?.user?.id ?? null;

  const [openBell, setOpenBell] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const bellRef = useRef(null);
  const bellPopRef = useRef(null);

  const hasNotifications = notifications && notifications.length > 0;
  const hasUnread = notifications?.some?.((n) => n.isRead === false);

  /* ---------------- 바깥 클릭 / ESC로 닫기 ---------------- */
  useEffect(() => {
    if (!openBell) return;

    const onDown = (e) => {
      const inBellBtn = bellRef.current?.contains(e.target);
      const inBellPop = bellPopRef.current?.contains?.(e.target);
      if (!inBellBtn && !inBellPop) setOpenBell(false);
    };

    const onEsc = (e) => {
      if (e.key === "Escape") setOpenBell(false);
    };

    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onEsc);
    };
  }, [openBell]);

  /* ---------------- 알림 목록 조회 (/alarms) ---------------- */
  const fetchNotifications = async () => {
    if (!userId) return;
    setLoading(true);
    setErrorMsg("");

    try {
      // GET /alarms  (header: user-id)
      const res = await get("/alarms", {}, {
        headers: { "user-id": userId },
      });

      const list = res?.result ?? [];
      const arr = Array.isArray(list) ? list : [];

      // 최신순 정렬 (createdAt 기준)
      arr.sort((a, b) => {
        const ta = new Date(a.createdAt || 0).getTime();
        const tb = new Date(b.createdAt || 0).getTime();
        return tb - ta;
      });

      setNotifications(arr);
    } catch (e) {
      console.error("알림 조회 실패:", e);
      setErrorMsg(e?.friendlyMessage || "알림을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 모달이 열릴 때마다 새로 조회
  useEffect(() => {
    if (openBell) {
      fetchNotifications();
    }
  }, [openBell, userId]);

  /* ---------------- 모두 읽음 처리 (/alarms/read-all) ---------------- */
  const handleReadAll = async () => {
    if (!userId || !hasNotifications) return;

    try {
      // PATCH /alarms/read-all  (header: user-id)
      await patch("/alarms/read-all", {}, {
        headers: { "user-id": userId },
      });

      // 클라이언트 상태만 isRead=true 로 업데이트
      const nowIso = new Date().toISOString();
      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          isRead: true,
          readAt: n.readAt || nowIso,
        }))
      );
    } catch (e) {
      console.error("알림 모두 읽기 실패:", e);
      alert("알림 모두 읽기에 실패했습니다.");
    }
  };

  /* ---------------- 개별 삭제 (/alarms/{alarmId}) ---------------- */
  const handleDelete = async (alarmId) => {
    if (!userId || !alarmId) return;

    try {
      // DELETE /alarms/{alarmId}  (header: user-id)
      await del(`/alarms/${alarmId}`, {
        headers: { "user-id": userId },
      });

      // 클라이언트 상태에서도 제거
      setNotifications((prev) =>
        prev.filter((n) => n.alarmId !== alarmId)
      );
    } catch (e) {
      console.error("알림 삭제 실패:", e);
      alert("알림 삭제에 실패했습니다.");
    }
  };

  const formatTime = (iso) => {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const hh = String(d.getHours()).padStart(2, "0");
      const mi = String(d.getMinutes()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
    } catch {
      return iso;
    }
  };

  return (
    <>
      <button
        ref={bellRef}
        type="button"
        className="vb-bell"
        aria-haspopup="dialog"
        aria-expanded={openBell}
        onClick={() => setOpenBell((v) => !v)}
      >
        <Bell size={22} strokeWidth={2} />
        {hasUnread && <span className="vb-bell__badge" />}
      </button>

      {openBell && (
        <div
          ref={bellPopRef}
          className="vb-popover"
          role="dialog"
          aria-label="알림"
          style={{ position: "absolute", right: 56, top: unifiedTop }}
        >
          <div className="vb-popover__arrow" />

          <div
            className="vb-popover__head"
            style={{
              fontWeight: "normal",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>알림</span>
            {hasNotifications && (
              <button
                type="button"
                className="vb-notification__read-all"
                onClick={handleReadAll}
              >
                모두 읽음
              </button>
            )}
          </div>

          <div
            className="vb-popover__body"
            style={{ fontWeight: "normal", maxHeight: 320, overflowY: "auto" }}
          >
            {loading && <div>알림을 불러오는 중입니다...</div>}
            {!loading && errorMsg && (
              <div style={{ color: "red" }}>{errorMsg}</div>
            )}
            {!loading && !errorMsg && !hasNotifications && (
              <div>아직 알림이 없습니다.</div>
            )}

            {!loading && !errorMsg && hasNotifications && (
              <ul className="vb-notification-list">
                {notifications.map((n) => (
                  <li
                    key={n.alarmId}
                    className={`vb-notification-item ${
                      n.isRead ? "vb-notification-item--read" : ""
                    }`}
                  >
                    <div className="vb-notification-content">
                      <div className="vb-notification-text">
                        {n.content || "알림"}
                      </div>
                      <div className="vb-notification-time">
                        {formatTime(n.createdAt)}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="vb-notification-delete"
                      onClick={() => handleDelete(n.alarmId)}
                    >
                      삭제
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </>
  );
}
