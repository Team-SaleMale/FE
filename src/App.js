import { Routes, Route, useLocation } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import Main from "./pages/Main/Main";
import AuctionList from "./pages/AuctionList/AuctionList";
import AuctionRegistration from "./pages/AuctionRegistration/AuctionRegistration";
import AuctionComplete from "./pages/AuctionRegistration/AuctionComplete";
import FeaturedProductDetail from "./pages/Main/FeaturedProductDetail";
import AuctionProductDetails from "./pages/AuctionProductDetails/AuctionProductDetails";
import VideoBrowser from "./pages/Main/VideoBrowser";
import Video from "./pages/Main/Video";                // ✅ 재생 페이지 추가
import MyPage from "./pages/MyPage/MyPage";
import Header from "./components/common/Header";
import Footer from "./components/common/Footer";
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import "./App.css";                                   // ✅ develop 브랜치 반영

export default function App() {
  const location = useLocation();
  const hideLayout = location.pathname === "/login"; // 로그인 페이지일 때
  const hideAuthLayout = hideLayout || location.pathname === "/signup"; // NOTE(ChatGPT): 회원가입도 숨김

  return (
    <>
     {/* 라우트가 바뀔 때마다 맨 위로 */}
      <ScrollToTop behavior="auto" />
      {!hideAuthLayout && <Header />}
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/featured/:category" element={<FeaturedProductDetail />} />
        <Route path="/auctions" element={<AuctionList />} />
        <Route path="/auctions/new" element={<AuctionRegistration />} />
        <Route path="/videos" element={<VideoBrowser />} />   {/* ✅ 절대경로 */}
        <Route path="/video/:videoId" element={<Video />} />  {/* ✅ 재생 라우트 */}
        <Route path="/auctions/success" element={<AuctionComplete />} />
        <Route path="/auctions/300" element={<AuctionProductDetails />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/login" element={<Login />}/>
        <Route path="/signup" element={<Signup />}/>
      </Routes>
      {!hideAuthLayout && <Footer />}
    </>
  );
}
