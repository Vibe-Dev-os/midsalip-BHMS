"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getAllBoardingHouses, getRoomsByBoardingHouse, getTotalOccupancy, getPermitStatusColor } from "@/lib/data-service"
import type { BoardingHouse, Room } from "@/lib/types"
import { Building, UsersRound, TriangleAlert, CircleCheck, MapPinned, MoveRight } from "lucide-react"
import Link from "next/link"

export default function AdminDashboard() {
  const [boardingHouses, setBoardingHouses] = useState<BoardingHouse[]>([])
  const [roomsMap, setRoomsMap] = useState<Record<string, Room[]>>({})
  const [totalCapacity, setTotalCapacity] = useState(0)
  const [totalOccupied, setTotalOccupied] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const bhData = await getAllBoardingHouses()
        setBoardingHouses(bhData)

        // Calculate total occupancy across all boarding houses
        let capacity = 0
        let occupied = 0
        const roomsData: Record<string, Room[]> = {}
        
        for (const bh of bhData) {
          const rooms = await getRoomsByBoardingHouse(bh.id)
          roomsData[bh.id] = rooms
          const occupancy = getTotalOccupancy(rooms)
          capacity += occupancy.total
          occupied += occupancy.occupied
        }

        setRoomsMap(roomsData)
        setTotalCapacity(capacity)
        setTotalOccupied(occupied)
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

  const totalBH = boardingHouses.length
  const activeBH = boardingHouses.filter((bh) => bh.isActive).length
  const expiredPermits = boardingHouses.filter((bh) => bh.permitStatus === "expired").length
  const nearExpiryPermits = boardingHouses.filter((bh) => bh.permitStatus === "near-expiry").length
  const pendingVerification = boardingHouses.filter((bh) => bh.permitStatus === "pending").length

  const pinnedLocations = boardingHouses.filter((bh) => bh.latitude && bh.longitude).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">LGU Admin Dashboard</h1>
        <p className="text-muted-foreground">Monitor and verify boarding houses in Midsalip</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Boarding Houses</CardTitle>
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/15">
              <Building className="w-5 h-5 text-primary" strokeWidth={2} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBH}</div>
            <p className="text-xs text-muted-foreground">
              {activeBH} active / {totalBH - activeBH} inactive
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Occupancy</CardTitle>
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary/15">
              <UsersRound className="w-5 h-5 text-secondary" strokeWidth={2} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalOccupied} / {totalCapacity}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0}% occupancy rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Map Locations</CardTitle>
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/15">
              <MapPinned className="w-5 h-5 text-primary" strokeWidth={2} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pinnedLocations}</div>
            <p className="text-xs text-muted-foreground">{totalBH - pinnedLocations} unpinned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Permit Alerts</CardTitle>
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-warning/20">
              <TriangleAlert className="w-5 h-5 text-warning" strokeWidth={2} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expiredPermits + nearExpiryPermits}</div>
            <p className="text-xs text-muted-foreground">
              {expiredPermits} expired, {nearExpiryPermits} near expiry
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/15">
                <MapPinned className="w-5 h-5 text-primary" strokeWidth={2} />
              </div>
              GIS Map View
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">View all boarding houses on the map</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full text-sm sm:text-base h-auto py-2">
              <Link href="/admin/map">
                Open Map
                <MoveRight className="w-5 h-5 ml-2" strokeWidth={2} />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-secondary/15">
                <CircleCheck className="w-5 h-5 text-secondary" strokeWidth={2} />
              </div>
              Permit Verification
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">{pendingVerification} pending verification</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full text-sm sm:text-base h-auto py-2">
              <Link href="/admin/permits">
                Review Permits
                <MoveRight className="w-5 h-5 ml-2" strokeWidth={2} />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/15">
                <Building className="w-5 h-5 text-primary" strokeWidth={2} />
              </div>
              All Properties
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">View and manage all boarding houses</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full text-sm sm:text-base h-auto py-2">
              <Link href="/admin/boarding-houses">
                View All
                <MoveRight className="w-5 h-5 ml-2" strokeWidth={2} />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity / Boarding Houses */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg sm:text-xl">Recent Registrations</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Latest boarding house registrations in Midsalip
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 sm:space-y-4">
            {boardingHouses.slice(0, 5).map((bh) => {
              const rooms = roomsMap[bh.id] || []
              const occupancy = getTotalOccupancy(rooms)
              return (
                <div key={bh.id} className="flex flex-col gap-3 sm:gap-4 p-3 sm:p-4 bg-muted/50 rounded-lg">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-medium text-foreground text-sm sm:text-base">{bh.name}</h3>
                      <Badge className={getPermitStatusColor(bh.permitStatus)} variant="sm">
                        {bh.permitStatus}
                      </Badge>
                      {bh.isActive && (
                        <Badge variant="outline" className="text-success border-success text-xs">
                          Active
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {bh.barangay} - {bh.address}
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                      <span>Permit: {bh.permitNumber}</span>
                      <span>
                        Occupancy: {occupancy.occupied}/{occupancy.total}
                      </span>
                    </div>
                  </div>
                  <Button asChild variant="outline" size="sm" className="w-full bg-transparent">
                    <Link href={`/admin/boarding-houses/${bh.id}`}>
                      View Details
                      <MoveRight className="w-5 h-5 ml-2" strokeWidth={2} />
                    </Link>
                  </Button>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
