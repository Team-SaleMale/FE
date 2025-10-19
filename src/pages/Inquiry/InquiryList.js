import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ensureSeed, getAllInquiries } from "../../utils/InquiryStorage";
import "../../styles/Inquiry/Inquiry.css";
import { FileEdit, Filter } from "lucide-react";

export default function InquiryList() {
  useEffect(() => { ensureSeed(); }, []);
  const [filter, setFilter] = useState("전체");
  const data = getAllInquiries();

  const filtered = useMemo(() => {
    if (filter === "전체") return data;
    return data.filter((d) => d.type === filter);
  }, [filter, data]);

  const navigate = useNavigate();

  return (
    <div className="vb-inquiry__wrap">
      <h1 className="vb-inquiry__title">문의 내역</h1>

      <div className="vb-inquiry__toolbar">
        <span className="vb-inquiry__filter">
          <Filter size={16} />
          필터
        </span>
        <select
          className="vb-inquiry__select"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option>전체</option>
          <option>이용 안내</option>
          <option>구매 안내</option>
          <option>환불 안내</option>
          <option>기타 문의</option>
        </select>
      </div>

      <table className="vb-inquiry__table">
        <thead>
          <tr>
            <th style={{ width: 80 }}>번호</th>
            <th style={{ width: 140 }}>문의 유형</th>
            <th>문의 제목</th>
            <th style={{ width: 160 }}>문의 날짜</th>
            <th style={{ width: 140 }}>상태</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td className="vb-inquiry__empty" colSpan={5}>
                문의 내역이 없습니다.
              </td>
            </tr>
          ) : (
            filtered.map((row, idx) => (
              <tr
                key={row.id}
                style={{ cursor: "pointer" }}
                onClick={() => navigate(`/inquiries/${row.id}`)}
              >
                <td>{filtered.length - idx}</td>
                <td>{row.type}</td>
                <td>{row.title}</td>
                <td>{row.date}</td>
                <td>
                  <span className="vb-inquiry__status">
                    <span className="vb-dot" />
                    {row.status}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <Link className="vb-inquiry__fab" to="/inquiries/new">
        <FileEdit size={18} /> 문의하기
      </Link>
    </div>
  );
}
