import { useState, useEffect, useRef } from "react";
import "./App.css";
import Petals from "./components/Petals";
import SparkleTrail from "./components/SparkleTrail";
import { wishes } from "./data/wishes";

const youtubePlaylist = [
  "RtcDdmP9pRg", // Hơn Cả Yêu - An Coong
  "ktyGNsNwab4", // Là Con Gái Thật Tuyệt - Khởi My
  "7bLAWeHPihk", // Em Trong Mắt Tôi - Khoa Vũ
  "O-Ow7TW1wyg", // Gửi Anh Xa Nhớ - Khoa Vũ
  "_jJi6k3CThM", // Phép Màu - Yuriko
];

const SPECIAL_SONG_ID = "ZzRKtUK-hlw"; // Nơi Này Có Anh

const songStories: Record<string, { title: string; story: string }> = {
  "ZzRKtUK-hlw": {
    title: "Nơi Này Có Anh",
    story:
      'Có những giai điệu sinh ra chỉ để dành riêng cho một người, dù người đó có nhận ra hay không. Bản nhạc này không chỉ là âm thanh, mà là những suy nghĩ chưa đặt tên, là cảm giác yên tâm đến lạ mỗi khi thấy bóng dáng ai đó giữa đám đông. Có một người vẫn luôn mượn tiếng đàn này để gửi đi một lời nhắn thầm kín: <span class="story-highlight">"Thế giới của tớ, thật may vì có cậu."</span>',
  },
  RtcDdmP9pRg: {
    title: "Hơn Cả Yêu",
    story:
      'Có những cảm xúc sâu đậm đến mức từ "Yêu" dường như là không đủ. Bản nhạc này là lời tự tình của một trái tim chân thành, tôn vinh những hy sinh thầm lặng, những ánh mắt khích lệ và sự tin tưởng tuyệt đối.',
  },
  _jJi6k3CThM: {
    title: "Phép Màu",
    story:
      'Giữa thế giới hối hả, việc gặp được một người có thể làm bừng sáng tâm hồn mình chính là một "phép màu" đích thực. Giai điệu piano trong trẻo như những tia nắng đầu tiên xuyên qua kẽ lá.',
  },
  "7bLAWeHPihk": {
    title: "Em Trong Mắt Tôi",
    story:
      "Giai điệu này là một lời ca ngợi vẻ đẹp dịu dàng nhưng đầy sức sống của người phụ nữ Việt. Tiếng đàn piano mang đến sự thanh thoát, gợi nhớ hình ảnh tà áo dài và nụ cười không cần tô điểm.",
  },
  ktyGNsNwab4: {
    title: "Là Con Gái Thật Tuyệt",
    story:
      "Bản nhạc mang giai điệu vui tươi, kể về niềm tự hào khi được là một người phụ nữ - được yêu thương, làm đẹp và theo đuổi đam mê.",
  },
  "O-Ow7TW1wyg": {
    title: "Gửi Anh Xa Nhớ",
    story:
      "Một bản nhạc đầy chất thơ kể về nỗi lòng của người phụ nữ luôn hướng về người thương dù cách xa muôn trùng. Câu chuyện đằng sau là sự thủy chung, kiên cường.",
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
  const [isSpecialMode, setIsSpecialMode] = useState<boolean>(false);
  const [clickCount, setClickCount] = useState(0);
  const [showStory, setShowStory] = useState(false);
  const playerRef = useRef<any>(null);
  const isPlayerReady = useRef(false);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * youtubePlaylist.length);
    setSelectedVideoId(youtubePlaylist[randomIndex]);
  }, []);

  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const initPlayer = () => {
      playerRef.current = new window.YT.Player("youtube-player", {
        videoId: selectedVideoId || youtubePlaylist[0],
        playerVars: {
          autoplay: 0,
          controls: 0,
          loop: 1,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          mute: 1,
          origin: window.location.origin,
          enablejsapi: 1,
          start: 2,
        },
        events: {
          onReady: () => {
            isPlayerReady.current = true;
          },
          onStateChange: (event: any) => {
            // Tự động loop nếu video kết thúc
            if (event.data === window.YT.PlayerState.ENDED) {
              playerRef.current.playVideo();
            }
          },
        },
      });
    };

    window.onYouTubeIframeAPIReady = initPlayer;
    if (window.YT && window.YT.Player) initPlayer();

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, []);

  // Xử lý chuyển bài mượt mà hơn
  useEffect(() => {
    if (isPlayerReady.current && playerRef.current && selectedVideoId) {
      playerRef.current.loadVideoById({
        videoId: selectedVideoId,
        startSeconds: 2,
      });
      if (hasStarted) {
        playerRef.current.unMute();
        playerRef.current.playVideo();
        setIsPlaying(true);
      }
    }
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
    setHasStarted(true);
    if (isPlayerReady.current && playerRef.current) {
      playerRef.current.unMute();
      playerRef.current.playVideo();
      setIsPlaying(true);
    }
  };

  const toggleMusic = () => {
    if (playerRef.current && isPlayerReady.current) {
      if (isPlaying) {
        playerRef.current.pauseVideo();
        setIsPlaying(false);
      } else {
        playerRef.current.playVideo();
        setIsPlaying(true);
      }
    }
  };

  const handleTlaClick = () => {
    if (selectedVideoId !== SPECIAL_SONG_ID) {
      setSelectedVideoId(SPECIAL_SONG_ID);
      setIsSpecialMode(true);
    } else {
      toggleMusic();
    }
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
                <path
                  d="M50 10C50 10 40 40 10 50C40 60 50 90 50 90C50 90 60 60 90 50C60 40 50 10 50 10Z"
                  stroke="var(--gold)"
                  strokeWidth="1"
                  fill="rgba(197, 160, 89, 0.1)"
                />
                <circle cx="50" cy="50" r="5" fill="var(--gold)" />
              </svg>
            </div>
            <span className="upper-text staggered-1">
              Mừng Ngày Quốc Tế Phụ Nữ
            </span>
            <h2 className="start-title staggered-2">The Gift of Grace</h2>
            <div className="start-line staggered-3"></div>
            <p className="start-subtitle staggered-3">
              Một không gian tĩnh lặng dành riêng cho những điều tuyệt vời nhất.
            </p>
            <div className="button-wrapper staggered-4">
              <button className="enter-button-premium">
                <span>Mở món quà</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={`video-background ${isPlaying ? "visible" : "hidden"}`}>
        <div id="youtube-player"></div>
        <div className="video-overlay-clean"></div>
      </div>

      {hasStarted && (
        <div className="sophisticated-ui">
          <SparkleTrail />

          <div className="letter-container">
            <div className="letter-card">
              <div className="card-header">
                <span
                  className={`wax-seal ${isSpecialMode && isPlaying ? "playing" : ""}`}
                  onClick={handleTlaClick}
                  style={{ cursor: "pointer" }}
                ></span>
                <p className="salutation">Thân gửi,</p>
              </div>

              <div className="card-body">
                <p className="letter-content">
                  {displayText}
                  {isTyping && <span className="typing-cursor">|</span>}
                </p>
              </div>

              <div className="card-footer">
                <p
                  className="signature"
                  onClick={handleTlaClick}
                  style={{ cursor: "pointer" }}
                >
                  with love
                </p>
                <div
                  className={`audio-visualizer-mini ${isPlaying ? "active" : ""}`}
                >
                  {[...Array(20)].map((_, i) => (
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
            <div className="audio-control-clean" onClick={toggleMusic}>
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
