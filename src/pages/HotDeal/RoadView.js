// src/pages/HotDeal/RoadView.js
import { useEffect, useRef } from "react";
import styles from "../../styles/HotDeal/RoadView.module.css";
import { loadKakao } from "../../utils/kakao";

/* ===============================
   MapView와 동일한 마커 유틸
   =============================== */

/* 줌 레벨별 마커 사이즈 */
function sizeForLevel(level) {
  if (level <= 3) return { w: 92, h: 72, r: 14 };
  if (level <= 5) return { w: 84, h: 64, r: 12 };
  if (level <= 7) return { w: 72, h: 56, r: 12 };
  if (level <= 9) return { w: 60, h: 48, r: 10 };
  return { w: 50, h: 40, r: 10 };
}

/* 이미지 로더 + 라운드 직사각형 캔버스 마커 */
const imgCache = new Map();

function loadImg(url) {
  return new Promise((resolve, reject) => {
    if (!url) return reject(new Error("no url"));
    const img = new Image();
    img.crossOrigin = "anonymous"; // S3 CORS + 캔버스 사용
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function defaultDotImage() {
  const { kakao } = window;
  const c = document.createElement("canvas");
  c.width = 24;
  c.height = 24;
  const ctx = c.getContext("2d");
  ctx.beginPath();
  ctx.arc(12, 12, 6, 0, Math.PI * 2);
  ctx.fillStyle = "#2563eb";
  ctx.fill();
  return new kakao.maps.MarkerImage(
    c.toDataURL("image/png"),
    new kakao.maps.Size(12, 12),
    { offset: new kakao.maps.Point(6, 12) }
  );
}

async function roundedRectMarkerImage(url, level = 5) {
  const { kakao } = window;
  if (!url) return defaultDotImage();

  const { w, h, r } = sizeForLevel(level);
  const key = `${url}|${w}x${h}|${r}`;
  if (imgCache.has(key)) return imgCache.get(key);

  try {
    const img = await loadImg(url);

    const cvs = document.createElement("canvas");
    cvs.width = w;
    cvs.height = h;
    const ctx = cvs.getContext("2d");

    // 둥근 사각형 마스크
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.lineTo(w - r, 0);
    ctx.quadraticCurveTo(w, 0, w, r);
    ctx.lineTo(w, h - r);
    ctx.quadraticCurveTo(w, h, w - r, h);
    ctx.lineTo(r, h);
    ctx.quadraticCurveTo(0, h, 0, h - r);
    ctx.lineTo(0, r);
    ctx.quadraticCurveTo(0, 0, r, 0);
    ctx.closePath();
    ctx.save();
    ctx.clip();

    // cover-fit 크롭
    const rectRatio = w / h;
    const imgRatio = img.width / img.height;
    let sx, sy, sw, sh;
    if (imgRatio > rectRatio) {
      // 가로가 더 긴 이미지
      sh = img.height;
      sw = sh * rectRatio;
      sx = (img.width - sw) / 2;
      sy = 0;
    } else {
      // 세로가 더 긴 이미지
      sw = img.width;
      sh = sw / rectRatio;
      sx = 0;
      sy = (img.height - sh) / 2;
    }
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
    ctx.restore();

    // 테두리
    ctx.lineWidth = 1.4;
    ctx.strokeStyle = "rgba(0,0,0,.18)";
    ctx.stroke();

    const image = new kakao.maps.MarkerImage(
      cvs.toDataURL("image/png"),
      new kakao.maps.Size(w, h),
      { offset: new kakao.maps.Point(Math.round(w / 2), h) }
    );
    imgCache.set(key, image);
    return image;
  } catch (e) {
    console.warn(
      "[RoadView] marker image load failed, fallback -> raw url or dot:",
      url,
      e
    );
    try {
      const { w, h } = sizeForLevel(level);
      return new kakao.maps.MarkerImage(
        url,
        new kakao.maps.Size(w, h),
        { offset: new kakao.maps.Point(Math.round(w / 2), h) }
      );
    } catch (e2) {
      console.warn("[RoadView] raw url marker failed, fallback dot:", e2);
      return defaultDotImage();
    }
  }
}

function createWalkerImage() {
  const kakao = window.kakao;
  return new kakao.maps.MarkerImage(
    "https://t1.daumcdn.net/localimg/localimages/07/2018/pc/roadview_minimap_wk_2018.png",
    new kakao.maps.Size(26, 46),
    {
      spriteSize: new kakao.maps.Size(1666, 168),
      spriteOrigin: new kakao.maps.Point(705, 114),
      offset: new kakao.maps.Point(13, 46),
    }
  );
}

/* MapView와 동일한 hover 카드 DOM (CSS만 RoadView용) */
function buildHoverCard(item) {
  const el = document.createElement("div");
  el.className = `${styles.card}`;
  const price = `₩${Number(item.currentPrice || 0).toLocaleString()}`;
  const bids = `${Number(item.bidCount || 0)}명`;
  const thumb =
    item.coverImg ||
    item.images?.[0] ||
    item.imageUrls?.[0] ||
    "";

  el.innerHTML = `
    <div class="${styles.cardHead}">
      <div class="${styles.cardTitle}">${item.storeName ?? ""}</div>
      <div class="${styles.cardChev}">›</div>
    </div>
    <div class="${styles.cardBody}">
      <div class="${styles.cardThumb}" style="background-image:url('${thumb}')"></div>
      <div class="${styles.cardText}">
        <div class="${styles.cardLine}"><b>${item.title || item.name || ""}</b></div>
        <div class="${styles.cardMeta}"><b>${price}</b><span class="${styles.sep}">·</span>입찰 ${bids}</div>
      </div>
    </div>
    <div class="${styles.cardPin}"></div>
  `;
  return el;
}

/* ===============================
   RoadView 컴포넌트
   =============================== */

export default function RoadView({
  center,
  radiusKm = 3,
  items = [],
  onCenterChange,
  onSelect,
}) {
  const mapDivRef = useRef(null);
  const rvDivRef = useRef(null);

  const mapRef = useRef(null);
  const rvRef = useRef(null);
  const rvClientRef = useRef(null);

  const walkerRef = useRef(null);
  const circleRef = useRef(null);

  const markersRef = useRef([]);
  const overlaysRef = useRef([]);
  const hideTimersRef = useRef(new Map());
  const itemsRef = useRef([]);
  const initedRef = useRef(false);

  const clustererRef = useRef(null);

  // items 최신값 유지 (zoom_changed에서 사용)
  useEffect(() => {
    itemsRef.current = Array.isArray(items) ? items : [];
  }, [items]);

  useEffect(() => {
    if (initedRef.current) return;
    initedRef.current = true;

    (async () => {
      await loadKakao();
      const kakao = window.kakao;

      // 미니맵
      const map = new kakao.maps.Map(mapDivRef.current, {
        center: new kakao.maps.LatLng(center.lat, center.lng),
        level: 3,
      });
      map.addOverlayMapTypeId(kakao.maps.MapTypeId.ROADVIEW);
      mapRef.current = map;

      // Roadview
      const rv = new kakao.maps.Roadview(rvDivRef.current);
      const rvClient = new kakao.maps.RoadviewClient();
      rvRef.current = rv;
      rvClientRef.current = rvClient;

      const pos = new kakao.maps.LatLng(center.lat, center.lng);

      // 반경 원
      const circle = new kakao.maps.Circle({
        center: pos,
        radius: radiusKm * 1000,
        strokeWeight: 1,
        strokeColor: "#111827",
        strokeOpacity: 0.5,
        strokeStyle: "shortdash",
        fillColor: "#93c5fd",
        fillOpacity: 0.15,
      });
      circle.setMap(map);
      circleRef.current = circle;

      // 워커 마커
      const walker = new kakao.maps.Marker({
        image: createWalkerImage(),
        position: pos,
        draggable: true,
        map,
      });
      walkerRef.current = walker;

      // 클러스터러 생성 (MapView와 동일)
      if (kakao.maps.MarkerClusterer) {
        clustererRef.current = new kakao.maps.MarkerClusterer({
          map,
          averageCenter: true,
          minLevel: 6,
        });
      } else {
        clustererRef.current = null;
        console.warn(
          "[RoadView] kakao.maps.MarkerClusterer is undefined. Add libraries=clusterer or clustering will be skipped."
        );
      }

      // 워커 드래그 → 로드뷰 이동
      kakao.maps.event.addListener(walker, "dragend", () => {
        const p = walker.getPosition();
        moveRoadviewTo(p);
      });

      // 미니맵 클릭 → 워커/로드뷰 이동
      kakao.maps.event.addListener(map, "click", (evt) => {
        const p = evt.latLng;
        walker.setPosition(p);
        moveRoadviewTo(p);
      });

      // 로드뷰 위치 변경 → 미니맵 센터/원/상위 center 상태 동기화
      kakao.maps.event.addListener(rv, "position_changed", () => {
        const p = rv.getPosition();
        map.setCenter(p);
        circleRef.current?.setPosition(p);
        onCenterChange?.({
          lat: p.getLat(),
          lng: p.getLng(),
        });
        setTimeout(() => rvRef.current?.relayout(), 0);
      });

      // 줌 변경 시 → 마커/클러스터 재렌더링 (레벨별 마커 크기 반영)
      kakao.maps.event.addListener(
        mapRef.current,
        "zoom_changed",
        () => {
          renderAuctionMarkers(itemsRef.current);
        }
      );

      await moveRoadviewTo(pos);
      await renderAuctionMarkers(itemsRef.current);

      const onResize = () =>
        setTimeout(() => {
          mapRef.current?.relayout();
          rvRef.current?.relayout();
        }, 0);
      window.addEventListener("resize", onResize);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // center/radius 변경 시: 미니맵/워커/원/로드뷰 위치 동기화
  useEffect(() => {
    if (!window.kakao || !mapRef.current) return;
    const kakao = window.kakao;
    const pos = new kakao.maps.LatLng(center.lat, center.lng);
    mapRef.current.setCenter(pos);
    walkerRef.current?.setPosition(pos);
    circleRef.current?.setPosition(pos);
    circleRef.current?.setRadius(radiusKm * 1000);
    moveRoadviewTo(pos);
  }, [center.lat, center.lng, radiusKm]);

  // items 변경 시 마커 재렌더링
  useEffect(() => {
    if (!window.kakao || !mapRef.current) return;
    renderAuctionMarkers(items);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  function clearAuctionMarkers() {
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    overlaysRef.current.forEach((o) => o.setMap(null));
    overlaysRef.current = [];
    hideTimersRef.current.forEach((t) => clearTimeout(t));
    hideTimersRef.current.clear();
    clustererRef.current?.clear();
  }

  async function renderAuctionMarkers(data) {
    const kakao = window.kakao;
    clearAuctionMarkers();

    if (!Array.isArray(data) || data.length === 0) return;

    const level = mapRef.current.getLevel();

    const markers = await Promise.all(
      data.map(async (it) => {
        if (it.lat == null || it.lng == null) return null;

        const pos = new kakao.maps.LatLng(it.lat, it.lng);
        const thumbUrl =
          it.coverImg ||
          it.images?.[0] ||
          it.imageUrls?.[0];

        const image = await roundedRectMarkerImage(
          thumbUrl,
          level
        );

        const marker = new kakao.maps.Marker({
          position: pos,
          image,
          clickable: true,
        });
        marker.setMap(mapRef.current);

        const cardEl = buildHoverCard(it);
        const overlay = new kakao.maps.CustomOverlay({
          position: pos,
          content: cardEl,
          xAnchor: 0.5,
          yAnchor: 1.18,
          zIndex: 10,
          clickable: true,
        });

        // Hover 카드 hide 타이밍 제어
        cardEl.addEventListener("mouseenter", () => {
          const t = hideTimersRef.current.get(marker);
          if (t) {
            clearTimeout(t);
            hideTimersRef.current.delete(marker);
          }
        });
        cardEl.addEventListener("mouseleave", () =>
          scheduleHide(marker, overlay)
        );

        kakao.maps.event.addListener(marker, "mouseover", () => {
          const t = hideTimersRef.current.get(marker);
          if (t) {
            clearTimeout(t);
            hideTimersRef.current.delete(marker);
          }
          overlay.setMap(mapRef.current);
        });
        kakao.maps.event.addListener(marker, "mouseout", () => {
          scheduleHide(marker, overlay);
        });

        kakao.maps.event.addListener(marker, "click", () =>
          onSelect?.(it)
        );

        overlaysRef.current.push(overlay);
        return marker;
      })
    );

    const validMarkers = markers.filter(Boolean);
    markersRef.current = validMarkers;

    if (clustererRef.current) {
      try {
        clustererRef.current.addMarkers(validMarkers);
      } catch (e) {
        console.warn(
          "[RoadView] clusterer addMarkers error:",
          e
        );
      }
    }
  }

  function scheduleHide(marker, overlay) {
    const t = setTimeout(() => overlay.setMap(null), 120);
    hideTimersRef.current.set(marker, t);
  }

  function moveRoadviewTo(pos) {
    return new Promise((resolve) => {
      rvClientRef.current.getNearestPanoId(
        pos,
        50,
        (panoId) => {
          if (panoId) {
            rvRef.current.setPanoId(panoId, pos);
          }
          resolve();
        }
      );
    });
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.mapWrapper}>
        <div ref={mapDivRef} className={styles.map} />
      </div>
      <div className={styles.rvWrapper}>
        <div ref={rvDivRef} className={styles.roadview} />
      </div>
    </div>
  );
}
