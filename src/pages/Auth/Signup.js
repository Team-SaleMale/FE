// src/pages/Auth/Signup.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import "../../styles/Auth/Signup.css";
import naverLogo from "../../assets/img/logo/naver_logo.png";
import kakaoLogo from "../../assets/img/logo/kakao_logo.png";

// NOTE(ChatGPT): 이 파일은 UI 미리보기용 목업입니다(실제 API 호출 없음).
// - 이메일 중복: "used"가 들어가면 중복 처리
// - 인증번호: "000000" 입력 시 성공
// - 닉네임 중복: "admin" 이면 중복 처리

function Signup() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  // 공통 상태
  const [email, setEmail] = useState("");
  const [emailAvailable, setEmailAvailable] = useState(null); // null|true|false
  const [code, setCode] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const emailValid = useMemo(() => /^\S+@\S+\.\S+$/.test(email), [email]);

  const [nickname, setNickname] = useState("");
  const [nicknameAvailable, setNicknameAvailable] = useState(null);

  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");

  const [loading, setLoading] = useState(false);
  const disabled = loading;

  // Step1 목업
  const onCheckEmail = async () => {
    if (!email) return alert("이메일을 입력하세요");
    if (!emailValid) return alert("이메일 형식을 확인하세요");
    setLoading(true);
    setTimeout(() => {
      const available = !email.toLowerCase().includes("used");
      setEmailAvailable(available);
      alert(available ? "사용 가능한 이메일입니다." : "이미 사용 중인 이메일입니다.");
      setLoading(false);
    }, 500);
  };

  const onRequestCode = async () => {
    if (!email) return alert("이메일을 입력하세요");
    if (!emailValid) return alert("이메일 형식을 확인하세요");
    if (emailAvailable === false) return alert("이미 사용 중인 이메일입니다.");
    setLoading(true);
    setTimeout(() => {
      alert("인증번호가 이메일로 전송되었다고 가정합니다. (목업)");
      setLoading(false);
    }, 500);
  };

  const onVerifyCode = async () => {
    if (!code) return alert("인증번호를 입력하세요");
    setLoading(true);
    setTimeout(() => {
      const verified = code === "000000"; // 목업 규칙
      setEmailVerified(verified);
      alert(verified ? "이메일 인증이 완료되었습니다." : "인증번호가 올바르지 않습니다. (000000 입력 시 성공)");
      setLoading(false);
    }, 400);
  };

  const goNextFromEmail = () => {
    if (!emailVerified) return alert("이메일 인증을 완료해주세요.");
    setStep(2);
  };

  // Step2 목업
  const onCheckNickname = async () => {
    if (!nickname) return alert("닉네임을 입력하세요");
    setLoading(true);
    setTimeout(() => {
      const isAvailable = nickname.toLowerCase() !== "admin";
      setNicknameAvailable(isAvailable);
      alert(isAvailable ? "사용 가능한 닉네임입니다." : "이미 사용 중인 닉네임입니다. (admin은 중복 처리)");
      setLoading(false);
    }, 400);
  };

  const goNextFromNickname = () => {
    if (nicknameAvailable !== true) return alert("닉네임 중복 확인을 완료하세요.");
    setStep(3);
  };

  // Step3 목업
  const onSubmitSignup = (e) => {
    e.preventDefault();
    if (!pw) return alert("비밀번호를 입력하세요");
    if (pw.length < 8) return alert("비밀번호는 8자 이상이어야 합니다");
    if (pw !== pw2) return alert("비밀번호가 일치하지 않습니다");
    alert("회원가입이 완료되었습니다. (목업)"); // 여기서 실제 navigate 등을 연결하면 됨
    navigate("/login");
  };

  return (
    <div className="auth">
      <div className="auth-card">
        <h1 className="auth-title">회원가입</h1>

        {/* 단계 표시 */}
        <div className="stepper" aria-label="signup steps">
          <span className={`step-dot ${step >= 1 ? "active" : ""}`}>1</span>
          <span className={`step-connector ${step >= 2 ? "active" : ""}`} />
          <span className={`step-dot ${step >= 2 ? "active" : ""}`}>2</span>
          <span className={`step-connector ${step >= 3 ? "active" : ""}`} />
          <span className={`step-dot ${step >= 3 ? "active" : ""}`}>3</span>
        </div>

        {step === 1 && (
          <>
            <p className="auth-sub">이메일 인증</p>
            <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                className="auth-input"
                placeholder="이메일 입력"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailAvailable(null);
                  setEmailVerified(false);
                }}
              />

              <div className="row-2">
                <button type="button" className="btn-outline" onClick={onCheckEmail} disabled={disabled}>
                  이메일 중복 확인
                </button>
                <button type="button" className="btn-outline" onClick={onRequestCode} disabled={disabled}>
                  인증번호 요청
                </button>
              </div>

              <div className="row-code">
                <input
                  type="text"
                  className="auth-input"
                  placeholder='인증번호 입력 (예: "000000")'
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
                <button type="button" className="btn-outline" onClick={onVerifyCode} disabled={disabled}>
                  인증번호 확인
                </button>
              </div>

              <div className="hint">
                {emailAvailable === true && <span className="ok">✔ 사용 가능한 이메일</span>}
                {emailAvailable === false && <span className="warn">✖ 사용 중인 이메일</span>}
                {emailVerified && <span className="ok">✔ 이메일 인증 완료</span>}
              </div>

              <div className="divider">
                <span>또는 다음 계정으로 가입하기</span>
              </div>

              <div className="social-card-row">
                <button type="button" className="social-card" aria-label="네이버로 가입" disabled={disabled}>
                  <img src={naverLogo} alt="Naver" className="social-card-logo" />
                </button>
                <button type="button" className="social-card" aria-label="카카오로 가입" disabled={disabled}>
                  <img src={kakaoLogo} alt="Kakao" className="social-card-logo" />
                </button>
              </div>

              <div className="row-next">
                <button type="button" className="auth-submit" onClick={goNextFromEmail} disabled={disabled}>
                  다음
                </button>
              </div>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <p className="auth-sub">닉네임 설정</p>
            <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
              <input
                type="text"
                className="auth-input"
                placeholder='닉네임 입력 (예: "admin"은 중복 처리)'
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value);
                  setNicknameAvailable(null);
                }}
              />
              <button type="button" className="btn-outline" onClick={onCheckNickname} disabled={disabled}>
                닉네임 중복 확인
              </button>

              <div className="hint">
                {nickname && nickname.length < 2 && <span className="warn">닉네임은 2자 이상 권장</span>}
                {nicknameAvailable === true && <span className="ok">✔ 사용 가능한 닉네임</span>}
                {nicknameAvailable === false && <span className="warn">✖ 사용 중인 닉네임</span>}
              </div>

              <div className="row-2">
                <button type="button" className="btn-outline" onClick={() => setStep(1)} disabled={disabled}>
                  이전
                </button>
                <button type="button" className="auth-submit" onClick={goNextFromNickname} disabled={disabled}>
                  다음
                </button>
              </div>
            </form>
          </>
        )}

        {step === 3 && (
          <>
            <p className="auth-sub">비밀번호 설정</p>
            <form className="auth-form" onSubmit={onSubmitSignup}>
              <input
                type="password"
                className="auth-input"
                placeholder="비밀번호 (8자 이상)"
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

              <div className="row-2">
                <button type="button" className="btn-outline" onClick={() => setStep(2)} disabled={disabled}>
                  이전
                </button>
                <button type="submit" className="auth-submit" disabled={disabled}>
                  회원가입
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default Signup;
