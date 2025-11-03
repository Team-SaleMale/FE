import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "../../styles/Main/FeaturedProductDetail.module.css";

// 더미 이미지 (프로젝트 경로에 맞춰 교체 가능)
import imgDigital1 from "../../assets/img/Main/Featured/digital1.png";
import imgDigital2 from "../../assets/img/Main/Featured/digital2.png";
import imgDigital3 from "../../assets/img/Main/Featured/digital3.png";

import imgFashion1 from "../../assets/img/Main/Featured/fashion1.png";
import imgFashion2 from "../../assets/img/Main/Featured/fashion2.png";
import imgFashion3 from "../../assets/img/Main/Featured/fashion3.png";

import imgFurniture1 from "../../assets/img/Main/Featured/furniture1.png";
import imgFurniture2 from "../../assets/img/Main/Featured/furniture2.png";
import imgFurniture3 from "../../assets/img/Main/Featured/furniture3.png";

import imgAppliances1 from "../../assets/img/Main/Featured/appliances1.png";
import imgAppliances2 from "../../assets/img/Main/Featured/appliances2.png";
import imgAppliances3 from "../../assets/img/Main/Featured/appliances3.png";

import imgCollect1 from "../../assets/img/Main/Featured/collectibles1.png";
import imgCollect2 from "../../assets/img/Main/Featured/collectibles2.png";
import imgCollect3 from "../../assets/img/Main/Featured/collectibles3.png";

/** 카테고리별 추천 더미 상품 1개 */
const PRODUCTS = {
  digital: {
    title: "Apple iPhone 15 Pro 256GB — Natural Titanium",
    tagline: "“깔끔 · 잔상/눌림 없음 · 1인 사용”",
    hero: imgDigital1,
    images: [imgDigital1, imgDigital2, imgDigital3],
    description:
      "보호필름 부착 상태로 실기스 거의 없으며 생활기스 미세합니다. 자급제 단품, 1인 사용. 박스/케이블/설명서 구성. 컬러는 내추럴 티타늄.",
    specs: [
      ["모델", "iPhone 15 Pro"],
      ["용량", "256GB"],
      ["색상", "Natural Titanium"],
      ["통신", "자급제 / 무약정"],
      ["구성품", "박스, C to C 케이블, 설명서"],
    ],
  },
  fashion: {
    title: "Chanel Classic Flap Small — Black / Caviar",
    tagline: "“정품 보증 · 상태 A급 · 풀세트”",
    hero: imgFashion1,
    images: [imgFashion1, imgFashion2, imgFashion3],
    description:
      "보관 시 더스트백 사용, 내부 깨끗합니다. 정품카드/더스트백/박스 포함. 백화점 구입 영수증 사본 제공.",
    specs: [
      ["모델", "Classic Flap Small"],
      ["가죽", "Caviar Leather"],
      ["컬러", "Black / Gold HW"],
      ["구성품", "박스, 더스트백, 카드"],
    ],
  },
  furniture: {
    title: "화이트오크 원목 라운드 테이블(Ø100) & 체어 2EA",
    tagline: "“오일 마감 · 흔들림 없음 · 생활 스크래치 미세”",
    hero: imgFurniture1,
    images: [imgFurniture1, imgFurniture2, imgFurniture3],
    description:
      "원목 라운드 테이블(지름 100cm) + 체어 2개. 오일 마감으로 관리 용이하며, 다리 흔들림 없습니다.",
    specs: [
      ["구성", "테이블 1, 체어 2"],
      ["재질", "화이트오크 원목"],
      ["마감", "오일"],
      ["사이즈", "Ø100 x H74 (cm)"],
    ],
  },
  appliances: {
    title: "Dyson V15 Detect — 무선청소기(정품)",
    tagline: "“흡입력 양호 · 헤드/거치대 포함 · 사용감 적음”",
    hero: imgAppliances1,
    images: [imgAppliances1, imgAppliances2, imgAppliances3],
    description:
      "흡입력 양호하고 사용감 적습니다. 플로피 헤드/슬림 헤드/거치대 포함. 필터 최근 세척 완료.",
    specs: [
      ["모델", "V15 Detect"],
      ["전원", "무선 / 충전식"],
      ["구성품", "헤드 2종, 거치대, 충전기"],
      ["상태", "A-급"],
    ],
  },
  collectibles: {
    title: "LEGO 71043 — Hogwarts Castle (Harry Potter)",
    tagline: "“전시용 · 누락 없음 · 박스/설명서 포함”",
    hero: imgCollect1,
    images: [imgCollect1, imgCollect2, imgCollect3],
    description:
      "성인 소장 전시용으로만 사용하여 보존 상태 양호합니다. 누락 부품 없음(체크 완료), 박스/설명서 포함.",
    specs: [
      ["시리즈", "Harry Potter"],
      ["세트 번호", "71043"],
      ["구성", "본품, 박스, 설명서"],
      ["권장연령", "16+"],
    ],
  },
};

