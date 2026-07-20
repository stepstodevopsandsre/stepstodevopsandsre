import { motion } from "framer-motion";
import { categories } from "@/data/siteContent";
import { SectionHeading } from "./SectionHeading";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.52, ease: [0.21, 0.47, 0.32, 0.98] }
  }
};

export const FeaturedCategories = () => (
  <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
    <SectionHeading
      eyebrow="Scope"
      title="Everything in the DevOps & SRE orbit"
      description="From Kubernetes internals to chaos experiments, PromQL to Terraform - if it matters in production, there's a place for it here."
    />

    <motion.div
      className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
    >
      {categories.map((category) => {
        const Icon = category.icon;

        return (
          <motion.a
            key={category.title}
            href={category.href}
            variants={cardVariants}
            whileHover={{ y: -5, transition: { duration: 0.22, ease: "easeOut" } }}
            className="group block rounded-[1.75rem] border border-border/70 bg-surface/72 p-6 shadow-panel backdrop-blur transition-colors duration-300 hover:border-accent/35 hover:bg-elevated"
          >
            <motion.div
              className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accentSoft text-accent"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
            >
              <Icon size={20} />
            </motion.div>
            <h3 className="mt-5 font-display text-xl font-semibold text-text">{category.title}</h3>
            <p className="mt-3 text-sm leading-7 text-muted">{category.description}</p>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-accent opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              Browse articles →
            </div>
          </motion.a>
        );
      })}
    </motion.div>
  </section>
);
