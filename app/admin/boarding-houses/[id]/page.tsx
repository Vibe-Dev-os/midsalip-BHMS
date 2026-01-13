"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getBoardingHouseById, getRoomsByBoardingHouse, getPermitStatusColor } from "@/lib/data-service"
import type { BoardingHouse, Room } from "@/lib/types"
import { MapPicker } from "@/components/map-picker"
import {
  ArrowLeft,
  Building,
  MapPinned,
  Phone,
  CalendarDays,
  ClipboardCheck,
  UsersRound,
  BedDouble,
  CircleCheck,
  TriangleAlert,
} from "lucide-react"

export default function AdminBoardingHouseDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const [boardingHouse, setBoardingHouse] = useState<BoardingHouse | null>(null)
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const bh = await getBoardingHouseById(id)
        setBoardingHouse(bh)
        if (bh) {
          const roomsData = await getRoomsByBoardingHouse(id)
          setRooms(roomsData)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  if (!boardingHouse) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="py-12 text-center">
            <Building className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Boarding House Not Found</h3>
            <p className="text-muted-foreground mb-4">The boarding house you're looking for doesn't exist.</p>
            <Button asChild>
              <Link href="/admin/boarding-houses">Back to List</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const totalCapacity = rooms.reduce((sum, room) => sum + room.capacity, 0)
  const totalOccupied = rooms.reduce((sum, room) => sum + (room.occupants?.length || 0), 0)
  const occupancyPercent = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/admin/boarding-houses">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-foreground">{boardingHouse.name}</h1>
            <Badge className={getPermitStatusColor(boardingHouse.permitStatus)}>{boardingHouse.permitStatus}</Badge>
            {boardingHouse.isActive ? (
              <Badge variant="outline" className="text-success border-success">
                Active
              </Badge>
            ) : (
              <Badge variant="outline" className="text-muted-foreground">
                Inactive
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground flex items-center gap-1">
            <MapPinned className="w-4 h-4" />
            {boardingHouse.address}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Rooms</p>
                <p className="text-2xl font-bold">{rooms.length}</p>
              </div>
              <BedDouble className="w-8 h-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Capacity</p>
                <p className="text-2xl font-bold">{totalCapacity}</p>
              </div>
              <UsersRound className="w-8 h-8 text-secondary/20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Occupied</p>
                <p className="text-2xl font-bold">{totalOccupied}</p>
              </div>
              <CircleCheck className="w-8 h-8 text-success/20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Occupancy Rate</p>
                <p className="text-2xl font-bold">{occupancyPercent}%</p>
              </div>
              <Building className="w-8 h-8 text-muted/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Property Details */}
        <Card>
          <CardHeader>
            <CardTitle>Property Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <p className="text-muted-foreground">Barangay</p>
                <p className="font-medium flex items-center gap-1">
                  <MapPinned className="w-4 h-4 text-primary" />
                  {boardingHouse.barangay}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Contact Number</p>
                <p className="font-medium flex items-center gap-1">
                  <Phone className="w-4 h-4 text-primary" />
                  {boardingHouse.contactNumber}
                </p>
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-primary" />
                Business Permit
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Permit Number</p>
                  <p className="font-medium">{boardingHouse.permitNumber}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge className={getPermitStatusColor(boardingHouse.permitStatus)}>
                    {boardingHouse.permitStatus}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Issue Date</p>
                  <p className="font-medium flex items-center gap-1">
                    <CalendarDays className="w-3 h-3" />
                    {boardingHouse.permitIssueDate}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Expiry Date</p>
                  <p className="font-medium flex items-center gap-1">
                    <CalendarDays className="w-3 h-3" />
                    {boardingHouse.permitExpiryDate}
                  </p>
                </div>
              </div>
            </div>

            {!boardingHouse.isActive && (
              <div className="flex items-center gap-2 p-3 bg-warning/10 border border-warning/20 rounded-lg text-sm">
                <TriangleAlert className="w-4 h-4 text-warning" />
                <span className="text-warning-foreground">
                  {!boardingHouse.latitude || !boardingHouse.longitude
                    ? "Cannot activate: Location not pinned on map"
                    : boardingHouse.permitStatus !== "valid"
                      ? "Cannot activate: Permit not valid"
                      : "Boarding house is currently inactive"}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Map */}
        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
            <CardDescription>Pinned location on the map</CardDescription>
          </CardHeader>
          <CardContent>
            <MapPicker
              latitude={boardingHouse.latitude}
              longitude={boardingHouse.longitude}
              onLocationChange={() => {}}
              readonly
            />
          </CardContent>
        </Card>
      </div>

      {/* Rooms Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Rooms & Occupancy Overview</CardTitle>
          <CardDescription>Current room status and occupant count (view-only)</CardDescription>
        </CardHeader>
        <CardContent>
          {rooms.length === 0 ? (
            <div className="text-center py-8 bg-muted/50 rounded-lg">
              <BedDouble className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No rooms registered</h3>
              <p className="text-muted-foreground">The owner has not added any rooms yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rooms.map((room) => {
                const availableSpots = room.capacity - room.occupants.length
                const isFull = availableSpots === 0

                return (
                  <div key={room.id} className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <BedDouble className="w-5 h-5 text-primary" />
                        <h4 className="font-medium">{room.name}</h4>
                      </div>
                      <Badge
                        className={
                          isFull ? "bg-destructive text-destructive-foreground" : "bg-success text-success-foreground"
                        }
                      >
                        {isFull ? "Full" : `${availableSpots} Available`}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Capacity</span>
                        <span className="font-medium">{room.capacity}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Occupants</span>
                        <span className="font-medium">{room.occupants.length}</span>
                      </div>
                      <div className="h-2 bg-background rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${(room.occupants.length / room.capacity) * 100}%` }}
                        />
                      </div>
                    </div>
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
