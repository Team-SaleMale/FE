// src/pages/AuctionProductDetails/AuctionProductDetails.js
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

/** ISO 문자열 → 한국 표기(yyyy. m. d. 오전/오후 hh:mm:ss) */
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

/** util: ISO → {date:'YYYY-MM-DD', time:'HH:mm'} */
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

/** API → 화면용 뷰모델 매핑 */
function toViewModel(api) {
  const r = api?.result;
  if (!r) return null;

  const images = Array.isArray(r.images)
    ? r.images.map((img, idx) => ({
        id: img.imageOrder ?? idx,
        url: img.imageUrl,
      }))
    : [];

  const seller = {
    id: r.sellerInfo?.sellerId ?? "",
    name: r.sellerInfo?.nickname ?? "",
    rating: (r.sellerInfo?.mannerScore ?? 0) / 20,
    reviews: 0,
    transactions: 0,
    auctionIndex: ((r.sellerInfo?.mannerScore ?? 0) / 20).toFixed(1),
    profileImage: r.sellerInfo?.profileImage || "",
    updatedAt: r.createdAt || "",
  };

  // 거래 방식 한글 변환 & 기타 설명
  const tradeMethodsRaw = Array.isArray(r.tradeInfo?.tradeMethods)
    ? r.tradeInfo.tradeMethods
    : [];
  const tradeMethodsUpper = tradeMethodsRaw.map((m) =>
    String(m || "").trim().toUpperCase()
  );
  const tradeMethodKoList = tradeMethodsUpper
    .map((m) => TRADE_METHOD_LABELS[m] || m)
    .filter(Boolean);
  const tradeMethodText = tradeMethodKoList.join(", ");
  const hasOther = tradeMethodsUpper.includes("OTHER");
  const tradeOtherText = hasOther
    ? r.tradeInfo?.tradeDetails || "기타 거래 조건은 판매자에게 문의하세요."
    : "";

  const start = splitISO(r.createdAt);
  const end = splitISO(r.auctionInfo?.endTime);

  const metrics = {
    views: 0,
    watchers: r.userInteraction?.likeCount ?? 0,   // 찜 수
    userLiked: r.userInteraction?.isLiked ?? false,
    bids: r.auctionInfo?.bidCount ?? 0,
    tradeMethod: tradeMethodText,
    tradeOther: tradeOtherText,
    hasOther,
  };

  const price = {
    current: r.auctionInfo?.currentPrice ?? 0,
    unitStep: r.auctionInfo?.bidIncrement ?? 0,
    startPrice: r.auctionInfo?.startPrice ?? 0, // ← 시작가(고정 표기용)
  };

  // ----- 입찰 내역: 최신 내림차순 정렬 + 배지(Recent/Min/Max) 부여 -----
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
      user: h.bidder?.nickname ?? "익명",
      price: h.bidPrice,
      timeText: formatKST(h.bidTime),      // ← 통일된 한국형 시간
      tag,
      avatarUrl: h.bidder?.profileImage || "",
    };
  });

  return {
    id: r.itemId,
    title: r.title || r.name || "",
    exactModelName: r.name || "",
    category: r.category || "",
    aiResult: undefined,
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

  const handleBid = async (bidPrice) => {
    // 낙관적 반영
    setAuction((prev) => {
      if (!prev) return prev;
      const nowText = new Intl.DateTimeFormat("ko-KR", {
        year: "numeric", month: "numeric", day: "numeric",
        hour: "numeric", minute: "numeric", second: "numeric", hour12: true
      }).format(new Date());
      const nextHistory = [
        {
          id: `local-${Date.now()}`,
          user: "you***",
          price: bidPrice,
          timeText: nowText,
          tag: "recent",
          avatarUrl: "",
        },
        ...(prev.bidHistory || []),
      ];

      // Min/Max 재계산
      const prices = nextHistory.map(h => h.price).filter(n => Number.isFinite(n));
      const minP = Math.min(...prices);
      const maxP = Math.max(...prices);
      const reTagged = nextHistory.map((h, idx) => ({
        ...h,
        tag: idx === 0 ? "recent" : (h.price === minP ? "min" : (h.price === maxP ? "max" : undefined))
      }));

      return {
        ...prev,
        price: { ...prev.price, current: Math.max(prev.price.current ?? 0, bidPrice) },
        metrics: { ...prev.metrics, bids: (prev.metrics?.bids ?? 0) + 1 },
        bidHistory: reTagged,
      };
    });

    try {
      await placeBid(auction.id, bidPrice);
    } catch (e) {
      const latest = await fetchAuctionDetail(auction.id, { bidHistoryLimit: 10 });
      setAuction(toViewModel(latest));
      console.error(e);
      alert("입찰에 실패했습니다. 다시 시도해 주세요.");
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
