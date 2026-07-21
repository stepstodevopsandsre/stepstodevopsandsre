type BlogFiltersProps = {
  categories: string[];
  domains: string[];
  categoryFilter: string;
  domainFilter: string;
  onCategoryChange: (value: string) => void;
  onDomainChange: (value: string) => void;
  onClear: () => void;
  hasActiveFilters: boolean;
};

const selectClassName =
  "rounded-xl border border-border/70 bg-surface/85 px-4 py-2.5 text-sm font-medium text-text shadow-panel transition hover:border-accent/35 focus:border-accent/40 focus:outline-none focus:ring-2 focus:ring-accent/20";

export const BlogFilters = ({
  categories,
  domains,
  categoryFilter,
  domainFilter,
  onCategoryChange,
  onDomainChange,
  onClear,
  hasActiveFilters
}: BlogFiltersProps) => {
  const showCategoryFilter = categories.length > 0;
  const showDomainFilter = domains.length > 0;

  if (!showCategoryFilter && !showDomainFilter) {
    return null;
  }

  return (
    <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
      {showCategoryFilter && (
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-semibold uppercase tracking-[0.18em] text-muted">Category</span>
          <select
            className={selectClassName}
            value={categoryFilter}
            onChange={(event) => onCategoryChange(event.target.value)}
            aria-label="Filter by category"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
      )}

      {showDomainFilter && (
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-semibold uppercase tracking-[0.18em] text-muted">Domain</span>
          <select
            className={selectClassName}
            value={domainFilter}
            onChange={(event) => onDomainChange(event.target.value)}
            aria-label="Filter by domain"
          >
            <option value="all">All Domains</option>
            {domains.map((domain) => (
              <option key={domain} value={domain}>
                {domain}
              </option>
            ))}
          </select>
        </label>
      )}

      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClear}
          className="rounded-xl border border-border/70 bg-canvas/70 px-4 py-2.5 text-sm font-semibold text-text transition hover:border-accent/35 hover:text-accent"
        >
          Clear filters
        </button>
      )}
    </div>
  );
};
