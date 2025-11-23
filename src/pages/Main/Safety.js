// src/pages/Main/Safety.js
import React from "react";
import styles from "../../styles/Main/Safety.module.css";

export default function Safety() {
  return (
    <main className={styles.page} aria-label="ValueBid Safety Policy">
      <section className={styles.hero}>
        <p className={styles.kicker}>Safety Policy</p>
        <h1 className={styles.title}>ValueBid 안전 정책</h1>
        <p className={styles.subtitle}>
          투명한 입찰, 안전한 결제, 검증된 셀러를 중심으로 사용자의 자산과
          거래 경험을 보호합니다. 아래 원칙은 ValueBid에서 진행되는 모든
          경매와 거래에 공통으로 적용됩니다.
        </p>
      </section>

      {/* 3개의 요약 카드 */}
      <section className={styles.summaryGrid}>
        <article className={styles.summaryCard}>
          <h2>에스크로 기반 안전 결제</h2>
          <p>
            모든 거래 대금은 먼저 ValueBid 에스크로 계정에 예치되며,
            구매자가 수령 완료를 확인한 뒤에만 판매자에게 정산됩니다.
          </p>
          <ul>
            <li>구매자·판매자 모두를 보호하는 안전 결제 구조</li>
            <li>분쟁 발생 시 정산 보류 후 사실 관계 검토</li>
          </ul>
        </article>

        <article className={styles.summaryCard}>
          <h2>가격 신뢰성 &amp; 시세 데이터</h2>
          <p>
            실거래가와 유사 입찰 이력을 기반으로 가격 가이드와 시세 정보를
            제공합니다. 과도하게 왜곡된 가격은 모니터링 대상이 됩니다.
          </p>
          <ul>
            <li>최근 거래 이력 기반 시세·가격 데이터 제공</li>
            <li>비정상 가격·반복 취소 패턴 자동 감지</li>
          </ul>
        </article>

        <article className={styles.summaryCard}>
          <h2>거래 분쟁 대응 &amp; 고객 보호</h2>
          <p>
            배송, 상품 상태, 결제와 관련한 문의가 접수되면 기록된 로그와
            증빙을 기준으로 신속하게 처리합니다.
          </p>
          <ul>
            <li>거래 단계별 로그와 메시지 기록 보관</li>
            <li>사기·악성 이용자에 대한 선제적 제재</li>
          </ul>
        </article>
      </section>

      {/* 상세 정책 */}
      <section className={styles.section}>
        <h2>1. 에스크로 기반 안전 결제</h2>
        <ul>
          <li>
            모든 결제 금액은 ValueBid 에스크로 계정에 우선 예치되며,{" "}
            <strong>구매자의 수령 확인</strong> 이후에만 판매자에게 정산됩니다.
          </li>
          <li>
            배송 지연, 파손, 미수령 등 분쟁이 발생할 경우, 정산이 보류된
            상태에서 양측의 소명과 증빙 자료를 바탕으로 처리합니다.
          </li>
          <li>
            결제/환불/정산과 관련된 모든 로그는 일정 기간 안전하게 보관되어,
            마이페이지에서 이력을 조회할 수 있습니다.
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>2. 가격 신뢰성과 시세 검증</h2>
        <ul>
          <li>
            최근 실거래가, 유사 입찰 이력, 외부 시세 데이터를 통합해{" "}
            <strong>가격 가이드</strong>를 제공하며, 사용자는 시세 대비 합리적인
            입찰 여부를 판단할 수 있습니다.
          </li>
          <li>
            시세 대비 과도하게 높거나 낮은 가격, 반복적인 입찰 취소, 동일 IP
            간 담합 패턴 등은 실시간 모니터링 대상이 됩니다.
          </li>
          <li>
            시세 조작이나 허위 거래 내역 생성이 확인될 경우, 해당 계정은
            경고·일시 정지·영구 이용 제한 등 단계별 제재를 받을 수 있습니다.
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>3. 안전한 경매·거래 프로세스</h2>
        <ul>
          <li>
            각 경매에는 시작가, 즉시 구매가, 입찰 단위, 마감 시간이 명확히
            표시되며, 사용자는 동일한 정보에 기반해 입찰합니다.
          </li>
          <li>
            시스템 장애·명백한 오입찰을 제외한 악의적인 입찰 취소는 제재 대상이
            되며, 거래 상대방 보호를 위해 일정 기간 입찰 제한이 적용될 수
            있습니다.
          </li>
          <li>
            낙찰 후 결제, 배송, 수령 확인까지의 <strong>전체 진행 상태</strong>가
            단계별로 기록되어, 마이페이지에서 한눈에 확인 가능합니다.
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>4. 금지 품목 및 부정 행위</h2>
        <ul>
          <li>
            법령·약관에 따라 위조품, 불법 복제물, 청소년 유해 물품, 개인정보가
            포함된 자료 등은 등록이 <strong>즉시 금지</strong>됩니다.
          </li>
          <li>
            셀러·바이어 간 담합 입찰, 허위 계정 생성, 반복적인 시세 조작 시도는
            사전 고지 없이 경매 중단 및 계정 제한 조치가 이루어질 수 있습니다.
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>5. 이용자 보호 &amp; 신고 시스템</h2>
        <ul>
          <li>
            프로필, 거래 횟수, 리뷰 등을 기반으로 <strong>거래 신뢰도</strong>를
            제공하며, 거래 전에 상대방의 기록을 확인할 수 있습니다.
          </li>
          <li>
            사기 의심, 욕설·혐오 표현, 약관 위반이 발생할 경우, 신고 기능을 통해
            전담 팀에 접수할 수 있으며 처리 결과는 알림으로 안내됩니다.
          </li>
          <li>
            반복 신고 및 이상 행동 패턴을 분석해, 사전에 위험 계정을 차단하기
            위한 모니터링을 진행합니다.
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>6. 개인정보 &amp; 보안</h2>
        <ul>
          <li>
            비밀번호 및 민감 정보는 암호화되어 저장되며, 실제 결제 정보는
            인증된 PG사를 통해 처리됩니다.
          </li>
          <li>
            거래 상대방에게는 거래에 필요한 최소한의 정보만 제공되며, 개인 연락
            용도의 연락처 공유를 지양합니다.
          </li>
          <li>
            의심스러운 로그인, 다중 기기 접속, 비정상 트래픽이 감지될 경우
            추가 인증 또는 보안 알림을 통해 계정을 보호합니다.
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>7. 오프라인 직거래 시 주의사항</h2>
        <ul>
          <li>가능한 한 에스크로가 적용되는 배송 거래를 우선적으로 권장합니다.</li>
          <li>
            부득이하게 직거래 시에는 사람이 많은 공개 장소에서 만나고, 현금보다는
            이체·앱 결제로 거래 이력을 남겨 주세요.
          </li>
          <li>
            고가 제품은 수령 즉시 상태를 확인하고, 문제가 있다면 바로 ValueBid
            고객센터로 신고해 주시기 바랍니다.
          </li>
        </ul>
      </section>

      <footer className={styles.footer}>
        <p>
          ValueBid는 더 안전한 중고 경매 문화를 위해 위 정책을 지속적으로
          업데이트합니다.
        </p>
      </footer>
    </main>
  );
}
