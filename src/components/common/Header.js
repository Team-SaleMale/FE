import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import logoBlue from "../../assets/img/header/logo_blue.png";
import "../../styles/common/Header.css";

export default function Header() {
  const [open, setOpen] = useState(false);
  const bellRef = useRef(null);
  const popRef = useRef(null);

  useEffect(() => {
    const onDown = (e) => {
      if (!open) return;
      if (
        bellRef.current && !bellRef.current.contains(e.target) &&
        popRef.current && !popRef.current.contains(e.target)
      ) setOpen(false);
    };
    const onEsc = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

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
            <Link to="/videos" className="vb-link">시세 둘러보기</Link>
            <Link to="/auctions/new" className="vb-link">상품 등록</Link>
          </nav>

          <div className="vb-right">
            <button
              ref={bellRef}
              type="button"
              className="vb-bell"
              aria-haspopup="dialog"
              aria-expanded={open}
              onClick={() => setOpen(v => !v)}
            >
              <Bell size={22} strokeWidth={2} />
            </button>

            {open && (
              <div ref={popRef} className="vb-popover" role="dialog" aria-label="알림">
                <div className="vb-popover__arrow" />
                <div className="vb-popover__head">알림</div>
                <div className="vb-popover__body">
                  아직 알림이 없습니다.
                </div>
              </div>
            )}

            <Link to="/login" className="vb-link vb-login">로그인</Link>
          </div>
        </div>
      </div>
    </header>
  );
}
