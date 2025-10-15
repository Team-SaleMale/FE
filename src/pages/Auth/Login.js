// NOTE(ChatGPT): 아래 형식처럼 "default export 함수 컴포넌트"여야 App.js의 import와 맞습니다.
import React, { useState } from "react";
import "../../styles/Auth/Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    if (!email) return alert("이메일을 입력하세요");
    if (!pw) return alert("비밀번호를 입력하세요");
    alert("로그인 요청 전송");
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
          />
          <input
            type="password"
            className="auth-input"
            placeholder="Password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
          />
          <div className="divider" />
          <div className="auth-sub small">또는 다음 계정으로 계속하기</div>
          <div className="social-wrap">
            <button type="button" className="social-btn google">G</button>
            <button type="button" className="social-btn apple"></button>
          </div>
          <button type="submit" className="auth-submit">로그인</button>
        </form>

        <div className="auth-signup">
          아직 계정이 없으신가요? <a href="/signup">회원가입</a>
        </div>
      </div>
    </div>
  );
}

export default Login; // NOTE(ChatGPT): default export (중요)
