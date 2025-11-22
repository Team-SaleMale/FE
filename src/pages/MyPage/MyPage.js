import styles from "../../styles/MyPage/MyPage.module.css";
import ProfileHeader from "./Overview/ProfileHeader";
import UserStats from "./Overview/UserStats";
import TabsNav from "./Overview/TabsNav";
import FiltersBar from "./Overview/FiltersBar";
import MyPageVertical from "./MyPageVertical";
import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SellingDrawer from "./SellingDrawer";
import SalesHistoryList from "./SalesHistory/SalesHistoryList";
import PurchaseDrawer from "./PurchaseDrawer";
import PurchaseHistoryList from "./PurchaseHistory/PurchaseHistoryList";
import ChatDrawer from "./ChatDrawer";
import ChatListDrawer from "./ChatListDrawer";
import ReviewDrawer from "./ReviewDrawer";
import CategoryDrawer from "./CategoryDrawer";
import LocationDrawer from "./LocationDrawer";
import NicknameChangeDrawer from "./NicknameChangeDrawer";
import PasswordChangeDrawer from "./PasswordChangeDrawer";
import WithdrawalDrawer from "./WithdrawalDrawer";
import WishlistDrawer from "./WishlistDrawer";
import WishlistList from "./Wishlist/WishlistList";
import { setRegion } from "../../api/users/service";
import { mypageService } from "../../api/mypage/service";
import { chatService } from "../../api/chat/service";
import { myProfile } from "../../api/auth/service";

