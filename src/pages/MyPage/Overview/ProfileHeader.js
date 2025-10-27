import styles from "../../../styles/MyPage/Overview/ProfileHeader.module.css";
import { Icon } from "@iconify/react";
import { useRef, useState } from "react";

export default function ProfileHeader({ selectedCategories = [], userLocation = "서울 강서구 가양제3동" }) {
  const [profileImage, setProfileImage] = useState("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=400&auto=format&fit=crop");
  const fileInputRef = useRef(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  // 카테고리 매핑 (경매 등록과 동일)
  const categoryMap = {
    "women-acc": { name: "여성잡화", icon: "solar:bag-smile-outline" },
    "food-processed": { name: "가공식품", icon: "solar:chef-hat-linear" },
    "sports": { name: "스포츠/레저", icon: "solar:balls-linear" },
    "plant": { name: "식물", icon: "solar:waterdrop-linear" },
    "game-hobby": { name: "게임/취미/음반", icon: "solar:reel-2-broken" },
    "ticket": { name: "티켓", icon: "solar:ticket-sale-linear" },
    "furniture": { name: "가구/인테리어", icon: "solar:armchair-2-linear" },
    "beauty": { name: "뷰티/미용", icon: "solar:magic-stick-3-linear" },
    "clothes": { name: "의류", icon: "solar:hanger-broken" },
    "health-food": { name: "건강기능식품", icon: "solar:dumbbell-large-minimalistic-linear" },
    "book": { name: "도서", icon: "solar:notebook-broken" },
    "kids": { name: "유아동", icon: "solar:smile-circle-linear" },
    "digital": { name: "디지털 기기", icon: "solar:laptop-minimalistic-linear" },
    "living-kitchen": { name: "생활/주방", icon: "solar:whisk-linear" },
    "home-appliance": { name: "생활가전", icon: "solar:washing-machine-minimalistic-linear" },
    "etc": { name: "기타", icon: "solar:add-square-broken" },
  };
  return (
    <header className={styles.root}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <div className={styles.rowTop}>
        <div
          className={styles.avatar}
          onClick={handleAvatarClick}
          style={{
            backgroundImage: `url(${profileImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            cursor: 'pointer'
          }}
          title="프로필 사진 변경"
        />
        <div className={styles.userBlock}>
          <div className={styles.userName}>울릉한소우주강황</div>
        </div>
      </div>

      <div className={styles.rowBottomVertical}>
        <div className={styles.locationRow}>
          <div className={styles.location}>
            <Icon icon="solar:map-point-wave-outline" />
            <span>{userLocation}</span>
          </div>
        </div>

        <div className={styles.chipsRow}>
          <div className={styles.chips}>
            {selectedCategories.length > 0 ? (
              selectedCategories.map((catId) => {
                const cat = categoryMap[catId];
                if (!cat) return null;
                return (
                  <button key={catId} className={styles.chip}>
                    <Icon icon={cat.icon} />
                    <span>{cat.name}</span>
                  </button>
                );
              })
            ) : (
              <span className={styles.emptyText}>관심 카테고리를 설정해주세요</span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}


