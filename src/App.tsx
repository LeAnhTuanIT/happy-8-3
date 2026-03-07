import { useState, useEffect, useRef } from "react";
import "./App.css";
import Petals from "./components/Petals";
import SparkleTrail from "./components/SparkleTrail";
import { wishes } from "./data/wishes";

// Danh sách YouTube IDs đã kiểm tra (Piano Covers ổn định nhất)
const youtubePlaylist = [
  "ZzRKtUK-hlw", // Nơi Này Có Anh - An Coong
  "RtcDdmP9pRg", // Hơn Cả Yêu - An Coong
  // "2vZ5Kfeub_g", // Ngày Em Đẹp Nhất - Yumi
  "ktyGNsNwab4", // Là Con Gái Thật Tuyệt - Khởi My
  "7bLAWeHPihk", // Em Trong Mắt Tôi - Khoa Vũ
  "O-Ow7TW1wyg", // Gửi Anh Xa Nhớ - Khoa Vũ
  "_jJi6k3CThM", // Phép Màu - Yuriko
];

const songStories: Record<string, { title: string; story: string }> = {
  "ZzRKtUK-hlw": {
    title: "Nơi Này Có Anh",
    story: 'Có những giai điệu sinh ra chỉ để dành riêng cho một người, dù người đó có nhận ra hay không. Bản nhạc này không chỉ là âm thanh, mà là những suy nghĩ chưa đặt tên, là cảm giác yên tâm đến lạ mỗi khi thấy bóng dáng ai đó giữa đám đông. Có một người vẫn luôn mượn tiếng đàn này để gửi đi một lời nhắn thầm kín: <span class="story-highlight">"Thế giới của tớ, thật may vì có cậu."</span>',
  },
  "RtcDdmP9pRg": {
    title: "Hơn Cả Yêu",
    story: 'Có những cảm xúc sâu đậm đến mức từ "Yêu" dường như là không đủ. Bản nhạc này là lời tự tình của một trái tim chân thành, tôn vinh những hy sinh thầm lặng, những ánh mắt khích lệ và sự tin tưởng tuyệt đối. Nó kể về một tình cảm vượt qua cả định nghĩa thông thường, sâu sắc và bền bỉ theo thời gian.',
  },
  "_jJi6k3CThM": {
    title: "Phép Màu",
    story: "Giữa thế giới hối hả, việc gặp được một người có thể làm bừng sáng tâm hồn mình chính là một \"phép màu\" đích thực. Giai điệu piano trong trẻo như những tia nắng đầu tiên xuyên qua kẽ lá, kể về niềm vui thuần khiết khi ta nhận ra mình không hề đơn độc. Mỗi người phụ nữ chính là một phép màu rạng rỡ nhất.",
  },
  "2vZ5Kfeub_g": {
    title: "Ngày Em Đẹp Nhất",
    story: 'Bản nhạc này tôn vinh vẻ đẹp của người phụ nữ trong khoảnh khắc rạng rỡ nhất. Giai điệu piano ngân vang như lời nhắc nhở rằng, dù thời gian có trôi đi, vẻ đẹp tâm hồn và nụ cười của "Em" vẫn luôn là điều tuyệt vời nhất. Ngày em đẹp nhất chính là mọi ngày khi em tự tin là chính mình.',
  },
  "7bLAWeHPihk": {
    title: "Em Trong Mắt Tôi",
    story: "Giai điệu này là một lời ca ngợi vẻ đẹp dịu dàng nhưng đầy sức sống của người phụ nữ Việt. Tiếng đàn piano mang đến sự thanh thoát, gợi nhớ hình ảnh tà áo dài và nụ cười không cần tô điểm. Câu chuyện đằng sau là sự trân trọng những nét đẹp giản dị, tinh khôi nhưng đầy sức hút.",
  },
  "ktyGNsNwab4": {
    title: "Là Con Gái Thật Tuyệt",
    story: 'Bản nhạc mang giai điệu vui tươi, kể về niềm tự hào khi được là một người phụ nữ - được yêu thương, làm đẹp và theo đuổi đam mê. Đây là món quà nhắc nhở mỗi cô gái hãy luôn yêu chiều bản thân và sống một cuộc đời rực rỡ sắc màu vì "làm con gái thật tuyệt"!',
  },
  "O-Ow7TW1wyg": {
    title: "Gửi Anh Xa Nhớ",
    story: "Một bản nhạc đầy chất thơ kể về nỗi lòng của người phụ nữ luôn hướng về người thương dù cách xa muôn trùng. Câu chuyện đằng sau là sự thủy chung, kiên cường và lòng bao dung - những đức tính cao đẹp tạo nên sức mạnh gắn kết mọi khoảng cách địa lý.",
  },
};

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

