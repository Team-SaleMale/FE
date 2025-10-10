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
  const navigate = useNavigate(); // ← 추가

  return (
    <main className={styles.mainPage}>
      {/* 히어로: full-bleed(페이지 전체폭) */}
      <MainHeroSection />

      {/* 히어로 아래부터는 각 섹션이 자체적으로 너비/여백 관리 */}
      <WhyValueBid />

      <Participation
        onJoinClick={() => navigate("/auctions")}   // 가로형 기본
        onRegisterClick={() => navigate("/auctions/new")}
      />

      <Trending />
      <Ending/>
      <Featured/>
      <CategoryPopular/>
      <AuctionVideos/>
      <Completed/>
      <CompanyIntro/>
    </main>
  );
}
