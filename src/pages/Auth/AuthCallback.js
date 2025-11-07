// src/pages/Auth/AuthCallback.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/client"; // axios 인스턴스
import { Cookies } from "react-cookie";

const ACCESS_TOKEN_KEY = "accessToken";

console.log("[AuthCallback] file loaded");

function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const cookies = new Cookies();

    // 1) 해시(fragment) 복구
    let hash = window.location.hash?.startsWith("#")
      ? window.location.hash.slice(1)
      : "";

    if (!hash) {
      const saved = sessionStorage.getItem("oauth_fragment");
      if (saved) hash = saved;
    }

    const sp = new URLSearchParams(hash);

    // 백엔드(or IDP)에 따라 키가 다를 수 있음 → 최대한 유연하게
    const token =
      sp.get("token") ||
      sp.get("access_token") ||
      sp.get("jwt") ||
      "";

    const signupTokenFromHash = sp.get("signupToken");

    console.log("[AuthCallback] raw hash:", hash);

    // URL에서 민감정보 제거 (히스토리만 교체, 페이지 유지)
    try {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    } catch {}

    // 2) 해시에 signupToken이 직접 온 경우: 신규 회원 경로
    if (signupTokenFromHash) {
      sessionStorage.removeItem("oauth_fragment");
      sessionStorage.setItem("signupToken", signupTokenFromHash);
      navigate("/signup?social=true", { replace: true });
      return;
    }

    // 3) JWT가 온 경우: 저장 후 서버에 로그인 상태 확인(/auth/oauth2/login)
    if (token) {
      sessionStorage.removeItem("oauth_fragment");

      // 토큰 저장 (쿠키 + localStorage) → /auth/me 호출 시 Authorization 주입 대비
      try {
        cookies.set(ACCESS_TOKEN_KEY, token, { path: "/" });
        localStorage.setItem(ACCESS_TOKEN_KEY, token);
      } catch {}

      api
        .get("/auth/oauth2/login", {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true, // 서버가 HttpOnly 쿠키도 세팅하면 함께 수신
        })
        .then(({ data }) => {
          // 다양한 응답 스키마 방어
          // 기대값 예시:
          //   { status: "OK" }
          //   { status: "NEED_SIGNUP", signupToken: "..." }
          //   { isSuccess: true }
          //   { result: { status: "...", needSignup: true, signupToken: "..." } }
          const root = data?.result ?? data ?? {};
          const status = typeof root.status === "string"
            ? root.status
            : (root.isSuccess === true ? "OK" : undefined);

          const needSignup =
            root.needSignup === true ||
            status === "NEED_SIGNUP";

          let signupToken =
            root.signupToken ||
            root.result?.signupToken ||
            null;

          if (needSignup) {
            if (typeof signupToken === "string" && signupToken.length > 0) {
              sessionStorage.setItem("signupToken", signupToken);
              navigate("/signup?social=true", { replace: true });
              return;
            }
            // NEED_SIGNUP인데 토큰이 없으면 안전하게 홈으로
            sessionStorage.removeItem("signupToken");
            navigate("/", { replace: true });
            window.location.replace("/"); // 헤더 재마운트 강제
            return;
          }

          // 기존 회원(OK)
          sessionStorage.removeItem("signupToken");
          navigate("/", { replace: true });
          window.location.replace("/"); // 헤더가 /auth/me 재호출하도록 하드 리로드
        })
        .catch((err) => {
          console.error("[AuthCallback] /auth/oauth2/login error:", err);
          // 그래도 홈으로 보내고 새로고침 (헤더에서 토큰 기반 /auth/me 시도)
          navigate("/", { replace: true });
          window.location.replace("/");
        });

      return;
    }

    // 4) 해시가 비었으면 홈으로
    navigate("/", { replace: true });
    window.location.replace("/");
  }, [navigate]);

  console.log("[AuthCallback] mounted");
  return <p>소셜 로그인 처리 중입니다...</p>;
}

export default AuthCallback;
