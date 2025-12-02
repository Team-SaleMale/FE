// src/pages/Lab/LabBrandAnalysis.jsx

import React, { useState } from "react";
import { requestBrandAnalysis } from "../../api/experimental/service";
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
      <header className="lab-header">
        <div className="lab-title-wrap">
          <h1 className="lab-title">브랜드 분석</h1>
          <span className="lab-badge">EXPERIMENTAL</span>
        </div>
        <p className="lab-subtitle">
          명품/브랜드명을 입력하면 예상 가치와 1~3년 추세를 텍스트로 제공합니다.
        </p>
      </header>

      <form className="lab-form" onSubmit={handleSubmit}>
        <label className="lab-label">
          브랜드 이름
          <input
            className="lab-input"
            type="text"
            placeholder="예: Louis Vuitton"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
          />
        </label>
        <button className="lab-button" type="submit" disabled={loading}>
          {loading ? "분석 중..." : "브랜드 분석하기"}
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

export default LabBrandAnalysis;
