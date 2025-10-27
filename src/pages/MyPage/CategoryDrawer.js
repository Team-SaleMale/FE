import { Icon } from "@iconify/react";
import { useEffect } from "react";
import styles from "../../styles/MyPage/CategoryDrawer.module.css";

export default function CategoryDrawer({ open, onClose, selectedCategories, onToggleCategory }) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // 전체 카테고리 목록 (경매 등록과 동일)
  const allCategories = [
    { id: "women-acc", name: "여성잡화", icon: "solar:bag-smile-outline" },
    { id: "food-processed", name: "가공식품", icon: "solar:chef-hat-linear" },
    { id: "sports", name: "스포츠/레저", icon: "solar:balls-linear" },
    { id: "plant", name: "식물", icon: "solar:waterdrop-linear" },
    { id: "game-hobby", name: "게임/취미/음반", icon: "solar:reel-2-broken" },
    { id: "ticket", name: "티켓", icon: "solar:ticket-sale-linear" },
    { id: "furniture", name: "가구/인테리어", icon: "solar:armchair-2-linear" },
    { id: "beauty", name: "뷰티/미용", icon: "solar:magic-stick-3-linear" },
    { id: "clothes", name: "의류", icon: "solar:hanger-broken" },
    { id: "health-food", name: "건강기능식품", icon: "solar:dumbbell-large-minimalistic-linear" },
    { id: "book", name: "도서", icon: "solar:notebook-broken" },
    { id: "kids", name: "유아동", icon: "solar:smile-circle-linear" },
    { id: "digital", name: "디지털 기기", icon: "solar:laptop-minimalistic-linear" },
    { id: "living-kitchen", name: "생활/주방", icon: "solar:whisk-linear" },
    { id: "home-appliance", name: "생활가전", icon: "solar:washing-machine-minimalistic-linear" },
    { id: "etc", name: "기타", icon: "solar:add-square-broken" },
  ];

  if (!open) return null;

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.drawer}>
        {/* 헤더 */}
        <header className={styles.header}>
          <button className={styles.close} onClick={onClose} aria-label="닫기">
            <Icon icon="solar:close-circle-linear" />
          </button>
          <h3 className={styles.title}>관심 카테고리 설정</h3>
          <div className={styles.headerPlaceholder} />
        </header>

        {/* 설명 */}
        <div className={styles.description}>
          관심 있는 카테고리를 선택하면 맞춤형 경매 정보를 받을 수 있습니다.
        </div>

        {/* 카테고리 목록 */}
        <div className={styles.categoryList}>
          {allCategories.map((category) => {
            const isSelected = selectedCategories.includes(category.id);
            return (
              <button
                key={category.id}
                className={`${styles.categoryItem} ${isSelected ? styles.selected : ""}`}
                onClick={() => onToggleCategory(category.id)}
              >
                <div className={styles.categoryIcon}>
                  <Icon icon={category.icon} />
                </div>
                <span className={styles.categoryName}>{category.name}</span>
                {isSelected && (
                  <div className={styles.checkIcon}>
                    <Icon icon="solar:check-circle-bold" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
