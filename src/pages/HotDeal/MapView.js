import { useEffect, useRef } from "react";
import styles from "../../styles/HotDeal/MapView.module.css";

/* 카테고리 → 아이콘 매핑 */
const CATEGORIES = [
  { key:"home-appliance", icon:"solar:washing-machine-minimalistic-linear" },
  { key:"health-food",   icon:"solar:dumbbell-large-minimalistic-linear" },
  { key:"beauty",        icon:"solar:magic-stick-3-linear" },
  { key:"food-processed",icon:"solar:chef-hat-linear" },
  { key:"pet",           icon:"solar:cat-linear" },
  { key:"digital",       icon:"solar:laptop-minimalistic-linear" },
  { key:"living-kitchen",icon:"solar:whisk-linear" },
  { key:"women-acc",     icon:"solar:bag-smile-outline" },
  { key:"sports",        icon:"solar:balls-linear" },
  { key:"plant",         icon:"solar:waterdrop-linear" },
  { key:"game-hobby",    icon:"solar:reel-2-broken" },
  { key:"ticket",        icon:"solar:ticket-sale-linear" },
  { key:"furniture",     icon:"solar:armchair-2-linear" },
  { key:"book",          icon:"solar:notebook-broken" },
  { key:"kids",          icon:"solar:smile-circle-linear" },
  { key:"clothes",       icon:"solar:hanger-broken" },
  { key:"etc",           icon:"solar:add-square-broken" },
];

const KAKAO_JS_KEY = "92886e35b812725980119b7c621cbbc1";
const iconUrl = (icon) => `https://api.iconify.design/${icon}.svg?width=24&height=24&color=white`;

/** Kakao SDK autoload=false 로더 */
function loadKakao() {
  return new Promise((resolve, reject) => {
    if (window.kakao?.maps?.LatLng) return resolve();
    let s = document.querySelector('script[data-kakao="maps"]');
    if (!s) {
      s = document.createElement("script");
      s.async = true; s.defer = true;
      s.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_KEY}&libraries=clusterer,services&autoload=false`;
      s.setAttribute("data-kakao", "maps");
      s.onerror = () => reject(new Error("kakao sdk load error"));
      document.head.appendChild(s);
    }
    s.onload = () => window.kakao.maps.load(resolve);
  });
}

/* 마커 이미지 캐시 (카테고리별 캔버스 렌더) */
const markerCache = new Map();
function loadImg(url) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = url;
  });
}
async function markerImageByCategory(catKey) {
  if (markerCache.has(catKey)) return markerCache.get(catKey);
  const kakao = window.kakao;
  const cat = CATEGORIES.find((c) => c.key === catKey) || CATEGORIES[CATEGORIES.length - 1];
  const W = 48, H = 48, cx = 24, cy = 24;
  const icon = await loadImg(iconUrl(cat.icon));
  const cvs = document.createElement("canvas");
  cvs.width = W; cvs.height = H;
  const ctx = cvs.getContext("2d");
  ctx.beginPath(); ctx.arc(cx, cy, 22, 0, Math.PI*2); ctx.fillStyle = "#fff"; ctx.fill();
  ctx.beginPath(); ctx.arc(cx, cy, 20, 0, Math.PI*2); ctx.fillStyle = "#111827"; ctx.fill();
  ctx.drawImage(icon, cx-12, cy-12, 24, 24);
  const image = new kakao.maps.MarkerImage(cvs.toDataURL("image/png"), new kakao.maps.Size(W,H), {
    offset: new kakao.maps.Point(cx, H),
  });
  markerCache.set(catKey, image);
  return image;
}

export default function MapView({ center, radiusKm, items = [], onSelect }) {
  const mapRef = useRef(null);
  const circleRef = useRef(null);
  const clustererRef = useRef(null);
  const markersRef = useRef([]);
  const divRef = useRef(null);
  const initedRef = useRef(false);

  useEffect(() => {
    if (initedRef.current) return;
    initedRef.current = true;

    (async () => {
      await loadKakao();
      const kakao = window.kakao;

      // 지도 생성
      const map = new kakao.maps.Map(divRef.current, {
        center: new kakao.maps.LatLng(center.lat, center.lng),
        level: 5,
      });
      mapRef.current = map;

      // 반경 원 + 내 위치
      const pos = new kakao.maps.LatLng(center.lat, center.lng);
      const circle = new kakao.maps.Circle({
        center: pos, radius: radiusKm*1000,
        strokeWeight: 1, strokeColor:"#111827", strokeOpacity:.5, strokeStyle:"shortdash",
        fillColor:"#93c5fd", fillOpacity:.15,
      });
      circle.setMap(map);
      circleRef.current = circle;
      new kakao.maps.Marker({ position: pos, map }); // 내 위치

      // 클러스터러
      clustererRef.current = new kakao.maps.MarkerClusterer({
        map, averageCenter: true, minLevel: 6,
      });

      // 최초 렌더
      await renderMarkers(items);
      setTimeout(() => mapRef.current?.relayout(), 0);
      const onResize = () => setTimeout(() => mapRef.current?.relayout(), 0);
      window.addEventListener("resize", onResize);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // center/radius 변경 시 반경 원만 동기화(데이터 필터링은 부모가 해줌)
  useEffect(() => {
    if (!window.kakao || !mapRef.current) return;
    const kakao = window.kakao;
    const pos = new kakao.maps.LatLng(center.lat, center.lng);
    mapRef.current.setCenter(pos);
    circleRef.current?.setPosition(pos);
    circleRef.current?.setRadius(radiusKm*1000);
  }, [center.lat, center.lng, radiusKm]);

  // ✅ items 변경 시 마커 재구성
  useEffect(() => {
    if (!window.kakao || !mapRef.current) return;
    renderMarkers(items);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  function clearMarkers() {
    markersRef.current.forEach(m => m.setMap(null));
    clustererRef.current?.clear();
    markersRef.current = [];
  }

  async function renderMarkers(data) {
    const kakao = window.kakao;
    clearMarkers();
    const markers = await Promise.all(
      (data || []).map(async it => {
        const marker = new kakao.maps.Marker({
          position: new kakao.maps.LatLng(it.lat, it.lng),
          image: await markerImageByCategory(it.categoryKey),
          clickable: true,
        });
        kakao.maps.event.addListener(marker, "click", () => onSelect?.(it));
        return marker;
      })
    );
    markersRef.current = markers;
    clustererRef.current?.addMarkers(markers);
  }

  return <div ref={divRef} className={styles.map} />;
}
