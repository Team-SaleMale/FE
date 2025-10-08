import React from "react";
import { Icon } from "@iconify/react";
import styles from "../../styles/Main/CompanyIntro.module.css";

export default function CompanyIntro() {
  return (
    <section className={styles.wrap} aria-labelledby="company-intro-title">
      <div className={styles.inner}>
        <header className={styles.header}>
          <span className={styles.badge}>About ValueBid</span>
          <h2 id="company-intro-title" className={styles.title}>
            중고 거래의 새로운 표준, <strong>ValueBid</strong>
          </h2>
          <p className={styles.subtitle}>
            투명한 입찰, 안전한 결제, 검증된 셀러. 지역 기반 경매로
            가치와 신뢰를 연결합니다.
          </p>
        </header>

        <ul className={styles.grid} role="list">
          <li className={styles.card}>
            <div className={styles.iconWrap}>
              <Icon icon="solar:shield-check-linear" width="28" height="28" />
            </div>
            <h3 className={styles.cardTitle}>안전 보증</h3>
            <p className={styles.cardDesc}>
              에스크로 기반 안전결제와 분쟁 대응 프로세스로
              거래 리스크를 최소화합니다.
            </p>
          </li>
          <li className={styles.card}>
            <div className={styles.iconWrap}>
              <Icon icon="solar:graph-up-linear" width="28" height="28" />
            </div>
            <h3 className={styles.cardTitle}>가격 신뢰성</h3>
            <p className={styles.cardDesc}>
              실거래가와 유사 입찰 이력 기반의 가격 가이드를 제공해
              합리적인 낙찰을 돕습니다.
            </p>
          </li>
          <li className={styles.card}>
            <div className={styles.iconWrap}>
              <Icon icon="solar:map-point-linear" width="28" height="28" />
            </div>
            <h3 className={styles.cardTitle}>로컬 커뮤니티</h3>
            <p className={styles.cardDesc}>
              지역 중심 카테고리와 만남 장소 추천으로
              빠르고 편한 직거래 환경을 제공합니다.
            </p>
          </li>
        </ul>

        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statValue}>98.7%</span>
            <span className={styles.statLabel}>거래 만족도</span>
          </div>
          <div className={styles.divider} aria-hidden="true" />
          <div className={styles.statItem}>
            <span className={styles.statValue}>24h</span>
            <span className={styles.statLabel}>평균 낙찰 소요</span>
          </div>
          <div className={styles.divider} aria-hidden="true" />
          <div className={styles.statItem}>
            <span className={styles.statValue}>#1</span>
            <span className={styles.statLabel}>로컬 경매 만족도</span>
          </div>
        </div>

        <div className={styles.ctaRow}>
          <a className={styles.primaryBtn} href="/company">
            회사 소개 보기
            <Icon icon="solar:arrow-right-up-linear" width="18" height="18" />
          </a>
          <a className={styles.secondaryBtn} href="/safety">
            안전정책
          </a>
        </div>
      </div>
    </section>
  );
}
