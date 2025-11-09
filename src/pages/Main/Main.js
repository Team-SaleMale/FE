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

      {/* 실시간 인기 경매 (status=POPULAR) */}
      <Trending />

      {/* 마감 임박 경매 (sort=END_TIME_ASC) */}
      <Ending />

      {/* 카테고리별 인기 상품 (status=POPULAR + categories) */}
      <CategoryPopular />


      {/* 이하 섹션 */}
      <Featured />
      <AuctionVideos />

      {/* 입찰 완료된 상품 (status=COMPLETED) */}
      <Completed pageSize={4} size={12} />
      
      <CompanyIntro />
    </main>
  );
}
