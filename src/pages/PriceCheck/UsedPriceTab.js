import { useMemo, useState } from "react";
import PriceCheckHeader from "../../components/pricecheck/PriceCheckHeader";
import ipadImg from "../../assets/img/PriceCheck/ipadpro.png";
import "../../styles/PriceCheck/UsedPriceTab.css";

const MOCK = Array.from({ length: 10 }).map((_, i) => ({
  id: i + 1,
  status: i % 2 === 0 ? "경매 진행 중" : "낙찰 완료",
  title: "Apple 아이패드 프로 12.9 6세대 M2 스페이스 그레이 128GB, WiFi전용",
  category: "디지털/가전 > 태블릿PC",
  spec:
    "화면크기 : 32.77cm(12.9인치) | 해상도 : 2732 x 2048 | 메모리 : 8GB | 저장용량 : 128GB | 칩셋 : M2 | 운영체제 : iPadOS | 디스플레이 : 미니LED | 주사율 : 120Hz | 생체인식 : 페이스ID",
  image: ipadImg,
  startPrice: 1000000,
  currentPrice: 1899990,
  finalPrice: 2106000,
}));

export default function UsedPriceTab({ activeTab, setActiveTab }) {
  // 입력 중 값
  const [tempQuery, setTempQuery] = useState("");
  // 제출된 검색어 (이 값이 있을 때만 결과를 보여줌)
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const PER_PAGE = 5;

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return [];
    return MOCK.filter(
      (x) =>
        x.title.toLowerCase().includes(q) ||
        x.category.toLowerCase().includes(q) ||
        x.spec.toLowerCase().includes(q)
    );
  }, [searchTerm]);

  const total = filtered.length;
  const totalPages = total > 0 ? Math.ceil(total / PER_PAGE) : 0;
  const slice =
    total > 0 ? filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE) : [];

  const onSubmit = (e) => {
    e.preventDefault();
    setSearchTerm(tempQuery);
    setPage(1);
  };

  return (
    <div className="used-wrap">
      {/* ✅ 공용 헤더: Enter / Q 버튼으로 제출 */}
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
          중고 시세 보기{total ? ` ${total.toLocaleString()}` : ""}
        </button>
      </div>

      {/* 본문 */}
      <div className="used-list-area">
        {/* 검색어가 비었거나 결과가 없으면 동일 문구 표시 */}
        {(!searchTerm.trim() || total === 0) && (
          <p className="used-hint">검색 결과가 없습니다.</p>
        )}

        {/* 검색어가 있으며 결과가 있을 때만 카드 출력 */}
        {searchTerm.trim() && total > 0 && (
          <>
            {slice.map((it) => (
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
                    <span className="used-brand">Apple</span>
                    <span className="used-auth">Authorized Reseller</span>
                  </div>

                  <h3 className="used-name">{it.title}</h3>
                  <div className="used-meta">{it.category}</div>
                  <p className="used-spec">{it.spec}</p>

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
                  onClick={() => setPage(page - 1)}
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
                  onClick={() => setPage(page + 1)}
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

function fmt(n) {
  return n.toLocaleString("ko-KR") + "원";
}
