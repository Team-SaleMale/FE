// src/pages/Auth/Signup.jsx
import React, { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import "../../styles/Auth/Signup.css";
import naverLogo from "../../assets/img/logo/naver_logo.png";
import kakaoLogo from "../../assets/img/logo/kakao_logo.png";

import {
  checkEmail,
  requestEmailCode,
  verifyEmailCode,
  checkNickname,
  register,
  completeSocialSignup,
} from "../../api/auth/service";

import { getNoAuth } from "../../api/client";            // ✅ 지역 검색 무인증 호출
import endpoints from "../../api/endpoints";
import config from "../../config";

const ONBOARDING_FLAG_KEY = "showCategoryOnboarding"; // [ADD] 최초 가입 온보딩 플래그

function Signup() {
  const navigate = useNavigate();
  const loc = useLocation();
  const params = new URLSearchParams(loc.search);
  const isSocial = params.get("social") === "true";
  const signupToken = isSocial ? sessionStorage.getItem("signupToken") || "" : "";

  // 소셜 가입 화면 진입 가드: signupToken 없으면 홈으로
  useEffect(() => {
    if (isSocial && !signupToken) {
      navigate("/", { replace: true });
    }
  }, [isSocial, signupToken, navigate]);

  const [step, setStep] = useState(isSocial ? 2 : 1);

  // 공통 상태
  const [email, setEmail] = useState("");
  const [emailAvailable, setEmailAvailable] = useState(null); // null|true|false
  const [code, setCode] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [verifySessionToken, setVerifySessionToken] = useState("");
  const emailValid = useMemo(() => /^\S+@\S+\.\S+$/.test(email), [email]);

  const [nickname, setNickname] = useState("");
  const [nicknameAvailable, setNicknameAvailable] = useState(null);

  // ✅ 지역 선택 상태 (서버 전송용 id + 화면 표시용 이름)
  const [regionId, setRegionId] = useState("");            // 서버에 보낼 값
  const [regionName, setRegionName] = useState("");        // 화면 표시용

  // ✅ 지역 검색 입력/결과
  const [regionQuery, setRegionQuery] = useState("");
  const [regionResults, setRegionResults] = useState([]);
  const [regionLoading, setRegionLoading] = useState(false);
  const [regionError, setRegionError] = useState("");
  const [showRegionList, setShowRegionList] = useState(false);
  const regionBoxRef = useRef(null);
  const debounceRef = useRef(null);

  // ===== 비밀번호(일반 가입 전용) =====
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");

  const [loading, setLoading] = useState(false);
  const disabled = loading;

  // ▼▼▼ 지역 검색 API 호출 ▼▼▼
  const searchRegions = async (q, page = 0, size = 10) => {
    if (!q || !q.trim()) {
      setRegionResults([]);
      setRegionError("");
      return;
    }
    try {
      setRegionLoading(true);
      setRegionError("");
      const res = await getNoAuth(endpoints.AUTH.REGION_SEARCH, { q: q.trim(), page, size });
      const list = res?.result ?? [];
      setRegionResults(Array.isArray(list) ? list : []);
    } catch (e) {
      setRegionResults([]);
      setRegionError(e?.friendlyMessage || "지역 검색 실패");
    } finally {
      setRegionLoading(false);
    }
  };

  // 입력 디바운스 검색
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    // 지역 선택이 된 상태에서 입력 변경 시, 선택 해제
    if (regionQuery && regionName && showRegionList) {
      // 입력을 수정하면 선택을 암묵적으로 풀고 새로 검색
      setRegionId("");
      setRegionName("");
    }
    debounceRef.current = setTimeout(() => {
      if (regionQuery) {
        searchRegions(regionQuery, 0, 10);
      } else {
        setRegionResults([]);
      }
    }, 300);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regionQuery]);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const onDocClick = (e) => {
      if (!regionBoxRef.current) return;
      if (!regionBoxRef.current.contains(e.target)) {
        setShowRegionList(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // ===== Step1 (일반 회원가입 전용) =====
  const onCheckEmail = async () => {
    if (!email) return alert("이메일을 입력하세요");
    if (!emailValid) return alert("이메일 형식을 확인하세요");
    try {
      setLoading(true);
      const { available } = await checkEmail(email);
      setEmailAvailable(available);
      alert(available ? "사용 가능한 이메일입니다." : "이미 사용 중인 이메일입니다.");
    } catch (err) {
      alert(err?.friendlyMessage || "이메일 중복 확인 실패");
    } finally {
      setLoading(false);
    }
  };

  const onRequestCode = async () => {
    if (!email) return alert("이메일을 입력하세요");
    if (!emailValid) return alert("이메일 형식을 확인하세요");
    if (emailAvailable === false) return alert("이미 사용 중인 이메일입니다.");
    try {
      setLoading(true);
      await requestEmailCode(email);
      alert("인증번호가 이메일로 전송되었습니다.");
    } catch (err) {
      alert(err?.friendlyMessage || "인증번호 요청 실패");
    } finally {
      setLoading(false);
    }
  };

  const onVerifyCode = async () => {
    if (!code) return alert("인증번호를 입력하세요");
    try {
      setLoading(true);
      const res = await verifyEmailCode(email, code); // 서버 응답 전체 받기

      const verified = !!(res?.isSuccess && res?.result?.sessionToken); // 성공 여부 판단
      setEmailVerified(verified);
      if (verified) setVerifySessionToken(res.result.sessionToken);

      if (verified) {
        alert("이메일 인증이 완료되었습니다.");
      } else {
        alert("인증번호가 올바르지 않습니다.");
      }
    } catch (err) {
      alert(err?.friendlyMessage || "인증번호 확인 실패");
    } finally {
      setLoading(false);
    }
  };

  const goNextFromEmail = () => {
    if (!emailVerified) return alert("이메일 인증을 완료해주세요.");
    setStep(2);
  };

  // ===== Step2 (공통 / 소셜 회원가입은 여기서만 진행) =====
  const onCheckNickname = async () => {
    if (!nickname) return alert("닉네임을 입력하세요");
    try {
      setLoading(true);
      const { available } = await checkNickname(nickname);
      setNicknameAvailable(available);
      alert(available ? "사용 가능한 닉네임입니다." : "이미 사용 중인 닉네임입니다.");
    } catch (err) {
      alert(err?.friendlyMessage || "닉네임 중복 확인 실패");
    } finally {
      setLoading(false);
    }
  };

  const handlePickRegion = (r) => {
    setRegionId(String(r.regionId));
    setRegionName(r.displayName || "");
    setRegionQuery(r.displayName || "");
    setShowRegionList(false);
  };

  const clearPickedRegion = () => {
    setRegionId("");
    setRegionName("");
    setRegionQuery("");
    setRegionResults([]);
  };

  const goNextFromNickname = async () => {
    if (nicknameAvailable !== true) return alert("닉네임 중복 확인을 완료하세요.");

    // ✅ 공통: 지역 ID 검증
    if (!regionId || Number.isNaN(Number(regionId))) {
      return alert("지역을 선택하세요. (지역명을 검색 후 목록에서 선택)");
    }

    // 소셜 회원가입: 여기서 최종 완료 처리
    if (isSocial) {
      if (!signupToken) return alert("소셜 회원가입 토큰(signupToken)이 없습니다.");
      try {
        setLoading(true);
        await completeSocialSignup({
          signupToken,
          nickname,
          regionId: Number(regionId),
        });
        sessionStorage.removeItem("signupToken");
        // [ADD] 최초 온보딩 플래그 세팅 → 메인에서 팝업 노출
        localStorage.setItem(ONBOARDING_FLAG_KEY, "1");
        alert("소셜 회원가입이 완료되었습니다.");
        navigate("/login", { replace: true }); // 로그인 화면으로 이동
      } catch (err) {
        const code = err?.code || err?.response?.data?.code;
        if (code === "USER4003") {
          sessionStorage.removeItem("signupToken");
          alert("이미 가입된 계정입니다. 로그인 화면으로 이동합니다.");
          navigate("/login", { replace: true });
        } else {
          alert(err?.friendlyMessage || err?.response?.data?.message || "소셜 회원가입 실패");
        }
      } finally {
        setLoading(false);
      }
      return;
    }

    // 일반 회원가입: 다음 단계(비밀번호 설정)
    setStep(3);
  };

  // ===== Step3 (일반 회원가입 전용) =====
  const onSubmitSignup = async (e) => {
    e.preventDefault();
    if (!emailVerified || !verifySessionToken) {
      return alert("이메일 인증을 먼저 완료해주세요.");
    }
    if (!regionId || Number.isNaN(Number(regionId))) {
      return alert("지역을 선택하세요. (지역명을 검색 후 목록에서 선택)");
    }
    if (!pw) return alert("비밀번호를 입력하세요");
    if (pw.length < 8) return alert("비밀번호는 8자 이상이어야 합니다");
    if (pw !== pw2) return alert("비밀번호가 일치하지 않습니다");
    try {
      setLoading(true);
      await register(
        {
          email,
          nickname,
          password: pw,
          regionId: Number(regionId),
          sessionToken: verifySessionToken,
        },
        verifySessionToken
      );
      // [ADD] 최초 온보딩 플래그 세팅 → 메인에서 팝업 노출
      localStorage.setItem(ONBOARDING_FLAG_KEY, "1");
      alert("회원가입이 완료되었습니다.");
      navigate("/login", { replace: true }); // 로그인 화면으로 이동
    } catch (err) {
      alert(err?.friendlyMessage || "회원가입 실패");
    } finally {
      setLoading(false);
    }
  };

  // ===== 소셜 로그인 버튼 클릭 (백엔드 OAuth2 엔드포인트로 이동) =====
  const apiBase =
    (config && config.API_URL) || process.env.REACT_APP_API_URL || "";
  const goNaver = () => {
    window.location.href = `${apiBase}${endpoints.AUTH.OAUTH2_NAVER}`;
  };
  const goKakao = () => {
    window.location.href = `${apiBase}${endpoints.AUTH.OAUTH2_KAKAO}`;
  };

  return (
    <div className="auth">
      <div className="auth-card">
        <h1 className="auth-title">회원가입</h1>

        {/* 단계 표시: 소셜 회원가입이면 2단계만 노출 */}
        <div className="stepper" aria-label="signup steps">
          {!isSocial && <span className={`step-dot ${step >= 1 ? "active" : ""}`}>1</span>}
          {!isSocial && <span className={`step-connector ${step >= 2 ? "active" : ""}`} />}
          <span className={`step-dot ${step >= 2 ? "active" : ""}`}>2</span>
          {!isSocial && <span className={`step-connector ${step >= 3 ? "active" : ""}`} />}
          {!isSocial && <span className={`step-dot ${step >= 3 ? "active" : ""}`}>3</span>}
        </div>

        {/* ===== Step 1: 이메일 인증 (일반 회원가입 전용) ===== */}
        {!isSocial && step === 1 && (
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
                  setVerifySessionToken("");
                }}
                disabled={disabled}
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
                  placeholder="인증번호 입력"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  disabled={disabled}
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
                <button
                  type="button"
                  className="social-card"
                  aria-label="네이버로 가입"
                  disabled={disabled}
                  onClick={goNaver}
                >
                  <img src={naverLogo} alt="Naver" className="social-card-logo" />
                </button>
                <button
                  type="button"
                  className="social-card"
                  aria-label="카카오로 가입"
                  disabled={disabled}
                  onClick={goKakao}
                >
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

        {/* ===== Step 2: 닉네임 + 지역 선택 (소셜/일반 공통) ===== */}
        {step === 2 && (
          <>
            <p className="auth-sub">닉네임 설정{isSocial && " (소셜 회원가입)"}</p>
            <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
              {/* 닉네임 */}
              <input
                type="text"
                className="auth-input"
                placeholder="닉네임 입력"
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value.replace(/\s+/g, " ").trimStart());
                  setNicknameAvailable(null);
                }}
                disabled={disabled}
              />
              <button type="button" className="btn-outline" onClick={onCheckNickname} disabled={disabled}>
                닉네임 중복 확인
              </button>

              {/* ✅ 지역 검색 + 선택 */}
              <div className="region-box" ref={regionBoxRef}>
                <label className="region-title">내 동네 설정</label>
                <input
                  type="text"
                  className="auth-input"
                  placeholder='지역명 검색 (예: "역삼", "강남", "서울")'
                  value={regionQuery}
                  onChange={(e) => {
                    setRegionQuery(e.target.value);
                    setShowRegionList(true);
                  }}
                  onFocus={() => setShowRegionList(true)}
                  disabled={disabled}
                />

                {/* 선택됨 표시 */}
                {regionId && regionName && (
                  <div className="hint">
                    <span className="ok">선택한 지역: {regionName} (ID: {regionId})</span>
                    <button
                      type="button"
                      className="btn-link"
                      onClick={clearPickedRegion}
                      disabled={disabled}
                      style={{ marginLeft: 8 }}
                    >
                      변경
                    </button>
                  </div>
                )}

                {/* 검색 결과 드롭다운 */}
                {showRegionList && (
                  <div className="region-dropdown">
                    {regionLoading && <div className="region-item">검색 중…</div>}
                    {!regionLoading && regionError && (
                      <div className="region-item warn">{regionError}</div>
                    )}
                    {!regionLoading && !regionError && regionResults.length === 0 && regionQuery && (
                      <div className="region-item">검색 결과가 없습니다.</div>
                    )}
                    {!regionLoading &&
                      !regionError &&
                      regionResults.map((r) => (
                        <button
                          key={r.regionId}
                          type="button"
                          className="region-item"
                          onClick={() => handlePickRegion(r)}
                          disabled={disabled}
                        >
                          {r.displayName}
                        </button>
                      ))}
                  </div>
                )}
              </div>

              {isSocial && !signupToken && (
                <div className="hint">
                  <span className="warn">signupToken이 없습니다. 콜백 경로를 확인하세요.</span>
                </div>
              )}

              <div className="hint">
                {nickname && nickname.length < 2 && <span className="warn">닉네임은 2자 이상 권장</span>}
                {nicknameAvailable === true && <span className="ok">✔ 사용 가능한 닉네임</span>}
                {nicknameAvailable === false && <span className="warn">✖ 사용 중인 닉네임</span>}
              </div>

              <div className="row-2">
                {!isSocial && (
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => setStep(1)}
                    disabled={disabled}
                  >
                    이전
                  </button>
                )}
                <button
                  type="button"
                  className="btn-outline"
                  onClick={goNextFromNickname}
                  disabled={disabled}
                >
                  {isSocial ? "회원가입 완료" : "다음"}
                </button>
              </div>

            </form>
          </>
        )}

        {/* ===== Step 3: 비밀번호 설정 (일반 회원가입 전용) ===== */}
        {!isSocial && step === 3 && (
          <>
            <p className="auth-sub">비밀번호 설정</p>
            <form className="auth-form" onSubmit={onSubmitSignup}>
              <input
                type="password"
                className="auth-input"
                placeholder="비밀번호 (8자 이상)"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                disabled={disabled}
              />
              <input
                type="password"
                className="auth-input"
                placeholder="비밀번호 확인"
                value={pw2}
                onChange={(e) => setPw2(e.target.value)}
                disabled={disabled}
              />

              <div className="row-2">
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setStep(2)}
                  disabled={disabled}
                >
                  이전
                </button>
                <button
                  type="submit"
                  className="btn-outline"
                  disabled={disabled}
                >
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
