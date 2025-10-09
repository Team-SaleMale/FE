import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

/**
 * AuctionList (진입점)
 * - 기본 뷰: 가로형(list)
 * - 내부 토글 버튼으로 list ↔ grid 전환 (URL 쿼리 layout 유지)
 * - 이후 Horizontal/Vertical, Toolbar, FilterSidebar 등을 붙이면 됨
 */
export default function AuctionList() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const layout = (params.get("layout") || "list").toLowerCase();
  const isGrid = layout === "grid";

  const toggleLayout = () => {
    const next = isGrid ? "list" : "grid";
    const p = new URLSearchParams(params);
    p.set("layout", next);
    navigate(`/auctionlist?${p.toString()}`, { replace: true });
  };

  return (
    <section style={{ padding: "24px" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ margin: 0 }}>경매 리스트</h1>
        <button onClick={toggleLayout}>
          {isGrid ? "리스트형으로 보기" : "그리드형으로 보기"}
        </button>
      </header>

      <hr style={{ margin: "16px 0" }} />

      {/* TODO: 여기에 Toolbar / FilterSidebar / Horizontal or Vertical 컴포넌트를 추가 */}
      <div>
        <p style={{ margin: 0 }}>
          현재 레이아웃: <strong>{isGrid ? "grid(세로형)" : "list(가로형)"}</strong>
        </p>
        <div
          style={{
            marginTop: 12,
            padding: 16,
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            background: "#fff",
          }}
        >
          목록 UI는 추후에 연결합니다.
        </div>
      </div>
    </section>
  );
}
