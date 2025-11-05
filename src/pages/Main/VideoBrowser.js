import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "../../styles/Main/VideoBrowser.module.css";

// 카테고리 메타
const CATEGORIES = {
  iphone15pro: { title: "아이폰 15 Pro 관련 영상" },
  fashion: { title: "패션 영상" },
  "stanley-tumbler": { title: "스탠리 텀블러 영상" },
  sofa: { title: "소파 영상" },
};

// ✅ 임시 정적 영상 ID 목록 (원하는 ID로 자유롭게 교체/추가)
const STATIC_VIDEOS = {
  iphone15pro: [
    // 예시 ID들
    "dQw4w9WgXcQ",
    "ysz5S6PUM-U",
  ],
  fashion: [
    "rYEDA3JcQqw",
  ],
  "stanley-tumbler": [
    "9bZkp7q19f0",
  ],
  sofa: [
    "3JZ_D3ELwOQ",
  ],
};

// 썸네일은 API 없이도 i.ytimg.com으로 생성 가능
function toThumb(id, quality = "mqdefault") {
  return `https://i.ytimg.com/vi/${id}/${quality}.jpg`;
}

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

  useEffect(() => {
    setLoading(true);
    // 정적 리스트 → 객체 배열로 변환
    const list =
      (STATIC_VIDEOS[cat] || []).map((id) => ({
        id,
        title: "",     // 제목/채널은 API 없이 알 수 없으므로 비워둠(원하면 수동 입력)
        channel: "",
        thumb: toThumb(id),
      }));
    setVideos(list);
    setLoading(false);
  }, [cat]);

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
        {!loading && videos.length === 0 && (
          <div className={styles.skel}>영상 목록이 없습니다.</div>
        )}
        {!loading &&
          videos.map((v) => (
            <button
              key={v.id}
              className={styles.card}
              onClick={() => navigate(`/video/${v.id}`)}
            >
              <img className={styles.thumb} src={v.thumb} alt="" />
              <div className={styles.meta}>
                <div className={styles.vtitle}>{v.title || "제목 없음"}</div>
                <div className={styles.channel}>{v.channel || "YouTube"}</div>
              </div>
            </button>
          ))}
      </div>
    </section>
  );
}
