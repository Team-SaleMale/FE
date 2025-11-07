import { useEffect, useRef } from "react";
import styles from "../../styles/HotDeal/RoadView.module.css";

/* 카테고리 → 아이콘 매핑(미니맵 마커용) */
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
const iconUrl = (icon) => `https://api.iconify.design/${icon}.svg?width=20&height=20&color=white`;

function loadKakao() {
  return new Promise((resolve, reject) => {
    if (window.kakao?.maps?.LatLng) return resolve();
    let s = document.querySelector('script[data-kakao="maps"]');
    if (!s) {
      s = document.createElement("script");
      s.async = true; s.defer = true;
      s.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_KEY}&libraries=services&autoload=false`;
      s.setAttribute("data-kakao", "maps");
      s.onerror = () => reject(new Error("kakao sdk load error"));
      document.head.appendChild(s);
    }
    s.onload = () => window.kakao.maps.load(resolve);
  });
}

/* 카테고리 마커 이미지(미니맵용 40x40) */
const markerCache = new Map();
function loadImg(url){return new Promise((res,rej)=>{const i=new Image();i.crossOrigin="anonymous";i.onload=()=>res(i);i.onerror=rej;i.src=url;});}
async function markerImageByCategory(catKey){
  if (markerCache.has(catKey)) return markerCache.get(catKey);
  const kakao = window.kakao;
  const cat = CATEGORIES.find(c=>c.key===catKey) || CATEGORIES[CATEGORIES.length-1];
  const W=40,H=40,cx=20,cy=20;
  const icon = await loadImg(iconUrl(cat.icon));
  const cvs = document.createElement("canvas");
  cvs.width=W; cvs.height=H;
  const ctx = cvs.getContext("2d");
  ctx.beginPath(); ctx.arc(cx,cy,18,0,Math.PI*2); ctx.fillStyle="#fff"; ctx.fill();
  ctx.beginPath(); ctx.arc(cx,cy,16,0,Math.PI*2); ctx.fillStyle="#111827"; ctx.fill();
  ctx.drawImage(icon, cx-10, cy-10, 20, 20);
  const img = new kakao.maps.MarkerImage(cvs.toDataURL("image/png"), new kakao.maps.Size(W,H), {
    offset: new kakao.maps.Point(cx, H),
  });
  markerCache.set(catKey, img);
  return img;
}

/* 동동이(맵워커) 이미지 */
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

/**
 * RoadView
 * - 좌: 미니맵(ROADVIEW 도로 + 동동이 드래그) / 우: 로드뷰
 * - 동동이/지도 클릭 → 가장 가까운 파노라마로 로드뷰 이동
 * - 미니맵에 경매 마커 표시(클릭 시 onSelect)
 */
export default function RoadView({ center, radiusKm=3, items = [], onCenterChange, onSelect }) {
  const mapDivRef = useRef(null);
  const rvDivRef  = useRef(null);

  const mapRef = useRef(null);
  const rvRef  = useRef(null);
  const rvClientRef = useRef(null);

  const walkerRef = useRef(null);      // 동동이
  const auctionMarkersRef = useRef([]);// 경매 마커들
  const initedRef = useRef(false);

  useEffect(() => {
    if (initedRef.current) return;
    initedRef.current = true;

    (async () => {
      await loadKakao();
      const kakao = window.kakao;

      // 미니맵
      mapRef.current = new kakao.maps.Map(mapDivRef.current, {
        center: new kakao.maps.LatLng(center.lat, center.lng),
        level: 3,
      });
      // 로드뷰 도로 오버레이
      mapRef.current.addOverlayMapTypeId(kakao.maps.MapTypeId.ROADVIEW);

      // 로드뷰
      rvRef.current = new kakao.maps.Roadview(rvDivRef.current);
      rvClientRef.current = new kakao.maps.RoadviewClient();

      // 동동이(드래그 가능)
      walkerRef.current = new kakao.maps.Marker({
        image: createWalkerImage(),
        position: new kakao.maps.LatLng(center.lat, center.lng),
        draggable: true,
        map: mapRef.current,
      });

      // 동동이 드래그 종료 → 해당 위치로 로드뷰 이동
      kakao.maps.event.addListener(walkerRef.current, "dragend", () => {
        const p = walkerRef.current.getPosition();
        moveRoadviewTo(p);
      });

      // 미니맵 클릭 → 동동이 이동 + 로드뷰 이동
      kakao.maps.event.addListener(mapRef.current, "click", (evt) => {
        const p = evt.latLng;
        walkerRef.current.setPosition(p);
        moveRoadviewTo(p);
      });

      // 로드뷰 위치 변경 → 상위 center 동기화(지도 중심도 맞춤)
      kakao.maps.event.addListener(rvRef.current, "position_changed", () => {
        const p = rvRef.current.getPosition();
        mapRef.current.setCenter(p);
        onCenterChange?.({ lat: p.getLat(), lng: p.getLng() });
        setTimeout(() => rvRef.current?.relayout(), 0);
      });

      // 최초 진입
      await moveRoadviewTo(new kakao.maps.LatLng(center.lat, center.lng));
      await renderAuctionMarkers(items);

      // 리사이즈 보정
      const onResize = () => setTimeout(() => {
        mapRef.current?.relayout();
        rvRef.current?.relayout();
      }, 0);
      window.addEventListener("resize", onResize);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 센터/반경 변경 시 지도만 동기화(데이터는 부모가 관리)
  useEffect(() => {
    if (!window.kakao || !mapRef.current) return;
    const kakao = window.kakao;
    const pos = new kakao.maps.LatLng(center.lat, center.lng);
    mapRef.current.setCenter(pos);
    walkerRef.current?.setPosition(pos);
    moveRoadviewTo(pos);
  }, [center.lat, center.lng, radiusKm]);

  // ✅ items 변경 시 마커 재구성
  useEffect(() => {
    if (!window.kakao || !mapRef.current) return;
    renderAuctionMarkers(items);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  function clearAuctionMarkers(){
    auctionMarkersRef.current.forEach(m => m.setMap(null));
    auctionMarkersRef.current = [];
  }

  async function renderAuctionMarkers(data){
    const kakao = window.kakao;
    clearAuctionMarkers();

    const markers = await Promise.all(
      (data || []).map(async it => {
        const marker = new kakao.maps.Marker({
          position: new kakao.maps.LatLng(it.lat, it.lng),
          image: await markerImageByCategory(it.categoryKey),
          clickable: true,
          map: mapRef.current,
        });
        kakao.maps.event.addListener(marker, "click", () => onSelect?.(it));
        return marker;
      })
    );
    auctionMarkersRef.current = markers;
  }

  // 주어진 위치의 가장 가까운 파노라마로 로드뷰 이동
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
