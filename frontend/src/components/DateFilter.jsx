import { getCategoryStyle } from "../lib/categories";

export function SegmentedDateFilter({
  selectedFilter = "all",
  onSelectFilter,
  className = "",
}) {
  const dateOptions = [
    { id: "today", label: "Today" },
    { id: "tomorrow", label: "Tomorrow" },
    { id: "weekend", label: "This Weekend" },
    { id: "all", label: "All Upcoming" },
  ];

  return (
    <div
      role="tablist"
      aria-label="Filter events by date"
      className={`inline-flex items-center gap-1 p-1 bg-[#F4F2EB] rounded-full border border-[#ECEAE4] max-w-full overflow-x-auto no-scrollbar ${className}`}
    >
      {dateOptions.map((opt) => {
        const isActive = selectedFilter === opt.id;
        return (
          <button
            key={opt.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelectFilter(opt.id)}
            className={`px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-medium transition-all select-none whitespace-nowrap focus-visible:ring-2 focus-visible:ring-[#C4622D] focus-visible:outline-none ${
              isActive
                ? "bg-[#C4622D] text-white shadow-sm font-semibold"
                : "bg-transparent text-[#6B6B75] hover:text-[#1A1A1E] hover:bg-white/80"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export default function DateFilter({
  selectedCategory = "All",
  onSelectCategory,
  categories = [],
  totalCount = 0,
  filteredCount = 0,
  searchQuery = "",
  onSearchChange,
}) {
  return (
    <div className="space-y-3 pb-3 border-b border-[#ECEAE4]">
      {/* ── Search Input ────────────────────────────────────────── */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B6B75]">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by event, artist, or venue..."
          aria-label="Search events"
          className="w-full pl-10 pr-9 py-2 bg-white border border-[#ECEAE4] rounded-xl text-sm text-[#1A1A1E] placeholder-[#9E9EA7] focus:outline-none focus:border-[#C4622D] focus:ring-1 focus:ring-[#C4622D] transition-all shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-[#6B6B75] hover:text-[#1A1A1E]"
            title="Clear search query"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* ── Category Filter Pills ─────────────────────────────── */}
      <div className="flex items-center justify-between gap-2 pt-0.5">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {categories.map((cat) => {
            const isCatActive = selectedCategory === cat;
            const style = getCategoryStyle(cat);
            const isAll = cat === "All";

            return (
              <button
                key={cat}
                type="button"
                onClick={() => onSelectCategory(cat)}
                style={
                  isCatActive
                    ? isAll
                      ? { backgroundColor: "#1A1A1E", color: "#FFFFFF", borderColor: "#1A1A1E" }
                      : {
                          backgroundColor: style.hex,
                          color: "#FFFFFF",
                          borderColor: style.hex,
                        }
                    : isAll
                    ? { backgroundColor: "#FFFFFF", color: "#6B6B75", borderColor: "#ECEAE4" }
                    : {
                          backgroundColor: style.bgTint,
                          color: style.text,
                          borderColor: style.border,
                        }
                }
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all border shrink-0 focus-visible:ring-2 focus-visible:ring-[#C4622D] focus-visible:outline-none select-none ${
                  isCatActive ? "shadow-sm font-semibold" : "hover:opacity-90"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Counter Badge */}
        <div className="text-xs text-[#6B6B75] whitespace-nowrap font-medium pl-1 shrink-0">
          <span className="font-semibold text-[#1A1A1E]">{filteredCount}</span>
          <span className="text-[#9E9EA7]">/{totalCount}</span>
        </div>
      </div>
    </div>
  );
}
