import { useLocation, useNavigate } from "react-router-dom";
import PreviewCard from "./PreviewCard";
import styles from "../../styles/AuctionRegistration/AuctionComplete.module.css";

/**
 * navigate("/auctions/success", { state: { itemId, preview, startDate, endDate } })
 */
export default function AuctionComplete() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const itemId = state?.itemId;

  const fallbackPreview = {
    imageUrl: "",
    title: "아이패드 프로 12.9 6세대 256GB",
    views: 1500,
    bidders: 1260,
    timeLeftLabel: "01:45:20",
    startPrice: 1000000,
    currentPrice: 1500000,
  };
  const preview = state?.preview || fallbackPreview;

  const formatDate = (v) => {
    if (!v) return "";
    try {
      const d = new Date(v);
      if (isNaN(d.getTime())) {
        return String(v).slice(0, 10).replaceAll("-", "/");
      }
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}/${m}/${day}`;
    } catch {
      return "";
    }
  };

  const startDateLabel = formatDate(state?.startDate);
  const endDateLabel = formatDate(state?.endDate);

  return (
    <div className={styles.wrap}>
      <div className={styles.inner}>
        <section className={styles.left}>
          <div className={styles.head}>
            <div className={styles.check} aria-hidden>✓</div>
            <h1 className={styles.title}>상품이 성공적으로 등록되었습니다!!</h1>
          </div>

          <p className={styles.period}>
            경매는{" "}
            {startDateLabel && <strong>{startDateLabel}</strong>}
            {(startDateLabel || endDateLabel) && " ~ "}
            {endDateLabel && <strong>{endDateLabel}</strong>}
            {" "}까지 진행됩니다
          </p>

          <label className={styles.emailLabel}>
            경매가 낙찰되면 해당 이메일로 결과를 보내드립니다.
          </label>
          <div className={styles.emailInputWrap}>
            <span className={styles.mailIcon} aria-hidden>✉️</span>
            <input
              type="email"
              className={styles.emailInput}
              placeholder="email address"
              aria-label="email address"
            />
          </div>

          <p className={styles.status}>작성 완료</p>

          <div className={styles.btnRow}>
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={() => {
                if (itemId) navigate(`/auctions/${itemId}`);
                else navigate("/auctions");
              }}
            >
              등록 화면 확인하기
            </button>
            <button
              type="button"
              className={styles.ghostBtn}
              onClick={() => navigate("/auctions")}
            >
              상품 리스트 확인하기
            </button>
          </div>

          <div className={styles.help}>
            <p className={styles.helpQ}>도움이 필요하신가요??</p>
            <button
              type="button"
              className={styles.linkBtn}
              onClick={() => navigate("/support")}
            >
              고객센터 페이지로 이동
            </button>
          </div>
        </section>

        <aside className={styles.right}>
          <div className={styles.cardWrap}>
            <PreviewCard {...preview} />
          </div>
        </aside>
      </div>
    </div>
  );
}
