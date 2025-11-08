// src/pages/PriceCheck/RegularPriceTab.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import PriceCheckHeader from "../../components/pricecheck/PriceCheckHeader";
import "../../styles/PriceCheck/RegularPriceTab.css";

const SS_KEY = "pricecheck:lastState";

export default function RegularPriceTab({
  activeTab,
  setActiveTab,
  tempQuery,
  setTempQuery,
  searchTerm,
  setSearchTerm,
}) {
  // ① 세션에서 regularPage 복원
  const loadSS = () => {
    try {
      const raw = sessionStorage.getItem(SS_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };
  const saved = loadSS();

  const [items, setItems] = useState([]);
  const [page, setPage] = useState(saved?.regularPage || 1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const PER_PAGE = 10;

  // ② regularPage 변경 시 세션 저장
  useEffect(() => {
    try {
      const prev = loadSS() || {};
      sessionStorage.setItem(
        SS_KEY,
        JSON.stringify({
          ...prev,
          regularPage: page,
        })
      );
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const fetchProducts = async (pageNum = 1, q = searchTerm) => {
    const keyword = (q || "").trim();
    if (!keyword) {
      setItems([]);
      setTotal(0);
      setPage(1);
      return;
    }
    setLoading(true);
    try {
      const start = (pageNum - 1) * PER_PAGE + 1;
      const res = await axios.get("/.netlify/functions/naver-shop", {
        params: { query: keyword, display: PER_PAGE, start, sort: "sim" },
      });
      if (res.status !== 200 || !Array.isArray(res.data?.items)) {
        console.warn("NAVER API ERROR:", res.status, res.data);
        alert(`네이버 API 오류: ${res.status} ${res.data?.errorMessage || ""}`);
        setItems([]);
        setTotal(0);
        setPage(1);
        return;
      }
      setItems(res.data.items || []);
      setTotal(res.data.total || 0);
      setPage(pageNum);
    } catch (e) {
      console.error("네이버 API 프록시 오류:", e);
      setItems([]);
      setTotal(0);
      setPage(1);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const q = (tempQuery || "").trim();
    setSearchTerm(q);       // 부모에 제출 검색어 저장 → 두 탭 동기화
    fetchProducts(1, q);    // 즉시 검색
  };

  // 탭 이동/검색어 변경 시 마지막 검색어로 자동 재검색
  useEffect(() => {
    if (!searchTerm) {
      setItems([]);
      setTotal(0);
      setPage(1);
      return;
    }
    fetchProducts(page, searchTerm); // 저장된 페이지로 바로 복원
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, activeTab]);

  const pages = Math.min(10, Math.ceil(total / PER_PAGE));

  return (
    <div className="rp-wrap">
      <form onSubmit={onSubmit}>
        <PriceCheckHeader
          title="시세 둘러보기"
          value={tempQuery}
          onChange={setTempQuery}
          placeholder="상품명을 입력해 주세요"
        />
      </form>

      <div className="tabbar">
        <button className="tab active">
          정가 시세 보기
          {searchTerm && total ? ` ${total.toLocaleString()}` : ""}
        </button>
        <button className="tab muted" onClick={() => setActiveTab("used")}>
          중고 시세 보기
        </button>
      </div>

      <div className="list-area">
        {!searchTerm ? null : (
          <>
            {loading && <p className="hint">불러오는 중…</p>}
            {!loading && items.length === 0 && <p className="hint">검색 결과가 없습니다.</p>}

            {items.map((it, i) => (
              <article key={i} className="card">
                <div className="thumb"><img src={it.image} alt="" /></div>
                <div className="info">
                  <h3 className="name" dangerouslySetInnerHTML={{ __html: it.title }} />
                  <div className="price">최저 {Number(it.lprice).toLocaleString()}원</div>
                  <div className="meta">
                    {it.category1}{it.category2 ? ` > ${it.category2}` : ""}{it.brand ? ` · ${it.brand}` : ""}
                  </div>
                  <a className="link" href={it.link} target="_blank" rel="noopener noreferrer">바로가기</a>
                </div>
              </article>
            ))}

            {items.length > 0 && pages > 1 && (
              <div className="pagination">
                <button className="nav" disabled={page === 1} onClick={() => fetchProducts(page - 1, searchTerm)}>‹</button>
                {Array.from({ length: pages }, (_, k) => k + 1).map((n) => (
                  <button key={n} className={`page ${page === n ? "active" : ""}`} onClick={() => fetchProducts(n, searchTerm)}>
                    {n}
                  </button>
                ))}
                <button className="nav" disabled={page === pages} onClick={() => fetchProducts(page + 1, searchTerm)}>›</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
