import { useState, useEffect, useMemo } from "react";
import { supabase } from "./lib/supabase";
import EventList from "./components/EventList";
import MapView from "./components/MapView";
import { SegmentedDateFilter } from "./components/DateFilter";
import fallbackEventsData from "./data/fake-events.json";

export default function App() {
  const [events, setEvents] = useState(() => fallbackEventsData || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filter States
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEventId, setSelectedEventId] = useState(
    () => fallbackEventsData?.[0]?.id || fallbackEventsData?.[0]?.event_name || null
  );
  const [hoveredEventId, setHoveredEventId] = useState(null);

  // Mobile View Toggle for tablet (480px - 1024px)
  const [mobileTab, setMobileTab] = useState("list");

  // Fetch events on mount
  useEffect(() => {
    let ignore = false;

    async function loadData() {
      try {
        const { data, error: dbError } = await supabase
          .from("events")
          .select("*")
          .order("event_date", { ascending: true });

        if (ignore) return;

        if (dbError) throw new Error(dbError.message);

        if (data && data.length > 0) {
          const sorted = [...data].sort(
            (a, b) => new Date(a.event_date) - new Date(b.event_date)
          );
          setEvents(sorted);
          setSelectedEventId(sorted[0].id || sorted[0].event_name);
        }
      } catch (err) {
        if (ignore) return;
        console.warn("Supabase fetch notice:", err.message);
        setError(err.message);
      }
    }

    loadData();

    return () => {
      ignore = true;
    };
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: dbError } = await supabase
        .from("events")
        .select("*")
        .order("event_date", { ascending: true });

      if (dbError) throw new Error(dbError.message);

      if (data && data.length > 0) {
        const sorted = [...data].sort(
          (a, b) => new Date(a.event_date) - new Date(b.event_date)
        );
        setEvents(sorted);
        setSelectedEventId(sorted[0].id || sorted[0].event_name);
      }
    } catch (err) {
      console.warn("Supabase refresh notice:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Compute Unique Categories (Comedy, Theatre, Music, Literature, Visual Art)
  const categories = useMemo(() => {
    const defaultCats = ["Comedy", "Theatre", "Music", "Literature", "Visual Art"];
    const foundCats = new Set(events.map((e) => e.category).filter(Boolean));
    const merged = Array.from(new Set([...defaultCats, ...Array.from(foundCats)]));
    return ["All", ...merged];
  }, [events]);

  // Filtered Events with date parsing and search match
  const filteredEvents = useMemo(() => {
    return events
      .filter((event) => {
        // 1. Search Query Match
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName = event.event_name?.toLowerCase().includes(q);
          const matchesVenue = event.venue_name?.toLowerCase().includes(q);
          const matchesDesc = event.description?.toLowerCase().includes(q);
          const matchesCat = event.category?.toLowerCase().includes(q);
          if (!matchesName && !matchesVenue && !matchesDesc && !matchesCat) {
            return false;
          }
        }

        // 2. Category Filter
        if (selectedCategory !== "All") {
          const cat = event.category || "";
          if (cat.toLowerCase() !== selectedCategory.toLowerCase()) {
            // Handle Art <-> Visual Art
            if (
              !(
                selectedCategory === "Visual Art" &&
                (cat === "Art" || cat === "Visual Art")
              )
            ) {
              return false;
            }
          }
        }

        // 3. Date Filter (Today, Tomorrow, This Weekend, All Upcoming)
        if (selectedFilter === "today") {
          const now = new Date();
          const parts = (event.event_date || "").split("-").map(Number);
          if (parts.length < 3) return false;
          return (
            parts[0] === now.getFullYear() &&
            parts[1] === now.getMonth() + 1 &&
            parts[2] === now.getDate()
          );
        }

        if (selectedFilter === "tomorrow") {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          const parts = (event.event_date || "").split("-").map(Number);
          if (parts.length < 3) return false;
          return (
            parts[0] === tomorrow.getFullYear() &&
            parts[1] === tomorrow.getMonth() + 1 &&
            parts[2] === tomorrow.getDate()
          );
        }

        if (selectedFilter === "weekend") {
          if (!event.event_date) return false;
          const parts = event.event_date.split("-").map(Number);
          if (parts.length < 3) return false;
          const eventDate = new Date(parts[0], parts[1] - 1, parts[2]);

          const now = new Date();
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const currentDay = today.getDay(); // 0 = Sun, 5 = Fri, 6 = Sat

          let friday = new Date(today);
          if (currentDay === 6) friday.setDate(today.getDate() - 1);
          else if (currentDay === 0) friday.setDate(today.getDate() - 2);
          else if (currentDay !== 5) friday.setDate(today.getDate() + (5 - currentDay));

          const sunday = new Date(friday);
          sunday.setDate(friday.getDate() + 2);
          sunday.setHours(23, 59, 59, 999);
          friday.setHours(0, 0, 0, 0);

          const inThisWeekend = eventDate >= friday && eventDate <= sunday;
          const dayOfWeek = eventDate.getDay();
          const isWeekendDay = dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6;

          return inThisWeekend || isWeekendDay;
        }

        // "all" = All Upcoming
        return true;
      })
      .sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
  }, [events, searchQuery, selectedCategory, selectedFilter]);

  // Currently Selected Event Object for Map Highlighting
  const selectedEvent = useMemo(() => {
    return (
      events.find(
        (e) => (e.id || e.event_name) === selectedEventId
      ) || null
    );
  }, [events, selectedEventId]);

  const handleSelectEvent = (event) => {
    setSelectedEventId(event.id || event.event_name);
  };

  const handleResetFilters = () => {
    setSelectedFilter("all");
    setSelectedCategory("All");
    setSearchQuery("");
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#FAF9F6] text-[#1A1A1E] overflow-hidden font-sans selection:bg-[#C4622D] selection:text-white">
      {/* ── Top Navigation Bar ──────────────────────────────── */}
      <header className="h-16 px-4 sm:px-6 bg-white/90 border-b border-[#ECEAE4] backdrop-blur-md flex items-center justify-between shrink-0 z-20">
        {/* Left: Brand Wordmark in Fraunces bold */}
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="flex items-center gap-2 text-inherit no-underline focus-visible:ring-2 focus-visible:ring-[#C4622D] focus-visible:outline-none rounded-lg"
          >
            <span className="font-display font-bold text-xl sm:text-2xl tracking-tight text-[#1A1A1E]">
              EXTRACTLY
            </span>
          </a>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#FAF9F6] text-[#6B6B75] border border-[#ECEAE4]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C4622D]" />
            Mumbai
          </span>
        </div>

        {/* Center / Right: Segmented Date Filter Pills */}
        <div className="hidden md:flex items-center">
          <SegmentedDateFilter
            selectedFilter={selectedFilter}
            onSelectFilter={setSelectedFilter}
          />
        </div>

        {/* Right Header items */}
        <div className="flex items-center gap-3">
          {/* Refresh Button */}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 bg-white hover:bg-[#FAF9F6] border border-[#ECEAE4] text-[#6B6B75] hover:text-[#1A1A1E] rounded-full transition-all focus-visible:ring-2 focus-visible:ring-[#C4622D] focus-visible:outline-none"
            title="Refresh events"
            aria-label="Refresh events"
          >
            <svg
              className={`w-4 h-4 ${loading ? "animate-spin text-[#C4622D]" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>

          {/* Tablet Tab Switcher (between 480px and 1024px) */}
          <div className="hidden min-[480px]:flex lg:hidden bg-[#F4F2EB] border border-[#ECEAE4] p-0.5 rounded-full">
            <button
              type="button"
              onClick={() => setMobileTab("list")}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                mobileTab === "list"
                  ? "bg-white text-[#1A1A1E] shadow-sm"
                  : "text-[#6B6B75] hover:text-[#1A1A1E]"
              }`}
            >
              List ({filteredEvents.length})
            </button>
            <button
              type="button"
              onClick={() => setMobileTab("map")}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                mobileTab === "map"
                  ? "bg-white text-[#1A1A1E] shadow-sm"
                  : "text-[#6B6B75] hover:text-[#1A1A1E]"
              }`}
            >
              Map
            </button>
          </div>
        </div>
      </header>

      {/* Subheader Date Filter for Small Mobile Screens */}
      <div className="md:hidden px-4 py-2 bg-white/80 border-b border-[#ECEAE4] flex justify-center shrink-0">
        <SegmentedDateFilter
          selectedFilter={selectedFilter}
          onSelectFilter={setSelectedFilter}
        />
      </div>

      {/* ── Main Two-Panel Layout ───────────────────────────── */}
      {/* On desktop (lg): Left 35% List, Right 65% Map. */}
      {/* On screens < 480px: Map stacks above list (max-[480px]:flex-col). */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative max-[480px]:flex-col">
        {/* Left Side: Scrollable Events Feed (35% width on desktop) */}
        <section
          className={`w-full lg:w-[35%] h-full flex flex-col border-r border-[#ECEAE4] shrink-0 bg-[#FAF9F6] max-[480px]:order-2 max-[480px]:flex-1 ${
            mobileTab === "map" ? "hidden lg:flex max-[480px]:flex" : "flex"
          }`}
        >
          <EventList
            events={filteredEvents}
            allEvents={events}
            loading={loading}
            error={error}
            selectedEventId={selectedEventId}
            hoveredEventId={hoveredEventId}
            onSelectEvent={handleSelectEvent}
            onHoverEvent={setHoveredEventId}
            onLeaveEvent={() => setHoveredEventId(null)}
            selectedFilter={selectedFilter}
            onSelectFilter={setSelectedFilter}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            categories={categories}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onResetFilters={handleResetFilters}
          />
        </section>

        {/* Right Side: Leaflet Map (65% on desktop, stacked above list on screens < 480px) */}
        <section
          className={`w-full lg:w-[65%] h-full relative bg-[#FAF9F6] max-[480px]:order-1 max-[480px]:h-[260px] max-[480px]:shrink-0 max-[480px]:border-b max-[480px]:border-[#ECEAE4] ${
            mobileTab === "list" ? "hidden lg:block max-[480px]:block" : "block"
          }`}
        >
          <MapView
            events={filteredEvents}
            selectedEvent={selectedEvent}
            hoveredEventId={hoveredEventId}
            onSelectEvent={handleSelectEvent}
          />
        </section>
      </main>
    </div>
  );
}
