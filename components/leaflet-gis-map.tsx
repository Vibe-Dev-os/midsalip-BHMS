"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
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

// Custom icons for different statuses
const activeIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

const inactiveIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

const warningIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

// Barangay marker icon (blue/violet)
const barangayIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

L.Marker.prototype.options.icon = defaultIcon

interface BoardingHouse {
  id: string
  name: string
  latitude: number | null
  longitude: number | null
  barangay: string
  address: string
  isActive: boolean
  permitStatus: string
}

interface LeafletGISMapProps {
  center: [number, number]
  tileLayer: {
    url: string
    attribution: string
    name: string
  }
  boardingHouses: BoardingHouse[]
  showBarangayMarkers?: boolean
}

function getMarkerIcon(bh: BoardingHouse) {
  if (!bh.isActive) return inactiveIcon
  if (bh.permitStatus === "expired" || bh.permitStatus === "near-expiry") return warningIcon
  return activeIcon
}

// Component to handle map recentering when center prop changes
function MapRecenter({ center }: { center: [number, number] }) {
  const map = useMap()
  
  useEffect(() => {
    map.setView(center, map.getZoom())
  }, [center, map])
  
  return null
}

export default function LeafletGISMap({
  center,
  tileLayer,
  boardingHouses,
  showBarangayMarkers = true
}: LeafletGISMapProps) {
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
      <MapRecenter center={center} />
      <TileLayer
        attribution={tileLayer.attribution}
        url={tileLayer.url}
      />
      
      {/* Barangay Markers */}
      {showBarangayMarkers && BARANGAY_MARKERS.map((brgy) => (
        <Marker
          key={`brgy-${brgy.name}`}
          position={[brgy.lat, brgy.lng]}
          icon={barangayIcon}
        >
          <Popup>
            <div className="min-w-[150px]">
              <h3 className="font-semibold text-base text-violet-700">📍 {brgy.name}</h3>
              <p className="text-xs text-gray-500 mt-1">Barangay, Midsalip</p>
              <p className="text-xs text-gray-400 mt-1">
                {brgy.lat.toFixed(4)}, {brgy.lng.toFixed(4)}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
      
      {/* Boarding House Markers */}
      {boardingHouses.map((bh) => (
        <Marker
          key={bh.id}
          position={[Number(bh.latitude), Number(bh.longitude)]}
          icon={getMarkerIcon(bh)}
        >
          <Popup>
            <div className="min-w-[200px]">
              <h3 className="font-semibold text-base mb-1">{bh.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{bh.address}</p>
              <div className="space-y-1 text-xs">
                <p>
                  <span className="font-medium">Barangay:</span> {bh.barangay}
                </p>
                <p>
                  <span className="font-medium">Status:</span>{" "}
                  <span className={bh.isActive ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                    {bh.isActive ? "Active" : "Inactive"}
                  </span>
                </p>
                <p>
                  <span className="font-medium">Permit:</span>{" "}
                  <span className={
                    bh.permitStatus === "valid" ? "text-green-600 font-medium" : 
                    bh.permitStatus === "expired" ? "text-red-600 font-medium" : 
                    "text-yellow-600 font-medium"
                  }>
                    {bh.permitStatus.charAt(0).toUpperCase() + bh.permitStatus.slice(1)}
                  </span>
                </p>
                <p className="text-gray-500 pt-1">
                  📍 {Number(bh.latitude).toFixed(6)}, {Number(bh.longitude).toFixed(6)}
                </p>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
      
      {/* Legend */}
      <div className="leaflet-bottom leaflet-left">
        <div className="leaflet-control bg-white p-2 rounded shadow-lg m-2 text-xs">
          <p className="font-semibold mb-1">Legend:</p>
          <div className="flex items-center gap-1 mb-0.5">
            <span className="w-3 h-3 rounded-full bg-violet-500"></span>
            <span>Barangay</span>
          </div>
          <div className="flex items-center gap-1 mb-0.5">
            <span className="w-3 h-3 rounded-full bg-green-500"></span>
            <span>Active & Valid BH</span>
          </div>
          <div className="flex items-center gap-1 mb-0.5">
            <span className="w-3 h-3 rounded-full bg-orange-500"></span>
            <span>Permit Issue</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-red-500"></span>
            <span>Inactive BH</span>
          </div>
        </div>
      </div>
    </MapContainer>
  )
}
