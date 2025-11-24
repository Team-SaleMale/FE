// src/components/Lab/ResultPanel.jsx
import React, { useState } from "react";
import ImageCompareSlider from "./ImageCompareSlider";

function ResultPanel({ mode }) {
  const [view, setView] = useState("before"); // before | after | compare

  const isWear = mode === "wear";
  const isDecor = mode === "decor";

  return (
    <div className="lab-result-panel">
      <div className="lab-result-header">
        <h2 className="lab-result-title">결과 미리보기</h2>
        <div className="lab-result-view-switch">
          <button
            type="button"
            className={`lab-result-view-btn ${view === "before" ? "active" : ""}`}
            onClick={() => setView("before")}
          >
            Before
          </button>
          <button
            type="button"
            className={`lab-result-view-btn ${view === "after" ? "active" : ""}`}
            onClick={() => setView("after")}
          >
            After
          </button>
          <button
            type="button"
            className={`lab-result-view-btn ${view === "compare" ? "active" : ""}`}
            onClick={() => setView("compare")}
          >
            비교
          </button>
        </div>
      </div>

      <div className="lab-result-body">
        {view === "compare" ? (
          <ImageCompareSlider
            beforeLabel="원본 이미지"
            afterLabel={isWear ? "착용 이미지 (예정)" : isDecor ? "배치 이미지 (예정)" : "After"}
          />
        ) : (
          <div className="lab-result-placeholder">
            <div className={`lab-result-image lab-result-image--${view}`}>
              <span className="lab-result-image-text">
                {view === "before"
                  ? "업로드한 원본 이미지가 여기 표시될 예정입니다."
                  : isWear
                  ? "AI가 생성한 착용 이미지가 여기 표시될 예정입니다."
                  : "AI가 생성한 배치 이미지가 여기 표시될 예정입니다."}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="lab-result-footer">
        <p className="lab-result-note">
          ※ 현재는 예시 레이아웃만 제공되며, 실제 이미지는 AI API 연동 후 표시됩니다.
        </p>
      </div>
    </div>
  );
}

export default ResultPanel;
