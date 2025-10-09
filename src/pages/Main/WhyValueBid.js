import React from "react";
import styles from "../../styles/Main/WhyValueBid.module.css";

import Dollar from "../../assets/img/Main/WhyValueBid/dollar-circle.svg";
import Shield from "../../assets/img/Main/WhyValueBid/shield-check.svg";
import FileEdit from "../../assets/img/Main/WhyValueBid/file-list-edit.svg";

const Feature = ({ icon, titleEn, titleKo, desc }) => (
  <li className={styles.card}>
    <div className={styles.iconWrap}>
      <img src={icon} alt="" className={styles.icon} />
    </div>

    <div className={styles.cardText}>
      <h3 className={styles.cardTitle}>{titleEn}</h3>
      {/* subtitle(한글) 노출 */}
      <p className={styles.cardSubTitle}>{titleKo}</p>
      <p className={styles.cardDesc}>{desc}</p>
    </div>
  </li>
);

export default function WhyValueBid() {
  return (
    <section className={styles.wrap} aria-labelledby="why-valuebid-title">
      <div className={styles.inner}>
        <h2 id="why-valuebid-title" className={styles.title}>
          Why Buyers Trust ValueBid?
        </h2>

        <ul className={styles.grid}>
          <Feature
            icon={Dollar}
            titleEn="Transparent Fees"
            titleKo="명확한 비용 구조"
            desc="숨겨진 수수료 없이 명확한 입찰과 정산"
          />
          <Feature
            icon={Shield}
            titleEn="Secure Transactions"
            titleKo="안전한 결제/보호"
            desc="안전한 결제 시스템과 구매자 보호 프로그램 제공"
          />
          <Feature
            icon={FileEdit}
            titleEn="Real-Time Bidding"
            titleKo="실시간 참여"
            desc="입찰 상황을 실시간으로 확인하고 즉시 참여 가능"
          />
        </ul>
      </div>
    </section>
  );
}
