import { Icon } from "@iconify/react";
import styles from "../../styles/AuctionProductDetails/CautionList.module.css";

const ITEMS = [
  {
    icon: "solar:shield-check-linear",
    title: "안전결제 필수",
    desc: "ValueBid 안전결제만 사용해 주세요. 외부 링크/계좌 유도는 신고 대상입니다.",
  },
  {
    icon: "solar:forbidden-circle-linear",
    title: "입찰 후 취소 불가",
    desc: "입찰은 계약의사 표시입니다. 신중히 금액을 입력해 주세요.",
  },
  {
    icon: "solar:card-2-linear",
    title: "수수료 안내",
    desc: "결제·정산 시 플랫폼 수수료가 적용될 수 있습니다. 세부 요율은 정책을 확인하세요.",
  },
  {
    icon: "solar:tag-price-linear",
    title: "거래 방식",
    desc: "직거래/택배거래 조건(장소, 배송비, 검수 범위)을 반드시 확인하세요.",
  },
  {
    icon: "solar:danger-triangle-linear",
    title: "허위/일괄 금지",
    desc: "허위 정보, 일괄판매 유도 등 규정 위반 시 제재될 수 있습니다.",
  },
];

export default function CautionList() {
  return (
    <section className={styles.card} aria-labelledby="caution-title">
      <div className={styles.header}>
        <h3 id="caution-title" className={styles.title}>
          경매 시 주의점
        </h3>
        <span className={styles.badge} aria-label="필독">필독</span>
      </div>

      <ul className={styles.table} role="list">
        {ITEMS.map((it, i) => (
          <li key={i} className={styles.row}>
            <div className={styles.lhs}>
              <span className={styles.iconWrap} aria-hidden="true">
                <Icon icon={it.icon} className={styles.icon} />
              </span>
              <span className={styles.rowTitle}>{it.title}</span>
            </div>
            <p className={styles.rhs}>{it.desc}</p>
          </li>
        ))}
      </ul>

      <div className={styles.footerHint} title="자세한 정책 보기">
       /safety 안전정책에서 확인할 수 있습니다.
      </div>
    </section>
  );
}

