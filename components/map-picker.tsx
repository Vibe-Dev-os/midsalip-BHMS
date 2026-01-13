"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPinned, Layers, Map, Satellite, Navigation } from "lucide-react"
import dynamic from "next/dynamic"
import { BARANGAY_COORDINATES, MIDSALIP_CENTER, MIDSALIP_BARANGAYS } from "@/lib/constants"

// Re-export for backward compatibility
export { BARANGAY_COORDINATES } from "@/lib/constants"

interface MapPickerProps {
  latitude: number | null
  longitude: number | null
  onLocationChange: (lat: number, lng: number) => void
  readonly?: boolean
  selectedBarangay?: string
}

// Map tile layers
const TILE_LAYERS = {
  street: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    name: "Street"
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a>',
    name: "Satellite"
  },
  terrain: {
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
    name: "Terrain"
  }
}

// Define prop types for dynamic components
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

interface LeafletGISMapProps {
  center: [number, number]
  tileLayer: {
    url: string
    attribution: string
    name: string
  }
  boardingHouses: Array<{
    id: string
    name: string
    latitude: number | null
    longitude: number | null
    barangay: string
    address: string
    isActive: boolean
    permitStatus: string
  }>
  showBarangayMarkers?: boolean
}

// Dynamically import the actual map component to avoid SSR issues
const LeafletMap = dynamic<LeafletMapProps>(() => import("./leaflet-map").then(mod => mod.default), {
  ssr: false,
  loading: () => (
    <div className="h-64 md:h-80 bg-muted flex items-center justify-center">
      <div className="text-muted-foreground">Loading map...</div>
    </div>
  ),
})

const LeafletGISMap = dynamic<LeafletGISMapProps>(() => import("./leaflet-gis-map").then(mod => mod.default), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] bg-muted flex items-center justify-center">
      <div className="text-muted-foreground">Loading map...</div>
    </div>
  ),
})

