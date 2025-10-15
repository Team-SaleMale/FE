import styles from "../../styles/MyPage/MyPage.module.css";
import ProfileHeader from "./Overview/ProfileHeader";
import UserStats from "./Overview/UserStats";
import TabsNav from "./Overview/TabsNav";
import FiltersBar from "./Overview/FiltersBar";
import MyPageVertical from "./MyPageVertical";
import { useMemo, useState } from "react";
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

export default function MyPage() {
  const [activeTab, setActiveTab] = useState("낙찰완료");
  const [sortValue, setSortValue] = useState("latest");
  const [isSellingDrawerOpen, setSellingDrawerOpen] = useState(false);
  const [isPurchaseDrawerOpen, setPurchaseDrawerOpen] = useState(false);
  const [isChatDrawerOpen, setChatDrawerOpen] = useState(false);
  const [isChatListDrawerOpen, setChatListDrawerOpen] = useState(false);
  const [isReviewDrawerOpen, setReviewDrawerOpen] = useState(false);
  const [isCategoryDrawerOpen, setCategoryDrawerOpen] = useState(false);
  const [isLocationDrawerOpen, setLocationDrawerOpen] = useState(false);
  const [isWithdrawalDrawerOpen, setWithdrawalDrawerOpen] = useState(false);
  const [selectedChatItem, setSelectedChatItem] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState(["books", "pets", "appliances", "digital"]);
  const [userLocation, setUserLocation] = useState("서울 강서구 가양제3동");

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

  // 모두 닫기
  const closeAll = () => {
    setChatDrawerOpen(false);
    setChatListDrawerOpen(false);
    setSelectedChatItem(null);
  };

  const items = useMemo(
    () =>
      Array.from({ length: 6 }).map((_, i) => ({
        id: `mypage-${i}`,
        images: [
          "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1200&auto=format&fit=crop",
        ],
        title: "삼성 갤럭시 Z Fold 6 (512GB)",
        views: 0,
        bidders: 630,
        timeLeft: "02:10:05",
        startPrice: 1800000,
        currentPrice: 2130000,
        isEndingTodayOpen: activeTab !== "낙찰완료" && activeTab !== "유찰",
        isClosed: activeTab === "낙찰완료",
        isFailedBid: activeTab === "유찰",
      })),
    [activeTab]
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
        {/* 사이드바 */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarGroup}>
            <div className={styles.sidebarTitle}>거래 정보</div>
            <button className={styles.sidebarItem} onClick={openSellingDrawer}>판매내역</button>
            <button className={styles.sidebarItem} onClick={openPurchaseDrawer}>구매내역</button>
            <button className={styles.sidebarItem} onClick={openReviewDrawer}>전체 후기 보기</button>
            <button className={styles.sidebarItem} onClick={openChatList}>채팅 목록 보기</button>
          </div>

          <div className={styles.sidebarDivider} />

          <div className={styles.sidebarGroup}>
            <div className={styles.sidebarTitle}>내 정보</div>
            <button className={styles.sidebarItem} onClick={openCategoryDrawer}>카테고리 설정</button>
            <button className={styles.sidebarItem} onClick={openLocationDrawer}>동네 수정하기</button>
            <button className={styles.sidebarItem}>문의하기</button>
            <button className={styles.sidebarItem} onClick={openWithdrawalDrawer}>탈퇴하기</button>
          </div>
        </aside>

        {/* 메인 컨텐츠 */}
        <main className={styles.main}>
          {/* 프로필 섹션 */}
          <section className={styles.sectionBox}>
            <ProfileHeader selectedCategories={selectedCategories} userLocation={userLocation} />
          </section>

          {/* 통계 섹션 */}
          <section className={styles.sectionBox}>
            <UserStats />
          </section>

          <div className={styles.sectionDivider} />

          {/* 내 상품 영역 */}
          <section className={styles.products}>
            <header className={styles.productsHeader}>
              <h2 className={styles.productsTitle}>내 경매</h2>
            </header>
            <FiltersBar
              totalCount={6}
              sortValue={sortValue}
              onSortChange={setSortValue}
            />

            <TabsNav
              tabs={["전체", "판매한", "입찰중", "낙찰완료", "유찰"]}
              active={activeTab}
              onChange={setActiveTab}
            />

            <div className={styles.gridWrap}>
              <MyPageVertical items={items} onChatClick={openChatDrawer} />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}


