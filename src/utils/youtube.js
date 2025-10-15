// CRA 전용: 빌드 시점에 문자열 치환
export function getYoutubeKey() {
  /* eslint-disable no-undef */
  return (process.env.REACT_APP_YOUTUBE_API_KEY || "").trim();
  /* eslint-enable no-undef */
}

// 디버깅 보조: 키가 주입됐는지 한 번만 로깅 (운영에서는 끄기)
let _keyLogged = false;

async function ytFetch(path, params) {
  const key = getYoutubeKey();
  if (!key) {
    if (!_keyLogged) {
      // eslint-disable-next-line no-console
      console.warn("[YouTube] API key missing at build/runtime.");
      _keyLogged = true;
    }
    throw new Error("YouTube API key missing");
  }

  const search = new URLSearchParams({ key, ...params }).toString();
  const url = `https://www.googleapis.com/youtube/v3/${path}?${search}`;

  const res = await fetch(url);
  let data = null;
  try {
    data = await res.json();
  } catch {
    // ignore
  }

  if (!res.ok || data?.error) {
    const msg =
      data?.error?.message ||
      (data?.error?.errors?.[0]?.reason === "quotaExceeded" ? "quotaExceeded" : "") ||
      `HTTP ${res.status}`;
    throw new Error(`YouTube API error: ${msg}`);
  }
  return data;
}

export async function searchVideos(q, maxResults = 16) {
  const data = await ytFetch("search", {
    part: "snippet",
    q,
    type: "video",
    // 안정화 옵션
    maxResults: String(Math.min(maxResults, 50)),
    regionCode: "KR",
    relevanceLanguage: "ko",
    safeSearch: "moderate",
    order: "relevance",
    // 임베드 가능/외부 허용
    videoEmbeddable: "true",
    videoSyndicated: "true",
  });

  return (data.items || []).map((it) => ({
    id: it.id?.videoId,
    title: it.snippet?.title || "",
    channel: it.snippet?.channelTitle || "",
    thumb: it.snippet?.thumbnails?.medium?.url || it.snippet?.thumbnails?.default?.url || "",
  })).filter(v => !!v.id); // 혹시 모를 누락 방지
}

export async function getVideoDetail(videoId) {
  if (!videoId) return null;
  const data = await ytFetch("videos", {
    part: "snippet,statistics,contentDetails,status",
    id: videoId,
  });
  return data.items?.[0] || null;
}
