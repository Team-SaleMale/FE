import { useState } from "react";
import { Icon } from "@iconify/react";
import styles from "../../styles/MyPage/DetailFilter.module.css";

export default function DetailFilter({ open, onClose, onApply }) {
  const [selectedPeriod, setSelectedPeriod] = useState("최근 1년");

  const periods = ["최근 1년", "1주일", "1개월", "3개월", "6개월"];

  const handleApply = () => {
    onApply?.({ period: selectedPeriod });
    onClose();
  };

  if (!open) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.panel}>
        <header className={styles.header}>
          <h3 className={styles.title}>상세필터</h3>
          <button className={styles.closeBtn} onClick={onClose} aria-label="닫기">
            <Icon icon="solar:close-circle-linear" />
          </button>
        </header>

        <div className={styles.body}>
          <div className={styles.filterSection}>
            <label className={styles.filterLabel}>조회기간</label>
            <div className={styles.periodOptions}>
              {periods.map((period) => (
                <button
                  key={period}
                  className={`${styles.periodBtn} ${selectedPeriod === period ? styles.active : ""}`}
                  onClick={() => setSelectedPeriod(period)}
                >
                  {period}
                </button>
              ))}
            </div>
            <p className={styles.helperText}>
              • 최근 1년 이내의 거래내역만 노출합니다
            </p>
          </div>
        </div>

        <footer className={styles.footer}>
          <button className={styles.applyBtn} onClick={handleApply}>
            조회하기
          </button>
        </footer>
      </div>
    </div>
  );
}