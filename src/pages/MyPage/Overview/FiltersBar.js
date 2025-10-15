import { useState, useRef, useEffect } from "react";
import styles from "../../../styles/MyPage/Overview/FiltersBar.module.css";

export default function FiltersBar({ totalCount = 0, sortValue = "latest", onSortChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const sortOptions = [
    { value: "latest", label: "최신순" },
    { value: "price-low", label: "낮은 가격순" },
    { value: "price-high", label: "높은 가격순" }
  ];

  const currentSort = sortOptions.find(opt => opt.value === sortValue) || sortOptions[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSortChange = (value) => {
    onSortChange?.(value);
    setIsOpen(false);
  };

  return (
    <div className={styles.root}>
      <div className={styles.left}>총 {totalCount} 개</div>
      <div className={styles.right} ref={dropdownRef}>
        <button
          className={styles.sortButton}
          onClick={() => setIsOpen(!isOpen)}
          aria-haspopup="true"
          aria-expanded={isOpen}
        >
          <span className={styles.sortLabel}>{currentSort.label}</span>
          <span className={`${styles.caret} ${isOpen ? styles.caretOpen : ""}`}>▼</span>
        </button>

        {isOpen && (
          <div className={styles.dropdown}>
            {sortOptions.map(option => (
              <button
                key={option.value}
                className={`${styles.dropdownItem} ${option.value === sortValue ? styles.dropdownItemActive : ""}`}
                onClick={() => handleSortChange(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


