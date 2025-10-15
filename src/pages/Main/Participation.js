import React from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import styles from "../../styles/Main/Participation.module.css";

export default function Participation({
  onJoinClick,
  onRegisterClick,
}) {
  const navigate = useNavigate();

  const handleJoin =
    onJoinClick || (() => navigate("/auctions"));
  const handleRegister =
    onRegisterClick || (() => navigate("/auctions/new"));

  return (
    <section className={styles.wrap} aria-label="참여/등록 선택">
      <div className={styles.grid}>
        {/* 경매 참여 카드 */}
        <article className={styles.card}>
          <div className={styles.cardInner}>
            <h3 className={styles.title}>
              원하는 중고 상품,<br />원하는 가격에 낙찰 받으세요!
            </h3>
            <p className={styles.desc}>
              다양한 카테고리의 상품을 실시간 경매로 참여하고, <br></br>
              합리적인 가격에 가져가세요.
            </p>
            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleJoin}>
              <span>경매 참여하기</span>
              <span className={styles.btnIcon}>
                <Icon icon="solar:history-outline" width="22" height="22" />
              </span>
            </button>
          </div>
        </article>

        {/* 상품 등록 카드 */}
        <article className={styles.card}>
          <div className={styles.cardInner}>
            <h3 className={styles.title}>
              내 상품, 더 많은 사람들에게<br />경매로 판매해보세요!
            </h3>
            <p className={styles.desc}>
              안전결제와 검증된 플랫폼을 통해 <br></br>
              빠르고 신뢰성 있게 판매할 수 있습니다.
            </p>
            <button className={`${styles.btn} ${styles.btnDark}`} onClick={handleRegister}>
              <span>상품 등록하기</span>
              <span className={styles.btnIcon}>
                <Icon icon="solar:tag-price-linear" width="22" height="22" />
              </span>
            </button>
          </div>
        </article>
      </div>
    </section>
  );
}
