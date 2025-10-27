import { useState } from "react";
import RegularPriceTab from "./RegularPriceTab";
import UsedPriceTab from "./UsedPriceTab";
import "../../styles/PriceCheck/PriceCheck.css";

export default function PriceCheck() {
  const [activeTab, setActiveTab] = useState("regular");

  return (
    <div className="pricecheck-wrapper">
      <div className="tab-content">
        {activeTab === "regular" ? (
          <RegularPriceTab activeTab={activeTab} setActiveTab={setActiveTab} />
        ) : (
          <UsedPriceTab activeTab={activeTab} setActiveTab={setActiveTab} />
        )}
      </div>
    </div>
  );
}
