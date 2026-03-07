import { useState, useEffect, useRef } from "react";
import "./App.css";
import Petals from "./components/Petals";
import { wishes } from "./data/wishes";

const youtubePlaylist = ["ZzRKtUK-hlw", "RtcDdmP9pRg", "_jJi6k3CThM"];

const songStories: Record<string, { title: string; story: string }> = {
  "ZzRKtUK-hlw": {
    title: "Nơi Này Có Anh",
    story:
      'Giai điệu này kể về một hành trình không xa xôi, nơi mà hạnh phúc không nằm ở đích đến mà nằm ở người đồng hành. Tiếng đàn piano nhẹ nhàng như những bước chân dạo quanh phố nhỏ, nhắc nhở chúng ta rằng chỉ cần có một người thấu hiểu ở bên, thì dù là nắng gắt hay mưa rào, mọi khoảnh khắc đều trở nên dịu dàng. "Anh Yêu Em" không chỉ là lời nói, mà còn là sự hiện diện, là sự ấm áp lan tỏa trong từng nhịp đập của trái tim.',
  },
  RtcDdmP9pRg: {
    title: "Hơn Cả Yêu",
    story:
      'Có những cảm xúc sâu đậm đến mức từ "Yêu" dường như là không đủ. Bản nhạc này là lời tự tình của một trái tim chân thành, tôn vinh những hy sinh thầm lặng, những ánh mắt khích lệ và sự tin tưởng tuyệt đối. Nó kể về một tình cảm vượt qua cả định nghĩa thông thường, sâu sắc và bền bỉ theo thời gian.',
  },
  _jJi6k3CThM: {
    title: "Phép Màu",
    story:
      'Giữa thế giới hối hả, việc gặp được một người có thể làm bừng sáng tâm hồn mình chính là một "phép màu" đích thực. Giai điệu piano trong trẻo như những tia nắng đầu tiên xuyên qua kẽ lá, kể về niềm vui thuần khiết khi ta nhận ra mình không hề đơn độc. Mỗi người phụ nữ chính là một phép màu rạng rỡ nhất.',
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

    // Tải YouTube API nếu chưa có
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const initPlayer = () => {
      if (playerRef.current) playerRef.current.destroy();
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
      const interval = setInterval(getNextWish, 10000);
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
      // Reset count after 2 seconds of inactivity
      setTimeout(() => setClickCount(0), 2000);
    }
  };

  return (
    <div className="app-container">
      {!hasStarted && (
        <div className="minimal-start" onClick={startExperience}>
          <div className="start-content">
            <span className="upper-text">International Women's Day</span>
            <h2 className="start-title">The Gift of Grace</h2>
            <button className="enter-button">Enter Experience</button>
          </div>
        </div>
      )}

      <div className="video-background">
        <div id="youtube-player"></div>
        <div className="video-overlay-clean"></div>
      </div>

      {hasStarted && (
        <div className="sophisticated-ui">
          <Petals />

          <div className="content-frame">
            <h1 className="header-label">Gửi bạn,</h1>
            <div className="wish-wrapper">
              <p className="wish-text-final" key={currentWish}>
                {currentWish}
              </p>
            </div>
            <div className="line-accent"></div>
          </div>

          {showStory && (
            <div className="story-overlay" onClick={() => setShowStory(false)}>
              <div className="story-card" onClick={(e) => e.stopPropagation()}>
                <span className="story-label">Behind the melody</span>
                <h3 className="story-song-title">
                  {songStories[selectedVideoId]?.title}
                </h3>
                <p className="story-content">
                  {songStories[selectedVideoId]?.story}
                </p>
                <button
                  className="close-story"
                  onClick={() => setShowStory(false)}
                >
                  Close
                </button>
              </div>
            </div>
          )}

          <div className="footer-minimal">
            <span onClick={handleSecretClick} style={{ cursor: "pointer" }}>
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
        </div>
      )}
    </div>
  );
}

export default App;
