import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import styles from "../../styles/MyPage/NicknameChangeDrawer.module.css";
import { changeNickname } from "../../api/users/service";

export default function NicknameChangeDrawer({ open, onClose, currentNickname, onSuccess }) {
  const [nickname, setNickname] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      setNickname(currentNickname || "");
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, currentNickname]);

  const handleReset = () => {
    setNickname(currentNickname || "");
  };

  // 닉네임 유효성 검사
  const validateNickname = (value) => {
    // 2-20자, 한글, 영문, 숫자만 허용
    if (value.length < 2 || value.length > 20) {
      return "닉네임은 2-20자여야 합니다.";
    }
    if (!/^[가-힣a-zA-Z0-9]+$/.test(value)) {
      return "닉네임은 한글, 영문, 숫자만 사용 가능합니다.";
    }
    return null;
  };

  const handleChangeNickname = async () => {
    // 유효성 검사
    if (!nickname.trim()) {
      alert("닉네임을 입력해주세요.");
      return;
    }

    const validationError = validateNickname(nickname);
    if (validationError) {
      alert(validationError);
      return;
    }

    if (nickname === currentNickname) {
      alert("현재 닉네임과 동일합니다.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await changeNickname({ nickname });

      console.log("닉네임 변경 응답:", response);

      if (response.data?.isSuccess || response.isSuccess) {
        const updatedProfile = response.data?.result || response.result;
        alert("닉네임이 성공적으로 변경되었습니다.");

        // 부모 컴포넌트에 성공 알림 (프로필 다시 불러오기)
        if (onSuccess && updatedProfile) {
          onSuccess(updatedProfile);
        }

        onClose();
      } else {
        alert(response.data?.message || response.message || "닉네임 변경에 실패했습니다.");
      }
    } catch (error) {
      console.error("닉네임 변경 실패:", error);

      // 에러 메시지 처리
      if (error.response?.status === 400) {
        alert(error.response?.data?.message || "유효하지 않은 닉네임입니다.");
      } else if (error.response?.status === 401) {
        alert("인증에 실패했습니다. 다시 로그인해주세요.");
      } else {
        alert(error.response?.data?.message || "닉네임 변경 중 오류가 발생했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!open) return null;

  const validationError = nickname && validateNickname(nickname);

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.drawer}>
        {/* 헤더 */}
        <header className={styles.header}>
          <button className={styles.close} onClick={onClose} aria-label="닫기">
            <Icon icon="solar:close-circle-linear" />
          </button>
          <h3 className={styles.title}>닉네임 변경</h3>
          <div className={styles.headerPlaceholder} />
        </header>

        {/* 내용 */}
        <div className={styles.content}>
          {/* 안내 메시지 */}
          <div className={styles.infoBox}>
            <Icon icon="solar:info-circle-bold" className={styles.infoIcon} />
            <div className={styles.infoText}>
              닉네임은 2-20자, 한글, 영문, 숫자만 사용 가능합니다.
            </div>
          </div>

          {/* 현재 닉네임 */}
          <div className={styles.currentNickname}>
            <span className={styles.label}>현재 닉네임</span>
            <span className={styles.value}>{currentNickname || "사용자"}</span>
          </div>

          {/* 새 닉네임 */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>새 닉네임</label>
            <input
              type="text"
              className={styles.input}
              placeholder="새 닉네임을 입력하세요"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={20}
              autoComplete="off"
            />
            <div className={styles.charCount}>
              {nickname.length} / 20
            </div>
            {validationError && (
              <p className={styles.error}>{validationError}</p>
            )}
          </div>
        </div>

        {/* 푸터 */}
        <div className={styles.footer}>
          <button className={styles.cancelButton} onClick={onClose} disabled={isLoading}>
            취소
          </button>
          <button
            className={styles.saveButton}
            onClick={handleChangeNickname}
            disabled={
              !nickname ||
              nickname === currentNickname ||
              !!validationError ||
              isLoading
            }
          >
            {isLoading ? "변경 중..." : "변경하기"}
          </button>
        </div>
      </div>
    </>
  );
}
