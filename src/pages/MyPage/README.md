# MyPage 컴포넌트 문서

## 📁 프로젝트 구조

```
src/pages/MyPage/
├── MyPage.js                    # 메인 컨테이너 컴포넌트
│
├── Overview/                    # 메인 페이지 컴포넌트들
│   ├── ProfileHeader.js         # 프로필 헤더 (아바타, 이름, 위치, 카테고리)
│   ├── UserStats.js             # 사용자 통계 (매너지수, 거래내역)
│   ├── TabsNav.js               # 탭 네비게이션 (전체/판매한/입찰중/낙찰완료)
│   ├── FiltersBar.js            # 필터바 (총 개수, 정렬 옵션)
│   ├── Pagination.js            # 페이지네이션
│   ├── EmptyState.js            # 빈 상태 표시
│   ├── LocationBadge.js         # 위치 뱃지
│   ├── QuickActions.js          # 빠른 작업 버튼
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
├── SellingDrawer.js             # 판매내역 Drawer
├── PurchaseDrawer.js            # 구매내역 Drawer
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
├── Overview/                    # Overview 컴포넌트 스타일
│   ├── ProfileHeader.module.css
│   ├── UserStats.module.css
│   ├── TabsNav.module.css
│   ├── FiltersBar.module.css
│   └── ...
├── SalesHistory/                # 판매내역 스타일
│   ├── SalesHistoryCard.module.css
│   └── SalesHistoryList.module.css
├── PurchaseHistory/             # 구매내역 스타일
│   ├── PurchaseHistoryCard.module.css
│   └── PurchaseHistoryList.module.css
├── SellingDrawer.module.css
├── PurchaseDrawer.module.css
└── DetailFilter.module.css
```

## 🔧 주요 기능 및 변경 사항

### 1. ProfileHeader 컴포넌트
- **변경**: Location과 CategoryChips를 세로 배치로 변경
- **추가**: 카테고리 더보기 버튼 (아이콘: `solar:alt-arrow-down-linear`)
- **스타일**: 80% 스케일 다운 적용 (아바타 119px, 폰트 크기 축소)
- **간격**: Location과 Chips 사이 24px

### 2. TabsNav 컴포넌트
- **추가**: 동적 언더라인 기능 구현
  - 활성 탭 아래에 언더라인 표시
  - 탭 변경 시 부드러운 애니메이션 효과 (0.3s)
  - 언더라인 색상: #226FD5
- **기술**: useRef와 useEffect를 사용한 동적 위치 계산

### 3. FiltersBar 컴포넌트
- **추가**: 드롭다운 정렬 옵션
  - 최신순
  - 낮은 가격순
  - 높은 가격순
- **기능**:
  - 드롭다운 토글
  - 외부 클릭 시 자동 닫힘
  - 선택된 옵션 하이라이트
  - 화살표 회전 애니메이션

### 4. 판매내역 (SalesHistory)
- **SalesHistoryCard**: 150x150px 이미지
- **상세보기 버튼**: 원형 아이콘 버튼 (들어가는 화살표)
- **낙찰완료 배지**: 제거됨

### 5. 구매내역 (PurchaseHistory)
- **구조**: 판매내역과 동일
- **PurchaseHistoryCard**: 150x150px 이미지
- **상세보기 버튼**: 원형 아이콘 버튼

### 6. Drawer 컴포넌트들
- **SellingDrawer**: 판매내역 슬라이드 패널
- **PurchaseDrawer**: 구매내역 슬라이드 패널
- **공통 기능**:
  - 제목 가운데 정렬
  - 상품명 검색 입력창
  - 상세필터 버튼
  - 우측에서 슬라이드인 애니메이션

### 7. DetailFilter 컴포넌트
- **위치**: Drawer body 내부 하단에서 슬라이드업
- **조회기간 옵션**:
  - 최근 1년 (기본값)
  - 1주일
  - 1개월
  - 3개월
  - 6개월
- **선택 색상**: #659711 (녹색)
- **조회하기 버튼**: 검은색 배경

### 8. 전체 스타일 조정
- **적용**: 100% 배율에서 80% 배율로 보이도록 조정
- **예외**: 사이드바는 원래 크기 유지 (190px, 16px 폰트)
- **변경된 요소**:
  - 폰트 크기: 약 80% 축소
  - 패딩/마진: 약 80% 축소
  - 컨테이너 최대 너비: 1200px → 960px
  - AuctionCardVertical: 카드 높이, 폰트, 아이콘 크기 축소

### 9. AuctionCardVertical 수정
- **채팅하기 버튼**: 낙찰가 옆에 배치
- **버튼 색상**: #659711 (녹색)
- **위치**: priceRow 내부, 낙찰가 옆

## 🎨 스타일 가이드

### 색상
- **Primary Blue**: #226FD5 (탭 언더라인, 상세보기 버튼)
- **Green**: #659711 (채팅하기 버튼, 필터 활성 상태)
- **Text Primary**: #000000
- **Text Secondary**: #808080
- **Text Muted**: #666666
- **Border**: #b5bac2, #e0e0e0
- **Background**: #f5f7fa (검색창)
- **Background Hover**: #f5f5f5

### 폰트 크기 (스케일 다운 후)
- **제목**: 19px (원래 24px)
- **본문**: 13px (원래 16px)
- **작은 텍스트**: 10px (원래 12px)
- **사이드바**: 16px 제목, 12px 아이템 (원래 크기 유지)

