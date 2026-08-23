import { useState } from "react";
import { getCategoryStyle } from "../lib/categories";

function formatEventDate(dateStr) {
  if (!dateStr) return { weekday: "", day: "", month: "", full: "" };
  const d = new Date(dateStr + "T00:00:00");
  const weekday = d.toLocaleDateString("en-IN", { weekday: "short" });
  const day = d.getDate();
  const month = d.toLocaleDateString("en-IN", { month: "short" });
  return { weekday, day, month, full: `${weekday}, ${day} ${month}` };
}

function formatTime(timeStr) {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const display = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${display}:${m} ${ampm}`;
}

export default function EventCard({
  event,
  isSelected = false,
  isHovered = false,
  onSelectEvent,
  onHoverEvent,
  onLeaveEvent,
}) {
  const [imgError, setImgError] = useState(false);

  const catStyle = getCategoryStyle(event.category);
  const dateObj = formatEventDate(event.event_date);
  const timeFormatted = formatTime(event.event_time);

  // Check if coordinates exist and are valid
  const hasValidLocation =
    event.lat !== null &&
    event.lat !== undefined &&
    event.lng !== null &&
    event.lng !== undefined &&
    !isNaN(parseFloat(event.lat)) &&
    !isNaN(parseFloat(event.lng));

  // Check if ticket_link is present and non-empty
  const hasTicketLink =
    typeof event.ticket_link === "string" &&
    event.ticket_link.trim().length > 0 &&
    event.ticket_link.trim() !== "#";

  const eventKey = event.id || event.event_name;

  return (
    <article
      tabIndex={0}
      role="button"
      aria-label={`${event.event_name} at ${event.venue_name}`}
      onClick={() => {
        if (onSelectEvent) {
          onSelectEvent(event);
        }
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (onSelectEvent) onSelectEvent(event);
        }
      }}
      onMouseEnter={() => {
        if (onHoverEvent) onHoverEvent(eventKey);
      }}
      onMouseLeave={() => {
        if (onLeaveEvent) onLeaveEvent();
      }}
      className={`event-card group relative bg-white rounded-[12px] border border-[#ECEAE4] overflow-hidden transition-all duration-200 cursor-pointer ${
        isSelected
          ? "ring-2 ring-[#C4622D] shadow-[0_6px_20px_rgba(196,98,45,0.12)] -translate-y-0.5"
          : isHovered
          ? "shadow-[0_6px_20px_rgba(0,0,0,0.08)] -translate-y-0.5"
          : "shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
      }`}
      style={{
        borderLeft: `4px solid ${catStyle.hex}`,
      }}
    >
      <div className="flex flex-col sm:flex-row">
        {/* Thumbnail area if image present */}
        {event.image_url && !imgError && (
          <div className="relative sm:w-36 md:w-40 h-36 sm:h-auto shrink-0 overflow-hidden bg-[#F4F2EB]">
            <img
              src={event.image_url}
              alt=""
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={() => setImgError(true)}
              loading="lazy"
            />
            {/* Subtle date badge on image */}
            {dateObj.day && (
              <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-sm border border-[#ECEAE4] rounded-lg px-2 py-0.5 text-center shadow-sm">
                <span className="block text-[9px] uppercase font-bold tracking-wider text-[#C4622D] leading-tight">
                  {dateObj.month}
                </span>
                <span className="block text-sm font-bold text-[#1A1A1E] leading-none">
                  {dateObj.day}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Content Area */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
          <div>
            {/* Top row: Category Tag (top-right) & Time/Date */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5 text-xs text-[#6B6B75]">
                <svg
                  className="w-3.5 h-3.5 text-[#8E8E98] shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="font-medium">
                  {dateObj.full} {timeFormatted && `• ${timeFormatted}`}
                </span>
              </div>

              {/* Category Pill (top-right) */}
              <span
                style={{
                  backgroundColor: catStyle.bgTint,
                  color: catStyle.text,
                  borderColor: catStyle.border,
                }}
                className="inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-full border shrink-0"
              >
                {event.category || "Event"}
              </span>
            </div>

            {/* Event Title in Fraunces semibold */}
            <h3 className="font-display font-semibold text-[18px] sm:text-[19px] text-[#1A1A1E] leading-snug group-hover:text-[#C4622D] transition-colors line-clamp-2">
              {event.event_name}
            </h3>

            {/* Venue info in muted Inter */}
            <div className="mt-1.5 flex items-center gap-1.5 text-[13px] text-[#6B6B75]">
              <svg
                className="w-3.5 h-3.5 text-[#C4622D] shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="line-clamp-1 font-normal">{event.venue_name}</span>
            </div>

            {/* Event description snippet */}
            {event.description && (
              <p className="mt-2 text-xs text-[#6B6B75] line-clamp-2 leading-relaxed">
                {event.description}
              </p>
            )}
          </div>

          {/* Bottom Action Row */}
          <div className="pt-3.5 mt-3 border-t border-[#ECEAE4] flex items-center justify-between gap-3">
            {/* Price or location badge */}
            <div className="flex items-center gap-2">
              {event.price && (
                <span className="text-xs font-semibold text-[#1A1A1E] bg-[#F4F2EB] px-2 py-0.5 rounded-md border border-[#ECEAE4]">
                  {event.price}
                </span>
              )}
              {hasValidLocation ? (
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-[#6B6B75]">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: catStyle.hex }}
                  />
                  <span>On map</span>
                </span>
              ) : (
                <span className="text-[11px] text-[#9E9EA7]">No map pin</span>
              )}
            </div>

            {/* Ticket CTA Button: Terracotta #C4622D or Disabled Ghost 'Tickets TBA' */}
            <div>
              {hasTicketLink ? (
                <a
                  href={event.ticket_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[8px] text-xs font-semibold text-white bg-[#C4622D] hover:bg-[#B05423] shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-[#C4622D] focus-visible:outline-none"
                >
                  <span>Get tickets</span>
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center px-3 py-1.5 rounded-[8px] text-xs font-medium text-[#9E9EA7] bg-[#F4F2EB] border border-[#ECEAE4] cursor-not-allowed select-none"
                  title="Tickets TBA"
                >
                  Tickets TBA
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
