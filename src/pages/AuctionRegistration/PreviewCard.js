import styles from "../../styles/AuctionRegistration/PreviewCard.module.css";

export default function PreviewCard({
  imageUrl = "",
  title = "미리보기",
  views = 0,
  bidders = 0,
  timeLeftLabel = "--:--:--",
  startPrice = 0,
  currentPrice = 0,
}) {
  // 최소 레이아웃(임시). 나중에 실제 디자인으로 교체
  return (
    <div className={styles.card}>
      <div className={styles.thumb}>{imageUrl ? <img src={imageUrl} alt="" /> : "이미지"}</div>
      <div className={styles.body}>
        <div className={styles.title}>{title}</div>
        <div className={styles.meta}>views {views} · bidders {bidders}</div>
        <div className={styles.time}>남은 시간 {timeLeftLabel}</div>
        <div className={styles.startprice}>시작가 {startPrice.toLocaleString()} </div>
        <div className={styles.price}> 현재가 {currentPrice.toLocaleString()}</div>
        
      </div>
    </div>
  );
}


