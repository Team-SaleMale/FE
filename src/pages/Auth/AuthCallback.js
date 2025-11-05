// src/pages/Auth/AuthCallback.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/client"; // axios 인스턴스

console.log("[AuthCallback] file loaded");

function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // 1) 해시(fragment) 복구
    let hash = window.location.hash?.startsWith("#")
      ? window.location.hash.slice(1)
      : "";

    if (!hash) {
      const saved = sessionStorage.getItem("oauth_fragment");
      if (saved) hash = saved;
    }

    const sp = new URLSearchParams(hash);
    const token = sp.get("token");               // JWT
    const signupTokenFromHash = sp.get("signupToken");

    console.log("[AuthCallback] raw hash:", hash);

    // 2) 해시에 signupToken이 직접 온 경우: 신규 회원 경로
    if (signupTokenFromHash) {
      sessionStorage.removeItem("oauth_fragment");
      sessionStorage.setItem("signupToken", signupTokenFromHash);
      navigate("/signup?social=true", { replace: true });
      return;
    }

    // 3) 해시에 JWT만 온 경우: 서버에 로그인 상태 조회
    if (token) {
      sessionStorage.removeItem("oauth_fragment");
      localStorage.setItem("accessToken", token);

      api
        .get("/auth/oauth2/login", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(({ data }) => {
          // 다양한 응답 스키마 방어
          // 기대값: { status: "OK" } 또는 { status: "NEED_SIGNUP", signupToken: "..." }
          // 변형 가능성: { isSuccess: true, ... }
          const status =
            typeof data?.status === "string"
              ? data.status
              : data?.isSuccess === true
              ? "OK"
              : undefined;

          if (status === "NEED_SIGNUP") {
            const st = data?.signupToken;
            if (st && typeof st === "string" && st.length > 0) {
              sessionStorage.setItem("signupToken", st);
              navigate("/signup?social=true", { replace: true });
              return;
            }
            // NEED_SIGNUP인데 토큰이 없으면 비정상: 안전하게 홈으로
            sessionStorage.removeItem("signupToken");
            navigate("/", { replace: true });
            return;
          }

          // 기존 회원(OK 또는 isSuccess===true 등)
          sessionStorage.removeItem("signupToken"); // 잔여 토큰 방지
          navigate("/", { replace: true });
        })
        .catch((err) => {
          console.error("[AuthCallback] /auth/oauth2/login error:", err);
          sessionStorage.removeItem("signupToken");
          navigate("/", { replace: true });
        });

      return;
    }

    // 4) 해시가 비었으면 홈으로
    navigate("/", { replace: true });
  }, [navigate]);

  console.log("[AuthCallback] mounted");
  return <p>소셜 로그인 처리 중입니다...</p>;
}

export default AuthCallback;
