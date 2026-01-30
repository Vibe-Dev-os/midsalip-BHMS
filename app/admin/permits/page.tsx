"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { getAllBoardingHouses, getPermitStatusColor, updateBoardingHouse, createNotification } from "@/lib/data-service"
import type { BoardingHouse, PermitStatus } from "@/lib/types"
import {
  Search,
  ClipboardCheck,
  TriangleAlert,
  CircleCheck,
  CircleX,
  Clock,
  CalendarDays,
  MapPinned,
  Eye,
  Ban,
} from "lucide-react"
import { BARANGAYS_WITH_ALL } from "@/lib/constants"
import { toast } from "sonner"

const BARANGAYS = BARANGAYS_WITH_ALL

export default function PermitVerificationPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterBarangay, setFilterBarangay] = useState("All Barangays")
  const [boardingHouses, setBoardingHouses] = useState<BoardingHouse[]>([])
  const [selectedBH, setSelectedBH] = useState<BoardingHouse | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const bhData = await getAllBoardingHouses()
        setBoardingHouses(bhData)
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

  const filteredBH = boardingHouses.filter((bh) => {
    const matchesSearch =
      bh.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bh.permitNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesBarangay = filterBarangay === "All Barangays" || bh.barangay === filterBarangay
    return matchesSearch && matchesBarangay
  })

  const pendingBH = filteredBH.filter((bh) => bh.permitStatus === "pending")
  const expiredBH = filteredBH.filter((bh) => bh.permitStatus === "expired")
  const nearExpiryBH = filteredBH.filter((bh) => bh.permitStatus === "near-expiry")
  const validBH = filteredBH.filter((bh) => bh.permitStatus === "valid")

  const handleVerifyPermit = async (bhId: string) => {
    const bh = boardingHouses.find(b => b.id === bhId)
    if (!bh) return

    // Calculate proper permit status based on expiry date
    // Parse the date string as local date (not UTC) by adding time component
    const [year, month, day] = bh.permitExpiryDate.split('-').map(Number)
    const permitExpiry = new Date(year, month - 1, day) // month is 0-indexed
    
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Reset time to start of day for accurate comparison
    
    const daysUntilExpiry = Math.ceil((permitExpiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    console.log('Permit verification:', {
      permitExpiryDate: bh.permitExpiryDate,
      parsedExpiry: permitExpiry.toISOString(),
      today: today.toISOString(),
      daysUntilExpiry
    })
    
    let newPermitStatus: "valid" | "expired" | "near-expiry" = "valid"
    if (daysUntilExpiry < 0) {
      newPermitStatus = "expired"
    } else if (daysUntilExpiry <= 30) {
      newPermitStatus = "near-expiry"
    }

    // Activate if has location and permit is valid
    const shouldActivate = !!(bh.latitude && bh.longitude && newPermitStatus === "valid")
    
    // Update in database
    const success = await updateBoardingHouse(bhId, { 
      permitStatus: newPermitStatus, 
      isActive: shouldActivate 
    })
    
    if (success) {
      // Send notification to owner
      const notificationTitle = shouldActivate 
        ? "Boarding House Approved!" 
        : newPermitStatus === "expired" 
          ? "Permit Expired - Action Required"
          : "Boarding House Reviewed"
      
      const notificationMessage = shouldActivate
        ? `Your boarding house "${bh.name}" has been approved and is now active. You can now manage rooms and occupants.`
        : newPermitStatus === "expired"
          ? `Your boarding house "${bh.name}" permit has expired. Please renew your permit to activate your listing.`
          : `Your boarding house "${bh.name}" has been reviewed. Permit status: ${newPermitStatus}. ${!bh.latitude || !bh.longitude ? 'Please add a location to activate your listing.' : ''}`
      
      await createNotification({
        userId: bh.ownerId,
        title: notificationTitle,
        message: notificationMessage,
        type: shouldActivate ? "approval" : newPermitStatus === "expired" ? "warning" : "info",
        relatedId: bhId,
      })

      // Show toast notification
      if (shouldActivate) {
        toast.success("Permit Verified & Activated", {
          description: `${bh.name} has been approved and is now active.`,
        })
      } else if (newPermitStatus === "expired") {
        toast.warning("Permit Expired", {
          description: `${bh.name} permit is expired. Owner has been notified.`,
        })
      } else {
        toast.info("Permit Reviewed", {
          description: `${bh.name} permit status updated to ${newPermitStatus}.`,
        })
      }

      setBoardingHouses((prev) =>
        prev.map((b) =>
          b.id === bhId
            ? { ...b, permitStatus: newPermitStatus, isActive: shouldActivate }
            : b,
        ),
      )
      if (selectedBH?.id === bhId) {
        setSelectedBH((prev) =>
          prev
            ? {
                ...prev,
                permitStatus: newPermitStatus,
                isActive: shouldActivate,
              }
            : null,
        )
      }
    }
  }

  const handleRejectPermit = async (bhId: string) => {
    const bh = boardingHouses.find(b => b.id === bhId)
    if (!bh) return

    // Update in database - set as expired and inactive
    const success = await updateBoardingHouse(bhId, { 
      permitStatus: "expired" as const, 
      isActive: false 
    })
    
    if (success) {
      // Send notification to owner
      await createNotification({
        userId: bh.ownerId,
        title: "Boarding House Registration Rejected",
        message: `Your boarding house "${bh.name}" registration has been rejected. Please review your permit information and resubmit with valid documentation.`,
        type: "warning",
        relatedId: bhId,
      })

      // Show toast notification
      toast.error("Permit Rejected", {
        description: `${bh.name} has been rejected. Owner has been notified.`,
      })

      setBoardingHouses((prev) =>
        prev.map((b) =>
          b.id === bhId
            ? { ...b, permitStatus: "expired" as PermitStatus, isActive: false }
            : b,
        ),
      )
      if (selectedBH?.id === bhId) {
        setSelectedBH((prev) =>
          prev
            ? {
                ...prev,
                permitStatus: "expired" as PermitStatus,
                isActive: false,
              }
            : null,
        )
      }
    }
  }

  const viewDetails = (bh: BoardingHouse) => {
    setSelectedBH(bh)
    setIsDetailOpen(true)
  }

  const PermitCard = ({
    bh,
    onVerify,
    onReject,
    onViewDetails,
  }: {
    bh: BoardingHouse
    onVerify: (bhId: string) => void
    onReject: (bhId: string) => void
    onViewDetails: () => void
  }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted/50 rounded-lg gap-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-medium text-foreground">{bh.name}</h3>
          <Badge className={getPermitStatusColor(bh.permitStatus)}>{bh.permitStatus}</Badge>
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
        <p className="text-sm text-muted-foreground flex items-center gap-1.5">
          <MapPinned className="w-4 h-4" strokeWidth={2} />
          {bh.barangay} - {bh.address}
        </p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <ClipboardCheck className="w-4 h-4" strokeWidth={2} />
            {bh.permitNumber}
          </span>
          <span className="flex items-center gap-1.5">
            <CalendarDays className="w-4 h-4" strokeWidth={2} />
            Expires: {bh.permitExpiryDate}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onViewDetails}>
          <Eye className="w-5 h-5 mr-1" strokeWidth={2} />
          View
        </Button>
        {bh.permitStatus === "pending" && (
          <>
            <Button size="sm" onClick={() => onVerify(bh.id)} className="bg-success hover:bg-success/90">
              <CircleCheck className="w-5 h-5 mr-1" strokeWidth={2} />
              Verify
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="destructive">
                  <Ban className="w-5 h-5 mr-1" strokeWidth={2} />
                  Reject
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reject Permit?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to reject the permit for "{bh.name}"? The owner will be notified and will need to resubmit with valid documentation.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onReject(bh.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Reject
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Permit Verification</h1>
        <p className="text-muted-foreground">Review and verify business permits for boarding houses</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-warning/10 border-warning/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-warning-foreground">Pending</p>
                <p className="text-2xl font-bold text-warning">{pendingBH.length}</p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-warning/20">
                <Clock className="w-6 h-6 text-warning" strokeWidth={2} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-destructive/10 border-destructive/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-destructive">Expired</p>
                <p className="text-2xl font-bold text-destructive">{expiredBH.length}</p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-destructive/20">
                <CircleX className="w-6 h-6 text-destructive" strokeWidth={2} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-500/10 border-orange-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700 dark:text-orange-400">Near Expiry</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-500">{nearExpiryBH.length}</p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-orange-500/20">
                <TriangleAlert className="w-6 h-6 text-orange-600 dark:text-orange-500" strokeWidth={2} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-success/10 border-success/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-success">Valid</p>
                <p className="text-2xl font-bold text-success">{validBH.length}</p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-success/20">
                <CircleCheck className="w-6 h-6 text-success" strokeWidth={2} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground flex-shrink-0" strokeWidth={2} />
            <Input
              placeholder="Search by name or permit number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-sm sm:text-base"
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
        </div>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-2">
          <TabsTrigger value="pending" className="text-xs sm:text-sm">
            <Clock className="w-4 h-4 mr-1 sm:mr-2" strokeWidth={2} />
            <span className="hidden sm:inline">Pending ({pendingBH.length})</span>
            <span className="sm:hidden">{pendingBH.length}</span>
          </TabsTrigger>
          <TabsTrigger value="expired" className="text-xs sm:text-sm">
            <CircleX className="w-4 h-4 mr-1 sm:mr-2" strokeWidth={2} />
            <span className="hidden sm:inline">Expired ({expiredBH.length})</span>
            <span className="sm:hidden">{expiredBH.length}</span>
          </TabsTrigger>
          <TabsTrigger value="near-expiry" className="text-xs sm:text-sm">
            <TriangleAlert className="w-4 h-4 mr-1 sm:mr-2" strokeWidth={2} />
            <span className="hidden sm:inline">Near Expiry ({nearExpiryBH.length})</span>
            <span className="sm:hidden">Expiring</span>
          </TabsTrigger>
          <TabsTrigger value="valid" className="text-xs sm:text-sm">
            <CircleCheck className="w-4 h-4 mr-1 sm:mr-2" strokeWidth={2} />
            <span className="hidden sm:inline">Valid ({validBH.length})</span>
            <span className="sm:hidden">{validBH.length}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-3 sm:space-y-4">
          {pendingBH.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" strokeWidth={1.5} />
                <p className="text-muted-foreground text-sm sm:text-base">No pending permits</p>
              </CardContent>
            </Card>
          ) : (
            pendingBH.map((bh) => (
              <PermitCard
                key={bh.id}
                bh={bh}
                onVerify={handleVerifyPermit}
                onReject={handleRejectPermit}
                onViewDetails={() => {
                  setSelectedBH(bh)
                  setIsDetailOpen(true)
                }}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="expired" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Expired Permits</CardTitle>
              <CardDescription>Boarding houses with expired business permits</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {expiredBH.length === 0 ? (
                <div className="text-center py-8">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-success/15 mx-auto mb-4">
                    <CircleCheck className="w-8 h-8 text-success" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">No expired permits</h3>
                  <p className="text-muted-foreground">All permits are up to date</p>
                </div>
              ) : (
                expiredBH.map((bh) => (
                  <PermitCard
                    key={bh.id}
                    bh={bh}
                    onVerify={handleVerifyPermit}
                    onReject={handleRejectPermit}
                    onViewDetails={() => {
                      setSelectedBH(bh)
                      setIsDetailOpen(true)
                    }}
                  />
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="near-expiry" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Near Expiry</CardTitle>
              <CardDescription>Permits expiring soon - notify owners to renew</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {nearExpiryBH.length === 0 ? (
                <div className="text-center py-8">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-success/15 mx-auto mb-4">
                    <CircleCheck className="w-8 h-8 text-success" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">No permits near expiry</h3>
                  <p className="text-muted-foreground">All permits have sufficient validity</p>
                </div>
              ) : (
                nearExpiryBH.map((bh) => (
                  <PermitCard
                    key={bh.id}
                    bh={bh}
                    onVerify={handleVerifyPermit}
                    onReject={handleRejectPermit}
                    onViewDetails={() => {
                      setSelectedBH(bh)
                      setIsDetailOpen(true)
                    }}
                  />
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="valid" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Valid Permits</CardTitle>
              <CardDescription>Boarding houses with verified valid permits</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {validBH.length === 0 ? (
                <div className="text-center py-8">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted mx-auto mb-4">
                    <ClipboardCheck className="w-8 h-8 text-muted-foreground" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">No valid permits yet</h3>
                  <p className="text-muted-foreground">Verify pending permits to see them here</p>
                </div>
              ) : (
                validBH.map((bh) => (
                  <PermitCard
                    key={bh.id}
                    bh={bh}
                    onVerify={handleVerifyPermit}
                    onReject={handleRejectPermit}
                    onViewDetails={() => {
                      setSelectedBH(bh)
                      setIsDetailOpen(true)
                    }}
                  />
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedBH && (
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-2xl">{selectedBH.name}</DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">{selectedBH.address}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Permit Number</p>
                  <p className="font-mono text-sm">{selectedBH.permitNumber}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Status</p>
                  <p className="text-sm">
                    <Badge className={getPermitStatusColor(selectedBH.permitStatus)}>{selectedBH.permitStatus}</Badge>
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Issue Date</p>
                  <p className="text-sm">{selectedBH.permitIssueDate}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Expiry Date</p>
                  <p className="text-sm">{selectedBH.permitExpiryDate}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Contact</p>
                  <p className="text-sm">{selectedBH.contactNumber}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Barangay</p>
                  <p className="text-sm">{selectedBH.barangay}</p>
                </div>
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              {selectedBH.permitStatus === "pending" && (
                <>
                  <Button
                    onClick={() => {
                      handleVerifyPermit(selectedBH.id)
                      setIsDetailOpen(false)
                    }}
                    className="w-full sm:w-auto bg-success hover:bg-success/90"
                  >
                    <CircleCheck className="w-4 h-4 mr-2" strokeWidth={2} />
                    Verify Permit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-full sm:w-auto">
                        <Ban className="w-4 h-4 mr-2" strokeWidth={2} />
                        Reject
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Reject Permit?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to reject the permit for "{selectedBH.name}"? The owner will be notified and will need to resubmit with valid documentation.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => {
                            handleRejectPermit(selectedBH.id)
                            setIsDetailOpen(false)
                          }}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Reject
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
              <Button
                variant="outline"
                className="w-full sm:w-auto bg-transparent"
                onClick={() => setIsDetailOpen(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