function App() {
  const [currentWish, setCurrentWish] = useState<string>("");
  const [displayText, setDisplayText] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [, setUsedIndices] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [selectedVideoId, setSelectedVideoId] = useState<string>("");
  const [clickCount, setClickCount] = useState(0);
  const [showStory, setShowStory] = useState(false);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * youtubePlaylist.length);
    setSelectedVideoId(youtubePlaylist[randomIndex]);
  }, []);

  useEffect(() => {
    if (!selectedVideoId) return;

    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const initPlayer = () => {
      if (playerRef.current) playerRef.current.destroy();
      
      // Cấu hình giây bắt đầu cho từng bài để fix delay
      let startSeconds = 0;
      if (selectedVideoId === "ZzRKtUK-hlw") startSeconds = 2; // Nơi Này Có Anh
      if (selectedVideoId === "_jJi6k3CThM") startSeconds = 2; // Phép Màu

      playerRef.current = new window.YT.Player("youtube-player", {
        videoId: selectedVideoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          loop: 1,
          playlist: selectedVideoId,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          mute: 1,
          origin: window.location.origin,
          enablejsapi: 1,
          start: startSeconds // Bắt đầu từ giây chỉ định
        },
        events: {
          onReady: (e: any) => {
            e.target.playVideo();
          },
        },
      });
    };

    window.onYouTubeIframeAPIReady = initPlayer;
    if (window.YT && window.YT.Player) initPlayer();
  }, [selectedVideoId]);

  useEffect(() => {
    if (!currentWish) return;
    let i = 0;
    setDisplayText("");
    setIsTyping(true);
    const timer = setInterval(() => {
      setDisplayText(currentWish.substring(0, i));
      i++;
      if (i > currentWish.length) {
        clearInterval(timer);
        setIsTyping(false);
      }
    }, 45);
    return () => clearInterval(timer);
  }, [currentWish]);

  const getNextWish = () => {
    setUsedIndices((prev: number[]) => {
      let nextIndices = [...prev];
      if (nextIndices.length >= wishes.length) nextIndices = [];
      let randomIndex: number;
      do {
        randomIndex = Math.floor(Math.random() * wishes.length);
      } while (nextIndices.includes(randomIndex) && wishes.length > 1);
      setCurrentWish(wishes[randomIndex]);
      return [...nextIndices, randomIndex];
    });
  };

  useEffect(() => {
    if (hasStarted) {
      getNextWish();
      const interval = setInterval(getNextWish, 30000);
      return () => clearInterval(interval);
    }
  }, [hasStarted]);

  const startExperience = () => {
    if (playerRef.current && typeof playerRef.current.unMute === "function") {
      playerRef.current.unMute();
      playerRef.current.setVolume(100);
      playerRef.current.playVideo();
    }
    setHasStarted(true);
    setIsPlaying(true);
  };

  const handleSecretClick = () => {
    const newCount = clickCount + 1;
    if (newCount >= 3) {
      setShowStory(true);
      setClickCount(0);
    } else {
      setClickCount(newCount);
      setTimeout(() => setClickCount(0), 2000);
    }
  };

  return (
    <div className="app-container">
      <Petals />
      
      {!hasStarted && (
        <div className="minimal-start" onClick={startExperience}>
          <div className="start-glow"></div>
          <div className="start-content-ornate">
            <div className="ornament-top">
              <svg width="60" height="60" viewBox="0 0 100 100" fill="none">
                <path d="M50 10C50 10 40 40 10 50C40 60 50 90 50 90C50 90 60 60 90 50C60 40 50 10 50 10Z" stroke="var(--gold)" strokeWidth="1" fill="rgba(197, 160, 89, 0.1)"/>
                <circle cx="50" cy="50" r="5" fill="var(--gold)"/>
              </svg>
            </div>
            <span className="upper-text staggered-1">Mừng Ngày Quốc Tế Phụ Nữ</span>
            <h2 className="start-title staggered-2">The Gift of Grace</h2>
            <div className="start-line staggered-3"></div>
            <p className="start-subtitle staggered-3">Một không gian tĩnh lặng dành riêng cho những điều tuyệt vời nhất.</p>
            <div className="button-wrapper staggered-4">
              <button className="enter-button-premium">
                <span>Mở món quà</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="video-background">
        <div id="youtube-player"></div>
        <div className="video-overlay-clean"></div>
      </div>

      {hasStarted && (
        <div className="sophisticated-ui">
          <SparkleTrail />

          <div className="letter-container">
            <div className="letter-card">
              <div className="card-header">
                <span className="wax-seal"></span>
                <p className="salutation">Thân gửi,</p>
              </div>
              
              <div className="card-body">
                <p className="letter-content">
                  {displayText}
                  {isTyping && <span className="typing-cursor">|</span>}
                </p>
              </div>

              <div className="card-footer">
                <p className="signature">Happy Women's Day</p>
                <div className={`audio-visualizer-mini ${isPlaying ? "active" : ""}`}>
                  {[...Array(11)].map((_, i) => (
                    <div key={i} className="v-bar-mini"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="footer-minimal">
            <span onClick={handleSecretClick} className="edition-label">
              2026 Edition
            </span>
            <div
              className="audio-control-clean"
              onClick={() => {
                if (playerRef.current) {
                  if (isPlaying) playerRef.current.mute();
                  else playerRef.current.unMute();
                  setIsPlaying(!isPlaying);
                }
              }}
            >
              {isPlaying ? "MUTE AUDIO" : "PLAY AUDIO"}
            </div>
          </div>

          {showStory && (
            <div className="story-overlay" onClick={() => setShowStory(false)}>
              <div className="story-card" onClick={(e) => e.stopPropagation()}>
                <span className="story-label">Behind the melody</span>
                <h3 className="story-song-title">
                  {songStories[selectedVideoId]?.title}
                </h3>
                <p
                  className="story-content"
                  dangerouslySetInnerHTML={{
                    __html: songStories[selectedVideoId]?.story || "",
                  }}
                ></p>
                <button
                  className="close-story"
                  onClick={() => setShowStory(false)}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
