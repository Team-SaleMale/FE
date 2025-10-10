import styles from "../../styles/AuctionRegistration/SubmitBar.module.css";

export default function SubmitBar({ onSubmit = () => {}, loading = false, error = "" }) {
  return (
    <div className={styles.bar}>
      <div className={styles.left}>{error && <span className={styles.error}>{error}</span>}</div>
      <button className={styles.btn} onClick={onSubmit} disabled={loading}>
        {loading ? "등록 중..." : "경매 등록하기"}
      </button>
    </div>
  );
}
