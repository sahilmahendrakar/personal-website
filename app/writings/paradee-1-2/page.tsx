import { Metadata } from 'next';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { PARADEE_12_POST as post } from '@/lib/native-posts';
import { ReadingProgress } from '@/components/ReadingProgress';
import { PostCover } from '@/components/PostCover';
import { AudioClip } from '@/components/paradee/AudioClip';
import { Snippet } from '@/components/paradee/Figures';
import '../paradee/paradee.css';

const ASSETS = '/writings/paradee-1-2';
const URL = `https://sahilmahendrakar.com/writings/${post.id}`;
const COVER = `https://sahilmahendrakar.com${post.coverImage}`;
const PAPER = 'https://arxiv.org/abs/2610.06817';
const PAPER_TITLE = 'Paradee: Distilling Kokoro-82M into an 8M-Parameter Single-Voice Text-to-Speech Model';

const VOICES = [
  { id: 'af_heart', name: 'Heart', accent: 'American' },
  { id: 'am_puck', name: 'Puck', accent: 'American' },
  { id: 'bf_isabella', name: 'Isabella', accent: 'British' },
  { id: 'bm_fable', name: 'Fable', accent: 'British' },
];

const UTMOS = [
  { voice: 'af_heart', paradee: '4.40', kokoro: '4.52' },
  { voice: 'bf_isabella', paradee: '4.06', kokoro: '4.41' },
  { voice: 'am_puck', paradee: '4.32', kokoro: '4.47' },
  { voice: 'bm_fable', paradee: '4.18', kokoro: '4.32' },
];

const WER = [
  { voice: 'af_heart', paradee: '5.8%', kokoro: '5.7%' },
  { voice: 'bf_isabella', paradee: '5.7%', kokoro: '5.6%' },
  { voice: 'am_puck', paradee: '5.4%', kokoro: '6.3%' },
  { voice: 'bm_fable', paradee: '5.7%', kokoro: '5.7%' },
];

const PHONEMES = [
  { word: 'avocado', american: 'ˌɑvəkˈɑdO', british: 'ˌavəkˈɑːdQ' },
  { word: 'tomato', american: 'təmˈATO', british: 'təmˈɑːtQ' },
  { word: 'schedule', american: 'skˈɛʤˌul', british: 'ʃˈɛdjuːl' },
];

export const metadata: Metadata = {
  title: post.title,
  description: post.subtitle,
  alternates: { canonical: URL },
  openGraph: {
    type: 'article',
    title: post.title,
    description: post.subtitle,
    publishedTime: post.date,
    url: URL,
    images: [COVER],
  },
  twitter: {
    card: 'summary_large_image',
    title: post.title,
    description: post.subtitle,
    images: [COVER],
  },
};

