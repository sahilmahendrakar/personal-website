'use client';

import { useRef } from 'react';
import { Pause, Play } from 'lucide-react';
import { progress, toggle, useFrame, usePlayer } from './player';

function PlayButton({ playing, onClick, label }: { playing: boolean; onClick: () => void; label: string }) {
  return (
    <button type="button" className="pd-playbtn" onClick={onClick} aria-label={playing ? `Stop ${label}` : `Play ${label}`}>
      {playing ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="translate-x-px" />}
    </button>
  );
}

function useProgressBar(active: boolean) {
  const fill = useRef<HTMLDivElement>(null);
  useFrame(active, (on) => {
    if (fill.current) fill.current.style.transform = `scaleX(${on ? progress() : 0})`;
  });
  return fill;
}

/** A single audio sample with a label. */
export function AudioClip({ src, label, note }: { src: string; label: string; note?: string }) {
  const player = usePlayer();
  const playing = player.playing && player.src === src;
  const fill = useProgressBar(playing);

  return (
    <div className="pd-clip">
      <PlayButton playing={playing} onClick={() => toggle(src)} label={label} />
      <div className="min-w-0 flex-1">
        <div className="pd-clip-label">
          <span>{label}</span>
          {note && <span className="pd-clip-note">{note}</span>}
        </div>
        <div className="pd-track">
          <div ref={fill} className="pd-track-fill" />
        </div>
      </div>
    </div>
  );
}
