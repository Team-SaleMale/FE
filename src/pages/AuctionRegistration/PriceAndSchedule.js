// src/pages/AuctionRegistration/PriceAndSchedule.js
// "가격 추천" 버튼을 누르면 모달을 열고, (네이버 시세 → 그래프)와 (서버 추천가 → 적용) 흐름을 제공합니다.

import React, { useEffect, useMemo, useState } from "react";
import styles from "../../styles/AuctionRegistration/PriceAndSchedule.module.css";

import PriceSuggestionModal from "./PriceSuggestionModal";
import { fetchNaverShoppingPrices, fetchPriceSuggestion } from "../../api/priceSuggestion/service";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import OutlinedInput from "@mui/material/OutlinedInput";

import dayjs from "dayjs";
import "dayjs/locale/ko";
dayjs.locale("ko");

// 빠른 가격 선택 옵션
const QUICK_PRICE_OPTIONS = [
  { value: 0, label: "0원" },
  { value: 100, label: "100원" },
  { value: 500, label: "500원" },
  { value: 1000, label: "1천원" },
  { value: 5000, label: "5천원" },
  { value: 10000, label: "1만원" },
  { value: 50000, label: "5만원" },
  { value: 100000, label: "10만원" },
  { value: 500000, label: "50만원" },
  { value: 1000000, label: "100만원" },
  { value: 5000000, label: "500만원" },
];

// 숫자만 추출 + 12자리 제한 + 비어있으면 "0"
const normalizePrice = (value) => {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (!digits) return "0";
  return digits.slice(0, 12);
};

