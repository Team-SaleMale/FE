import { useMemo } from "react";
import { useParams } from "react-router-dom";
import styles from "../../styles/Main/Video.module.css";

// 유튜브 embed URL 생성기 (필요 옵션만 넣어 사용)
function buildYouTubeEmbedUrl(id, opts = {}) {
  const params = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
    // autoplay: "1",  // 자동재생 원하면 주석 해제 (정책상 음소거 필요할 수 있음)
    // mute: "1",
    ...opts,
  });
  return `https://www.youtube.com/embed/${id}?${params.toString()}`;
}

export default function Video() {
  const { videoId } = useParams();

  const embedUrl = useMemo(() => {
    if (!videoId) return "";
    return buildYouTubeEmbedUrl(videoId);
  }, [videoId]);

  if (!videoId) {
    return (
      <section className={styles.wrap}>
        <div className={styles.error}>⚠ 잘못된 영상 주소입니다.</div>
      </section>
    );
  }

  return (
    <section className={styles.wrap}>
      <div className={styles.player}>
        <iframe
          title="youtube-embed"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          src={embedUrl}
          // 유튜브 임베드 권장 allow 속성
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>

      <div className={styles.info}>
        <div className={styles.meta}>
          <span>영상 ID: {videoId}</span>
        </div>
        <a
          className={styles.title}
          href={`https://www.youtube.com/watch?v=${videoId}`}
          target="_blank"
          rel="noreferrer"
        >
          YouTube에서 열기 ↗
        </a>
      </div>
    </section>
  );
}
