// src/pages/AuctionProductDetails/AuctionProductDetails.js
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import styles from "../../styles/AuctionProductDetails/AuctionProductDetails.module.css";

/* 상품 이미지 (더미) */
import ipad01 from "../../assets/img/AuctionProductDetails/ProductImage/ipad-01.png";
import ipad02 from "../../assets/img/AuctionProductDetails/ProductImage/ipad-02.png";
import ipad03 from "../../assets/img/AuctionProductDetails/ProductImage/ipad-03.png";
import ipad04 from "../../assets/img/AuctionProductDetails/ProductImage/ipad-04.png";

/* 프로필 이미지 (더미) */
import profile01 from "../../assets/img/AuctionProductDetails/ProfileImage/profile-01.png";
import profile02 from "../../assets/img/AuctionProductDetails/ProfileImage/profile-02.png";
import profile03 from "../../assets/img/AuctionProductDetails/ProfileImage/profile-03.png";
import profile04 from "../../assets/img/AuctionProductDetails/ProfileImage/profile-04.png";
import profile05 from "../../assets/img/AuctionProductDetails/ProfileImage/profile-05.png";
import profile06 from "../../assets/img/AuctionProductDetails/ProfileImage/profile-06.png";
import profile07 from "../../assets/img/AuctionProductDetails/ProfileImage/profile-07.png";

/* 추천 상품 썸네일 샘플 */
import ha01 from "../../assets/img/Main/CategoryPopular/ha-01.png";
import hf01 from "../../assets/img/Main/CategoryPopular/hf-01.png";
import bt01 from "../../assets/img/Main/CategoryPopular/bt-01.png";
import ha04 from "../../assets/img/Main/CategoryPopular/ha-04.png";

/* 섹션 컴포넌트 */
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

/**
 * 컨테이너: 데이터 fetch + 섹션 ref/ID 관리
 * - 실제 API 연결 전까지는 mockData 사용
 */
