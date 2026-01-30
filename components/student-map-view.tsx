"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { getAllBoardingHouses, getRoomsByBoardingHouse, getTotalOccupancy } from "@/lib/data-service"
import type { BoardingHouse, Room } from "@/lib/types"
import { MapPinned, Search, Building, UsersRound, Phone, MapPin, Home } from "lucide-react"
import { BARANGAYS_WITH_ALL, MIDSALIP_CENTER } from "@/lib/constants"

// Dynamically import the map component to avoid SSR issues with Leaflet
const LeafletGISMap = dynamic(() => import("@/components/leaflet-gis-map"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-muted flex items-center justify-center rounded-xl">
      <div className="text-muted-foreground">Loading map...</div>
    </div>
  ),
})

const TILE_LAYER = {
  url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  name: "OpenStreetMap"
}

export default function StudentMapView() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterBarangay, setFilterBarangay] = useState("All Barangays")
  const [selectedBH, setSelectedBH] = useState<BoardingHouse | null>(null)
  const [boardingHouses, setBoardingHouses] = useState<BoardingHouse[]>([])
  const [roomsMap, setRoomsMap] = useState<Record<string, Room[]>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const bhData = await getAllBoardingHouses()
        // Only show active boarding houses with valid permits to students
        const activeBH = bhData.filter(bh => bh.isActive && bh.permitStatus === "valid")
        setBoardingHouses(activeBH)

        const roomsData: Record<string, Room[]> = {}
        for (const bh of activeBH) {
          const rooms = await getRoomsByBoardingHouse(bh.id)
          roomsData[bh.id] = rooms
        }
        setRoomsMap(roomsData)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter boarding houses with valid coordinates
  const boardingHousesWithLocation = boardingHouses.filter((bh) => bh.latitude && bh.longitude)

  const filteredBH = boardingHousesWithLocation.filter((bh) => {
    const matchesSearch =
      bh.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bh.address.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesBarangay = filterBarangay === "All Barangays" || bh.barangay === filterBarangay
    return matchesSearch && matchesBarangay
  })

  // Calculate availability for a boarding house
  const getAvailability = (bhId: string) => {
    const rooms = roomsMap[bhId] || []
    const totalCapacity = rooms.reduce((sum, room) => sum + room.capacity, 0)
    const totalOccupied = rooms.reduce((sum, room) => sum + (room.occupants?.length || 0), 0)
    return {
      available: totalCapacity - totalOccupied,
      total: totalCapacity
    }
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="flex items-center justify-center h-[400px]">
          <div className="text-muted-foreground">Loading boarding houses...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search boarding houses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-background"
          />
        </div>
        <Select value={filterBarangay} onValueChange={setFilterBarangay}>
          <SelectTrigger className="w-full sm:w-[200px] bg-background">
            <SelectValue placeholder="Select Barangay" />
          </SelectTrigger>
          <SelectContent>
            {BARANGAYS_WITH_ALL.map((barangay) => (
              <SelectItem key={barangay} value={barangay}>
                {barangay}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Map and List Container */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Map */}
        <div className="lg:col-span-2 h-[400px] sm:h-[500px] rounded-xl overflow-hidden border border-border">
          <LeafletGISMap
            center={[MIDSALIP_CENTER.lat, MIDSALIP_CENTER.lng]}
            tileLayer={TILE_LAYER}
            boardingHouses={filteredBH}
            showBarangayMarkers={true}
          />
        </div>

        {/* Boarding House List */}
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Building className="w-4 h-4" />
            <span>{filteredBH.length} boarding house{filteredBH.length !== 1 ? 's' : ''} found</span>
          </div>
          
          {filteredBH.length === 0 ? (
            <Card className="p-6">
              <p className="text-center text-muted-foreground text-sm">
                No boarding houses found matching your search.
              </p>
            </Card>
          ) : (
            filteredBH.map((bh) => {
              const availability = getAvailability(bh.id)
              return (
                <Card 
                  key={bh.id} 
                  className={`cursor-pointer transition-all hover:border-primary/50 ${
                    selectedBH?.id === bh.id ? 'border-primary ring-1 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedBH(selectedBH?.id === bh.id ? null : bh)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-sm line-clamp-1">{bh.name}</h3>
                        <Badge 
                          variant={availability.available > 0 ? "default" : "secondary"}
                          className="shrink-0 text-xs"
                        >
                          {availability.available > 0 
                            ? `${availability.available} slots` 
                            : 'Full'
                          }
                        </Badge>
                      </div>
                      
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="line-clamp-1">{bh.address}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Home className="w-3 h-3 shrink-0" />
                          <span>{bh.barangay}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <UsersRound className="w-3 h-3 shrink-0" />
                          <span>Capacity: {availability.total} occupants</span>
                        </div>
                        {bh.contactNumber && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3 h-3 shrink-0" />
                            <span>{bh.contactNumber}</span>
                          </div>
                        )}
                      </div>

                      {/* Expanded Details */}
                      {selectedBH?.id === bh.id && (
                        <div className="pt-2 mt-2 border-t border-border space-y-2">
                          {bh.description && (
                            <p className="text-xs text-muted-foreground">
                              {bh.description}
                            </p>
                          )}
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-muted/50 rounded p-2">
                              <p className="text-muted-foreground">Total Rooms</p>
                              <p className="font-semibold">{roomsMap[bh.id]?.length || 0}</p>
                            </div>
                            <div className="bg-muted/50 rounded p-2">
                              <p className="text-muted-foreground">Available</p>
                              <p className="font-semibold text-green-600">
                                {availability.available} / {availability.total}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="font-medium">Map Legend:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-violet-500"></span>
          <span>Barangay Center</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-green-500"></span>
          <span>Available Boarding House</span>
        </div>
      </div>
    </div>
  )
}
