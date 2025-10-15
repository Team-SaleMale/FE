// src/pages/AuctionRegistration/PriceAndSchedule.js
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
  /* ---------------- 가격 ---------------- */
  const [priceInput, setPriceInput] = useState(startPrice || "");
  useEffect(() => setPriceInput(startPrice || ""), [startPrice]);

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

  /* ---------------- 시작/종료 일시 ---------------- */
  // 시작: 오늘+현재시간 고정(수정 불가). props에 값이 있으면 그 값을 우선 사용.
  const now = dayjs();
  const initialStart = startDate ? dayjs(startDate) : now;

  const [start, setStart] = useState(initialStart);               // 표시용
  const [end, setEnd] = useState(endDate ? dayjs(endDate) : null);

  // 시작/종료 시간(표시/선택)
  const [startTime, setStartTime] = useState(initialStart);       // 오늘 현재 시각
  const [endTime, setEndTime] = useState(null);                   // 기본 null → 선택 유도

  // 마운트 시 부모 상태에 시작 일시(등록 시각) 기록
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

  // 종료 날짜 선택 (시작은 고정)
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

  // 비활성 규칙: 종료일은 오늘 이전 비활성
  const disablePastEnd = (date) => date.isBefore(dayjs().startOf("day"));

  return (
    <div className={styles.wrap}>
      <h2 className={styles.sectionTitle}>
        초기 가격 설정 <span className={styles.required}>*</span>
      </h2>

      {/* 초기 가격 */}
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
              ? (endTime
                  ? dayjs(mergeToISO(end, endTime)).format("YYYY.MM.DD HH:mm")
                  : end.format("YYYY.MM.DD"))
              : ""
          }
          inputProps={{ readOnly: true }}
          placeholder="종료일을 달력에서 선택"
        />
      </div>

      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko">
        <div className={styles.calendars}>
          {/* 시작 달력: 오늘 날짜 고정(수정 불가) */}
          <div className={styles.calendarCol}>
            <div className={styles.monthLabel}>
              {start ? start.format("MMMM YYYY") : dayjs().format("MMMM YYYY")}
            </div>
            <DateCalendar
              value={start}
              onChange={() => { /* 시작일은 수정 불가 */ }}
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

          {/* 종료 달력/시간: 사용자 선택 가능 */}
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
                * 종료일을 먼저 선택한 뒤 시간을 지정하세요. <br />지정하지 않으면 22:00로 저장됩니다.
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
  "& .MuiPickersDay-root.Mui-selected:hover": { backgroundColor: "#0057FF", opacity: 0.9 },
  "& .MuiPickersDay-root:not(.Mui-selected):hover": { backgroundColor: "#E8EFFC" },
  "& .MuiPickersDay-root.Mui-disabled": { color: "#8B94A4" },
  "& .MuiDayCalendar-weekDayLabel": { color: "#656F81" },
  "& .MuiPickersCalendarHeader-label": { fontWeight: 600, color: "#121316" },
  "& .MuiPickersArrowSwitcher-button": { color: "#454C58" },
};

/** TimePicker 기본 톤 (포커스 색상 지정 없음: 파란 포커스 제거) */
const timeSX = {
  "& .MuiOutlinedInput-root": { borderRadius: "12px" },
  "& .MuiFormLabel-root": { color: "#656F81" },
  // 포커스 보더 색상을 지정하지 않음 (CSS에서 검은 테두리 처리)
};
