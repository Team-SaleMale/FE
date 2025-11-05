// src/utils/youtube.js
// --- No-API 모드 스텁 ---
// 키/호출을 아예 막아 secrets 스캔에 걸리지 않게 함.
// 나중에 Functions 경유 or API 재도입 시 여기서 교체.

export function getYoutubeKey() {
  return ""; // 일부러 빈 문자열 반환
}

export async function searchVideos(/* q, maxResults */) {
  // 현재는 API 미사용 → 빈 배열
  return [];
}

export async function getVideoDetail(/* videoId */) {
  return null;
}
