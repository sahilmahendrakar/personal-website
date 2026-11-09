'use client';

import { useState } from 'react';
import { AudioClip } from './AudioClip';
import { stop, usePlayer } from './player';

export type LanguageClip = { id: string; language: string; voice: string; lang: string; text: string; src: string };

/** One card with a tab per language: the chosen sentence and its clip. */
export function LanguageClips({ clips }: { clips: LanguageClip[] }) {
  const [active, setActive] = useState(0);
  const player = usePlayer();
  const clip = clips[active];

  function pick(i: number) {
    if (i === active) return;
    if (player.playing) stop();
    setActive(i);
  }

  return (
    <div className="pd-langs">
      <div className="pd-langs-tabs" role="tablist" aria-label="Language">
        {clips.map((c, i) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            id={`pd-lang-tab-${c.id}`}
            aria-selected={i === active}
            aria-controls="pd-lang-panel"
            className="pd-langs-tab"
            onClick={() => pick(i)}
          >
            {c.language}
          </button>
        ))}
      </div>
      <div className="pd-langs-panel" id="pd-lang-panel" role="tabpanel" aria-labelledby={`pd-lang-tab-${clip.id}`}>
        <p className="pd-langs-text" lang={clip.lang}>
          {clip.text}
        </p>
        <AudioClip src={clip.src} label={`${clip.language} (${clip.voice})`} />
      </div>
    </div>
  );
}