export default function AuctionProductDetails() {
  const { id } = useParams(); // /auctions/:id
  const [loading, setLoading] = useState(true);
  const [auction, setAuction] = useState(null);

  // 섹션 앵커용 ref
  const sectionRefs = {
    overview: useRef(null),
    seller: useRef(null),
    metrics: useRef(null),
    calendar: useRef(null),
    history: useRef(null),
  };

  // TODO: API 연결 시 교체
  const mockData = useMemo(
    () => ({
      id,
      title: "아이패드 프로 12.9 6세대 256GB",
      category: "디지털기기",
      images: [
        { id: 1, url: ipad01 },
        { id: 2, url: ipad02 },
        { id: 3, url: ipad03 },
        { id: 4, url: ipad04 },
      ],

      seller: {
        id: "seller-123",
        name: "유저123",
        rating: 4.9,
        reviews: 120,
        transactions: 58,
        auctionIndex: 4.5,
        profileImage: profile07, // import 방식으로 통일
        updatedAt: "2025-10-05T12:03:00Z",
      },

      description: `
2024년 1월 구매, 화면/본체 스크래치 없음. 박스/케이블/충전기 포함. 애플케어 미가입.
실사용 4~5개월, 배터리 효율 96% 내외. 보호필름 부착 상태, 케이스 착용 사용.
강남역/양재역 직거래 우선, 택배 가능(선불). 단순 변심 환불 불가.
연락은 채팅 선호, 무리한 에누리는 어려워요. Wi-Fi 256GB Silver.
추가로 매직 키보드(별매) 사용 흔적 거의 없음. 사진 원본 요청 가능.
참고 링크: https://support.apple.com/ko-kr/HT201585
`.trim(),

      metrics: {
        views: 12543,
        watchers: 620,
        bids: 17,
        // 텍스트 버전 요구사항: "직거래, 택배거래, 기타" 한 줄 출력 + 기타는 hover 시 상세
        tradeMethod: "직거래/택배거래/기타",
        tradeOther:
          "평일 저녁 강남/양재 직거래 가능 • 제주/도서산간 택배 추가비용 • 상황에 따라 퀵 가능",
      },

      // ✅ 추천 상품 (RecommendedList가 image/endsAt/badges 사용)
      recommended: [
        {
          id: 301,
          title: "아이패드 에어 5세대 64GB",
          price: 680000,
          image: ha01,
          endsAt: "2025-11-02T15:00:00+09:00",
          badges: ["인기"],
        },
        {
          id: 302,
          title: "오메가3 프리미엄 1200mg (180캡슐)",
          price: 29000,
          image: hf01,
          endsAt: "2025-11-05T21:00:00+09:00",
          badges: ["건강"],
        },
        {
          id: 303,
          title: "롱웨어 쿠션 파운데이션 21호",
          price: 23000,
          image: bt01,
          endsAt: "2025-11-03T18:30:00+09:00",
          badges: ["뷰티"],
        },
        {
          id: 304,
          title: "다이슨 V12 무선청소기",
          price: 520000,
          image: ha04,
          endsAt: "2025-11-07T12:00:00+09:00",
          badges: ["관심↑"],
        },
      ],

      // ✅ 시간 포함(새 요구사항)
      calendar: {
        startDate: "2025-10-14",
        startTime: "10:00", // HH:mm 또는 HH:mm:ss
        endDate: "2025-11-28",
        endTime: "18:00",
      },

      price: { current: 1120000, unitStep: 10000, startPrice: 700000 },

      bidHistory: [
        { id: "b1", user: "bidder***", price: 1120000, timeText: "방금 전", tag: "recent", avatarUrl: profile01 },
        { id: "b2", user: "bidder***", price: 1100000, timeText: "방금 전", tag: "recent", avatarUrl: profile02 },
        { id: "b3", user: "bidder***", price: 1050000, timeText: "어제", tag: "min",   avatarUrl: profile03 },
        { id: "b4", user: "bidder***", price: 1120000, timeText: "어제",               avatarUrl: profile04 },
        { id: "b5", user: "bidder***", price: 1400000, timeText: "어제", tag: "max",   avatarUrl: profile05 },
        { id: "b6", user: "bidder***", price: 1320000, timeText: "어제",               avatarUrl: profile06 },
        { id: "b7", user: "bidder***", price: 1290000, timeText: "2일 전",             avatarUrl: profile07 },
      ],
    }),
    [id]
  );

  useEffect(() => {
    // TODO: fetch(`/api/auctions/${id}`)
    setAuction(mockData);
    setLoading(false);
  }, [id, mockData]);

  if (loading || !auction) return <div className={styles.loading}>Loading...</div>;

  // 입찰 처리(낙관적 업데이트)
  const handleBid = (bidPrice) => {
    setAuction((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        price: { ...prev.price, current: Math.max(prev.price.current ?? 0, bidPrice) },
        metrics: { ...prev.metrics, bids: (prev.metrics?.bids ?? 0) + 1 },
        bidHistory: [
          {
            id: `b-${Date.now()}`,
            user: "you***",
            price: bidPrice,
            timeText: "방금 전",
            tag: "recent",
            avatarUrl: profile07,
          },
          ...prev.bidHistory,
        ],
      };
    });

    // TODO: 실제 API 호출
    // await post(`/api/auctions/${id}/bids`, { price: bidPrice })
  };

  return (
    <div className={styles.page}>
      <AuctionTitle title={auction.title} category={auction.category} />
      <TopSectionNav sectionRefs={sectionRefs} />

      {/* ==== 본문 + BidPanel 2열 레이아웃 ==== */}
      <div className={styles.layout}>
        {/* 좌측: 본문 */}
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
            {/* ⬇️ 시간 포함된 calendar 전달 */}
            <CalendarPanel calendar={auction.calendar} />
          </section>

          <section id="history" ref={sectionRefs.history} className={styles.section}>
            <BidHistory items={auction.bidHistory} />
          </section>

          <section className={styles.section}>
            <CautionList />
          </section>
        </div>

        {/* 우측: 고정 패널 */}
        <aside className={styles.rightCol}>
          <BidPanel
            price={auction.price}
            calendar={auction.calendar}      // ⬅️ start/end + time
            bidItems={auction.bidHistory}
            watchers={auction.metrics?.watchers}
            onBid={handleBid}
          />
        </aside>
      </div>

      {/* ==== 추천 섹션 ==== */}
      <div className={styles.layoutSingle}>
        <section className={styles.section}>
          <RecommendedList items={auction.recommended} />
        </section>
      </div>
    </div>
  );
}
