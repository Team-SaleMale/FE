// src/pages/Lab/LabBrandAnalysis.jsx

import React, { useState } from "react";
import { requestBrandAnalysis } from "../../api/experimental/service";
import LabModeTabs from "../../components/Lab/LabModeTabs";
import "../../styles/Lab/Lab.css";

const LabBrandAnalysis = () => {
  const [brandName, setBrandName] = useState("");
  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!brandName.trim()) return;

    setLoading(true);
    setError("");
    setReport("");

    try {
      const response = await requestBrandAnalysis(brandName);
      console.log("브랜드 분석 응답:", response);

      const reportText =
        response?.data?.result?.report ??
        response?.data?.report ??
        response?.result?.report ??
        response?.report ??
        "";

      setReport(reportText || "분석 결과를 불러오지 못했습니다.");
    } catch (err) {
      console.error(err);
      setError("브랜드 분석 요청 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lab-page">
      {/* 상단 탭 */}
      <LabModeTabs active="brand" />

      {/* 헤더 */}
      <header className="lab-header lab-header--compact">
        <div className="lab-title-wrap">
          <h1 className="lab-title">브랜드 분석</h1>
          <span className="lab-badge">EXPERIMENTAL</span>
        </div>
        <p className="lab-subtitle">
          명품/브랜드명을 입력하면 예상 가치와 1~3년 추세를 AI가 텍스트로 분석해 드립니다.
        </p>
      </header>

      {/* 메인 카드 레이아웃 */}
      <div className="lab-analysis-layout">
        {/* 입력 카드 */}
        <section className="lab-card lab-card--primary">
          <form className="lab-form lab-form--horizontal" onSubmit={handleSubmit}>
            <label className="lab-label lab-label--block">
              <span className="lab-label-text">브랜드 이름</span>
              <input
                className="lab-input"
                type="text"
                placeholder="예: Louis Vuitton"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
              />
            </label>

            <button
              className="lab-button lab-button--primary"
              type="submit"
              disabled={loading}
            >
              {loading ? "분석 중..." : "브랜드 분석하기"}
            </button>
          </form>

          <p className="lab-hint">
            예시) <span>Louis Vuitton</span>, <span>Gucci</span>,{" "}
            <span>Stone Island</span>, <span>뉴발란스</span>
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

export default LabBrandAnalysis;
