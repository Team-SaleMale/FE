// FE/src/pages/HotDeal/AuthCancelModal.js
import styles from "../../styles/HotDeal/AuthCancelModal.module.css";

export default function AuthCancelModal({ open, onClose, onOpenForm }) {
  if (!open) return null; // 부모에서 open 제어

  return (
    <div className={styles.root} role="dialog" aria-modal="true">
      <div className={styles.backdrop} onClick={onClose} />
      <div className={styles.modal}>
        <h3 className={styles.title}>사업자 인증이 필요합니다</h3>
        <p className={styles.desc}>
          사업자 등록이 확인되지 않았습니다.
          <br />
          아래 ‘구글 폼 등록’ 버튼으로 신청을 완료한 뒤 인증을 받으세요.
        </p>

        {/* Toolbar와 동일 룩(흰색=btn, 검정=btnActive). 닫기 왼쪽 / 구글 폼 오른쪽 */}
        <div className={styles.actions}>
          <button className={styles.btn} onClick={onClose}>
            닫기
          </button>
          <button
            className={styles.btnActive}
            onClick={onOpenForm} // 여기서 부모의 window.open 실행
          >
            구글 폼 등록
          </button>
        </div>
      </div>
    </div>
  );
}
