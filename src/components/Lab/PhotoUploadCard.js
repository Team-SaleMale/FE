// src/components/Lab/PhotoUploadCard.jsx
import React, { useRef, useState } from "react";

function PhotoUploadCard({ label, description, multiple = false }) {
  const inputRef = useRef(null);
  const [previews, setPreviews] = useState([]);

  const handleClick = () => {
    if (inputRef.current) inputRef.current.click();
  };

  const handleChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const nextPreviews = files.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));
    setPreviews(nextPreviews);
  };

  return (
    <div className="lab-upload-card">
      <div className="lab-upload-header">
        <h3 className="lab-upload-label">{label}</h3>
        {description && <p className="lab-upload-desc">{description}</p>}
      </div>

      <div className="lab-upload-dropzone" onClick={handleClick}>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          style={{ display: "none" }}
          onChange={handleChange}
        />
        <div className="lab-upload-placeholder">
          <span className="lab-upload-icon">📷</span>
          <span className="lab-upload-text">
            이미지를 여기로 끌어오거나 클릭해서 업로드하세요.
          </span>
        </div>
      </div>

      {previews.length > 0 && (
        <div className="lab-upload-preview-list">
          {previews.map((p) => (
            <div key={p.url} className="lab-upload-preview-item">
              <img src={p.url} alt={p.name} className="lab-upload-preview-img" />
              <span className="lab-upload-preview-name">{p.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PhotoUploadCard;
