"use client";

import { useEffect, useCallback, useState } from "react";
import type { RefObject } from "react";
import type { POI } from "@/lib/poi-provider";
import { MapPin } from "lucide-react";

const LOCATION_CONSENT_KEY = "massivcart-location-consent";

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
  const [showPermissionPopup, setShowPermissionPopup] = useState(false);
  const [permissionChecked, setPermissionChecked] = useState(false);

  const locateImpl = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          onLocationChange({ lat, lng });
          onAtLocationChange(true);
          flyToRef.current?.(lng, lat);
        },
        () => onAtLocationChange(false),
      );
    } else {
      onAtLocationChange(false);
    }
  }, [flyToRef, onLocationChange, onAtLocationChange]);

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

  const flyToImpl = useCallback(
    (lng: number, lat: number) => {
      onLocationChange({ lat, lng });
      onAtLocationChange(true);
    },
    [onLocationChange, onAtLocationChange],
  );

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
      <div
        className="absolute inset-0 bg-gray-200"
        role="img"
        aria-label="Map background placeholder"
      >
        <div className="flex h-full items-center justify-center text-gray-500">
          Map placeholder (integrate Mapbox/Google Maps)
        </div>
      </div>

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
