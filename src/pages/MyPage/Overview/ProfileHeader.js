import styles from "../../../styles/MyPage/Overview/ProfileHeader.module.css";
import { Icon } from "@iconify/react";

export default function ProfileHeader() {
  return (
    <header className={styles.root}>
      <div className={styles.rowTop}>
        <div className={styles.avatar} aria-hidden />
        <div className={styles.userBlock}>
          <div className={styles.userName}>울릉한소우주강황</div>
        </div>
      </div>

      <div className={styles.rowBottomVertical}>
        <div className={styles.locationRow}>
          <div className={styles.location}>
            <Icon icon="solar:map-point-wave-outline" />
            <span>서울 강서구 가양제3동</span>
          </div>
        </div>

        <div className={styles.chipsRow}>
          <div className={styles.chips}>
            <button className={styles.chip}>
              <Icon icon="solar:notebook-broken" />
              <span>도서</span>
            </button>
            <button className={styles.chip}>
              <Icon icon="solar:cat-linear" />
              <span>반려동물</span>
            </button>
            <button className={styles.chip}>
              <Icon icon="mdi:washing-machine" />
              <span>생활가전</span>
            </button>
            <button className={styles.chip}>
              <Icon icon="mdi:television" />
              <span>디지털 기기</span>
            </button>
            <button className={styles.badgeIcon} aria-label="모든 카테고리 보기">
              <Icon icon="solar:alt-arrow-down-linear" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}


