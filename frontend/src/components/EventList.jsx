import EventCard from "./EventCard";
import DateFilter from "./DateFilter";

export default function EventList({
  events = [],
  allEvents = [],
  loading = false,
  error = null,
  selectedEventId = null,
  hoveredEventId = null,
  onSelectEvent,
  onHoverEvent,
  onLeaveEvent,
  selectedFilter,
  onSelectFilter,
  selectedCategory,
  onSelectCategory,
  categories = [],
  searchQuery,
  onSearchChange,
  onResetFilters,
}) {
  const getFilterLabel = (filter) => {
    switch (filter) {
      case "today":
        return "Today’s Events";
      case "tomorrow":
        return "Tomorrow’s Events";
      case "weekend":
        return "This Weekend";
      default:
        return "Upcoming Events";
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#FAF9F6]">
      {/* Sticky Header with Search & Category Filters */}
      <div className="p-4 sm:p-5 pb-2 shrink-0 bg-[#FAF9F6]/95 backdrop-blur-sm z-10">
        <DateFilter
          selectedFilter={selectedFilter}
          onSelectFilter={onSelectFilter}
          selectedCategory={selectedCategory}
          onSelectCategory={onSelectCategory}
          categories={categories}
          totalCount={allEvents.length}
          filteredCount={events.length}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
        />

        {/* Section Title Header in Fraunces */}
        <div className="flex items-baseline justify-between pt-3 pb-1">
          <h2 className="font-display font-bold text-[22px] sm:text-[24px] text-[#1A1A1E]">
            {getFilterLabel(selectedFilter)}
          </h2>
          <span className="text-xs text-[#6B6B75] font-medium">
            {events.length} {events.length === 1 ? "event" : "events"}
          </span>
        </div>
      </div>

      {/* Scrollable Events Feed */}
      <div
        key={`${selectedFilter}-${selectedCategory}-${searchQuery}`}
        className="flex-1 overflow-y-auto px-4 sm:p-5 pt-2 pb-8 space-y-3.5 custom-scrollbar"
      >
        {/* Loading State Skeleton Cards */}
        {loading && (
          <div className="space-y-3.5">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-white rounded-[12px] border border-[#ECEAE4] p-4 flex flex-col sm:flex-row gap-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
              >
                <div className="w-full sm:w-36 h-32 rounded-lg skeleton-shimmer shrink-0" />
                <div className="flex-1 space-y-3 py-1">
                  <div className="flex justify-between">
                    <div className="h-4 w-28 rounded skeleton-shimmer" />
                    <div className="h-4 w-16 rounded-full skeleton-shimmer" />
                  </div>
                  <div className="h-6 w-3/4 rounded skeleton-shimmer" />
                  <div className="h-4 w-1/2 rounded skeleton-shimmer" />
                  <div className="flex justify-between items-center pt-2">
                    <div className="h-4 w-16 rounded skeleton-shimmer" />
                    <div className="h-8 w-24 rounded-[8px] skeleton-shimmer" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="p-6 bg-white border border-[#ECEAE4] rounded-[12px] text-center my-6 shadow-card">
            <div className="w-10 h-10 mx-auto rounded-full bg-[#FAF9F6] border border-[#ECEAE4] flex items-center justify-center text-[#C4622D] mb-3">
              ⚠️
            </div>
            <h3 className="font-display font-semibold text-base text-[#1A1A1E]">
              Unable to load live events
            </h3>
            <p className="text-xs text-[#6B6B75] mt-1 max-w-sm mx-auto">
              {error}
            </p>
          </div>
        )}

        {/* Empty State: Warm Fraunces Editorial Design */}
        {!loading && !error && events.length === 0 && (
          <div className="py-14 px-6 text-center bg-white rounded-[12px] border border-[#ECEAE4] shadow-card my-4">
            <div className="w-12 h-12 mx-auto mb-3.5 rounded-full bg-[#FAF9F6] border border-[#ECEAE4] flex items-center justify-center text-[#C4622D]">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h3 className="font-display font-semibold text-lg sm:text-xl text-[#1A1A1E] leading-snug">
              Nothing on for this filter — try &ldquo;All Upcoming&rdquo;
            </h3>
            <p className="text-xs text-[#6B6B75] max-w-xs mx-auto mt-2 mb-4">
              We couldn’t find any events matching your selected timeframe or category filters.
            </p>
            {onResetFilters && (
              <button
                type="button"
                onClick={onResetFilters}
                className="px-4 py-2 text-xs font-semibold bg-[#C4622D] hover:bg-[#B05423] text-white rounded-[8px] shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-[#C4622D] focus-visible:outline-none"
              >
                Show All Upcoming Events
              </button>
            )}
          </div>
        )}

        {/* Event Cards */}
        {!loading &&
          !error &&
          events.map((event) => {
            const eventKey = event.id || event.event_name;
            return (
              <EventCard
                key={eventKey}
                event={event}
                isSelected={selectedEventId === eventKey}
                isHovered={hoveredEventId === eventKey}
                onSelectEvent={onSelectEvent}
                onHoverEvent={onHoverEvent}
                onLeaveEvent={onLeaveEvent}
              />
            );
          })}
      </div>
    </div>
  );
}
