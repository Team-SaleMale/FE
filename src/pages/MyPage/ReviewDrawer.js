import { Icon } from "@iconify/react";
import { useEffect } from "react";
import styles from "../../styles/MyPage/ReviewDrawer.module.css";

export default function ReviewDrawer({ open, onClose }) {
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

  // 임시 후기 데이터
  const reviews = [
    {
      id: 1,
      reviewer: {
        name: "김철수",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
        location: "서울 강남구",
      },
      product: {
        title: "삼성 갤럭시 Z Fold 6 (512GB)",
        image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=150&auto=format&fit=crop",
      },
      rating: 5,
      comment: "친절하고 빠른 거래였습니다! 제품 상태도 설명과 정확히 일치했어요. 다음에도 거래하고 싶습니다.",
      date: "2024.01.15",
    },
    {
      id: 2,
      reviewer: {
        name: "이영희",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
        location: "서울 서초구",
      },
      product: {
        title: "애플 에어팟 프로 2세대",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=150&auto=format&fit=crop",
      },
      rating: 5,
      comment: "상품 상태가 설명과 정확히 일치해요 👍 포장도 꼼꼼히 해주셨어요!",
      date: "2024.01.10",
    },
    {
      id: 3,
      reviewer: {
        name: "박지민",
        avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop",
        location: "서울 강서구",
      },
      product: {
        title: "소니 WH-1000XM5 헤드폰",
        image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=150&auto=format&fit=crop",
      },
      rating: 4,
      comment: "좋은 거래였습니다. 시간 약속도 잘 지키시고 제품도 만족스러워요.",
      date: "2024.01.05",
    },
  ];

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
          <h3 className={styles.title}>받은 후기</h3>
          <div className={styles.headerPlaceholder} />
        </header>

        {/* 후기 목록 */}
        <div className={styles.reviewList}>
          {reviews.map((review) => (
            <div key={review.id} className={styles.reviewItem}>
              {/* 리뷰어 정보 */}
              <div className={styles.reviewerInfo}>
                <img
                  src={review.reviewer.avatar}
                  alt={review.reviewer.name}
                  className={styles.reviewerAvatar}
                />
                <div className={styles.reviewerDetails}>
                  <div className={styles.reviewerName}>{review.reviewer.name}</div>
                  <div className={styles.reviewerLocation}>{review.reviewer.location}</div>
                </div>
                <div className={styles.reviewDate}>{review.date}</div>
              </div>

              {/* 별점 */}
              <div className={styles.reviewRating}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Icon
                    key={star}
                    icon={star <= review.rating ? "solar:star-bold" : "solar:star-linear"}
                    className={styles.reviewStar}
                  />
                ))}
              </div>

              {/* 후기 내용 */}
              <p className={styles.reviewComment}>{review.comment}</p>

              {/* 상품 정보 */}
              <div className={styles.reviewProduct}>
                <img
                  src={review.product.image}
                  alt={review.product.title}
                  className={styles.productImage}
                />
                <div className={styles.productTitle}>{review.product.title}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
