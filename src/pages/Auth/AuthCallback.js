// src/pages/Auth/AuthCallback.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/client"; // ✔ axios 인스턴스(인터셉터 포함) 사용 가정

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
    const token = sp.get("token");          // JWT
    const signupTokenFromHash = sp.get("signupToken");

    console.log("[AuthCallback] raw hash:", hash);

    // 1) 해시에 signupToken이 바로 온 경우 (신규회원 경로)
    if (signupTokenFromHash) {
      sessionStorage.removeItem("oauth_fragment");
      // ✅ signupToken을 세션에 저장(쿼리스트링보다 안전)
      sessionStorage.setItem("signupToken", signupTokenFromHash);
      navigate(`/signup?social=true`, { replace: true });
      return;
    }

    // 2) 해시에 JWT만 온 경우: /auth/oauth2/login으로 상태 확인
    if (token) {
      sessionStorage.removeItem("oauth_fragment");
      localStorage.setItem("accessToken", token);

      // JWT를 Authorization 헤더로 보냄
      api.get("/auth/oauth2/login", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(({ data }) => {
          // 백엔드 계약 예시:
          // { status: "OK", user: {...} }
          // { status: "NEED_SIGNUP", signupToken: "..." }
          if (data?.status === "NEED_SIGNUP" && data?.signupToken) {
            sessionStorage.setItem("signupToken", data.signupToken);
            navigate(`/signup?social=true`, { replace: true });
          } else {
            // 기존 회원이면 메인으로
            navigate("/", { replace: true });
          }
        })
        .catch((err) => {
          console.error("[AuthCallback] /auth/oauth2/login error:", err);
          // 실패 시 안전지대
          navigate("/", { replace: true });
        });

      return;
    }

    // 토큰도 아무 것도 없으면 홈으로
    navigate("/", { replace: true });
  }, [navigate]);

  console.log("[AuthCallback] mounted");
  return <p>소셜 로그인 처리 중입니다...</p>;
}

export default AuthCallback;
