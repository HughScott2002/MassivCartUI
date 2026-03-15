"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import type { RefObject } from "react";
import { useTheme } from "next-themes";
import { useQuery } from "@tanstack/react-query";
import Map, { Marker } from "react-map-gl/mapbox";
import type { MapRef } from "react-map-gl/mapbox";
import { Store, Pill, Package, Hammer, Fuel, MapPin } from "lucide-react";
import "mapbox-gl/dist/mapbox-gl.css";
import { type POI, type POICategory } from "@/lib/poi-provider";

const KINGSTON_LNG = -76.7936;
const KINGSTON_LAT = 17.997;
const MIN_ZOOM_FOR_PINS = 13;
const AT_LOCATION_THRESHOLD = 0.001;
const LOCATION_CONSENT_KEY = "massivcart-location-consent";

const CATEGORY_ICON: Record<POICategory, React.ReactNode> = {
  grocery:   <Store className="w-3.5 h-3.5 text-white" />,
  pharmacy:  <Pill className="w-3.5 h-3.5 text-white" />,
  wholesale: <Package className="w-3.5 h-3.5 text-white" />,
  hardware:  <Hammer className="w-3.5 h-3.5 text-white" />,
  fuel:      <Fuel className="w-3.5 h-3.5 text-white" />,
};

const CATEGORY_COLOR: Record<POICategory, string> = {
  grocery:   "bg-emerald-600",
  pharmacy:  "bg-blue-600",
  wholesale: "bg-orange-600",
  hardware:  "bg-yellow-600",
  fuel:      "bg-red-500",
};

interface Bounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

interface MapBackgroundProps {
  selectedStoreId: string | null;
  onStoreSelect: (store: POI | null) => void;
  activeCategory: string;
  locateRef: RefObject<(() => void) | null>;
  flyToRef: RefObject<((lng: number, lat: number) => void) | null>;
  onAtLocationChange: (at: boolean) => void;
  onLocationChange: (loc: { lat: number; lng: number } | null) => void;
}

