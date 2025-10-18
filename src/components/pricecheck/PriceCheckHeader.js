import "../../styles/PriceCheck/PriceCheckHeader.css";

export default function PriceCheckHeader({ title, value, onChange, placeholder }) {
  return (
    <div className="pc-header">
      <h1 className="pc-title">{title}</h1>
      <div className="pc-search">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
        <button type="submit" className="pc-search-btn">Q</button>
      </div>
    </div>
  );
}
