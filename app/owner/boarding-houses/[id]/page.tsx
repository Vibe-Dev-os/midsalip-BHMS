"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { getBoardingHouseById, getRoomsByBoardingHouse, getPermitStatusColor, createRoom, deleteRoom, createOccupant, deleteOccupant } from "@/lib/data-service"
import type { Room, Occupant, BoardingHouse } from "@/lib/types"
import {
  ArrowLeft,
  Building,
  UsersRound,
  Plus,
  Trash2,
  UserPlus,
  UserMinus,
  MapPinned,
  Phone,
  CalendarDays,
  ClipboardCheck,
  BedDouble,
  CircleCheck,
  TriangleAlert,
} from "lucide-react"

export default function BoardingHouseDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const [boardingHouse, setBoardingHouse] = useState<BoardingHouse | null>(null)
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [newRoomName, setNewRoomName] = useState("")
  const [newRoomCapacity, setNewRoomCapacity] = useState("")
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false)

  const [newOccupantName, setNewOccupantName] = useState("")
  const [newOccupantContact, setNewOccupantContact] = useState("")
  const [newOccupantMoveIn, setNewOccupantMoveIn] = useState("")
  const [selectedRoomForOccupant, setSelectedRoomForOccupant] = useState<string | null>(null)
  const [isAddOccupantOpen, setIsAddOccupantOpen] = useState(false)

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
              <Link href="/owner/boarding-houses">Back to My Properties</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const totalCapacity = rooms.reduce((sum, room) => sum + room.capacity, 0)
  const totalOccupied = rooms.reduce((sum, room) => sum + (room.occupants?.length || 0), 0)

  const handleAddRoom = async () => {
    if (!newRoomName || !newRoomCapacity) return

    const roomData = {
      boardingHouseId: id,
      name: newRoomName,
      capacity: Number.parseInt(newRoomCapacity),
    }

    const newRoomId = await createRoom(roomData)
    
    if (newRoomId) {
      const newRoom: Room = {
        id: newRoomId,
        boardingHouseId: id,
        name: newRoomName,
        capacity: Number.parseInt(newRoomCapacity),
        occupants: [],
      }
      setRooms((prev) => [...prev, newRoom])
    }

    setNewRoomName("")
    setNewRoomCapacity("")
    setIsAddRoomOpen(false)
  }

  const handleDeleteRoom = async (roomId: string) => {
    const success = await deleteRoom(roomId)
    if (success) {
      setRooms((prev) => prev.filter((room) => room.id !== roomId))
    }
  }

  const handleAddOccupant = async () => {
    if (!selectedRoomForOccupant || !newOccupantName || !newOccupantContact || !newOccupantMoveIn) return

    const occupantData = {
      roomId: selectedRoomForOccupant,
      name: newOccupantName,
      contactNumber: newOccupantContact,
      moveInDate: newOccupantMoveIn,
    }

    const newOccupantId = await createOccupant(occupantData)

    if (newOccupantId) {
      const newOccupant: Occupant = {
        id: newOccupantId,
        roomId: selectedRoomForOccupant,
        name: newOccupantName,
        contactNumber: newOccupantContact,
        moveInDate: newOccupantMoveIn,
      }

      setRooms((prev) =>
        prev.map((room) =>
          room.id === selectedRoomForOccupant ? { ...room, occupants: [...(room.occupants || []), newOccupant] } : room,
        ),
      )
    }

    setNewOccupantName("")
    setNewOccupantContact("")
    setNewOccupantMoveIn("")
    setSelectedRoomForOccupant(null)
    setIsAddOccupantOpen(false)
  }

  const handleRemoveOccupant = async (roomId: string, occupantId: string) => {
    const success = await deleteOccupant(occupantId)
    if (success) {
      setRooms((prev) =>
        prev.map((room) =>
          room.id === roomId ? { ...room, occupants: (room.occupants || []).filter((occ) => occ.id !== occupantId) } : room,
        ),
      )
    }
  }

  const openAddOccupant = (roomId: string) => {
    setSelectedRoomForOccupant(roomId)
    setIsAddOccupantOpen(true)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/owner/boarding-houses">
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
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-2xl font-bold">{totalCapacity - totalOccupied}</p>
              </div>
              <Building className="w-8 h-8 text-muted/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Property Info */}
      <Card>
        <CardHeader>
          <CardTitle>Property Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Barangay</p>
              <p className="font-medium flex items-center gap-1">
                <MapPinned className="w-4 h-4 text-primary" />
                {boardingHouse.barangay}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Contact Number</p>
              <p className="font-medium flex items-center gap-1">
                <Phone className="w-4 h-4 text-primary" />
                {boardingHouse.contactNumber}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Business Permit</p>
              <p className="font-medium flex items-center gap-1">
                <ClipboardCheck className="w-4 h-4 text-primary" />
                {boardingHouse.permitNumber}
              </p>
            </div>
          </div>

          {!boardingHouse.isActive && (
            <div className="flex items-center gap-2 p-3 mt-4 bg-warning/10 border border-warning/20 rounded-lg text-sm">
              <TriangleAlert className="w-4 h-4 text-warning" />
              <span className="text-warning-foreground">
                {!boardingHouse.latitude || !boardingHouse.longitude
                  ? "Cannot activate: Location not pinned on map"
                  : boardingHouse.permitStatus !== "valid"
                    ? "Cannot activate: Permit not verified"
                    : "Boarding house is currently inactive"}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rooms Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Rooms & Occupancy</CardTitle>
              <CardDescription>Manage rooms and track occupants</CardDescription>
            </div>
            <Dialog open={isAddRoomOpen} onOpenChange={setIsAddRoomOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Room
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Room</DialogTitle>
                  <DialogDescription>Create a new room for this boarding house</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="roomName">Room Name</Label>
                    <Input
                      id="roomName"
                      value={newRoomName}
                      onChange={(e) => setNewRoomName(e.target.value)}
                      placeholder="e.g., Room 1, Room A"
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="roomCapacity">Capacity (beds)</Label>
                    <Input
                      id="roomCapacity"
                      type="number"
                      min="1"
                      value={newRoomCapacity}
                      onChange={(e) => setNewRoomCapacity(e.target.value)}
                      placeholder="e.g., 4"
                      className="bg-background"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddRoomOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddRoom} disabled={!newRoomName || !newRoomCapacity}>
                    Add Room
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {rooms.length === 0 ? (
            <div className="text-center py-8 bg-muted/50 rounded-lg">
              <BedDouble className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No rooms yet</h3>
              <p className="text-muted-foreground mb-4">Add your first room to start tracking occupancy</p>
              <Button onClick={() => setIsAddRoomOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Room
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {rooms.map((room) => {
                const availableSpots = room.capacity - (room.occupants?.length || 0)
                const isFull = availableSpots === 0

                return (
                  <div key={room.id} className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                          <BedDouble className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">{room.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {room.occupants?.length || 0} / {room.capacity} occupied
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          className={
                            isFull ? "bg-destructive text-destructive-foreground" : "bg-success text-success-foreground"
                          }
                        >
                          {isFull ? "Full" : `${availableSpots} Available`}
                        </Badge>
                        <Button
                          onClick={() => openAddOccupant(room.id)}
                          disabled={isFull}
                          className="text-sm"
                          size="sm"
                        >
                          <UserPlus className="w-4 h-4 mr-1" />
                          <span className="hidden sm:inline">Add Occupant</span>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Room</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete {room.name}? This will also remove all occupant records
                                for this room.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteRoom(room.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>

                    {/* Occupancy Progress */}
                    <div className="h-2 bg-background rounded-full overflow-hidden mb-4">
                      <div
                        className={`h-full transition-all duration-300 ${isFull ? "bg-destructive" : "bg-primary"}`}
                        style={{ width: `${((room.occupants?.length || 0) / room.capacity) * 100}%` }}
                      />
                    </div>

                    {/* Occupants List */}
                    {(room.occupants?.length || 0) > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Occupants:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {room.occupants?.map((occupant) => (
                            <div
                              key={occupant.id}
                              className="flex items-center justify-between p-2 bg-background rounded-md"
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">
                                  <UsersRound className="w-4 h-4 text-secondary" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium">{occupant.name}</p>
                                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <CalendarDays className="w-3 h-3" />
                                    Since {occupant.moveInDate}
                                  </p>
                                </div>
                              </div>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="text-destructive h-8 w-8 p-0">
                                    <UserMinus className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Remove Occupant</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to remove {occupant.name} from {room.name}?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleRemoveOccupant(room.id, occupant.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Remove
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          )) || []}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Occupant Dialog */}
      <Dialog open={isAddOccupantOpen} onOpenChange={setIsAddOccupantOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Occupant</DialogTitle>
            <DialogDescription>
              Adding occupant to {rooms.find((r) => r.id === selectedRoomForOccupant)?.name || "selected room"}. Please
              provide complete information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="occupantName">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="occupantName"
                value={newOccupantName}
                onChange={(e) => setNewOccupantName(e.target.value)}
                placeholder="e.g., Juan Dela Cruz"
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="occupantContact">
                Contact Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="occupantContact"
                value={newOccupantContact}
                onChange={(e) => setNewOccupantContact(e.target.value)}
                placeholder="e.g., 09171234567"
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="occupantMoveIn">
                Move-in Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="occupantMoveIn"
                type="date"
                value={newOccupantMoveIn}
                onChange={(e) => setNewOccupantMoveIn(e.target.value)}
                className="bg-background"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOccupantOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddOccupant}
              disabled={!newOccupantName || !newOccupantContact || !newOccupantMoveIn}
            >
              Add Occupant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
