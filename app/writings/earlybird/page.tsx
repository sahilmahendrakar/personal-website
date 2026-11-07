import type { ReactNode } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { EARLYBIRD_POST as post } from '@/lib/native-posts';
import { ReadingProgress } from '@/components/ReadingProgress';
import { Calibration, KeptBars, Scatter, Timeline, TrainingExample } from '@/components/earlybird/Charts';
import { SamplePlayer } from '@/components/earlybird/Samples';
import { LiveDemo } from '@/components/earlybird/Live';
import { MODELS, ms, pct, type Point } from '@/components/earlybird/format';
import '../paradee/paradee.css';
import './earlybird.css';

const URL = `https://sahilmahendrakar.com/writings/${post.id}`;
const HF = 'https://huggingface.co/sahilmahendrakar/earlybird';

// Recordings in the sample player, in picker order (components/earlybird/samples.json).
const SAMPLE_IDS = ['s1', 's4', 's0', 's7', 's9'];

// Median word latency (ms) · word error rate (%), same utterances for every model in each set (67 to 150).
// Earlybird repo: results/four.md
const SETS: [string, [number, number][]][] = [
  ['Audiobooks', [[-90, 2.3], [270, 3.9], [400, 3.1], [90, 2.3]]],
  ['Harder audiobooks', [[-60, 9.7], [300, 13.2], [460, 10.1], [140, 8.7]]],
  ['TED talks', [[-68, 5.4], [298, 6.8], [505, 7.3], [125, 4.8]]],
  ['Public speech', [[-66, 14.5], [290, 16.7], [477, 14.2], [127, 10.5]]],
  ['Earnings calls', [[-46, 18.4], [309, 21.6], [535, 17.8], [142, 13.3]]],
  ['Synthetic speech', [[-73, 5.6], [292, 7.0], [424, 7.5], [90, 4.8]]],
];

const COMPARED: [string, string, string][] = [
  ['Earlybird', '29M', '16.8 MB'],
  ['Moonshine Tiny', '34M', '45 MB'],
  ['Whistle', '55M', '16.9 MB'],
  ['Whisper base', '74M', '~145 MB'],
];

// Mean WER over the 8 English Open ASR Leaderboard sets, on the clips all four models share. results/open_asr.md
const OPEN_ASR: [string, string, number][] = [
  ['Whisper base', '~145 MB', 9.7],
  ['Whistle', '16.9 MB', 12.2],
  ['Earlybird', '16.8 MB', 12.6],
  ['Moonshine Tiny', '45 MB', 14.4],
];

const pub = 'published leaderboard number';

// Word latency (x) against Open ASR mean WER (y). Earlybird at its 4-bit WER; Moonshine Tiny is the official runtime
// I timed (full-set WER 14.47); Parakeet is its published WER, timed on 150 other clips and re-run every 240 ms.
const LATENCY_ACC: Point[] = [
  { name: 'Earlybird', x: -90, y: 12.69, ours: true, label: 'below', lines: ['16.8 MB', 'word latency −90 ms', 'error rate 12.7%'] },
  { name: 'Whistle', x: 400, y: 12.17, label: 'above', lines: ['16.9 MB', 'word latency +400 ms', 'error rate 12.2% (sampled)'] },
  { name: 'Moonshine Tiny', x: 270, y: 14.47, label: 'above', lines: ['45 MB (official runtime)', 'word latency +270 ms', 'error rate 14.5%'] },
  { name: 'Whisper tiny', x: 110, y: 12.19, label: 'right', lines: ['78 MB', 'word latency +110 ms', 'error rate 12.2%'] },
  { name: 'Whisper base', x: 90, y: 9.78, label: 'right', lines: ['145 MB', 'word latency +90 ms', 'error rate 9.8%'] },
  { name: 'Whisper small', x: 80, y: 8.15, label: 'right', lines: ['488 MB', 'word latency +80 ms', 'error rate 8.2%'] },
  { name: 'Parakeet TDT 0.6B (1.2 GB)', x: -10, y: 6.05, published: true, label: 'right', lines: ['1.2 GB at 16 bits', 'word latency −10 ms (other clips)', `error rate 6.1% (${pub})`] },
];

