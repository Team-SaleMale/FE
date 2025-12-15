// src/pages/Lab/LabProductAnalysis.jsx

import React, { useState } from "react";
import { requestProductAnalysis } from "../../api/experimental/service";
import LabModeTabs from "../../components/Lab/LabModeTabs";
import "../../styles/Lab/Lab.css";

const LabProductAnalysis = () => {
  const [productName, setProductName] = useState("");
  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productName.trim()) return;

    setLoading(true);
    setError("");
    setReport("");

    try {
      const response = await requestProductAnalysis(productName);
      console.log("상품 분석 응답:", response);

      const reportText =
        response?.data?.result?.report ??
        response?.data?.report ??
        response?.result?.report ??
        response?.report ??
        "";

      setReport(reportText || "분석 결과를 불러오지 못했습니다.");
    } catch (err) {
      console.error(err);
      setError("상품 분석 요청 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lab-page">
      {/* 상단 탭 */}
      <LabModeTabs active="product" />

      {/* 헤더 */}
      <header className="lab-header lab-header--compact">
        <div className="lab-title-wrap">
          <h1 className="lab-title">상품 분석</h1>
          <span className="lab-badge">EXPERIMENTAL</span>
        </div>
        <p className="lab-subtitle">
          특정 상품명을 입력하면 예상 가치와 1~3년 추세를 AI가 텍스트로 분석해 드립니다.
        </p>
      </header>

      {/* 메인 카드 레이아웃 */}
      <div className="lab-analysis-layout">
        {/* 입력 카드 */}
        <section className="lab-card lab-card--primary">
          <form className="lab-form lab-form--horizontal" onSubmit={handleSubmit}>
            <div className="lab-form-row">
              <label className="lab-label">
                <span className="lab-label-text">상품 이름</span>
                <input
                  className="lab-input"
                  type="text"
                  placeholder="예: 나이키 덩크 로우 판다 270"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                />
              </label>

              <button
                className="lab-button lab-button--primary"
                type="submit"
                disabled={loading || !productName.trim()}
              >
                {loading ? "분석 중..." : "상품 분석하기"}
              </button>
            </div>
          </form>

          <p className="lab-hint">
            예시) <span>뉴발란스 530 회색 240</span>,{" "}
            <span>스톤아일랜드 쉐도우 프로젝트 후드 XL</span>
          </p>

          {error && <p className="lab-error">{error}</p>}
        </section>

        {/* 결과 카드 */}
        {report && (
          <section className="lab-card lab-card--result">
            <h2 className="lab-result-title">분석 결과</h2>
            <pre className="lab-result-content">{report}</pre>
          </section>
        )}
      </div>
    </div>
  );
};

export default LabProductAnalysis;
