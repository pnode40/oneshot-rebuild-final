import React, { useState } from 'react';
import VideoPlayer from './VideoPlayer';
import './VideoPlayerDemo.css';

const VideoPlayerDemo = () => {
  const [activeVideo, setActiveVideo] = useState(0);
  
  // Sample video and poster URLs
  const sampleVideos = [
    {
      id: 1,
      title: "Basketball Highlights",
      athlete: "James Rodriguez",
      description: "Senior year highlight reel showcasing shooting, defense, and playmaking ability.",
      videoUrl: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
      posterUrl: "https://placehold.co/800x450/222222/ff6b6b?text=Basketball+Highlights"
    },
    {
      id: 2,
      title: "Football Game Recap",
      athlete: "Sarah Johnson",
      description: "Quarterback highlights from championship game with 4 touchdowns and 320 passing yards.",
      videoUrl: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
      posterUrl: "https://placehold.co/800x450/222222/ff6b6b?text=Football+Game+Recap"
    },
    {
      id: 3,
      title: "Soccer Skills",
      athlete: "Miguel Santos",
      description: "Compilation of dribbling skills, free kicks, and assists from the regional tournament.",
      videoUrl: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
      posterUrl: "https://placehold.co/800x450/222222/ff6b6b?text=Soccer+Skills"
    }
  ];

  return (
    <div className="video-player-demo">
      <header className="demo-header">
        <div className="logo-container">
          <div className="oneshot-logo">
            <span className="logo-dot"></span>
            <span>OneShot</span>
          </div>
          <p className="tagline">Athlete Recruiting Platform</p>
        </div>
      </header>
      
      <div className="demo-intro">
        <h1>Highlight Video Player</h1>
        <p className="demo-description">
          Custom video player for athlete highlight reels and game footage.
          Designed to showcase your best moments to college recruiters.
        </p>
      </div>
      
      <div className="main-player-container">
        <VideoPlayer 
          videoUrl={sampleVideos[activeVideo].videoUrl} 
          posterUrl={sampleVideos[activeVideo].posterUrl}
        />
        
        <div className="video-details">
          <h2>{sampleVideos[activeVideo].title}</h2>
          <p className="athlete-name">{sampleVideos[activeVideo].athlete}</p>
          <p className="video-description">{sampleVideos[activeVideo].description}</p>
        </div>
      </div>
      
      <div className="video-selector">
        <h3>More Highlights</h3>
        <div className="video-thumbnails">
          {sampleVideos.map((video, index) => (
            <div 
              key={video.id} 
              className={`video-thumbnail ${index === activeVideo ? 'active' : ''}`}
              onClick={() => setActiveVideo(index)}
            >
              <div className="thumbnail-img" style={{ backgroundImage: `url(${video.posterUrl})` }}>
                {index === activeVideo && <div className="now-playing">Now Playing</div>}
              </div>
              <div className="thumbnail-info">
                <p className="thumbnail-title">{video.title}</p>
                <p className="thumbnail-athlete">{video.athlete}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="demo-features">
        <h3>Player Features</h3>
        <ul>
          <li><span className="feature-highlight">Responsive Design</span> - Maintains 16:9 aspect ratio on all devices</li>
          <li><span className="feature-highlight">Branded Experience</span> - Custom OneShot branding and styling</li>
          <li><span className="feature-highlight">Full Controls</span> - Play/pause, volume, seek, and fullscreen</li>
          <li><span className="feature-highlight">Accessibility</span> - Keyboard navigation and screen reader support</li>
          <li><span className="feature-highlight">Mobile Optimized</span> - Touch-friendly controls for all devices</li>
        </ul>
      </div>
    </div>
  );
};

export default VideoPlayerDemo; 