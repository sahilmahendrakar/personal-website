export function SiteFooter() {
  return (
    <footer className="mx-auto max-w-3xl px-6 md:px-6 py-10 border-t border-border">
      <p className="text-sm text-muted-foreground">
        © {new Date().getFullYear()} Sahil Mahendrakar. Built with Next.js.
      </p>
    </footer>
  );
}
