import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { addInquiry } from "../../utils/InquiryStorage";
import "../../styles/Inquiry/Inquiry.css";

const TYPES = ["이용 안내", "구매 안내", "환불 안내", "기타 문의"];
const MAX_TITLE = 50;

export default function InquiryWrite() {
  const [type, setType] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [agree, setAgree] = useState(false);
  const titleLeft = useMemo(() => MAX_TITLE - title.length, [title]);
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    if (!type) return alert("문의 유형을 선택해 주세요.");
    if (!title.trim()) return alert("문의 제목을 입력해 주세요.");
    if (!content.trim()) return alert("문의 내용을 입력해 주세요.");
    if (!agree) return alert("개인정보 수집 및 이용에 동의해 주세요.");

    const today = new Date().toISOString().slice(0, 10);
    const id = String(Date.now());
    addInquiry({ id, type, title, content, date: today, status: "접수 완료" });
    alert("문의가 접수되었습니다.");
    navigate("/inquiries");
  }

  return (
    <div className="vb-inquiry__wrap">
      <h1 className="vb-inquiry__title">문의하기</h1>
      <form className="vb-inquiry__card" onSubmit={handleSubmit}>
        <div className="vb-inquiry__row">
          <div className="vb-inquiry__label">문의 유형</div>
          <div>
            <select
              className="vb-inquiry__select--full"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="">문의 유형 선택</option>
              {TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="vb-inquiry__row">
          <div className="vb-inquiry__label">문의 제목</div>
          <div>
            <input
              className="vb-inquiry__input"
              maxLength={MAX_TITLE}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력하세요."
            />
            <p className="vb-inquiry__help">
              ({titleLeft}자 남음)
            </p>
          </div>
        </div>

        <div className="vb-inquiry__row">
          <div className="vb-inquiry__label">문의 내용</div>
          <div>
            <textarea
              className="vb-inquiry__textarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="문의 내용을 입력하세요."
            />
          </div>
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input type="checkbox" checked={agree} onChange={(e)=>setAgree(e.target.checked)} />
          (필수) 개인 정보 수집 및 이용에 동의합니다.
        </label>

        <div className="vb-inquiry__actions">
          <Link to="/inquiries" className="vb-inquiry__btn">취소</Link>
          <button type="submit" className="vb-inquiry__btn vb-inquiry__btn--primary">문의하기</button>
        </div>
      </form>
    </div>
  );
}
