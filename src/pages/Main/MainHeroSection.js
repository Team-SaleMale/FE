// src/pages/Main/MainHeroSection.jsx
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

const onlyDigits = (s) => String(s || "").replace(/\D/g, "");
const withCommas = (raw) => {
  const d = onlyDigits(raw);
  return d ? d.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "";
};

const MainHeroSection = () => {
  const navigate = useNavigate();

  // ✅ AuctionList와 동일한 카테고리 키 사용
  const categories = useMemo(
    () => [
      { key: "digital",        label: "디지털 기기",  icon: "solar:laptop-minimalistic-linear" },
      { key: "home-appliance", label: "생활가전",     icon: "solar:washing-machine-minimalistic-linear" },
      { key: "pet",            label: "반려동물",     icon: "solar:cat-linear" },
      { key: "clothes",        label: "의류",         icon: "solar:hanger-broken" },
      { key: "health-food",    label: "건강기능식품", icon: "solar:dumbbell-large-minimalistic-linear" },
      { key: "ticket",         label: "티켓",         icon: "solar:ticket-sale-linear" },
    ],
    []
  );

  const [activeCat, setActiveCat] = useState("digital");

  // 주소(표시용)
  const [address] = useState("경기도 고양시 항공대로~");

  // 날짜
  const [startDate, setStartDate] = useState(null); // dayjs | null
  const [endDate, setEndDate] = useState(null);
  const [openStart, setOpenStart] = useState(false);
  const [openEnd, setOpenEnd] = useState(false);
  const startAnchorRef = useRef(null);
  const endAnchorRef = useRef(null);

  // 가격(문자열, 콤마 포함)
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const handleMinChange = (e) => setMinPrice(withCommas(e.target.value));
  const handleMaxChange = (e) => setMaxPrice(withCommas(e.target.value));

  const fmtBtn = (d) => (d ? dayjs(d).format("YYYY-MM-DD") : "Add Dates");

  const onSearch = () => {
    let min = Number(onlyDigits(minPrice)) || 0;
    let max = Number(onlyDigits(maxPrice)) || 0;
    // min/max 둘 다 존재하고 순서가 뒤집히면 스왑
    if (min > 0 && max > 0 && min > max) [min, max] = [max, min];

    const qs = new URLSearchParams();
    qs.set("tab", "ongoing");                           // 진행중 기본
    if (activeCat) qs.set("cat", activeCat);           // ✅ AuctionList가 읽는 키
    if (startDate) qs.set("start", dayjs(startDate).format("YYYY-MM-DD"));
    if (endDate)   qs.set("end",   dayjs(endDate).format("YYYY-MM-DD"));
    if (min > 0)   qs.set("min", String(min));
    if (max > 0)   qs.set("max", String(max));
    // 필요시 주소도 전달(현재 AuctionList에선 미사용)
    // qs.set("addr", address);

    navigate(`/auctions?${qs.toString()}`);
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
                  {fmtBtn(startDate)}
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
                  {fmtBtn(endDate)}
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

            {/* 가격 범위 */}
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
