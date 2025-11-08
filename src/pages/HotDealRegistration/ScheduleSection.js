// src/pages/HotDealRegistration/ScheduleSection.js
import styles from "../../styles/HotDealRegistration/ScheduleSection.module.css";

export default function ScheduleSection({ value, onChange, maxEndsAt }) {
  const set = (k, v) => onChange({ ...value, [k]: v });

  return (
    <div className={styles.card}>
      <h2 className={styles.h2}>진행 일정(최대 3일)</h2>

      <div className={styles.row2}>
        <label className={styles.label}>
          시작 시간
          <input
            type="datetime-local"
            className={styles.input}
            value={value.startsAt}
            onChange={(e) => set("startsAt", e.target.value)}
          />
        </label>

        <label className={styles.label}>
          마감 시간
          <input
            type="datetime-local"
            className={styles.input}
            value={value.endsAt}
            min={value.startsAt || undefined}
            max={maxEndsAt}
            onChange={(e) => set("endsAt", e.target.value)}
          />
        </label>
      </div>

      <p className={styles.hint}>
        시작 시각으로부터 최대 3일 이내로만 설정할 수 있어요. 마감이 시작보다 빠를 수 없습니다.
      </p>
    </div>
  );
}
