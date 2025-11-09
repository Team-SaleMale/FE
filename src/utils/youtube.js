// src/utils/youtube.js
// 프런트에서는 Netlify Function만 호출(번들에 키 없음)

export async function searchVideos(q, maxResults = 16) {
  const sp = new URLSearchParams({
    mode: "search",
    q: q || "",
    max: String(maxResults),
  });
  const res = await fetch(`/.netlify/functions/youtube?${sp.toString()}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "YouTube proxy error");
  return data.items || [];
}

export async function getVideoDetail(videoId) {
  if (!videoId) return null;
  const sp = new URLSearchParams({ mode: "video", id: videoId });
  const res = await fetch(`/.netlify/functions/youtube?${sp.toString()}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "YouTube proxy error");
  return data.items?.[0] || null;
}
