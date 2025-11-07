// src/pages/PriceCheck/UsedPriceTab.jsx
import React, { useEffect, useState } from "react";
import PriceCheckHeader from "../../components/pricecheck/PriceCheckHeader";
import ipadImg from "../../assets/img/PriceCheck/ipadpro.png";
import "../../styles/PriceCheck/UsedPriceTab.css";

// 서비스 레이어 (아래 경로는 네가 만든 파일 위치에 맞춰 조정)
import { getNoAuth } from "../../api/client";
import endpoints from "../../api/endpoints";

/** 목록: /auctions  (로그인 불필요 시 NO_AUTH_PATHS에 /auctions 추가해두면 좋아) */
function fetchUsedList({ page = 1, size = 5 }) {
  return getNoAuth(endpoints.AUCTIONS.LIST, { page, size });
}

/** 검색: /search/items?q=...  */
function searchUsedItems({ q, page = 1, size = 5 }) {
  return getNoAuth(endpoints.SEARCH.ITEMS, { q, page, size });
}

const PER_PAGE = 5;
const FALLBACK_IMG = ipadImg;

export default function UsedPriceTab({ setActiveTab }) {
  // 입력 중 검색어
  const [tempQuery, setTempQuery] = useState("");
  // 제출된 검색어
  const [searchTerm, setSearchTerm] = useState("");
  // 페이지
  const [page, setPage] = useState(1);

  // 데이터 상태
  const [items, setItems] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // 제출 핸들러
  const onSubmit = (e) => {
    e.preventDefault();
    const q = (tempQuery || "").trim();
    setSearchTerm(q);
    setPage(1);
  };

  // API 호출
  useEffect(() => {
    const load = async () => {
      const q = (searchTerm || "").trim();
      if (!q) {
        // 검색어 없으면 기본 목록
        await loadList();
      } else {
        // 검색어 있으면 검색 API
        await loadSearch(q);
      }
    };

    const loadList = async () => {
      try {
        setLoading(true);
        setErrorMsg("");
        const res = await fetchUsedList({ page, size: PER_PAGE });
        applyResponse(res);
      } catch (err) {
        setItems([]);
        setTotalPages(0);
        setTotalCount(0);
        setErrorMsg(err?.friendlyMessage || "목록 조회 실패");
      } finally {
        setLoading(false);
      }
    };

    const loadSearch = async (q) => {
      try {
        setLoading(true);
        setErrorMsg("");
        const res = await searchUsedItems({ q, page, size: PER_PAGE });
        applyResponse(res);
      } catch (err) {
        setItems([]);
        setTotalPages(0);
        setTotalCount(0);
        setErrorMsg(err?.friendlyMessage || "검색 실패");
      } finally {
        setLoading(false);
      }
    };

    /** 백엔드 응답 통합 매핑 */
    const applyResponse = (res) => {
      // 흔한 형태들을 모두 수용 (result 래핑/직접 등)
      const box = res?.result ?? res ?? {};
      const list = box.content ?? box.items ?? box.list ?? [];
      const tp =
        box.totalPages ??
        box.pageInfo?.totalPages ??
        (box.total ? Math.ceil(box.total / PER_PAGE) : 0);
      const tot =
        box.total ??
        box.totalElements ??
        box.pageInfo?.totalElements ??
        list.length;

      const mapped = list.map(normalizeItem);
      setItems(mapped);
      setTotalPages(tp || (tot ? Math.ceil(tot / PER_PAGE) : 0));
      setTotalCount(tot);
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, page]);

  return (
    <div className="used-wrap">
      {/* 헤더: Enter / Q 버튼으로 제출 */}
      <form onSubmit={onSubmit}>
        <PriceCheckHeader
          title="시세 둘러보기"
          value={tempQuery}
          onChange={setTempQuery}
          placeholder="상품명을 입력해 주세요"
        />
      </form>

      {/* 탭 */}
      <div className="tabbar">
        <button className="tab muted" onClick={() => setActiveTab("regular")}>
          정가 시세 보기
        </button>
        <button className="tab active">
          중고 시세 보기{totalCount ? ` ${Number(totalCount).toLocaleString()}` : ""}
        </button>
      </div>

      {/* 본문 */}
      <div className="used-list-area">
        {loading && <p className="used-hint">불러오는 중…</p>}
        {!loading && errorMsg && <p className="used-hint warn">{errorMsg}</p>}

        {/* 데이터 없음 */}
        {!loading && !errorMsg && items.length === 0 && (
          <p className="used-hint">
            {searchTerm ? "검색 결과가 없습니다." : "표시할 경매가 없습니다."}
          </p>
        )}

        {/* 카드 리스트 */}
        {!loading && !errorMsg && items.length > 0 && (
          <>
            {items.map((it) => (
              <article key={it.id} className="used-card">
                <div className="used-card-left">
                  <span
                    className={`used-badge ${
                      it.status === "낙찰 완료" ? "done" : "progress"
                    }`}
                  >
                    {it.status}
                  </span>
                  <div className="used-thumb">
                    <img className="used-img" src={it.image} alt={it.title} />
                  </div>
                </div>

                <div className="used-card-right">
                  <div className="used-brand-row">
                    <span className="used-brand">{it.brand || "상품"}</span>
                    <span className="used-auth">Authorized Reseller</span>
                  </div>

                  <h3 className="used-name">{it.title}</h3>
                  <div className="used-meta">{it.category}</div>
                  {it.spec && <p className="used-spec">{it.spec}</p>}

                  <div className="used-pricebox">
                    <div className="used-price-row">
                      <span className="label">시작가</span>
                      <span className="value">{fmt(it.startPrice)}</span>
                    </div>

                    {it.status === "경매 진행 중" ? (
                      <div className="used-price-row strong">
                        <span className="label">현재 경매가</span>
                        <span className="value">{fmt(it.currentPrice)}</span>
                      </div>
                    ) : (
                      <div className="used-price-row strong">
                        <span className="label">최종 낙찰가</span>
                        <span className="value">{fmt(it.finalPrice)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))}

            {totalPages > 1 && (
              <div className="used-pagination">
                <button
                  className="used-nav"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  ‹
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    className={`used-page ${page === n ? "active" : ""}`}
                    onClick={() => setPage(n)}
                  >
                    {n}
                  </button>
                ))}
                <button
                  className="used-nav"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  ›
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/** 서버 아이템 → 화면 모델 변환 */
function normalizeItem(x) {
  return {
    id: x.id ?? x.itemId ?? x.auctionId ?? cryptoRandomId(),
    status: mapStatus(x.status, x.finished),
    title: x.title ?? x.name ?? "",
    brand: x.brand ?? "",
    category: x.categoryPath ?? x.category ?? "",
    spec: x.spec ?? x.description ?? "",
    image: x.imageUrl ?? x.thumbnailUrl ?? x.thumbnail ?? FALLBACK_IMG,
    startPrice: num(x.startPrice ?? x.openingPrice),
    currentPrice: num(x.currentPrice ?? x.bidPrice),
    finalPrice: num(x.finalPrice ?? x.winningBid),
  };
}

function mapStatus(status, finished) {
  if (finished === true) return "낙찰 완료";
  const s = (status || "").toUpperCase();
  if (s === "FINISHED" || s === "CLOSED" || s === "DONE") return "낙찰 완료";
  return "경매 진행 중";
}

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function fmt(n) {
  const v = num(n);
  return v ? v.toLocaleString("ko-KR") + "원" : "-";
}

function cryptoRandomId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
