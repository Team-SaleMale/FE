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

export default function PriceAndSchedule({
  startPrice = "",
  startDate = "",
  endDate = "",
  onChange,
}) {
  // 가격
  const [priceInput, setPriceInput] = useState(startPrice || "");

  // 날짜
  const [start, setStart] = useState(startDate ? dayjs(startDate) : null);
  const [end, setEnd] = useState(endDate ? dayjs(endDate) : null);

  // 시간 (기본값: 시작 10:00, 종료 22:00)
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);

  // 외부 prop 변화 동기화
  useEffect(() => setPriceInput(startPrice || ""), [startPrice]);
  useEffect(() => setStart(startDate ? dayjs(startDate) : null), [startDate]);
  useEffect(() => setEnd(endDate ? dayjs(endDate) : null), [endDate]);

  // 가격 표시(콤마)
  const displayPrice = useMemo(() => {
    if (!priceInput) return "";
    const num = String(priceInput).replace(/\D/g, "");
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }, [priceInput]);

  const handlePrice = (e) => {
    const onlyNum = e.target.value.replace(/\D/g, "").slice(0, 12);
    setPriceInput(onlyNum);
    onChange?.("startPrice", onlyNum);
  };

  // 날짜+시간 병합 → ISO
  const mergeToISO = (date, time, fallbackHour = 10) => {
    if (!date) return "";
    const base = dayjs(date);
    const hh = time ? dayjs(time).hour() : fallbackHour;
    const mm = time ? dayjs(time).minute() : 0;
    return base.hour(hh).minute(mm).second(0).millisecond(0).toISOString();
  };

  // 날짜 선택
  const handlePick = (which, value) => {
    if (which === "start") {
      setStart(value);
      if (!startTime) setStartTime(dayjs().hour(10).minute(0)); // 기본 10:00
      if (end && value && end.isBefore(value, "day")) setEnd(null);
      onChange?.("startDate", value ? mergeToISO(value, startTime, 10) : "");
    } else {
      setEnd(value);
      if (!endTime) setEndTime(dayjs().hour(22).minute(0));     // 기본 22:00
      if (!start && value) {
        setStart(value);
        if (!startTime) setStartTime(dayjs().hour(10).minute(0));
        onChange?.("startDate", mergeToISO(value, startTime, 10));
      }
      onChange?.("endDate", value ? mergeToISO(value, endTime, 22) : "");
    }
  };

  // 시간 선택
  const onPickTime = (which, t) => {
    if (which === "start") {
      setStartTime(t);
      onChange?.("startDate", start ? mergeToISO(start, t, 10) : "");
    } else {
      setEndTime(t);
      onChange?.("endDate", end ? mergeToISO(end, t, 22) : "");
    }
  };

  // 날짜 비활성 규칙
  const disablePast = (date) => date.isBefore(dayjs().startOf("day"));
  const disableEnd = (date) =>
    disablePast(date) || (start ? date.isBefore(start, "day") : false);

  return (
    <div className={styles.wrap}>
      <h2 className={styles.sectionTitle}>초기 가격 설정 <span className={styles.required}>*</span></h2>

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

      {/* 상단 날짜 표시 */}
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

      {/* 달력 */}
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

        {/* 날짜가 선택된 경우에만 시간 선택 섹션 노출 */}
        {(start || end) && (
          <div className={styles.timeWrap}>
            <div className={styles.timeHeader}>시간 선택</div>
            <div className={styles.timeRow}>
              <TimePicker
                label="시작 시간"
                value={startTime}
                onChange={(t) => onPickTime("start", t)}
                minutesStep={5}
                disabled={!start}
                sx={timeSX}
              />
              <TimePicker
                label="종료 시간"
                value={endTime}
                onChange={(t) => onPickTime("end", t)}
                minutesStep={5}
                disabled={!end}
                sx={timeSX}
              />
            </div>
            <div className={styles.timeHint}>
              * 시간을 지정하지 않으면 기본값(시작 10:00, 종료 22:00)이 저장됩니다.
            </div>
          </div>
        )}
      </LocalizationProvider>
    </div>
  );
}

/** 캘린더 색상 커스텀 */
const calendarSX = {
  "& .MuiPickersDay-root.Mui-selected": { backgroundColor: "#0057FF" },
  "& .MuiPickersDay-root.Mui-selected:hover": { backgroundColor: "#0057FF", opacity: 0.9 },
  "& .MuiPickersDay-root:not(.Mui-selected):hover": { backgroundColor: "#E8EFFC" },
  "& .MuiPickersDay-root.Mui-disabled": { color: "#8B94A4" },
  "& .MuiDayCalendar-weekDayLabel": { color: "#656F81" },
  "& .MuiPickersCalendarHeader-label": { fontWeight: 600, color: "#121316" },
  "& .MuiPickersArrowSwitcher-button": { color: "#454C58" },
};

/** TimePicker 톤 맞춤 */
const timeSX = {
  "& .MuiOutlinedInput-root": { borderRadius: "12px" },
  "& .MuiFormLabel-root": { color: "#656F81" },
  "& .Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#0057FF" },
};
