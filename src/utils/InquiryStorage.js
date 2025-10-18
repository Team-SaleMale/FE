// src/utils/InquiryStorage.js
const KEY = "vb_inquiries_v1";

/** 저장된 모든 문의 가져오기 */
export function getAllInquiries() {
  const raw = localStorage.getItem(KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/** 전체 목록 저장 */
export function saveAllInquiries(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

/** 문의 추가 (목록 맨 앞에 삽입) */
export function addInquiry(item) {
  const list = getAllInquiries();
  list.unshift(item);
  saveAllInquiries(list);
}

/** ID로 하나 조회 */
export function getInquiryById(id) {
  return getAllInquiries().find((q) => q.id === id);
}

/** 데모 데이터 주입(없을 때만) */
export function ensureSeed() {
  const has = getAllInquiries();
  if (has.length) return;

  const today = new Date().toISOString().slice(0, 10);
  const demo = [
    {
      id: "1",
      type: "이용 안내",
      title: "선생님 찾는 방법",
      content: "처음 이용하는데 선생님/학생 찾는 방법을 모르겠어요.",
      date: today,
      status: "접수 완료"
    },
    {
      id: "2",
      type: "구매 안내",
      title: "결제 영수증 출력 문의",
      content: "영수증을 어디서 출력하나요?",
      date: today,
      status: "답변 완료",
      answer:
        "마이페이지 > 결제내역에서 영수증 출력이 가능합니다. 문제가 있으면 다시 문의주세요!",
      answerDate: today
    }
  ];
  saveAllInquiries(demo);
}
