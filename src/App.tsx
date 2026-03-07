import { useState, useEffect, useRef } from 'react'
import './App.css'
import Petals from './components/Petals'
import SparkleTrail from './components/SparkleTrail'
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
  const [isOpening, setIsOpening] = useState<boolean>(false)
  const [selectedVideoId, setSelectedVideoId] = useState<string>('')
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [clicks, setClicks] = useState<{id: number, x: number, y: number}[]>([])
  const playerRef = useRef<any>(null);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * youtubePlaylist.length);
    setSelectedVideoId(youtubePlaylist[randomIndex]);

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 15,
        y: (e.clientY / window.innerHeight - 0.5) * 15
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
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

  const handleScreenClick = (e: React.MouseEvent) => {
    if (!hasStarted) return;
    const newClick = { id: Date.now(), x: e.clientX, y: e.clientY };
    setClicks(prev => [...prev, newClick]);
    setTimeout(() => {
      setClicks(prev => prev.filter(c => c.id !== newClick.id));
    }, 1500);
  }

  const startExperience = () => {
    setIsOpening(true);
    setTimeout(() => {
      setHasStarted(true);
      setIsPlaying(true);
      if (playerRef.current) {
        playerRef.current.unMute();
        playerRef.current.playVideo();
      }
    }, 1500);
  }

  return (
    <div className="app-container" onClick={handleScreenClick}>
      <SparkleTrail />
      
      {clicks.map(click => (
        <div key={click.id} className="click-bloom" style={{ left: click.x, top: click.y }}>
          🌸
        </div>
      ))}

      {!hasStarted && (
        <div className={`welcome-screen ${isOpening ? 'opening' : ''}`} onClick={startExperience}>
          <div className="luxury-intro">
            <div className="reveal-text">Gửi ngàn yêu thương</div>
            <div className="main-reveal">PHỤ NỮ TUYỆT VỜI</div>
            <div className="click-to-begin">CHẠM ĐỂ MỞ HỘP QUÀ</div>
          </div>
          <div className="floating-glow"></div>
        </div>
      )}

      <div className="video-background" style={{ transform: `translate(${-mousePos.x}px, ${-mousePos.y}px) scale(1.15)` }}>
        <div id="youtube-player"></div>
        <div className="video-blur-overlay"></div>
      </div>

      {hasStarted && (
        <div className="dreamy-content">
          <Petals />
          <div className="orbs-container">
            <div className="orb" style={{ width: '600px', height: '600px', top: '10%', left: '15%', transform: `translate(${mousePos.x * 2}px, ${mousePos.y * 2}px)` }}></div>
            <div className="orb" style={{ width: '700px', height: '700px', bottom: '15%', right: '10%', transform: `translate(${-mousePos.x * 1.5}px, ${mousePos.y * 3}px)` }}></div>
          </div>

          <div className="wish-card" style={{ transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px)` }}>
            <h1 className="main-title">Gửi bạn,</h1>
            <div className="wish-display">
              <p className="wish-sentence" key={currentWish}>
                {currentWish.split(' ').map((word, i) => (
                  <span key={i} style={{ animationDelay: `${i * 0.1}s` }}>{word}</span>
                ))}
              </p>
            </div>
          </div>

          <button className="sound-toggle" onClick={(e) => {
            e.stopPropagation();
            if (playerRef.current) {
              if (isPlaying) playerRef.current.mute();
              else playerRef.current.unMute();
              setIsPlaying(!isPlaying);
            }
          }}>
            {isPlaying ? 'SOUND ON' : 'SOUND OFF'}
          </button>
        </div>
      )}
    </div>
  )
}

export default App
