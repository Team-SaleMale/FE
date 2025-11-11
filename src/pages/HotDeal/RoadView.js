// src/pages/HotDeal/RoadView.js
import { useEffect, useRef } from "react";
import styles from "../../styles/HotDeal/RoadView.module.css";
import { loadKakao } from "../../utils/kakao";

/* 미니맵 라운드 직사각형 이미지 마커 */
const cache = new Map();
function loadImg(url){
  return new Promise((res,rej)=>{
    const i=new Image();
    i.crossOrigin="anonymous";
    i.onload=()=>res(i);
    i.onerror=rej;
    i.src=url;
  });
}
async function miniMarkerImage(url, level=3){
  const kakao = window.kakao;
  const w = level <= 3 ? 72 : 60;
  const h = Math.round(w * 0.78);
  const key = `${url}|mini|${w}x${h}`;
  if (cache.has(key)) return cache.get(key);

  try{
    const img = await loadImg(url);
    const cvs = document.createElement("canvas");
    cvs.width = w; cvs.height = h;
    const ctx = cvs.getContext("2d");

    const r = 10;
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.lineTo(w - r, 0); ctx.quadraticCurveTo(w, 0, w, r);
    ctx.lineTo(w, h - r); ctx.quadraticCurveTo(w, h, w - r, h);
    ctx.lineTo(r, h);     ctx.quadraticCurveTo(0, h, 0, h - r);
    ctx.lineTo(0, r);     ctx.quadraticCurveTo(0, 0, r, 0);
    ctx.closePath();

    ctx.save(); ctx.clip();
    const rectRatio = w / h, imgRatio = img.width / img.height;
    let sx,sy,sw,sh;
    if (imgRatio > rectRatio){ sh = img.height; sw = sh * rectRatio; sx = (img.width - sw)/2; sy = 0; }
    else { sw = img.width; sh = sw / rectRatio; sx = 0; sy = (img.height - sh)/2; }
    ctx.drawImage(img, sx,sy,sw,sh, 0,0,w,h);
    ctx.restore();

    ctx.lineWidth = 1; ctx.strokeStyle = "rgba(0,0,0,.2)"; ctx.stroke();

    const image = new kakao.maps.MarkerImage(
      cvs.toDataURL("image/png"),
      new kakao.maps.Size(w, h),
      { offset: new kakao.maps.Point(Math.round(w/2), h) }
    );
    cache.set(key, image);
    return image;
  }catch(e){
    const c=document.createElement("canvas"); c.width=20; c.height=20;
    const ctx=c.getContext("2d"); ctx.beginPath(); ctx.arc(10,10,4,0,Math.PI*2); ctx.fillStyle="#2563eb"; ctx.fill();
    return new kakao.maps.MarkerImage(c.toDataURL("image/png"), new kakao.maps.Size(10,10), { offset:new kakao.maps.Point(5,10) });
  }
}

function createWalkerImage(){
  const kakao = window.kakao;
  return new kakao.maps.MarkerImage(
    "https://t1.daumcdn.net/localimg/localimages/07/2018/pc/roadview_minimap_wk_2018.png",
    new kakao.maps.Size(26,46),
    {
      spriteSize: new kakao.maps.Size(1666,168),
      spriteOrigin: new kakao.maps.Point(705,114),
      offset: new kakao.maps.Point(13,46)
    }
  );
}

/* MapView와 동일한 hover 카드 DOM */
function buildHoverCard(item){
  const el = document.createElement("div");
  el.className = `${styles.card}`;
  const price = `₩${(Number(item.currentPrice||0)).toLocaleString()}`;
  const bids  = `${Number(item.bidCount||0)}명`;
  const thumb = item.coverImg || item.images?.[0] || "";
  el.innerHTML = `
    <div class="${styles.cardHead}">
      <div class="${styles.cardTitle}">${item.storeName ?? ""}</div>
      <div class="${styles.cardChev}">›</div>
    </div>
    <div class="${styles.cardBody}">
      <div class="${styles.cardThumb}" style="background-image:url('${thumb}')"></div>
      <div class="${styles.cardText}">
        <div class="${styles.cardLine}"><b>${item.title || ""}</b></div>
        <div class="${styles.cardMeta}"><b>${price}</b><span class="${styles.sep}">·</span>입찰 ${bids}</div>
      </div>
    </div>
    <div class="${styles.cardPin}"></div>
  `;
  return el;
}

