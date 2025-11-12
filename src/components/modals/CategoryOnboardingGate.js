// src/components/modals/CategoryOnboardingGate.jsx
import React, { useEffect, useState, useCallback } from "react";
import CategoryOnboardingModal from "./CategoryOnboardingModal";
import { saveUserCategories } from "../../api/users/service";

const ONBOARDING_FLAG_KEY = "showCategoryOnboarding";

export default function CategoryOnboardingGate() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const flag = localStorage.getItem(ONBOARDING_FLAG_KEY);
      setOpen(flag === "1");
    } catch {}
  }, []);

  const handleClose = useCallback(() => setOpen(false), []);
  const handleSave = useCallback(async (uiIds) => {
    await saveUserCategories(uiIds); // 서버에 저장
  }, []);

  return (
    <CategoryOnboardingModal
      open={open}
      onClose={handleClose}
      onSave={handleSave}
      defaultSelected={[]}
      minSelection={1}
      maxSelection={12}
    />
  );
}
