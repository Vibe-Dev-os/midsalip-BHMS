"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getAllBoardingHouses, getRoomsByBoardingHouse, getTotalOccupancy, getPermitStatusColor } from "@/lib/data-service"
import type { BoardingHouse, Room } from "@/lib/types"
import { Search, Building, MapPinned, UsersRound, ArrowUpDown, Eye } from "lucide-react"
import Link from "next/link"

import { BARANGAYS_WITH_ALL } from "@/lib/constants"

const BARANGAYS = BARANGAYS_WITH_ALL

export default function AdminBoardingHousesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterBarangay, setFilterBarangay] = useState("All Barangays")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterActive, setFilterActive] = useState("all")
  const [sortBy, setSortBy] = useState<"name" | "occupancy" | "expiry">("name")
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

  const filteredBH = boardingHouses
    .filter((bh) => {
      const matchesSearch =
        bh.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bh.permitNumber.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesBarangay = filterBarangay === "All Barangays" || bh.barangay === filterBarangay
      const matchesStatus = filterStatus === "all" || bh.permitStatus === filterStatus
      const matchesActive = filterActive === "all" || 
        (filterActive === "active" && bh.isActive) || 
        (filterActive === "inactive" && !bh.isActive)
      return matchesSearch && matchesBarangay && matchesStatus && matchesActive
    })
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name)
      if (sortBy === "expiry") return new Date(a.permitExpiryDate).getTime() - new Date(b.permitExpiryDate).getTime()
      if (sortBy === "occupancy") {
        const occA = getTotalOccupancy(roomsMap[a.id] || [])
        const occB = getTotalOccupancy(roomsMap[b.id] || [])
        return occB.occupied - occA.occupied
      }
      return 0
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
        <h1 className="text-2xl font-bold text-foreground">All Boarding Houses</h1>
        <p className="text-muted-foreground">Complete list of registered boarding houses in Midsalip</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or permit number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background"
              />
            </div>
            <Select value={filterBarangay} onValueChange={setFilterBarangay}>
              <SelectTrigger className="w-full lg:w-48 bg-background">
                <SelectValue placeholder="Barangay" />
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
              <SelectTrigger className="w-full lg:w-36 bg-background">
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
              <SelectTrigger className="w-full lg:w-32 bg-background">
                <SelectValue placeholder="Active" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as "name" | "occupancy" | "expiry")}>
              <SelectTrigger className="w-full lg:w-40 bg-background">
                <ArrowUpDown className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="occupancy">Occupancy</SelectItem>
                <SelectItem value="expiry">Expiry Date</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredBH.length} of {boardingHouses.length} boarding houses
        </p>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear Filters
          </Button>
        )}
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Boarding House</TableHead>
                  <TableHead>Barangay</TableHead>
                  <TableHead>Permit</TableHead>
                  <TableHead>Occupancy</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBH.map((bh) => {
                  const rooms = roomsMap[bh.id] || []
                  const occupancy = getTotalOccupancy(rooms)
                  const occupancyPercent =
                    occupancy.total > 0 ? Math.round((occupancy.occupied / occupancy.total) * 100) : 0

                  return (
                    <TableRow key={bh.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium text-foreground">{bh.name}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">{bh.address}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <MapPinned className="w-3 h-3 text-muted-foreground" />
                          {bh.barangay}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{bh.permitNumber}</p>
                          <p className="text-xs text-muted-foreground">Exp: {bh.permitExpiryDate}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <UsersRound className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">
                              {occupancy.occupied}/{occupancy.total}
                            </span>
                          </div>
                          <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all duration-300"
                              style={{ width: `${occupancyPercent}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge className={`${getPermitStatusColor(bh.permitStatus)} w-fit`}>{bh.permitStatus}</Badge>
                          {bh.isActive ? (
                            <Badge variant="outline" className="text-success border-success w-fit text-xs">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground w-fit text-xs">
                              Inactive
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/admin/boarding-houses/${bh.id}`}>
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}

                {filteredBH.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <Building className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">No boarding houses found</h3>
                      <p className="text-muted-foreground">Try adjusting your filters</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
