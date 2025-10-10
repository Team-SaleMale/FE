import styles from "../../styles/MyPage/MyPage.module.css";
import ProfileHeader from "./Overview/ProfileHeader";
import UserStats from "./Overview/UserStats";
import TabsNav from "./Overview/TabsNav";
import FiltersBar from "./Overview/FiltersBar";
import Vertical from "../AuctionList/Vertical";
import { useMemo, useState } from "react";
import SellingDrawer from "./SellingDrawer";
import SalesHistoryList from "./SalesHistory/SalesHistoryList";
import PurchaseDrawer from "./PurchaseDrawer";
import PurchaseHistoryList from "./PurchaseHistory/PurchaseHistoryList";

export default function MyPage() {
  const [activeTab, setActiveTab] = useState("낙찰완료");
  const [sortValue, setSortValue] = useState("latest");
  const [isSellingDrawerOpen, setSellingDrawerOpen] = useState(false);
  const [isPurchaseDrawerOpen, setPurchaseDrawerOpen] = useState(false);

  const openSellingDrawer = () => setSellingDrawerOpen(true);
  const closeSellingDrawer = () => setSellingDrawerOpen(false);
  const openPurchaseDrawer = () => setPurchaseDrawerOpen(true);
  const closePurchaseDrawer = () => setPurchaseDrawerOpen(false);

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
        isEndingTodayOpen: activeTab !== "낙찰완료",
        isClosed: activeTab === "낙찰완료",
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
        {/* 사이드바 */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarGroup}>
            <div className={styles.sidebarTitle}>거래 정보</div>
            <button className={styles.sidebarItem} onClick={openSellingDrawer}>판매내역</button>
            <button className={styles.sidebarItem} onClick={openPurchaseDrawer}>구매내역</button>
          </div>

          <div className={styles.sidebarDivider} />

          <div className={styles.sidebarGroup}>
            <div className={styles.sidebarTitle}>내 정보</div>
            <button className={styles.sidebarItem}>거래후기</button>
            <button className={styles.sidebarItem}>동네 수정하기</button>
            <button className={styles.sidebarItem}>탈퇴하기</button>
          </div>
        </aside>

        {/* 메인 컨텐츠 */}
        <main className={styles.main}>
          {/* 프로필 섹션 */}
          <section className={styles.sectionBox}>
            <ProfileHeader />
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
              tabs={["전체", "판매한", "입찰중", "낙찰완료"]}
              active={activeTab}
              onChange={setActiveTab}
            />

            <div className={styles.gridWrap}>
              <Vertical items={items} />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}


