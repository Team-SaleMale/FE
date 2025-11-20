import styles from "../../../styles/MyPage/Overview/ProfileHeader.module.css";
import { Icon } from "@iconify/react";
import { useRef, useState, useEffect } from "react";
import { changeProfileImage } from "../../../api/users/service";

export default function ProfileHeader({ selectedCategories = [], userLocation = "서울 강서구 가양제3동", userProfile = null, onPasswordChange, onNicknameChange, onProfileImageChange }) {
  const [profileImage, setProfileImage] = useState(userProfile?.profileImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=400&auto=format&fit=crop");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // userProfile이 변경되면 profileImage 업데이트
  useEffect(() => {
    if (userProfile?.profileImage) {
      setProfileImage(userProfile.profileImage);
    }
  }, [userProfile]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 확장자 검증
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      alert('허용되지 않는 파일 형식입니다. (jpg, jpeg, png, gif, webp만 가능)');
      return;
    }

    // 파일 크기 검증 (50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('파일 크기는 50MB 이하여야 합니다.');
      return;
    }

    // 미리보기 표시
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImage(reader.result);
    };
    reader.readAsDataURL(file);

    // API 호출
    setIsUploading(true);
    try {
      const response = await changeProfileImage(file);
      const res = response?.data || response;

      if (res?.isSuccess) {
        console.log('프로필 이미지 변경 성공:', res.result);
        // 부모 컴포넌트에 업데이트된 프로필 전달
        if (onProfileImageChange) {
          onProfileImageChange(res.result);
        }
      } else {
        alert(res?.message || '프로필 이미지 변경에 실패했습니다.');
        // 실패 시 이전 이미지로 복원
        if (userProfile?.profileImage) {
          setProfileImage(userProfile.profileImage);
        }
      }
    } catch (error) {
      console.error('프로필 이미지 변경 실패:', error);
      alert('프로필 이미지 변경 중 오류가 발생했습니다.');
      // 실패 시 이전 이미지로 복원
      if (userProfile?.profileImage) {
        setProfileImage(userProfile.profileImage);
      }
    } finally {
      setIsUploading(false);
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
          <div className={styles.userName}>{userProfile?.nickname || "사용자"}</div>
          <div className={styles.buttonGroup}>
            <button className={styles.changeBtn} onClick={onNicknameChange}>
              닉네임 변경
            </button>
            <button className={styles.changeBtn} onClick={onPasswordChange}>
              비밀번호 변경
            </button>
          </div>
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


