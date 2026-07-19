import { AlertCircle, ArrowLeft, ChevronDown, ChevronUp, Clock3, LoaderCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { latestBlogs } from "@/data/siteContent";
import { fetchBlogArticle } from "@/lib/api";
import { getBlogHref } from "@/lib/routes";
import type { BlogArticle, BlogPost } from "@/types";
import { MotionReveal } from "./MotionReveal";

type BlogArticlePageProps = {
  slug: string;
  allPosts: BlogPost[];
};

type LoadState =
  | { status: "idle" | "loading" }
  | { status: "success"; article: BlogArticle }
  | { status: "error"; message: string };

type TocEntry = { id: string; text: string; level: number };

const formatDate = (value?: string) => {
  if (!value) return "Recently updated";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
};

/** Extract h2 (and optionally h3) headings from rendered HTML */
const extractHeadings = (html: string): TocEntry[] => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const entries: TocEntry[] = [];
  let h2Counter = 0;

  doc.querySelectorAll("h2, h3").forEach((el) => {
    const level = el.tagName === "H2" ? 2 : 3;
    const text = el.textContent?.trim() ?? "";
    if (!text) return;

    // Create a slug id from text
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 64);

    // Make it unique if collision
    const uniqueId = level === 2 ? `toc-${++h2Counter}-${id}` : `toc-${h2Counter}-sub-${id}`;
    el.id = uniqueId;
    entries.push({ id: uniqueId, text, level });
  });

  return entries;
};

/** Inject ids into the article HTML so anchor links work */
const injectIdsIntoHtml = (html: string, toc: TocEntry[]): string => {
  if (!toc.length) return html;
  let result = html;
  const used = new Set<string>();

  for (const entry of toc) {
    // Skip already-processed
    if (used.has(entry.text)) continue;
    used.add(entry.text);

    const tag = entry.level === 2 ? "h2" : "h3";
    const escaped = entry.text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`<${tag}([^>]*)>(${escaped})</${tag}>`, "i");
    result = result.replace(re, `<${tag}$1 id="${entry.id}">$2</${tag}>`);
  }

  return result;
};

