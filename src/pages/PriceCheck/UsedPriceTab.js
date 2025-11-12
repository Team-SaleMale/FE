// src/pages/PriceCheck/UsedPriceTab.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PriceCheckHeader from "../../components/pricecheck/PriceCheckHeader";
import ipadImg from "../../assets/img/PriceCheck/ipadpro.png";
import "../../styles/PriceCheck/UsedPriceTab.css";
import { get } from "../../api/client";
import endpoints from "../../api/endpoints";

const SS_KEY = "pricecheck:lastState"; // ← 부모와 같은 키 사용

// [추가 주석] 낙찰(거래 완료) 전용 히스토리 검색: /search/price-history
function searchUsedItems({ q, page = 1, size = 5 }) {
  const keyword = (q || "").trim();
  const p0 = Math.max(0, Number(page) - 1);
  // 날짜 최신순은 서버 기본(또는 createdAt desc)이라 별도 sort 파라미터 없이 호출
  return get(endpoints.SEARCH.PRICE_HISTORY, { q: keyword, page: p0, size });
}

const PER_PAGE = 5;
const FALLBACK_IMG = ipadImg;

export default function UsedPriceTab({
  activeTab,
  setActiveTab,
  tempQuery,
  setTempQuery,
  searchTerm,
  setSearchTerm,
}) {
  const navigate = useNavigate();
  const detailPath = (id) => `/auctions/${id}`;
  const goDetail = (id) => id && navigate(detailPath(id));

  // ① 세션에서 usedPage 복원
  const loadSS = () => {
    try {
      const raw = sessionStorage.getItem(SS_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };
  const saved = loadSS();

  const [page, setPage] = useState(saved?.usedPage || 1);
  const [items, setItems] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // ② usedPage 변경/검색어 변경 시 세션에 저장
  useEffect(() => {
    try {
      const prev = loadSS() || {};
      sessionStorage.setItem(
        SS_KEY,
        JSON.stringify({
          ...prev,
          usedPage: page,
        })
      );
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // 제출
  const onSubmit = (e) => {
    e.preventDefault();
    const q = (tempQuery || "").trim();
    setSearchTerm(q);
    setPage(1);
  };

  // 자동 재검색: searchTerm / page / activeTab 바뀔 때
  useEffect(() => {
    const load = async () => {
      const q = (searchTerm || "").trim();
      if (!q) {
        setItems([]);
        setTotalPages(0);
        setTotalCount(0);
        setErrorMsg("");
        setLoading(false);
        return;
      }
      await loadSearch(q);
    };

    const loadSearch = async (q) => {
      try {
        setLoading(true);
        setErrorMsg("");
        const res = await searchUsedItems({ q, page, size: PER_PAGE });

        // 서버 응답 표준화
        const box = res?.result ?? res ?? {};
        const list = box.items ?? box.content ?? box.list ?? [];
        const tp =
          box.totalPages ??
          box.pageInfo?.totalPages ??
          (box.total ? Math.ceil(box.total / PER_PAGE) : 0);
        const tot =
          box.total ??
          box.totalElements ??
          box.pageInfo?.totalElements ??
          list.length;

        const mapped = list.map(normalizeItem); // [추가 주석] price-history 스키마 대응
        setItems(mapped);
        setTotalPages(tp || (tot ? Math.ceil(tot / PER_PAGE) : 0));
        setTotalCount(tot);

        // 상세 설명 주입(옵션)
        await injectDescriptions(mapped);
      } catch (err) {
        setItems([]);
        setTotalPages(0);
        setTotalCount(0);
        setErrorMsg(err?.friendlyMessage || "검색 실패");
      } finally {
        setLoading(false);
      }
    };

    async function injectDescriptions(baseItems) {
      if (!Array.isArray(baseItems) || baseItems.length === 0) return;
      const tasks = baseItems.map(async (it) => {
        const id = it.id;
        if (!id) return it;
        try {
          const detail = await get(endpoints.AUCTIONS.DETAIL(id));
          const desc = detail?.result?.description || "";
          return { ...it, description: desc };
        } catch {
          return it;
        }
      });
      const withDesc = await Promise.all(tasks);
      setItems((prev) => {
        const byId = new Map(prev.map((p) => [p.id, p]));
        for (const it of withDesc) byId.set(it.id, { ...byId.get(it.id), ...it });
        return Array.from(byId.values());
      });
    }

    load();
    // 뒤로 오거나 탭 바꿔도 마지막 검색 상태로 재검색
  }, [searchTerm, page, activeTab]);

  return (
    <div className="used-wrap">
      <form onSubmit={onSubmit}>
        <PriceCheckHeader
          title="시세 둘러보기"
          value={tempQuery}
          onChange={setTempQuery}
          placeholder="상품명을 입력해 주세요"
        />
      </form>

      <div className="tabbar">
        <button className="tab muted" onClick={() => setActiveTab("regular")}>
          정가 시세 보기
        </button>
        <button className="tab active">
          중고 시세 보기
          {searchTerm && totalCount ? ` ${Number(totalCount).toLocaleString()}` : ""}
        </button>
      </div>

      <div className="used-list-area">
        {!searchTerm ? null : (
          <>
            {loading && <p className="used-hint">불러오는 중…</p>}
            {!loading && errorMsg && <p className="used-hint warn">{errorMsg}</p>}

            {!loading && !errorMsg && items.length === 0 && (
              <p className="used-hint">검색 결과가 없습니다.</p>
            )}

            {!loading && !errorMsg && items.length > 0 && (
              <>
                {items.map((it) => (
                  <article
                    key={it.id}
                    className="used-card"
                    role="button"
                    tabIndex={0}
                    onClick={() => goDetail(it.id)}
                    onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && goDetail(it.id)}
                  >
                    <div className="used-card-left">
                      <span className={`used-badge ${it.status === "낙찰 완료" ? "done" : "progress"}`}>
                        {it.status}
                      </span>
                      <div className="used-thumb">
                        <img className="used-img" src={it.image} alt={it.title} />
                      </div>
                    </div>

                    <div className="used-card-right">
                      <h3 className="used-name">{it.title}</h3>
                      {it.description && (
                        <p className="used-desc">
                          {it.description.length > 80 ? `${it.description.slice(0, 80)}...` : it.description}
                        </p>
                      )}

                      <div className="used-pricebox">
                        <div className="used-price-row">
                          <span className="label">시작가</span>
                          <span className="value">{fmt(it.startPrice)}</span>
                        </div>

                        {/* [추가 주석] 낙찰 히스토리 화면이므로 최종가 노출 */}
                        <div className="used-price-row strong">
                          <span className="label">최종 낙찰가</span>
                          <span className="value">{fmt(it.finalPrice)}</span>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}

                {totalPages > 1 && (
                  <div className="used-pagination">
                    <button className="used-nav" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
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
          </>
        )}
      </div>
    </div>
  );
}

/** 서버 아이템 → 화면 모델 변환 */
// [추가 주석] /search/price-history 응답 스키마에 맞는 필드 우선 사용
function normalizeItem(x) {
  return {
    id: x.id ?? x.itemId ?? x.auctionId ?? cryptoRandomId(),
    status: mapStatus(x.itemStatus ?? x.status, x.finished),
    title: x.title ?? x.name ?? "",
    brand: x.brand ?? "",
    category: x.categoryPath ?? x.category ?? "",
    spec: x.spec ?? x.description ?? "",
    image: absolutize(pickImageUrl(x)) || FALLBACK_IMG,
    description: x.description ?? "",
    startPrice: num(x.startPrice ?? x.openingPrice),
    // price-history 응답에는 최종가 전용 필드가 없을 수 있어 currentPrice로 보정
    finalPrice: num(x.finalPrice ?? x.winningBid ?? x.currentPrice),
    currentPrice: num(x.currentPrice ?? x.bidPrice),
  };
}

function pickImageUrl(x = {}) {
  const single =
    x.imageUrl ||
    x.thumbnailUrl ||
    x.thumbnail ||
    x.mainImageUrl ||
    x.mainImageURL ||
    x.coverImageUrl ||
    x.coverUrl ||
    x.photoUrl ||
    x.pictureUrl ||
    x.imgUrl ||
    x.img;
  if (isNonEmptyStr(single)) return single;

  // [추가 주석] price-history: imageUrls 배열 지원
  const arrayKeys = ["imageUrls", "images", "photos", "pictures"];
  for (const key of arrayKeys) {
    const arr = x[key];
    if (Array.isArray(arr) && arr.length) {
      // 문자열 배열 우선
      const urlCandidate = arr.find(isNonEmptyStr);
      if (urlCandidate) return urlCandidate;
      // 객체 배열이면 url 같은 키 탐색
      for (const it of arr) {
        if (!it || typeof it !== "object") continue;
        const u = it.imageUrl || it.url || it.src || it.path || it.fileUrl || it.downloadUrl;
        if (isNonEmptyStr(u)) return u;
      }
    }
  }

  if (Array.isArray(x.images)) {
    const sorted = [...x.images].sort((a, b) => (a?.imageOrder ?? 0) - (b?.imageOrder ?? 0));
    for (const it of sorted) {
      if (!it || typeof it !== "object") continue;
      const u = it.imageUrl || it.url || it.src || it.path || it.fileUrl || it.downloadUrl;
      if (isNonEmptyStr(u)) return u;
    }
  }

  if (x.mainImage && typeof x.mainImage === "object") {
    const u = x.mainImage.url || x.mainImage.src || x.mainImage.path;
    if (isNonEmptyStr(u)) return u;
  }
  return "";
}

function isNonEmptyStr(v) {
  return typeof v === "string" && v.trim().length > 0;
}

function absolutize(u) {
  if (!isNonEmptyStr(u)) return "";
  try {
    const test = new URL(u, window.location.origin);
    return test.href;
  } catch {
    return u;
  }
}

// [추가 주석] SUCCESS(낙찰), FINISHED/CLOSED/DONE도 낙찰로 표기
function mapStatus(status, finished) {
  if (finished === true) return "낙찰 완료";
  const s = String(status || "").toUpperCase();
  if (s === "SUCCESS" || s === "FINISHED" || s === "CLOSED" || s === "DONE" || s === "COMPLETED") return "낙찰 완료";
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
