// src/pages/PriceCheck/PriceCheck.js
import { useEffect, useState } from "react";
import RegularPriceTab from "./RegularPriceTab";
import UsedPriceTab from "./UsedPriceTab";
import "../../styles/PriceCheck/PriceCheck.css";

const SS_KEY = "pricecheck:lastState";

export default function PriceCheck() {
  // ① 세션에서 초기값 복원
  const loadSS = () => {
    try {
      const raw = sessionStorage.getItem(SS_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };
  const saved = loadSS();

  const [activeTab, setActiveTab] = useState(saved?.activeTab || "regular");
  const [tempQuery, setTempQuery] = useState(saved?.tempQuery || "");
  const [searchTerm, setSearchTerm] = useState(saved?.searchTerm || "");

  // ② 바뀔 때마다 세션에 저장 (페이지는 각 탭이 저장)
  useEffect(() => {
    try {
      const prev = loadSS() || {};
      sessionStorage.setItem(
        SS_KEY,
        JSON.stringify({
          ...prev,
          activeTab,
          tempQuery,
          searchTerm,
        })
      );
    } catch {}
  }, [activeTab, tempQuery, searchTerm]);

  return (
    <div className="pricecheck-wrapper">
      <div className="tab-content">
        {activeTab === "regular" ? (
          <RegularPriceTab
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            tempQuery={tempQuery}
            setTempQuery={setTempQuery}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        ) : (
          <UsedPriceTab
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            tempQuery={tempQuery}
            setTempQuery={setTempQuery}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        )}
      </div>
    </div>
  );
}
