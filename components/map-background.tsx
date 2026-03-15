"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import type { RefObject } from "react";
import { useTheme } from "next-themes";
import Map, { Marker, NavigationControl } from "react-map-gl/mapbox";
import type { MapRef } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import type { POI } from "@/lib/poi-provider";
import { KINGSTON_STORES } from "@/lib/poi-provider";
import { MapPin } from "lucide-react";

const LOCATION_CONSENT_KEY = "massivcart-location-consent";

const INITIAL_VIEW = {
  longitude: -76.7936,
  latitude:  17.9970,
  zoom:      12,
};

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
  locateRef,
  flyToRef,
  onAtLocationChange,
  onLocationChange,
}: MapBackgroundProps) {
  const mapRef = useRef<MapRef>(null);
  const { resolvedTheme } = useTheme();
  const mapStyle = resolvedTheme === "dark"
    ? "mapbox://styles/mapbox/dark-v11"
    : "mapbox://styles/mapbox/standard";
  const [showPermissionPopup, setShowPermissionPopup] = useState(false);
  const [permissionChecked, setPermissionChecked] = useState(false);

  const flyToImpl = useCallback((lng: number, lat: number) => {
    mapRef.current?.flyTo({ center: [lng, lat], zoom: 15, duration: 1800 });
    onLocationChange({ lat, lng });
    onAtLocationChange(true);
  }, [onLocationChange, onAtLocationChange]);

  const locateImpl = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          onLocationChange({ lat, lng });
          onAtLocationChange(true);
          flyToImpl(lng, lat);
        },
        () => onAtLocationChange(false),
      );
    } else {
      onAtLocationChange(false);
    }
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

  return (
    <>
      <Map
        ref={mapRef}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        initialViewState={INITIAL_VIEW}
        style={{ width: "100%", height: "100%" }}
        mapStyle={mapStyle}
      >
        <NavigationControl position="bottom-right" />
        {KINGSTON_STORES.map((poi) => (
          <Marker
            key={poi.id}
            longitude={poi.lng}
            latitude={poi.lat}
            anchor="bottom"
          >
            <div className="w-3 h-3 rounded-full bg-primary border-2 border-white shadow-md cursor-pointer" />
          </Marker>
        ))}
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