## 📦 외부 의존성

### 공통 컴포넌트 (feature/5-auction-list 브랜치에서 가져옴)
```
src/pages/AuctionRegistration/
└── CategoryChips.js         # 17개 카테고리 선택 컴포넌트

src/pages/AuctionList/
├── AuctionCardHorizontal.js # 가로 상품 카드
├── AuctionCardVertical.js   # 세로 상품 카드 (낙찰 시 채팅 버튼)
├── Horizontal.js            # 가로 리스트 래퍼
└── Vertical.js              # 세로 그리드 래퍼
```

### NPM 패키지
- `@iconify/react`: 아이콘 라이브러리
- `react`: ^19.2.0
- `react-dom`: ^19.2.0

### 사용된 Iconify 아이콘
- `solar:alt-arrow-down-linear` - 카테고리 더보기
- `solar:close-circle-linear` - Drawer 닫기
- `solar:magnifer-linear` - 검색 아이콘
- `solar:tuning-2-linear` - 필터 아이콘
- `solar:login-3-linear` - 상품 상세보기 (들어가는 화살표)
- `solar:chat-round-dots-linear` - 채팅하기

## 💻 사용 예시

### MyPage 메인
```jsx
import MyPage from './pages/MyPage/MyPage';

function App() {
  return <MyPage />;
}
```

### 판매내역 Drawer 열기
```jsx
const [isSellingDrawerOpen, setSellingDrawerOpen] = useState(false);

<button onClick={() => setSellingDrawerOpen(true)}>
  판매내역
</button>

<SellingDrawer
  open={isSellingDrawerOpen}
  onClose={() => setSellingDrawerOpen(false)}
  title="판매내역"
>
  <SalesHistoryList items={salesItems} />
</SellingDrawer>
```

### 구매내역 Drawer 열기
```jsx
const [isPurchaseDrawerOpen, setPurchaseDrawerOpen] = useState(false);

<button onClick={() => setPurchaseDrawerOpen(true)}>
  구매내역
</button>

<PurchaseDrawer
  open={isPurchaseDrawerOpen}
  onClose={() => setPurchaseDrawerOpen(false)}
  title="구매내역"
>
  <PurchaseHistoryList items={purchaseItems} />
</PurchaseDrawer>
```

### FiltersBar 사용
```jsx
const [sortValue, setSortValue] = useState("latest");

<FiltersBar
  totalCount={6}
  sortValue={sortValue}
  onSortChange={setSortValue}
/>
```

### TabsNav 사용
```jsx
const [activeTab, setActiveTab] = useState("전체");

<TabsNav
  tabs={["전체", "판매한", "입찰중", "낙찰완료"]}
  active={activeTab}
  onChange={setActiveTab}
/>
```

## 🚀 실행 방법

1. 의존성 설치:
```bash
npm install @iconify/react
```

2. 개발 서버 실행:
```bash
npm start
```

3. 포트 변경이 필요한 경우:
```bash
# Windows CMD
set PORT=3001 && npm start

# PowerShell
$env:PORT=3001; npm start
```

## 📝 TODO
- [ ] 정렬 로직 실제 구현 (API 연동)
- [ ] 검색 기능 구현
- [ ] 상세필터 적용 로직 구현
- [ ] 페이지네이션 기능 구현
- [ ] API 연동 (판매/구매 내역)
- [ ] 반응형 디자인 개선
- [ ] 카테고리 전체 보기 모달 구현
- [ ] 채팅 기능 구현

## 🔄 최근 업데이트

### 2025-10-10 (오후 작업)
- **구조 개선**: Overview 폴더 생성하여 메인 컴포넌트 정리
- **구매내역 구현**: PurchaseHistory 폴더 및 컴포넌트 생성
- **DetailFilter 추가**: 하단 슬라이드업 필터 모달
- **Drawer 개선**: 검색창 및 상세필터 버튼 추가
- **SalesHistoryCard 수정**:
  - 이미지 크기 150x150
  - 낙찰완료 배지 제거
  - 상세보기 아이콘 버튼 (원형)

### 2025-10-10 (오전 작업)
- **ProfileHeader 레이아웃 변경**: 세로 배치
- **TabsNav 동적 언더라인 추가**: #226FD5 색상
- **FiltersBar 드롭다운 정렬 추가**: 3가지 정렬 옵션
- **전체 UI 80% 스케일 다운**: 사이드바 제외
- **AuctionCardVertical 수정**: 채팅하기 버튼 추가

## 📂 파일 통계
- **총 JavaScript 파일**: 23개
- **총 CSS 모듈 파일**: 23개
- **Overview 컴포넌트**: 9개
- **SalesHistory 컴포넌트**: 2개
- **PurchaseHistory 컴포넌트**: 2개
- **Drawer 컴포넌트**: 2개

## 🎯 핵심 기능
1. ✅ 프로필 정보 표시 (아바타, 위치, 관심 카테고리)
2. ✅ 사용자 통계 표시 (매너지수, 거래 현황)
3. ✅ 탭 네비게이션 (동적 언더라인)
4. ✅ 정렬 필터 (드롭다운)
5. ✅ 판매내역 Drawer (검색, 필터)
6. ✅ 구매내역 Drawer (검색, 필터)
7. ✅ 상세필터 모달 (조회기간)
8. ✅ 경매 상품 카드 (낙찰 시 채팅 버튼)
