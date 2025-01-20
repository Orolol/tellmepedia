import React, { useState, useRef, useEffect } from 'react';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaRedo } from 'react-icons/fa';

function AudioPlayer({ currentlyPlaying }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  
  const audioRef = useRef(null);
  const progressRef = useRef(null);

  useEffect(() => {
    if (currentlyPlaying) {
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
    }
  }, [currentlyPlaying]);

  if (!currentlyPlaying) {
    return <p className="no-audio">No audio selected</p>;
  }

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    setDuration(audioRef.current.duration);
  };

  const handleProgressClick = (e) => {
    const rect = progressRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = pos * duration;
  };

  const toggleMute = () => {
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e) => {
    const value = parseFloat(e.target.value);
    audioRef.current.volume = value;
    setVolume(value);
  };

  const handlePlaybackRateChange = (e) => {
    const value = parseFloat(e.target.value);
    audioRef.current.playbackRate = value;
    setPlaybackRate(value);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="audio-player">
      <div className="player-info">
        <h3>{currentlyPlaying.title || 'Unknown Title'}</h3>
        <span className="language">{currentlyPlaying.lang?.toUpperCase()}</span>
      </div>

      <div className="progress-container" ref={progressRef} onClick={handleProgressClick}>
        <div 
          className="progress-bar"
          style={{ width: `${(currentTime / duration) * 100}%` }}
        />
      </div>

      <div className="time-display">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      <div className="controls">
        <button className="control-button" onClick={togglePlay}>
          {isPlaying ? <FaPause /> : <FaPlay />}
        </button>

        <div className="volume-control">
          <button className="control-button" onClick={toggleMute}>
            {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="volume-slider"
          />
        </div>

        <div className="playback-control">
          <FaRedo />
          <select 
            value={playbackRate} 
            onChange={handlePlaybackRateChange}
            className="playback-select"
          >
            <option value="0.5">0.5x</option>
            <option value="0.75">0.75x</option>
            <option value="1">1x</option>
            <option value="1.25">1.25x</option>
            <option value="1.5">1.5x</option>
            <option value="2">2x</option>
          </select>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={`http://localhost:5000/audio/${currentlyPlaying.filename || currentlyPlaying}`}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />
    </div>
  );
}

export default AudioPlayer;