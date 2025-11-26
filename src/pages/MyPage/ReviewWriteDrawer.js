import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import styles from "../../styles/MyPage/ReviewWriteDrawer.module.css";
import { mypageService } from "../../api/mypage/service";

export default function ReviewWriteDrawer({ open, onClose, item, onSuccess }) {
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      // 드로어가 열릴 때 초기화
      setRating(5);
      setHoveredRating(0);
      setContent("");
      setError("");
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const ratingToEnum = (ratingNumber) => {
    const ratingMap = {
      1: "ONE",
      2: "TWO",
      3: "THREE",
      4: "FOUR",
      5: "FIVE",
    };
    return ratingMap[ratingNumber] || "FIVE";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim()) {
      setError("후기 내용을 입력해주세요.");
      return;
    }

    if (content.trim().length < 10) {
      setError("후기는 최소 10자 이상 입력해주세요.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await mypageService.createReview(item.id, {
        rating: ratingToEnum(rating),
        content: content.trim(),
      });

      if (response.data.isSuccess) {
        onSuccess?.(response.data.result);
        onClose();
      } else {
        setError(response.data.message || "후기 작성에 실패했습니다.");
      }
    } catch (err) {
      console.error("후기 작성 실패:", err);
      setError(err.response?.data?.message || "후기 작성 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (!open || !item) return null;

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.drawer}>
        {/* 헤더 */}
        <header className={styles.header}>
          <button className={styles.close} onClick={onClose} aria-label="닫기">
            <Icon icon="solar:close-circle-linear" />
          </button>
          <h3 className={styles.title}>거래 후기 작성</h3>
          <div className={styles.headerPlaceholder} />
        </header>

        {/* 상품 정보 */}
        <div className={styles.itemInfo}>
          {item.image && (
            <img
              src={item.image}
              alt={item.title}
              className={styles.itemImage}
            />
          )}
          <div className={styles.itemDetails}>
            <h4 className={styles.itemTitle}>{item.title}</h4>
            <p className={styles.itemPrice}>₩ {item.finalPrice?.toLocaleString()}</p>
          </div>
        </div>

        {/* 폼 */}
        <form className={styles.form} onSubmit={handleSubmit}>
          {/* 별점 선택 */}
          <div className={styles.formGroup}>
            <label className={styles.label}>거래는 어떠셨나요?</label>
            <div className={styles.ratingSelect}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={styles.starButton}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  aria-label={`${star}점`}
                >
                  <Icon
                    icon={
                      star <= (hoveredRating || rating)
                        ? "solar:star-bold"
                        : "solar:star-linear"
                    }
                    className={styles.starIcon}
                  />
                </button>
              ))}
            </div>
            <p className={styles.ratingText}>
              {rating === 1 && "별로예요"}
              {rating === 2 && "조금 아쉬워요"}
              {rating === 3 && "보통이에요"}
              {rating === 4 && "좋아요"}
              {rating === 5 && "최고예요!"}
            </p>
          </div>

          {/* 후기 내용 */}
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="reviewContent">
              후기를 작성해주세요
            </label>
            <textarea
              id="reviewContent"
              className={styles.textarea}
              placeholder="거래 상대방에게 따뜻한 후기를 남겨주세요. (최소 10자)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              maxLength={500}
            />
            <div className={styles.charCount}>
              {content.length} / 500
            </div>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className={styles.error}>
              <Icon icon="solar:info-circle-bold" />
              {error}
            </div>
          )}

          {/* 버튼 */}
          <div className={styles.buttons}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
              disabled={loading}
            >
              취소
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading || !content.trim()}
            >
              {loading ? (
                <>
                  <Icon icon="svg-spinners:ring-resize" width="20" height="20" />
                  작성 중...
                </>
              ) : (
                "후기 작성"
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
