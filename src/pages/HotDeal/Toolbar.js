// 상단 컨트롤 바: 반경 슬라이더 + 지도/로드뷰 토글 + 상품 등록(부모 콜백만 호출)
import styles from "../../styles/HotDeal/Toolbar.module.css";

export default function Toolbar({
  radiusKm,
  onRadiusChange,
  mode,
  onModeChange,
  onClickRegister, // ✅ 부모에서 내려오는 클릭 콜백
}) {
  return (
    <div className={styles.bar}>
      <div className={styles.title}>내 주변 핫딜</div>

      <div className={styles.group}>
        <label className={styles.muted}>
          반경
          <input
            className={styles.range}
            type="range"
            min="1" max="5" step="0.5"
            value={radiusKm}
            onChange={(e) => onRadiusChange(Number(e.target.value))}
          />
          <span>{radiusKm}km</span>
        </label>
      </div>

      <div className={styles.group}>
        <button
          className={mode === "map" ? styles.btnActive : styles.btn}
          onClick={() => onModeChange("map")}
        >
          지도
        </button>
        <button
          className={mode === "roadview" ? styles.btnActive : styles.btn}
          onClick={() => onModeChange("roadview")}
        >
          로드뷰
        </button>
      </div>

      <div className={styles.spacer} />

      {/* ▶ 요청 스타일: 흰색 아웃라인 버튼 (로드뷰 비활성과 동일 톤) */}
      <button
        className={`${styles.btn} ${styles.registerBtn}`}
        onClick={onClickRegister}
        type="button"
      >
        상품 등록
      </button>
    </div>
  );
}
