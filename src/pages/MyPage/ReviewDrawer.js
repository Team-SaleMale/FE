import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import styles from "../../styles/MyPage/ReviewDrawer.module.css";
import { mypageService } from "../../api/mypage/service";

export default function ReviewDrawer({ open, onClose }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    size: 20,
    hasNext: false,
    hasPrevious: false,
  });

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      fetchReviews(0);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const ratingToNumber = (rating) => {
    const ratingMap = {
      ONE: 1,
      TWO: 2,
      THREE: 3,
      FOUR: 4,
      FIVE: 5,
    };
    return ratingMap[rating] || 5;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  const fetchReviews = async (page = 0) => {
    try {
      setLoading(true);
      const response = await mypageService.getReceivedReviews({ page, size: 20 });

      if (response.data.isSuccess && response.data.result) {
        const { reviews: apiReviews, totalElements, totalPages, currentPage, size, hasNext, hasPrevious } = response.data.result;

        const transformedReviews = apiReviews.map((review) => ({
          id: review.reviewId,
          reviewer: {
            name: review.reviewerNickname,
            avatar: review.reviewerProfileImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
          },
          product: {
            title: review.itemTitle,
            image: review.itemImageUrl || "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=150&auto=format&fit=crop",
          },
          rating: ratingToNumber(review.rating),
          comment: review.content,
          date: formatDate(review.createdAt),
        }));

        setReviews(transformedReviews);
        setPagination({
          currentPage,
          totalPages,
          totalElements,
          size,
          hasNext,
          hasPrevious,
        });
      }
    } catch (error) {
      console.error("후기 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    fetchReviews(newPage);
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
          <h3 className={styles.title}>
            받은 후기 {pagination.totalElements > 0 && `(${pagination.totalElements})`}
          </h3>
          <div className={styles.headerPlaceholder} />
        </header>

        {/* 후기 목록 */}
        <div className={styles.reviewList}>
          {loading ? (
            <div className={styles.loadingContainer}>
              <Icon icon="svg-spinners:ring-resize" width="40" height="40" />
              <p>후기를 불러오는 중...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className={styles.emptyContainer}>
              <Icon icon="solar:inbox-line-linear" width="60" height="60" />
              <p>아직 받은 후기가 없습니다.</p>
            </div>
          ) : (
            <>
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

              {/* 페이징 버튼 */}
              {pagination.totalPages > 1 && (
                <div className={styles.pagination}>
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrevious}
                    className={styles.pageButton}
                  >
                    <Icon icon="solar:alt-arrow-left-linear" />
                    이전
                  </button>
                  <span className={styles.pageInfo}>
                    {pagination.currentPage + 1} / {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNext}
                    className={styles.pageButton}
                  >
                    다음
                    <Icon icon="solar:alt-arrow-right-linear" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
