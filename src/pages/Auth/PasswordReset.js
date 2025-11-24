/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import "../../styles/Auth/Login.css"; // [추가 주석] 로그인과 동일한 스타일 재사용

import {
  requestPasswordReset,
  verifyPasswordResetCode,
  confirmPasswordReset,
} from "../../api/auth/service";

function PasswordReset() {
  const [step, setStep] = useState(1); // 1: 이메일 입력, 2: 코드 입력, 3: 새 비밀번호
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPw, setNewPw] = useState("");
  const [newPwCheck, setNewPwCheck] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState(""); // ✅ 이메일 인증에서 받은 세션 토큰

  const navigate = useNavigate();

  // [추가 주석] 1단계: 이메일로 인증번호 발송
  const handleRequestCode = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!email) return alert("가입하신 이메일을 입력하세요.");

    try {
      setLoading(true);
      const res = await requestPasswordReset(email);
      if (res?.isSuccess === false) {
        alert(res?.message || "인증번호 발송에 실패했습니다.");
        return;
      }
      alert("이메일로 인증번호를 발송했습니다.");
      setStep(2);
    } catch (err) {
      console.error("[PasswordReset] request error:", err);
      alert(err?.friendlyMessage || "인증번호 발송 요청에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // [추가 주석] 2단계: 이메일 + 코드 검증 (성공 시 세션 토큰 수신)
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!email) return alert("이메일을 다시 입력해주세요.");
    if (!code) return alert("이메일로 받은 인증번호를 입력하세요.");

    try {
      setLoading(true);
      const res = await verifyPasswordResetCode(email, code);
      if (res?.isSuccess === false) {
        alert(res?.message || "인증번호 검증에 실패했습니다.");
        return;
      }

      // ✅ result.sessionToken 저장
      const token = res?.result?.sessionToken || res?.sessionToken;
      if (!token) {
        alert("세션 토큰이 없습니다. 다시 시도해주세요.");
        return;
      }
      setResetToken(token);

      alert("인증이 완료되었습니다. 새로운 비밀번호를 설정하세요.");
      setStep(3);
    } catch (err) {
      console.error("[PasswordReset] verify error:", err);
      alert(err?.friendlyMessage || "인증번호 검증 요청에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // [추가 주석] 3단계: 최종 비밀번호 재설정 (세션 토큰 + 새 비밀번호 전송)
  const handleConfirmNewPassword = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!newPw) return alert("새 비밀번호를 입력하세요.");
    if (!newPwCheck) return alert("새 비밀번호 확인을 입력하세요.");
    if (newPw !== newPwCheck) return alert("새 비밀번호와 확인이 일치하지 않습니다.");
    if (!resetToken) return alert("세션 토큰이 없습니다. 처음부터 다시 진행해주세요.");

    try {
      setLoading(true);
      const res = await confirmPasswordReset(newPw, resetToken);
      if (res?.isSuccess === false) {
        alert(res?.message || "비밀번호 재설정에 실패했습니다.");
        return;
      }
      alert("비밀번호가 성공적으로 변경되었습니다. 새 비밀번호로 로그인해주세요.");
      navigate("/login");
    } catch (err) {
      console.error("[PasswordReset] confirm error:", err);
      alert(err?.friendlyMessage || "비밀번호 재설정 요청에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const goLogin = () => {
    if (loading) return;
    navigate("/login");
  };

  const renderStep = () => {
    if (step === 1) {
      return (
        <form onSubmit={handleRequestCode}>
          <input
            type="email"
            className="auth-input"
            placeholder="가입하신 이메일을 입력하세요"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            autoComplete="email"
          />
          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? "전송 중..." : "인증번호 보내기"}
          </button>
        </form>
      );
    }

    if (step === 2) {
      return (
        <form onSubmit={handleVerifyCode}>
          <input
            type="email"
            className="auth-input"
            placeholder="가입하신 이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            autoComplete="email"
          />
          <input
            type="text"
            className="auth-input"
            placeholder="이메일로 받은 6자리 인증번호"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={loading}
          />
          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? "검증 중..." : "인증번호 확인"}
          </button>
        </form>
      );
    }

    // step === 3
    return (
      <form onSubmit={handleConfirmNewPassword}>
        <input
          type="password"
          className="auth-input"
          placeholder="새 비밀번호"
          value={newPw}
          onChange={(e) => setNewPw(e.target.value)}
          disabled={loading}
          autoComplete="new-password"
        />
        <input
          type="password"
          className="auth-input"
          placeholder="새 비밀번호 확인"
          value={newPwCheck}
          onChange={(e) => setNewPwCheck(e.target.value)}
          disabled={loading}
          autoComplete="new-password"
        />
        <button type="submit" className="auth-submit" disabled={loading}>
          {loading ? "변경 중..." : "비밀번호 재설정"}
        </button>
      </form>
    );
  };

  return (
    <div className="auth">
      <div className="auth-card">
        <h1 className="auth-title">비밀번호 재설정</h1>
        <p className="auth-sub">
          {step === 1 && "가입하신 이메일로 인증번호를 발송합니다."}
          {step === 2 && "이메일로 받은 인증번호를 입력해주세요."}
          {step === 3 && "인증이 완료되었습니다. 새로운 비밀번호를 설정하세요."}
        </p>

        {renderStep()}

        <div className="auth-signup">
          이미 비밀번호를 기억하셨나요?{" "}
          <button
            type="button"
            className="auth-text-button"
            onClick={goLogin}
            disabled={loading}
          >
            로그인 하러가기
          </button>
        </div>
      </div>
    </div>
  );
}

export default PasswordReset;
