import React, { useState } from "react";
import "../../styles/Auth/Signup.css";
import naverLogo from "../../assets/img/logo/naver_logo.png"; // 추가됨
import kakaoLogo from "../../assets/img/logo/kakao_logo.png"; // 추가됨

function Signup() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    if (!email) return alert("이메일을 입력하세요");
    if (!/^\S+@\S+\.\S+$/.test(email)) return alert("이메일 형식을 확인하세요");
    if (!pw) return alert("비밀번호를 입력하세요");
    if (pw.length < 8) return alert("비밀번호는 8자 이상이어야 합니다");
    if (pw !== pw2) return alert("비밀번호가 일치하지 않습니다");
    alert("회원가입 요청 전송");
  };

  return (
    <div className="auth">
      <div className="auth-card">
        <h1 className="auth-title">회원가입</h1>
        <p className="auth-sub">이메일로 회원가입</p>

        <form className="auth-form" onSubmit={onSubmit}>
          <input
            type="email"
            className="auth-input"
            placeholder="이메일 입력"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            className="auth-input"
            placeholder="비밀번호 입력"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
          />
          <input
            type="password"
            className="auth-input"
            placeholder="비밀번호 확인"
            value={pw2}
            onChange={(e) => setPw2(e.target.value)}
          />

        {/* 구분선 */}
        <div className="divider">
          <span>또는 다음 계정으로 가입하기</span>
        </div>

        {/* 소셜 카드형 버튼 */}
        <div className="social-card-row">
          <button type="button" className="social-card" aria-label="네이버로 가입">
            <img src={naverLogo} alt="Naver" className="social-card-logo" />
          </button>
          <button type="button" className="social-card" aria-label="카카오로 가입">
            <img src={kakaoLogo} alt="Kakao" className="social-card-logo" />
          </button>
        </div>

          <button type="submit" className="auth-submit">회원가입</button>
        </form>
      </div>
    </div>
  );
}

export default Signup;