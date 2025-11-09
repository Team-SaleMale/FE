// src/pages/AuctionProductDetails/AuctionProductDetails.jsx
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import styles from "../../styles/AuctionProductDetails/AuctionProductDetails.module.css";

import AuctionTitle from "./AuctionTitle";
import TopSectionNav from "./TopSectionNav";
import MediaGallery from "./MediaGallery";
import SellerSummary from "./SellerSummary";
import ProductDescription from "./ProductDescription";
import AuctionMetrics from "./AuctionMetrics";
import CalendarPanel from "./CalendarPanel";
import BidHistory from "./BidHistory";
import CautionList from "./CautionList";
import RecommendedList from "./RecommendedList";
import BidPanel from "./BidPanel";

import { fetchAuctionDetail, placeBid } from "../../api/auctions/service";

/** enum → 한글 매핑 */
const TRADE_METHOD_LABELS = {
  SHIPPING: "택배거래",
  DELIVERY: "택배거래",
  IN_PERSON: "직거래",
  DIRECT: "직거래",
  OTHER: "기타",
};

/** ISO → 한국 표기 */
function formatKST(iso) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
  }).format(d);
}

/** ISO → {date:'YYYY-MM-DD', time:'HH:mm'} */
function splitISO(iso) {
  if (!iso) return { date: "", time: "" };
  const d = new Date(iso);
  if (isNaN(d.getTime())) return { date: "", time: "" };
  const pad = (n) => String(n).padStart(2, "0");
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}

function splitDate(d) {
  if (!(d instanceof Date)) return { date: "", time: "" };
  const pad = (n) => String(n).padStart(2, "0");
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}

/** 현재 로그인 사용자의 닉네임을 가능한 범위에서 추출 */
function getCurrentNickname() {
  try {
    // 앱 전역에 주입된 경우
    if (window.__APP_USER?.nickname) return window.__APP_USER.nickname;
  } catch {}
  try {
    // 흔한 로컬스토리지 키 시도
    const direct = localStorage.getItem("nickname") || localStorage.getItem("userNickname");
    if (direct) return direct;
    const raw = localStorage.getItem("user") || localStorage.getItem("profile");
    if (raw) {
      const u = JSON.parse(raw);
      if (u?.nickname) return u.nickname;
      if (u?.name) return u.name;
    }
  } catch {}
  return "나";
}

/** ✅ API → 화면용 뷰모델 */
function toViewModel(api) {
  const r = api?.result;
  if (!r) return null;

  const images = Array.isArray(r.images)
    ? r.images.map((img, idx) => ({
        id: img.imageOrder ?? idx,
        url: img.imageUrl,
      }))
    : [];

  // mannerScore → auctionScore(0~5, 0.5단위)
  const ms = r.sellerInfo?.mannerScore ?? 0;
  const score5 = Math.round(((ms / 100) * 5) * 2) / 2;

  const seller = {
    id: r.sellerInfo?.sellerId ?? "",
    name: r.sellerInfo?.nickname ?? "",
    avatarUrl: r.sellerInfo?.profileImage || "",
    tradesCount: r.sellerInfo?.tradesCount ?? r.sellerInfo?.tradeCount ?? 0,
    auctionScore: Number.isFinite(score5) ? score5 : 0,
  };

  const tradeMethodsRaw = Array.isArray(r.tradeInfo?.tradeMethods) ? r.tradeInfo.tradeMethods : [];
  const tradeMethodsUpper = tradeMethodsRaw.map((m) => String(m || "").trim().toUpperCase());
  const tradeMethodKoList = tradeMethodsUpper.map((m) => TRADE_METHOD_LABELS[m] || m).filter(Boolean);
  const tradeMethodText = tradeMethodKoList.join(", ");
  const hasOther = tradeMethodsUpper.includes("OTHER");
  const tradeOtherText = hasOther
    ? r.tradeInfo?.tradeDetails || "기타 거래 조건은 판매자에게 문의하세요."
    : "";

  const start = splitISO(r.createdAt);
  const end = splitISO(r.auctionInfo?.endTime);

  const metrics = {
    views: 0,
    watchers: r.userInteraction?.likeCount ?? 0,
    userLiked: r.userInteraction?.isLiked ?? false,
    bids: r.auctionInfo?.bidCount ?? 0,
    tradeMethod: tradeMethodText,
    tradeOther: tradeOtherText,
    hasOther,
  };

  const price = {
    current: r.auctionInfo?.currentPrice ?? 0,
    unitStep: r.auctionInfo?.bidIncrement ?? 0,
    startPrice: r.auctionInfo?.startPrice ?? 0,
  };

  const sorted = Array.isArray(r.bidHistory)
    ? [...r.bidHistory].sort((a, b) => new Date(b.bidTime) - new Date(a.bidTime))
    : [];

  const prices = sorted.map((h) => h.bidPrice).filter((n) => Number.isFinite(n));
  const minPrice = prices.length ? Math.min(...prices) : null;
  const maxPrice = prices.length ? Math.max(...prices) : null;

  const bidHistory = sorted.map((h, idx) => {
    let tag;
    if (idx === 0) tag = "recent";
    if (minPrice !== null && h.bidPrice === minPrice) tag = "min";
    if (maxPrice !== null && h.bidPrice === maxPrice) tag = "max";
    return {
      id: String(h.transactionId),
      // 닉네임 필드 추가 (BidHistory가 우선 사용)
      nickname: h.bidder?.nickname ?? "익명",
      user: h.bidder?.nickname ?? "익명",
      price: h.bidPrice,
      timeText: formatKST(h.bidTime),
      tag,
      avatarUrl: h.bidder?.profileImage || "",
    };
  });

  return {
    id: r.itemId,
    title: r.title || r.name || "",
    exactModelName: r.name || "",
    category: r.category || "",
    images,
    seller,
    description: r.description || "",
    metrics,
    calendar: {
      startDate: start.date,
      startTime: start.time,
      endDate: end.date,
      endTime: end.time,
    },
    price,
    bidHistory,
    recommended: [],
  };
}