export function MapBackground({
  selectedStoreId,
  onStoreSelect,
  activeCategory,
  locateRef,
  flyToRef,
  onAtLocationChange,
  onLocationChange,
}: MapBackgroundProps) {
  const mapRef = useRef<MapRef>(null);
  const moveFrameRef = useRef(0);
  const { resolvedTheme } = useTheme();
  const mapStyle = resolvedTheme === "dark"
    ? "mapbox://styles/mapbox/dark-v11"
    : "mapbox://styles/mapbox/streets-v12";

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [zoom, setZoom] = useState(13);
  const [bounds, setBounds] = useState<Bounds | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: KINGSTON_LAT, lng: KINGSTON_LNG });
  const [showPermissionPopup, setShowPermissionPopup] = useState(false);
  const [permissionChecked, setPermissionChecked] = useState(false);

  const updateBounds = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;
    const b = map.getBounds();
    if (!b) return;
    setBounds({
      minLat: b.getSouth(),
      maxLat: b.getNorth(),
      minLng: b.getWest(),
      maxLng: b.getEast(),
    });
    const c = map.getCenter();
    setMapCenter({ lat: c.lat, lng: c.lng });
  }, []);

  const flyToImpl = useCallback((lng: number, lat: number) => {
    mapRef.current?.flyTo({ center: [lng, lat], zoom: 15, duration: 1800 });
    onLocationChange({ lat, lng });
    onAtLocationChange(true);
  }, [onLocationChange, onAtLocationChange]);

  const locateImpl = useCallback(() => {
    if (!navigator.geolocation) {
      onAtLocationChange(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(coords);
        onLocationChange(coords);
        onAtLocationChange(true);
        flyToImpl(coords.lng, coords.lat);
      },
      () => onAtLocationChange(false),
    );
  }, [flyToImpl, onLocationChange, onAtLocationChange]);

  const handleAllow = useCallback(() => {
    setShowPermissionPopup(false);
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.setItem(LOCATION_CONSENT_KEY, "granted");
    }
    locateImpl();
  }, [locateImpl]);

  const handleDeny = useCallback(() => {
    setShowPermissionPopup(false);
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.setItem(LOCATION_CONSENT_KEY, "denied");
    }
    onAtLocationChange(false);
  }, [onAtLocationChange]);

  // Wire refs for parent
  useEffect(() => {
    const mutable = locateRef as React.MutableRefObject<(() => void) | null>;
    mutable.current = locateImpl;
    return () => { mutable.current = null; };
  }, [locateRef, locateImpl]);

  useEffect(() => {
    const mutable = flyToRef as React.MutableRefObject<((lng: number, lat: number) => void) | null>;
    mutable.current = flyToImpl;
    return () => { mutable.current = null; };
  }, [flyToRef, flyToImpl]);

  // Consent check on mount
  useEffect(() => {
    if (permissionChecked) return;
    setPermissionChecked(true);

    const consent = typeof sessionStorage !== "undefined"
      ? sessionStorage.getItem(LOCATION_CONSENT_KEY)
      : null;

    if (consent === "granted") {
      locateImpl();
      return;
    }
    if (consent === "denied") {
      onAtLocationChange(false);
      return;
    }

    setShowPermissionPopup(true);
  }, [permissionChecked, locateImpl, onAtLocationChange]);

  // Fetch POIs via React Query
  const { data: allPois = [] } = useQuery<POI[]>({
    queryKey: ["pois"],
    queryFn: () => fetch("/api/pois").then((r) => r.json()),
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const centerLat = userLocation?.lat ?? KINGSTON_LAT;
  const centerLng = userLocation?.lng ?? KINGSTON_LNG;

  const isAtUserLocation =
    userLocation != null &&
    Math.abs(mapCenter.lat - userLocation.lat) < AT_LOCATION_THRESHOLD &&
    Math.abs(mapCenter.lng - userLocation.lng) < AT_LOCATION_THRESHOLD;

  useEffect(() => {
    onAtLocationChange(isAtUserLocation);
  }, [isAtUserLocation, onAtLocationChange]);

  const visiblePois =
    zoom < MIN_ZOOM_FOR_PINS || !bounds
      ? []
      : allPois.filter((p) => {
          if (activeCategory !== "all" && p.category !== activeCategory)
            return false;
          return (
            p.lat >= bounds.minLat &&
            p.lat <= bounds.maxLat &&
            p.lng >= bounds.minLng &&
            p.lng <= bounds.maxLng
          );
        });

  return (
    <>
      <Map
        ref={mapRef}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        initialViewState={{
          longitude: centerLng,
          latitude: centerLat,
          zoom: 13,
        }}
        onLoad={updateBounds}
        onMove={(e) => {
          moveFrameRef.current++;
          if (moveFrameRef.current % 30 === 0)
            setMapCenter({
              lat: e.viewState.latitude,
              lng: e.viewState.longitude,
            });
        }}
        onMoveEnd={updateBounds}
        onZoom={(e) => setZoom(e.viewState.zoom)}
        style={{ width: "100%", height: "100%" }}
        mapStyle={mapStyle}
      >
        {visiblePois.map((poi) => {
          const isSelected = poi.id === selectedStoreId;
          const color = CATEGORY_COLOR[poi.category];
          return (
            <Marker
              key={poi.id}
              longitude={poi.lng}
              latitude={poi.lat}
              anchor="bottom"
              onClick={() => onStoreSelect(poi)}
            >
              <div className="relative flex flex-col items-center cursor-pointer group">
                {(zoom >= 15 || isSelected) && (
                  <div
                    className={`mb-1 whitespace-nowrap px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-tight shadow-sm ${isSelected ? "bg-primary text-primary-foreground" : "bg-white/70 text-primary backdrop-blur-md"}`}
                  >
                    {poi.name}
                  </div>
                )}
                <div
                  className={`relative flex items-center justify-center rounded-full transition-all duration-300 ${color} ${isSelected ? "w-9 h-9 shadow-[0_0_20px_rgba(255,255,255,0.4)]" : "w-6 h-6 group-hover:scale-110"}`}
                >
                  {CATEGORY_ICON[poi.category]}
                  {isSelected && (
                    <>
                      <div className={`absolute inset-0 rounded-full ${color} animate-ping opacity-30`} />
                      <div className="absolute -inset-2 rounded-full border-2 border-white/30 animate-pulse" />
                    </>
                  )}
                </div>
              </div>
            </Marker>
          );
        })}

        {/* User location dot */}
        <Marker longitude={centerLng} latitude={centerLat} anchor="center">
          <div className="relative w-4 h-4">
            <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg" />
            <div
              className="absolute inset-0 rounded-full bg-blue-500 opacity-40"
              style={{ animation: "ping 1s cubic-bezier(0,0,0.2,1) 3" }}
            />
          </div>
        </Marker>
      </Map>

      {showPermissionPopup && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]"
            role="presentation"
          />
          <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4">
            <div className="w-full max-w-sm rounded-2xl bg-card border border-border shadow-2xl p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-primary/20">
                  <MapPin className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Use your location?
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                We need your location to show nearby stores and optimize your shopping route.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleDeny}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-border text-foreground font-medium hover:bg-muted transition-colors"
                >
                  Deny
                </button>
                <button
                  type="button"
                  onClick={handleAllow}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                >
                  Allow
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