// Size (x) against Open ASR mean WER (y). Full-precision models at their 16-bit size. Hollow = published model-card number.
const SIZE_ACC: Point[] = [
  { name: 'Earlybird 4-bit', x: 16.8, y: 12.69, ours: true, label: 'below', lines: ['16.8 MB', 'error rate 12.7%'] },
  { name: 'Earlybird full precision', x: 58, y: 11.66, ours: true, label: 'above', lines: ['58 MB at 16 bits', 'error rate 11.7%'] },
  { name: 'Whistle', x: 16.9, y: 12.17, label: 'left', lines: ['16.9 MB', 'error rate 12.2% (sampled)'] },
  { name: 'Whisper tiny', x: 78, y: 12.19, label: 'below', lines: ['78 MB', 'error rate 12.2%'] },
  { name: 'Whisper base', x: 145, y: 9.78, label: 'right', lines: ['145 MB', 'error rate 9.8%'] },
  { name: 'Whisper small', x: 488, y: 8.15, label: 'right', lines: ['488 MB', 'error rate 8.2%'] },
  { name: 'Moonshine Tiny', x: 88, y: 12.01, published: true, label: 'right', lines: ['88 MB', `error rate 12.0% (${pub})`] },
  { name: 'Moonshine Small', x: 280, y: 7.84, published: true, label: 'above', lines: ['280 MB', `error rate 7.8% (${pub})`] },
  { name: 'Parakeet TDT 0.6B', x: 1236, y: 6.05, published: true, label: 'below', lines: ['1.2 GB at 16 bits', `error rate 6.1% (${pub})`] },
];

// Size (x) against word latency (y), all timed by me on LibriSpeech.
const SIZE_LAT: Point[] = [
  { name: 'Earlybird', x: 16.8, y: -90, ours: true, label: 'right', lines: ['16.8 MB', 'word latency −90 ms'] },
  { name: 'Whistle', x: 16.9, y: 400, label: 'right', lines: ['16.9 MB', 'word latency +400 ms'] },
  { name: 'Moonshine Tiny', x: 45, y: 270, label: 'right', lines: ['45 MB (official runtime)', 'word latency +270 ms'] },
  { name: 'Whisper tiny', x: 78, y: 110, label: 'below', lines: ['78 MB', 'word latency +110 ms'] },
  { name: 'Whisper base', x: 145, y: 90, label: 'above', lines: ['145 MB', 'word latency +90 ms'] },
  { name: 'Whisper small', x: 488, y: 80, label: 'above', lines: ['488 MB', 'word latency +80 ms'] },
  { name: 'Nemotron streaming 0.6B', x: 464, y: 230, label: 'below', lines: ['464 MB (int8)', 'word latency +230 ms'] },
  { name: 'Parakeet TDT 0.6B', x: 1236, y: -10, label: 'left', lines: ['1.2 GB at 16 bits', 'word latency −10 ms (other clips)'] },
];

export const metadata: Metadata = {
  title: post.title,
  description: post.subtitle,
  alternates: { canonical: URL },
  openGraph: { type: 'article', title: post.title, description: post.subtitle, publishedTime: post.date, url: URL },
  twitter: { card: 'summary_large_image', title: post.title, description: post.subtitle },
};