export default function MyPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("전체");
  const [sortValue, setSortValue] = useState("latest");
  const [isSellingDrawerOpen, setSellingDrawerOpen] = useState(false);
  const [isPurchaseDrawerOpen, setPurchaseDrawerOpen] = useState(false);
  const [isChatDrawerOpen, setChatDrawerOpen] = useState(false);
  const [isChatListDrawerOpen, setChatListDrawerOpen] = useState(false);
  const [isReviewDrawerOpen, setReviewDrawerOpen] = useState(false);
  const [isCategoryDrawerOpen, setCategoryDrawerOpen] = useState(false);
  const [isLocationDrawerOpen, setLocationDrawerOpen] = useState(false);
  const [isNicknameChangeDrawerOpen, setNicknameChangeDrawerOpen] = useState(false);
  const [isPasswordChangeDrawerOpen, setPasswordChangeDrawerOpen] = useState(false);
  const [isWithdrawalDrawerOpen, setWithdrawalDrawerOpen] = useState(false);
  const [isWishlistDrawerOpen, setWishlistDrawerOpen] = useState(false);
  const [wishlistSortValue, setWishlistSortValue] = useState("deadline");
  const [selectedChatItem, setSelectedChatItem] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
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
        const response = await myProfile();
        console.log("프로필 응답:", response);
        if (response?.isSuccess) {
          const res = response.result || {};
          // develop: regions[] 구조 지원 + displayName 보강
          if (Array.isArray(res.regions) && res.regions.length > 0) {
            res.regions = res.regions.map((region) => ({
              ...region,
              displayName: region.displayName || `${region.sido} ${region.sigungu} ${region.eupmyeondong}`,
            }));
            setUserLocation(res.regions[0].displayName);
          }
          // main: 단일 region 구조 지원
          if (!Array.isArray(res.regions) && res.region?.displayName) {
            setUserLocation(res.region.displayName);
          }
          setUserProfile(res);
        }
      } catch (err) {
        console.error("프로필 조회 실패:", err);
      }
    };

    fetchProfile();
  }, []);

  // 선호 카테고리 조회
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await mypageService.getPreferredCategories();
        console.log("선호 카테고리 응답:", response);

        const result = response?.data || response;
        if (result?.isSuccess && result?.result?.categories) {
          // API 대문자 카테고리 → UI용 소문자/하이픈 변환
          const categoryMap = {
            WOMEN_ACC: "women-acc",
            FOOD_PROCESSED: "food-processed",
            SPORTS: "sports",
            PLANT: "plant",
            GAME_HOBBY: "game-hobby",
            TICKET: "ticket",
            FURNITURE: "furniture",
            BEAUTY: "beauty",
            CLOTHES: "clothes",
            HEALTH_FOOD: "health-food",
            BOOK: "book",
            KIDS: "kids",
            DIGITAL: "digital",
            LIVING_KITCHEN: "living-kitchen",
            HOME_APPLIANCE: "home-appliance",
            ETC: "etc",
          };

          const categories = result.result.categories.map((cat) => categoryMap[cat] || cat.toLowerCase());
          setSelectedCategories(categories);
        }
      } catch (err) {
        console.error("선호 카테고리 조회 실패:", err);
      }
    };

    fetchCategories();
  }, []);

  // 탭 이름을 API type으로 변환
  const getAuctionType = (tabName) => {
    const typeMap = {
      전체: "ALL",
      판매: "SELLING",
      입찰: "BIDDING",
      낙찰: "WON",
      유찰: "FAILED",
    };
    return typeMap[tabName] || "ALL";
  };

  // 정렬 값을 API sort로 변환
  const getSortType = (sv) => {
    const sortMap = {
      latest: "CREATED_DESC",
      "price-high": "PRICE_DESC",
      "price-low": "PRICE_ASC",
    };
    return sortMap[sv] || "CREATED_DESC";
  };

  // 내 경매 목록 조회
  useEffect(() => {
    const fetchMyAuctions = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await mypageService.getMyAuctions({
          type: getAuctionType(activeTab),
          sort: getSortType(sortValue),
          page: 0,
          size: 20,
        });

        const res = response?.data || response;
        if (res?.isSuccess) {
          setAuctionItems(res.result?.items || []);
          setAuctionSummary(res.result?.summary || null);
        } else {
          setError(res?.message || "요청 실패");
        }
      } catch (err) {
        console.error("경매 목록 조회 실패:", err);
        setError(err?.response?.data?.message || "경매 목록을 불러오는데 실패했습니다.");
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
        const response = await mypageService.getLikedAuctions({ page: 0, size: 20 });
        const res = response?.data || response;
        if (res?.isSuccess) {
          const likedItems = res.result?.likedItems || [];

          // 각 아이템의 상세 정보를 병렬로 조회하여 가격 정보 가져오기
          const itemsWithDetails = await Promise.all(
            likedItems.map(async (item) => {
              try {
                const detailResponse = await fetch(`${process.env.REACT_APP_API_URL || ''}/auctions/${item.itemId}`, {
                  headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`,
                  },
                });
                const detailData = await detailResponse.json();

                if (detailData?.isSuccess) {
                  const detail = detailData.result;
                  return {
                    id: item.itemId,
                    image: item.thumbnailUrl,
                    title: item.title,
                    bidders: item.bidderCount,
                    timeLeft: calculateTimeLeft(item.endTime),
                    startPrice: detail.startPrice,
                    currentPrice: detail.currentPrice,
                  };
                }
              } catch (err) {
                console.error(`아이템 ${item.itemId} 상세 조회 실패:`, err);
              }

              // 실패 시 기본값
              return {
                id: item.itemId,
                image: item.thumbnailUrl,
                title: item.title,
                bidders: item.bidderCount,
                timeLeft: calculateTimeLeft(item.endTime),
                startPrice: null,
                currentPrice: null,
              };
            })
          );

          setWishlistItems(itemsWithDetails);
        }
      } catch (err) {
        console.error("찜한 목록 조회 실패:", err);
      }
    };

    fetchLikedAuctions();
  }, []);

  // 시간 차이 계산
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

  // 채팅 버튼 클릭 -> 채팅방 생성 후 ChatDrawer 열림
  const openChatDrawer = async (item) => {
    try {
      if (item?.isClosed && item?.id && userProfile?.id) {
        console.log("채팅방 생성 시도:", { itemId: item.id, userId: userProfile.id });
        const response = await chatService.createChatRoom(item.id, userProfile.id);
        console.log("채팅방 생성 응답:", response);

        const res = response?.data || response;
        const chatId = res?.chatId;
        setSelectedChatItem(chatId ? { ...item, chatId } : item);
      } else {
        setSelectedChatItem(item);
      }
      setChatDrawerOpen(true);
      setChatListDrawerOpen(false);
    } catch (error) {
      console.error("채팅방 생성 실패:", error);
      setSelectedChatItem(item);
      setChatDrawerOpen(true);
      setChatListDrawerOpen(false);
      if (error?.response?.status !== 409) {
        console.warn("채팅방 생성 중 오류가 발생했지만 진행합니다.");
      }
    }
  };

  // ChatDrawer 뒤로가기 -> 리스트 열기
  const handleBackFromChat = () => {
    setChatDrawerOpen(false);
    setChatListDrawerOpen(true);
  };

  // ChatList에서 항목 선택 -> ChatDrawer 열기
  const handleSelectChatFromList = (chat) => {
    const item = {
      id: chat.id,
      image: chat.productImage,
      title: chat.productTitle,
      currentPrice: 2130000,
    };
    setSelectedChatItem(item);
    setChatDrawerOpen(true);
    setChatListDrawerOpen(false);
  };

  const openChatList = () => {
    setChatListDrawerOpen(true);
    setChatDrawerOpen(false);
    setSelectedChatItem(null);
  };

  const openReviewDrawer = () => setReviewDrawerOpen(true);
  const closeReviewDrawer = () => setReviewDrawerOpen(false);

  const openCategoryDrawer = () => setCategoryDrawerOpen(true);
  const closeCategoryDrawer = () => setCategoryDrawerOpen(false);

  // UI → API 카테고리 변환
  const uiToApiCategory = (uiId) => {
    const map = {
      "women-acc": "WOMEN_ACC",
      "food-processed": "FOOD_PROCESSED",
      sports: "SPORTS",
      plant: "PLANT",
      "game-hobby": "GAME_HOBBY",
      ticket: "TICKET",
      furniture: "FURNITURE",
      beauty: "BEAUTY",
      clothes: "CLOTHES",
      "health-food": "HEALTH_FOOD",
      book: "BOOK",
      kids: "KIDS",
      digital: "DIGITAL",
      "living-kitchen": "LIVING_KITCHEN",
      "home-appliance": "HOME_APPLIANCE",
      etc: "ETC",
    };
    return map[uiId] || uiId.toUpperCase();
  };

  // 카테고리 토글 (낙관적 업데이트 + 실패 시 롤백)
  const handleToggleCategory = async (categoryId) => {
    const previousCategories = [...selectedCategories];

    const newCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter((id) => id !== categoryId)
      : [...selectedCategories, categoryId];

    setSelectedCategories(newCategories);

    try {
      const apiCategories = newCategories.map(uiToApiCategory);
      console.log("전송할 카테고리 데이터:", apiCategories);
      const response = await mypageService.setPreferredCategories(apiCategories);
      const result = response?.data || response;
      if (!result?.isSuccess) {
        console.error("카테고리 저장 실패:", result?.message);
        setSelectedCategories(previousCategories);
      } else {
        console.log("카테고리 저장 성공!");
      }
    } catch (error) {
      console.error("카테고리 저장 중 오류:", error);
      setSelectedCategories(previousCategories);
    }
  };

  const openLocationDrawer = () => setLocationDrawerOpen(true);
  const closeLocationDrawer = () => setLocationDrawerOpen(false);

  // 동네 저장
  const handleSaveLocation = async (region) => {
    console.log("handleSaveLocation 호출됨, region:", region);
    try {
      console.log("setRegion API 호출:", { regionId: region.regionId, primary: true });
      const response = await setRegion({ regionId: region.regionId, primary: true });
      const res = response?.data || response;

      if (res?.isSuccess) {
        setUserLocation(region.displayName);
        // 프로필 재조회 → regions[] displayName 보강
        const profileResponse = await myProfile();
        if (profileResponse?.isSuccess) {
          const next = profileResponse.result || {};
          if (Array.isArray(next.regions) && next.regions.length > 0) {
            next.regions = next.regions.map((r) => ({
              ...r,
              displayName: r.displayName || `${r.sido} ${r.sigungu} ${r.eupmyeondong}`,
            }));
          }
          setUserProfile(next);
        }
        alert("동네가 설정되었습니다!");
        closeLocationDrawer();
      } else {
        console.error("동네 설정 실패, 응답:", response);
        alert(`동네 설정에 실패했습니다: ${res?.message || "알 수 없는 오류"}`);
      }
    } catch (error) {
      console.error("동네 설정 실패:", error);
      alert("동네 설정 중 오류가 발생했습니다.");
    }
  };

  const openNicknameChangeDrawer = () => setNicknameChangeDrawerOpen(true);
  const closeNicknameChangeDrawer = () => setNicknameChangeDrawerOpen(false);
  const handleNicknameChangeSuccess = (updatedProfile) => setUserProfile(updatedProfile);
  const handleProfileImageChange = (updatedProfile) => setUserProfile(updatedProfile);

  const openPasswordChangeDrawer = () => setPasswordChangeDrawerOpen(true);
  const closePasswordChangeDrawer = () => setPasswordChangeDrawerOpen(false);

  const openWithdrawalDrawer = () => setWithdrawalDrawerOpen(true);
  const closeWithdrawalDrawer = () => setWithdrawalDrawerOpen(false);

  const openWishlistDrawer = () => setWishlistDrawerOpen(true);
  const closeWishlistDrawer = () => setWishlistDrawerOpen(false);

  const handleRemoveWishlist = (item) => {
    setWishlistItems((prev) => prev.filter((it) => it.id !== item.id));
  };

  const closeAll = () => {
    setChatDrawerOpen(false);
    setChatListDrawerOpen(false);
    setSelectedChatItem(null);
  };

  // API 데이터를 컴포넌트 형식으로 변환
  const items = useMemo(() => {
    const mappedItems = auctionItems.map((item) => ({
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
      itemStatus: item.itemStatus,
    }));

    // "판매" 탭에서는 유찰 상품 제외
    if (activeTab === "판매") {
      return mappedItems.filter((item) => item.itemStatus !== "FAIL");
    }

    return mappedItems;
  }, [auctionItems, activeTab]);

  // 판매내역: itemStatus가 SELLING인 항목만 (진행중인 판매)
  const sellingItems = useMemo(
    () => items.filter((item) => item.itemStatus === "SELLING"),
    [items]
  );

  // 구매내역: itemStatus가 WON인 항목만 (낙찰받은 상품)
  const purchaseItems = useMemo(
    () => items.filter((item) => item.itemStatus === "WON"),
    [items]
  );

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <SellingDrawer open={isSellingDrawerOpen} onClose={closeSellingDrawer} title="판매내역">
          <SalesHistoryList
            items={sellingItems.map((i) => ({
              id: i.id,
              image: i.images?.[0],
              title: i.title,
              tradeType: "직거래",
              finalPrice: i.currentPrice,
              status: i.isClosed ? "SOLD" : "IN_PROGRESS",
            }))}
          />
        </SellingDrawer>

        <PurchaseDrawer open={isPurchaseDrawerOpen} onClose={closePurchaseDrawer} title="구매내역">
          <PurchaseHistoryList
            items={purchaseItems.map((i) => ({
              id: i.id,
              image: i.images?.[0],
              title: i.title,
              tradeType: "직거래",
              finalPrice: i.currentPrice,
            }))}
          />
        </PurchaseDrawer>

        <ChatDrawer
          open={isChatDrawerOpen}
          onClose={closeAll}
          onBack={handleBackFromChat}
          item={selectedChatItem}
          userId={userProfile?.id}
        />
        <ChatListDrawer
          open={isChatListDrawerOpen}
          onClose={closeAll}
          onSelectChat={handleSelectChatFromList}
          userId={userProfile?.id}
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
          currentRange={userProfile?.rangeSetting}
          // 단일 region 우선, 없으면 배열의 첫 항목
          currentRegion={userProfile?.region || userProfile?.regions?.[0]}
          onSave={handleSaveLocation}
        />
        <NicknameChangeDrawer
          open={isNicknameChangeDrawerOpen}
          onClose={closeNicknameChangeDrawer}
          currentNickname={userProfile?.nickname}
          onSuccess={handleNicknameChangeSuccess}
        />
        <PasswordChangeDrawer open={isPasswordChangeDrawerOpen} onClose={closePasswordChangeDrawer} />
        <WithdrawalDrawer open={isWithdrawalDrawerOpen} onClose={closeWithdrawalDrawer} />
        <WishlistDrawer
          open={isWishlistDrawerOpen}
          onClose={closeWishlistDrawer}
          title="찜한 목록"
          sortValue={wishlistSortValue}
          onSortChange={setWishlistSortValue}
        >
          <WishlistList items={wishlistItems} onItemClick={(item) => console.log("Item clicked:", item)} onRemoveWishlist={handleRemoveWishlist} />
        </WishlistDrawer>

        {/* 사이드바 */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarGroup}>
            <div className={styles.sidebarTitle}>거래 정보</div>
            <button className={styles.sidebarItem} onClick={openSellingDrawer}>
              판매내역
            </button>
            <button className={styles.sidebarItem} onClick={openPurchaseDrawer}>
              구매내역
            </button>
            <button className={styles.sidebarItem} onClick={openWishlistDrawer}>
              찜한 목록
            </button>
            <button className={styles.sidebarItem} onClick={openReviewDrawer}>
              전체 후기 보기
            </button>
            <button className={styles.sidebarItem} onClick={openChatList}>
              채팅 목록 보기
            </button>
          </div>

          <div className={styles.sidebarDivider} />

          <div className={styles.sidebarGroup}>
            <div className={styles.sidebarTitle}>내 정보</div>
            <button className={styles.sidebarItem} onClick={openCategoryDrawer}>
              카테고리 설정
            </button>
            <button className={styles.sidebarItem} onClick={openLocationDrawer}>
              동네 수정하기
            </button>
            <button className={styles.sidebarItem} onClick={() => navigate("/inquiries")}>
              문의하기
            </button>
            <button className={styles.sidebarItem} onClick={openWithdrawalDrawer}>
              탈퇴하기
            </button>
          </div>
        </aside>

        {/* 메인 컨텐츠 */}
        <main className={styles.main}>
          {/* 프로필 섹션 */}
          <section className={styles.sectionBox}>
            <ProfileHeader
              selectedCategories={selectedCategories}
              userLocation={userLocation}
              userProfile={userProfile}
              onNicknameChange={openNicknameChangeDrawer}
              onPasswordChange={openPasswordChangeDrawer}
              onProfileImageChange={handleProfileImageChange}
            />
          </section>

          {/* 통계 섹션 */}
          <section className={styles.sectionBox}>
            <UserStats
              mannerScore={userProfile?.mannerScore || 0}
              userId={userProfile?.id}
              onChatClick={(chat) => {
                if (chat && chat.chatId) openChatDrawer({ chatId: chat.chatId, ...chat });
              }}
              onViewAllChats={openChatList}
            />
          </section>

          <div className={styles.sectionDivider} />

          {/* 내 상품 영역 */}
          <section className={styles.products}>
            <header className={styles.productsHeader}>
              <h2 className={styles.productsTitle}>내 경매</h2>
            </header>
            <FiltersBar totalCount={auctionSummary?.totalCount || 0} sortValue={sortValue} onSortChange={setSortValue} />

            <TabsNav tabs={["전체", "판매", "입찰", "낙찰", "유찰"]} active={activeTab} onChange={setActiveTab} />

            <div className={styles.gridWrap}>
              {loading ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>로딩 중...</div>
              ) : error ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#f44336" }}>{error}</div>
              ) : items.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>등록된 경매가 없습니다.</div>
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
