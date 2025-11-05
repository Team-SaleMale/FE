// src/pages/Auth/Login.jsx
/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import "../../styles/Auth/Login.css";
import naverLogo from "../../assets/img/logo/naver_logo.png";
import kakaoLogo from "../../assets/img/logo/kakao_logo.png";

import endpoints from "../../api/endpoints";
import config from "../../config";

function Login() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const apiBase =
    (config && config.API_URL) ||
    process.env.REACT_APP_API_URL ||
    "";

  const onSubmit = (e) => {
    e.preventDefault();
    if (!email) return alert("이메일을 입력하세요");
    if (!pw) return alert("비밀번호를 입력하세요");
    alert("로그인 요청 전송"); // TODO: 로컬 로그인 API 연동 시 교체
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
          />
          <input
            type="password"
            className="auth-input"
            placeholder="Password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            disabled={loading}
          />

          {/* 구분선 */}
          <div className="divider">
            <span>또는 다음 계정으로 계속하기</span>
          </div>

          {/* 소셜 카드형 버튼 */}
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

          <button type="submit" className="auth-submit" disabled={loading}>
            로그인
          </button>
        </form>

        <div className="auth-signup">
          아직 계정이 없으신가요? <a href="/signup">회원가입</a>
        </div>
      </div>
    </div>
  );
}

export default Login;
