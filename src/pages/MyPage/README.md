# MyPage 컴포넌트 문서

## 프로젝트 구조

```
src/pages/MyPage/
├── MyPage.js                    # 메인 컨테이너 컴포넌트
├── MyPageVertical.js            # 경매 카드 그리드 컴포넌트
├── MyPageAuctionCard.js         # 마이페이지용 경매 카드
│
├── Overview/                    # 메인 페이지 컴포넌트들
│   ├── ProfileHeader.js         # 프로필 헤더 (아바타, 이름, 위치, 카테고리)
│   ├── UserStats.js             # 사용자 통계 (경매지수, 최근후기, 최근채팅)
│   ├── TabsNav.js               # 탭 네비게이션 (전체/판매/입찰/낙찰/유찰)
│   ├── FiltersBar.js            # 필터바 (총 개수, 정렬 옵션)
│   ├── Pagination.js            # 페이지네이션
│   ├── EmptyState.js            # 빈 상태 표시
│   ├── LocationBadge.js         # 위치 뱃지
│   ├── QuickActions.js          # 빠른 작업 버튼
│   ├── RecentChats.js           # 최근 채팅 컴포넌트
│   └── ReviewSummary.js         # 리뷰 요약
│
├── SalesHistory/                # 판매내역
│   ├── SalesHistoryCard.js      # 판매 아이템 카드 (150x150 이미지)
│   └── SalesHistoryList.js      # 판매 목록 리스트
│
├── PurchaseHistory/             # 구매내역
│   ├── PurchaseHistoryCard.js   # 구매 아이템 카드 (150x150 이미지)
│   └── PurchaseHistoryList.js   # 구매 목록 리스트
│
├── Wishlist/                    # 찜한 목록
│   ├── WishlistCard.js          # 찜한 상품 카드
│   └── WishlistList.js          # 찜한 상품 리스트
│
├── SellingDrawer.js             # 판매내역 Drawer
├── PurchaseDrawer.js            # 구매내역 Drawer
├── WishlistDrawer.js            # 찜한 목록 Drawer
├── ChatDrawer.js                # 1:1 채팅 Drawer (실시간 메시지)
├── ChatListDrawer.js            # 채팅 목록 Drawer
├── ReviewDrawer.js              # 받은 후기 목록 Drawer
├── ReviewWriteDrawer.js         # 후기 작성 Drawer
├── CategoryDrawer.js            # 관심 카테고리 설정 Drawer
├── LocationDrawer.js            # 동네 설정 Drawer (카카오맵 연동)
├── NicknameChangeDrawer.js      # 닉네임 변경 Drawer
├── PasswordChangeDrawer.js      # 비밀번호 변경 Drawer
├── WithdrawalDrawer.js          # 회원 탈퇴 Drawer
├── DetailFilter.js              # 상세필터 (조회기간)
│
├── BiddingCard.js               # 입찰 아이템 카드
├── BiddingList.js               # 입찰 목록 컨테이너
├── SellingCard.js               # 판매 아이템 카드
├── SellingList.js               # 판매 목록 컨테이너
├── WonCard.js                   # 낙찰 아이템 카드
├── WonList.js                   # 낙찰 목록 컨테이너
├── ChatItem.js                  # 채팅 아이템
└── ChatList.js                  # 채팅 목록 컨테이너

src/styles/MyPage/
├── MyPage.module.css
├── MyPageAuctionCard.module.css
├── Overview/                    # Overview 컴포넌트 스타일
│   ├── ProfileHeader.module.css
│   ├── UserStats.module.css
│   ├── TabsNav.module.css
│   ├── FiltersBar.module.css
│   ├── RecentChats.module.css
│   └── ...
├── SalesHistory/                # 판매내역 스타일
│   ├── SalesHistoryCard.module.css
│   └── SalesHistoryList.module.css
├── PurchaseHistory/             # 구매내역 스타일
│   ├── PurchaseHistoryCard.module.css
│   └── PurchaseHistoryList.module.css
├── ChatDrawer.module.css
├── ChatListDrawer.module.css
├── ReviewDrawer.module.css
├── ReviewWriteDrawer.module.css
├── LocationDrawer.module.css
├── NicknameChangeDrawer.module.css
├── PasswordChangeDrawer.module.css
├── WithdrawalDrawer.module.css
├── SellingDrawer.module.css
├── PurchaseDrawer.module.css
└── DetailFilter.module.css

src/api/mypage/
└── service.js                   # 마이페이지 API 서비스
```

---

## 주요 기능

