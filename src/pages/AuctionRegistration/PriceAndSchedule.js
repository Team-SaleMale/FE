import React, { useEffect, useMemo, useState } from "react";
import styles from "../../styles/AuctionRegistration/PriceAndSchedule.module.css";

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

// 빠른 가격 선택 옵션 (value: 원 단위, label: 버튼 텍스트)
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
}) {
  /* ---------------- 가격 상태 ---------------- */
  const [priceInput, setPriceInput] = useState(startPrice || "");
  const [priceHistory, setPriceHistory] = useState([]); // ["0", "1000", "51000", ...]

  // 부모에서 startPrice가 바뀌면 표시 값만 맞춰줌 (히스토리는 유지)
  useEffect(() => {
    setPriceInput(startPrice || "");
  }, [startPrice]);

  // 화면에 표시될 콤마 포함 금액
  const displayPrice = useMemo(() => {
    if (priceInput === "" || priceInput === null || priceInput === undefined)
      return "";
    const num = String(priceInput).replace(/\D/g, "");
    if (!num) return "";
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }, [priceInput]);

  // 부모 상태 반영 공통 함수
  const syncToParent = (numericString) => {
    onChange?.("startPrice", numericString);
  };

  // 버튼(추천/빠른 선택)으로 가격 변경할 때: 히스토리에 현재값을 push
  const applyButtonPrice = (nextRaw) => {
    const currentNorm = normalizePrice(priceInput);
    const nextNorm = normalizePrice(nextRaw);

    if (currentNorm !== nextNorm) {
      // 현재 값을 히스토리에 저장 (없으면 0으로)
      setPriceHistory((prev) => [...prev, currentNorm || "0"]);
    }

    setPriceInput(nextNorm);
    syncToParent(nextNorm);
  };

  // 직접 입력(키보드): 히스토리는 쌓지 않음 (이전 금액은 버튼 기준으로만 동작)
  const handlePrice = (e) => {
    const onlyNum = e.target.value.replace(/\D/g, "").slice(0, 12);
    setPriceInput(onlyNum);
    syncToParent(onlyNum);
  };

  // 가격 추천 버튼: 랜덤 추천가 (1천 ~ 100만, 1천 단위)
  const handleRecommendPrice = () => {
    const min = 1000;
    const max = 1000000;
    const step = 1000;

    const steps = Math.floor((max - min) / step) + 1;
    const randomStepIndex = Math.floor(Math.random() * steps);
    const value = min + randomStepIndex * step;

    applyButtonPrice(String(value));
  };

  // 빠른 가격 버튼
  // - value === 0  → 0원으로 세팅
  // - 그 외        → 현재 값에 value 더하기
  const handleQuickPrice = (value) => {
    const currentNum = Number(normalizePrice(priceInput));

    if (value === 0) {
      applyButtonPrice("0");
      return;
    }

    const next = currentNum + value;
    const clamped = Math.min(next, 999999999999); // 최대 12자리
    applyButtonPrice(String(clamped));
  };

  // 이전 금액 버튼: 히스토리 스택에서 한 단계씩 되돌리기
  // 예) 0 → 1천 → 5만1천 → 이전 → 1천 → 이전 → 0
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

  const [startTime, setStartTime] = useState(initialStart); // 오늘 현재 시각
  const [endTime, setEndTime] = useState(null); // 기본 null → 선택 유도

  // 마운트 시 시작 일시(등록 시각) 기록
  useEffect(() => {
    const s = startDate ? dayjs(startDate) : dayjs();
    setStart(s);
    setStartTime(s);
    onChange?.("startDate", s.second(0).millisecond(0).toISOString());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 최초 한 번

  useEffect(() => {
    if (endDate) setEnd(dayjs(endDate));
  }, [endDate]);

  // 날짜+시간 병합 → ISO
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

  // 종료 날짜 선택
  const handlePickEnd = (value) => {
    setEnd(value);
    onChange?.(
      "endDate",
      value ? mergeToISO(value, endTime, dayjs().hour(22).minute(0)) : ""
    );
  };

  // 종료 시간 선택
  const onPickEndTime = (t) => {
    setEndTime(t);
    onChange?.(
      "endDate",
      end ? mergeToISO(end, t, dayjs().hour(22).minute(0)) : ""
    );
  };

  // 종료일은 오늘 이전 비활성
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
          startAdornment={
            <InputAdornment position="start">₩</InputAdornment>
          }
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

      {/* 상단 날짜 표시(읽기전용) */}
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
                ? dayjs(mergeToISO(end, endTime)).format(
                    "YYYY.MM.DD HH:mm"
                  )
                : end.format("YYYY.MM.DD")
              : ""
          }
          inputProps={{ readOnly: true }}
          placeholder="종료일을 달력에서 선택"
        />
      </div>

      <LocalizationProvider
        dateAdapter={AdapterDayjs}
        adapterLocale="ko"
      >
        <div className={styles.calendars}>
          {/* 시작 달력: 오늘 고정 */}
          <div className={styles.calendarCol}>
            <div className={styles.monthLabel}>
              {start
                ? start.format("MMMM YYYY")
                : dayjs().format("MMMM YYYY")}
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

          {/* 종료 달력 / 시간 */}
          <div className={styles.calendarCol}>
            <div className={styles.monthLabel}>
              {end
                ? end.format("MMMM YYYY")
                : (start || dayjs().add(1, "month")).format(
                    "MMMM YYYY"
                  )}
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
    </div>
  );
}

/** 캘린더 색상 커스텀 (달력 톤만 유지) */
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

/** TimePicker 기본 톤 (포커스 색상 지정 없음: 파란 포커스 제거) */
const timeSX = {
  "& .MuiOutlinedInput-root": { borderRadius: "12px" },
  "& .MuiFormLabel-root": { color: "#656F81" },
};
