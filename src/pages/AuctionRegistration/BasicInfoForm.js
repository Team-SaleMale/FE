import React, { memo } from "react";
import styles from "../../styles/AuctionRegistration/BasicInfoForm.module.css";

/**
 * 경매 글 등록 섹션
 * - 제목/내용 입력
 * - 제목은 상위 상태로 올려 PreviewCard에 즉시 반영됨
 */
function BasicInfoForm({ title = "", description = "", onChange }) {
  const handleTitle = (e) => onChange?.("title", e.target.value);
  const handleDesc = (e) => onChange?.("description", e.target.value);

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h2 className={styles.h2}>경매 글 등록</h2>
        <p className={styles.helper}>경매 글 미리보기 화면을 오른쪽에서 확인하세요!!</p>
      </div>

      {/* 제목 */}
      <div className={styles.field}>
        <label className={styles.label} htmlFor="ar-title">
          제목 <span className={styles.required}>*</span>
        </label>
        <input
          id="ar-title"
          type="text"
          className={styles.input}
          placeholder="제목을 입력하세요."
          value={title}
          onChange={handleTitle}
          autoComplete="off"
        />
      </div>

      {/* 내용 - 고정 높이 + 내부 스크롤 */}
      <div className={styles.field}>
        <label className={styles.label} htmlFor="ar-desc">
          내용
        </label>
        <textarea
          id="ar-desc"
          className={`${styles.input} ${styles.textarea}`}
          placeholder="제품에 대한 상세 설명을 입력하세요."
          value={description}
          onChange={handleDesc}
        />
      </div>
    </div>
  );
}

export default memo(BasicInfoForm);
