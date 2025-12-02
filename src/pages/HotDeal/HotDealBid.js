// src/pages/HotDeal/HotDealBid.js
import { useEffect, useMemo, useState } from "react";
import styles from "../../styles/HotDeal/HotDealBid.module.css";

/**
 * 오른쪽 DetailPanel(기본 560px) 왼쪽에 열리는 입찰 드로어
 *
 * Props
 * - open: boolean
 * - item: { id, title, startPrice, currentPrice, bidCount, endsAt, minIncrement }
 * - onClose: () => void
 * - onSubmit: (price:number) => (Promise|void)   // 서버 연동 콜백
 * - detailWidth?: number                          // DetailPanel 너비(px). 기본 560
 */
export default function HotDealBid({
  open,
  item,
  onClose,
  onSubmit,
  detailWidth = 560,
}) {
  const [price, setPrice] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const fmt = (v) =>
    (Number.isFinite(v) ? v : 0).toLocaleString(undefined, {
      maximumFractionDigits: 0,
    });

  // 다음 최소 입찰가 계산
  const nextMin = useMemo(() => {
    const cur = Number(item?.currentPrice ?? item?.startPrice ?? 0);
    const inc = Number(item?.minIncrement ?? 0);
    if (inc > 0) return cur + inc;

    // minIncrement 없으면: 1,000원 단위 & 최소 5%
    const fivePct = Math.ceil(cur * 0.05);
    const step = Math.max(1000, Math.ceil(fivePct / 1000) * 1000);
    return cur + step;
  }, [item]);

  // 열릴 때 입력 초기화
  useEffect(() => {
    if (!open) return;
    setPrice(nextMin ? String(nextMin) : "");
    setError("");
  }, [open, nextMin]);

  // ESC 닫기
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const parse = (v) => {
    const n = Number(String(v).replace(/[^\d]/g, ""));
    return Number.isFinite(n) ? n : 0;
  };

  const handleChange = (e) => {
    const raw = e.target.value;
    const n = parse(raw);
    setPrice(n ? n.toString() : "");
  };

  const plus = (delta) => setPrice((p) => String(parse(p) + delta));
  const setTo = (v) => setPrice(String(v));

  const validate = () => {
    const n = parse(price);
    if (n < nextMin) {
      setError(`최소 입찰가(₩${fmt(nextMin)}) 이상으로 입력하세요.`);
      return null;
    }
    setError("");
    return n;
  };

  const submit = async (e) => {
    e?.preventDefault?.();
    const n = validate();
    if (n == null) return;

    try {
      setBusy(true);
      // 서버 연동
      await onSubmit?.(n);

      // ✅ DetailPanel에 즉시 반영되도록 커스텀 이벤트 디스패치
      window.dispatchEvent(
        new CustomEvent("valuebid:bid-submitted", {
          detail: {
            itemId: item?.itemId ?? item?.id,
            price: n,
            bidder: "나",
            ts: Date.now(),
          },
        })
      );

      onClose?.();
    } catch (err) {
      // ✅ 400 에러일 때는 "본인의 가게에는 입찰 불가합니다" 노출
      const status = err?.response?.status ?? err?.status;
      if (status === 400) {
        setError("본인의 가게에는 입찰 불가합니다");
      } else {
        setError(err?.message || "입찰 처리 중 오류가 발생했습니다.");
      }
    } finally {
      setBusy(false);
    }
  };

  // CSS 커스텀 프로퍼티로 DetailPanel 너비 전달
  const styleVar = { ["--detail-w"]: `${detailWidth}px` };

  return (
    <>
      {/* 오른쪽 DetailPanel을 제외한 좌측 dim */}
      <div className={styles.dim} style={styleVar} onClick={onClose} aria-hidden />

      <aside
        className={`${styles.panel} ${styles.open}`}
        style={styleVar}
        role="dialog"
        aria-modal="true"
      >
        <header className={styles.header}>
          <div className={styles.titleBox}>
            <div className={styles.subTitleRow}>
              {item?.endsAt && <span className={styles.badge}>마감: {item.endsAt}</span>}
            </div>
            <h2 className={styles.title}>입찰하기</h2>
          </div>

          <button className={styles.closeBtn} onClick={onClose} aria-label="닫기">
            닫기
          </button>
        </header>

        <div className={styles.body}>
          {/* 개요 */}
          <section className={styles.block}>
            <div className={styles.itemTitle} title={item?.title}>
              {item?.title}
            </div>
            <div className={styles.kv}>
              <span>시작가</span>
              <b>₩{fmt(item?.startPrice)}</b>
            </div>
            <div className={styles.kv}>
              <span>현재가</span>
              <b>₩{fmt(item?.currentPrice ?? item?.startPrice)}</b>
            </div>
            <div className={styles.kv}>
              <span>다음 최소 입찰가</span>
              <b className={styles.accent}>₩{fmt(nextMin)}</b>
            </div>
            {Number.isFinite(item?.bidCount) && (
              <div className={styles.kv}>
                <span>입찰 수</span>
                <b>{fmt(item.bidCount)}</b>
              </div>
            )}
          </section>

          {/* 폼 */}
          <form onSubmit={submit} className={styles.block}>
            <label className={styles.label} htmlFor="bidPrice">
              입찰 금액
            </label>
            <div className={styles.inputRow}>
              <span className={styles.won}>₩</span>
              <input
                id="bidPrice"
                inputMode="numeric"
                autoFocus
                className={styles.input}
                value={price ? fmt(parse(price)) : ""}
                onChange={handleChange}
                placeholder={fmt(nextMin)}
              />
            </div>

            <div className={styles.quickRow}>
              <button type="button" onClick={() => setTo(nextMin)}>최소가</button>
              <button type="button" onClick={() => plus(1000)}>+1,000</button>
              <button type="button" onClick={() => plus(5000)}>+5,000</button>
              <button type="button" onClick={() => plus(10000)}>+10,000</button>
              <button type="button" onClick={() => plus(50000)}>+50,000</button>
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <button type="submit" className={styles.submit} disabled={busy}>
              {busy ? "입찰 처리 중..." : "입찰 제출"}
            </button>
          </form>

          {/* 안내 */}
          <section className={styles.note}>
            본 입찰은 취소가 제한될 수 있습니다. 입찰 전 상품 설명과
            마감 시간을 다시 확인하세요.
          </section>
        </div>
      </aside>
    </>
  );
}
