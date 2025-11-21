import { Routes, Route, useLocation } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import Main from "./pages/Main/Main";
import AuctionList from "./pages/AuctionList/AuctionList";
import AuctionRegistration from "./pages/AuctionRegistration/AuctionRegistration";
import AuctionComplete from "./pages/AuctionRegistration/AuctionComplete";
import FeaturedProductDetail from "./pages/Main/FeaturedProductDetail";
import AuctionProductDetails from "./pages/AuctionProductDetails/AuctionProductDetails";
import VideoBrowser from "./pages/Main/VideoBrowser";
import Video from "./pages/Main/Video";
import MyPage from "./pages/MyPage/MyPage";
import Header from "./components/common/Header";
import Footer from "./components/common/Footer";
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import "./App.css";
import PriceCheck from "./pages/PriceCheck/PriceCheck";
import InquiryList from "./pages/Inquiry/InquiryList";
import InquiryWrite from "./pages/Inquiry/InquiryWrite";
import InquiryDetail from "./pages/Inquiry/InquiryDetail";
import AuthCallback from "pages/Auth/AuthCallback";
import HotDealPage from "./pages/HotDeal/HotDeal";
import HotDealRegistration from "./pages/HotDealRegistration/HotDealRegistration";

// 🔥 비밀번호 재설정 페이지 import
import PasswordReset from "./pages/Auth/PasswordReset";

// 최초 가입 온보딩 모달
import CategoryOnboardingGate from "./components/modals/CategoryOnboardingGate";

console.log({ InquiryList, InquiryWrite, InquiryDetail });
console.log("[App] mounted path:", window.location.pathname, "hash:", window.location.hash);

export default function App() {
  const location = useLocation();
  const hideLayout = location.pathname === "/login";
  const hideAuthLayout = hideLayout || location.pathname === "/signup";

  return (
    <>
      <ScrollToTop behavior="auto" />
      {!hideAuthLayout && <Header />}

      <CategoryOnboardingGate />

      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/featured/:category" element={<FeaturedProductDetail />} />

        {/* 경매 */}
        <Route path="/auctions" element={<AuctionList />} />
        <Route path="/auctions/new" element={<AuctionRegistration />} />
        <Route path="/auctions/success" element={<AuctionComplete />} />
        <Route path="/auctions/:id" element={<AuctionProductDetails />} />

        {/* 동영상 */}
        <Route path="/videos" element={<VideoBrowser />} />
        <Route path="/video/:videoId" element={<Video />} />

        {/* 마이페이지/인증 */}
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* 🔥 비밀번호 재설정 */}
        <Route path="/password-reset" element={<PasswordReset />} />

        {/* 시세 확인 */}
        <Route path="/price-check" element={<PriceCheck />} />

        {/* 핫딜 */}
        <Route path="/hotdeal" element={<HotDealPage />} />
        <Route path="/hotdeal/registration" element={<HotDealRegistration />} />

        {/* 문의 */}
        <Route path="/inquiries" element={<InquiryList />} />
        <Route path="/inquiries/new" element={<InquiryWrite />} />
        <Route path="/inquiries/:id" element={<InquiryDetail />} />

        <Route path="/auth/callback/*" element={<AuthCallback />} />
      </Routes>

      {!hideAuthLayout && <Footer />}
    </>
  );
}