export function MapPicker({
  latitude,
  longitude,
  onLocationChange,
  readonly = false,
  selectedBarangay,
}: MapPickerProps) {
  const [mapLayer, setMapLayer] = useState<"street" | "satellite" | "terrain">("street")
  const [mapKey, setMapKey] = useState(0)
  const [quickNavBarangay, setQuickNavBarangay] = useState<string>("")

  // When barangay changes, center map on that barangay
  useEffect(() => {
    if (selectedBarangay && BARANGAY_COORDINATES[selectedBarangay]) {
      const coords = BARANGAY_COORDINATES[selectedBarangay]
      onLocationChange(coords.lat, coords.lng)
      // Force map re-render to ensure centering
      setMapKey(prev => prev + 1)
    }
  }, [selectedBarangay, onLocationChange])

  // Handle quick navigation to barangay
  const handleQuickNavigation = (barangay: string) => {
    setQuickNavBarangay(barangay)
    if (barangay && BARANGAY_COORDINATES[barangay]) {
      const coords = BARANGAY_COORDINATES[barangay]
      onLocationChange(coords.lat, coords.lng)
      setMapKey(prev => prev + 1)
    }
  }

  const position: [number, number] | null = latitude !== null && longitude !== null 
    ? [Number(latitude), Number(longitude)] 
    : null

  const center: [number, number] = position || [MIDSALIP_CENTER.lat, MIDSALIP_CENTER.lng]

  return (
    <div className="space-y-4">
      <Card className="relative overflow-hidden">
        {/* Map Layer Toggle */}
        <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-1 bg-card rounded-lg shadow-lg border p-1">
          <Button
            variant={mapLayer === "street" ? "default" : "ghost"}
            size="sm"
            onClick={() => setMapLayer("street")}
            className="h-8 w-8 p-0"
            title="Street View"
            type="button"
          >
            <Map className="w-4 h-4" />
          </Button>
          <Button
            variant={mapLayer === "satellite" ? "default" : "ghost"}
            size="sm"
            onClick={() => setMapLayer("satellite")}
            className="h-8 w-8 p-0"
            title="Satellite View"
            type="button"
          >
            <Satellite className="w-4 h-4" />
          </Button>
          <Button
            variant={mapLayer === "terrain" ? "default" : "ghost"}
            size="sm"
            onClick={() => setMapLayer("terrain")}
            className="h-8 w-8 p-0"
            title="Terrain View"
            type="button"
          >
            <Layers className="w-4 h-4" />
          </Button>
        </div>

        {/* Map Label */}
        <div className="absolute top-4 left-4 z-[1000] bg-card px-3 py-1.5 rounded-md shadow-lg border">
          <p className="text-sm font-medium text-foreground">
            {selectedBarangay || quickNavBarangay || "Midsalip"}, Zamboanga del Sur
          </p>
        </div>

        {/* Barangay Quick Navigation Dropdown */}
        <div className="absolute top-14 left-4 z-[1000]">
          <Select value={quickNavBarangay} onValueChange={handleQuickNavigation}>
            <SelectTrigger className="w-48 bg-card shadow-lg border text-sm h-9">
              <Navigation className="w-4 h-4 mr-2 text-primary" />
              <SelectValue placeholder="Go to Barangay..." />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {MIDSALIP_BARANGAYS.map((brgy) => (
                <SelectItem key={brgy} value={brgy} className="text-sm">
                  {brgy}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Leaflet Map */}
        <div className="h-64 md:h-80">
          <LeafletMap
            key={mapKey}
            center={center}
            position={position}
            tileLayer={TILE_LAYERS[mapLayer]}
            readonly={readonly}
            onLocationChange={onLocationChange}
          />
        </div>

        {/* Click instruction overlay */}
        {!readonly && !latitude && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[1000]">
            <div className="bg-card/95 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg border">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <MapPinned className="w-4 h-4" />
                Click on the map to pin location
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Coordinate Inputs */}
      {!readonly && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="latitude">Latitude</Label>
            <Input
              id="latitude"
              type="number"
              step="0.000001"
              value={latitude || ""}
              onChange={(e) => onLocationChange(Number.parseFloat(e.target.value) || 0, longitude || MIDSALIP_CENTER.lng)}
              placeholder="7.9061"
              className="bg-background"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="longitude">Longitude</Label>
            <Input
              id="longitude"
              type="number"
              step="0.000001"
              value={longitude || ""}
              onChange={(e) => onLocationChange(latitude || MIDSALIP_CENTER.lat, Number.parseFloat(e.target.value) || 0)}
              placeholder="123.2668"
              className="bg-background"
            />
          </div>
        </div>
      )}

      {/* Display coordinates */}
      {latitude !== null && longitude !== null && (
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            <MapPinned className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">Pinned Location:</span>
          </div>
          <code className="text-sm font-mono text-foreground">
            {Number(latitude).toFixed(6)}, {Number(longitude).toFixed(6)}
          </code>
        </div>
      )}
    </div>
  )
}

// Export GIS Map component for admin view
export function GISMap({ 
  boardingHouses,
  selectedBarangay = "All Barangays"
}: { 
  boardingHouses: Array<{
    id: string
    name: string
    latitude: number | null
    longitude: number | null
    barangay: string
    address: string
    isActive: boolean
    permitStatus: string
  }>
  selectedBarangay?: string
}) {
  const [mapLayer, setMapLayer] = useState<"street" | "satellite" | "terrain">("street")

  const validBoardingHouses = boardingHouses.filter(
    (bh) => bh.latitude !== null && bh.longitude !== null
  )

  // Calculate map center based on selected barangay
  const mapCenter: [number, number] = selectedBarangay !== "All Barangays" && BARANGAY_COORDINATES[selectedBarangay]
    ? [BARANGAY_COORDINATES[selectedBarangay].lat, BARANGAY_COORDINATES[selectedBarangay].lng]
    : [MIDSALIP_CENTER.lat, MIDSALIP_CENTER.lng]

  return (
    <Card className="relative overflow-hidden">
      {/* Map Layer Toggle */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-1 bg-card rounded-lg shadow-lg border p-1">
        <Button
          variant={mapLayer === "street" ? "default" : "ghost"}
          size="sm"
          onClick={() => setMapLayer("street")}
          className="h-8 w-8 p-0"
          title="Street View"
          type="button"
        >
          <Map className="w-4 h-4" />
        </Button>
        <Button
          variant={mapLayer === "satellite" ? "default" : "ghost"}
          size="sm"
          onClick={() => setMapLayer("satellite")}
          className="h-8 w-8 p-0"
          title="Satellite View"
          type="button"
        >
          <Satellite className="w-4 h-4" />
        </Button>
        <Button
          variant={mapLayer === "terrain" ? "default" : "ghost"}
          size="sm"
          onClick={() => setMapLayer("terrain")}
          className="h-8 w-8 p-0"
          title="Terrain View"
          type="button"
        >
          <Layers className="w-4 h-4" />
        </Button>
      </div>

      {/* Map Title */}
      <div className="absolute top-4 left-4 z-[1000] bg-card px-3 py-1.5 rounded-md shadow-lg border">
        <p className="text-sm font-medium text-foreground">
          {selectedBarangay !== "All Barangays" ? `${selectedBarangay}, ` : ""}Midsalip, Zamboanga del Sur
        </p>
        <p className="text-xs text-muted-foreground">
          {validBoardingHouses.length} boarding houses mapped
        </p>
      </div>

      {/* Leaflet Map */}
      <div className="h-[500px]">
        <LeafletGISMap
          center={mapCenter}
          tileLayer={TILE_LAYERS[mapLayer]}
          boardingHouses={validBoardingHouses}
        />
      </div>
    </Card>
  )
}
