"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getAllBoardingHouses, getRoomsByBoardingHouse, getTotalOccupancy, getPermitStatusColor } from "@/lib/data-service"
import { GISMap } from "@/components/map-picker"
import type { BoardingHouse, Room } from "@/lib/types"
import { MapPinned, Search, Building, UsersRound, SlidersHorizontal, Eye } from "lucide-react"
import Link from "next/link"

import { BARANGAYS_WITH_ALL } from "@/lib/constants"

const BARANGAYS = BARANGAYS_WITH_ALL

export default function GISMapPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterBarangay, setFilterBarangay] = useState("All Barangays")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterActive, setFilterActive] = useState("all")
  const [selectedBH, setSelectedBH] = useState<BoardingHouse | null>(null)
  const [boardingHouses, setBoardingHouses] = useState<BoardingHouse[]>([])
  const [roomsMap, setRoomsMap] = useState<Record<string, Room[]>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const bhData = await getAllBoardingHouses()
        setBoardingHouses(bhData)

        const roomsData: Record<string, Room[]> = {}
        for (const bh of bhData) {
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

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  // Filter boarding houses with valid coordinates
  const boardingHousesWithLocation = boardingHouses.filter((bh) => bh.latitude && bh.longitude)

  const filteredBH = boardingHousesWithLocation.filter((bh) => {
    const matchesSearch =
      bh.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bh.address.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesBarangay = filterBarangay === "All Barangays" || bh.barangay === filterBarangay
    const matchesStatus = filterStatus === "all" || bh.permitStatus === filterStatus
    const matchesActive = filterActive === "all" || 
      (filterActive === "active" && bh.isActive) || 
      (filterActive === "inactive" && !bh.isActive)
    return matchesSearch && matchesBarangay && matchesStatus && matchesActive
  })

  // Clear filters function
  const clearFilters = () => {
    setSearchTerm("")
    setFilterBarangay("All Barangays")
    setFilterStatus("all")
    setFilterActive("all")
  }

  const hasActiveFilters = searchTerm || filterBarangay !== "All Barangays" || filterStatus !== "all" || filterActive !== "all"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">GIS Map View</h1>
        <p className="text-muted-foreground">View all registered boarding houses in Midsalip</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background"
                />
              </div>
              <Select value={filterBarangay} onValueChange={setFilterBarangay}>
                <SelectTrigger className="w-full sm:w-48 bg-background">
                  <SelectValue placeholder="Filter by barangay" />
                </SelectTrigger>
                <SelectContent>
                  {BARANGAYS.map((brgy) => (
                    <SelectItem key={brgy} value={brgy}>
                      {brgy}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-40 bg-background">
                  <SelectValue placeholder="Permit Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="valid">Valid</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="near-expiry">Near Expiry</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterActive} onValueChange={setFilterActive}>
                <SelectTrigger className="w-full sm:w-36 bg-background">
                  <SelectValue placeholder="Active State" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {hasActiveFilters && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredBH.length} of {boardingHousesWithLocation.length} properties
                </p>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Map and Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2">
          <GISMap boardingHouses={filteredBH} selectedBarangay={filterBarangay} />
        </div>

        {/* Boarding Houses List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Boarding Houses</CardTitle>
            <CardDescription>{filteredBH.length} properties with pinned locations</CardDescription>
          </CardHeader>
          <CardContent className="max-h-[500px] overflow-y-auto">
            <div className="space-y-3">
              {filteredBH.map((bh) => {
                const rooms = roomsMap[bh.id] || []
                const occupancy = getTotalOccupancy(rooms)
                return (
                  <button
                    type="button"
                    key={bh.id}
                    className={`w-full p-3 rounded-lg border text-left transition-colors ${
                      selectedBH?.id === bh.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                    }`}
                    onClick={() => setSelectedBH(bh)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm text-foreground truncate">{bh.name}</h4>
                      <Badge className={`${getPermitStatusColor(bh.permitStatus)} text-xs`}>{bh.permitStatus}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                      <MapPinned className="w-3 h-3" />
                      {bh.barangay}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Building className="w-3 h-3" />
                        {occupancy.total} beds
                      </span>
                      <span className="flex items-center gap-1">
                        <UsersRound className="w-3 h-3" />
                        {occupancy.occupied} occupied
                      </span>
                    </div>
                  </button>
                )
              })}

              {filteredBH.length === 0 && (
                <div className="text-center py-8">
                  <SlidersHorizontal className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No matching boarding houses found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