export default function RoadView({ center, radiusKm=3, items = [], onCenterChange, onSelect }) {
  const mapDivRef = useRef(null);
  const rvDivRef  = useRef(null);

  const mapRef = useRef(null);
  const rvRef  = useRef(null);
  const rvClientRef = useRef(null);

  const walkerRef = useRef(null);
  const auctionMarkersRef = useRef([]);
  const overlaysRef = useRef([]);
  const hideTimersRef = useRef(new Map());
  const itemsRef = useRef([]);
  const initedRef = useRef(false);

  useEffect(()=>{ itemsRef.current = Array.isArray(items) ? items : []; }, [items]);

  useEffect(() => {
    if (initedRef.current) return;
    initedRef.current = true;

    (async () => {
      await loadKakao();
      const kakao = window.kakao;

      mapRef.current = new kakao.maps.Map(mapDivRef.current, {
        center: new kakao.maps.LatLng(center.lat, center.lng),
        level: 3,
      });
      mapRef.current.addOverlayMapTypeId(kakao.maps.MapTypeId.ROADVIEW);

      rvRef.current = new kakao.maps.Roadview(rvDivRef.current);
      rvClientRef.current = new kakao.maps.RoadviewClient();

      walkerRef.current = new kakao.maps.Marker({
        image: createWalkerImage(),
        position: new kakao.maps.LatLng(center.lat, center.lng),
        draggable: true,
        map: mapRef.current,
      });

      kakao.maps.event.addListener(walkerRef.current, "dragend", () => {
        const p = walkerRef.current.getPosition();
        moveRoadviewTo(p);
      });

      kakao.maps.event.addListener(mapRef.current, "click", (evt) => {
        const p = evt.latLng;
        walkerRef.current.setPosition(p);
        moveRoadviewTo(p);
      });

      kakao.maps.event.addListener(rvRef.current, "position_changed", () => {
        const p = rvRef.current.getPosition();
        mapRef.current.setCenter(p);
        onCenterChange?.({ lat: p.getLat(), lng: p.getLng() });
        setTimeout(() => rvRef.current?.relayout(), 0);
      });

      kakao.maps.event.addListener(mapRef.current, "zoom_changed", () => {
        renderAuctionMarkers(itemsRef.current);
      });

      await moveRoadviewTo(new kakao.maps.LatLng(center.lat, center.lng));
      await renderAuctionMarkers(itemsRef.current);

      const onResize = () => setTimeout(() => {
        mapRef.current?.relayout();
        rvRef.current?.relayout();
      }, 0);
      window.addEventListener("resize", onResize);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!window.kakao || !mapRef.current) return;
    const kakao = window.kakao;
    const pos = new kakao.maps.LatLng(center.lat, center.lng);
    mapRef.current.setCenter(pos);
    walkerRef.current?.setPosition(pos);
    moveRoadviewTo(pos);
  }, [center.lat, center.lng, radiusKm]);

  useEffect(() => {
    if (!window.kakao || !mapRef.current) return;
    renderAuctionMarkers(items);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  function clearAuctionMarkers(){
    auctionMarkersRef.current.forEach(m => m.setMap(null));
    auctionMarkersRef.current = [];
    overlaysRef.current.forEach(o => o.setMap(null));
    overlaysRef.current = [];
    hideTimersRef.current.forEach(t => clearTimeout(t));
    hideTimersRef.current.clear();
  }

  async function renderAuctionMarkers(data){
    const kakao = window.kakao;
    clearAuctionMarkers();

    if (!Array.isArray(data) || data.length === 0) return;

    const level = mapRef.current.getLevel();

    const markers = await Promise.all(
      data.map(async it => {
        const imgUrl = it.coverImg || (it.images?.[0]);
        const image = await miniMarkerImage(imgUrl, level);
        const pos = new kakao.maps.LatLng(it.lat, it.lng);

        const marker = new kakao.maps.Marker({
          position: pos,
          image,
          clickable: true,
          map: mapRef.current,
        });

        const cardEl = buildHoverCard(it);
        const overlay = new kakao.maps.CustomOverlay({
          position: pos,
          content: cardEl,
          xAnchor: 0.5,
          yAnchor: 1.18,
          zIndex: 10,
          clickable: true,
        });

        cardEl.addEventListener("mouseenter", () => {
          const t = hideTimersRef.current.get(marker);
          if (t){ clearTimeout(t); hideTimersRef.current.delete(marker); }
        });
        cardEl.addEventListener("mouseleave", () => scheduleHide(marker, overlay));

        kakao.maps.event.addListener(marker, "mouseover", () => {
          const t = hideTimersRef.current.get(marker);
          if (t){ clearTimeout(t); hideTimersRef.current.delete(marker); }
          overlay.setMap(mapRef.current);
        });
        kakao.maps.event.addListener(marker, "mouseout", () => {
          scheduleHide(marker, overlay);
        });

        kakao.maps.event.addListener(marker, "click", () => onSelect?.(it));

        overlaysRef.current.push(overlay);
        return marker;
      })
    );
    auctionMarkersRef.current = markers;
  }

  function scheduleHide(marker, overlay){
    const t = setTimeout(() => overlay.setMap(null), 120);
    hideTimersRef.current.set(marker, t);
  }

  function moveRoadviewTo(pos){
    return new Promise((resolve) => {
      rvClientRef.current.getNearestPanoId(pos, 50, (panoId) => {
        if (panoId) {
          rvRef.current.setPanoId(panoId, pos);
        }
        resolve();
      });
    });
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.mapWrapper}><div ref={mapDivRef} className={styles.map}/></div>
      <div className={styles.rvWrapper}><div ref={rvDivRef}  className={styles.roadview}/></div>
    </div>
  );
}

