// src/pages/Lab/LabProductAnalysis.jsx

import React, { useState } from "react";
import { requestProductAnalysis } from "../../api/experimental/service";
import "../../styles/Lab/Lab.css"; // 이미 쓰고 있는 lab 스타일 있으면 그대로 사용

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

      // response 모양이 어떻게 오든 다 커버
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
      <header className="lab-header">
        <div className="lab-title-wrap">
          <h1 className="lab-title">상품 분석</h1>
          <span className="lab-badge">EXPERIMENTAL</span>
        </div>
        <p className="lab-subtitle">
          특정 상품명을 입력하면 예상 가치와 1~3년 추세를 텍스트로 제공합니다.
        </p>
      </header>

      <form className="lab-form" onSubmit={handleSubmit}>
        <label className="lab-label">
          상품 이름
          <input
            className="lab-input"
            type="text"
            placeholder="예: 나이키 덩크 로우 판다 270"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
          />
        </label>
        <button className="lab-button" type="submit" disabled={loading}>
          {loading ? "분석 중..." : "상품 분석하기"}
        </button>
      </form>

      {error && <p className="lab-error">{error}</p>}

      {report && (
        <section className="lab-result">
          <h2 className="lab-result-title">분석 결과</h2>
          <pre className="lab-result-content">{report}</pre>
        </section>
      )}
    </div>
  );
};

export default LabProductAnalysis;
