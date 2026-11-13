import { Metadata } from 'next';
import Link from 'next/link';
import { Urbanist } from 'next/font/google';
import { format, parseISO } from 'date-fns';
import { COLD_STARTS_POST as post } from '@/lib/native-posts';
import { ReadingProgress } from '@/components/ReadingProgress';
import { Fig, FiguresRuntime } from '@/components/cold-starts/Figures';
import { Toc } from '@/components/earlybird/Toc';
import { PostCover } from '@/components/PostCover';
import '../paradee/paradee.css';
import '../earlybird/earlybird.css';
import './cold-starts.css';

// The figures were drawn in Urbanist; keep it so their labels fit.
const urbanist = Urbanist({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-urbanist' });

const URL = `https://sahilmahendrakar.com/writings/${post.id}`;
// The cover is an animated GIF; link previews get a titled still. www directly so crawlers skip the redirect.
const SHARE_IMAGE = 'https://www.sahilmahendrakar.com/writings/cold-starts/img/og.png';

export const metadata: Metadata = {
  title: post.title,
  description: post.subtitle,
  alternates: { canonical: URL },
  openGraph: { type: 'article', title: post.title, description: post.subtitle, publishedTime: post.date, url: URL, images: [SHARE_IMAGE] },
  twitter: { card: 'summary_large_image', title: post.title, description: post.subtitle, images: [SHARE_IMAGE] },
};

const TOC = [
  { id: 'frontier', label: 'Serving frontier models' },
  { id: 'custom', label: 'Serving custom models' },
  { id: 'scale-to-zero', label: 'Idle time and scaling to zero' },
  { id: 'breakdown', label: 'Breaking down a cold start' },
  { id: 'snapshots', label: 'How GPU memory snapshots work' },
  { id: 'fast-cold-starts', label: 'Serving with fast cold starts' },
  { id: 'next-steps', label: 'Next steps' },
];

const SNAPSHOT_CODE = `@app.cls(gpu=["L4", "A10G", "L40S"], scaledown_window=10,
         enable_memory_snapshot=True,
         experimental_options={"enable_gpu_snapshot": True})
class Reader:
    @modal.enter(snap=True)
    def start(self):
        start_vllm("--enable-sleep-mode", ...)
        warm_up()                              # one image request
        post("/sleep", params={"level": 2})    # drop weights and KV cache

    @modal.enter(snap=False)
    def wake(self):                            # after every restore
        post("/wake_up", params={"tags": "weights"})
        rpc("reload_weights")                  # FP8 weights from the volume, ~6 s
        rpc("reload_draft_weights")            # speculative-decoding head, ~1.3 s
        post("/wake_up", params={"tags": "kv_cache"})`;

export default function ColdStartsPost() {
  return (
    <main className={`pd eb csf min-h-screen ${urbanist.variable}`}>
      <ReadingProgress />
      <Toc items={TOC} />
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
            So you want to run your own custom model? There’s a lot of interest in companies owning their own intelligence,
            since a custom post-trained model can match or beat a frontier model on a specific task at a fraction of the cost
            and latency. Not to mention other benefits, including control over the model, privacy, continuous improvement, and
            more.
          </p>
          <p>
            While custom models are usually smaller than frontier models, serving them efficiently is a major problem that
            threatens to undercut potential cost savings. With low or bursty traffic, a custom model hosted on a dedicated GPU
            pays for GPU idle time and low utilization. The bottleneck to owning your own intelligence is now infrastructure,
            not the model itself: how do you serve a custom model efficiently at low traffic?
          </p>

          <h2 id="frontier">Serving frontier models efficiently</h2>
          <p>
            Before we dive into serving custom models, let’s review how inference works in the first place and what its
            bottlenecks are. In order for an LLM to generate a token based on an input, it has to do a series of matrix
            multiplications, where input vectors are multiplied by the weights of a model. The animation below is a bit of a
            simplification, but it gives a general idea of what inference looks like.
          </p>
          <Fig id="pass" />
          <p>
            Inference requires 1) reading the weights of the model into the GPU’s compute units and 2) computing the matrix
            multiplication. The first is limited by the memory bandwidth of the GPU, the second by the GPU’s compute
            throughput. For a single request, reading the weights takes longer than performing the computation. The bottleneck
            for single-request inference is memory bandwidth.
          </p>
          <p>
            In order to ease this bottleneck, we can batch requests. Model weights can be read once, and a token can be
            generated for every request in the batch at once.
          </p>
          <Fig id="passb" />

          <p>
            Frontier model providers serve millions of requests from thousands of customers on a shared fleet of GPUs. As we
            mentioned before, generating text is limited mostly by memory bandwidth: a model writes its answer one token at a
            time, and each token takes one forward pass that reads all of its weights from GPU memory. Therefore, in order to
            increase GPU utilization, providers batch multiple requests together. A single forward pass, then, can generate
            tokens for multiple requests at once. With traffic from so many customers, the batches stay full and the GPUs have
            high utilization.
          </p>
          <Fig id="frontier" />

          <h2 id="custom">Serving custom models</h2>
          <p>
            A custom model’s weights are tuned for one customer, so custom models are usually served on a dedicated GPU that
            can’t share anyone else’s traffic. Batching works when there is enough traffic that many requests can be combined
            into a single forward pass. Custom models rarely get that much traffic, especially for a customer that is operating
            at a smaller scale.
          </p>
          <p>
            In practice, a custom model might see a few requests an hour, or occasional bursts of traffic. The GPU spends most
            of its time idle, but the customer is still billed for all that time.
          </p>
          <Fig id="custom" />
          <p>
            The usual assumption is that custom models only pay off at high volume. For one of our 9B-parameter models, we
            needed about 50,000 requests per month before it beat GPT-5.2 on cost. On a busy GPU though, it could be over 10x
            less costly.
          </p>

          <h2 id="scale-to-zero">Idle time and scaling to zero</h2>
          <p>
            If custom model deployments have high GPU idle time, which leads to large serving costs, we can try to release the
            GPU when it is not serving requests. That is, we can scale to zero: run the GPU only while there is work, and
            release the GPU after it’s been dormant for some time.
          </p>
          <Fig id="cold" />
          <p>
            The issue with releasing and reallocating GPUs on-demand is that finding a GPU and getting it ready to serve a model
            is not instantaneous. There is a cold start problem. Starting our model from scratch took 3 to 7 minutes, too slow
            for someone waiting on an answer, and the customer is still billed for the GPU during a cold start.
          </p>
          <p>
            With minutes of latency on a cold start, deciding to scale-to-zero has serious tradeoffs. It makes sense to try to
            keep the GPU warm for as long as possible to minimize cold starts. This incurs serious GPU time costs.
          </p>
          <p>
            Bringing down the cold start time is imperative to serving a custom model efficiently, especially with low or
            bursty traffic. A fast cold start means both the customer is waiting less time for their request to be answered,
            and a lower overall cost for serving the model. With a fast cold start, you can be more aggressive when scaling to
            zero, since you know you can respond quickly when a request comes in. This keeps response latency low and brings
            down costs by reducing billed GPU idle time.
          </p>
          <p>In this post we show how GPU memory snapshots can cut the cold start time from many minutes to about 15 seconds.</p>

          <h2 id="breakdown">Breaking down a cold start</h2>
          <p>
            We timed three ways to get a model ready for serving: starting our own stopped GPU box on AWS, a fresh container on
            Modal, and a Modal container restored from a GPU memory snapshot. In each of these scenarios, we looked at where
            time was spent in getting the model ready to serve.
          </p>
          <Fig id="dissect" />
          <p>
            During a cold start, we need to allocate a GPU, initialize the inference engine, load the model weights into the
            GPU’s memory, and initialize the KV cache, all before a request can be served. From our measurements, allocating a
            GPU took up to a minute or more on AWS because of limited capacity, whereas through Modal it took about 5 seconds.
            Starting the inference engine ate up around a minute, and so did initializing the KV cache and capturing CUDA
            graphs for both a fresh Modal container and for AWS. Loading the weights took over two minutes through AWS (limited
            by the bandwidth of the EBS disk from where we fetched the weights) and on a fresh Modal container it took about
            35s.
          </p>
          <p>
            Restoring from a GPU snapshot significantly reduced the cold start time. Allocating a GPU took the same amount of
            time. But starting the inference engine, initializing the KV cache and capturing CUDA graphs were reduced to mere
            seconds. We were also able to load weights faster because the restored engine already has the model built in GPU
            memory, so vLLM only copies the weights into place instead of building the model around them.
          </p>
          <p>
            We also optimized three vLLM settings to cut a fresh Modal start by almost a minute: prefetching the weight files,
            capturing CUDA graphs only up to our batch size, and loading an FP8 checkpoint written ahead of time (12 GB instead
            of 18).
          </p>

          <h2 id="snapshots">How GPU memory snapshots work</h2>
          <p>
            During a cold start, there is a bunch of deterministic setup that takes time to compute: Python imports thousands
            of modules, CUDA creates a context and loads its libraries, allocates the KV cache, compiles kernels, and captures
            CUDA graphs. Each step is slow to compute, but the result is just bytes sitting in CPU and GPU memory.
          </p>
          <p>
            A GPU memory snapshot saves those bytes to storage once, and later restores copy them directly into memory instead
            of recomputing them. This significantly reduces cold start times.
          </p>
          <p>
            Our snapshot deliberately leaves out the weights and the KV cache. We do this for two reasons: 1) keeping weights in
            the snapshot doesn’t make restores faster since reading gigabytes of memory from a snapshot is about the same as
            reading gigabytes of weights from storage, and 2) a big snapshot is slow to save, which risks a container being
            stopped mid-save.
          </p>
          <p>
            Before the snapshot we put vLLM to sleep, which frees the weights and KV cache, but keeps its addresses reserved, so
            the captured CUDA graphs stay valid. After a restore we read the weights back in (about 6 s) and allocate the KV
            cache again (a second or two). The expensive part, working out how big the KV cache can be and capturing the graphs
            around it, is never redone.
          </p>
          <pre>
            <code>{SNAPSHOT_CODE}</code>
          </pre>

          <h2 id="fast-cold-starts">Serving with fast cold starts</h2>
          <p>
            Fast cold starts significantly improve custom model serving economics, especially with low or bursty traffic. A
            fast cold start allows you to scale-to-zero aggressively, and respond to customers with lower latency. With quick
            cold starts, you significantly reduce billed GPU idle time.
          </p>
          <Fig id="compare" />
          <p>
            In our experiments serving a 9B model on an L4, each wake costs about $0.01 from a snapshot versus
            $0.10 from a fresh start. For a model that gets 300 small bursts a month, that is about $8 a month versus about $35.
            The first answer in each burst arrives in about 30 seconds instead of over 5 minutes.
          </p>

          <h2 id="next-steps">Next Steps</h2>
          <p>
            Fast cold starts, achieved through GPU snapshots, make custom model serving much more economically feasible.
            However, it is still often more expensive than the same model on a busy GPU. Scaling to zero removes idle time, but
            each model still occupies a dedicated GPU while it’s awake. Techniques like multi-LoRA serving and fast model
            swapping can increase GPU utilization for custom models.
          </p>
          <p>
            Owning your own intelligence requires innovation at the level of infrastructure. Fast cold starts with GPU
            snapshots is one piece that brings us closer to the specialized intelligence era.
          </p>
        </div>

        <div className="pd-col">
          <footer className="mt-16 md:mt-20">
            <Link href="/writings" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← Back to all writings
            </Link>
          </footer>
        </div>
      </article>
      <FiguresRuntime />
    </main>
  );
}
