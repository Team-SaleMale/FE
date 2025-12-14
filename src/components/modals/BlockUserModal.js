import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";

export default function BlockUserModal({
  open,
  onClose,
  onBlock,
  onUnblock,
  userName,
  isBlocked = false,
  loading = false,
}) {
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    setIsProcessing(loading);
  }, [loading]);

  if (!open) return null;

  const handleBlock = async () => {
    setIsProcessing(true);
    try {
      await onBlock?.();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnblock = async () => {
    setIsProcessing(true);
    try {
      await onUnblock?.();
    } finally {
      setIsProcessing(false);
    }
  };

  const S = {
    overlay: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,.5)",
      zIndex: 2000,
    },
    modal: {
      position: "fixed",
      inset: 0,
      zIndex: 2001,
      display: "grid",
      placeItems: "center",
    },
    panel: {
      width: "min(400px, 90vw)",
      background: "#fff",
      borderRadius: 20,
      boxShadow: "0 12px 40px rgba(0,0,0,.2)",
      padding: "28px 24px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
    },
    iconWrap: {
      width: 64,
      height: 64,
      borderRadius: "50%",
      background: isBlocked ? "#dcfce7" : "#fee2e2",
      display: "grid",
      placeItems: "center",
      marginBottom: 16,
    },
    icon: {
      color: isBlocked ? "#22c55e" : "#ef4444",
      fontSize: 32,
    },
    title: {
      margin: 0,
      fontSize: 20,
      fontWeight: 700,
      color: "#1f2937",
      marginBottom: 12,
    },
    description: {
      margin: 0,
      fontSize: 14,
      color: "#6b7280",
      lineHeight: 1.6,
      marginBottom: 24,
    },
    userName: {
      fontWeight: 600,
      color: "#1f2937",
    },
    footer: {
      display: "flex",
      gap: 12,
      width: "100%",
    },
    cancelButton: {
      flex: 1,
      height: 48,
      borderRadius: 12,
      background: "#f3f4f6",
      color: "#374151",
      fontWeight: 600,
      fontSize: 15,
      border: "none",
      cursor: "pointer",
      transition: "background .15s ease",
    },
    blockButton: {
      flex: 1,
      height: 48,
      borderRadius: 12,
      background: "#ef4444",
      color: "#fff",
      fontWeight: 600,
      fontSize: 15,
      border: "none",
      cursor: isProcessing ? "not-allowed" : "pointer",
      opacity: isProcessing ? 0.7 : 1,
      transition: "background .15s ease, opacity .15s ease",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    unblockButton: {
      flex: 1,
      height: 48,
      borderRadius: 12,
      background: "#22c55e",
      color: "#fff",
      fontWeight: 600,
      fontSize: 15,
      border: "none",
      cursor: isProcessing ? "not-allowed" : "pointer",
      opacity: isProcessing ? 0.7 : 1,
      transition: "background .15s ease, opacity .15s ease",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
  };

  return (
    <>
      <div style={S.overlay} onClick={onClose} />
      <div style={S.modal} role="dialog" aria-modal="true" aria-labelledby="blockModalTitle">
        <div style={S.panel}>
          <div style={S.iconWrap}>
            <Icon
              icon={isBlocked ? "solar:shield-check-bold" : "solar:shield-cross-bold"}
              style={S.icon}
            />
          </div>
          <h3 id="blockModalTitle" style={S.title}>
            {isBlocked ? "사용자 차단 해제" : "사용자 차단"}
          </h3>
          <p style={S.description}>
            <span style={S.userName}>{userName || "이 사용자"}</span>님을{" "}
            {isBlocked ? "차단 해제" : "차단"}하시겠습니까?
            <br />
            <br />
            {isBlocked
              ? "차단 해제하면 상대방의 경매 물품이 다시 표시되고, 채팅도 가능해집니다."
              : "차단하면 상대방의 경매 물품이 더 이상 표시되지 않으며, 채팅도 불가능합니다."}
          </p>
          <div style={S.footer}>
            <button
              type="button"
              style={S.cancelButton}
              onClick={onClose}
              disabled={isProcessing}
            >
              취소
            </button>
            {isBlocked ? (
              <button
                type="button"
                style={S.unblockButton}
                onClick={handleUnblock}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Icon icon="solar:spinner-line-duotone" className="spinning" />
                    해제 중...
                  </>
                ) : (
                  "차단 해제"
                )}
              </button>
            ) : (
              <button
                type="button"
                style={S.blockButton}
                onClick={handleBlock}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Icon icon="solar:spinner-line-duotone" className="spinning" />
                    차단 중...
                  </>
                ) : (
                  "차단하기"
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
