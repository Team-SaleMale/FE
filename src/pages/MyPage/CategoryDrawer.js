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

  // 전체 카테고리 목록
  const allCategories = [
    { id: "books", name: "도서", icon: "solar:notebook-broken" },
    { id: "pets", name: "반려동물", icon: "solar:cat-linear" },
    { id: "appliances", name: "생활가전", icon: "mdi:washing-machine" },
    { id: "digital", name: "디지털 기기", icon: "mdi:television" },
    { id: "fashion", name: "패션/의류", icon: "solar:t-shirt-linear" },
    { id: "beauty", name: "뷰티/미용", icon: "solar:mirror-left-linear" },
    { id: "sports", name: "스포츠/레저", icon: "solar:basketball-linear" },
    { id: "toys", name: "장난감/취미", icon: "solar:gameboy-linear" },
    { id: "furniture", name: "가구/인테리어", icon: "solar:sofa-3-linear" },
    { id: "food", name: "식품", icon: "solar:chef-hat-linear" },
    { id: "plants", name: "식물", icon: "solar:leaf-linear" },
    { id: "kids", name: "유아동", icon: "solar:baby-carriage-linear" },
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
