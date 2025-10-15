import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import styles from "../../styles/Main/CategoryPopular.module.css";

/** 로컬 이미지(기본) — 기타 카테고리에서 사용 */
import ha01 from "../../assets/img/Main/CategoryPopular/ha-01.png";
import ha02 from "../../assets/img/Main/CategoryPopular/ha-02.png";
import ha03 from "../../assets/img/Main/CategoryPopular/ha-03.png";
import ha04 from "../../assets/img/Main/CategoryPopular/ha-04.png";
import ha05 from "../../assets/img/Main/CategoryPopular/ha-05.png";
import ha06 from "../../assets/img/Main/CategoryPopular/ha-06.png";

/** 건강기능식품 전용 이미지 */
import hf01 from "../../assets/img/Main/CategoryPopular/hf-01.png";
import hf02 from "../../assets/img/Main/CategoryPopular/hf-02.png";
import hf03 from "../../assets/img/Main/CategoryPopular/hf-03.png";
import hf04 from "../../assets/img/Main/CategoryPopular/hf-04.png";
import hf05 from "../../assets/img/Main/CategoryPopular/hf-05.png";
import hf06 from "../../assets/img/Main/CategoryPopular/hf-06.png";

/** 뷰티/미용 전용 이미지 */
import bt01 from "../../assets/img/Main/CategoryPopular/bt-01.png";
import bt02 from "../../assets/img/Main/CategoryPopular/bt-02.png";
import bt03 from "../../assets/img/Main/CategoryPopular/bt-03.png";
import bt04 from "../../assets/img/Main/CategoryPopular/bt-04.png";
import bt05 from "../../assets/img/Main/CategoryPopular/bt-05.png";
import bt06 from "../../assets/img/Main/CategoryPopular/bt-06.png";

/** 17개 카테고리 (solar 아이콘 사용) */
const CATEGORIES = [
  { key: "home-appliance", label: "생활가전", icon: "solar:washing-machine-minimalistic-linear" },
  { key: "health-food", label: "건강기능식품", icon: "solar:dumbbell-large-minimalistic-linear" },
  { key: "beauty", label: "뷰티/미용", icon: "solar:magic-stick-3-linear" },
  { key: "food-processed", label: "가공식품", icon: "solar:chef-hat-linear" },
  { key: "pet", label: "반려동물", icon: "solar:cat-linear" },
  { key: "digital", label: "디지털 기기", icon: "solar:laptop-minimalistic-linear" },
  { key: "living-kitchen", label: "생활/주방", icon: "solar:whisk-linear" },
  { key: "women-acc", label: "여성잡화", icon: "solar:bag-smile-outline" },
  { key: "sports", label: "스포츠/레저", icon: "solar:balls-linear" },
  { key: "plant", label: "식물", icon: "solar:waterdrop-linear" },
  { key: "game-hobby", label: "게임/취미/음반", icon: "solar:reel-2-broken" },
  { key: "ticket", label: "티켓", icon: "solar:ticket-sale-linear" },
  { key: "furniture", label: "가구/인테리어", icon: "solar:armchair-2-linear" },
  { key: "book", label: "도서", icon: "solar:notebook-broken" },
  { key: "kids", label: "유아동", icon: "solar:smile-circle-linear" },
  { key: "clothes", label: "의류", icon: "solar:hanger-broken" },
  { key: "etc", label: "기타", icon: "solar:add-square-broken" },
];

