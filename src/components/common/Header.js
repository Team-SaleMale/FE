import { Link } from "react-router-dom";
import "../../styles/common/Header.css";

export default function Header() {
  return (
    <header className="vb-header">
      <div className="vb-header__wrap">
        <div className="vb-header__container">
          {/* 왼쪽 로고 */}
          <div className="vb-left">
            <Link to="/" className="vb-brand">
              <span className="vb-brand__icon" aria-hidden>🔨</span>
              <span className="vb-brand__text">ValueBid</span>
            </Link>
          </div>

          {/* 중앙 메뉴 */}
          <nav className="vb-center">
            <Link to="/auctions" className="vb-link">경매하기</Link>
            <Link to="/videos" className="vb-link">시세 둘러보기</Link>
            <Link to="/auctions/new" className="vb-link">상품 등록</Link>
          </nav>

          {/* 오른쪽 로그인 */}
          <div className="vb-right">
            <Link to="/login" className="vb-link vb-login">로그인</Link>
          </div>
        </div>
      </div>
    </header>
  );
}
