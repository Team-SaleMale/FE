import React, { useMemo, useState } from "react";
import styles from "../../styles/AuctionRegistration/PolicyConsent.module.css";

/** 섹션 아이템 정의 */
const CONSENT_ITEMS = [
  {
    key: "policy",
    title: "상품 관련",
    desc: "정품 및 진실성 보장, 상품 설명의 정확성",
  },
  {
    key: "info",
    title: "경매 운영",
    desc: "입찰 취소 불가, 낙찰자 확정 의무",
  },
  {
    key: "shipping",
    title: "거래 및 발송",
    desc: "발송 기한 준수, 직거래 시 규칙 준수, 안전결제(에스크로) 필수",
  },
  {
    key: "fees",
    title: "수수료 및 제재",
    desc: "수수료 정책, 규칙 위반 시 제재",
  },
];

/**
 * PolicyConsent
 * props:
 *  - value: { policy, info, shipping, fees }
 *  - onChange: (key, bool) => void
 */
export default function PolicyConsent({ value = {}, onChange }) {
  const [openKey, setOpenKey] = useState(null);

  const checks = useMemo(
    () => ({
      policy: !!value.policy,
      info: !!value.info,
      shipping: !!value.shipping,
      fees: !!value.fees,
    }),
    [value]
  );

  const toggle = (k) => {
    onChange?.(k, !checks[k]);
  };

  const openDetail = (k) => setOpenKey(k);
  const closeDetail = () => setOpenKey(null);

  const currentItem = CONSENT_ITEMS.find((i) => i.key === openKey);

  return (
    <div className={styles.wrap}>
      <h2 className={styles.title}>정책 동의</h2>

      <ul className={styles.list}>
        {CONSENT_ITEMS.map((item) => (
          <li key={item.key} className={styles.row}>
            <button
              type="button"
              className={styles.check}
              aria-pressed={checks[item.key]}
              onClick={() => toggle(item.key)}
            >
              {/* 원형 체크박스 (CSS로 렌더) */}
              <span className={styles.dot} data-active={checks[item.key]} />
            </button>

            <div
              className={styles.textArea}
              onClick={() => toggle(item.key)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && toggle(item.key)}
            >
              <div className={styles.rowTitle}>{item.title}</div>
              <div className={styles.rowDesc}>{item.desc}</div>
            </div>

            <button type="button" className={styles.detailBtn} onClick={() => openDetail(item.key)}>
              자세히 보기
            </button>
          </li>
        ))}
      </ul>

      {/* 상세 모달 (더미 내용) */}
      {openKey && (
        <div className={styles.modalOverlay} onClick={closeDetail}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {currentItem?.title} 정책
              </h3>
              <button type="button" className={styles.modalClose} onClick={closeDetail} aria-label="닫기">
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <p>
                본 항목은 더미 텍스트입니다. 실제 정책 전문이 연결되기 전까지 예시로 사용됩니다.
              </p>
              <ul className={styles.dummyList}>
                <li>① 위반 시 경고, 이용 제한 등 조치가 적용될 수 있습니다.</li>
                <li>② 허위·과장 정보 기재 금지, 사실에 근거한 설명 제공.</li>
                <li>③ 거래·발송 지연 최소화 및 안전결제(에스크로) 권장.</li>
                <li>④ 수수료는 공지 기준에 따라 부과될 수 있습니다.</li>
              </ul>
              <p>
                자세한 내용은 서비스 이용약관 및 운영정책 페이지에서 확인해 주세요.
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button type="button" className={styles.modalPrimary} onClick={closeDetail}>
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
