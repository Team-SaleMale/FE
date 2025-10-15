// src/components/ScrollToTop.jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop({ behavior = "auto" }) {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    // 해시(#section)로 이동하는 경우는 브라우저 기본 동작 유지
    if (hash) return;
    window.scrollTo({ top: 0, left: 0, behavior });
  }, [pathname, search, hash, behavior]);

  return null;
}
