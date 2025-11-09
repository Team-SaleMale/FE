// netlify/functions/youtube.js
// 서버리스 프록시: 프런트 번들에 키가 포함되지 않도록 우회
// Netlify 환경변수: YOUTUBE_API_KEY 필수(사이트 설정에서 등록)

exports.handler = async (event) => {
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,OPTIONS",
  };
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers };
  }

  const key = process.env.YOUTUBE_API_KEY;
  if (!key) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Missing YOUTUBE_API_KEY" }) };
  }

  const qs = event.queryStringParameters || {};
  const mode = qs.mode || "search";         // "search" | "video"
  const max  = Math.min(parseInt(qs.max || "16", 10) || 16, 50);

  try {
    let url = "";
    const sp = new URLSearchParams({ key });

    if (mode === "video" && qs.id) {
      sp.set("id", qs.id);
      sp.set("part", "snippet,statistics,contentDetails,status");
      url = `https://www.googleapis.com/youtube/v3/videos?${sp.toString()}`;
    } else {
      sp.set("q", qs.q || "");
      sp.set("type", "video");
      sp.set("part", "snippet");
      sp.set("maxResults", String(max));
      sp.set("regionCode", "KR");
      sp.set("relevanceLanguage", "ko");
      sp.set("safeSearch", "moderate");
      sp.set("order", "relevance");
      sp.set("videoEmbeddable", "true");
      sp.set("videoSyndicated", "true");
      url = `https://www.googleapis.com/youtube/v3/search?${sp.toString()}`;
    }

    const resp = await fetch(url);
    const data = await resp.json();

    if (!resp.ok || data?.error) {
      const msg = data?.error?.message || `HTTP ${resp.status}`;
      return { statusCode: 502, headers, body: JSON.stringify({ error: msg }) };
    }

    if (mode === "video") {
      // 원본 그대로 전달(상세 화면이 필요할 때 사용)
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    // 검색은 프런트에서 쓰기 쉽게 변환해서 반환
    const items = (data.items || [])
      .map((it) => ({
        id: it.id?.videoId,
        title: it.snippet?.title || "",
        channel: it.snippet?.channelTitle || "",
        thumb: it.snippet?.thumbnails?.medium?.url || it.snippet?.thumbnails?.default?.url || "",
      }))
      .filter((x) => !!x.id);

    return { statusCode: 200, headers, body: JSON.stringify({ items }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: String(err.message || err) }) };
  }
};
