// src/components/Lab/UploadPanel.jsx
import React, { useState } from "react";
import SectionTitle from "./SectionTitle";
import PhotoUploadCard from "./PhotoUploadCard";

function UploadPanel({ mode, onRunExperiment, loading = false }) {
  const isWear = mode === "wear";
  const isDecor = mode === "decor";

  // 🔹 실제 API로 보낼 파일 상태 (입어보기 기준)
  const [backgroundFile, setBackgroundFile] = useState(null); // 내 전신 사진
  const [garmentFile, setGarmentFile] = useState(null); // 입어볼 옷(단일)

  const handleExperiment = () => {
    if (!onRunExperiment) return;

    if (isWear) {
      onRunExperiment({
        backgroundFile,
        garmentFile,
      });
    } else {
      // decor 모드는 지금은 안 쓰이니까 기존처럼만 동작
      onRunExperiment();
    }
  };

  return (
    <div className="lab-upload-panel">
      {isWear && (
        <>
          <SectionTitle
            step={1}
            title="나의 전신 사진"
            subtitle="얼굴과 전신이 잘 보이는 사진을 업로드해주세요."
          />
          <PhotoUploadCard
            label="내 전신 사진"
            description="정면으로 찍은 전신 사진이 가장 좋아요."
            // 🔹 전신 사진 File을 상태에 저장
            onFileChange={(file) => setBackgroundFile(file || null)}
          />

          <SectionTitle
            step={2}
            title="입어보고 싶은 옷"
            subtitle="경매·입찰을 고민 중인 상품 이미지를 업로드해주세요."
          />
          <PhotoUploadCard
            label="옷 이미지"
            description="상품 상세 이미지 또는 전체 실루엣이 보이는 이미지를 추천합니다."
            // 🔹 옷(단일) File을 상태에 저장
            onFileChange={(file) => setGarmentFile(file || null)}
          />
        </>
      )}

      {isDecor && (
        <>
          <SectionTitle
            step={1}
            title="내 공간 사진"
            subtitle="벽과 바닥이 잘 보이도록 방 전체를 찍어주세요."
          />
          <PhotoUploadCard
            label="방 전체 사진"
            description="창문, 벽, 바닥이 함께 나오는 사진이면 더 좋습니다."
          />

          <SectionTitle
            step={2}
            title="배치하고 싶은 아이템"
            subtitle="벽지, 침대, 책상 등 배치해보고 싶은 아이템 사진을 올려주세요."
          />
          <PhotoUploadCard
            label="벽지 사진"
            description="색상과 패턴이 잘 보이는 이미지를 업로드해주세요."
          />
          <PhotoUploadCard
            label="침대 / 가구 사진"
            description="정면 또는 측면에서 찍은 제품 사진이면 좋습니다."
            multiple
          />
        </>
      )}

      <SectionTitle
        step={3}
        title="실험하기"
        subtitle="준비가 되었다면 아래 버튼을 눌러 결과를 확인해보세요."
      />
      <button
        type="button"
        className="lab-experiment-button"
        onClick={handleExperiment}
        disabled={loading}
      >
        {loading ? "가상 피팅 중..." : "실험해보기"}
      </button>
    </div>
  );
}

export default UploadPanel;
