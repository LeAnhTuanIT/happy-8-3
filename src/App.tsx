import { useState, useEffect, useRef } from 'react'
import './App.css'
import Petals from './components/Petals'
import { wishes } from './data/wishes'

const youtubePlaylist = [
  'ZzRKtUK-hlw',
  'RtcDdmP9pRg',
  '_jJi6k3CThM'
];

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

function App() {
  const [currentWish, setCurrentWish] = useState<string>('')
  const [, setUsedIndices] = useState<number[]>([]) // Sửa usedIndices thành _ hoặc bỏ đi vì logic dùng prev
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
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }
    window.onYouTubeIframeAPIReady = () => loadPlayer(selectedVideoId);
    if (window.YT && window.YT.Player) loadPlayer(selectedVideoId);

    function loadPlayer(videoId: string) {
      if (playerRef.current) playerRef.current.destroy();
      playerRef.current = new window.YT.Player('youtube-player', {
        videoId: videoId,
        playerVars: {
          autoplay: 1, controls: 0, loop: 1, playlist: videoId,
          modestbranding: 1, rel: 0, showinfo: 0, mute: 1
        },
        events: { onReady: (e: any) => e.target.playVideo() }
      });
    }
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
    setHasStarted(true);
    setIsPlaying(true);
    if (playerRef.current) {
      playerRef.current.unMute();
      playerRef.current.playVideo();
    }
  }

  return (
    <div className="app-container">
      {!hasStarted && (
        <div className="welcome-screen" onClick={startExperience}>
          <div className="heart-icon">♥</div>
          <div className="welcome-text">MÓN QUÀ GỬI TRAO</div>
          <div className="click-to-open">NHẤN ĐỂ MỞ</div>
        </div>
      )}

      <div className="video-background">
        <div id="youtube-player"></div>
        <div className="video-blur-overlay"></div>
      </div>

      {hasStarted && (
        <div className="dreamy-content">
          <Petals />
          <div className="wish-card">
            <h1 className="main-title">Dear Women,</h1>
            <div className="wish-display">
              <p className="wish-sentence" key={currentWish}>
                {currentWish}
              </p>
            </div>
            <div className="soft-divider"></div>
          </div>

          <div className="bottom-info">
            <div className="event-name">INTERNATIONAL WOMEN'S DAY</div>
            <div className="year-mark">2026</div>
          </div>

          <button className="sound-toggle" onClick={() => {
            if (playerRef.current) {
              if (isPlaying) playerRef.current.mute();
              else playerRef.current.unMute();
              setIsPlaying(!isPlaying);
            }
          }}>
            {isPlaying ? '🔊 MUSIC ON' : '🔇 MUSIC OFF'}
          </button>
        </div>
      )}
    </div>
  )
}

export default App
