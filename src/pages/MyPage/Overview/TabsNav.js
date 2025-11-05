/* eslint-disable jsx-a11y/role-supports-aria-props */
import { useEffect, useRef, useState } from "react";
import styles from "../../../styles/MyPage/Overview/TabsNav.module.css";

export default function TabsNav({ tabs = [], active, onChange }) {
  const [underlineStyle, setUnderlineStyle] = useState({});
  const tabRefs = useRef({});

  useEffect(() => {
    if (active && tabRefs.current[active]) {
      const activeTab = tabRefs.current[active];
      setUnderlineStyle({
        left: activeTab.offsetLeft,
        width: activeTab.offsetWidth
      });
    }
  }, [active]);

  return (
    <div className={styles.wrapper}>
      <nav className={styles.root} role="tablist" aria-label="내 경매 탭">
        {tabs.map((t) => (
          <button
            key={t}
            ref={el => tabRefs.current[t] = el}
            role="tab"
            aria-selected={active === t}
            className={`${styles.tab} ${active === t ? styles.active : ""}`}
            onClick={() => onChange?.(t)}
          >
            {t}
          </button>
        ))}
      </nav>
      <div className={styles.underline} style={underlineStyle} />
    </div>
  );
}