function ScoreTable({ metric, rows }: { metric: string; rows: { voice: string; paradee: string; kokoro: string }[] }) {
  return (
    <div className="pd-table-wrap">
      <table className="pd-table">
        <thead>
          <tr>
            <th scope="col">{metric}</th>
            <th scope="col" className="pd-table-us">Paradee-8M-v1.2</th>
            <th scope="col">Kokoro-82M</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.voice}>
              <th scope="row">{r.voice}</th>
              <td className="pd-table-us">{r.paradee}</td>
              <td>{r.kokoro}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Paradee12Post() {
  return (
    <main className="pd min-h-screen">
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
            {post.coverImage && (
              <PostCover
                src={post.coverImage}
                className="aspect-[16/9] w-full mt-8 md:mt-10"
                sizes="(max-width: 768px) 100vw, 46rem"
                priority
              />
            )}
          </header>
        </div>

        <div className="pd-col post-body">
          <p>
            Last week I released <Link href="/writings/paradee-1-1">Paradee-8M-v1.1</Link>, a faster and clearer
            version of my small voice model distilled from{' '}
            <a href="https://huggingface.co/hexgrad/Kokoro-82M">Kokoro-82M</a>. Until now Paradee only had one voice,
            Kokoro&rsquo;s af_heart. Today I&rsquo;m releasing{' '}
            <a href="https://huggingface.co/sahilmahendrakar/Paradee-8M-v1.2">Paradee-8M-v1.2</a>, which has four
            voices in the same 8.5 MB file and without any quality loss.
          </p>
          <p>Here&rsquo;s one sentence read by each voice.</p>
          <blockquote>
            In the wild, parakeets fly in loud, colorful flocks across the open grasslands of Australia.
          </blockquote>
          <div className="pd-clips">
            {VOICES.map((v) => (
              <AudioClip key={v.id} src={`${ASSETS}/audio/parakeets_${v.id}.mp3`} label={`${v.name} (${v.accent})`} />
            ))}
          </div>

          <p>
            <strong>UTMOS</strong> (higher is better)
            <br />
            UTMOS is a model trained on human ratings that predicts how natural a clip sounds, on a scale from 1 to 5.
          </p>
          <ScoreTable metric="UTMOS" rows={UTMOS} />

          <p>
            <strong>WER</strong> (lower is better)
            <br />
            WER is the share of words that Whisper, a speech recognition model, transcribes wrongly.
          </p>
          <ScoreTable metric="WER" rows={WER} />

          <p>
            These are measured on the same 200 held-out sentences as before. UTMOS predicts how natural a clip sounds,
            out of 5, and WER is the share of words Whisper mishears. af_heart scores 4.40, against 4.39 in v1.1, so
            adding the other voices didn&rsquo;t reduce the existing voice&rsquo;s quality. The file size and speed are
            the same as v1.1.
          </p>

          <h2>What changed</h2>
          <p>
            Kokoro describes each voice with a vector, and the model reads that vector at every step. Paradee 1.1 only
            ever saw one voice, so it learned a single fixed vector. For v1.2 each half of the model has a small table
            with one vector per voice, and the voice you pick chooses the row. Everything else is shared between the
            four voices.
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="pd-diagram"
            src={`${ASSETS}/img/voices_before_after.webp`}
            width={1500}
            height={920}
            alt="Paradee 1.1 and 1.2 side by side: in 1.2 each half has a table of four voice vectors, and the chosen voice picks the row"
          />
          <p>
            The British voices also need British pronunciation. Kokoro uses different phonemes for the same word
            between British and American voices. Some examples of words with different American and British phonemes
            are included below:
          </p>
          <div className="pd-table-wrap">
            <table className="pd-table pd-table-text">
              <thead>
                <tr>
                  <th scope="col">Word</th>
                  <th scope="col">American</th>
                  <th scope="col">British</th>
                </tr>
              </thead>
              <tbody>
                {PHONEMES.map((r) => (
                  <tr key={r.word}>
                    <th scope="row">{r.word}</th>
                    <td>{r.american}</td>
                    <td>{r.british}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            The phonemizer in the package and in Chickadee was updated to use British phonemes when a British voice is
            used.
          </p>
          <p>
            In order to add the additional voices, I started from the v1.1 weights and kept training both the
            text-side and the decoder on Kokoro reading 12,000 sentences in each of the four voices. For more
            information on how the training of Paradee works, see{' '}
            <a href={PAPER}>
              <em>{PAPER_TITLE}</em>
            </a>
            . The result is Paradee-8M-v1.2 with four voices, the same tiny model size, and no quality loss compared to
            v1.1 on its existing voice.
          </p>

          <h2>Try it</h2>
          <p>
            Paradee-8M-v1.2 is now the light voice in{' '}
            <a href="https://chromewebstore.google.com/detail/chickadee/nbghebngnkkjcgpcmhchpijmcdkclndm">Chickadee</a>,
            a Chrome extension that reads web pages aloud using local voice models. Choose Paradee as the model and
            pick one of the four voices.
          </p>
          <p>The Python package uses v1.2 by default, and v1.1 is still available.</p>
          <Snippet
            code={`pip install git+https://github.com/sahilmahendrakar/paradee\npython -m paradee "Paradee is a small voice that runs anywhere." --voice bf_isabella -o hello.wav`}
          />

          <h2>Links</h2>
          <ul>
            <li>
              Model: <a href="https://huggingface.co/sahilmahendrakar/Paradee-8M-v1.2">Hugging Face</a>
            </li>
            <li>
              Code: <a href="https://github.com/sahilmahendrakar/paradee">GitHub</a>
            </li>
            <li>
              Chickadee: <a href="https://chromewebstore.google.com/detail/chickadee/nbghebngnkkjcgpcmhchpijmcdkclndm">Chrome Web Store</a>
            </li>
            <li>
              v1.0 Paper:{' '}
              <a href={PAPER}>
                <em>{PAPER_TITLE}</em>
              </a>
            </li>
            <li>
              Earlier posts: <Link href="/writings/paradee-1-1">Paradee 1.1</Link>,{' '}
              <Link href="/writings/paradee">Paradee</Link>
            </li>
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