function Figure({ title, caption, children }: { title?: string; caption: ReactNode; children: ReactNode }) {
  return (
    <figure className="eb-figure">
      {title && <div className="eb-figure-title">{title}</div>}
      {children}
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

export default function EarlybirdPost() {
  return (
    <main className="pd eb min-h-screen">
      <ReadingProgress />
      <article className="py-12 md:py-16">
        <div className="pd-col">
          <div className="mb-12 md:mb-16">
            <Link href="/writings" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← Writings
            </Link>
          </div>
          <header className="mb-10 md:mb-12">
            <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <time dateTime={post.date}>{format(parseISO(post.date), 'MMMM d, yyyy')}</time>
              <span aria-hidden="true">·</span>
              <span>{post.readingMinutes} min read</span>
            </div>
            <h1 className="font-serif text-4xl md:text-[2.75rem] font-semibold tracking-tight leading-[1.12] text-balance mt-4">
              {post.title}
            </h1>
            <p className="font-serif text-xl md:text-[1.4rem] leading-snug text-muted-foreground text-pretty mt-4">
              {post.subtitle}
            </p>
          </header>
        </div>

        <div className="pd-col post-body">
          <ul className="eb-facts" aria-label="Headline numbers">
            <li><span>Size on disk</span><b>16.8 MB</b><small>29M parameters at 4 bits; 17.6 MB with the tokenizer</small></li>
            <li><span>Word latency</span><b>−90 ms</b><small>Median, relative to the end of the word, on audiobooks. Other models: +90 to +400 ms</small></li>
            <li><span>Words predicted correctly before they end</span><b>69%</b><small>On audiobooks, counting only words not changed later. Other models: 3&ndash;25%</small></li>
          </ul>
          <p>
            Earlybird is a 16.8 MB on-device speech-to-text model that predicts each word before the speaker finishes saying it
            along with the probability that it&rsquo;s right. On audiobook speech, a typical word is predicted correctly 90 ms before it
            ends. Released streaming models predict it correctly 90&ndash;400 ms after.
          </p>
          <p>
            <a className="eb-cta" href="#try">
              <i aria-hidden="true" />
              Try it live with your microphone or recorded samples
            </a>
          </p>

          <h2>Why earlier words matter</h2>
          <p>
            Streaming speech-to-text models wait until a word is over before they show it. For a
            voice agent every millisecond counts: the sooner the words exist, the sooner the agent can start a search or plan its
            reply.
          </p>
          <p>
            Earlybird cuts that wait with a change to training: <strong>train the model on audio cut off partway through a word, and ask it
            to guess the whole word, with the confidence that it is right</strong>.
          </p>
          <Figure
            title="When a typical word is predicted correctly"
            caption="Median word latency on LibriSpeech audiobooks, the same 67 utterances for every model. Whisper base is re-run on all the audio so far every 0.48 s."
          >
            <Timeline />
          </Figure>

          <h2>Hear it on real speech</h2>
          <p>
            Try out Earlybird and see how it compares to other models on real recordings. I fed each one to Earlybird and three released models in 80 ms chunks, as if it
            were live, and logged every change to each model&rsquo;s text. Each row shows what that model had
            on screen at that moment. At &frac14;&times; speed you can see Earlybird write each word while it is still being said.
            Darker blue means more confident.
          </p>
          <Figure caption="A replay of each model's logged output on the recording, in time with the audio, not models running in your browser. The number next to each model is its median word latency on that clip. Guesses under 15% confidence are hidden. The recordings were never used in training: voice commands from SLURP, public speech from People's Speech and an audiobook from LibriSpeech.">
            <SamplePlayer ids={SAMPLE_IDS} />
          </Figure>

          <h2 id="try">Try it yourself</h2>
          <p>
            This is the real 4-bit model, running on a small CPU server. Press the microphone and talk, or play one of the
            recordings through it. Words are colored by confidence, and its guesses for the next words are in dashed boxes.
          </p>
          <LiveDemo />

          <h2>What I compare against</h2>
          <p>The results below compare Earlybird with three released models on the same audio:</p>
          <div className="pd-table-wrap">
            <table className="pd-table pd-table-text">
              <thead>
                <tr><th scope="col">Model</th><th scope="col">Parameters</th><th scope="col">File size</th></tr>
              </thead>
              <tbody>
                {COMPARED.map(([m, n, s], i) => (
                  <tr key={m}>
                    <th scope="row" className={i ? '' : 'eb-us'}>{m}</th>
                    <td className={i ? '' : 'eb-us'}>{n}</td>
                    <td className={i ? '' : 'eb-us'}>{s}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            I streamed each recording into each model 80 ms at a time, as if it were live, and recorded the model&rsquo;s text
            after every chunk. The times
            measure how much audio a model had to hear before it got the word right. Computing time depends on the hardware and is
            not included. A word&rsquo;s <strong>word latency</strong> is the first moment the word is on screen, spelled correctly
            and in the right location, and stays unchanged after that. I measure it from when the speaker finishes the word, so a
            negative number means before.
          </p>

          <h2>Earlier on every test set</h2>
          <p>
            On all six test sets, Earlybird predicts words correctly about 360 ms sooner than Moonshine Tiny, 490&ndash;580 ms
            sooner than Whistle and 160&ndash;200 ms sooner than Whisper base. It makes fewer errors than Moonshine Tiny on every
            set. Whistle is ahead on two sets, by at most 0.6 points, and Whisper base is the most accurate of the four.
          </p>
          <div className="pd-table-wrap">
            <table className="pd-table">
              <thead>
                <tr>
                  <th scope="col">Test set</th>
                  {MODELS.map((m, i) => <th key={m} scope="col" className={i ? '' : 'eb-us'}>{m}</th>)}
                </tr>
              </thead>
              <tbody>
                {SETS.map(([set, cells]) => {
                  const bt = Math.min(...cells.map((c) => c[0])), bw = Math.min(...cells.map((c) => c[1]));
                  return (
                    <tr key={set}>
                      <th scope="row">{set}</th>
                      {cells.map(([t, w], i) => (
                        <td key={i} className={i ? '' : 'eb-us'}>
                          {t === bt ? <b>{ms(t)}</b> : ms(t)}
                          <br />
                          {w === bw ? <b>{pct(w)}</b> : pct(w)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-[0.8125rem] leading-relaxed text-muted-foreground font-sans">
            Each cell: median word latency, then word error rate. All models are scored on the same utterances in each set, 67 to
            150 per set. Bold is the best in each row.
          </p>
          <p>
            I also scored the four models on the 8 English test sets of the Hugging Face Open ASR Leaderboard, using its text
            normalizer. Earlybird makes fewer errors than Moonshine Tiny on all 8 sets and roughly ties Whistle. Whisper base is
            more accurate, at about 9 times the size.
          </p>
          <div className="pd-table-wrap">
            <table className="pd-table">
              <thead>
                <tr><th scope="col">Model</th><th scope="col">Size</th><th scope="col">Mean word error rate, 8 Open ASR sets</th></tr>
              </thead>
              <tbody>
                {OPEN_ASR.map(([m, s, w]) => (
                  <tr key={m}>
                    <th scope="row" className={m === 'Earlybird' ? 'eb-us' : ''}>{m}</th>
                    <td className={m === 'Earlybird' ? 'eb-us' : ''}>{s}</td>
                    <td className={m === 'Earlybird' ? 'eb-us' : ''}>{pct(w)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[0.8125rem] leading-relaxed text-muted-foreground font-sans">
            On the clips all four models share. Whistle is slow to run, so outside TED it was scored on about 200 clips per set,
            which makes its number less precise.
          </p>

          <h2>Speed, accuracy and size</h2>
          <p>
            In all three charts the top left is better; hover a point for its numbers. Earlybird is the only model under 1 GB
            that gets most words right before they end. Its accuracy is in line with the other models under 100 MB: close to
            Whistle and Whisper tiny, and ahead of Moonshine Tiny.
          </p>
          <Figure
            title="Word latency against accuracy"
            caption="Median word latency on LibriSpeech against mean word error rate on the 8 Open ASR Leaderboard sets. Earlybird is shown at its 4-bit error rate. Parakeet's error rate is its published leaderboard number and its timing comes from 150 other clips."
          >
            <Scatter
              points={LATENCY_ACC}
              x="latency"
              y="wer"
              shade="x"
              shadeLabel="before the word ends"
              desc="Word latency against mean word error rate. Earlybird is the only small model that predicts words before they end."
            />
          </Figure>
          <Figure
            title="Size against accuracy"
            caption="Mean word error rate over the 8 English Open ASR Leaderboard sets. Hollow points are published leaderboard numbers from each model's card; filled points are my own runs. Full-precision models are shown at their 16-bit size. Whistle was scored on about 200 clips per set."
          >
            <Scatter
              points={SIZE_ACC}
              x="size"
              y="wer"
              desc="Size on disk against mean word error rate on the Open ASR Leaderboard sets."
            />
          </Figure>
          <Figure
            title="Size against word latency"
            caption="Median word latency on LibriSpeech audiobooks, all timed by me. The same 67 utterances for every model except Parakeet, which was timed on 150 others (Earlybird: −80 ms on those) and re-run every 240 ms. Nemotron is the int8 streaming build with 80 ms chunks."
          >
            <Scatter
              points={SIZE_LAT}
              x="size"
              y="latency"
              shade="y"
              shadeLabel="before the word ends ↑"
              desc="Size on disk against median word latency. Earlybird is the smallest model and the only one well before the word ends."
            />
          </Figure>

          <h2>Words before the speaker finishes them</h2>
          <Figure
            title="Words predicted correctly before they end, and not changed later"
            caption="Counts transcript words and guesses shown at 50% confidence or more. All models are scored on the same utterances in each set: 50 audiobook, 38 TED, 100 public-speech and 50 synthetic utterances where all four models produced output. Moonshine Tiny and Whistle are built to wait for each word to end. Whisper base gets some words early because each re-run hears a little more audio."
          >
            <KeptBars />
          </Figure>

          <h2>Confidence: knowing when to trust an early word</h2>
          <p>
            Earlybird gives every word it shows a confidence, which measures the probability that the word is right.
            This is the model&rsquo;s raw output, with no extra calibration step, and it matches how often
            the model is right: when Earlybird is at least 90% confident in a word it hasn&rsquo;t heard the end of, it is right
            91&ndash;96% of the time.
          </p>
          <Figure
            title="Stated confidence against how often the word is right"
            caption="Words still being spoken, at every 80 ms step, 200 utterances per test set. Points on the diagonal are perfectly calibrated. Calibration error is 3.7–5.5 points (audiobooks 4.3, TED 3.7, public speech 5.5, synthetic 3.7), and 0.7–4.4 points for the next-word guesses."
          >
            <Calibration />
          </Figure>

          <h2>How it&rsquo;s trained</h2>
          <Figure
            title="One training example"
            caption="Wherever the audio stops, the target asks for every word heard so far, the half-heard word written in full, and a guess of the next one. At every 80 ms step while streaming, Earlybird is in exactly this position."
          >
            <TrainingExample />
          </Figure>
          <ol>
            <li><strong>Start from Moonshine Tiny.</strong> I cut its vocabulary to the 19,007 tokens that English speech uses. That brings it to 29M parameters with no loss in accuracy.</li>
            <li><strong>Train on cut-off audio.</strong> Each training example is an utterance cut off at a random 80 ms step, which is what the model sees while streaming. The target is every word due by that point, an end marker, and a guess of the next two words. A word is due at whichever comes later: 300 ms before it ends, or 50 ms after it starts.</li>
            <li><strong>Learn from the teacher only where it&rsquo;s right.</strong> Moonshine Tiny also acts as a teacher, but only on tokens where its top choice matches the label. Using it everywhere made the guesses less decisive.</li>
            <li><strong>Add padding frames.</strong> After the audio heard so far, the model sees three frames computed from silence, which lets it finish a word as if the speaker had stopped. This uses no future audio, and it moved the median from −50 to −90 ms.</li>
            <li><strong>Quantize to 4 bits.</strong> Quantization-aware training brings the weights to 4 bits, with the audio front end at 8 bits. The file is 16.8 MB, or 17.6 MB with the tokenizer and config.</li>
          </ol>
          <p>Three training runs with different seeds agree to within 3 ms and 0.5 WER points on every test set.</p>

          <h2>Limits</h2>
          <ul>
            <li><strong>Accuracy.</strong> Whisper base, 2.5 times larger, makes fewer errors on every test set except audiobooks, where they tie. The gap is widest with background chatter: at 10 dB, Earlybird gets 32% of words wrong and Whisper base 8.9%.</li>
            <li><strong>Rewrites.</strong> Showing words early means changing them more often: 1.3 changes per word on audiobooks (Whistle 0.2, Whisper base 0.4, Moonshine Tiny 2.1), and 2&ndash;6 on spontaneous or noisy speech.</li>
            <li><strong>Next-word guesses help less.</strong> At 50% confidence or more, about 1 word in 7 is guessed correctly before it ends. Most early words come from the transcript itself.</li>
          </ul>

          <h2>Related work</h2>
          <p>
            Zink et al. (2024) train an offline recognizer to predict masked words at the end of an utterance. Yusuf et al. (2024)
            run a language model, prompted with audio, ahead of a streaming recognizer. Chang et al. (2020) and Schwarz et al.
            (2023) show that early, stable partial transcripts help voice assistants. Earlybird makes the prediction inside a small
            streaming recognizer, and measures how well calibrated and how stable its words are, not only how early they come.
          </p>

          <h2>Links</h2>
          <ul>
            <li>Live demo: <a href="#try">try it with your microphone</a> or recorded samples</li>
            <li>Model: <a href={HF}>Hugging Face</a></li>
            <li>Built on <a href="https://huggingface.co/UsefulSensors/moonshine-streaming-tiny">Moonshine Tiny</a> by Useful Sensors (MIT)</li>
          </ul>
        </div>

        <div className="pd-col">
          <footer className="mt-16 md:mt-20">
            <Link href="/writings" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← Back to all writings
            </Link>
          </footer>
        </div>
      </article>
    </main>
  );
}
