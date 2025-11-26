// src/components/Lab/ImageCompareSlider.jsx
import React, { useState } from "react";

function ImageCompareSlider({
  beforeLabel = "Before",
  afterLabel = "After",
  beforeImage,
  afterImage,
}) {
  const [position, setPosition] = useState(50); // 0 ~ 100

  const handleChange = (e) => {
    setPosition(Number(e.target.value));
  };

  const hasImages = !!beforeImage && !!afterImage;

  // 🔥 여기서 clip-path 값만 바꿔서 "잘라서 보여주기"
  const clipPath = `polygon(0 0, ${position}% 0, ${position}% 100%, 0 100%)`;

  return (
    <div className="image-compare-slider">
      <div className="image-compare-slider__labels">
        <span className="image-compare-slider__label image-compare-slider__label--before">
          {beforeLabel}
        </span>
        <span className="image-compare-slider__label image-compare-slider__label--after">
          {afterLabel}
        </span>
      </div>

      <div className="image-compare-slider__viewport">
        {hasImages ? (
          <>
            {/* 뒤쪽: After 전체 이미지 */}
            <img
              src={afterImage}
              alt={afterLabel}
              className="image-compare-slider__image"
            />

            {/* 앞쪽: Before 이미지 (clip-path로 잘라서 보여줌) */}
            <img
              src={beforeImage}
              alt={beforeLabel}
              className="image-compare-slider__image image-compare-slider__image--before"
              style={{ clipPath }}
            />

            {/* 가운데 핸들 */}
            <div
              className="image-compare-slider__handle"
              style={{ left: `${position}%` }}
            >
              <div className="image-compare-slider__handle-line" />
              <div className="image-compare-slider__handle-dot" />
            </div>
          </>
        ) : (
          <div className="image-compare-slider__placeholder">
            비교를 위해 Before / After 이미지가 준비되면 여기에 표시됩니다.
          </div>
        )}
      </div>

      <input
        type="range"
        min="0"
        max="100"
        value={position}
        onChange={handleChange}
        className="image-compare-slider__range"
      />
    </div>
  );
}

export default ImageCompareSlider;
