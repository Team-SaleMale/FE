// src/pages/Main/VideoBrowser.js
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { searchVideos } from "../../utils/youtube";
import styles from "../../styles/Main/VideoBrowser.module.css";

const CATEGORIES = {
  iphone15pro: { title: "아이폰 15 Pro 관련 영상", q: "아이폰 15 Pro Max 리뷰 언박싱" },
  fashion: { title: "패션 영상", q: "패션 룩북 스타일링" },
  "stanley-tumbler": { title: "스탠리 텀블러 영상", q: "Stanley Tumbler review" },
  sofa: { title: "소파 영상", q: "거실 소파 추천 리뷰" },
};

function useParamsObj() {
  const { search } = useLocation();
  return new URLSearchParams(search);
}
function useCat(params) {
  const cat = params.get("cat") || "iphone15pro";
  if (cat === "search") return "search";
  return CATEGORIES[cat] ? cat : "iphone15pro";
}

export default function VideoBrowser() {
  const navigate = useNavigate();
  const params = useParamsObj();
  const cat = useCat(params);
  const meta = useMemo(() => (cat === "search" ? null : CATEGORIES[cat]), [cat]);

  const qParam = cat === "search" ? (params.get("q") || "") : "";
  const [query, setQuery] = useState(qParam);
  const inputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [videos, setVideos] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    setQuery(qParam);
    if (cat === "search") requestAnimationFrame(() => inputRef.current?.focus());
  }, [cat, qParam]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoading(true);
      setError("");
      setVideos([]);

      try {
        if (cat === "search") {
          const q = (qParam || "").trim();
          if (!q) return;
          const list = await searchVideos(q, 24);
          if (!ignore) setVideos(list);
        } else {
          const list = await searchVideos(meta.q, 18);
          if (!ignore) setVideos(list);
        }
      } catch (e) {
        if (!ignore) setError(e?.message || "YouTube API 호출 실패");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [cat, meta?.q, qParam]);

  const goto = (key) => {
    if (key === "search") navigate("/videos?cat=search");
    else navigate(`/videos?cat=${key}`);
  };
  const onSubmit = (e) => {
    e.preventDefault();
    const q = (query || "").trim();
    navigate(`/videos?cat=search${q ? `&q=${encodeURIComponent(q)}` : ""}`);
  };

  return (
    <section className={styles.wrap}>
      <header className={styles.head}>
        <h1 className={styles.title}>{cat === "search" ? "유튜브 검색" : meta.title}</h1>
        <nav className={styles.tabs} role="tablist" aria-label="video categories">
          {Object.entries(CATEGORIES).map(([k, v]) => (
            <button
              key={k}
              role="tab"
              aria-selected={k === cat}
              className={`${styles.tab} ${k === cat ? styles.active : ""}`}
              onClick={() => goto(k)}
            >
              {v.title.replace(" 영상", "")}
            </button>
          ))}
          <button
            role="tab"
            aria-selected={cat === "search"}
            className={`${styles.tab} ${cat === "search" ? styles.active : ""}`}
            onClick={() => goto("search")}
          >
            검색
          </button>
        </nav>
      </header>

      {cat === "search" && (
        <form className={styles.searchRow} role="search" onSubmit={onSubmit}>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={styles.searchInput}
            type="search"
            placeholder="검색어를 입력하세요 (예: 무선 청소기 리뷰)"
            aria-label="유튜브 검색어"
          />
          <button className={styles.searchBtn} type="submit">검색</button>
        </form>
      )}

      <div className={styles.grid}>
        {loading && <div className={styles.skel}>불러오는 중…</div>}
        {!loading && error && <div className={styles.skel}>⚠ {error}</div>}
        {!loading && !error && videos.length === 0 && (
          <div className={styles.skel}>
            {cat === "search" ? "검색어를 입력하고 검색을 눌러주세요." : "검색 결과가 없습니다."}
          </div>
        )}

        {!loading && !error && videos.map((v) => (
          <button
            key={v.id}
            className={styles.card}
            onClick={() => navigate(`/video/${v.id}`)}
          >
            {/* ✅ 썸네일이 카드에 완전히 맞도록 래퍼 + cover */}
            <div className={styles.thumbWrap}>
              <img
                className={styles.thumb}
                src={v.thumb}
                alt=""
                loading="lazy"
              />
            </div>
            <div className={styles.meta}>
              <div className={styles.vtitle}>{v.title}</div>
              <div className={styles.channel}>{v.channel}</div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
