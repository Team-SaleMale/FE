// src/pages/HotDealRegistration/StoreSection.js
import styles from "../../styles/HotDealRegistration/StoreSection.module.css";

export default function StoreSection({ value, onChange }) {
  // 서버에서 값을 바꿔 주는 경우만 반영(직접 편집 X)
  const set = (k, v) => onChange({ ...value, [k]: v });

  return (
    <div className={styles.card}>
      <h2 className={styles.h2}>가게 정보</h2>

      <label className={styles.label}>
        가게명
        <input
          className={styles.input}
          value={value.name}
          readOnly
          placeholder="서버에서 불러옵니다"
        />
      </label>

      <div className={styles.row2}>
        <label className={styles.label}>
          위도(lat)
          <input
            className={styles.input}
            value={value.lat}
            readOnly
          />
        </label>
        <label className={styles.label}>
          경도(lng)
          <input
            className={styles.input}
            value={value.lng}
            readOnly
          />
        </label>
      </div>

      <label className={styles.label}>
        주소
        <input
          className={styles.input}
          value={value.address}
          readOnly
          placeholder="서버에서 불러옵니다"
        />
      </label>
    </div>
  );
}
