// src/pages/HotDealRegistration/MapPreview.js
import { useEffect, useRef } from "react";
import styles from "../../styles/HotDealRegistration/MapPreview.module.css";
import { loadKakao } from "../../utils/kakao";

/* 이미지 둥근 사각형 마커 (커버 이미지 있을 때만 사용) */
const cache = new Map();
function loadImg(u){return new Promise((res,rej)=>{const i=new Image();i.crossOrigin="anonymous";i.onload=()=>res(i);i.onerror=rej;i.src=u;});}
function sizeForLevel(level){
  if (level <= 3) return { w: 92, h: 72, r: 14 };
  if (level <= 5) return { w: 84, h: 64, r: 12 };
  if (level <= 7) return { w: 72, h: 56, r: 12 };
  if (level <= 9) return { w: 60, h: 48, r: 10 };
  return { w: 50, h: 40, r: 10 };
}
async function roundedMarkerImage(url, level=4){
  const kakao = window.kakao;
  const { w, h, r } = sizeForLevel(level);
  const key = `${url}|${w}x${h}|${r}`;
  if (cache.has(key)) return cache.get(key);

  const img = await loadImg(url);
  const cvs = document.createElement("canvas");
  cvs.width = w; cvs.height = h;
  const ctx = cvs.getContext("2d");

  ctx.beginPath();
  ctx.moveTo(r, 0); ctx.lineTo(w - r, 0); ctx.quadraticCurveTo(w, 0, w, r);
  ctx.lineTo(w, h - r); ctx.quadraticCurveTo(w, h, w - r, h);
  ctx.lineTo(r, h); ctx.quadraticCurveTo(0, h, 0, h - r);
  ctx.lineTo(0, r); ctx.quadraticCurveTo(0, 0, r, 0); ctx.closePath();
  ctx.save(); ctx.clip();

  const rectRatio = w / h, imgRatio = img.width / img.height;
  let sx, sy, sw, sh;
  if (imgRatio > rectRatio){ sh = img.height; sw = sh * rectRatio; sx = (img.width - sw)/2; sy = 0; }
  else { sw = img.width; sh = sw / rectRatio; sx = 0; sy = (img.height - sh)/2; }
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
  ctx.restore();

  ctx.lineWidth = 1.4; ctx.strokeStyle = "rgba(0,0,0,.18)"; ctx.stroke();

  const image = new kakao.maps.MarkerImage(
    cvs.toDataURL("image/png"),
    new kakao.maps.Size(w, h),
    { offset: new kakao.maps.Point(Math.round(w/2), h) }
  );
  cache.set(key, image);
  return image;
}

/* Hover 카드 */
function buildHoverCard({ storeName, productTitle, productPrice, coverImg }){
  const el = document.createElement("div");
  el.className = styles.card;
  const price = productPrice ? `₩${Number(productPrice).toLocaleString()}` : "₩0";
  const thumb = coverImg ? `<div class="${styles.cardThumb}" style="background-image:url('${coverImg}')"></div>` : "";

  el.innerHTML = `
    <div class="${styles.cardHead}">
      <div class="${styles.cardTitle}">${storeName || ""}</div>
      <div class="${styles.cardChev}">›</div>
    </div>
    <div class="${styles.cardBody}">
      ${thumb}
      <div class="${styles.cardText}">
        <div class="${styles.cardLine}"><b>${productTitle || "상품명"}</b></div>
        <div class="${styles.cardMeta}"><b>${price}</b></div>
      </div>
    </div>
    <div class="${styles.cardPin}"></div>
  `;
  return el;
}

export default function MapPreview({ lat, lng, storeName, productTitle, productPrice, coverImg }) {
  const ref = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const overlayRef = useRef(null);
  const hideTimer = useRef(null);

  async function createMarkerAndOverlay({ pos, coverUrl }) {
    const kakao = window.kakao;

    if (markerRef.current) markerRef.current.setMap(null);

    // 커버가 없으면 기본 파란 핀(이미지 미지정)
    const markerOptions = { position: pos, clickable: true, map: mapRef.current };
    if (coverUrl) {
      markerOptions.image = await roundedMarkerImage(coverUrl, mapRef.current.getLevel());
    }
    const marker = new kakao.maps.Marker(markerOptions);
    markerRef.current = marker;

    if (overlayRef.current) overlayRef.current.setMap(null);
    const cardEl = buildHoverCard({ storeName, productTitle, productPrice, coverImg: coverUrl });
    const overlay = new kakao.maps.CustomOverlay({
      position: pos,
      content: cardEl,
      xAnchor: 0.5,
      yAnchor: coverUrl ? 1.18 : 1.02,
      zIndex: 10,
      clickable: true,
    });
    overlayRef.current = overlay;

    cardEl.addEventListener("mouseenter", () => {
      if (hideTimer.current){ clearTimeout(hideTimer.current); hideTimer.current = null; }
    });
    cardEl.addEventListener("mouseleave", () => scheduleHide());

    kakao.maps.event.addListener(marker, "mouseover", () => {
      if (hideTimer.current){ clearTimeout(hideTimer.current); hideTimer.current = null; }
      overlay.setMap(mapRef.current);
    });
    kakao.maps.event.addListener(marker, "mouseout", () => scheduleHide());
  }

  useEffect(() => {
    (async () => {
      await loadKakao();
      const kakao = window.kakao;

      const map = new kakao.maps.Map(ref.current, {
        center: new kakao.maps.LatLng(lat, lng),
        level: 4,
      });
      mapRef.current = map;

      const pos = new kakao.maps.LatLng(lat, lng);
      await createMarkerAndOverlay({ pos, coverUrl: coverImg || "" });

      kakao.maps.event.addListener(map, "zoom_changed", async () => {
        if (!coverImg || !markerRef.current) return;
        const img = await roundedMarkerImage(coverImg, map.getLevel());
        markerRef.current.setImage(img);
      });

      setTimeout(() => mapRef.current?.relayout(), 0);
      const onResize = () => setTimeout(() => mapRef.current?.relayout(), 0);
      window.addEventListener("resize", onResize);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!window.kakao || !mapRef.current || !markerRef.current) return;
    const kakao = window.kakao;
    const pos = new kakao.maps.LatLng(lat, lng);
    mapRef.current.setCenter(pos);
    markerRef.current.setPosition(pos);
    overlayRef.current?.setPosition(pos);
  }, [lat, lng]);

  useEffect(() => {
    if (!window.kakao || !mapRef.current) return;
    const kakao = window.kakao;
    const pos = new kakao.maps.LatLng(lat, lng);
    (async () => { await createMarkerAndOverlay({ pos, coverUrl: coverImg || "" }); })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeName, productTitle, productPrice, coverImg]);

  function scheduleHide(){
    hideTimer.current = setTimeout(() => overlayRef.current?.setMap(null), 120);
  }

  return <div ref={ref} className={styles.map} />;
}