### 1. 프로필 관리

#### ProfileHeader
- 프로필 이미지 표시 및 **클릭하여 이미지 변경** 기능
- 닉네임 표시 및 변경 버튼
- 비밀번호 변경 버튼
- 현재 동네 위치 표시
- 관심 카테고리 칩 표시

#### NicknameChangeDrawer
- 현재 닉네임 표시
- 새 닉네임 입력 (2-20자, 한글/영문/숫자)
- 실시간 유효성 검사
- API 연동: `PUT /users/nickname`

#### PasswordChangeDrawer
- 현재 비밀번호 확인
- 새 비밀번호 입력
- 새 비밀번호 확인
- API 연동: `PUT /users/password`

#### WithdrawalDrawer
- 탈퇴 사유 선택
- 주의사항 안내
- 최종 확인 후 탈퇴
- API 연동: `DELETE /users`

---

### 2. 동네 설정 (LocationDrawer)

카카오맵 API와 연동된 위치 설정 기능

#### 기능
- **현재 위치 가져오기**: GPS 기반 자동 위치 감지
- **검색**: 장소명/주소 검색 → 좌표 변환 → 동 단위 매핑
- **활동 반경 설정**: 5단계 (우리 동네 2km ~ 전국)
- **지도 시각화**: 선택한 위치 마커 표시

#### 활동 반경 옵션
| 옵션 | 설명 | 거리 |
|------|------|------|
| VERY_NEAR | 우리 동네 | 2km |
| NEAR | 인근 동네 | 5km |
| MEDIUM | 여러 동네 | 20km |
| FAR | 시/군 단위 | 50km |
| ALL | 전국 | 제한 없음 |

#### API 연동
- `GET /regions/search` - 지역 검색
- `PUT /users/region` - 동네 설정
- `PUT /users/range` - 활동 반경 변경
- `GET /users/region/nearby` - 근처 지역 ID 조회

---

### 3. 채팅 시스템

#### ChatListDrawer
- 전체 채팅방 목록 조회
- 상품 이미지, 상대방 닉네임, 마지막 메시지 표시
- 안 읽은 메시지 개수 뱃지
- 채팅방 클릭 시 ChatDrawer 열기

#### ChatDrawer
- **실시간 메시지**: 3초 간격 폴링으로 새 메시지 확인
- **텍스트 메시지 전송**
- **이미지 전송**: 파일 선택 → 업로드 → 표시
- **채팅방 나가기**: 확인 후 exit API 호출
- **사용자 차단/차단해제**: 프로필 클릭 시 모달
- **차단 상태 표시**: 내가 차단 / 상대가 차단 구분

#### 상태 관리
```javascript
// 메시지 전송 가능 여부
canSend: boolean

// 차단 상태
isBlocked: boolean       // 내가 상대를 차단
partnerBlockedMe: boolean // 상대가 나를 차단
```

#### API 연동
- `POST /chats` - 채팅방 생성
- `GET /chats` - 채팅방 목록
- `GET /chats/{chatId}/enter` - 채팅방 입장 (메시지 조회)
- `POST /chats/message` - 메시지 전송
- `POST /chats/message/image` - 이미지 전송
- `POST /chats/{chatId}/exit` - 채팅방 나가기
- `POST /chats/{chatId}/block` - 사용자 차단
- `DELETE /chats/{chatId}/block` - 차단 해제
- `GET /chats/{chatId}/block/status` - 차단 상태 조회

---

### 4. 후기 시스템

#### ReviewDrawer
- 받은 후기 목록 조회
- 별점, 작성자, 내용 표시
- 페이지네이션

#### ReviewWriteDrawer
- **별점 선택**: 1~5점 (별 아이콘 인터랙션)
- **후기 내용 작성**: 최소 10자, 최대 500자
- **상품 정보 표시**: 이미지, 제목, 낙찰가

#### 별점 텍스트
| 점수 | 텍스트 |
|------|--------|
| 1 | 별로예요 |
| 2 | 조금 아쉬워요 |
| 3 | 보통이에요 |
| 4 | 좋아요 |
| 5 | 최고예요! |

#### API 연동
- `GET /mypage/auctions/reviews` - 받은 후기 조회
- `POST /auctions/{itemId}/reviews` - 후기 작성

---

### 5. 찜한 목록 (WishlistDrawer)

#### 기능
- 찜한 상품 목록 조회
- 정렬 옵션: 마감임박순, 높은가격순, 낮은가격순, 최신순
- 상품명 검색
- **찜 취소**: 낙관적 업데이트 + 실패 시 롤백

