# Sahil Mahendrakar - Personal Website

A minimalist, modern personal website built with Next.js, TypeScript, and Tailwind CSS.

## Quick Start

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Editing Content

### Profile & Projects
Edit the data files in `lib/data/`:
- `experience.ts` - Work experience and education
- `projects.ts` - Featured projects
- `patents.ts` - Patent information

### Blog Posts (`/thoughts`)
The blog mirrors posts from a Substack publication via its RSS feed. Set
`SUBSTACK_URL` to your publication URL (see `.env.example`); it defaults to
`sahilmahendrakar.substack.com`. The site fetches `<SUBSTACK_URL>/feed` and
parses each post's title, subtitle, date, full HTML, and cover image (the same
art Substack uses for social previews), then renders it at `/thoughts/<slug>`
with a link back to the Substack original. Substack is treated as the canonical
source (canonical URLs point there), and each mirrored post reuses its cover as
the page's Open Graph / Twitter image.

**Publishing delay:** posts appear on their own, without a redeploy — the feed
is re-fetched via ISR every 10 minutes (`FEED_REVALIDATE_SECONDS` in
`lib/substack.ts`, mirrored by each page's `revalidate`). So a new Substack post
shows up within ~10 minutes of publishing. To make it instant, add a route that
calls `revalidatePath('/thoughts')` and point a Substack/Zapier webhook at it.

> Note: a deploy build can still prerender a stale post list, because Next
> persists its `fetch` cache between builds. ISR corrects this within one
> revalidate window; `rm -rf .next/cache` forces a fresh fetch locally.

> Note: `substack.com/@yourhandle` is your reader *profile*, not a publication.
> A publication has its own subdomain (`yourname.substack.com`) and is what
> provides the RSS feed. Create one at https://substack.com.

### Contact & Social Links
Edit `components/Contact.tsx` to update your email, LinkedIn, and GitHub links.

## Project Structure

```
app/
├── layout.tsx        # Root layout with fonts and metadata
├── page.tsx          # Home page (single-scroll)
├── globals.css       # Tailwind CSS + design tokens
└── blog/
    ├── page.tsx      # Blog index
    └── [slug]/page.tsx  # Individual blog posts

components/
├── Hero.tsx          # Name, tagline, CTAs
├── About.tsx         # Brief bio
├── Projects.tsx      # Featured project cards
├── Timeline.tsx      # Work experience with animated line
├── Patents.tsx       # Patent highlights
├── Now.tsx          # Current focus & interests
├── BlogPreview.tsx   # Recent posts preview
├── Contact.tsx       # Contact info & social links
└── ui/              # shadcn/ui components

lib/
├── data/            # Content data files
├── posts.ts         # Blog post utilities
└── utils.ts         # Helper functions
```

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Components**: shadcn/ui
- **Fonts**: Geist Sans & Geist Mono
- **Animations**: Framer Motion (entrance) + CSS (signature effects)

## Design Features

- **Signature Interactions**:
  - Animated underline effect on links
  - Scroll-revealing timeline line in Experience section
- **Typography-first** design with Geist font family
- **Light mode** default with **dark mode** support (system preference)
- **Responsive** and **accessible**

## Deployment

Deploy to Vercel:

```bash
pnpm build
# Push to GitHub and connect to Vercel
```

Or use the Vercel CLI:

```bash
pnpm dlx vercel
```

## Analytics

Add your analytics provider by uncommenting and configuring the Analytics placeholder in `app/layout.tsx`.

## License

MIT
