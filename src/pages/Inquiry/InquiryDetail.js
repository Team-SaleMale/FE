import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getInquiryById } from "../../utils/InquiryStorage";
import "../../styles/Inquiry/Inquiry.css";

export default function InquiryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const item = useMemo(() => getInquiryById(id), [id]);

  if (!item) {
    return (
      <div className="vb-inquiry__wrap">
        <h1 className="vb-inquiry__title">문의 내용</h1>
        <div className="vb-inquiry__bubble">해당 문의를 찾을 수 없습니다.</div>
        <div className="vb-inquiry__actions" style={{marginTop:16}}>
          <button className="vb-inquiry__btn" onClick={()=>navigate("/inquiries")}>목록으로</button>
        </div>
      </div>
    );
  }

  return (
    <div className="vb-inquiry__wrap">
      <h1 className="vb-inquiry__title">문의 내용</h1>
      <div className="vb-inquiry__bubble">
        <div style={{
          background:"#f3f4f6",
          borderRadius:10,
          padding:14,
          marginBottom:14,
          display:"flex",
          justifyContent:"space-between",
          alignItems:"center"
        }}>
          <div>
            {item.title}
            <span style={{marginLeft:12, color:"#6b7280"}}>
              | 아이디 wayossam2 | {item.type} | {item.date}
            </span>
          </div>
          <div className="vb-inquiry__status">
            <span className="vb-dot" />
            {item.status}
          </div>
        </div>
        <div style={{whiteSpace:"pre-wrap"}}>{item.content}</div>
        {item.status === "답변 완료" && (
          <div className="vb-inquiry__answer">
            <strong>답변 내용</strong>
            <div style={{whiteSpace:"pre-wrap"}}>{item.answer}</div>
            <div style={{textAlign:"right", color:"#6b7280", marginTop:8}}>
              답변 날짜 : {item.answerDate}
            </div>
          </div>
        )}
      </div>
      <div className="vb-inquiry__actions" style={{marginTop:16}}>
        <button className="vb-inquiry__btn" onClick={()=>navigate("/inquiries")}>목록으로</button>
      </div>
    </div>
  );
}
