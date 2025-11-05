/* eslint-disable jsx-a11y/role-supports-aria-props */
import styles from "../../styles/AuctionList/Toolbar.module.css";

import HorSel from "../../assets/img/AuctionList/SortIcon/Horizontal_List_Selected.svg";
import HorUn  from "../../assets/img/AuctionList/SortIcon/Horizontal_List_UnSelected.svg";
import VerSel from "../../assets/img/AuctionList/SortIcon/Vertical_List_Selected.svg";
import VerUn  from "../../assets/img/AuctionList/SortIcon/Vertical_List_Unselected.svg";

const TABS = [
  { key: "ongoing", label: "진행 중" },
  { key: "done",    label: "진행 완료" },
  { key: "hot",     label: "인기" },
  { key: "rec",     label: "추천" },
];

export default function Toolbar({ activeTab, onChangeTab, layout, onToggleLayout }) {
  return (
    <div className={styles.wrap}>
      <h2 className={styles.title}>내 주변의 중고 거래 경매</h2>

      <ul className={styles.tabs} role="tablist" aria-label="auction filters">
        {TABS.map(t => {
          const isActive = activeTab === t.key;
          return (
            <li key={t.key}>
              <button
                role="tab"
                aria-selected={isActive}
                className={`${styles.tab} ${isActive ? styles.active : ""}`}
                onClick={() => onChangeTab(t.key)}
              >
                {t.label}
              </button>
            </li>
          );
        })}
      </ul>

      <div className={styles.right} role="group" aria-label="view layout">
        <div className={styles.viewToggle}>
          <button
            className={`${styles.viewBtn} ${layout === "horizontal" ? styles.on : ""}`}
            onClick={() => onToggleLayout("horizontal")}
            aria-pressed={layout === "horizontal"}
            title="가로형 정렬"
          >
            <img src={layout === "horizontal" ? HorSel : HorUn} alt="가로형 정렬" width={24} height={24} draggable={false} />
          </button>

          <button
            className={`${styles.viewBtn} ${layout === "vertical" ? styles.on : ""}`}
            onClick={() => onToggleLayout("vertical")}
            aria-pressed={layout === "vertical"}
            title="세로형 정렬"
          >
            <img src={layout === "vertical" ? VerSel : VerUn} alt="세로형 정렬" width={24} height={24} draggable={false} />
          </button>
        </div>
      </div>
    </div>
  );
}
