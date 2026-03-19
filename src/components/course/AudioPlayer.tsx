"use client";

import { useRef, useState } from "react";
import { Play, Pause, Volume2 } from "lucide-react";

interface Props {
  src: string;
  title: string;
}

export default function AudioPlayer({ src, title }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  function togglePlay() {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  }

  function handleTimeUpdate() {
    if (!audioRef.current) return;
    const pct = (audioRef.current.currentTime / audioRef.current.duration) * 100;
    setProgress(isNaN(pct) ? 0 : pct);
  }

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    if (!audioRef.current) return;
    const time = (parseFloat(e.target.value) / 100) * audioRef.current.duration;
    audioRef.current.currentTime = time;
    setProgress(parseFloat(e.target.value));
  }

  function formatTime(s: number) {
    if (isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }

  return (
    <div className="bg-gradient-to-br from-[#9a5864] to-[#b76d79] rounded-2xl p-6 text-white">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
          <Volume2 size={18} />
        </div>
        <div>
          <p className="font-semibold text-sm">{title}</p>
          <p className="text-white/60 text-xs">Audio Meditation</p>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={handleSeek}
          className="w-full h-1.5 rounded-full accent-white cursor-pointer"
          style={{ background: `linear-gradient(to right, white ${progress}%, rgba(255,255,255,0.3) ${progress}%)` }}
        />
        <div className="flex justify-between text-xs text-white/60 mt-1">
          <span>{formatTime(audioRef.current?.currentTime ?? 0)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center">
        <button
          onClick={togglePlay}
          className="w-14 h-14 bg-white text-[#b76d79] rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
        >
          {playing ? <Pause size={22} /> : <Play size={22} className="ml-0.5" />}
        </button>
      </div>

      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
        onEnded={() => setPlaying(false)}
      />
    </div>
  );
}
