/* global kakao */
import { Icon } from "@iconify/react";
import { useEffect, useRef, useState } from "react";
import styles from "../../styles/MyPage/LocationDrawer.module.css";

export default function LocationDrawer({ open, onClose, currentLocation, onSave }) {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [address, setAddress] = useState(currentLocation || "");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

  // 카카오맵 스크립트 동적 로드
  useEffect(() => {
    // 이미 스크립트가 로드되었는지 확인
    if (window.kakao && window.kakao.maps) {
      console.log("카카오맵 이미 로드됨");
      return;
    }

    // 스크립트가 이미 추가되었는지 확인
    const existingScript = document.querySelector('script[src*="dapi.kakao.com"]');
    if (existingScript) {
      console.log("스크립트 태그는 있음, 로드 대기 중...");
      return;
    }

    console.log("카카오맵 스크립트 동적 로드 시작");
    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=4d9b69e87d2782f8da69f740538a35a6&libraries=services&autoload=false`;
    script.async = false; // 동기적으로 로드

    script.onload = () => {
      console.log("카카오맵 스크립트 로드 완료");
      // 스크립트 로드 후 kakao.maps.load() 호출
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => {
          console.log("카카오맵 API 초기화 완료");
        });
      }
    };

    script.onerror = (e) => {
      console.error("카카오맵 스크립트 로드 실패", e);
    };

    document.head.appendChild(script);
  }, []);

  // 지도 초기화
  useEffect(() => {
    if (!open || !mapRef.current) return;

    console.log("LocationDrawer opened");

    // 카카오 맵 스크립트 로드 대기
    const initMap = () => {
      if (window.kakao && window.kakao.maps) {
        // kakao.maps.load() 콜백 안에서 지도 생성
        window.kakao.maps.load(() => {
          console.log("카카오 맵 API 로드 완료!");
          if (!mapRef.current) return; // 컴포넌트가 언마운트되었는지 확인

          const container = mapRef.current;
          const options = {
            center: new window.kakao.maps.LatLng(37.5665, 126.9780), // 서울시청
            level: 3,
          };
          console.log("지도 생성 시도...");
          const newMap = new window.kakao.maps.Map(container, options);
          console.log("지도 생성 성공!", newMap);
          setMap(newMap);

          // 마커 생성
          const newMarker = new window.kakao.maps.Marker({
            position: newMap.getCenter(),
          });
          newMarker.setMap(newMap);
          setMarker(newMarker);
        });
      } else {
        console.log("카카오 맵 API 아직 로드 안됨, 재시도...");
        setTimeout(initMap, 100);
      }
    };

    initMap();
  }, [open]);

  // 현재 위치 가져오기
  const handleGetCurrentLocation = () => {
    if (!window.kakao || !window.kakao.maps) {
      alert("지도가 로딩 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    setIsLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const latlng = new window.kakao.maps.LatLng(lat, lng);

          if (map) {
            map.setCenter(latlng);
            if (marker) {
              marker.setPosition(latlng);
            }

            // 주소 변환
            const geocoder = new window.kakao.maps.services.Geocoder();
            geocoder.coord2Address(lng, lat, (result, status) => {
              setIsLoading(false);
              if (status === window.kakao.maps.services.Status.OK) {
                const addr = result[0].address.address_name;
                setAddress(addr);
              }
            });
          } else {
            setIsLoading(false);
          }
        },
        (error) => {
          setIsLoading(false);
          alert("위치 정보를 가져올 수 없습니다.");
          console.error(error);
        }
      );
    } else {
      setIsLoading(false);
      alert("이 브라우저는 위치 정보를 지원하지 않습니다.");
    }
  };

  // 주소 검색
  const handleSearch = () => {
    if (!window.kakao || !window.kakao.maps) {
      alert("지도가 로딩 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    if (!searchKeyword.trim()) {
      alert("검색어를 입력해주세요.");
      return;
    }

    const ps = new window.kakao.maps.services.Places();
    ps.keywordSearch(searchKeyword, (data, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        const place = data[0];
        const latlng = new window.kakao.maps.LatLng(place.y, place.x);

        if (map) {
          map.setCenter(latlng);
          if (marker) {
            marker.setPosition(latlng);
          }
        }

        setAddress(place.address_name);
      } else {
        alert("검색 결과가 없습니다.");
      }
    });
  };

  const handleSave = () => {
    if (!address) {
      alert("위치를 선택해주세요.");
      return;
    }
    onSave(address);
    onClose();
  };

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
          <h3 className={styles.title}>동네 설정</h3>
          <div className={styles.headerPlaceholder} />
        </header>

        {/* 검색 */}
        <div className={styles.searchSection}>
          <div className={styles.searchBox}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="동네 이름을 검색하세요 (예: 강남역)"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
            <button className={styles.searchButton} onClick={handleSearch}>
              <Icon icon="solar:magnifer-linear" />
            </button>
          </div>
          <button className={styles.currentLocationButton} onClick={handleGetCurrentLocation} disabled={isLoading}>
            <Icon icon="solar:gps-linear" />
            {isLoading ? "위치 확인 중..." : "현재 위치로 설정"}
          </button>
        </div>

        {/* 지도 */}
        <div className={styles.mapContainer}>
          <div ref={mapRef} className={styles.map}></div>
        </div>

        {/* 선택된 주소 */}
        {address && (
          <div className={styles.addressSection}>
            <Icon icon="solar:map-point-wave-bold" className={styles.addressIcon} />
            <div className={styles.addressText}>{address}</div>
          </div>
        )}

        {/* 저장 버튼 */}
        <div className={styles.footer}>
          <button className={styles.saveButton} onClick={handleSave}>
            이 위치로 설정
          </button>
        </div>
      </div>
    </>
  );
}
