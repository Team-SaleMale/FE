import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { searchVideos, getYoutubeKey } from "../../utils/youtube";
import styles from "../../styles/Main/VideoBrowser.module.css";

/* 개발 확인용: 키가 읽히는지 한 번만 출력 (필요 없으면 삭제해도 됨) */
console.log("YT key present:", !!getYoutubeKey());
console.log("env check:", {
  CRA: typeof process !== "undefined" && !!process.env?.REACT_APP_YOUTUBE_API_KEY,
  VITE: typeof import.meta !== "undefined" && !!import.meta.env?.VITE_YOUTUBE_API_KEY,
});

const CATEGORIES = {
  iphone15pro: { title: "아이폰 15 Pro 관련 영상", q: "아이폰 15 Pro Max 리뷰 언박싱" },
  fashion: { title: "패션 영상", q: "패션 룩북 스타일링" },
  "stanley-tumbler": { title: "스탠리 텀블러 영상", q: "Stanley Tumbler review" },
  sofa: { title: "소파 영상", q: "거실 소파 추천 리뷰" },
};

function useCat() {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const cat = params.get("cat") || "iphone15pro";
  return CATEGORIES[cat] ? cat : "iphone15pro";
}

export default function VideoBrowser() {
  const navigate = useNavigate();
  const cat = useCat();
  const meta = useMemo(() => CATEGORIES[cat], [cat]);

  const [loading, setLoading] = useState(false);
  const [videos, setVideos] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const list = await searchVideos(meta.q, 18);
        if (!ignore) setVideos(list);
      } catch (e) {
        console.error(e);
        if (!ignore) setError(e?.message || "YouTube API 호출 실패");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [meta.q]);

  return (
    <section className={styles.wrap}>
      <header className={styles.head}>
        <h1 className={styles.title}>{meta.title}</h1>
        <nav className={styles.tabs}>
          {Object.entries(CATEGORIES).map(([k, v]) => (
            <button
              key={k}
              className={`${styles.tab} ${k === cat ? styles.active : ""}`}
              onClick={() => navigate(`/videos?cat=${k}`)}
            >
              {v.title.replace(" 영상", "")}
            </button>
          ))}
        </nav>
      </header>

      <div className={styles.grid}>
        {loading && <div className={styles.skel}>불러오는 중…</div>}
        {error && <div className={styles.skel}>⚠ {error}</div>}
        {!loading && !error && videos.length === 0 && (
          <div className={styles.skel}>검색 결과가 없습니다.</div>
        )}
        {!loading && !error &&
          videos.map((v) => (
            <button
              key={v.id}
              className={styles.card}
              onClick={() => navigate(`/video/${v.id}`)}
            >
              <img className={styles.thumb} src={v.thumb} alt="" />
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
