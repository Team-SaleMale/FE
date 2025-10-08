// PriceAndSchedule.js
import React, { useEffect, useMemo, useState } from "react";
import styles from "../../styles/AuctionRegistration/PriceAndSchedule.module.css";

// MUI - community 구성 요소만 사용 (Pro 없이 동작)
// 달력은 DateCalendar 두 개를 나란히 배치해 'range' UX를 구현
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import OutlinedInput from "@mui/material/OutlinedInput";

import dayjs from "dayjs";
import "dayjs/locale/ko";
dayjs.locale("ko");



export default function PriceAndSchedule({
  startPrice = "",
  startDate = "",
  endDate = "",
  onChange,
}) {
  // 내부 표시용 상태 (부모에는 항상 ISO string/숫자문자열로 올려보냄)
  const [priceInput, setPriceInput] = useState(startPrice || "");
  const [start, setStart] = useState(startDate ? dayjs(startDate) : null);
  const [end, setEnd] = useState(endDate ? dayjs(endDate) : null);

  useEffect(() => setPriceInput(startPrice || ""), [startPrice]);
  useEffect(() => setStart(startDate ? dayjs(startDate) : null), [startDate]);
  useEffect(() => setEnd(endDate ? dayjs(endDate) : null), [endDate]);

  // 3자리 콤마 표시용
  const displayPrice = useMemo(() => {
    if (!priceInput) return "";
    const num = String(priceInput).replace(/\D/g, "");
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }, [priceInput]);

  const handlePrice = (e) => {
    const onlyNum = e.target.value.replace(/\D/g, "").slice(0, 12);
    setPriceInput(onlyNum);
    onChange?.("startPrice", onlyNum); // 부모에는 콤마 없는 숫자 문자열
  };

  // 날짜 클릭 로직: 첫 선택은 start, 두 번째는 end, 역전되면 스왑
  const handlePick = (which, value) => {
    if (which === "start") {
      setStart(value);
      // start를 고르면 end가 start보다 이전이면 end 비움
      if (end && value && end.isBefore(value, "day")) setEnd(null);
      onChange?.("startDate", value ? value.toISOString() : "");
    } else {
      setEnd(value);
      // end를 고르면 start가 없으면 자동으로 start=그 날
      if (!start && value) {
        setStart(value);
        onChange?.("startDate", value.toISOString());
      }
      onChange?.("endDate", value ? value.toISOString() : "");
    }
  };

  // 비활성 규칙
  const disablePast = (date) => date.isBefore(dayjs().startOf("day"));
  const disableEnd = (date) =>
    disablePast(date) || (start ? date.isBefore(start, "day") : false);

  return (
    <div className={styles.wrap}>
      <h2 className={styles.sectionTitle}>초기 가격 설정 <span className={styles.required}>*</span></h2>

      {/* 초기 가격 인풋 */}
      <div className={styles.priceRow}>
        <OutlinedInput
          className={styles.priceInput}
          value={displayPrice}
          onChange={handlePrice}
          placeholder="초기가격(원)"
          inputProps={{ inputMode: "numeric" }}
          startAdornment={<InputAdornment position="start">₩</InputAdornment>}
        />
      </div>

      <h2 className={styles.sectionTitle}>경매 시작/끝 시간 정하기 <span className={styles.required}>*</span></h2>

      {/* 상단 인풋 2개 (읽기전용 표기) */}
      <div className={styles.dateInputs}>
        <TextField
          className={styles.dateField}
          placeholder="경매 시작 날짜"
          value={start ? start.format("YYYY.MM.DD") : ""}
          inputProps={{ readOnly: true }}
        />
        <TextField
          className={styles.dateField}
          placeholder="경매 종료 날짜"
          value={end ? end.format("YYYY.MM.DD") : ""}
          inputProps={{ readOnly: true }}
        />
      </div>

      {/* 달력 2개 나란히 */}
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko">
        <div className={styles.calendars}>
          <div className={styles.calendarCol}>
            <div className={styles.monthLabel}>
              {start ? start.format("MMMM YYYY") : dayjs().format("MMMM YYYY")}
            </div>
            <DateCalendar
              value={start}
              onChange={(v) => handlePick("start", v)}
              shouldDisableDate={disablePast}
              sx={calendarSX}
            />
          </div>

          <div className={styles.calendarCol}>
            <div className={styles.monthLabel}>
              {end
                ? end.format("MMMM YYYY")
                : (start || dayjs().add(1, "month")).format("MMMM YYYY")}
            </div>
            <DateCalendar
              value={end}
              onChange={(v) => handlePick("end", v)}
              shouldDisableDate={disableEnd}
              sx={calendarSX}
            />
          </div>
        </div>
      </LocalizationProvider>
    </div>
  );
}

/** MUI DateCalendar 하이라이트를 제공 팔레트로 맞춤 */
const calendarSX = {
  "& .MuiPickersDay-root.Mui-selected": {
    backgroundColor: "#0057FF",
  },
  "& .MuiPickersDay-root.Mui-selected:hover": {
    backgroundColor: "#0057FF",
    opacity: 0.9,
  },
  "& .MuiPickersDay-root:not(.Mui-selected):hover": {
    backgroundColor: "#E8EFFC",
  },
  "& .MuiPickersDay-root.Mui-disabled": {
    color: "#8B94A4",
  },
  "& .MuiDayCalendar-weekDayLabel": {
    color: "#656F81",
  },
  "& .MuiPickersCalendarHeader-label": {
    fontWeight: 600,
    color: "#121316",
  },
  "& .MuiPickersArrowSwitcher-button": {
    color: "#454C58",
  },
};
