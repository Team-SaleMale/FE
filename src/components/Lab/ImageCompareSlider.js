// src/components/Lab/ImageCompareSlider.jsx
import React, { useState } from "react";

function ImageCompareSlider({ beforeLabel = "Before", afterLabel = "After" }) {
  const [value, setValue] = useState(50);

  const handleChange = (e) => {
    setValue(Number(e.target.value));
  };

  return (
    <div className="lab-compare">
      <div className="lab-compare-inner">
        <div className="lab-compare-before">
          <div className="lab-compare-image lab-compare-image--before">
            <span className="lab-compare-label">{beforeLabel}</span>
          </div>
        </div>
        <div className="lab-compare-after" style={{ width: `${value}%` }}>
          <div className="lab-compare-image lab-compare-image--after">
            <span className="lab-compare-label">{afterLabel}</span>
          </div>
        </div>
        <div className="lab-compare-handle" style={{ left: `${value}%` }}>
          <div className="lab-compare-handle-line" />
          <div className="lab-compare-handle-dot" />
        </div>
      </div>

      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={handleChange}
        className="lab-compare-range"
      />
    </div>
  );
}

export default ImageCompareSlider;
