/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import "../../styles/Auth/Login.css";
import naverLogo from "../../assets/img/logo/naver_logo.png";
import kakaoLogo from "../../assets/img/logo/kakao_logo.png";

import endpoints from "../../api/endpoints";
import config from "../../config";
import { login, myProfile } from "../../api/auth/service"; // ✅ 로그인 + 프로필 확인

function Login() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const apiBase =
    (config && config.API_URL) ||
    process.env.REACT_APP_API_URL ||
    "";

  const onSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!email) return alert("이메일을 입력하세요");
    if (!pw) return alert("비밀번호를 입력하세요");

    try {
      setLoading(true);

      // NOTE(ChatGPT): 서버는 로그인 응답의 'Authorization' 헤더로 accessToken을 내릴 수 있음.
      // client.js 응답 인터셉터가 Authorization 헤더를 자동 수거/저장하므로 여기서는 단순 호출만.
      const res = await login({ email, password: pw });

      if (res?.isSuccess === false) {
        alert(res?.message || "로그인 실패");
        return;
      }

      // NOTE(ChatGPT): 토큰 저장이 정상인지 가볍게 확인 (Authorization 주입 확인용)
      try {
        await myProfile(); // 200이면 OK
      } catch {
        // 인터셉터 저장 타이밍 이슈 등으로 바로 실패할 수 있으나, 이후 새로고침 시 정상화될 수 있음
      }

      alert("로그인 성공!");
      // NOTE(ChatGPT): Header는 mount 시 1회만 프로필을 조회하므로, 홈으로 이동 후 새로고침으로 상태 반영
      navigate("/", { replace: true });
      window.location.reload();
    } catch (err) {
      console.error("[Login] error:", err);
      alert(err?.friendlyMessage || "로그인 요청 실패");
    } finally {
      setLoading(false);
    }
  };

  // ✅ 소셜 로그인: 백엔드 OAuth2 엔드포인트로 리다이렉트
  const goNaver = () => {
    if (loading) return;
    setLoading(true);
    window.location.href = `${apiBase}${endpoints.AUTH.OAUTH2_NAVER}`;
  };

  const goKakao = () => {
    if (loading) return;
    setLoading(true);
    window.location.href = `${apiBase}${endpoints.AUTH.OAUTH2_KAKAO}`;
  };

  return (
    <div className="auth">
      <div className="auth-card">
        <h1 className="auth-title">로그인 후 서비스를 이용해보세요</h1>
        <p className="auth-sub">로그인 방식을 선택하세요</p>

        <form id="login-form" onSubmit={onSubmit}>
          <input
            type="email"
            className="auth-input"
            placeholder="get@ziontutorial.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            autoComplete="email"
          />
          <input
            type="password"
            className="auth-input"
            placeholder="Password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            disabled={loading}
            autoComplete="current-password"
          />

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? "로그인 중..." : "로그인"}
          </button>

          <div className="divider">
            <span>또는 다음 계정으로 계속하기</span>
          </div>

          <div className="social-card-row">
            <button
              type="button"
              className="social-card"
              aria-label="네이버 로그인"
              onClick={goNaver}
              disabled={loading}
            >
              <img src={naverLogo} alt="Naver" className="social-card-logo" />
            </button>
            <button
              type="button"
              className="social-card"
              aria-label="카카오 로그인"
              onClick={goKakao}
              disabled={loading}
            >
              <img src={kakaoLogo} alt="Kakao" className="social-card-logo" />
            </button>
          </div>
        </form>

        <div className="auth-signup">
          아직 계정이 없으신가요? <a href="/signup">회원가입</a>
        </div>
      </div>
    </div>
  );
}

export default Login;
