import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Main from "./pages/Main/Main";
import AuctionList from "./pages/AuctionList/AuctionList";
import AuctionRegistration from "./pages/AuctionRegistration/AuctionRegistration";
import AuctionComplete from "./pages/AuctionRegistration/AuctionComplete";
import FeaturedProductDetail from "./pages/Main/FeaturedProductDetail";
import AuctionProductDetails from "./pages/AuctionProductDetails/AuctionProductDetails"
import VideoBrowser from "./pages/Main/VideoBrowser";

import Video from "./pages/Main/Video";                // ✅ 재생 페이지 추가

export default function App() {
  return (
    
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/featured/:category" element={<FeaturedProductDetail />} />
        <Route path="/auctions" element={<AuctionList />} />
        <Route path="/auctions/new" element={<AuctionRegistration />} />
        <Route path="/videos" element={<VideoBrowser />} />   {/* ✅ 절대경로 */}
        <Route path="/video/:videoId" element={<Video />} />  {/* ✅ 재생 라우트 */}
        <Route path="/auctions/success" element={<AuctionComplete />} />
        <Route path="/auctions/300" element={<AuctionProductDetails />} />
        
         
      </Routes>
    
  );
}
