"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getBoardingHousesByOwner, getRoomsByBoardingHouse, getTotalOccupancy, getPermitStatusColor } from "@/lib/data-service"
import type { BoardingHouse, Room } from "@/lib/types"
import { Building, MapPinned, Phone, CalendarDays, Plus, MoveRight, ClipboardCheck, Lock, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function OwnerBoardingHouses() {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">My Boarding Houses</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage all your registered properties</p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/owner/register">
            <Plus className="w-5 h-5 mr-2" strokeWidth={2.5} />
            Register New
          </Link>
        </Button>
      </div>

      {/* Boarding Houses Grid */}
      {boardingHouses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted mx-auto mb-4">
              <Building className="w-8 h-8 text-muted-foreground" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No boarding houses registered</h3>
            <p className="text-muted-foreground mb-4">Start by registering your first boarding house property</p>
            <Button asChild>
              <Link href="/owner/register">
                <Plus className="w-5 h-5 mr-2" strokeWidth={2.5} />
                Register Boarding House
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {boardingHouses.map((bh) => {
            const rooms = roomsMap[bh.id] || []
            const occupancy = getTotalOccupancy(rooms)
            const occupancyPercent = occupancy.total > 0 ? (occupancy.occupied / occupancy.total) * 100 : 0

            return (
              <Card key={bh.id} className="hover:border-primary/50 transition-colors">
                <CardHeader className="pb-2 sm:pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 min-w-0">
                      <CardTitle className="text-base sm:text-lg truncate">{bh.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1.5 text-xs sm:text-sm">
                        <MapPinned className="w-4 h-4 flex-shrink-0" strokeWidth={2} />
                        <span className="truncate">{bh.barangay}</span>
                      </CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge className={getPermitStatusColor(bh.permitStatus)} variant="sm">
                        {bh.permitStatus}
                      </Badge>
                      {bh.isActive ? (
                        <Badge variant="outline" className="text-success border-success text-xs">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground text-xs">
                          Inactive
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  {/* Address & Contact */}
                  <div className="space-y-2 text-xs sm:text-sm">
                    <p className="text-muted-foreground break-words">{bh.address}</p>
                    <div className="flex items-center gap-2 sm:gap-4 text-muted-foreground">
                      <span className="flex items-center gap-1 min-w-0">
                        <Phone className="w-4 h-4 flex-shrink-0" strokeWidth={2} />
                        <span className="truncate">{bh.contactNumber}</span>
                      </span>
                    </div>
                  </div>

                  {/* Permit Info */}
                  <div className="p-2 sm:p-3 bg-muted rounded-lg space-y-1">
                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                      <ClipboardCheck className="w-5 h-5 text-primary flex-shrink-0" strokeWidth={2} />
                      <span className="font-medium">Permit: {bh.permitNumber}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CalendarDays className="w-4 h-4 flex-shrink-0" strokeWidth={2} />
                      <span className="truncate">
                        Valid: {bh.permitIssueDate} to {bh.permitExpiryDate}
                      </span>
                    </div>
                  </div>

                  {/* Status Messages */}
                  {(!bh.isActive || bh.permitStatus === "pending") && (
                    <div className="p-3 bg-muted rounded-lg border border-warning/20">
                      <div className="flex items-center gap-2 text-warning mb-2">
                        {bh.permitStatus === "pending" ? (
                          <AlertCircle className="w-4 h-4" />
                        ) : (
                          <Lock className="w-4 h-4" />
                        )}
                        <span className="text-sm font-medium">
                          {bh.permitStatus === "pending" ? "Awaiting Admin Approval" : "Property Locked"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {bh.permitStatus === "pending" 
                          ? "Your boarding house is under review by the admin. You'll be notified once it's approved."
                          : "This property is currently inactive. Contact admin for assistance."
                        }
                      </p>
                    </div>
                  )}

                  {/* Occupancy Bar */}
                  {bh.isActive && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-muted-foreground">Occupancy</span>
                        <span className="font-medium">
                          {occupancy.occupied} / {occupancy.total} beds
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${occupancyPercent}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">{occupancy.available} beds available</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      asChild={bh.isActive && bh.permitStatus !== "pending"}
                      variant="outline"
                      size="sm"
                      disabled={!bh.isActive || bh.permitStatus === "pending"}
                      className="flex-1 bg-transparent text-xs sm:text-sm h-auto py-2"
                    >
                      {bh.isActive && bh.permitStatus !== "pending" ? (
                        <Link href={`/owner/boarding-houses/${bh.id}`}>
                          Manage Rooms
                          <MoveRight className="w-5 h-5 ml-2" strokeWidth={2} />
                        </Link>
                      ) : (
                        <span>
                          <Lock className="w-4 h-4 mr-2" strokeWidth={2} />
                          Locked
                        </span>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
