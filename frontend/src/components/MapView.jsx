import { useEffect, useRef, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getCategoryStyle, CATEGORY_COLORS } from "../lib/categories";

// Mumbai center coordinates
const MUMBAI_CENTER = [19.076, 72.8777];
const DEFAULT_ZOOM = 12;

function createCustomPinIcon(category, isSelected = false, isHovered = false) {
  const catStyle = getCategoryStyle(category);
  const color = catStyle.hex;
  const size = isSelected || isHovered ? 28 : 22;

  // Circular clean pin matching category color with smooth glow ring on hover/selection
  const html = `
    <div class="custom-map-pin ${isSelected ? "pin-active" : ""} ${isHovered ? "pin-hovered" : ""}" 
         style="
           width: ${size}px; 
           height: ${size}px; 
           background-color: ${color}; 
           border: 2.5px solid #FFFFFF; 
           border-radius: 9999px; 
           box-shadow: ${
             isSelected || isHovered
               ? `0 0 0 5px ${catStyle.glow}, 0 4px 12px rgba(0,0,0,0.2)`
               : `0 2px 8px rgba(0,0,0,0.18)`
           }; 
           display: flex; 
           align-items: center; 
           justify-content: center;
           cursor: pointer;
           transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
         ">
      <div style="width: 6px; height: 6px; border-radius: 9999px; background: #FFFFFF;"></div>
    </div>
  `;

  return L.divIcon({
    html: html,
    className: "leaflet-custom-pin-wrapper",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2 - 6],
  });
}

