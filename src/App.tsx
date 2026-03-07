import { useState, useEffect, useRef } from 'react'
import './App.css'
import Petals from './components/Petals'
import { wishes } from './data/wishes'

const youtubePlaylist = [
  'ZzRKtUK-hlw', 'RtcDdmP9pRg', '_jJi6k3CThM'
];

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

function App() {
  const [currentWish, setCurrentWish] = useState<string>('')
  const [, setUsedIndices] = useState<number[]>([])
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [hasStarted, setHasStarted] = useState<boolean>(false)
  const [selectedVideoId, setSelectedVideoId] = useState<string>('')
  const playerRef = useRef<any>(null);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * youtubePlaylist.length);
    setSelectedVideoId(youtubePlaylist[randomIndex]);
  }, []);

  useEffect(() => {
    if (!selectedVideoId) return;
    
    // Tải YouTube API nếu chưa có
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const initPlayer = () => {
      if (playerRef.current) playerRef.current.destroy();
      playerRef.current = new window.YT.Player('youtube-player', {
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
          origin: window.location.origin // Quan trọng để chạy ổn định trên domain thật
        },
        events: {
          onReady: (e: any) => {
            e.target.playVideo();
          }
        }
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
      do { randomIndex = Math.floor(Math.random() * wishes.length); } 
      while (nextIndices.includes(randomIndex) && wishes.length > 1);
      setCurrentWish(wishes[randomIndex]);
      return [...nextIndices, randomIndex];
    });
  }

  useEffect(() => {
    if (hasStarted) {
      getNextWish();
      const interval = setInterval(getNextWish, 10000);
      return () => clearInterval(interval);
    }
  }, [hasStarted]);

  const startExperience = () => {
    // 1. Unmute và Play ngay lập tức trong luồng xử lý click để vượt qua chính sách trình duyệt
    if (playerRef.current && typeof playerRef.current.unMute === 'function') {
      playerRef.current.unMute();
      playerRef.current.setVolume(100);
      playerRef.current.playVideo();
    }
    
    // 2. Cập nhật UI
    setHasStarted(true);
    setIsPlaying(true);
  }

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

          <div className="footer-minimal">
            <span>2026 Edition</span>
            <div className="audio-control-clean" onClick={() => {
              if (playerRef.current) {
                if (isPlaying) playerRef.current.mute();
                else playerRef.current.unMute();
                setIsPlaying(!isPlaying);
              }
            }}>
              {isPlaying ? 'MUTE AUDIO' : 'PLAY AUDIO'}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
