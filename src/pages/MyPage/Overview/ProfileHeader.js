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
  // 카테고리 매핑
  const categoryMap = {
    books: { name: "도서", icon: "solar:notebook-broken" },
    pets: { name: "반려동물", icon: "solar:cat-linear" },
    appliances: { name: "생활가전", icon: "mdi:washing-machine" },
    digital: { name: "디지털 기기", icon: "mdi:television" },
    fashion: { name: "패션/의류", icon: "solar:t-shirt-linear" },
    beauty: { name: "뷰티/미용", icon: "solar:mirror-left-linear" },
    sports: { name: "스포츠/레저", icon: "solar:basketball-linear" },
    toys: { name: "장난감/취미", icon: "solar:gameboy-linear" },
    furniture: { name: "가구/인테리어", icon: "solar:sofa-3-linear" },
    food: { name: "식품", icon: "solar:chef-hat-linear" },
    plants: { name: "식물", icon: "solar:leaf-linear" },
    kids: { name: "유아동", icon: "solar:baby-carriage-linear" },
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


