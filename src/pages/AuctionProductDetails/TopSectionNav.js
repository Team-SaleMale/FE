import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "../../styles/AuctionProductDetails/TopSectionNav.module.css";

const NAVS = [
  { key: "overview", label: "Overview" },
  { key: "seller", label: "판매자 정보" },
  { key: "metrics", label: "경매상품정보" },
  { key: "calendar", label: "Calendar" },
  { key: "history", label: "Bid History" },
];

export default function TopSectionNav({ sectionRefs, offset = 64 }) {
  const [active, setActive] = useState("overview");

  const indicatorRef = useRef(null);
  const listRef = useRef(null);
  const btnRefs = useRef({});

  /** 클릭: 즉시 active + 스크롤 */
  const handleClick = useCallback(
    (key) => {
      setActive(key); // 즉시 시각 피드백
      const el = sectionRefs?.[key]?.current;
      if (!el) return;
      const y = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: y, behavior: "smooth" });
    },
    [sectionRefs, offset]
  );

  /** 각 섹션의 문서 절대 좌표 얻기 */
  const getSectionTops = useCallback(() => {
    const tops = [];
    NAVS.forEach(({ key }) => {
      const el = sectionRefs?.[key]?.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY; // 문서 기준 y
      tops.push({ key, top });
      // 앵커 정밀도 향상
      if (!el.style.scrollMarginTop) el.style.scrollMarginTop = `${offset + 8}px`;
      if (!el.getAttribute("data-section-key")) el.setAttribute("data-section-key", key);
    });
    // top 오름차순 정렬(안전)
    tops.sort((a, b) => a.top - b.top);
    return tops;
  }, [sectionRefs, offset]);

  /** 스크롤 위치로 활성 섹션 결정 (IO 대신 확정적 방식) */
  const updateActiveByScroll = useCallback(() => {
    const tops = getSectionTops();
    if (!tops.length) return;

    const y = window.scrollY + offset + 1; // 실제 화면 상단 라인
    // y 이하인 섹션 중 가장 아래(= 화면 상단에 가장 가까운) 섹션 선택
    let current = tops[0].key; // 기본값 overview 보장
    for (let i = 0; i < tops.length; i++) {
      if (tops[i].top <= y) current = tops[i].key;
      else break;
    }
    setActive(current);
  }, [getSectionTops, offset]);

  useEffect(() => {
    // 초기 한 번, 그리고 스크롤/리사이즈 때 업데이트
    updateActiveByScroll();
    const onScroll = () => updateActiveByScroll();
    const onResize = () => updateActiveByScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [updateActiveByScroll]);

  /** 활성 탭 밑줄 인디케이터 위치/너비 갱신 */
  const updateIndicator = useCallback(() => {
    const parent = listRef.current;
    const indicator = indicatorRef.current;
    const btn = btnRefs.current[active];
    if (!parent || !indicator || !btn) return;

    const pRect = parent.getBoundingClientRect();
    const bRect = btn.getBoundingClientRect();
    const left = bRect.left - pRect.left + parent.scrollLeft;

    indicator.style.width = `${bRect.width}px`;
    indicator.style.transform = `translateX(${left}px)`;
  }, [active]);

  useEffect(() => {
    updateIndicator();
  }, [active, updateIndicator]);

  useEffect(() => {
    const onResize = () => updateIndicator();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [updateIndicator]);

  // 초기 페인트 뒤 인디케이터 정렬
  useEffect(() => {
    const id = requestAnimationFrame(() => updateIndicator());
    return () => cancelAnimationFrame(id);
  }, [updateIndicator]);

  const items = useMemo(
    () =>
      NAVS.map((n) => (
        <li key={n.key} className={styles.item}>
          <button
            ref={(el) => (btnRefs.current[n.key] = el)}
            className={`${styles.btn} ${active === n.key ? styles.active : ""}`}
            onClick={() => handleClick(n.key)}
            aria-current={active === n.key ? "page" : undefined}
          >
            {n.label}
          </button>
        </li>
      )),
    [active, handleClick]
  );

  return (
    <nav className={styles.nav} aria-label="섹션 내비게이션">
      <div className={styles.inner}>
        <ul ref={listRef} className={styles.list}>
          {items}
          <span ref={indicatorRef} className={styles.indicator} />
        </ul>
      </div>
    </nav>
  );
}