/** API 연동 전 더미 데이터 구성 */
function buildFallbackProducts() {
  // 기본(생활가전 기준) 샘플 — 기타 카테고리에서 공통 사용
  const defaultSample = [
    { id: "p1", title: "삼성 무풍에어컨 17평형 (청정)", imageUrl: ha01 },
    { id: "p2", title: "LG 트롬 스타일러 S3BF", imageUrl: ha02 },
    { id: "p3", title: "쿠쿠 압력밥솥 10인용", imageUrl: ha03 },
    { id: "p4", title: "다이슨 V12 무선청소기", imageUrl: ha04 },
    { id: "p5", title: "발뮤다 더 토스터 화이트", imageUrl: ha05 },
    { id: "p6", title: "코웨이 얼음 정수기", imageUrl: ha06 },
  ];

  // 건강기능식품 전용 샘플
  const healthFoodSample = [
    { id: "hf1", title: "오메가3 프리미엄 1200mg (180캡슐)", imageUrl: hf01 },
    { id: "hf2", title: "프로바이오틱스 100억 유산균 (60포)", imageUrl: hf02 },
    { id: "hf3", title: "비타민D3 4000IU (90정)", imageUrl: hf03 },
    { id: "hf4", title: "6년근 홍삼스틱 30포", imageUrl: hf04 },
    { id: "hf5", title: "밀크씨슬 간건강 (90정)", imageUrl: hf05 },
    { id: "hf6", title: "루테인 지아잔틴 (60캡슐)", imageUrl: hf06 },
  ];

  // 뷰티/미용 전용 샘플
  const beautySample = [
    { id: "bt1", title: "비타민C 브라이트닝 앰플 30ml", imageUrl: bt01 },
    { id: "bt2", title: "롱웨어 쿠션 파운데이션 21호", imageUrl: bt02 },
    { id: "bt3", title: "히알루론 산 에센스 50ml", imageUrl: bt03 },
    { id: "bt4", title: "수분진정 토너 300ml", imageUrl: bt04 },
    { id: "bt5", title: "아이크림 레티놀 20ml", imageUrl: bt05 },
    { id: "bt6", title: "자외선 차단 선크림 SPF50+ 50ml", imageUrl: bt06 },
  ];

  // 카테고리 → 샘플 매핑
  const map = {};
  CATEGORIES.forEach((c) => {
    const base =
      c.key === "health-food" ? healthFoodSample
      : c.key === "beauty" ? beautySample
      : defaultSample;

    map[c.key] = base.map((it, i) => ({ ...it, id: `${c.key}-${i}` }));
  });
  return map;
}

/**
 * CategoryPopular
 * - 카드 클릭 시 /auctions/:id 이동
 * - 이후 API 연결 시 fetchPopular(categoryKey)로 서버 데이터 사용 가능
 *   예) <CategoryPopular fetchPopular={(key) => serverMap[key]} />
 */
export default function CategoryPopular({ initialCategory = "home-appliance", fetchPopular }) {
  const navigate = useNavigate();
  const fallback = useMemo(buildFallbackProducts, []);
  const [activeKey, setActiveKey] = useState(initialCategory);
  const [tabStart, setTabStart] = useState(0); // 0 → 7 → 14

  const tabsPage = CATEGORIES.slice(tabStart, Math.min(tabStart + 7, CATEGORIES.length));
  const atFirst = tabStart === 0;
  const atLast = tabStart + 7 >= CATEGORIES.length;

  const products =
    (typeof fetchPopular === "function" ? fetchPopular(activeKey) : null) ||
    fallback[activeKey] ||
    [];

  const gotoPrev = () => !atFirst && setTabStart((s) => Math.max(0, s - 7));
  const gotoNext = () => !atLast && setTabStart((s) => Math.min(CATEGORIES.length - 1, s + 7));
  const goDetail = (id) => navigate(`/auctions/${id}`);

  return (
    <section className={styles.wrap} aria-label="카테고리별 인기 상품">
      <div className={styles.inner}>
        <h2 className={styles.title}>카테고리별 인기 상품</h2>

        {/* 제목 바로 아래 탭 */}
        <div className={styles.tabsRow}>
          <ul className={styles.tabs} role="tablist">
            {tabsPage.map((cat) => {
              const active = cat.key === activeKey;
              return (
                <li key={cat.key} role="presentation">
                  <button
                    role="tab"
                    aria-selected={active}
                    className={`${styles.tabBtn} ${active ? styles.isActive : ""}`}
                    onClick={() => setActiveKey(cat.key)}
                  >
                    <Icon icon={cat.icon} width={24} height={24} />
                    <span>{cat.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>

          {/* 화살표는 맨 오른쪽 고정 */}
          <div className={styles.tabNav}>
            <button
              type="button"
              className={`${styles.navBtn} ${atFirst ? styles.isDisabled : ""}`}
              onClick={gotoPrev}
              aria-label="이전 카테고리"
            >
              <Icon icon="solar:alt-arrow-left-outline" width={18} height={18} />
            </button>
            <button
              type="button"
              className={`${styles.navBtn} ${atLast ? styles.isDisabled : ""}`}
              onClick={gotoNext}
              aria-label="다음 카테고리"
            >
              <Icon icon="solar:alt-arrow-right-outline" width={18} height={18} />
            </button>
          </div>
        </div>

        {/* 상품 6개 */}
        <ul className={styles.grid}>
          {products.slice(0, 6).map((p) => (
            <li
              className={styles.card}
              key={p.id}
              role="button"
              tabIndex={0}
              onClick={() => goDetail(p.id)}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && goDetail(p.id)}
            >
              <div className={styles.thumb}>
                <img src={p.imageUrl} alt={p.title} loading="lazy" />
              </div>
              <p className={styles.productTitle} title={p.title}>
                {p.title}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
