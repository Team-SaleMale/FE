import "../../styles/common/Footer.css";

export default function Footer() {
  return (
    <footer className="vb-footer">
      <div className="vb-footer__inner">
        <div className="vb-footer__title">valueBid</div>
        <div className="vb-footer__subtitle">경매 화이팅</div>
        <div className="vb-footer__grid">
          <span>상호명 살래?말래?</span>
          <span>대표자 정준영</span>
          <span>사업자 등록번호 2023121033</span>
          <span>주소 경기도 고양시 항공대학로76</span>
          <span>전화번호 010-4276-4930</span>
          <span>개인정보보호책임자 김예나(kimyena4930@kau.kr)</span>
          <span>입금 계좌 농협 356-1234-5678</span>
        </div>
      </div>
    </footer>
  );
}
