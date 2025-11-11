// src/pages/HotDealRegistration/ProductSection.js
import styles from "../../styles/HotDealRegistration/ProductSection.module.css";

export default function ProductSection({ value, onChange }) {
  const set = (k, v) => onChange({ ...value, [k]: v });

  const onFiles = (files) => {
    const arr = Array.from(files || []);
    set("images", arr.slice(0, 8)); // 첫 번째가 대표
  };

  return (
    <div className={styles.card}>
      <h2 className={styles.h2}>상품 정보</h2>

      <label className={styles.label}>
        상품명
        <input
          className={styles.input}
          value={value.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="예) 오늘 구운 크루아상 10개"
        />
      </label>

      <label className={styles.label}>
        시작가(원)
        <input
          className={styles.input}
          value={value.price}
          onChange={(e) => set("price", e.target.value.replace(/[^\d]/g,""))}
          inputMode="numeric"
          placeholder="예) 4500"
        />
      </label>

      <label className={styles.label}>
        이미지 선택(최대 8장) <span className={styles.note}>첫 번째가 대표 이미지로 사용됩니다</span>
        <input type="file" accept="image/*" multiple onChange={(e) => onFiles(e.target.files)} />
      </label>

      <label className={styles.label}>
        판매자 설명
        <textarea
          className={styles.textarea}
          value={value.desc}
          onChange={(e) => set("desc", e.target.value)}
          placeholder="상품 상태, 유통기한, 픽업 안내 등을 적어주세요."
        />
      </label>
    </div>
  );
}
