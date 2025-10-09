import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import styles from "../../styles/Main/AuctionVideos.module.css";

import iphoneHero from "../../assets/img/Main/AuctionVideos/iphone15pro.png";
import thumb1 from "../../assets/img/Main/AuctionVideos/thumb1.png"; // 패션
import thumb2 from "../../assets/img/Main/AuctionVideos/thumb2.png"; // 스탠리 텀블러
import thumb3 from "../../assets/img/Main/AuctionVideos/thumb3.png"; // 소파

function StarRating({ value = 4, max = 5 }) {
  const stars = [];
  for (let i = 1; i <= max; i += 1) {
    const filled = i <= value;
    stars.push(
      <Icon
        key={i}
        icon={filled ? "mdi:star" : "mdi:star-outline"}
        className={filled ? styles.starFilled : styles.starEmpty}
        aria-hidden="true"
      />
    );
  }
  return <div className={styles.starsWrap}>{stars}</div>;
}

export default function AuctionVideos({ productQuery }) {
  const navigate = useNavigate();
  const query = useMemo(
    () => productQuery || "아이폰 15 Pro Max 개봉기 리뷰",
    [productQuery]
  );

  const sideCards = [
    { title: "Video1", img: thumb1, cat: "fashion", rating: 4 },
    { title: "Video2", img: thumb2, cat: "stanley-tumbler", rating: 5 },
    { title: "Video3", img: thumb3, cat: "sofa", rating: 4 },
  ];
  const go = (cat) => navigate(`/videos?cat=${encodeURIComponent(cat)}`);

  return (
    <section className={styles.avSec}>
      <div className={styles.container}>
        <h2 className={styles.avTitle}>경매 상품 영상 보기</h2>

        <div className={styles.avFrame}>
          {/* 좌측: 히어로 */}
          <article className={styles.avHero}>
            <img className={styles.avHeroImg} src={iphoneHero} alt="" />
            <div className={styles.avHeroOverlay} />
            <div className={styles.avHeroText}>
              <h3 className={styles.avHeroH}>아이폰 15 Pro Max</h3>
              <p className={styles.avHeroSub}>
                Immerse yourself in captivating visuals from our most iconic and
                indulgent destinations.
              </p>
              <button
                className={styles.avCta}
                onClick={() => go("iphone15pro")}
              >
                영상 시청하기
              </button>
            </div>
          </article>

          {/* 우측: 세로 카드 3개 */}
          <aside className={styles.avSide}>
            {sideCards.map((c, i) => (
              <button
                key={i}
                className={styles.avSideCard}
                onClick={() => go(c.cat)}
                aria-label={`${c.title} 열기`}
              >
                <div className={styles.avSideThumb}>
                  <img src={c.img} alt="" />
                  <span className={styles.avPlay} />
                </div>
                <div className={styles.avSideMeta}>
                  <span className={styles.avSideTitle}>{c.title}</span>
                  <StarRating value={c.rating} />
                </div>
              </button>
            ))}
          </aside>
        </div>
      </div>
    </section>
  );
}
