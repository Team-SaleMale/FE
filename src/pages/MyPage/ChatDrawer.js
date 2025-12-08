import { Icon } from "@iconify/react";
import { useEffect, useState, useRef } from "react";
import styles from "../../styles/MyPage/ChatDrawer.module.css";
import { chatService } from "../../api/chat/service";
import { fetchAuctionDetail } from "../../api/auctions/service";

export default function ChatDrawer({ open, onClose, onBack, item, userId }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [canSend, setCanSend] = useState(true);
  const [chatInfo, setChatInfo] = useState(null);
  const [sellerInfo, setSellerInfo] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef(null);

  // 날짜+시간 포맷 함수
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    const timeStr = date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    if (isToday) {
      return timeStr; // 오늘이면 시간만
    }

    const dateStr = date.toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
    });

    return `${dateStr} ${timeStr}`; // 다른 날이면 날짜+시간
  };

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";

      console.log('🔍 ChatDrawer 열림, item:', item);

      // partner 정보가 있으면 바로 사용 (채팅 목록에서 온 경우)
      if (item?.partner) {
        console.log('✅ partner 정보 사용:', item.partner);
        setSellerInfo({
          nickname: item.partner.nickname,
          profileImage: item.partner.profileImage,
          location: item.partner.location || "위치 정보 없음",
        });
      }
      // partner 정보가 없고 itemId가 있으면 API로 가져오기 (낙찰 탭에서 온 경우)
      else if (item?.id) {
        console.log('🔄 상품 ID로 판매자 정보 조회:', item.id);
        fetchSellerInfo();
      } else {
        console.warn('⚠️ item에 partner도 id도 없습니다:', item);
      }

      // chatId가 있으면 채팅방 입장
      if (item?.chatId && userId) {
        console.log('🚪 채팅방 입장 시도:', { chatId: item.chatId, userId });
        enterChat();
      } else {
        console.warn('⚠️ chatId 또는 userId가 없어서 채팅방 입장 불가:', { chatId: item?.chatId, userId });
      }
    } else {
      document.body.style.overflow = "";
      // 채팅방 Drawer를 닫을 때는 exit API를 호출하지 않음
      // exit API는 사용자가 명시적으로 채팅을 종료하고 싶을 때만 호출
    }
    return () => {
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, item?.chatId, item?.id, item?.partner, userId]);

  // 메시지 폴링 (3초마다 새 메시지 확인)
  useEffect(() => {
    if (!open || !chatInfo?.chatId || !userId || !canSend) {
      return;
    }

    console.log('🔄 메시지 폴링 시작');
    const pollInterval = setInterval(() => {
      refreshMessages();
    }, 3000); // 3초마다 새 메시지 확인

    return () => {
      console.log('⏹️ 메시지 폴링 중지');
      clearInterval(pollInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, chatInfo?.chatId, userId, canSend]);

  const fetchSellerInfo = async () => {
    if (!item?.id) return;

    try {
      const response = await fetchAuctionDetail(item.id);
      console.log('📦 상품 상세 API 응답:', response);

      const data = response?.data?.result || response?.result || response?.data;
      console.log('📦 상품 데이터:', data);

      if (data) {
        // 위치 정보 조합
        let location = "위치 정보 없음";
        if (data.regionInfo) {
          const { sido, sigungu, eupmyeondong } = data.regionInfo;
          location = [sido, sigungu, eupmyeondong].filter(Boolean).join(' ');
        }

        const seller = {
          nickname: data.sellerInfo?.nickname || "판매자",
          profileImage: data.sellerInfo?.profileImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
          location: location,
        };

        console.log('👤 추출된 판매자 정보:', seller);
        setSellerInfo(seller);
      } else {
        console.warn('⚠️ 상품 데이터가 없습니다.');
      }
    } catch (error) {
      console.error('❌ 판매자 정보 조회 실패:', error);
      console.error('❌ 에러 상세:', error.response?.data);
      // 기본값 설정
      setSellerInfo({
        nickname: "판매자",
        profileImage: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
        location: "위치 정보 없음",
      });
    }
  };

  const enterChat = async () => {
    if (!item?.chatId || !userId) {
      console.error('❌ enterChat 호출 실패: chatId 또는 userId가 없습니다.', { chatId: item?.chatId, userId });
      return;
    }

    setLoading(true);
    try {
      const response = await chatService.enterChatRoom(item.chatId, userId, { page: 0, size: 50 });
      console.log('📨 채팅방 입장 API 응답:', response);

      const apiData = response?.data || response;
      console.log('📨 전체 응답 데이터:', apiData);

      // result 안에 실제 데이터가 있음
      const data = apiData?.result || apiData;
      console.log('📨 채팅방 데이터 (result):', data);
      console.log('🔍 canSend 값:', data.canSend);
      console.log('🔍 전체 응답 구조 확인:', JSON.stringify(data, null, 2));

      // 채팅방 정보 저장
      const chatInfo = {
        chatId: data.chatId || item.chatId,  // data에 없으면 item.chatId 사용
        readerId: data.readerId,
        unreadCountAfter: data.unreadCountAfter,
      };

      console.log('💾 저장할 chatInfo:', chatInfo);
      setChatInfo(chatInfo);

      // 메시지 변환 (API 형식 -> UI 형식)
      const formattedMessages = (data.messages || []).map((msg) => ({
        id: msg.messageId,
        sender: msg.senderId === userId ? "me" : "other",
        text: msg.content,
        time: formatDateTime(msg.sentAt),
        read: msg.read,
        type: msg.type,
      }));

      setMessages(formattedMessages);

      const canSendMessages = data.canSend !== false;
      setCanSend(canSendMessages);
      console.log('💬 메시지 전송 가능 여부:', canSendMessages);

      if (!canSendMessages) {
        console.warn('⚠️ 이 채팅방은 메시지를 보낼 수 없는 상태입니다.');
      }

      // 읽음 처리된 메시지 개수 로그
      if (data.updatedCount > 0) {
        console.log(`${data.updatedCount}개의 메시지를 읽음 처리했습니다.`);
      }
    } catch (error) {
      console.error('채팅방 입장 실패:', error);
      setMessages([]);
      setCanSend(false);
    } finally {
      setLoading(false);
    }
  };

  // 새 메시지만 조용히 가져오기 (폴링용)
  const refreshMessages = async () => {
    if (!chatInfo?.chatId || !userId) {
      return;
    }

    try {
      const response = await chatService.enterChatRoom(chatInfo.chatId, userId, { page: 0, size: 50 });
      const apiData = response?.data || response;
      const data = apiData?.result || apiData;

      console.log('🔄 메시지 갱신:', data);

      // canSend 상태 업데이트
      const canSendMessages = data.canSend !== false;
      if (canSendMessages !== canSend) {
        console.log('⚠️ canSend 상태 변경:', canSend, '->', canSendMessages);
        setCanSend(canSendMessages);
      }

      // 메시지 변환
      const formattedMessages = (data.messages || []).map((msg) => ({
        id: msg.messageId,
        sender: msg.senderId === userId ? "me" : "other",
        text: msg.content,
        time: formatDateTime(msg.sentAt),
        read: msg.read,
        type: msg.type,
      }));

      // 새 메시지가 있는지 확인 (메시지 개수로 비교)
      if (formattedMessages.length > messages.length) {
        console.log(`📬 새 메시지 ${formattedMessages.length - messages.length}개 도착!`);
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('❌ 메시지 갱신 실패:', error);
      // 폴링 중 에러는 조용히 무시 (사용자에게 알리지 않음)
    }
  };

  const exitChat = async () => {
    if (!chatInfo?.chatId || !userId) {
      return;
    }

    try {
      await chatService.exitChatRoom(chatInfo.chatId, userId);
      console.log('✅ 채팅방 나가기 완료:', chatInfo.chatId);

      // 채팅방 정보 초기화
      setChatInfo(null);
      setMessages([]);
      setCanSend(false);

      // 드로어 닫기
      alert('채팅방에서 나갔습니다. 더 이상 메시지를 보낼 수 없습니다.');
      onClose();
    } catch (error) {
      console.error('❌ 채팅방 나가기 실패:', error);
      alert('채팅방 나가기에 실패했습니다.');
    }
  };

  const handleExitChat = () => {
    const confirmed = window.confirm(
      '정말 채팅방에서 나가시겠습니까?\n나가면 더 이상 메시지를 보낼 수 없습니다.'
    );

    if (confirmed) {
      exitChat();
    }
  };

  const handleSend = async () => {
    if (!message.trim() || !chatInfo?.chatId || !userId) {
      console.warn('메시지를 보낼 수 없습니다:', { message: message.trim(), chatId: chatInfo?.chatId, userId });
      return;
    }

    const messageContent = message.trim();
    setMessage(""); // 입력창 즉시 비우기

    try {
      console.log('💬 메시지 전송 시도:', { chatId: chatInfo.chatId, content: messageContent, userId });

      const response = await chatService.sendMessage(userId, {
        chatId: chatInfo.chatId,
        content: messageContent,
        type: "TEXT",
      });

      console.log('✅ 메시지 전송 성공:', response);

      const data = response?.data || response;

      // 전송된 메시지를 목록에 추가
      const newMessage = {
        id: data.messageId || Date.now(),
        sender: "me",
        text: messageContent,
        time: formatDateTime(data.sentAt || new Date()),
        read: data.read || false,
        type: data.type || "TEXT",
      };

      setMessages([...messages, newMessage]);
    } catch (error) {
      console.error('❌ 메시지 전송 실패:', error);
      console.error('❌ 에러 상세:', error.response?.data);
      // 전송 실패 시 입력창에 다시 복원
      setMessage(messageContent);
      alert('메시지 전송에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 이미지 첨부 버튼 클릭
  const handleAttachClick = () => {
    if (canSend && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // 이미지 파일 선택 시
  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !chatInfo?.chatId || !userId) {
      return;
    }

    // 파일 타입 검증
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 전송할 수 있습니다.');
      return;
    }

    // 파일 크기 검증 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('이미지 크기는 10MB 이하만 가능합니다.');
      return;
    }

    setImageUploading(true);

    try {
      const response = await chatService.sendImage(userId, chatInfo.chatId, file);
      console.log('📷 이미지 전송 응답:', response);

      const data = response?.data?.result || response?.data || response;

      // UI에 이미지 메시지 추가
      const newMessage = {
        id: data.messageId || Date.now(),
        sender: "me",
        text: data.content, // 이미지 URL
        time: formatDateTime(data.sentAt || new Date()),
        type: "IMAGE",
      };

      setMessages([...messages, newMessage]);
      console.log('✅ 이미지 전송 성공');
    } catch (error) {
      console.error('❌ 이미지 전송 실패:', error);
      alert('이미지 전송에 실패했습니다.');
    } finally {
      setImageUploading(false);
      // 파일 입력 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (!open) return null;

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.drawer}>
        {/* 헤더 */}
        <header className={styles.header}>
          <button className={styles.close} onClick={onBack} aria-label="뒤로 가기">
            <Icon icon="solar:alt-arrow-left-linear" />
          </button>
          <div className={styles.headerInfo}>
            <div className={styles.avatar}>
              <img
                src={sellerInfo?.profileImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"}
                alt={sellerInfo?.nickname || "판매자"}
              />
            </div>
            <div className={styles.userInfo}>
              <h3 className={styles.userName}>{sellerInfo?.nickname || "판매자"}</h3>
              <p className={styles.location}>{sellerInfo?.location || "위치 정보 없음"}</p>
            </div>
          </div>
          {canSend && (
            <button className={styles.exitButton} onClick={handleExitChat} aria-label="채팅방 나가기">
              <Icon icon="solar:exit-outline" />
            </button>
          )}
        </header>

        {/* 상품 정보 - 상품 정보가 있을 때만 표시 */}
        {item && (item.title || item.image || item.images?.[0]) && (
          <div className={styles.productInfo}>
            <img
              src={item.image || item.images?.[0] || "https://via.placeholder.com/60x60?text=No+Image"}
              alt={item.title || "상품"}
              className={styles.productImage}
            />
            <div className={styles.productDetails}>
              <p className={styles.productTitle}>{item.title || "상품 정보 없음"}</p>
              {item.currentPrice && (
                <p className={styles.productPrice}>₩ {item.currentPrice?.toLocaleString()}</p>
              )}
            </div>
          </div>
        )}

        {/* 채팅 메시지 영역 */}
        <div className={styles.messagesContainer}>
          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p>메시지를 불러오는 중...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className={styles.emptyContainer}>
              <Icon icon="solar:chat-line-linear" className={styles.emptyIcon} />
              <p className={styles.emptyText}>아직 메시지가 없습니다.</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`${styles.messageWrapper} ${
                  msg.sender === "me" ? styles.myMessage : styles.otherMessage
                }`}
              >
                {msg.sender === "other" && (
                  <div className={styles.messageAvatar}>
                    <img
                      src={sellerInfo?.profileImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"}
                      alt={sellerInfo?.nickname || "판매자"}
                    />
                  </div>
                )}
                <div className={styles.messageBubble}>
                  {msg.type === "IMAGE" ? (
                    <img
                      src={msg.text}
                      alt="이미지"
                      className={styles.messageImage}
                      onClick={() => window.open(msg.text, '_blank')}
                    />
                  ) : (
                    <p className={styles.messageText}>{msg.text}</p>
                  )}
                  <span className={styles.messageTime}>{msg.time}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 입력 영역 */}
        {!canSend && (
          <div className={styles.disabledNotice}>
            <Icon icon="solar:info-circle-bold" />
            <span>이 대화는 종료되었습니다. 메시지를 보낼 수 없습니다.</span>
          </div>
        )}
        <div className={styles.inputContainer}>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleImageSelect}
            style={{ display: 'none' }}
          />
          <button
            className={styles.attachButton}
            aria-label="이미지 첨부"
            disabled={!canSend || imageUploading}
            onClick={handleAttachClick}
          >
            {imageUploading ? (
              <Icon icon="solar:loading-bold" className={styles.spinning} />
            ) : (
              <Icon icon="solar:gallery-linear" />
            )}
          </button>
          <input
            type="text"
            className={styles.input}
            placeholder={canSend ? "메시지를 입력하세요..." : "대화가 종료되었습니다"}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={!canSend}
          />
          <button
            className={styles.sendButton}
            onClick={handleSend}
            disabled={!message.trim() || !canSend}
            aria-label="전송"
          >
            <Icon icon="solar:plain-3-linear" />
          </button>
        </div>
      </div>
    </>
  );
}
