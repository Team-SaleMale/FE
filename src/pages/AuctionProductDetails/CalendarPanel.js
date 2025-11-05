/* eslint-disable no-unused-vars */
import { useMemo, useState } from "react";
import styles from "../../styles/AuctionProductDetails/CalendarPanel.module.css";

/** util: yyyy-mm-dd -> Date (local, 00:00) */
function parseISO(d) {
  if (!d) return null;
  const [y, m, day] = d.split("-").map(Number);
  return new Date(y, m - 1, day);
}
/** util: Date -> yyyy-mm-dd */
function fmt(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
/** yyyy-mm-dd + HH:mm(:ss) -> Date (로컬) */
function toDateTime(dateStr, timeStr, fallback = "00:00:00") {
  if (!dateStr) return null;
  const t = (timeStr && timeStr.trim()) ? timeStr.trim() : fallback;
  const [h, mi, s = "00"] = t.split(":").map(Number);
  const d = parseISO(dateStr);
  d.setHours(h || 0, mi || 0, s || 0, 0);
  return d;
}

/** month meta (6주 고정, 일요일 시작) */
function getMonthMatrix(year, monthIdx /* 0-11 */) {
  const first = new Date(year, monthIdx, 1);
  const firstDow = first.getDay(); // 0(Sun)~6(Sat)
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();

  const prevDays = firstDow;
  const cells = [];

  const prevMonthDays = new Date(year, monthIdx, 0).getDate();
  for (let i = prevDays - 1; i >= 0; i--) {
    const day = prevMonthDays - i;
    const d = new Date(year, monthIdx - 1, day);
    cells.push({ date: d, current: false, key: fmt(d) });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, monthIdx, day);
    cells.push({ date: d, current: true, key: fmt(d) });
  }
  while (cells.length % 7 !== 0 || cells.length < 42) {
    const last = cells[cells.length - 1].date;
    const d = new Date(last);
    d.setDate(d.getDate() + 1);
    cells.push({ date: d, current: false, key: fmt(d) });
  }
  return cells;
}

function MonthView({ baseDate, rangeStart, rangeEnd, side, onPrev, onNext }) {
  const year = baseDate.getFullYear();
  const monthIdx = baseDate.getMonth();
  const cells = useMemo(() => getMonthMatrix(year, monthIdx), [year, monthIdx]);

  const monthLabel = baseDate.toLocaleString("en-US", { month: "long" });
  const todayStr = fmt(new Date());
  const startStr = fmt(rangeStart);
  const endStr = fmt(rangeEnd);

  return (
    <div className={styles.month}>
      <div className={styles.monthHeaderRow}>
        <button
          type="button"
          className={`${styles.navBtn} ${side === "left" ? "" : styles.navDisabled}`}
          onClick={side === "left" ? onPrev : undefined}
          aria-label="Previous month"
        >
          ‹
        </button>
        <div className={styles.monthTitleWrap}>
          <span className={styles.monthTitle}>{monthLabel}</span>
          <span className={styles.yearNum}>{year}</span>
        </div>
        <button
          type="button"
          className={`${styles.navBtn} ${side === "right" ? "" : styles.navDisabled}`}
          onClick={side === "right" ? onNext : undefined}
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      <div className={styles.weekdays}>
        <span>SUN</span><span>MON</span><span>TUE</span><span>WED</span>
        <span>THU</span><span>FRI</span><span>SAT</span>
      </div>

      <div className={styles.grid}>
        {cells.map(({ date, current, key }) => {
          const dStr = fmt(date);
          const inRange = dStr >= startStr && dStr <= endStr;
          const isStart = dStr === startStr;
          const isEnd = dStr === endStr;
          const isToday = dStr === todayStr;

          const classNames = [
            styles.day,
            !current && styles.outside,
            inRange && styles.inRange,
            isStart && styles.start,
            isEnd && styles.end,
            isToday && styles.today,
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <div key={key} className={classNames} aria-label={dStr}>
              <span className={styles.dayNum}>{date.getDate()}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function CalendarPanel({ calendar }) {
  // 안전 파싱
  let start = parseISO(calendar?.startDate);
  let end = parseISO(calendar?.endDate);
  const today = new Date();
  if (!start) start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (!end) { const t = new Date(start); t.setDate(t.getDate() + 6); end = t; }
  if (start > end) [start, end] = [end, start];

  // 월 네비 (좌측 기준)
  const [baseLeft, setBaseLeft] = useState(new Date(start.getFullYear(), start.getMonth(), 1));
  const baseRight = new Date(baseLeft.getFullYear(), baseLeft.getMonth() + 1, 1);
  const prevMonth = () => setBaseLeft(new Date(baseLeft.getFullYear(), baseLeft.getMonth() - 1, 1));
  const nextMonth = () => setBaseLeft(new Date(baseLeft.getFullYear(), baseLeft.getMonth() + 1, 1));

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>Calendar</h3>

      {/* 날짜 + 시간 */}
      <div className={styles.row}>
        <div className={styles.item}>
          <div className={styles.label}>Start Day</div>
          <div className={styles.value}>{calendar?.startDate}</div>
          <div className={styles.time}>{calendar?.startTime ?? "00:00"}</div>
        </div>
        <div className={styles.item}>
          <div className={styles.label}>End Day</div>
          <div className={styles.value}>{calendar?.endDate}</div>
          <div className={styles.time}>{calendar?.endTime ?? "23:59"}</div>
        </div>
      </div>

      {/* 두 달 달력 */}
      <div className={styles.calendarWrap} role="group" aria-label="Auction calendar">
        <div className={styles.months}>
          <MonthView side="left"  baseDate={baseLeft}  rangeStart={start} rangeEnd={end} onPrev={prevMonth} />
          <MonthView side="right" baseDate={baseRight} rangeStart={start} rangeEnd={end} onNext={nextMonth} />
        </div>

        <div className={styles.legend}>
          <span className={styles.legendBox + " " + styles.legendRange}></span> 진행 기간
          <span className={styles.legendBox + " " + styles.legendStart}></span> 시작/종료
          <span className={styles.legendBox + " " + styles.legendToday}></span> 오늘
        </div>
      </div>
    </div>
  );
}
