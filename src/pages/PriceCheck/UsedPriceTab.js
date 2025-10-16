import "../../styles/PriceCheck/UsedPriceTab.css";

export default function UsedPriceTab({ activeTab, setActiveTab }) {
  return (
    <div className="used-price-container">
      <div className="tabbar">
        <button className="tab muted" onClick={() => setActiveTab("regular")}>정가 시세 보기</button>
        <button className="tab active">중고 시세 보기</button>
      </div>

      <div className="used-placeholder">
        <h2 className="title">중고 시세 보기</h2>
        <p>추후 자체 데이터 기반으로 중고 시세가 제공됩니다.</p>
      </div>
    </div>
  );
}
