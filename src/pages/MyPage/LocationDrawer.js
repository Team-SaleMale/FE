/* global kakao */
import { Icon } from "@iconify/react";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import styles from "../../styles/MyPage/LocationDrawer.module.css";
import { searchRegions } from "../../api/regions/service";
import { changeRange, nearbyRegionIds } from "../../api/users/service";

export default function LocationDrawer({ open, onClose, currentLocation, currentRange, currentRegion, onSave }) {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [address, setAddress] = useState(currentLocation || "");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [rangeSetting, setRangeSetting] = useState(currentRange || "NEAR");
  const [nearbyCount, setNearbyCount] = useState(null);
  const [loadingNearby, setLoadingNearby] = useState(false);

  // currentRange prop이 변경되면 rangeSetting 업데이트
  useEffect(() => {
    if (currentRange) {
      setRangeSetting(currentRange);
    }
  }, [currentRange]);

  // currentRegion이 있으면 selectedRegion 설정 및 지도 이동
  useEffect(() => {
    if (currentRegion && map && open) {
      console.log('현재 저장된 지역:', currentRegion);
      setSelectedRegion(currentRegion);
      setAddress(currentRegion.displayName);

      // 지도를 해당 지역으로 이동
      updateMapLocation(currentRegion.displayName);
    }
  }, [currentRegion, map, open]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      // drawer가 열릴 때 현재 반경으로 근처 지역 개수 조회
      fetchNearbyCount();
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // 활동 반경 변경 시 근처 지역 개수 조회
  useEffect(() => {
    if (open && rangeSetting) {
      fetchNearbyCount();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rangeSetting]);

  // 근처 지역 개수 조회
  const fetchNearbyCount = async () => {
    setLoadingNearby(true);
    try {
      const response = await nearbyRegionIds();
      console.log('근처 지역 조회:', response);

      // 응답이 data로 감싸졌거나 바로 오는 경우 모두 대응
      const res = response?.data || response;
      if (res?.isSuccess) {
        const regionIds = res.result || [];
        setNearbyCount(regionIds.length);
      } else {
        setNearbyCount(0);
      }
    } catch (error) {
      console.error('근처 지역 조회 실패:', error);
      setNearbyCount(0);
    } finally {
      setLoadingNearby(false);
    }
  };

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
    if (!open) return;

    console.log("LocationDrawer opened");

    // 카카오 맵 스크립트 로드 대기
    const initMap = () => {
      if (!mapRef.current) {
        console.log("mapRef.current가 없음, 재시도...");
        setTimeout(initMap, 50);
        return;
      }

      if (window.kakao && window.kakao.maps) {
        // kakao.maps.load() 콜백 안에서 지도 생성
        window.kakao.maps.load(() => {
          console.log("카카오 맵 API 로드 완료!");
          if (!mapRef.current) return; // 컴포넌트가 언마운트되었는지 확인

          const container = mapRef.current;
          const options = {
            center: new window.kakao.maps.LatLng(37.5665, 126.9780), // 서울시청
            level: 8,
          };
          console.log("지도 생성 시도...", container);
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

    // DOM이 렌더링되도록 약간의 지연 추가
    setTimeout(initMap, 100);
  }, [open]);

  // 현재 위치 가져오기 - 카카오맵 Geolocation + REST API 조합
  const handleGetCurrentLocation = async () => {
    if (!window.kakao || !window.kakao.maps) {
      alert("지도가 로딩 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    if (!map) {
      alert("지도가 준비되지 않았습니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    setIsLoading(true);

    // 카카오맵의 Geolocation 사용
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;  // 위도
          const lng = position.coords.longitude; // 경도
          const latlng = new window.kakao.maps.LatLng(lat, lng);

          try {
            // 1. 지도에 마커 표시 및 중심 이동
            console.log('현재 위치 좌표:', lat, lng);
            console.log('현재 지도 상태:', map);

            // 지도 중심 이동
            map.setCenter(latlng);
            map.setLevel(5);

            // 기존 마커 제거 후 새로 생성
            if (marker) {
              marker.setMap(null);
            }

            const newMarker = new window.kakao.maps.Marker({
              position: latlng,
              map: map
            });
            setMarker(newMarker);

            console.log('지도 중심 이동 완료:', map.getCenter());

            // 2. 카카오 REST API로 좌표 → 동 단위 변환
            const response = await axios.get(
              `https://dapi.kakao.com/v2/local/geo/coord2regioncode.json?x=${lng}&y=${lat}`,
              {
                headers: {
                  Authorization: `KakaoAK ${process.env.REACT_APP_KAKAO_REST_API_KEY}`
                }
              }
            );

            if (response.data && response.data.documents && response.data.documents.length > 0) {
              // 법정동 기준으로 행정구역 정보 추출
              const regionData = response.data.documents[0];
              const region1 = regionData.region_1depth_name; // 시/도
              const region2 = regionData.region_2depth_name; // 구/군
              const region3 = regionData.region_3depth_name; // 동/읍/면

              // 전체 주소 조합
              const fullAddress = `${region1} ${region2} ${region3}`;

              console.log('좌표 변환 결과:', { region1, region2, region3, fullAddress });

              // addressSection에 전체 주소 표시
              setAddress(fullAddress);

              // 띄어쓰기 기준으로 분리: "경기도 고양시 덕양구 도내동" -> ["경기도", "고양시", "덕양구", "도내동"]
              const addressParts = fullAddress.split(' ');
              const sido = addressParts[0]; // 첫 번째: 시/도 (예: 경기도)
              const sigungu = addressParts[1]; // 두 번째: 시/군/구 (예: 고양시)
              const eupmyeondong = addressParts[2]; // 세 번째: 구/읍/면/동 (예: 덕양구)

              console.log('검색어 분리:', { sido, sigungu, eupmyeondong });

              // 시군구로 검색 (handleSearch와 동일한 로직)
              const searchKeyword = sigungu;

              if (searchKeyword) {
                // 3. 시군구로 백엔드 API 검색
                console.log('백엔드 API 검색어:', searchKeyword);
                setSearchKeyword(searchKeyword);
                const searchResponse = await searchRegions(searchKeyword, 0, 20);
                console.log('백엔드 API 응답:', searchResponse);

                if (searchResponse.isSuccess && searchResponse.result && searchResponse.result.length > 0) {
                  // 결과 중에서 시/도, 시/군/구, 읍/면/동이 모두 포함된 것 찾기
                  const matchedRegion = searchResponse.result.find(region => {
                    const displayName = region.displayName || '';
                    return displayName.includes(sido) && displayName.includes(sigungu) && displayName.includes(eupmyeondong);
                  });

                  if (matchedRegion) {
                    // 일치하는 지역을 자동 선택
                    setSelectedRegion(matchedRegion);
                    setSearchResults([matchedRegion]);
                    console.log('자동 선택된 지역:', matchedRegion);
                  } else {
                    // 일치하는 게 없으면 전체 결과 표시
                    setSearchResults(searchResponse.result);
                    console.log('검색 결과 개수:', searchResponse.result.length);
                    console.warn('정확히 일치하는 지역을 찾을 수 없습니다. 유사한 결과를 표시합니다.');
                  }
                } else {
                  console.warn('백엔드에 해당 지역이 없습니다:', searchKeyword);
                }
              }
            } else {
              alert("주소 정보를 가져올 수 없습니다.");
            }
          } catch (error) {
            console.error("위치 정보 변환 실패:", error);
            alert("위치 정보를 가져오는데 실패했습니다.");
          } finally {
            setIsLoading(false);
          }
        },
        (error) => {
          setIsLoading(false);
          console.error("위치 정보 가져오기 실패:", error);
          console.error("에러 코드:", error.code);
          console.error("에러 메시지:", error.message);

          let errorMsg = "위치 정보를 가져올 수 없습니다. ";
          if (error.code === 1) {
            errorMsg += "위치 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.";
          } else if (error.code === 2) {
            errorMsg += "위치 정보를 사용할 수 없습니다.";
          } else if (error.code === 3) {
            errorMsg += "위치 정보 요청 시간이 초과되었습니다.";
          }

          alert(errorMsg);
        },
        {
          enableHighAccuracy: true, // 높은 정확도 사용
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      setIsLoading(false);
      alert("이 브라우저는 위치 정보를 지원하지 않습니다.");
    }
  };

  // 주소 검색 - 카카오 키워드 검색 → 지도 이동 → 좌표 → 동 단위 변환 → 백엔드 API
  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      alert("검색어를 입력해주세요.");
      return;
    }

    setIsLoading(true);
    try {
      // 1. 카카오 키워드 검색 API로 장소 찾기
      const keywordResponse = await axios.get(
        `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(searchKeyword)}`,
        {
          headers: {
            Authorization: `KakaoAK ${process.env.REACT_APP_KAKAO_REST_API_KEY}`
          }
        }
      );

      if (keywordResponse.data && keywordResponse.data.documents && keywordResponse.data.documents.length > 0) {
        const place = keywordResponse.data.documents[0];
        const x = place.x; // 경도
        const y = place.y; // 위도

        console.log('카카오 검색 결과:', place);

        // 먼저 지도 이동 및 마커 표시
        if (window.kakao && window.kakao.maps && map) {
          const latlng = new window.kakao.maps.LatLng(y, x);
          map.setCenter(latlng);
          map.setLevel(5);

          // 마커 위치 업데이트 (마커가 없으면 새로 생성)
          if (marker) {
            marker.setPosition(latlng);
          } else {
            const newMarker = new window.kakao.maps.Marker({
              position: latlng,
              map: map
            });
            setMarker(newMarker);
          }
        }

        // 2. 좌표를 동 단위로 변환
        const coordResponse = await axios.get(
          `https://dapi.kakao.com/v2/local/geo/coord2regioncode.json?x=${x}&y=${y}`,
          {
            headers: {
              Authorization: `KakaoAK ${process.env.REACT_APP_KAKAO_REST_API_KEY}`
            }
          }
        );

        if (coordResponse.data && coordResponse.data.documents && coordResponse.data.documents.length > 0) {
          // 법정동 기준으로 행정구역 정보 추출
          const regionData = coordResponse.data.documents[0];
          const region1 = regionData.region_1depth_name; // 시/도
          const region2 = regionData.region_2depth_name; // 구/군
          const region3 = regionData.region_3depth_name; // 동/읍/면

          // 전체 주소 조합
          const fullAddress = `${region1} ${region2} ${region3}`;

          console.log('좌표 변환 결과:', { region1, region2, region3, fullAddress });

          // addressSection에 전체 주소 표시
          setAddress(fullAddress);

          // 띄어쓰기 기준으로 분리: "경상남도 창원시 진해구" -> ["경상남도", "창원시", "진해구"]
          const addressParts = fullAddress.split(' ');
          const sido = addressParts[0]; // 첫 번째: 시/도 (예: 경상남도)
          const sigungu = addressParts[1]; // 두 번째: 시/군/구 (예: 창원시)
          const eupmyeondong = addressParts[2]; // 세 번째: 읍/면/동 (예: 진해구)

          console.log('검색어 분리:', { sido, sigungu, eupmyeondong });

          // 시군구만 검색 (백엔드가 전체 주소 검색을 지원하지 않는 경우)
          const searchKeyword = sigungu;

          if (searchKeyword) {
            // 3. 시군구로 백엔드 API 검색
            console.log('백엔드 API 검색어:', searchKeyword);
            const searchResponse = await searchRegions(searchKeyword, 0, 20);
            console.log('백엔드 API 응답:', searchResponse);

            if (searchResponse.isSuccess && searchResponse.result && searchResponse.result.length > 0) {
              // 결과 중에서 시/도, 시/군/구, 읍/면/동이 모두 포함된 것 찾기
              const matchedRegion = searchResponse.result.find(region => {
                const displayName = region.displayName || '';
                return displayName.includes(sido) && displayName.includes(sigungu) && displayName.includes(eupmyeondong);
              });

              if (matchedRegion) {
                // 일치하는 지역을 자동 선택
                setSelectedRegion(matchedRegion);
                setSearchResults([matchedRegion]);
                console.log('자동 선택된 지역:', matchedRegion);
              } else {
                // 일치하는 게 없으면 전체 결과 표시
                setSearchResults(searchResponse.result);
                console.log('검색 결과 개수:', searchResponse.result.length);
                console.warn('정확히 일치하는 지역을 찾을 수 없습니다. 유사한 결과를 표시합니다.');
              }
            } else {
              // 백엔드에 지역이 없어도 지도는 이미 이동했으므로 주소만 표시
              console.warn('백엔드에 해당 지역이 없습니다:', searchKeyword);
            }
          }
        } else {
          alert("주소 정보를 가져올 수 없습니다.");
        }
      } else {
        alert("검색 결과가 없습니다.");
      }
    } catch (error) {
      console.error("검색 실패:", error);
      alert("검색 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 검색 결과에서 지역 선택
  const handleSelectRegion = (region) => {
    setSelectedRegion(region);
    setAddress(region.displayName);
    setSearchResults([]);

    // 선택한 지역을 지도에 표시 (시각화 목적으로만 카카오맵 Geocoder 사용)
    updateMapLocation(region.displayName);
  };

  // 지도 위치 업데이트 (참고용 시각화)
  const updateMapLocation = (addressName) => {
    if (window.kakao && window.kakao.maps && map) {
      const geocoder = new window.kakao.maps.services.Geocoder();
      geocoder.addressSearch(addressName, (result, status) => {
        if (status === window.kakao.maps.services.Status.OK) {
          const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);
          map.setCenter(coords);
          map.setLevel(6);

          // 마커 위치 업데이트 (마커가 없으면 새로 생성)
          if (marker) {
            marker.setPosition(coords);
          } else {
            const newMarker = new window.kakao.maps.Marker({
              position: coords,
              map: map
            });
            setMarker(newMarker);
          }
        }
      });
    }
  };

  const handleSave = async () => {
    console.log('handleSave 호출됨, selectedRegion:', selectedRegion, 'rangeSetting:', rangeSetting);

    if (!selectedRegion || !selectedRegion.regionId) {
      console.error('selectedRegion이 없음:', selectedRegion);
      alert("지역을 선택해주세요.");
      return;
    }

    try {
      // 1. 활동 반경 변경
      const rangeResponse = await changeRange({ rangeSetting });
      console.log('활동 반경 변경 응답:', rangeResponse);

      // API 응답이 data로 감싸져 있을 수도, 바로 올 수도 있음
      const response = rangeResponse?.data || rangeResponse;

      if (!response?.isSuccess) {
        alert('활동 반경 변경에 실패했습니다.');
        return;
      }

      // 2. 동네 설정
      console.log('onSave 호출, region 전달:', selectedRegion);
      await onSave(selectedRegion); // 부모(MyPage)에서 성공 메시지/닫기 처리
    } catch (error) {
      console.error('저장 실패:', error);
      alert('설정 저장 중 오류가 발생했습니다.');
    }
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

        {/* 활동 반경 선택 */}
        <div className={styles.rangeSection}>
          <div className={styles.rangeSectionHeader}>
            <h4 className={styles.rangeSectionTitle}>활동 반경</h4>
          </div>
          <div className={styles.rangeButtonsGrid}>
            <button
              className={`${styles.rangeButtonSmall} ${rangeSetting === "VERY_NEAR" ? styles.rangeButtonActive : ""}`}
              onClick={() => setRangeSetting("VERY_NEAR")}
            >
              <div className={styles.rangeButtonContent}>
                <span className={styles.rangeButtonLabel}>우리 동네</span>
                <span className={styles.rangeButtonDesc}>2km</span>
              </div>
            </button>
            <button
              className={`${styles.rangeButtonSmall} ${rangeSetting === "NEAR" ? styles.rangeButtonActive : ""}`}
              onClick={() => setRangeSetting("NEAR")}
            >
              <div className={styles.rangeButtonContent}>
                <span className={styles.rangeButtonLabel}>인근 동네</span>
                <span className={styles.rangeButtonDesc}>5km</span>
              </div>
            </button>
            <button
              className={`${styles.rangeButtonSmall} ${rangeSetting === "MEDIUM" ? styles.rangeButtonActive : ""}`}
              onClick={() => setRangeSetting("MEDIUM")}
            >
              <div className={styles.rangeButtonContent}>
                <span className={styles.rangeButtonLabel}>여러 동네</span>
                <span className={styles.rangeButtonDesc}>20km</span>
              </div>
            </button>
            <button
              className={`${styles.rangeButtonSmall} ${rangeSetting === "FAR" ? styles.rangeButtonActive : ""}`}
              onClick={() => setRangeSetting("FAR")}
            >
              <div className={styles.rangeButtonContent}>
                <span className={styles.rangeButtonLabel}>시/군 단위</span>
                <span className={styles.rangeButtonDesc}>50km</span>
              </div>
            </button>
            <button
              className={`${styles.rangeButtonSmall} ${rangeSetting === "ALL" ? styles.rangeButtonActive : ""}`}
              onClick={() => setRangeSetting("ALL")}
            >
              <div className={styles.rangeButtonContent}>
                <span className={styles.rangeButtonLabel}>전국</span>
                <span className={styles.rangeButtonDesc}>제한 없음</span>
              </div>
            </button>
          </div>
        </div>

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

        {/* 검색 결과 */}
        {searchResults.length > 0 && (
          <div className={styles.searchResultsContainer}>
            {searchResults.map((region) => (
              <button
                key={region.regionId}
                className={styles.searchResultItem}
                onClick={() => handleSelectRegion(region)}
              >
                <Icon icon="solar:map-point-bold" className={styles.resultIcon} />
                <span>{region.displayName}</span>
              </button>
            ))}
          </div>
        )}

        {/* 지도 */}
        <div className={styles.mapContainer}>
          <div ref={mapRef} className={styles.map}></div>
        </div>

        {/* 선택된 주소 */}
        {selectedRegion && (
          <div className={styles.addressSection}>
            <Icon icon="solar:map-point-wave-bold" className={styles.addressIcon} />
            <div className={styles.addressText}>{selectedRegion.displayName}</div>
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
