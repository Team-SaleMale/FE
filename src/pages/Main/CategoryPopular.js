/* eslint-disable jsx-a11y/role-supports-aria-props */
// src/pages/Main/CategoryPopular.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import styles from "../../styles/Main/CategoryPopular.module.css";
import { fetchCategoryPopular } from "../../api/auctions/service";

/** 17개 카테고리 (solar 아이콘 사용) */
const CATEGORIES = [
  { key: "home-appliance", label: "생활가전", icon: "solar:washing-machine-minimalistic-linear" },
  { key: "health-food",    label: "건강기능식품", icon: "solar:dumbbell-large-minimalistic-linear" },
  { key: "beauty",         label: "뷰티/미용", icon: "solar:magic-stick-3-linear" },
  { key: "food-processed", label: "가공식품", icon: "solar:chef-hat-linear" },
  { key: "pet",            label: "반려동물", icon: "solar:cat-linear" },
  { key: "digital",        label: "디지털 기기", icon: "solar:laptop-minimalistic-linear" },
  { key: "living-kitchen", label: "생활/주방", icon: "solar:whisk-linear" },
  { key: "women-acc",      label: "여성잡화", icon: "solar:bag-smile-outline" },
  { key: "sports",         label: "스포츠/레저", icon: "solar:balls-linear" },
  { key: "plant",          label: "식물", icon: "solar:waterdrop-linear" },
  { key: "game-hobby",     label: "게임/취미/음반", icon: "solar:reel-2-broken" },
  { key: "ticket",         label: "티켓", icon: "solar:ticket-sale-linear" },
  { key: "furniture",      label: "가구/인테리어", icon: "solar:armchair-2-linear" },
  { key: "book",           label: "도서", icon: "solar:notebook-broken" },
  { key: "kids",           label: "유아동", icon: "solar:smile-circle-linear" },
  { key: "clothes",        label: "의류", icon: "solar:hanger-broken" },
  { key: "etc",            label: "기타", icon: "solar:add-square-broken" },
];

export default function CategoryPopular({ initialCategory = "home-appliance" }) {
  const navigate = useNavigate();
  const [activeKey, setActiveKey] = useState(initialCategory);
  const [tabStart, setTabStart] = useState(0); // 0 → 7 → 14

  // 데이터 상태
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);

  // 탭 페이징
  const tabsPage = CATEGORIES.slice(tabStart, Math.min(tabStart + 7, CATEGORIES.length));
  const atFirst = tabStart === 0;
  const atLast = tabStart + 7 >= CATEGORIES.length;

  const gotoPrev = () => !atFirst && setTabStart((s) => Math.max(0, s - 7));
  const gotoNext = () => !atLast && setTabStart((s) => Math.min(CATEGORIES.length - 1, s + 7));
  const goDetail = (id) => navigate(`/auctions/${id}`);

  // 서버 호출: 카테고리별 인기 상품 (status=POPULAR, categories=선택된 카테고리)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError("");
        setItems([]);

        const res = await fetchCategoryPopular({
          categoryKey: activeKey, // UI key 그대로 넘기면 service에서 enum으로 직렬화
          page: 1,
          size: 12,
        });

        if (!alive) return;
        if (!res?.isSuccess) throw new Error(res?.message || "API error");

        const list = Array.isArray(res.result?.items) ? res.result.items : [];
        setItems(list);
      } catch (e) {
        if (!alive) return;
        setError(e?.message || "오류가 발생했습니다.");
        setItems([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [activeKey]);

  // 첫 이미지 선택(썸네일)
  const toThumb = (it) => {
    const arr = Array.isArray(it?.imageUrls) ? it.imageUrls.filter(Boolean) : [];
    return arr[0] || it?.thumbnailUrl || it?.imageUrl || "";
  };

  // 화면에 6개만 노출(디자인 기준)
  const top6 = useMemo(() => (items || []).slice(0, 6), [items]);

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

        {/* 리스트 영역 */}
        {loading && <div className={styles.state}>불러오는 중…</div>}
        {!loading && error && <div className={styles.state}>오류: {error}</div>}
        {!loading && !error && top6.length === 0 && (
          <div className={styles.state}>해당 카테고리의 인기 상품이 없습니다.</div>
        )}

        {!loading && !error && top6.length > 0 && (
          <ul className={styles.grid}>
            {top6.map((it) => {
              const id = it?.itemId ?? it?.id ?? it?.auctionId ?? it?.productId;
              const title = it?.title ?? it?.name ?? "";
              const img = toThumb(it);
              return (
                <li
                  className={styles.card}
                  key={String(id)}
                  role="button"
                  tabIndex={0}
                  onClick={() => goDetail(id)}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && goDetail(id)}
                >
                  <div className={styles.thumb}>
                    {img ? (
                      <img src={img} alt={title} loading="lazy" />
                    ) : (
                      <div className={styles.thumbFallback} />
                    )}
                  </div>
                  <p className={styles.productTitle} title={title}>
                    {title}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
