import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import logoBlue from "../../assets/img/header/logo_blue.png";
import "../../styles/common/Header.css";

export default function Header() {
  const user = { name: "사용자" };

  const [openBell, setOpenBell] = useState(false);
  const [openUser, setOpenUser] = useState(false);

  const bellRef = useRef(null);
  const bellPopRef = useRef(null);
  const userRef = useRef(null);
  const userPopRef = useRef(null);

  useEffect(() => {
    const onDown = (e) => {
      if (
        openBell &&
        bellRef.current && !bellRef.current.contains(e.target) &&
        bellPopRef.current && !bellPopRef.current.contains(e.target)
      ) setOpenBell(false);

      if (
        openUser &&
        userRef.current && !userRef.current.contains(e.target) &&
        userPopRef.current && !userPopRef.current.contains(e.target)
      ) setOpenUser(false);
    };
    const onEsc = (e) => {
      if (e.key === "Escape") { setOpenBell(false); setOpenUser(false); }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onEsc);
    };
  }, [openBell, openUser]);

  const unifiedTop = 40;

  return (
    <header className="vb-header">
      <div className="vb-header__wrap">
        <div className="vb-header__container">
          <div className="vb-left">
            <Link to="/" className="vb-brand">
              <img src={logoBlue} alt="ValueBid" className="vb-brand__img" />
            </Link>
          </div>

          <nav className="vb-center">
            <Link to="/auctions" className="vb-link">경매하기</Link>
            <Link to="/price-check" className="vb-link">시세 둘러보기</Link>
            <Link to="/auctions/new" className="vb-link">상품 등록</Link>
          </nav>

          <div className="vb-right">
            {/* 알림 버튼 */}
            <button
              ref={bellRef}
              type="button"
              className="vb-bell"
              aria-haspopup="dialog"
              aria-expanded={openBell}
              onClick={() => { setOpenBell(v => !v); setOpenUser(false); }}
            >
              <Bell size={22} strokeWidth={2} />
            </button>

            {/* 알림 모달 */}
            {openBell && (
              <div
                ref={bellPopRef}
                className="vb-popover"
                role="dialog"
                aria-label="알림"
                style={{ position: "absolute", right: 56, top: unifiedTop }}
              >
                <div className="vb-popover__arrow" />
                <div className="vb-popover__head" style={{ fontWeight: "normal" }}>알림</div>
                <div className="vb-popover__body" style={{ fontWeight: "normal" }}>
                  아직 알림이 없습니다.
                </div>
              </div>
            )}

            {/* 사용자 드롭다운 */}
            {user ? (
              <div className="vb-user" style={{ position: "relative", marginLeft: 12 }}>
                <button
                  ref={userRef}
                  type="button"
                  className="vb-user__btn"
                  aria-haspopup="menu"
                  aria-expanded={openUser}
                  onClick={() => { setOpenUser(v => !v); setOpenBell(false); }}
                  style={{
                    background: "transparent",
                    border: 0,
                    fontWeight: "normal",
                    cursor: "pointer",
                    color: "inherit"
                  }}
                >
                  안녕하세요, {user.name} 님 ▾
                </button>

                {openUser && (
                  <div
                    ref={userPopRef}
                    className="vb-user-popover" // ✅ 사용자 모달 전용 클래스
                    role="menu"
                    aria-label="사용자 메뉴"
                    style={{ position: "absolute", right: 0, top: unifiedTop }}
                  >
                    <div className="vb-popover__arrow" />

                    <div className="vb-popover__head">
                      <span>{user.name} 님</span>
                      <button className="vb-menu__logout">로그아웃</button>
                    </div>

                    <div className="vb-popover__body vb-user-popover__body">
                      <Link to="/mypage" className="vb-menu__item">마이페이지</Link>
                      <Link to="/support" className="vb-menu__item">문의하기</Link>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="vb-link vb-login">로그인</Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
