"use client";

import { useEffect, useState } from "react";
import {
  GoogleMap,
  HeatmapLayer,
  Marker,
  Circle,
} from "@react-google-maps/api";
import {
  Card,
  CardHeader,
  CardBody,
  Spinner,
  addToast,
} from "@heroui/react";
import { RiderAnalyticsService } from "@/services/riderAnalyticsService";

const mapContainerStyle = {
  width: "100%",
  height: "400px",
};

const defaultCenter = {
  lat: 14.5995,
  lng: 120.9842, // Manila
};

export default function TopZonesMapHeatmap() {
  const [heatmapData, setHeatmapData] = useState<google.maps.LatLng[]>([]);
  const [zoneMeta, setZoneMeta] = useState<any[]>([]);
  const [riderLocation, setRiderLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [loading, setLoading] = useState(true);

  const geocode = async (address: string): Promise<google.maps.LatLng | null> => {
    return new Promise((resolve) => {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address }, (results, status) => {
        if (status === "OK" && results && results[0]) {
          const loc = results[0].geometry.location;
          resolve(new google.maps.LatLng(loc.lat(), loc.lng()));
        } else {
          resolve(null);
        }
      });
    });
  };

  const fetchTopZones = async () => {
    try {
      const res = await RiderAnalyticsService.getTopZones();
      setZoneMeta(res.data);

      const geocoded = await Promise.all(
        res.data.map(async (zone: any) => await geocode(zone.zone))
      );
      const validPoints = geocoded.filter((p): p is google.maps.LatLng => !!p);
      setHeatmapData(validPoints);
    } catch (error) {
      addToast({
        title: "❌ Error",
        description: "Failed to load delivery heatmap.",
        color: "danger",
      });
    }
  };

  const initRiderLocation = async () => {
    const savedLocation = localStorage.getItem("rider_location");
    if (savedLocation) {
      const { lat, lng } = JSON.parse(savedLocation);
      setRiderLocation({ lat, lng });
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setRiderLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      });
    }
  };

  useEffect(() => {
    const init = async () => {
      await initRiderLocation();
      await fetchTopZones();
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    const listener = () => fetchTopZones();
    window.addEventListener("locationUpdated", listener);
    return () => window.removeEventListener("locationUpdated", listener);
  }, []);

  return (
    <Card className="shadow-lg border rounded-2xl overflow-hidden">
      <CardHeader className="bg-primary text-white px-4 py-3 text-base font-semibold">
        📍 Your Area Hot Zones
      </CardHeader>

      <CardBody className="p-4">
        {loading ? (
          <div className="text-center py-8">
            <Spinner />
          </div>
        ) : (
          <>
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              zoom={13}
              center={riderLocation || defaultCenter}
            >
              {riderLocation && (
                <>   <Circle
                center={riderLocation}
                radius={3000}
                options={{
                  strokeColor: "#60A5FA",
                  strokeOpacity: 0.8,
                  strokeWeight: 2,
                  fillColor: "#BFDBFE",
                  fillOpacity: 0.15,
                }}
              />
                  <Marker position={riderLocation} />
               
                </>
              )}
              {heatmapData.length > 0 && (
                <HeatmapLayer data={heatmapData} options={{ radius: 40 }} />
              )}
            </GoogleMap>

            {/* 📝 Text Info */}
            <div className="mt-4 text-sm text-gray-700 space-y-1">
              <p className="font-medium text-gray-800">🔥 Top Delivery Spots</p>
              <ul className="list-disc list-inside text-xs text-gray-600">
                {zoneMeta.length === 0 ? (
                  <li>No recent delivery zones nearby.</li>
                ) : (
                  zoneMeta.slice(0, 3).map((zone: any, i: number) => (
                    <li key={i} className="truncate">{zone.zone}</li>
                  ))
                )}
              </ul>
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
}
