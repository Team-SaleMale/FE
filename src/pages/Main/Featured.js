import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../styles/Main/Featured.module.css";

// 이미지 파일 실제 경로/이름에 맞게 교체
import imgDigital from "../../assets/img/Main/Featured/digital1.png";
import imgFashion from "../../assets/img/Main/Featured/fashion2.png";
import imgFurniture from "../../assets/img/Main/Featured/furniture1.png";
import imgAppliances from "../../assets/img/Main/Featured/appliances2.png";
import imgCollectibles from "../../assets/img/Main/Featured/collectibles1.png";



export default function Featured() {
  const navigate = useNavigate();

  const categories = useMemo(
    () => [
      { key: "digital", label: "디지털기기", img: imgDigital },
      { key: "fashion", label: "패션/의류", img: imgFashion },
      { key: "furniture", label: "가구/인테리어", img: imgFurniture },
      { key: "appliances", label: "생활가전", img: imgAppliances },
      { key: "collectibles", label: "수집품/골동품", img: imgCollectibles },
    ],
    []
  );

  const go = (key) => navigate(`/featured/${key}`, { state: { category: key } });

  return (
    <section className={styles.section}>
      <div className={styles.head}>
        <h2 className={styles.title}>주목할 만한 경매 상품</h2>
      </div>

      <ul className={styles.grid} role="list">
        {categories.map((c, i) => (
          <li
            key={c.key}
            className={`${styles.card} ${i < 2 ? styles.lg : styles.md}`}
            onClick={() => go(c.key)}
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && go(c.key)}
          >
            <img className={styles.thumb} src={c.img} alt="" />
            <div className={styles.overlay} />
            <strong className={styles.label}>{c.label}</strong>
          </li>
        ))}
      </ul>
    </section>
  );
}