export default function PriceAndSchedule({
  startPrice = "",
  startDate = "",
  endDate = "",
  onChange,
  productName = "", // ✅ 가격 추천에 사용할 상품명
}) {
  /* ---------------- 가격 상태 ---------------- */
  const [priceInput, setPriceInput] = useState(startPrice || "");
  const [priceHistory, setPriceHistory] = useState([]); // ["0", "1000", ...]

  // ✅ 모달 상태
  const [modalOpen, setModalOpen] = useState(false);

  // ✅ 네이버(빠른) 결과
  const [naverLoading, setNaverLoading] = useState(false);
  const [naverError, setNaverError] = useState("");
  const [naverData, setNaverData] = useState(null);

  // ✅ 추천가(느린) 결과
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [suggestionError, setSuggestionError] = useState("");
  const [suggestionData, setSuggestionData] = useState(null);

  // 부모에서 startPrice가 바뀌면 표시 값만 맞춰줌
  useEffect(() => {
    setPriceInput(startPrice || "");
  }, [startPrice]);

  // 콤마 포함 표시
  const displayPrice = useMemo(() => {
    if (priceInput === "" || priceInput === null || priceInput === undefined) return "";
    const num = String(priceInput).replace(/\D/g, "");
    if (!num) return "";
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }, [priceInput]);

  // 부모 반영
  const syncToParent = (numericString) => {
    onChange?.("startPrice", numericString);
  };

  // 버튼 기반 변경: 히스토리 push
  const applyButtonPrice = (nextRaw) => {
    const currentNorm = normalizePrice(priceInput);
    const nextNorm = normalizePrice(nextRaw);

    if (currentNorm !== nextNorm) {
      setPriceHistory((prev) => [...prev, currentNorm || "0"]);
    }

    setPriceInput(nextNorm);
    syncToParent(nextNorm);
  };

  // 직접 입력
  const handlePrice = (e) => {
    const onlyNum = e.target.value.replace(/\D/g, "").slice(0, 12);
    setPriceInput(onlyNum);
    syncToParent(onlyNum);
  };

  // ✅ 가격 추천 버튼 클릭: 모달 오픈 + (네이버 먼저) + (추천가 병렬)
  const handleRecommendPrice = async () => {
    const q = String(productName ?? "").trim();

    // 상품명이 없으면 UX상 안내
    if (!q) {
      setModalOpen(true);
      setNaverError("상품명이 비어 있어 네이버 시세 검색을 할 수 없습니다.");
      setSuggestionError("상품명이 비어 있어 가격 추천을 할 수 없습니다.");
      return;
    }

    setModalOpen(true);

    // 상태 초기화
    setNaverData(null);
    setSuggestionData(null);
    setNaverError("");
    setSuggestionError("");

    // 1) 네이버 시세 (빠른 편) - ✅ limit=50
    setNaverLoading(true);
    const naverPromise = fetchNaverShoppingPrices(q, 50)
      .then((res) => {
        setNaverData(res);
      })
      .catch((e) => {
        const msg = e?.friendlyMessage || e?.message || "네이버 시세 조회 실패";
        setNaverError(msg);
      })
      .finally(() => setNaverLoading(false));

    // 2) 서버 가격 추천 (느릴 수 있음)
    setSuggestionLoading(true);
    const suggestPromise = fetchPriceSuggestion(q)
      .then((res) => {
        setSuggestionData(res);
      })
      .catch((e) => {
        const msg = e?.friendlyMessage || e?.message || "가격 추천 조회 실패";
        setSuggestionError(msg);
      })
      .finally(() => setSuggestionLoading(false));

    // 둘 다 병렬 실행 (모달은 열린 상태에서 각각 도착하는대로 렌더)
    await Promise.allSettled([naverPromise, suggestPromise]);
  };

  // 빠른 가격 버튼: 0이면 세팅, 그 외에는 더하기
  const handleQuickPrice = (value) => {
    const currentNum = Number(normalizePrice(priceInput));
    if (value === 0) {
      applyButtonPrice("0");
      return;
    }
    const next = currentNum + value;
    const clamped = Math.min(next, 999999999999);
    applyButtonPrice(String(clamped));
  };

  // 이전 금액
  const handlePrevPrice = () => {
    setPriceHistory((history) => {
      if (!history.length) return history;
      const prev = history[history.length - 1];
      const newHistory = history.slice(0, -1);

      setPriceInput(prev);
      syncToParent(prev);

      return newHistory;
    });
  };

  const hasPrev = priceHistory.length > 0;

  /* ---------------- 시작/종료 일시 ---------------- */
  const now = dayjs();
  const initialStart = startDate ? dayjs(startDate) : now;

  const [start, setStart] = useState(initialStart); // 표시용
  const [end, setEnd] = useState(endDate ? dayjs(endDate) : null);

  const [startTime, setStartTime] = useState(initialStart);
  const [endTime, setEndTime] = useState(null);

  useEffect(() => {
    const s = startDate ? dayjs(startDate) : dayjs();
    setStart(s);
    setStartTime(s);
    onChange?.("startDate", s.second(0).millisecond(0).toISOString());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (endDate) setEnd(dayjs(endDate));
  }, [endDate]);

  const mergeToISO = (date, time, fallback) => {
    if (!date) return "";
    const base = dayjs(date);
    const src = time || fallback || base;
    return base
      .hour(dayjs(src).hour())
      .minute(dayjs(src).minute())
      .second(0)
      .millisecond(0)
      .toISOString();
  };

  const handlePickEnd = (value) => {
    setEnd(value);
    onChange?.(
      "endDate",
      value ? mergeToISO(value, endTime, dayjs().hour(22).minute(0)) : ""
    );
  };

  const onPickEndTime = (t) => {
    setEndTime(t);
    onChange?.(
      "endDate",
      end ? mergeToISO(end, t, dayjs().hour(22).minute(0)) : ""
    );
  };

  const disablePastEnd = (date) => date.isBefore(dayjs().startOf("day"));

  return (
    <div className={styles.wrap}>
      <h2 className={styles.sectionTitle}>
        초기 가격 설정 <span className={styles.required}>*</span>
      </h2>

      {/* 초기 가격 인풋 + 가격 추천 + 이전 금액 */}
      <div className={styles.priceRow}>
        <OutlinedInput
          className={styles.priceInput}
          value={displayPrice}
          onChange={handlePrice}
          placeholder="초기가격(원)"
          inputProps={{ inputMode: "numeric" }}
          startAdornment={<InputAdornment position="start">₩</InputAdornment>}
        />
        <button
          type="button"
          className={styles.recommendBtn}
          onClick={handleRecommendPrice}
        >
          가격 추천
        </button>
        <button
          type="button"
          className={styles.previousBtn}
          onClick={handlePrevPrice}
          disabled={!hasPrev}
        >
          이전 금액
        </button>
      </div>

      {/* 빠른 가격 선택 버튼들 */}
      <div className={styles.quickButtonsRow}>
        {QUICK_PRICE_OPTIONS.map((opt) => (
          <button
            key={opt.value + opt.label}
            type="button"
            className={styles.quickBtn}
            onClick={() => handleQuickPrice(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <h2 className={styles.sectionTitle}>
        경매 시작/끝 시간 정하기 <span className={styles.required}>*</span>
      </h2>

      <div className={styles.dateInputs}>
        <TextField
          className={styles.dateField}
          label="시작 날짜(자동)"
          value={start ? start.format("YYYY.MM.DD HH:mm") : ""}
          inputProps={{ readOnly: true }}
        />
        <TextField
          className={styles.dateField}
          label="종료 날짜"
          value={
            end
              ? endTime
                ? dayjs(mergeToISO(end, endTime)).format("YYYY.MM.DD HH:mm")
                : end.format("YYYY.MM.DD")
              : ""
          }
          inputProps={{ readOnly: true }}
          placeholder="종료일을 달력에서 선택"
        />
      </div>

      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko">
        <div className={styles.calendars}>
          <div className={styles.calendarCol}>
            <div className={styles.monthLabel}>
              {start ? start.format("MMMM YYYY") : dayjs().format("MMMM YYYY")}
            </div>
            <DateCalendar
              value={start}
              onChange={() => {
                /* 시작일 수정 불가 */
              }}
              sx={calendarSX}
            />
            <div className={styles.timeWrap}>
              <div className={styles.timeHeader}>시작 시간(자동)</div>
              <div className={styles.timeRow}>
                <TimePicker
                  ampm={false}
                  format="HH:mm"
                  value={startTime}
                  readOnly
                  disabled
                  minutesStep={5}
                  slotProps={{
                    textField: {
                      label: "",
                      placeholder: "현재 시각",
                      InputLabelProps: { shrink: false },
                    },
                  }}
                  sx={timeSX}
                />
              </div>
              <div className={styles.timeHint}>
                * 시작 일시는 등록 시각으로 자동 설정됩니다.
              </div>
            </div>
          </div>

          <div className={styles.calendarCol}>
            <div className={styles.monthLabel}>
              {end
                ? end.format("MMMM YYYY")
                : (start || dayjs().add(1, "month")).format("MMMM YYYY")}
            </div>
            <DateCalendar
              value={end}
              onChange={handlePickEnd}
              shouldDisableDate={disablePastEnd}
              sx={calendarSX}
            />
            <div className={styles.timeWrap}>
              <div className={styles.timeHeader}>종료 시간</div>
              <div className={styles.timeRow}>
                <TimePicker
                  ampm={false}
                  format="HH:mm"
                  value={endTime}
                  onChange={onPickEndTime}
                  minutesStep={5}
                  disabled={!end}
                  slotProps={{
                    textField: {
                      label: "",
                      placeholder: "예: 22:00",
                      InputLabelProps: { shrink: false },
                    },
                  }}
                  sx={timeSX}
                />
              </div>
              <div className={styles.timeHint}>
                * 종료일을 먼저 선택한 뒤 시간을 지정하세요. <br />
                지정하지 않으면 22:00로 저장됩니다.
              </div>
            </div>
          </div>
        </div>
      </LocalizationProvider>

      {/* ✅ 가격 추천 모달 */}
      <PriceSuggestionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        productName={String(productName ?? "").trim()}

        naverResponse={naverData}
        naverLoading={naverLoading}
        naverError={naverError}

        suggestionResponse={suggestionData}
        suggestionLoading={suggestionLoading}
        suggestionError={suggestionError}

        onApplyRecommended={(priceStr) => {
          applyButtonPrice(priceStr);
          setModalOpen(false);
        }}
      />
    </div>
  );
}

/** 캘린더 색상 커스텀 */
const calendarSX = {
  "& .MuiPickersDay-root.Mui-selected": { backgroundColor: "#0057FF" },
  "& .MuiPickersDay-root.Mui-selected:hover": {
    backgroundColor: "#0057FF",
    opacity: 0.9,
  },
  "& .MuiPickersDay-root:not(.Mui-selected):hover": {
    backgroundColor: "#E8EFFC",
  },
  "& .MuiPickersDay-root.Mui-disabled": { color: "#8B94A4" },
  "& .MuiDayCalendar-weekDayLabel": { color: "#656F81" },
  "& .MuiPickersCalendarHeader-label": {
    fontWeight: 600,
    color: "#121316",
  },
  "& .MuiPickersArrowSwitcher-button": { color: "#454C58" },
};

/** TimePicker 기본 톤 */
const timeSX = {
  "& .MuiOutlinedInput-root": { borderRadius: "12px" },
  "& .MuiFormLabel-root": { color: "#656F81" },
};