// ✅ Featured 라우트 파라미터 → 리스트 UI 키로 정규화(서비스에서도 alias 처리하지만 이중 안전)
const FEATURED_TO_UI = {
  digital: "digital",
  fashion: "clothes",         // = 의류
  appliances: "home-appliance",
  collectibles: "game-hobby",
  furniture: "furniture",
};

export default function FeaturedProductDetail() {
  const { category } = useParams();
  const navigate = useNavigate();

  const product = useMemo(() => PRODUCTS[category ?? ""], [category]);
  const [active, setActive] = useState(0);

  if (!product) {
    return (
      <section className={styles.section}>
        <div className={styles.empty}>
          <p>해당 카테고리의 추천 상품이 없습니다.</p>
          <button className={styles.btn} onClick={() => navigate("/")}>메인으로</button>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      {/* 상단 브레드크럼/네비 */}
      <nav className={styles.breadcrumbs}>
        <button className={styles.bcrumb} onClick={() => navigate("/")}>Home</button>
        <span className={styles.sep}>/</span>
        <button className={styles.bcrumb} onClick={() => navigate(-1)}>{category}</button>
        <span className={styles.sep}>/</span>
        <span className={styles.current}>{product.title}</span>
      </nav>

      {/* 히어로 */}
      <div className={styles.hero}>
        <img src={product.hero} alt="" className={styles.heroImg} />
        <div className={styles.heroGradient} />
        <div className={styles.heroInner}>
          <h1 className={styles.title}>{product.title}</h1>
        <p className={styles.tagline}>{product.tagline}</p>
        </div>
        <div className={styles.heroBorder} />
      </div>

      {/* 본문 */}
      <div className={styles.layout}>
        {/* 좌: 갤러리 + 설명 */}
        <div className={styles.leftCol}>
          <div className={styles.gallery}>
            <div className={styles.mainShot}>
              <img src={product.images[active]} alt="" />
              <div className={styles.mainOverlay} />
            </div>
            <ul className={styles.thumbRow} role="list">
              {product.images.map((src, i) => (
                <li key={i}>
                  <button
                    className={`${styles.thumb} ${i === active ? styles.thumbActive : ""}`}
                    onClick={() => setActive(i)}
                    aria-label={`이미지 ${i + 1}`}
                  >
                    <img src={src} alt="" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.panel}>
            <h2 className={styles.h2}>상품 설명</h2>
            <p className={styles.desc}>{product.description}</p>

            <h3 className={styles.h3}>스펙</h3>
            <table className={styles.specTable}>
              <tbody>
                {product.specs.map(([k, v]) => (
                  <tr key={k}>
                    <th>{k}</th>
                    <td>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 우: 공유/카테고리 더보기 액션 */}
        <aside className={styles.rightCol}>
          <div className={styles.cardGlass}>
            <h2 className={styles.h2}>빠른 액션</h2>

            {/* 공유하기 */}
            <div className={styles.rowBlock}>
              <div className={styles.rowHead}>
                <span className={styles.rowTitle}>공유하기</span>
                <span className={styles.badgeSoft}>Share</span>
              </div>

              <div className={styles.copyRow}>
                <input
                  className={styles.copyInput}
                  readOnly
                  value={typeof window !== "undefined" ? window.location.href : ""}
                />
                <button
                  className={styles.primary}
                  onClick={async () => {
                    try {
                      const url = window.location.href;
                      if (navigator.share) {
                        await navigator.share({
                          title: document.title || "ValueBid",
                          text: "관리자 추천 상품을 확인해 보세요",
                          url,
                        });
                      } else {
                        await navigator.clipboard.writeText(url);
                        alert("링크가 복사되었습니다.");
                      }
                    } catch {
                      try {
                        const fallback = window.location.href;
                        await navigator.clipboard.writeText(fallback);
                        alert("링크가 복사되었습니다.");
                      } catch {
                        alert("공유/복사에 실패했습니다. 주소창 링크를 직접 복사해 주세요.");
                      }
                    }
                  }}
                >
                  공유하기
                </button>
              </div>
            </div>

            <div className={styles.divider} />

            {/* 카테고리 더보기 */}
            <div className={styles.rowBlock}>
              <div className={styles.rowHead}>
                <span className={styles.rowTitle}>카테고리 더 보기</span>
                <span className={styles.badgeSoft}>Browse</span>
              </div>
              <div className={styles.actionColumn}>
                <button
                  className={styles.secondary}
                  onClick={() => {
                    // ✅ 리스트 화면으로 이동 + 해당 카테고리 필터 적용
                    const uiKey = FEATURED_TO_UI[(category || "").toLowerCase()] || (category || "");
                    // 리스트 쪽 buildListParams가 'category'를 UI/별칭/ENUM 모두 처리
                    navigate(`/auctions?category=${encodeURIComponent(uiKey)}`);
                  }}
                >
                  {category} 카테고리 상품 더 보기
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
