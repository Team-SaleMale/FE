// src/utils/kakao.js
const KAKAO_JS_KEY = "92886e35b812725980119b7c621cbbc1";
let kakaoReadyPromise = null;

/** Kakao SDK 공용 로더: services, clusterer 포함 */
export function loadKakao() {
  // 이미 완전 로드되어 있으면 재사용
  if (window.kakao?.maps?.MarkerClusterer) return Promise.resolve();

  // 기존 진행중 Promise가 있으면 그대로 반환
  if (kakaoReadyPromise) return kakaoReadyPromise;

  kakaoReadyPromise = new Promise((resolve, reject) => {
    const libs = "services,clusterer";
    const SRC = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_KEY}&libraries=${libs}&autoload=false`;

    // 잘못 로드된 스크립트(라이브러리 누락) 정리
    let s = document.querySelector('script[data-kakao="maps"]');
    if (s && !window.kakao?.maps?.MarkerClusterer) {
      try { s.remove(); } catch {}
      s = null;
    }

    if (!s) {
      s = document.createElement("script");
      s.async = true; s.defer = true;
      s.src = SRC;
      s.setAttribute("data-kakao", "maps");
      s.onerror = () => { kakaoReadyPromise = null; reject(new Error("kakao sdk load error")); };
      document.head.appendChild(s);
    }

    s.onload = () => window.kakao.maps.load(() => resolve());
  });

  return kakaoReadyPromise;
}

/** 필요 시 사용 */
export function getKakao() {
  if (!window.kakao?.maps) throw new Error("Kakao SDK not loaded");
  return window.kakao;
}
