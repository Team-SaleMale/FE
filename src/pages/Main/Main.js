// src/pages/Main/Main.jsx
import { useNavigate } from "react-router-dom";
import MainHeroSection from "./MainHeroSection";
import WhyValueBid from "./WhyValueBid";
import Participation from "./Participation";
import Trending from "./Trending";
import Ending from "./Ending";
import Featured from "./Featured";
import CategoryPopular from "./CategoryPopular";
import AuctionVideos from "./AuctionVideos";
import Completed from "./Completed";
import CompanyIntro from "./CompanyIntro";
import styles from "../../styles/Main/Main.module.css";

export default function Main() {
  const navigate = useNavigate();

  return (
    <main className={styles.mainPage}>
      <MainHeroSection />
      <WhyValueBid />

      <Participation
        onJoinClick={() => navigate("/auctions")}
        onRegisterClick={() => navigate("/auctions/new")}
      />

      {/* 실시간 인기 경매 (API 연동) */}
      <Trending />

      {/* 오늘 마감 경매 (API 연동) */}
      <Ending />

      {/* 카테고리별 인기 상품 (API 연동) */}
      <CategoryPopular />

      {/* 이하 섹션 */}
      <Featured />
      <AuctionVideos />
      <Completed />
      <CompanyIntro />
    </main>
  );
}