#### API 연동
- `GET /mypage/auctions/liked` - 찜한 상품 조회
- `DELETE /auctions/{itemId}/like` - 찜 취소

---

### 6. 카테고리 설정 (CategoryDrawer)

#### 기능
- 17개 카테고리 중 선호 카테고리 선택
- 낙관적 업데이트: UI 즉시 반영 → API 호출 → 실패 시 롤백
- 선택된 카테고리 프로필에 표시

#### 카테고리 목록
| ID | 이름 | 아이콘 |
|----|------|--------|
| women-acc | 여성잡화 | solar:bag-smile-outline |
| food-processed | 가공식품 | solar:chef-hat-linear |
| sports | 스포츠/레저 | solar:balls-linear |
| plant | 식물 | solar:waterdrop-linear |
| game-hobby | 게임/취미/음반 | solar:reel-2-broken |
| ticket | 티켓 | solar:ticket-sale-linear |
| furniture | 가구/인테리어 | solar:armchair-2-linear |
| beauty | 뷰티/미용 | solar:magic-stick-3-linear |
| clothes | 의류 | solar:hanger-broken |
| health-food | 건강기능식품 | solar:dumbbell-large-minimalistic-linear |
| book | 도서 | solar:notebook-broken |
| kids | 유아동 | solar:smile-circle-linear |
| digital | 디지털 기기 | solar:laptop-minimalistic-linear |
| living-kitchen | 생활/주방 | solar:whisk-linear |
| home-appliance | 생활가전 | solar:washing-machine-minimalistic-linear |
| etc | 기타 | solar:add-square-broken |

#### API 연동
- `GET /mypage/auctions/category` - 선호 카테고리 조회
- `POST /mypage/auctions/category` - 선호 카테고리 설정

---

### 7. 내 경매 목록

#### TabsNav
- 탭: 전체 / 판매 / 입찰 / 낙찰 / 유찰
- 동적 언더라인 애니메이션 (0.3s)
- 활성 탭 색상: #226FD5

#### FiltersBar
- 총 개수 표시
- 정렬 드롭다운: 최신순, 낮은 가격순, 높은 가격순
- 외부 클릭 시 드롭다운 닫힘

#### MyPageVertical
- 경매 카드 그리드 레이아웃
- 낙찰 상품: 채팅하기 버튼 표시

#### API 연동
- `GET /mypage/auctions` - 내 경매 목록 조회
  - params: type (ALL, SELLING, BIDDING, WON, FAILED), sort, page, size

---

### 8. 판매/구매 내역

#### SalesHistory
- 판매 완료된 상품 목록
- 후기 작성 버튼

#### PurchaseHistory
- 낙찰받은 상품 목록
- 후기 작성 버튼

---

### 9. UserStats (사용자 통계)

#### 구성
- **경매지수**: 0~100 프로그레스 바
- **최근 후기**: 최근 2개 후기 미리보기 + 전체보기
- **최근 채팅**: 최근 2개 채팅 미리보기 + 전체보기

---

## API 서비스 (src/api/mypage/service.js)

```javascript
export const mypageService = {
  // 내 경매 목록 조회
  getMyAuctions: (params) => apiClient.get('/mypage/auctions', { params }),

  // 찜한 상품 목록 조회
  getLikedAuctions: (params) => apiClient.get('/mypage/auctions/liked', { params }),

  // 선호 카테고리 조회
  getPreferredCategories: () => apiClient.get('/mypage/auctions/category'),

  // 선호 카테고리 설정
  setPreferredCategories: (categories) => apiClient.post('/mypage/auctions/category', { categories }),

  // 받은 후기 조회
  getReceivedReviews: (params) => apiClient.get('/mypage/auctions/reviews', { params }),

  // 거래 후기 작성
  createReview: (itemId, data) => apiClient.post(`/auctions/${itemId}/reviews`, data),
};
```

---

## 스타일 가이드

### 색상
| 용도 | 색상 |
|------|------|
| Primary Blue | #226FD5 (탭 언더라인, 상세보기) |
| Green | #659711 (채팅버튼, 필터 활성) |
| Text Primary | #000000 |
| Text Secondary | #808080 |
| Text Muted | #666666 |
| Border | #b5bac2, #e0e0e0 |
| Background | #f5f7fa (검색창) |
| Background Hover | #f5f5f5 |

### 폰트 크기 (80% 스케일 적용)
| 용도 | 크기 |
|------|------|
| 제목 | 19px |
| 본문 | 13px |
| 작은 텍스트 | 10px |
| 사이드바 제목 | 16px |
| 사이드바 아이템 | 12px |

