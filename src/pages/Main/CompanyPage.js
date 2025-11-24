// src/pages/Company/Company.js
import React, { useEffect, useRef } from "react";
import styles from "../../styles/Main/CompanyPage.module.css";

// 배경/동영상/이미지 리소스 (FE/src/assets/img/Main/Company 에 넣기)
import bgVideo from "../../assets/img/Main/Company/bg.mp4";
import introVideo from "../../assets/img/Main/Company/intro.mp4";
import loopVideo from "../../assets/img/Main/Company/loop.mp4";
import patternImg from "../../assets/img/Main/Company/pattern.jpg";
import titImg from "../../assets/img/Main/Company/tit.png";
import txtImg from "../../assets/img/Main/Company/txt.png";
import txt2Img from "../../assets/img/Main/Company/txt2.png";
import btnImg from "../../assets/img/Main/Company/btn.png";
import reflectImg from "../../assets/img/Main/Company/reflect.png";
import lineImg from "../../assets/img/Main/Company/line.png";

export default function Company() {
  const circleRef = useRef(null);

  // article 위에 마우스 올렸을 때 회전 멈추는 동작
  useEffect(() => {
    const circleEl = circleRef.current;
    if (!circleEl) return;

    const articles = circleEl.querySelectorAll("article");

    const handleEnter = () => {
      circleEl.style.animationPlayState = "paused";
    };
    const handleLeave = () => {
      circleEl.style.animationPlayState = "running";
    };

    articles.forEach((el) => {
      el.addEventListener("mouseenter", handleEnter);
      el.addEventListener("mouseleave", handleLeave);
    });

    return () => {
      articles.forEach((el) => {
        el.removeEventListener("mouseenter", handleEnter);
        el.removeEventListener("mouseleave", handleLeave);
      });
    };
  }, []);

  return (
    <main className={styles.wrap} aria-label="ValueBid Company Cube">
      {/* 배경 영상 */}
      <video
        className={styles.bgVideo}
        src={bgVideo}
        loop
        autoPlay
        muted
        playsInline
      />

      {/* 3D Cube */}
      <section id="circle" ref={circleRef} className={styles.circle}>
        {/* face1 : 채널/SNS */}
        <article className={`${styles.article} ${styles.face1}`}>
          <h1 className={styles.faceTitle}>ValueBid Channels</h1>
          <div className={styles.inner}>
            <div>
              <p>
                <i className="fab fa-android" />
              </p>
              <h2>Android App</h2>
            </div>
            <div>
              <p>
                <i className="fab fa-apple" />
              </p>
              <h2>iOS App</h2>
            </div>
            <div>
              <p>
                <i className="fab fa-twitter-square" />
              </p>
              <h2>X / Twitter Updates</h2>
            </div>
            <div>
              <p>
                <i className="fab fa-facebook-square" />
              </p>
              <h2>Community Page</h2>
            </div>
            <div>
              <p>
                <i className="fab fa-youtube" />
              </p>
              <h2>ValueBid</h2>
            </div>
            <div>
              <p>
                <i className="fab fa-google-play" />
              </p>
              <h2>Store Launching</h2>
            </div>
          </div>
        </article>

        {/* face2 : 서비스 소개 */}
        <article className={`${styles.article} ${styles.face2}`}>
          <h1 className={styles.faceTitle}>About ValueBid</h1>
          <div className={styles.inner}>
            <div>
              <h2>News n Articles</h2>
              <img src={patternImg} alt="Pattern" />
              <h3>What is ValueBid?</h3>
              <p>
                ValueBid는 중고·리퍼·새상품까지 한 번에 모아
                <br />
                입찰과 즉시 구매를 동시에 지원하는 온라인 경매 플랫폼입니다.
                <br />
                <br />
                실시간 입찰 UX와 안전한 결제/정산 구조를 통해
                <br />
                판매자에게는 최적가 판매를, 구매자에게는 합리적인 낙찰 경험을
                제공합니다.
                <br />
                팀원: 정준영, 이관형, 유완규, 주동욱, 김예나, 최수연
              </p>
            </div>
          </div>
        </article>

        {/* face3 : Members (Backend 1,2,3) */}
        <article className={`${styles.article} ${styles.face3}`}>
          <h1 className={styles.faceTitle}>Members · Backend</h1>
          <div className={styles.inner}>
            <div>
              <div className={styles.memberPic1} />
              <div className={styles.memberCon}>
                <h2>Backend · 정준영</h2>
                <p>
                  경매/입찰 도메인 설계와 핵심 API를 담당합니다. 또한 핫딜
                  페이지의 API 설계를 구현하였습니다.
                </p>
                <span>Backend Engineer</span>
              </div>
            </div>
            <div>
              <div className={styles.memberPic2} />
              <div className={styles.memberCon}>
                <h2>Backend · 이관형</h2>
                <p>
                  채팅 websocket, 알림 websocket 등의 API 설계를 담당합니다.
                </p>
                <span>Backend Engineer</span>
              </div>
            </div>
            <div>
              <div className={styles.memberPic3} />
              <div className={styles.memberCon}>
                <h2>Backend · 유완규</h2>
                <p>
                  인증·권한, 로그/모니터링, 배포 파이프라인을 포함한 인프라
                  전반을 담당합니다. 안정적인 서비스 운영을 목표로 합니다.
                </p>
                <span>Backend / Infra</span>
              </div>
            </div>
          </div>
        </article>

    {/* face4 : Auction Promotion / Info */}
        <article className={`${styles.article} ${styles.face4}`}>
          <h1 className={styles.faceTitle}>Auction Promotion</h1>
          <div className={styles.inner}>
            <div>
              <video
                src={introVideo}
                loop
                controls
                muted
                playsInline
                className={styles.introVideo}
              />
              <h2>How ValueBid Works</h2>
              <p>
                한 번의 등록으로 수많은 입찰자를 만나는 온라인 경매 플랫폼,
                ValueBid.
                <br />
                <br />
                판매자는 사진과 기본 정보만 입력하면 경매가 바로 시작되고,
                구매자는 실시간 입찰 그래프와 타이머를 보며 원하는 가격에
                참여할 수 있습니다. 모든 과정은 기록으로 남아 투명하게
                확인할 수 있습니다.
              </p>
            </div>
            <div>
              <h2>Contact &amp; Demo</h2>
              <p>
                파트너십·제휴·데모 요청은 아래 메일로 문의해 주세요.
                <br />
                business@valuebid.kr
              </p>
              <em>2025.01.15</em>
            </div>
          </div>
        </article>

        {/* face5 : 브랜드/핵심 가치 (기존 로봇 섹션 활용) */}
        <article className={`${styles.article} ${styles.face5}`}>
          <h1 className={styles.faceTitle}>Brand Story</h1>
          <div className={styles.inner}>
            <div>
              <img src={titImg} alt="ValueBid Brand Title" />
              <div className={styles.robotPic} />
              <img src={txtImg} alt="ValueBid Tagline" />
              <img src={btnImg} alt="서비스 더 알아보기 버튼" />
              <img
                className={styles.reflection}
                src={reflectImg}
                alt="Reflection"
              />
            </div>
          </div>
        </article>

          {/* face6 : Services – 기능 소개 */}
        <article className={`${styles.article} ${styles.face6}`}>
          <h1 className={styles.faceTitle}>Service Overview</h1>
          <div className={styles.inner}>
            <div>
              <i className="fas fa-rss" />
              <div className={styles.serviceCon}>
                <h2>Real-time auction stream</h2>
                
              </div>
            </div>
            <div>
              <i className="fas fa-code" />
              <div className={styles.serviceCon}>
                <h2>Pricing & market data</h2>
                
              </div>
            </div>
            <div>
              <i className="fas fa-envelope" />
              <div className={styles.serviceCon}>
                <h2>Secure payment & settlement</h2>
                
              </div>
            </div>
            <div>
              <i className="fas fa-list" />
              <div className={styles.serviceCon}>
                <h2>Customer Support & Inquiries</h2>
               
              </div>
            </div>
          </div>
        </article>

        {/* face7 : Promote Your Company (loop video) */}
        <article className={`${styles.article} ${styles.face7}`}>
          <h1 className={styles.faceTitle}>Experience ValueBid</h1>
          <div className={styles.inner}>
            <div className={styles.face7Body}>
              <video
                src={loopVideo}
                loop
                autoPlay
                muted
                playsInline
                className={styles.loopVideo}
              />
              <h2>
                Promote
                <br />
                Your
                <br />
                Items
              </h2>
              <img src={txt2Img} alt="Who's next text" />
              <img src={lineImg} alt="Diagonal line" />
            </div>
          </div>
        </article>

        {/* face8 : Members 복제본 (Frontend 4,5,6) */}
        <article className={`${styles.article} ${styles.face8}`}>
          <h1 className={styles.faceTitle}>Members · Frontend</h1>
          <div className={styles.inner}>
            <div>
              <div className={styles.memberPic4} />
              <div className={styles.memberCon}>
                <h2>Frontend · 주동욱</h2>
                <p>
                  마이페이지 화면을 구현하고, 추천 시스템 등 AI 관련 핵심 기능 코드를 맡아 개발합니다.
                </p>
                <span>Frontend Engineer</span>
              </div>
            </div>
            <div>
              <div className={styles.memberPic5} />
              <div className={styles.memberCon}>
                <h2>Frontend · 김예나</h2>
                <p>
                  로그인과 시세 확인 페이지 전반을 설계·구현하며, 안정적인 사용자 흐름을 책임집니다.
                </p>
                <span>Frontend Engineer</span>
              </div>
            </div>
            <div>
              <div className={styles.memberPic6} />
              <div className={styles.memberCon}>
                <h2>Frontend · 최수연</h2>
                <p>
                  메인페이지, 경매 화면, 핫딜 페이지 등의 핵심 화면을 설계하고 구현합니다.
                </p>
                <span>Frontend Engineer</span>
              </div>
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}
