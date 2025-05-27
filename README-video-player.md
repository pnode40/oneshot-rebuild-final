# OneShot Video Player Component

A responsive, feature-rich video player component for the OneShot recruiting platform that supports athlete highlight reels and game footage.

## Features

- Responsive design that maintains 16:9 aspect ratio
- Customizable with OneShot branding
- Full playback controls (play/pause, volume, progress, fullscreen)
- Large play button overlay when paused
- Controls that appear on hover (desktop) and are always visible on mobile
- Cross-browser compatibility
- Mobile-friendly UI with adaptive controls

## Installation

1. Copy the following files to your project:
   - `VideoPlayer.jsx`
   - `VideoPlayer.css`

2. Make sure React is installed in your project:
   ```
   npm install react react-dom
   ```

## Usage

```jsx
import React from 'react';
import VideoPlayer from './path/to/VideoPlayer';

function AthleteProfile() {
  return (
    <div className="athlete-profile">
      <h2>Game Highlights</h2>
      
      <VideoPlayer 
        videoUrl="https://example.com/path/to/video.mp4"
        posterUrl="https://example.com/path/to/poster.jpg"
      />
    </div>
  );
}

export default AthleteProfile;
```

## Props

The VideoPlayer component accepts the following props:

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `videoUrl` | String | Yes | URL to the video file |
| `posterUrl` | String | No | URL to the poster/thumbnail image to display before the video plays |

## Customization

### Branding

The OneShot branding is included by default in the top-right corner of the video player. To modify this:

1. Open `VideoPlayer.css`
2. Find the `.video-player::after` selector
3. Modify the `content`, `background-image`, or other properties as needed

### Colors

The primary accent color (`#ff6b6b`) can be changed throughout the CSS file to match your branding needs.

## Browser Support

The video player is tested and works in:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Android Chrome)

## Performance Considerations

- The video element uses `object-fit: contain` to ensure the video maintains its aspect ratio
- For mobile devices, the time display and volume controls are hidden to save space
- The large play button is sized appropriately for touch interactions

## Known Issues and Limitations

- The video player currently doesn't support YouTube or Vimeo embedding - it works with direct video file URLs only
- Autoplay isn't enabled due to browser policies that block autoplay with sound
- Custom video tracks (subtitles/captions) aren't currently supported

## Future Enhancements

Planned features for future versions:
- Picture-in-picture support
- Quality selection for adaptive streaming
- Support for YouTube and Vimeo embeds
- Keyboard shortcuts for accessibility
- Playback speed controls 