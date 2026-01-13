"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { BARANGAY_MARKERS } from "@/lib/constants"

// Fix for default marker icons in Leaflet with Next.js
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

// Barangay marker icon (violet/purple)
const barangayIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

// Selected location marker (green)
const selectedIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

L.Marker.prototype.options.icon = defaultIcon

interface LeafletMapProps {
  center: [number, number]
  position: [number, number] | null
  tileLayer: {
    url: string
    attribution: string
    name: string
  }
  readonly: boolean
  onLocationChange: (lat: number, lng: number) => void
  showBarangayMarkers?: boolean
}

// Component to handle map click events
function LocationMarker({ 
  position, 
  onLocationChange, 
  readonly 
}: { 
  position: [number, number] | null
  onLocationChange: (lat: number, lng: number) => void
  readonly: boolean
}) {
  useMapEvents({
    click(e) {
      if (!readonly) {
        onLocationChange(e.latlng.lat, e.latlng.lng)
      }
    },
  })

  return position === null ? null : (
    <Marker position={position} icon={selectedIcon}>
      <Popup>
        <div className="text-sm">
          <strong className="text-green-600">📍 Selected Location</strong><br />
          Lat: {position[0].toFixed(6)}<br />
          Lng: {position[1].toFixed(6)}
        </div>
      </Popup>
    </Marker>
  )
}

// Component to update map view when center changes
function MapUpdater({ center, zoom }: { center: [number, number]; zoom?: number }) {
  const map = useMap()
  
  useEffect(() => {
    map.setView(center, zoom || map.getZoom(), { animate: true })
  }, [center[0], center[1], zoom, map])
  
  return null
}

export default function LeafletMap({
  center,
  position,
  tileLayer,
  readonly,
  onLocationChange,
  showBarangayMarkers = true
}: LeafletMapProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="h-full w-full bg-muted flex items-center justify-center">
        <div className="text-muted-foreground">Loading map...</div>
      </div>
    )
  }

  return (
    <MapContainer
      center={center}
      zoom={12}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%" }}
      className="z-0"
    >
      <TileLayer
        attribution={tileLayer.attribution}
        url={tileLayer.url}
      />
      <MapUpdater center={position || center} />
      
      {/* Barangay Markers */}
      {showBarangayMarkers && BARANGAY_MARKERS.map((brgy) => (
        <Marker
          key={`brgy-${brgy.name}`}
          position={[brgy.lat, brgy.lng]}
          icon={barangayIcon}
        >
          <Popup>
            <div className="min-w-[120px]">
              <h3 className="font-semibold text-violet-700">📍 {brgy.name}</h3>
              <p className="text-xs text-gray-500">Barangay, Midsalip</p>
              <p className="text-xs text-gray-400 mt-1">
                {brgy.lat.toFixed(4)}, {brgy.lng.toFixed(4)}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
      
      {/* Selected Location Marker */}
      <LocationMarker 
        position={position} 
        onLocationChange={onLocationChange}
        readonly={readonly}
      />
      
      {/* Legend */}
      <div className="leaflet-bottom leaflet-left">
        <div className="leaflet-control bg-white p-2 rounded shadow-lg m-2 text-xs">
          <p className="font-semibold mb-1">Legend:</p>
          <div className="flex items-center gap-1 mb-0.5">
            <span className="w-3 h-3 rounded-full bg-violet-500"></span>
            <span>Barangay</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-green-500"></span>
            <span>Selected Location</span>
          </div>
        </div>
      </div>
    </MapContainer>
  )
}