export default function MapView({
  events = [],
  selectedEvent = null,
  hoveredEventId = null,
  onSelectEvent,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersGroupRef = useRef(null);
  const markerMapRef = useRef(new Map());

  // Filter out events with null or invalid coordinates
  const validMapEvents = useMemo(() => {
    return events.filter((e) => {
      if (
        e.lat === null ||
        e.lat === undefined ||
        e.lng === null ||
        e.lng === undefined
      ) {
        return false;
      }
      const latNum = parseFloat(e.lat);
      const lngNum = parseFloat(e.lng);
      return !isNaN(latNum) && !isNaN(lngNum);
    });
  }, [events]);

  // Initialize Leaflet Map once with CartoDB Positron light basemap
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: MUMBAI_CENTER,
        zoom: DEFAULT_ZOOM,
        zoomControl: false,
        attributionControl: true,
        fadeAnimation: false,
      });

      // CartoDB Positron light tile layer (clean light map style)
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
          maxZoom: 19,
          subdomains: "abcd",
        }
      ).addTo(map);

      // Light Zoom Controls on top right
      L.control.zoom({ position: "topright" }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersGroupRef.current = markersGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers whenever validMapEvents, selection, or hover changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup) return;

    // Clear previous markers
    markersGroup.clearLayers();
    markerMapRef.current.clear();

    validMapEvents.forEach((event) => {
      const lat = parseFloat(event.lat);
      const lng = parseFloat(event.lng);
      const eventKey = event.id || event.event_name;

      const isSelected =
        selectedEvent &&
        (selectedEvent.id === event.id ||
          selectedEvent.event_name === event.event_name);
      const isHovered = hoveredEventId === eventKey;

      const icon = createCustomPinIcon(event.category, isSelected, isHovered);
      const marker = L.marker([lat, lng], { icon, zIndexOffset: isSelected || isHovered ? 1000 : 0 });

      const catStyle = getCategoryStyle(event.category);
      const hasTicketLink =
        typeof event.ticket_link === "string" &&
        event.ticket_link.trim().length > 0 &&
        event.ticket_link.trim() !== "#";

      // Light Warm Airbnb-Style Popup Template
      const popupContent = `
        <div style="font-family: 'Inter', system-ui, sans-serif; color: #1A1A1E; min-width: 220px; max-width: 260px; padding: 2px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 8px; padding-right: 16px;">
            <span style="
              font-size: 11px; 
              font-weight: 600; 
              background-color: ${catStyle.bgTint}; 
              color: ${catStyle.text}; 
              border: 1px solid ${catStyle.border}; 
              padding: 2px 8px; 
              border-radius: 9999px;
            ">
              ${event.category || "Event"}
            </span>
            <span style="font-size: 11px; color: #6B6B75; font-weight: 500;">
              ${event.event_date || ""}
            </span>
          </div>
          <h4 style="font-family: 'Fraunces', Georgia, serif; font-size: 15px; font-weight: 600; color: #1A1A1E; margin: 0 0 4px 0; line-height: 1.3;">
            ${event.event_name}
          </h4>
          <p style="font-size: 12px; color: #6B6B75; margin: 0 0 8px 0; display: flex; align-items: center; gap: 4px;">
            <span style="color: #C4622D;">📍</span> ${event.venue_name}
          </p>
          ${
            hasTicketLink
              ? `<a href="${event.ticket_link}" target="_blank" rel="noopener noreferrer" style="display: block; width: 100%; text-align: center; background-color: #C4622D; color: #FFFFFF; padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 600; text-decoration: none; box-shadow: 0 1px 4px rgba(196,98,45,0.25);">
                  Get tickets →
                </a>`
              : `<div style="display: block; width: 100%; text-align: center; background-color: #F4F2EB; color: #9E9EA7; padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 500; border: 1px solid #ECEAE4;">
                  Tickets TBA
                </div>`
          }
        </div>
      `;

      marker.bindPopup(popupContent, {
        className: "custom-light-popup",
        closeButton: true,
      });

      marker.on("click", () => {
        if (onSelectEvent) {
          onSelectEvent(event);
        }
      });

      marker.addTo(markersGroup);
      markerMapRef.current.set(eventKey, marker);
    });

    // Auto-center or highlight selected event smoothly
    if (
      selectedEvent &&
      selectedEvent.lat !== null &&
      selectedEvent.lat !== undefined &&
      selectedEvent.lng !== null &&
      selectedEvent.lng !== undefined &&
      !isNaN(parseFloat(selectedEvent.lat)) &&
      !isNaN(parseFloat(selectedEvent.lng))
    ) {
      const sLat = parseFloat(selectedEvent.lat);
      const sLng = parseFloat(selectedEvent.lng);
      map.flyTo([sLat, sLng], 14, {
        duration: 0.8,
      });
      const marker = markerMapRef.current.get(
        selectedEvent.id || selectedEvent.event_name
      );
      if (marker) {
        marker.openPopup();
      }
    }
  }, [validMapEvents, selectedEvent, hoveredEventId, onSelectEvent]);

  // Recenter to Mumbai
  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(MUMBAI_CENTER, DEFAULT_ZOOM, {
        duration: 1,
      });
    }
  };

  return (
    <div className="relative w-full h-full min-h-[350px] bg-[#FAF9F6] overflow-hidden">
      {/* Leaflet Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Left Floating Indicator */}
      <div className="absolute top-4 left-4 z-[400] flex items-center gap-2 bg-white/95 backdrop-blur-md border border-[#ECEAE4] rounded-full px-3.5 py-1.5 shadow-sm">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C4622D] opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C4622D]" />
        </span>
        <span className="text-xs font-semibold text-[#1A1A1E]">
          Mumbai Live Map
        </span>
        <span className="text-[#ECEAE4]">|</span>
        <span className="text-xs font-medium text-[#6B6B75]">
          {validMapEvents.length} pins
        </span>
      </div>

      {/* Bottom Left: Recenter button */}
      <div className="absolute bottom-4 left-4 z-[400]">
        <button
          type="button"
          onClick={handleRecenter}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/95 hover:bg-white text-xs font-medium text-[#1A1A1E] rounded-full border border-[#ECEAE4] backdrop-blur-md shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-[#C4622D] focus-visible:outline-none select-none"
          title="Recenter map to Mumbai"
        >
          <svg
            className="w-3.5 h-3.5 text-[#C4622D]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
            />
          </svg>
          <span>Recenter Mumbai</span>
        </button>
      </div>

      {/* Bottom Right: Category Legend */}
      <div className="hidden sm:flex absolute bottom-4 right-4 z-[400] items-center gap-3 px-3 py-1.5 bg-white/95 border border-[#ECEAE4] rounded-full backdrop-blur-md text-[11px] text-[#6B6B75] shadow-sm">
        {Object.entries(CATEGORY_COLORS).map(([catName, style]) => (
          <div key={catName} className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: style.hex }}
            />
            <span className="font-medium">{catName}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