---

## 외부 의존성

### NPM 패키지
```json
{
  "@iconify/react": "아이콘 라이브러리",
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "react-router-dom": "라우팅",
  "axios": "HTTP 클라이언트"
}
```

### 외부 API
- **카카오맵 JavaScript SDK**: 지도 표시, 마커
- **카카오 로컬 REST API**: 좌표 → 주소 변환, 키워드 검색

### 사용된 Iconify 아이콘
| 아이콘 | 용도 |
|--------|------|
| solar:alt-arrow-down-linear | 드롭다운 화살표 |
| solar:alt-arrow-left-linear | 뒤로가기 |
| solar:close-circle-linear | Drawer 닫기 |
| solar:magnifer-linear | 검색 |
| solar:tuning-2-linear | 필터 |
| solar:login-3-linear | 상품 상세보기 |
| solar:chat-round-dots-linear | 채팅하기 |
| solar:chat-line-linear | 빈 채팅 |
| solar:map-point-wave-outline | 위치 |
| solar:map-point-wave-bold | 선택된 위치 |
| solar:map-point-bold | 검색 결과 위치 |
| solar:gps-linear | 현재 위치 |
| solar:star-bold / linear | 별점 |
| solar:gallery-linear | 이미지 첨부 |
| solar:plain-3-linear | 메시지 전송 |
| solar:exit-outline | 채팅방 나가기 |
| solar:shield-warning-bold | 차단 경고 |
| solar:shield-cross-bold | 차단됨 |
| solar:info-circle-bold | 정보 |

---

## 사용 예시

### 마이페이지 라우팅
```jsx
import MyPage from './pages/MyPage/MyPage';

// App.js 또는 라우터 설정
<Route path="/mypage" element={<MyPage />} />
```

### Drawer 열기 패턴
```jsx
const [isDrawerOpen, setDrawerOpen] = useState(false);

// 열기
<button onClick={() => setDrawerOpen(true)}>Drawer 열기</button>

// Drawer
<SomeDrawer
  open={isDrawerOpen}
  onClose={() => setDrawerOpen(false)}
  {...otherProps}
/>
```

### 채팅 플로우
```jsx
// 1. 채팅 목록 열기
const openChatList = () => setChatListDrawerOpen(true);

// 2. 채팅방 선택 시
const handleSelectChat = (chat) => {
  setSelectedChatItem(chat);
  setChatDrawerOpen(true);
  setChatListDrawerOpen(false);
};

// 3. ChatDrawer에서 뒤로가기
const handleBackFromChat = () => {
  setChatDrawerOpen(false);
  setChatListDrawerOpen(true);
};
```

---

## 환경 변수

```env
REACT_APP_KAKAO_REST_API_KEY=카카오_REST_API_키
```

---

## 실행 방법

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm start

# 포트 변경 (Windows)
set PORT=3001 && npm start
```

---

## 파일 통계
| 구분 | 개수 |
|------|------|
| JavaScript 파일 | 40+ |
| CSS 모듈 파일 | 35+ |
| Overview 컴포넌트 | 10개 |
| Drawer 컴포넌트 | 11개 |
| API 서비스 | 6개 메서드 |

---

## 완료된 기능

- [x] 프로필 정보 표시 및 수정
- [x] 프로필 이미지 변경
- [x] 닉네임 변경
- [x] 비밀번호 변경
- [x] 회원 탈퇴
- [x] 동네 설정 (카카오맵 연동)
- [x] 활동 반경 설정
- [x] 관심 카테고리 설정
- [x] 내 경매 목록 조회 (전체/판매/입찰/낙찰/유찰)
- [x] 판매내역 Drawer
- [x] 구매내역 Drawer
- [x] 찜한 목록 Drawer
- [x] 찜 취소 기능
- [x] 채팅 목록 조회
- [x] 1:1 채팅 (텍스트/이미지)
- [x] 채팅방 나가기
- [x] 사용자 차단/해제
- [x] 후기 목록 조회
- [x] 후기 작성
- [x] 탭 네비게이션 (동적 언더라인)
- [x] 정렬 필터 (드롭다운)
- [x] 경매지수/최근후기/최근채팅 표시

---

## TODO

- [ ] 페이지네이션 완전 구현
- [ ] 반응형 디자인 개선
- [ ] 채팅 WebSocket 실시간 연동
- [ ] 푸시 알림 연동
- [ ] 성능 최적화 (React.memo, useMemo)
