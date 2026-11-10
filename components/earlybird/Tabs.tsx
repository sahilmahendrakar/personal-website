'use client';

import { useId, useState, type KeyboardEvent, type ReactNode } from 'react';

export type Tab = { label: string; title?: string; caption?: ReactNode; content: ReactNode };

/** One figure with several views: a row of tabs, then the chosen view's title, content and caption. */
export function TabbedFigure({ tabs, label }: { tabs: Tab[]; label: string }) {
  const [i, setI] = useState(0);
  const id = useId();
  const onKey = (e: KeyboardEvent) => {
    const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const n = (i + d + tabs.length) % tabs.length;
    setI(n);
    document.getElementById(`${id}-t${n}`)?.focus();
  };
  const t = tabs[i];
  return (
    <figure className="eb-figure eb-tabbed">
      <div className="eb-tabs" role="tablist" aria-label={label} onKeyDown={onKey}>
        {tabs.map((x, k) => (
          <button
            key={x.label}
            id={`${id}-t${k}`}
            type="button"
            role="tab"
            aria-selected={k === i}
            aria-controls={`${id}-p`}
            tabIndex={k === i ? 0 : -1}
            onClick={() => setI(k)}
          >
            {x.label}
          </button>
        ))}
      </div>
      <div id={`${id}-p`} role="tabpanel" aria-labelledby={`${id}-t${i}`}>
        {t.title && <div className="eb-figure-title">{t.title}</div>}
        {t.content}
        {t.caption && <figcaption>{t.caption}</figcaption>}
      </div>
    </figure>
  );
}
