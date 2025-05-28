import React, { useState, useRef, useEffect } from 'react';
import './VideoPlayer.css';

const VideoPlayer = ({ videoUrl, posterUrl }) => {
  // State for video player
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // References to DOM elements
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const progressRef = useRef(null);
  
  // Handle play/pause toggle
  const togglePlay = () => {
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(error => {
        console.error("Error playing video:", error);
      });
    }
    setIsPlaying(!isPlaying);
  };

  // Handle mute toggle
  const toggleMute = () => {
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  // Handle volume change
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    videoRef.current.volume = newVolume;
    
    // If volume is set to 0, mute the video
    if (newVolume === 0) {
      videoRef.current.muted = true;
      setIsMuted(true);
    } else if (isMuted) {
      videoRef.current.muted = false;
      setIsMuted(false);
    }
  };

  // Handle seeking in progress bar
  const handleSeek = (e) => {
    if (!progressRef.current) return;
    
    const progressRect = progressRef.current.getBoundingClientRect();
    const seekPosition = (e.clientX - progressRect.left) / progressRect.width;
    const seekTime = seekPosition * duration;
    
    if (seekTime >= 0 && seekTime <= duration) {
      videoRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  // Handle progress bar keyboard navigation
  const handleProgressKeyDown = (e) => {
    // Arrow left/right for seeking backward/forward
    if (e.key === 'ArrowLeft') {
      videoRef.current.currentTime = Math.max(0, currentTime - 5);
    } else if (e.key === 'ArrowRight') {
      videoRef.current.currentTime = Math.min(duration, currentTime + 5);
    }
  };

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (playerRef.current.requestFullscreen) {
        playerRef.current.requestFullscreen();
      } else if (playerRef.current.webkitRequestFullscreen) {
        playerRef.current.webkitRequestFullscreen();
      } else if (playerRef.current.msRequestFullscreen) {
        playerRef.current.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  };

  // Show/hide controls
  const showControls = () => setIsControlsVisible(true);
  const hideControls = () => {
    if (isPlaying) {
      setIsControlsVisible(false);
    }
  };

  // Event listeners for video element
  useEffect(() => {
    const video = videoRef.current;
    
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };
    
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoaded(true);
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
    };
    
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    const handleKeyDown = (e) => {
      // Space bar toggles play/pause
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      }
      // M key toggles mute
      else if (e.key === 'm' || e.key === 'M') {
        toggleMute();
      }
      // F key toggles fullscreen
      else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    };
    
    // Add event listeners
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    playerRef.current.addEventListener('keydown', handleKeyDown);
    
    // Clean up event listeners
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
      if (playerRef.current) {
        playerRef.current.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [isPlaying]);

  // Format time to display (mm:ss)
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className={`video-player ${isPlaying ? 'playing' : ''} ${isControlsVisible ? 'controls-visible' : ''}`} 
      ref={playerRef}
      onMouseEnter={showControls}
      onMouseLeave={hideControls}
      onTouchStart={showControls}
      tabIndex="0"
      aria-label="Video player"
    >
      <video
        ref={videoRef}
        src={videoUrl}
        poster={posterUrl}
        onClick={togglePlay}
        className="video-element"
        playsInline
        preload="metadata"
        aria-label="Video content"
      />
      
      <div className="oneshot-brand-overlay" aria-hidden="true">
        <span>OneShot</span>
      </div>
      
      <button 
        className="large-play-button" 
        onClick={togglePlay}
        aria-label={isPlaying ? "Pause" : "Play"}
        style={{ display: isPlaying ? 'none' : 'flex' }}
      >
        <span className="play-icon" aria-hidden="true"></span>
      </button>
      
      <div className="video-controls" role="group" aria-label="Video controls">
        <button 
          className={`play-pause-btn ${isPlaying ? 'playing' : ''}`} 
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          <span className="sr-only">{isPlaying ? 'Pause' : 'Play'}</span>
        </button>
        
        <div 
          className="progress-container" 
          onClick={handleSeek}
          onKeyDown={handleProgressKeyDown}
          ref={progressRef}
          tabIndex="0"
          role="slider"
          aria-label="Video progress"
          aria-valuemin="0"
          aria-valuemax={duration}
          aria-valuenow={currentTime}
        >
          <div 
            className="progress-bar" 
            style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
          />
          <div 
            className="progress-handle"
            style={{ left: `${(currentTime / duration) * 100 || 0}%` }}
          />
        </div>
        
        <div className="time-display">
          <span>{formatTime(currentTime)}</span>
          <span className="time-separator">/</span>
          <span>{formatTime(duration || 0)}</span>
        </div>
        
        <div className="volume-control">
          <button 
            className={`mute-btn ${isMuted ? 'muted' : ''}`}
            onClick={toggleMute}
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            <span className="sr-only">{isMuted ? 'Unmute' : 'Mute'}</span>
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="volume-slider"
            aria-label="Volume"
          />
        </div>
        
        <button 
          className={`fullscreen-btn ${isFullscreen ? 'exit' : ''}`} 
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          <span className="sr-only">{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
        </button>
      </div>
      
      <div className="loading-indicator" style={{ opacity: isLoaded ? 0 : 1 }}>
        <div className="spinner"></div>
      </div>
    </div>
  );
};

export default VideoPlayer; 