'use client';

import { useEffect } from 'react';
import { mountServingFigures } from './figures';

type FigId = 'pass' | 'passb' | 'frontier' | 'custom' | 'cold' | 'dissect' | 'compare';

const FIGS: Record<FigId, { h: number; label: string; hint: string; tabs?: string }> = {
  pass: {
    h: 368,
    label: "One forward pass: each layer's weights are read from GPU memory and multiplied with the activations, layer by layer, until the next token comes out",
    hint: 'Drag the pass bar to scrub',
  },
  passb: {
    h: 438,
    label: "One forward pass for a batch of four requests: each layer's weights are read from GPU memory once and multiplied with all four requests' activations, so one pass writes the next token for all four",
    hint: 'Drag the pass bar to scrub',
  },
  frontier: {
    h: 322,
    label: 'Many customers send requests to one shared GPU, which keeps its batch of up to 32 requests nearly full',
    hint: 'Drag the timeline to scrub',
  },
  custom: {
    h: 322,
    label: 'One customer sends a few bursts of requests to a dedicated GPU, whose batch is nearly empty while it is billed the whole time',
    hint: 'Drag the timeline to scrub',
  },
  cold: {
    h: 346,
    label: 'The GPU is released between bursts. A new burst waits through a cold start while the weights load into GPU memory, and the GPU is billed only while it is up',
    hint: 'Drag the timeline to scrub',
  },
  dissect: {
    h: 376,
    label: 'Three cold starts to scale: a stopped AWS GPU box takes about 400 seconds, a fresh Modal start about 3 minutes, and a Modal start from a memory snapshot about 20 seconds',
    hint: 'Drag the timeline to scrub',
    tabs: 'Which cold start the machine diagram shows',
  },
  compare: {
    h: 536,
    label: 'The same three bursts of traffic over 30 minutes, served with scale to zero. A fresh start takes 5 minutes and the GPU is released after 1 minute idle; a snapshot start takes 20 seconds and the GPU is released after 10 seconds idle',
    hint: 'Drag the timeline to scrub',
    tabs: 'Which cold start the GPU view shows',
  },
};

/** The markup one animated figure draws into. The drawing happens in <FiguresRuntime />. */
export function Fig({ id }: { id: FigId }) {
  const f = FIGS[id];
  return (
    <figure className="csf-fig">
      {f.tabs && <div className="seg" role="tablist" aria-label={f.tabs} data-seg={id} />}
      <div className="stage">
        <svg id={`fig-${id}`} viewBox={`0 0 760 ${f.h}`} role="img" aria-label={f.label} />
        <div className="bar">
          <span className="hint">{f.hint}</span>
          <span className="ctl" data-fig={id} />
        </div>
      </div>
    </figure>
  );
}

/** Starts every figure on the page once they are all mounted, and stops them on the way out. */
export function FiguresRuntime() {
  useEffect(() => mountServingFigures(), []);
  return null;
}