// --- TOC Sidebar ---
const TableOfContents = ({ toc }: { toc: TocEntry[] }) => {
  const [open, setOpen] = useState(true);
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    if (!toc.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setActive(e.target.id);
            break;
          }
        }
      },
      { rootMargin: "-10% 0% -80% 0%", threshold: 0 }
    );

    toc.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [toc]);

  if (!toc.length) return null;

  return (
    <nav className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-[1.5rem] border border-border/60 bg-surface/70 p-5 shadow-panel backdrop-blur">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 text-left"
      >
        <span className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">On this page</span>
        <motion.span
          animate={{ rotate: open ? 0 : 180 }}
          transition={{ duration: 0.25 }}
          className="text-muted"
        >
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.ol
            key="toc-list"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="mt-4 space-y-1 overflow-hidden"
          >
            {toc.map(({ id, text, level }) => (
              <li key={id} style={{ paddingLeft: level === 3 ? "1rem" : "0" }}>
                <a
                  href={`#${id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.getElementById(id);
                    if (el) {
                      el.scrollIntoView({ behavior: "smooth", block: "start" });
                      setActive(id);
                    }
                  }}
                  className={`block rounded-lg px-2 py-1.5 text-xs leading-5 transition-colors duration-150 ${
                    active === id
                      ? "bg-accent/10 font-semibold text-accent"
                      : "text-muted hover:bg-surface hover:text-text"
                  }`}
                >
                  {text}
                </a>
              </li>
            ))}
          </motion.ol>
        )}
      </AnimatePresence>
    </nav>
  );
};

// --- Related Posts Sidebar ---
const RelatedPosts = ({
  currentSlug,
  currentTag,
  allPosts
}: {
  currentSlug: string;
  currentTag?: string;
  allPosts: BlogPost[];
}) => {
  const related = allPosts.filter(
    (p) => p.slug !== currentSlug && (!currentTag || p.tag === currentTag)
  );

  if (!related.length) return null;

  return (
    <aside className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-[1.5rem] border border-border/60 bg-surface/70 p-5 shadow-panel backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
        {currentTag ? `More in ${currentTag}` : "Related articles"}
      </p>
      <ul className="mt-4 space-y-3">
        {related.slice(0, 8).map((post) => (
          <li key={post.slug}>
            <a
              href={getBlogHref(post.slug)}
              className="group block rounded-xl border border-transparent p-2 transition hover:border-accent/20 hover:bg-canvas"
            >
              <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
                {post.tag}
              </span>
              <span className="text-xs font-medium leading-5 text-text group-hover:text-accent transition-colors">
                {post.title}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export const BlogArticlePage = ({ slug, allPosts }: BlogArticlePageProps) => {
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [toc, setToc] = useState<TocEntry[]>([]);
  const [processedHtml, setProcessedHtml] = useState("");
  const fallback = [...allPosts, ...latestBlogs].find((post) => post.slug === slug);

  useEffect(() => {
    let cancelled = false;

    setState({ status: "loading" });
    setToc([]);
    setProcessedHtml("");

    fetchBlogArticle(slug)
      .then((article) => {
        if (!cancelled) {
          const extracted = extractHeadings(article.html);
          const html = injectIdsIntoHtml(article.html, extracted);
          setToc(extracted);
          setProcessedHtml(html);
          setState({ status: "success", article: { ...article, html } });
        }
      })
      .catch((error: Error) => {
        if (!cancelled) {
          setState({ status: "error", message: error.message });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  // After article HTML is injected, load Mermaid.js and render diagrams
  useEffect(() => {
    if (state.status !== "success") return;

    const initMermaid = () => {
      if (typeof window.mermaid === "undefined") return;
      try {
        window.mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          themeVariables: {
            background: "#0b0f19",
            primaryColor: "#1e293b",
            primaryTextColor: "#e2e8f0",
            lineColor: "#94a3b8",
            edgeLabelBackground: "#1e293b"
          }
        });
        window.mermaid.run({ querySelector: ".mermaid" });
      } catch {
        // Silently ignore mermaid render errors
      }
    };

    if (!window.__mermaidLoaded) {
      window.__mermaidLoaded = true;
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js";
      script.async = true;
      script.onload = initMermaid;
      document.head.appendChild(script);
    } else {
      initMermaid();
    }
  }, [state.status]);

  const currentTag = state.status === "success"
    ? (fallback?.tag ?? "")
    : (fallback?.tag ?? "");

  return (
    <main className="mx-auto max-w-[90rem] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      {/* Back link */}
      <MotionReveal>
        <a
          href="#home"
          className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-surface/70 px-4 py-2 text-sm font-medium text-muted transition hover:border-accent/30 hover:text-text"
        >
          <ArrowLeft size={16} />
          Back to home
        </a>
      </MotionReveal>

      {/* Three-column layout: related posts | article | TOC */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[220px_1fr_220px] xl:grid-cols-[240px_1fr_240px]">

        {/* LEFT: Related posts (hidden on small screens) */}
        <div className="hidden lg:block">
          <MotionReveal delay={0.04}>
            <RelatedPosts
              currentSlug={slug}
              currentTag={currentTag}
              allPosts={allPosts}
            />
          </MotionReveal>
        </div>

        {/* CENTER: Main article */}
        <div className="min-w-0">
          <MotionReveal className="rounded-[2rem] border border-border/70 bg-surface/80 p-6 shadow-panel backdrop-blur sm:p-8" delay={0.05}>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
              <span className="rounded-full border border-accent/20 bg-accentSoft px-3 py-1 font-semibold uppercase tracking-[0.18em] text-accent">
                {currentTag || "Article"}
              </span>
              {state.status === "success" ? (
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 size={14} />
                  {state.article.readingTimeMinutes} min read
                </span>
              ) : null}
              {state.status === "success" ? (
                <span>Updated {formatDate(state.article.lastEditedTime)}</span>
              ) : null}
            </div>

            <h1 className="mt-6 max-w-3xl font-display text-4xl font-semibold tracking-tight text-text sm:text-5xl">
              {state.status === "success" ? state.article.title : fallback?.title ?? "Loading article"}
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-8 text-muted sm:text-lg">
              {state.status === "success"
                ? state.article.excerpt
                : fallback?.summary ?? "Loading the latest blog content through the secure Netlify bridge."}
            </p>
          </MotionReveal>

          {/* Mobile TOC (visible on small screens, collapsed by default) */}
          <div className="mt-6 lg:hidden">
            <TableOfContents toc={toc} />
          </div>

          {state.status === "loading" ? (
            <div className="mt-8 flex min-h-[18rem] items-center justify-center rounded-[2rem] border border-border/70 bg-surface/75 p-8 shadow-panel">
              <div className="flex items-center gap-3 text-muted">
                <LoaderCircle className="animate-spin" size={20} />
                Loading article content...
              </div>
            </div>
          ) : null}

          {state.status === "error" ? (
            <div className="mt-8 rounded-[2rem] border border-rose-500/20 bg-rose-500/10 p-8 shadow-panel">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 text-rose-500" size={18} />
                <div>
                  <h2 className="font-display text-2xl font-semibold text-text">Article unavailable</h2>
                  <p className="mt-3 text-sm leading-7 text-muted">{state.message}</p>
                  <p className="mt-3 text-sm leading-7 text-muted">
                    The article renders here once the Netlify function returns the Notion content.
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {state.status === "success" ? (
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="mt-8 rounded-[2rem] border border-border/70 bg-surface/80 p-6 shadow-panel sm:p-8"
            >
              <article
                className="prose prose-slate max-w-none prose-headings:font-display prose-headings:tracking-tight prose-a:text-accent dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: processedHtml }}
              />
            </motion.section>
          ) : null}

          <MotionReveal className="mt-10 rounded-[2rem] border border-border/70 bg-canvas/70 p-6 sm:p-8" delay={0.15}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">More content paths</p>
                <h2 className="mt-2 font-display text-2xl font-semibold text-text">Continue through the knowledge hub</h2>
              </div>
              <a
                href="#blogs"
                className="inline-flex items-center justify-center rounded-full border border-border/70 bg-surface px-5 py-3 text-sm font-semibold text-text transition hover:border-accent/35"
              >
                All articles
              </a>
            </div>
          </MotionReveal>
        </div>

        {/* RIGHT: Table of contents (hidden on small screens) */}
        <div className="hidden lg:block">
          <MotionReveal delay={0.06}>
            <TableOfContents toc={toc} />
          </MotionReveal>
        </div>
      </div>
    </main>
  );
};
