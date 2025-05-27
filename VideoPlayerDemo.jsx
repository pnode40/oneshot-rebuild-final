import React from 'react';
import VideoPlayer from './VideoPlayer';
import './VideoPlayerDemo.css';

const VideoPlayerDemo = () => {
  // Sample video and poster URLs
  const sampleVideos = [
    {
      id: 1,
      title: "Basketball Highlights",
      videoUrl: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
      posterUrl: "https://placehold.co/800x450/222222/ff6b6b?text=Basketball+Highlights"
    },
    {
      id: 2,
      title: "Football Game Recap",
      videoUrl: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
      posterUrl: "https://placehold.co/800x450/222222/ff6b6b?text=Football+Game+Recap"
    }
  ];

  return (
    <div className="video-player-demo">
      <h1>OneShot Video Player</h1>
      <p className="demo-description">
        Custom video player for athlete highlight reels and game footage.
      </p>
      
      {sampleVideos.map(video => (
        <div key={video.id} className="video-demo-item">
          <h2>{video.title}</h2>
          <VideoPlayer 
            videoUrl={video.videoUrl} 
            posterUrl={video.posterUrl}
          />
        </div>
      ))}
      
      <div className="demo-features">
        <h3>Player Features</h3>
        <ul>
          <li>Responsive 16:9 player with custom controls</li>
          <li>Play/pause with click anywhere on video</li>
          <li>Progress bar with seeking</li>
          <li>Volume control</li>
          <li>Fullscreen support</li>
          <li>OneShot branding</li>
          <li>Mobile-friendly design</li>
        </ul>
      </div>
    </div>
  );
};

export default VideoPlayerDemo; 