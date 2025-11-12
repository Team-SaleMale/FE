// src/components/modals/CategoryOnboardingModal.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";

const ONBOARDING_FLAG_KEY = "showCategoryOnboarding";

const CATEGORIES = [
  { id: "book",           name: "도서",          icon: "solar:notebook-broken" },
  { id: "pet",            name: "반려동물",      icon: "solar:paw-linear" },
  { id: "home-appliance", name: "생활가전",      icon: "solar:washing-machine-minimalistic-linear" },
  { id: "digital",        name: "디지털기기",    icon: "solar:laptop-minimalistic-linear" },
  { id: "clothes",        name: "패션/의류",     icon: "solar:hanger-broken" },
  { id: "beauty",         name: "뷰티/미용",     icon: "solar:magic-stick-3-linear" },
  { id: "sports",         name: "스포츠/레저",   icon: "solar:balls-linear" },
  { id: "game-hobby",     name: "장난감/취미",   icon: "solar:reel-2-broken" },
  { id: "furniture",      name: "가구/인테리어", icon: "solar:armchair-2-linear" },
  { id: "food-processed", name: "식품",          icon: "solar:chef-hat-linear" },
  { id: "plant",          name: "식물",          icon: "solar:waterdrop-linear" },
  { id: "kids",           name: "유아동",        icon: "solar:smile-circle-linear" },
];

export default function CategoryOnboardingModal({
  open,
  onClose,
  defaultSelected = [],
  minSelection = 1,
  maxSelection = 12,
  onSave,
}) {
  const [selected, setSelected] = useState(defaultSelected);
  const all = useMemo(() => CATEGORIES, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (open) setSelected(defaultSelected);
  }, [open, defaultSelected]);

  if (!open) return null;

  const toggle = (id) => {
    setSelected((prev) => {
      const has = prev.includes(id);
      if (has) return prev.filter((x) => x !== id);
      if (prev.length >= maxSelection) return prev;
      return [...prev, id];
    });
  };

  const handleSave = async () => {
    if (selected.length < minSelection) {
      alert(`최소 ${minSelection}개 이상 선택하세요.`);
      return;
    }
    try {
      if (onSave) await onSave(selected);
      localStorage.removeItem(ONBOARDING_FLAG_KEY);
      onClose?.();
    } catch (e) {
      alert(e?.response?.data?.message || e?.message || "저장 중 오류가 발생했습니다.");
    }
  };

  const handleSkip = () => {
    localStorage.removeItem(ONBOARDING_FLAG_KEY);
    onClose?.();
  };

  const S = {
    overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,.42)", zIndex: 1000 },
    modal: { position: "fixed", inset: 0, zIndex: 1001, display: "grid", placeItems: "center" },
    panel: {
      width: "min(920px, 92vw)", maxHeight: "88vh", overflow: "hidden",
      background: "#fff", borderRadius: 24, boxShadow: "0 12px 40px rgba(0,0,0,.18)",
      padding: 24, display: "flex", flexDirection: "column",
    },
    header: { textAlign: "center", marginBottom: 8 },
    title: { margin: 0, fontSize: 22, fontWeight: 800 },
    sub: { margin: "6px 0 16px", color: "#666", fontSize: 14 },
    grid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, padding: "4px 6px", overflow: "auto" },
    item: (active) => ({
      border: "2px solid " + (active ? "#5a5af6" : "#e6e6f2"),
      boxShadow: active ? "0 0 0 3px rgba(90,90,246,0.12) inset" : "none",
      background: "#fff", borderRadius: 20, padding: "16px 10px",
      display: "flex", flexDirection: "column", alignItems: "center",
      transition: "border-color .15s ease, box-shadow .15s ease",
      cursor: "pointer",
    }),
    iconWrap: { width: 64, height: 64, borderRadius: "50%", background: "#f4f5f7", display: "grid", placeItems: "center", marginBottom: 10 },
    label: { fontSize: 15, fontWeight: 700, color: "#222" },
    footer: { marginTop: 16, display: "flex", justifyContent: "center", gap: 10 },
    primary: { minWidth: 160, height: 48, padding: "0 16px", borderRadius: 14, background: "#5a48f5", color: "#fff", fontWeight: 800, border: 0 },
    secondary: { minWidth: 140, height: 48, padding: "0 16px", borderRadius: 14, background: "#f1f2f5", color: "#444", fontWeight: 700, border: 0 },
  };

  const isMobile = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(max-width: 760px)").matches;

  return (
    <>
      <div style={S.overlay} onClick={handleSkip} />
      <div style={S.modal} role="dialog" aria-modal="true" aria-labelledby="catOnboardTitle">
        <div style={S.panel}>
          <header style={S.header}>
            <h3 id="catOnboardTitle" style={S.title}>관심 카테고리 설정</h3>
            <p style={S.sub}>관심 있는 카테고리를 선택하세요. (최대 12개)</p>
          </header>

          <div style={{ ...S.grid, ...(isMobile ? { gridTemplateColumns: "repeat(2, 1fr)" } : null) }}>
            {all.map((c) => {
              const active = selected.includes(c.id);
              return (
                <button key={c.id} type="button" style={S.item(active)} onClick={() => toggle(c.id)} aria-pressed={active}>
                  <div style={S.iconWrap}><Icon icon={c.icon} width="28" height="28" /></div>
                  <span style={S.label}>{c.name}</span>
                </button>
              );
            })}
          </div>

          <div style={S.footer}>
            <button type="button" style={S.secondary} onClick={handleSkip}>나중에 할게요</button>
            <button type="button" style={S.primary} onClick={handleSave}>저장하기</button>
          </div>
        </div>
      </div>
    </>
  );
}
