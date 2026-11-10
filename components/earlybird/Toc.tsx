'use client';

import { useEffect, useState } from 'react';

export type TocItem = { id: string; label: string };

/** Table of contents fixed in the left margin on wide screens; highlights the section being read. */
export function Toc({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter((e): e is HTMLElement => !!e);
    const onScroll = () => {
      const line = window.innerHeight * 0.3;
      let cur: string | null = null;
      for (const e of els) if (e.getBoundingClientRect().top <= line) cur = e.id;
      // At the very bottom, the last section may be too short to reach the line; mark it anyway.
      const atEnd = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      if (atEnd && cur && els.length) cur = els[els.length - 1].id;
      setActive(cur);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [items]);

  return (
    <nav className="eb-toc" aria-label="Contents" data-shown={active ? 'true' : 'false'}>
      <div className="eb-toc-title">Contents</div>
      <ol>
        {items.map((i) => (
          <li key={i.id}>
            <a href={`#${i.id}`} aria-current={active === i.id ? 'location' : undefined}>
              {i.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
