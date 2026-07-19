import { motion } from "framer-motion";
import { ArrowRight, GitMerge, Shield, Telescope } from "lucide-react";
import { heroStats, site } from "@/data/siteContent";
import { MotionReveal } from "./MotionReveal";

const flowSteps = [
  {
    icon: Telescope,
    title: "Document in Notion",
    text: "Production incidents, architecture decisions, and debugging sessions become canonical long-form notes — not ephemeral chat messages."
  },
  {
    icon: GitMerge,
    title: "Bridge via Netlify",
    text: "A serverless function reads the mapped Notion page and returns sanitized, structured HTML. Secrets never leave the server."
  },
  {
    icon: Shield,
    title: "Publish on GitHub Pages",
    text: "A fast static shell serves the content at your domain. Zero server costs, zero maintenance overhead, 100% reliability."
  }
];

export const Hero = () => (
  <section id="home" className="relative overflow-hidden">
    <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top_left,_rgba(251,113,133,0.18),_transparent_28%),radial-gradient(circle_at_80%_10%,_rgba(56,189,248,0.18),_transparent_26%),linear-gradient(180deg,_rgba(15,23,42,0.06),_transparent_48%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(251,113,133,0.13),_transparent_25%),radial-gradient(circle_at_80%_10%,_rgba(56,189,248,0.14),_transparent_22%),linear-gradient(180deg,_rgba(2,6,23,0.75),_transparent_52%)]" />
    <div className="absolute inset-0 -z-10 bg-grid bg-[size:42px_42px] [mask-image:linear-gradient(to_bottom,white_35%,transparent)]" />

    <div className="mx-auto grid max-w-7xl gap-14 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:pb-24 lg:pt-24">
      <MotionReveal className="max-w-3xl">
        <motion.span
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accentSoft px-4 py-2 text-sm font-semibold text-accent shadow-panel"
        >
          <Shield size={16} />
          DevOps · SRE · Cloud · Platform Engineering
        </motion.span>

        <h1 className="mt-8 max-w-4xl font-display text-5xl font-semibold leading-[0.98] tracking-tight text-text sm:text-6xl lg:text-7xl">
          Production knowledge, shaped into a public system.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-muted sm:text-xl">
          {site.description}
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <a
            href="#blogs"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-text px-6 py-3.5 text-sm font-semibold text-canvas transition hover:-translate-y-0.5 hover:opacity-90"
          >
            Read the latest article
            <ArrowRight size={16} />
          </a>
          <a
            href="#interview-questions"
            className="inline-flex items-center justify-center rounded-full border border-border bg-surface/85 px-6 py-3.5 text-sm font-semibold text-text transition hover:-translate-y-0.5 hover:border-accent/40 hover:bg-elevated"
          >
            Interview question bank
          </a>
        </div>

        <dl className="mt-14 grid gap-4 sm:grid-cols-3">
          {heroStats.map((stat, index) => (
            <MotionReveal key={stat.label} delay={0.08 * (index + 1)}>
              <div className="rounded-[1.75rem] border border-border/70 bg-surface/75 p-5 shadow-panel backdrop-blur">
                <dt className="text-sm text-muted">{stat.label}</dt>
                <dd className="mt-2 font-display text-2xl font-semibold text-text">{stat.value}</dd>
              </div>
            </MotionReveal>
          ))}
        </dl>
      </MotionReveal>

      <MotionReveal className="relative" delay={0.08}>
        <div className="absolute -left-6 top-10 hidden h-28 w-28 rounded-full bg-rose-400/20 blur-3xl sm:block" />
        <div className="absolute bottom-6 right-4 hidden h-28 w-28 rounded-full bg-sky-400/20 blur-3xl sm:block" />
        <div className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-surface/78 p-6 shadow-panel backdrop-blur sm:p-7">
          <div className="absolute inset-x-0 top-0 h-px bg-sheen opacity-80" />
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-accent">Knowledge flow</p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-text">Write once, publish with structure</h2>
            </div>
            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-600 dark:text-emerald-400">
              Serverless
            </span>
          </div>

          <div className="mt-8 space-y-4">
            {flowSteps.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: 16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: 0.1 + i * 0.08, ease: [0.21, 0.47, 0.32, 0.98] }}
                  className="rounded-2xl border border-border/60 bg-canvas/70 p-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-accentSoft text-accent">
                      <Icon size={18} />
                    </span>
                    <div>
                      <h3 className="font-semibold text-text">{item.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-muted">{item.text}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </MotionReveal>
    </div>
  </section>
);
