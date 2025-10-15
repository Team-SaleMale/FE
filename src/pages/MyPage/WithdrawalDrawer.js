import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import styles from "../../styles/MyPage/WithdrawalDrawer.module.css";

export default function WithdrawalDrawer({ open, onClose }) {
  const [selectedReason, setSelectedReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const reasons = [
    { id: "not-using", label: "서비스를 더 이상 이용하지 않아요" },
    { id: "found-alternative", label: "다른 서비스를 이용할 거예요" },
    { id: "privacy", label: "개인정보가 걱정돼요" },
    { id: "difficult", label: "사용하기 어려워요" },
    { id: "other", label: "기타" },
  ];

  const handleWithdraw = () => {
    if (!selectedReason) {
      alert("탈퇴 사유를 선택해주세요.");
      return;
    }
    if (selectedReason === "other" && !otherReason.trim()) {
      alert("기타 사유를 입력해주세요.");
      return;
    }
    if (!agreed) {
      alert("탈퇴 안내 사항을 확인하고 동의해주세요.");
      return;
    }

    // 실제로는 백엔드 API 호출
    const confirmWithdraw = window.confirm("정말로 탈퇴하시겠습니까?\n탈퇴 후에는 복구할 수 없습니다.");
    if (confirmWithdraw) {
      alert("회원 탈퇴가 완료되었습니다.");
      // 로그아웃 및 메인 페이지로 이동 처리
      onClose();
    }
  };

  const handleReset = () => {
    setSelectedReason("");
    setOtherReason("");
    setAgreed(false);
  };

  useEffect(() => {
    if (open) {
      handleReset();
    }
  }, [open]);

  if (!open) return null;

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.drawer}>
        {/* 헤더 */}
        <header className={styles.header}>
          <button className={styles.close} onClick={onClose} aria-label="닫기">
            <Icon icon="solar:close-circle-linear" />
          </button>
          <h3 className={styles.title}>회원 탈퇴</h3>
          <div className={styles.headerPlaceholder} />
        </header>

        {/* 내용 */}
        <div className={styles.content}>
          {/* 경고 메시지 */}
          <div className={styles.warningBox}>
            <Icon icon="solar:danger-triangle-bold" className={styles.warningIcon} />
            <div className={styles.warningText}>
              <strong>탈퇴 시 유의사항</strong>
              <ul>
                <li>모든 개인정보가 삭제되며 복구할 수 없습니다.</li>
                <li>진행 중인 경매가 있다면 탈퇴할 수 없습니다.</li>
                <li>거래 내역은 법령에 따라 일정 기간 보관됩니다.</li>
              </ul>
            </div>
          </div>

          {/* 탈퇴 사유 */}
          <div className={styles.section}>
            <label className={styles.sectionTitle}>탈퇴 사유를 선택해주세요</label>
            <div className={styles.reasonList}>
              {reasons.map((reason) => (
                <label key={reason.id} className={styles.reasonItem}>
                  <input
                    type="radio"
                    name="reason"
                    value={reason.id}
                    checked={selectedReason === reason.id}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className={styles.radio}
                  />
                  <span>{reason.label}</span>
                </label>
              ))}
            </div>

            {/* 기타 사유 입력 */}
            {selectedReason === "other" && (
              <textarea
                className={styles.textarea}
                placeholder="탈퇴 사유를 입력해주세요"
                value={otherReason}
                onChange={(e) => setOtherReason(e.target.value)}
                rows={4}
              />
            )}
          </div>

          {/* 동의 체크박스 */}
          <div className={styles.agreementSection}>
            <label className={styles.agreementLabel}>
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className={styles.checkbox}
              />
              <span>위 내용을 모두 확인했으며, 탈퇴에 동의합니다.</span>
            </label>
          </div>
        </div>

        {/* 푸터 */}
        <div className={styles.footer}>
          <button className={styles.cancelButton} onClick={onClose}>
            취소
          </button>
          <button
            className={styles.withdrawButton}
            onClick={handleWithdraw}
            disabled={!selectedReason || !agreed}
          >
            탈퇴하기
          </button>
        </div>
      </div>
    </>
  );
}
