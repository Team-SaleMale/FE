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

      const res = await login({ email, password: pw });

      if (res?.isSuccess === false) {
        alert(res?.message || "로그인 실패");
        return;
      }

      try {
        await myProfile();
      } catch {}

      alert("로그인 성공!");
      navigate("/", { replace: true });
      window.location.reload();
    } catch (err) {
      console.error("[Login] error:", err);
      alert(err?.friendlyMessage || "로그인 요청 실패");
    } finally {
      setLoading(false);
    }
  };

  // 소셜 로그인
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

                {/* 🔥 하단 텍스트 링크: 비밀번호 찾기 | 회원가입 */}
        <div className="auth-bottom-links">
          <button
            type="button"
            className="auth-link-btn"
            onClick={() => navigate("/password-reset")}
            disabled={loading}
          >
            비밀번호 찾기
          </button>

          <span className="auth-divider">|</span>

          <button
            type="button"
            className="auth-link-btn"
            onClick={() => navigate("/signup")}
            disabled={loading}
          >
            회원가입
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