export default function AuctionProductDetails() {
  const { id: rawId } = useParams();
  const id = String(rawId).replace(/^:+/, "");
  const [loading, setLoading] = useState(true);
  const [auction, setAuction] = useState(null);
  const [error, setError] = useState(null);

  const sectionRefs = {
    overview: useRef(null),
    seller: useRef(null),
    metrics: useRef(null),
    calendar: useRef(null),
    history: useRef(null),
  };

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);

    fetchAuctionDetail(id, { bidHistoryLimit: 10 })
      .then((payload) => {
        if (!alive) return;
        const vm = toViewModel(payload);
        setAuction(vm);
      })
      .catch((e) => {
        if (!alive) return;
        setError(e);
      })
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, [id]);

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.loading}>오류가 발생했습니다: {String(error.message || error)}</div>;
  if (!auction) return <div className={styles.loading}>데이터가 없습니다.</div>;

  /** ✅ 입찰 처리: 서버 규칙(현재가 + 최소호가)과 동일하게 프런트에서 선검증 */
  const handleBid = async (bidPrice) => {
    const start = Number(auction.price?.startPrice ?? 0);
    const current = Number(auction.price?.current ?? 0);
    const step = Number(auction.price?.unitStep ?? 0);
    const base = Math.max(current, start);
    const minAllowed = base + (step > 0 ? step : 0); // 서버 규칙과 동일

    if (bidPrice < minAllowed) {
      alert(
        `최소 ${minAllowed.toLocaleString("ko-KR")}원 이상 입력해 주세요. (현재가 ${base.toLocaleString(
          "ko-KR"
        )}원, 최소호가 ${step.toLocaleString("ko-KR")}원)`
      );
      return;
    }

    try {
      const res = await placeBid(auction.id, bidPrice);

      if (res?.isSuccess === false) {
        const cur = res?.result?.currentPrice;
        if (Number.isFinite(cur)) {
          setAuction((prev) => (prev ? { ...prev, price: { ...prev.price, current: cur } } : prev));
        }
        alert(res?.message || "입찰에 실패했습니다.");
        return;
      }

      const r = res?.result || {};
      setAuction((prev) => {
        if (!prev) return prev;

        const nowISO = r.bidTime ?? new Date().toISOString();
        const nickname = r.bidder?.nickname ?? getCurrentNickname();

        // BidHistory가 nickname을 우선 사용하도록 필드 포함
        const newItem = {
          id: String(r.transactionId ?? `local-${Date.now()}`),
          nickname,
          user: nickname,
          price: r.bidPrice ?? bidPrice,
          timeText: formatKST(nowISO),
          tag: "recent",
          avatarUrl: r.bidder?.profileImage || "",
        };

        const nextHistory = [newItem, ...(prev.bidHistory || [])];

        const prices = nextHistory.map((h) => h.price).filter((n) => Number.isFinite(n));
        const minP = Math.min(...prices);
        const maxP = Math.max(...prices);
        const reTagged = nextHistory.map((h, idx) => ({
          ...h,
          tag: idx === 0 ? "recent" : h.price === minP ? "min" : h.price === maxP ? "max" : undefined,
        }));

        let calendar = prev.calendar;
        if (Number.isFinite(r.remainingTimeInSeconds)) {
          const endDateObj = new Date(Date.now() + r.remainingTimeInSeconds * 1000);
          const { date, time } = splitDate(endDateObj);
          calendar = { ...prev.calendar, endDate: date, endTime: time };
        }

        const newCurrent = Number.isFinite(r.currentHighestPrice)
          ? r.currentHighestPrice
          : Math.max(prev.price.current ?? 0, bidPrice);

        return {
          ...prev,
          calendar,
          price: { ...prev.price, current: newCurrent },
          metrics: {
            ...prev.metrics,
            bids: Number.isFinite(r.bidCount) ? r.bidCount : (prev.metrics?.bids ?? 0) + 1,
          },
          bidHistory: reTagged,
        };
      });
    } catch (e) {
      const d = e?.response?.data;
      if (d?.isSuccess === false) {
        const cur = d?.result?.currentPrice;
        const min = d?.result?.minimumBidPrice;
        if (Number.isFinite(cur)) {
          setAuction((prev) => (prev ? { ...prev, price: { ...prev.price, current: cur } } : prev));
        }
        alert(
          d?.message ||
            (Number.isFinite(min)
              ? `최소 ${Number(min).toLocaleString("ko-KR")}원 이상부터 입찰 가능합니다.`
              : "입찰에 실패했습니다.")
        );
      } else {
        alert("입찰에 실패했습니다. 다시 시도해 주세요.");
      }
    }
  };

  const handleLikeChange = ({ isLiked, likeCount }) => {
    setAuction((prev) =>
      prev
        ? {
            ...prev,
            metrics: {
              ...prev.metrics,
              userLiked: isLiked,
              watchers: likeCount,
            },
          }
        : prev
    );
  };

  return (
    <div className={styles.page}>
      <AuctionTitle
        title={auction.title}
        exactModelName={auction.exactModelName}
        category={auction.category}
        itemId={auction.id}
        isLiked={auction.metrics.userLiked}
        likeCount={auction.metrics.watchers}
        onLikeChange={handleLikeChange}
      />

      <TopSectionNav sectionRefs={sectionRefs} />

      <div className={styles.layout}>
        <div className={styles.leftCol}>
          <section id="overview" ref={sectionRefs.overview} className={styles.section}>
            <MediaGallery images={auction.images} />
            <ProductDescription text={auction.description} />
          </section>

          <section id="seller" ref={sectionRefs.seller} className={styles.section}>
            <SellerSummary seller={auction.seller} />
          </section>

          <section id="metrics" ref={sectionRefs.metrics} className={styles.section}>
            <AuctionMetrics metrics={auction.metrics} loading={loading} />
          </section>

          <section id="calendar" ref={sectionRefs.calendar} className={styles.section}>
            <CalendarPanel calendar={auction.calendar} />
          </section>

          <section id="history" ref={sectionRefs.history} className={styles.section}>
            <BidHistory items={auction.bidHistory} />
          </section>

          <section className={styles.section}>
            <CautionList />
          </section>
        </div>

        <aside className={styles.rightCol}>
          <BidPanel
            price={auction.price}
            calendar={auction.calendar}
            bidItems={auction.bidHistory}
            watchers={auction.metrics?.watchers}
            onBid={handleBid}
          />
        </aside>
      </div>

      <div className={styles.layoutSingle}>
        <section className={styles.section}>
          <RecommendedList items={auction.recommended} />
        </section>
      </div>
    </div>
  );
}
