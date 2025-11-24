// src/components/Lab/SectionTitle.jsx
import React from "react";

function SectionTitle({ step, title, subtitle }) {
  return (
    <div className="lab-section-title">
      {step != null && <span className="lab-section-step">STEP {step}</span>}
      <h2 className="lab-section-heading">{title}</h2>
      {subtitle && <p className="lab-section-sub">{subtitle}</p>}
    </div>
  );
}

export default SectionTitle;
