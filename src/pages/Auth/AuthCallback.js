// src/pages/Auth/AuthCallback.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
console.log("[AuthCallback] file loaded");
function AuthCallback() {

  const navigate = useNavigate();

  useEffect(() => {
    let hash = window.location.hash?.startsWith("#")
      ? window.location.hash.slice(1)
      : "";
    if (!hash) {
      // 프리-리라이트에서 저장해둔 fragment 복구
      const saved = sessionStorage.getItem("oauth_fragment");
      if (saved) hash = saved;
    }

    const sp = new URLSearchParams(hash);
    const token = sp.get("token");
    const signupToken = sp.get("signupToken");

    console.log("[AuthCallback] raw hash:", hash);

    if (signupToken) {
        sessionStorage.removeItem("oauth_fragment");
      navigate(`/signup?social=true&signupToken=${encodeURIComponent(signupToken)}`, { replace: true });
      return;
    }
    if (token) {
        sessionStorage.removeItem("oauth_fragment");
      localStorage.setItem("accessToken", token);
      navigate("/", { replace: true });
      return;
    }

    navigate("/", { replace: true });
  }, [navigate]);
  console.log("[AuthCallback] mounted");
  return <p>소셜 로그인 처리 중입니다...</p>;
}

export default AuthCallback;
