// 입찰 완료된 상품 섹션
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import styles from "../../styles/Main/Completed.module.css";

// 더미 이미지 (프로젝트 내 존재하는 이미지 사용)
import nintendoImg from "../../assets/img/Main/Completed/image.png";

export default function Completed({ data, pageSize = 4, onCardClick }) {
  const navigate = useNavigate();

  // 더미 12개 (id/title/카테고리/가격/조회수)
  const fallback = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, i) => ({
        id: 200 + i + 1,
        title: "맥북 프로 16인치 M2",
        category: "디지털 기기",
        imageUrl: nintendoImg,
        finalPrice: 2850000,
        views: 350,
      })),
    []
  );

  const source = Array.isArray(data) && data.length ? data : fallback;

  const items = source
    .map((raw) => ({
      id: raw?.id ?? raw?.auctionId ?? raw?.productId,
      title: raw?.title ?? raw?.name ?? "",
      category: raw?.category ?? raw?.categoryName ?? "디지털 기기",
      imageUrl: raw?.imageUrl ?? raw?.img ?? raw?.image ?? nintendoImg,
      finalPrice: raw?.finalPrice ?? raw?.price ?? raw?.currentBid ?? 0,
      views: raw?.views ?? raw?.viewCount ?? 0,
    }))
    .filter((x) => x && x.id != null);

  // 페이지네이션 (4개씩)
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const start = page * pageSize;
  const visible = items.slice(start, start + pageSize);

  const toPrev = () => page > 0 && setPage((p) => p - 1);
  const toNext = () => page < totalPages - 1 && setPage((p) => p + 1);

  const goDetail = (id, item) => {
    if (typeof onCardClick === "function") return onCardClick(item);
    navigate(`/auctions/${id}`);
  };

  const formatWon = (n) => "₩" + Number(n ?? 0).toLocaleString("ko-KR");

  return (
    <section className={styles.completedSec} aria-label="입찰 완료된 상품">
      <div className={styles.container}>
        <div className={styles.head}>
          <h2 className={styles.title}>입찰 완료된 상품</h2>
          <div className={styles.navBtns}>
            <button
              className={styles.navBtn}
              onClick={toPrev}
              aria-label="이전 페이지"
              aria-disabled={page === 0}
              disabled={page === 0}
              tabIndex={page === 0 ? -1 : 0}
            >
              <Icon icon="solar:alt-arrow-left-linear" />
            </button>
            <button
              className={styles.navBtn}
              onClick={toNext}
              aria-label="다음 페이지"
              aria-disabled={page >= totalPages - 1}
              disabled={page >= totalPages - 1}
              tabIndex={page >= totalPages - 1 ? -1 : 0}
            >
              <Icon icon="solar:alt-arrow-right-linear" />
            </button>
          </div>
        </div>

        <ul className={styles.grid} role="list">
          {visible.map((it) => (
            <li key={it.id} className={styles.card}>
              <button
                type="button"
                className={styles.cardInner}
                onClick={() => goDetail(it.id, it)}
                aria-label={`${it.title} 상세로 이동`}
              >
                <div className={styles.thumbWrap}>
                  <img src={it.imageUrl} alt="" className={styles.thumb} />
                </div>

                <div className={styles.body}>
                  <p className={styles.views}>
                    <span className={styles.viewsNum}>
                      {Number(it.views).toLocaleString()}
                    </span>{" "}
                    views
                  </p>

                  <h3 className={styles.cardTitle}>{it.title}</h3>

                  <p className={styles.category}>{it.category}</p>

                  <div className={styles.footer}>
                    <span className={styles.dim}>입찰 가격</span>
                    <strong className={styles.price}>
                      {formatWon(it.finalPrice)}
                    </strong>
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
