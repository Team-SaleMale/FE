// NOTE(ChatGPT): App.js의 `import Signup from "./pages/Auth/Signup";`와 맞추기 위해 default export로 유지
import React, { useState } from "react";
import "../../styles/Auth/Signup.css";

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
          <button type="submit" className="auth-submit">회원가입</button>
        </form>

        <div className="auth-sub small">또는 다음 계정으로 가입하기</div>
        <div className="social-wrap">
          <button type="button" className="social-btn google">G</button>
          <button type="button" className="social-btn apple"></button>
        </div>
      </div>
    </div>
  );
}

export default Signup; // NOTE(ChatGPT): default export (중요)
