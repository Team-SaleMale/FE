// src/components/Lab/InfoBox.jsx
import React from "react";

function InfoBox({ title, lines = [] }) {
  return (
    <div className="lab-info-box">
      {title && <h3 className="lab-info-title">{title}</h3>}
      <ul className="lab-info-list">
        {lines.map((line, idx) => (
          <li key={idx} className="lab-info-item">
            {line}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default InfoBox;
