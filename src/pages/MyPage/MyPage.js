import styles from "../../styles/MyPage/MyPage.module.css";
import ProfileHeader from "./Overview/ProfileHeader";
import UserStats from "./Overview/UserStats";
import TabsNav from "./Overview/TabsNav";
import FiltersBar from "./Overview/FiltersBar";
import MyPageVertical from "./MyPageVertical";
import { useMemo, useState, useEffect } from "react";
import SellingDrawer from "./SellingDrawer";
import SalesHistoryList from "./SalesHistory/SalesHistoryList";
import PurchaseDrawer from "./PurchaseDrawer";
import PurchaseHistoryList from "./PurchaseHistory/PurchaseHistoryList";
import ChatDrawer from "./ChatDrawer";
import ChatListDrawer from "./ChatListDrawer";
import ReviewDrawer from "./ReviewDrawer";
import CategoryDrawer from "./CategoryDrawer";
import LocationDrawer from "./LocationDrawer";
import WithdrawalDrawer from "./WithdrawalDrawer";
import WishlistDrawer from "./WishlistDrawer";
import WishlistList from "./Wishlist/WishlistList";
import { mypageApi } from "../../api/endpoints/mypage";

export default function MyPage() {
  const [activeTab, setActiveTab] = useState("낙찰");
  const [sortValue, setSortValue] = useState("latest");
  const [isSellingDrawerOpen, setSellingDrawerOpen] = useState(false);
  const [isPurchaseDrawerOpen, setPurchaseDrawerOpen] = useState(false);
  const [isChatDrawerOpen, setChatDrawerOpen] = useState(false);
  const [isChatListDrawerOpen, setChatListDrawerOpen] = useState(false);
  const [isReviewDrawerOpen, setReviewDrawerOpen] = useState(false);
  const [isCategoryDrawerOpen, setCategoryDrawerOpen] = useState(false);
  const [isLocationDrawerOpen, setLocationDrawerOpen] = useState(false);
  const [isWithdrawalDrawerOpen, setWithdrawalDrawerOpen] = useState(false);
  const [isWishlistDrawerOpen, setWishlistDrawerOpen] = useState(false);
  const [wishlistSortValue, setWishlistSortValue] = useState("deadline");
  const [selectedChatItem, setSelectedChatItem] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState(["book", "digital", "home-appliance", "beauty"]);
  const [userLocation, setUserLocation] = useState("서울 강서구 가양제3동");
  const [wishlistItems, setWishlistItems] = useState([]);
  const [auctionItems, setAuctionItems] = useState([]);
  const [auctionSummary, setAuctionSummary] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 프로필 조회
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await mypageApi.getProfile();
        if (response.data.isSuccess) {
          setUserProfile(response.data.result);
        }
      } catch (err) {
        console.error('프로필 조회 실패:', err);
      }
    };

    fetchProfile();
  }, []);

  // 탭 이름을 API type으로 변환
  const getAuctionType = (tabName) => {
    const typeMap = {
      "전체": "ALL",
      "판매": "SELLING",
      "입찰": "BIDDING",
      "낙찰": "WON",
      "유찰": "FAILED"
    };
    return typeMap[tabName] || "ALL";
  };

  // 정렬 값을 API sort로 변환
  const getSortType = (sortValue) => {
    const sortMap = {
      "latest": "CREATED_DESC",
      "price-high": "PRICE_DESC",
      "price-low": "PRICE_ASC"
    };
    return sortMap[sortValue] || "CREATED_DESC";
  };

  // 내 경매 목록 조회
  useEffect(() => {
    const fetchMyAuctions = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await mypageApi.getMyAuctions({
          type: getAuctionType(activeTab),
          sort: getSortType(sortValue),
          page: 0,
          size: 20
        });

        if (response.data.isSuccess) {
          setAuctionItems(response.data.result.items || []);
          setAuctionSummary(response.data.result.summary);
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        console.error('경매 목록 조회 실패:', err);
        setError(err.response?.data?.message || '경매 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchMyAuctions();
  }, [activeTab, sortValue]);

  // 찜한 상품 목록 조회
  useEffect(() => {
    const fetchLikedAuctions = async () => {
      try {
        const response = await mypageApi.getLikedAuctions({
          page: 0,
          size: 20
        });

        if (response.data.isSuccess) {
          const likedItems = response.data.result.likedItems || [];
          // API 응답을 컴포넌트에서 사용하는 형식으로 변환
          const formattedItems = likedItems.map(item => ({
            id: item.itemId,
            image: item.thumbnailUrl,
            title: item.title,
            bidders: item.bidderCount,
            timeLeft: calculateTimeLeft(item.endTime),
            currentPrice: 0, // API 응답에 가격 정보가 없는 경우 기본값
          }));
          setWishlistItems(formattedItems);
        }
      } catch (err) {
        console.error('찜한 목록 조회 실패:', err);
      }
    };

    fetchLikedAuctions();
  }, []);

  // 시간 차이 계산 헬퍼 함수
  const calculateTimeLeft = (endTime) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end - now;

    if (diff <= 0) return "종료";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}일 ${hours}시간`;
    if (hours > 0) return `${hours}시간 ${minutes}분`;
    return `${minutes}분`;
  };

  const openSellingDrawer = () => setSellingDrawerOpen(true);
  const closeSellingDrawer = () => setSellingDrawerOpen(false);
  const openPurchaseDrawer = () => setPurchaseDrawerOpen(true);
  const closePurchaseDrawer = () => setPurchaseDrawerOpen(false);

  // 채팅 버튼 클릭 -> ChatDrawer 열림
  const openChatDrawer = (item) => {
    setSelectedChatItem(item);
    setChatDrawerOpen(true);
    setChatListDrawerOpen(false);
  };

  // ChatDrawer 뒤로 가기 -> ChatListDrawer 열림
  const handleBackFromChat = () => {
    setChatDrawerOpen(false);
    setChatListDrawerOpen(true);
  };

  // ChatListDrawer에서 채팅 선택 -> ChatDrawer 열림
  const handleSelectChatFromList = (chat) => {
    // chat 객체를 item 형식으로 변환
    const item = {
      id: chat.id,
      image: chat.productImage,
      title: chat.productTitle,
      currentPrice: 2130000, // 임시 가격
    };
    setSelectedChatItem(item);
    setChatDrawerOpen(true);
    setChatListDrawerOpen(false);
  };

  // 채팅 목록 열기
  const openChatList = () => {
    setChatListDrawerOpen(true);
    setChatDrawerOpen(false);
    setSelectedChatItem(null);
  };

  // 후기 드로어 열기/닫기
  const openReviewDrawer = () => setReviewDrawerOpen(true);
  const closeReviewDrawer = () => setReviewDrawerOpen(false);

  // 카테고리 드로어 열기/닫기
  const openCategoryDrawer = () => setCategoryDrawerOpen(true);
  const closeCategoryDrawer = () => setCategoryDrawerOpen(false);

  // 카테고리 토글
  const handleToggleCategory = (categoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // 동네 설정 드로어 열기/닫기
  const openLocationDrawer = () => setLocationDrawerOpen(true);
  const closeLocationDrawer = () => setLocationDrawerOpen(false);

  // 동네 저장
  const handleSaveLocation = (newLocation) => {
    setUserLocation(newLocation);
    // localStorage에 저장 (백엔드 연결 전까지 임시)
    localStorage.setItem("userLocation", newLocation);
  };

  // 탈퇴 드로어 열기/닫기
  const openWithdrawalDrawer = () => setWithdrawalDrawerOpen(true);
  const closeWithdrawalDrawer = () => setWithdrawalDrawerOpen(false);

  // 찜한 목록 드로어 열기/닫기
  const openWishlistDrawer = () => setWishlistDrawerOpen(true);
  const closeWishlistDrawer = () => setWishlistDrawerOpen(false);

  // 찜 제거
  const handleRemoveWishlist = (item) => {
    setWishlistItems((prev) => prev.filter((it) => it.id !== item.id));
  };

  // 모두 닫기
  const closeAll = () => {
    setChatDrawerOpen(false);
    setChatListDrawerOpen(false);
    setSelectedChatItem(null);
  };

  // API 데이터를 컴포넌트 형식으로 변환
  const items = useMemo(
    () =>
      auctionItems.map((item) => ({
        id: item.itemId,
        images: [item.thumbnailUrl],
        title: item.title,
        views: item.viewCount,
        bidders: item.bidderCount,
        timeLeft: calculateTimeLeft(item.endTime),
        startPrice: item.startPrice,
        currentPrice: item.currentPrice,
        isEndingTodayOpen: activeTab !== "낙찰" && activeTab !== "유찰",
        isClosed: activeTab === "낙찰" || item.itemStatus === "CLOSED",
        isFailedBid: activeTab === "유찰" || item.itemStatus === "FAILED",
        myRole: item.myRole,
        isHighestBidder: item.isHighestBidder,
      })),
    [auctionItems, activeTab]
  );

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <SellingDrawer open={isSellingDrawerOpen} onClose={closeSellingDrawer} title="판매내역">
          <SalesHistoryList items={items.map(i => ({
            id: i.id,
            image: i.images?.[0],
            title: i.title,
            tradeType: "직거래",
            finalPrice: i.currentPrice,
            status: i.isClosed ? "SOLD" : "IN_PROGRESS",
          }))} />
        </SellingDrawer>

        <PurchaseDrawer open={isPurchaseDrawerOpen} onClose={closePurchaseDrawer} title="구매내역">
          <PurchaseHistoryList items={items.map(i => ({
            id: i.id,
            image: i.images?.[0],
            title: i.title,
            tradeType: "직거래",
            finalPrice: i.currentPrice,
          }))} />
        </PurchaseDrawer>

        <ChatDrawer
          open={isChatDrawerOpen}
          onClose={closeAll}
          onBack={handleBackFromChat}
          item={selectedChatItem}
        />
        <ChatListDrawer
          open={isChatListDrawerOpen}
          onClose={closeAll}
          onSelectChat={handleSelectChatFromList}
        />
        <ReviewDrawer open={isReviewDrawerOpen} onClose={closeReviewDrawer} />
        <CategoryDrawer
          open={isCategoryDrawerOpen}
          onClose={closeCategoryDrawer}
          selectedCategories={selectedCategories}
          onToggleCategory={handleToggleCategory}
        />
        <LocationDrawer
          open={isLocationDrawerOpen}
          onClose={closeLocationDrawer}
          currentLocation={userLocation}
          onSave={handleSaveLocation}
        />
        <WithdrawalDrawer
          open={isWithdrawalDrawerOpen}
          onClose={closeWithdrawalDrawer}
        />
        <WishlistDrawer
          open={isWishlistDrawerOpen}
          onClose={closeWishlistDrawer}
          title="찜한 목록"
          sortValue={wishlistSortValue}
          onSortChange={setWishlistSortValue}
        >
          <WishlistList
            items={wishlistItems}
            onItemClick={(item) => console.log("Item clicked:", item)}
            onRemoveWishlist={handleRemoveWishlist}
          />
        </WishlistDrawer>
        {/* 사이드바 */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarGroup}>
            <div className={styles.sidebarTitle}>거래 정보</div>
            <button className={styles.sidebarItem} onClick={openSellingDrawer}>판매내역</button>
            <button className={styles.sidebarItem} onClick={openPurchaseDrawer}>구매내역</button>
            <button className={styles.sidebarItem} onClick={openWishlistDrawer}>찜한 목록</button>
            <button className={styles.sidebarItem} onClick={openReviewDrawer}>전체 후기 보기</button>
            <button className={styles.sidebarItem} onClick={openChatList}>채팅 목록 보기</button>
          </div>

          <div className={styles.sidebarDivider} />

          <div className={styles.sidebarGroup}>
            <div className={styles.sidebarTitle}>내 정보</div>
            <button className={styles.sidebarItem} onClick={openCategoryDrawer}>카테고리 설정</button>
            <button className={styles.sidebarItem} onClick={openLocationDrawer}>동네 수정하기</button>
            <button className={styles.sidebarItem} onClick={() => navigate("/inquiries")}>문의하기</button>
            <button className={styles.sidebarItem} onClick={openWithdrawalDrawer}>탈퇴하기</button>
          </div>
        </aside>

        {/* 메인 컨텐츠 */}
        <main className={styles.main}>
          {/* 프로필 섹션 */}
          <section className={styles.sectionBox}>
            <ProfileHeader selectedCategories={selectedCategories} userLocation={userLocation} userProfile={userProfile} />
          </section>

          {/* 통계 섹션 */}
          <section className={styles.sectionBox}>
            <UserStats mannerScore={userProfile?.mannerScore || 0} />
          </section>

          <div className={styles.sectionDivider} />

          {/* 내 상품 영역 */}
          <section className={styles.products}>
            <header className={styles.productsHeader}>
              <h2 className={styles.productsTitle}>내 경매</h2>
            </header>
            <FiltersBar
              totalCount={auctionSummary?.totalCount || 0}
              sortValue={sortValue}
              onSortChange={setSortValue}
            />

            <TabsNav
              tabs={["전체", "판매", "입찰", "낙찰", "유찰"]}
              active={activeTab}
              onChange={setActiveTab}
            />

            <div className={styles.gridWrap}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  로딩 중...
                </div>
              ) : error ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#f44336' }}>
                  {error}
                </div>
              ) : items.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                  등록된 경매가 없습니다.
                </div>
              ) : (
                <MyPageVertical items={items} onChatClick={openChatDrawer} />
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}


