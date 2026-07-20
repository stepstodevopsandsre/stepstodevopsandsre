import { MotionReveal } from "./MotionReveal";

export const AboutSection = () => (
  <section id="about" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
    <MotionReveal className="grid gap-8 rounded-[2rem] border border-border/70 bg-surface/78 p-8 shadow-panel backdrop-blur lg:grid-cols-[0.95fr_1.05fr] lg:p-10">
      <div>
        <span className="inline-flex rounded-full border border-accent/20 bg-accentSoft px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-accent">
          About
        </span>
        <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-text sm:text-4xl">
          A public notebook about DevOps, SRE, cloud, Kubernetes and engineering practices
        </h2>
      </div>

      <div className="space-y-5 text-base leading-8 text-muted">
        <p>
          This blog is a public notebook for engineers who want to practice and prepare for interviews. I have documented topics, questions and learnings based on my experience from giving 150+ interviews.
        </p>
        <p>
         The simple goal is to help in interview preparation and help engineers prepare better .
        </p>
      </div>
    </MotionReveal>
  </section>
);
