// src/components/Lab/LabModeTabs.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

function LabModeTabs({ active }) {
  const navigate = useNavigate();

  const goHome = () => navigate("/lab");
  const goWear = () => navigate("/lab/wear");
  const goDecor = () => navigate("/lab/decor");

  return (
    <div className="lab-tabs">
      <button
        type="button"
        className={`lab-tab ${active === "home" ? "lab-tab--active" : ""}`}
        onClick={goHome}
      >
        실험실 홈
      </button>
      <button
        type="button"
        className={`lab-tab ${active === "wear" ? "lab-tab--active" : ""}`}
        onClick={goWear}
      >
        입어보기
      </button>
      <button
        type="button"
        className={`lab-tab ${active === "decor" ? "lab-tab--active" : ""}`}
        onClick={goDecor}
      >
        집에 배치해보기
      </button>
    </div>
  );
}

export default LabModeTabs;
