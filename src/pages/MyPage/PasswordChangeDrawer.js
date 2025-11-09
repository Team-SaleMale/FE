import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import styles from "../../styles/MyPage/PasswordChangeDrawer.module.css";
import { resetPassword } from "../../api/users/service";

export default function PasswordChangeDrawer({ open, onClose }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleReset = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  useEffect(() => {
    if (open) {
      handleReset();
    }
  }, [open]);

  // 비밀번호 유효성 검사
  const validatePassword = (password) => {
    // 8자 이상, 대문자, 소문자, 숫자, 특수문자 포함
    const regex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    return regex.test(password);
  };

  const handleChangePassword = async () => {
    // 유효성 검사
    if (!currentPassword.trim()) {
      alert("현재 비밀번호를 입력해주세요.");
      return;
    }

    if (!newPassword.trim()) {
      alert("새 비밀번호를 입력해주세요.");
      return;
    }

    if (!validatePassword(newPassword)) {
      alert("비밀번호는 8자 이상, 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    if (currentPassword === newPassword) {
      alert("현재 비밀번호와 새 비밀번호가 같습니다.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await resetPassword({
        currentPassword,
        newPassword,
      });

      console.log("비밀번호 변경 응답:", response);

      if (response.data?.isSuccess || response.isSuccess) {
        alert("비밀번호가 성공적으로 변경되었습니다.");
        handleReset();
        onClose();
      } else {
        alert(response.data?.message || response.message || "비밀번호 변경에 실패했습니다.");
      }
    } catch (error) {
      console.error("비밀번호 변경 실패:", error);

      // 에러 메시지 처리
      if (error.response?.status === 400) {
        alert("현재 비밀번호가 올바르지 않습니다.");
      } else if (error.response?.status === 401) {
        alert("인증에 실패했습니다. 다시 로그인해주세요.");
      } else {
        alert(error.response?.data?.message || "비밀번호 변경 중 오류가 발생했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.drawer}>
        {/* 헤더 */}
        <header className={styles.header}>
          <button className={styles.close} onClick={onClose} aria-label="닫기">
            <Icon icon="solar:close-circle-linear" />
          </button>
          <h3 className={styles.title}>비밀번호 변경</h3>
          <div className={styles.headerPlaceholder} />
        </header>

        {/* 내용 */}
        <div className={styles.content}>
          {/* 안내 메시지 */}
          <div className={styles.infoBox}>
            <Icon icon="solar:info-circle-bold" className={styles.infoIcon} />
            <div className={styles.infoText}>
              비밀번호는 8자 이상, 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.
            </div>
          </div>

          {/* 현재 비밀번호 */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>현재 비밀번호</label>
            <div className={styles.passwordWrapper}>
              <input
                type={showCurrentPassword ? "text" : "password"}
                className={styles.input}
                placeholder="현재 비밀번호를 입력하세요"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="off"
              />
              <button
                type="button"
                className={styles.toggleButton}
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                <Icon icon={showCurrentPassword ? "solar:eye-bold" : "solar:eye-closed-bold"} />
              </button>
            </div>
          </div>

          {/* 새 비밀번호 */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>새 비밀번호</label>
            <div className={styles.passwordWrapper}>
              <input
                type={showNewPassword ? "text" : "password"}
                className={styles.input}
                placeholder="새 비밀번호를 입력하세요"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
              />
              <button
                type="button"
                className={styles.toggleButton}
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                <Icon icon={showNewPassword ? "solar:eye-bold" : "solar:eye-closed-bold"} />
              </button>
            </div>
            {newPassword && !validatePassword(newPassword) && (
              <p className={styles.error}>
                비밀번호는 8자 이상, 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.
              </p>
            )}
          </div>

          {/* 새 비밀번호 확인 */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>새 비밀번호 확인</label>
            <div className={styles.passwordWrapper}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                className={styles.input}
                placeholder="새 비밀번호를 다시 입력하세요"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
              <button
                type="button"
                className={styles.toggleButton}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Icon icon={showConfirmPassword ? "solar:eye-bold" : "solar:eye-closed-bold"} />
              </button>
            </div>
            {confirmPassword && newPassword !== confirmPassword && (
              <p className={styles.error}>비밀번호가 일치하지 않습니다.</p>
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
            onClick={handleChangePassword}
            disabled={
              !currentPassword ||
              !newPassword ||
              !confirmPassword ||
              newPassword !== confirmPassword ||
              !validatePassword(newPassword) ||
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
