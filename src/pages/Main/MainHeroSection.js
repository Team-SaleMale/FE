import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import styles from "../../styles/Main/MainHeroSection.module.css";


import dayjs from "dayjs";
import "dayjs/locale/ko";
dayjs.locale("ko");



const MainHeroSection = () => {
  const navigate = useNavigate();

  const categories = useMemo(
    () => [
      { key: "digital", label: "디지털기기", icon: "solar:laptop-minimalistic-linear" },
      { key: "home", label: "생활가전", icon: "solar:washing-machine-minimalistic-linear" },
      { key: "pet", label: "반려 동물", icon: "solar:cat-linear" },
      { key: "apparel", label: "의류", icon: "solar:hanger-broken" },
      { key: "health", label: "건강기능식품", icon: "solar:dumbbell-large-minimalistic-linear" },
      { key: "ticket", label: "티켓", icon: "solar:ticket-sale-linear" },
    ],
    []
  );

  const [activeCat, setActiveCat] = useState("digital");

  // 주소(나중에 API 연결). 텍스트 표시만.
  const [address] = useState("경기도 고양시 항공대로~");

  // 날짜 & 달력 오픈 상태
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [openStart, setOpenStart] = useState(false);
  const [openEnd, setOpenEnd] = useState(false);
  const startAnchorRef = useRef(null);
  const endAnchorRef = useRef(null);

  // 🔹 가격 범위 상태 (문자열: 콤마 포함)
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // 금액 포맷: 숫자만 남기고 3자리 콤마
  const formatMoney = (raw) => {
    const onlyDigits = String(raw || "").replace(/\D/g, "");
    if (!onlyDigits) return "";
    return onlyDigits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleMinChange = (e) => setMinPrice(formatMoney(e.target.value));
  const handleMaxChange = (e) => setMaxPrice(formatMoney(e.target.value));

  const fmt = (d) => (d ? dayjs(d).format("YYYY-MM-DD") : "Add Dates");

  const onSearch = () => {
    const params = new URLSearchParams({
      category: activeCat,
      address,
      start: startDate ? dayjs(startDate).format("YYYY-MM-DD") : "",
      end: endDate ? dayjs(endDate).format("YYYY-MM-DD") : "",
      // 🔹 가격 범위(콤마 제거해 전달)
      min: minPrice.replaceAll(",", ""),
      max: maxPrice.replaceAll(",", ""),
    });
    navigate(`/auctions?${params.toString()}`);
  };

  return (
    <section className={styles.mainherosection}>
      <div className={styles.background} />

      {/* 타이틀 */}
      <div className={styles.titleBlock}>
        <h1 className={styles.title}>Discover Auction</h1>
        <p className={styles.subtitle}>
          희귀 아이템, 인기 상품, 특별한 중고 거래를
          <br />
          실시간 경매로 만나보세요
        </p>
      </div>

      {/* 카테고리 탭 */}
      <div className={styles.categoryBar}>
        {categories.map((c) => {
          const active = activeCat === c.key;
          return (
            <button
              key={c.key}
              type="button"
              className={`${styles.tab} ${active ? styles.tabActive : styles.tabInactive}`}
              onClick={() => setActiveCat(c.key)}
            >
              <Icon icon={c.icon} className={styles.tabIcon} />
              <span className={styles.tabLabel}>{c.label}</span>
            </button>
          );
        })}
      </div>

      {/* 검색 카드 */}
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <div className={styles.searchWrap}>
          <div className={styles.searchCard}>
            {/* 현재 거주 지역 */}
            <div className={styles.field}>
              <div className={styles.label}>현재 거주 지역</div>
              <div className={styles.addressText}>{address}</div>
            </div>

            <div className={styles.divider} />

            {/* 시작일 */}
            <div className={styles.field}>
              <div className={styles.label}>경매 시작일</div>
              <div className={styles.triggerWrap} ref={startAnchorRef}>
                <button type="button" className={styles.dateTrigger} onClick={() => setOpenStart(true)}>
                  {fmt(startDate)}
                </button>
                <DatePicker
                  open={openStart}
                  onClose={() => setOpenStart(false)}
                  value={startDate}
                  onChange={(v) => {
                    setStartDate(v);
                    if (endDate && v && dayjs(endDate).isBefore(v, "day")) setEndDate(v);
                  }}
                  format="YYYY-MM-DD"
                  slotProps={{
                    textField: { className: styles.hiddenInput },
                    popper: { placement: "bottom-start", anchorEl: startAnchorRef.current },
                  }}
                />
              </div>
            </div>

            <div className={styles.dividerTall} />

            {/* 마감일 */}
            <div className={`${styles.field} ${styles.endField}`}>
              <div className={styles.label}>경매 마감일</div>
              <div className={styles.triggerWrap} ref={endAnchorRef}>
                <button type="button" className={styles.dateTrigger} onClick={() => setOpenEnd(true)}>
                  {fmt(endDate)}
                </button>
                <DatePicker
                  open={openEnd}
                  onClose={() => setOpenEnd(false)}
                  value={endDate}
                  onChange={(v) => setEndDate(v)}
                  minDate={startDate || undefined}
                  format="YYYY-MM-DD"
                  slotProps={{
                    textField: { className: styles.hiddenInput },
                    popper: { placement: "bottom-start", anchorEl: endAnchorRef.current },
                  }}
                />
              </div>
            </div>

            <div className={styles.dividerTall} />

            {/* 🔹 가격 범위 */}
            <div className={`${styles.field} ${styles.priceField}`}>
              <div className={styles.label}>가격 범위</div>
              <div className={styles.priceInputs}>
                <div className={styles.priceInputWrap}>
                  <span className={styles.currency}>₩</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    className={styles.priceInput}
                    placeholder="최소"
                    value={minPrice}
                    onChange={handleMinChange}
                  />
                </div>
                <span className={styles.tilde}>~</span>
                <div className={styles.priceInputWrap}>
                  <span className={styles.currency}>₩</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    className={styles.priceInput}
                    placeholder="최대"
                    value={maxPrice}
                    onChange={handleMaxChange}
                  />
                </div>
              </div>
            </div>

            {/* CTA */}
            <button type="button" className={styles.searchBtn} onClick={onSearch}>
              <Icon icon="solar:magnifer-zoom-in-broken" className={styles.searchIcon} />
              상품 찾기
            </button>
          </div>
        </div>
      </LocalizationProvider>
    </section>
  );
};

export default MainHeroSection;

