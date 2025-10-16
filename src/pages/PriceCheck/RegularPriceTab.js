import { useState } from "react";
import axios from "axios";
import "../../styles/PriceCheck/RegularPriceTab.css";

export default function RegularPriceTab({ activeTab, setActiveTab }) {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const PER_PAGE = 10;

  const fetchProducts = async (pageNum = 1) => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const start = (pageNum - 1) * PER_PAGE + 1;
      const res = await axios.get("https://openapi.naver.com/v1/search/shop.json", {
        params: { query, display: PER_PAGE, start, sort: "sim" },
        headers: {
          "X-Naver-Client-Id": import.meta.env.VITE_NAVER_CLIENT_ID,
          "X-Naver-Client-Secret": import.meta.env.VITE_NAVER_CLIENT_SECRET,
        },
      });
      setItems(res.data.items || []);
      setTotal(res.data.total || 0);
      setPage(pageNum);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    fetchProducts(1);
  };

  const pages = Math.min(10, Math.ceil(total / PER_PAGE));

  return (
    <div className="rp-wrap">
      <div className="heading-row">
        <h2 className="title">시세 둘러보기</h2>
        <form className="search" onSubmit={onSubmit}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="상품명을 입력해 주세요"
          />
          <button type="submit" aria-label="search">Q</button>
        </form>
      </div>

      <div className="tabbar">
        <button className="tab active">
          정가 시세 보기{total ? ` ${total.toLocaleString()}` : ""}
        </button>
        <button className="tab muted" onClick={() => setActiveTab("used")}>
          중고 시세 보기
        </button>
      </div>

      <div className="list-area">
        {loading && <p className="hint">불러오는 중…</p>}
        {!loading && items.length === 0 && <p className="hint">검색 결과가 없습니다.</p>}

        {items.map((it, i) => (
          <article key={i} className="card">
            <div className="thumb"><img src={it.image} alt="" /></div>
            <div className="info">
              <h3 className="name" dangerouslySetInnerHTML={{ __html: it.title }} />
              <div className="price">최저 {Number(it.lprice).toLocaleString()}원</div>
              <div className="meta">
                {it.category1} {it.category2 ? `> ${it.category2}` : ""} {it.brand ? `· ${it.brand}` : ""}
              </div>
              <a className="link" href={it.link} target="_blank" rel="noopener noreferrer">바로가기</a>
            </div>
          </article>
        ))}

        {items.length > 0 && pages > 1 && (
          <div className="pagination">
            <button className="nav" disabled={page === 1} onClick={() => fetchProducts(page - 1)}>‹</button>
            {Array.from({ length: pages }, (_, k) => k + 1).map((n) => (
              <button key={n} className={`page ${page === n ? "active" : ""}`} onClick={() => fetchProducts(n)}>
                {n}
              </button>
            ))}
            <button className="nav" disabled={page === pages} onClick={() => fetchProducts(page + 1)}>›</button>
          </div>
        )}
      </div>
    </div>
  );
}
