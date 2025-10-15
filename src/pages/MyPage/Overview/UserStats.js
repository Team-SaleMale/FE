import styles from "../../../styles/MyPage/Overview/UserStats.module.css";

export default function UserStats() {
  return (
    <section className={styles.root}>
      <div className={styles.metricBlock}>
        <div className={styles.metricHeader}>경매지수</div>
        <div className={styles.metricScore}>85 / 100</div>
        <div className={styles.metricBar}>
          <div className={styles.metricFill} style={{ width: "85%" }} />
        </div>
      </div>

      <div className={styles.rowCards}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>최근 후기</div>
          <div className={styles.cardLine}>⭐ "친절하고 빠른 거래였습니다! 다음에도..."</div>
          <div className={styles.cardLine}>⭐ "상품 상태가 설명과 정확히 일치해요 👍"</div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardTitle}>최근 채팅</div>
          <div className={styles.cardLine}>💬 김철수: "언제 거래 가능한가요?"</div>
          <div className={styles.cardLine}>💬 이영희: "택배비는 얼마인가요?"</div>
        </div>
      </div>
    </section>
  );
}


