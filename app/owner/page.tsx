"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getBoardingHousesByOwner, getRoomsByBoardingHouse, getTotalOccupancy, getPermitStatusColor } from "@/lib/data-service"
import type { BoardingHouse, Room } from "@/lib/types"
import { Building, UsersRound, TriangleAlert, Plus, MoveRight, BedDouble } from "lucide-react"
import Link from "next/link"

export default function OwnerDashboard() {
  const { user } = useAuth()
  const [boardingHouses, setBoardingHouses] = useState<BoardingHouse[]>([])
  const [roomsMap, setRoomsMap] = useState<Record<string, Room[]>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      if (!user?.id) {
        setLoading(false)
        return
      }
      try {
        const bhData = await getBoardingHousesByOwner(user.id)
        setBoardingHouses(bhData)

        // Fetch rooms for each boarding house
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
  }, [user?.id])

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  const totalBH = boardingHouses.length
  const activeBH = boardingHouses.filter((bh) => bh.isActive).length
  const expiredPermits = boardingHouses.filter((bh) => bh.permitStatus === "expired").length

  let totalCapacity = 0
  let totalOccupied = 0
  boardingHouses.forEach((bh) => {
    const rooms = roomsMap[bh.id] || []
    const occ = getTotalOccupancy(rooms)
    totalCapacity += occ.total
    totalOccupied += occ.occupied
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Welcome back, {user?.name}</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage your boarding houses and occupants</p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/owner/register">
            <Plus className="w-5 h-5 mr-2" strokeWidth={2.5} />
            Register New
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Total Properties</CardTitle>
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/15">
              <Building className="w-5 h-5 text-primary" strokeWidth={2} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">{totalBH}</div>
            <p className="text-xs text-muted-foreground">{activeBH} active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Total Capacity</CardTitle>
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary/15">
              <UsersRound className="w-5 h-5 text-secondary" strokeWidth={2} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">{totalCapacity}</div>
            <p className="text-xs text-muted-foreground">{totalOccupied} occupied</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Available Beds</CardTitle>
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent/15">
              <BedDouble className="w-5 h-5 text-accent" strokeWidth={2} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">{totalCapacity - totalOccupied}</div>
            <p className="text-xs text-muted-foreground">
              {totalCapacity > 0 ? Math.round(((totalCapacity - totalOccupied) / totalCapacity) * 100) : 0}% available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Permit Issues</CardTitle>
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-warning/20">
              <TriangleAlert className="w-5 h-5 text-warning" strokeWidth={2} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">{expiredPermits}</div>
            <p className="text-xs text-muted-foreground">require attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Boarding Houses List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg sm:text-xl">Your Boarding Houses</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Manage rooms and occupancy for each property</CardDescription>
        </CardHeader>
        <CardContent>
          {boardingHouses.length === 0 ? (
            <div className="text-center py-8">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted mx-auto mb-4">
                <Building className="w-8 h-8 text-muted-foreground" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No boarding houses yet</h3>
              <p className="text-muted-foreground mb-4">Register your first boarding house to get started</p>
              <Button asChild>
                <Link href="/owner/register">
                  <Plus className="w-5 h-5 mr-2" strokeWidth={2.5} />
                  Register Boarding House
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {boardingHouses.map((bh) => {
                const rooms = roomsMap[bh.id] || []
                const occupancy = getTotalOccupancy(rooms)
                return (
                  <div key={bh.id} className="flex flex-col gap-3 sm:gap-4 p-3 sm:p-4 bg-muted/50 rounded-lg">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-foreground text-sm sm:text-base">{bh.name}</h3>
                        <Badge className={getPermitStatusColor(bh.permitStatus)}>{bh.permitStatus}</Badge>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground">{bh.address}</p>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                        <span>Capacity: {occupancy.total}</span>
                        <span>Occupied: {occupancy.occupied}</span>
                        <span>Available: {occupancy.available}</span>
                      </div>
                    </div>
                    <Button asChild variant="outline" size="sm" className="w-full bg-transparent">
                      <Link href={`/owner/boarding-houses/${bh.id}`}>
                        Manage
                        <MoveRight className="w-5 h-5 ml-2" strokeWidth={2} />
                      </Link>
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
