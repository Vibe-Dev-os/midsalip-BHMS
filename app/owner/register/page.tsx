"use client"

import type React from "react"

import { useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { createBoardingHouse, createRoom } from "@/lib/data-service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { MapPicker } from "@/components/map-picker"
import { ArrowLeft, Building, CloudUpload, CircleCheck, LoaderCircle, DoorOpen, AlertCircle, CalendarIcon } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

import { MIDSALIP_BARANGAYS } from "@/lib/constants"

const BARANGAYS = MIDSALIP_BARANGAYS

export default function RegisterBoardingHouse() {
  const router = useRouter()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [touched, setTouched] = useState(false) // Track if form was submitted

  const [formData, setFormData] = useState({
    name: "",
    barangay: "",
    street: "",
    houseNumber: "",
    landmarks: "",
    contactNumber: "",
    permitNumber: "",
    permitIssueDate: "",
    permitExpiryDate: "",
    permitDocument: null as File | null,
    latitude: null as number | null,
    longitude: null as number | null,
    totalRooms: "",
    bedsPerRoom: "",
    priceMin: "",
    priceMax: "",
    genderAccommodation: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, barangay: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFormData((prev) => ({ ...prev, permitDocument: file }))
  }

  const handleLocationChange = useCallback((lat: number, lng: number) => {
    setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }))
  }, [])

  const handleGenderChange = (value: string) => {
    setFormData((prev) => ({ ...prev, genderAccommodation: value }))
  }

  // Validation errors
  const getFieldErrors = () => {
    const errors: Record<string, string> = {}
    
    if (!formData.name.trim()) errors.name = "Boarding house name is required"
    if (!formData.barangay) errors.barangay = "Please select a barangay"
    if (!formData.street.trim()) errors.street = "Street name is required"
    if (!formData.contactNumber.trim()) errors.contactNumber = "Contact number is required"
    if (!formData.totalRooms) errors.totalRooms = "Total rooms is required"
    if (!formData.bedsPerRoom) errors.bedsPerRoom = "Beds per room is required"
    if (!formData.priceMin) errors.priceMin = "Minimum price is required"
    if (!formData.priceMax) errors.priceMax = "Maximum price is required"
    if (!formData.genderAccommodation) errors.genderAccommodation = "Please select gender accommodation"
    if (!formData.permitNumber.trim()) errors.permitNumber = "Business permit number is required"
    if (!formData.permitIssueDate) {
      errors.permitIssueDate = "Permit issue date is required"
    }
    if (!formData.permitExpiryDate) {
      errors.permitExpiryDate = "Permit expiry date is required"
    } else {
      // Validate expiry date is in the future
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const [expYear, expMonth, expDay] = formData.permitExpiryDate.split('-').map(Number)
      const expiryDate = new Date(expYear, expMonth - 1, expDay)
      
      if (expiryDate <= today) {
        errors.permitExpiryDate = "Expiry date must be after today"
      } else if (formData.permitIssueDate) {
        // Check that expiry is at least 1 year from issue date
        const [issYear, issMonth, issDay] = formData.permitIssueDate.split('-').map(Number)
        const issueDate = new Date(issYear, issMonth - 1, issDay)
        const minExpiryDate = new Date(issYear + 1, issMonth - 1, issDay) // 1 year from issue
        
        if (expiryDate < minExpiryDate) {
          errors.permitExpiryDate = "Expiry date must be at least 1 year from issue date"
        }
      }
    }
    if (!formData.latitude || !formData.longitude) errors.location = "Please pin the location on the map"
    
    return errors
  }

  const fieldErrors = touched ? getFieldErrors() : {}
  const hasErrors = Object.keys(fieldErrors).length > 0

  // Function to scroll to the first error field
  const scrollToFirstError = (errors: Record<string, string>) => {
    const errorFieldIds: Record<string, string> = {
      name: "name",
      barangay: "barangay",
      street: "street",
      contactNumber: "contactNumber",
      totalRooms: "totalRooms",
      bedsPerRoom: "bedsPerRoom",
      priceMin: "priceMin",
      priceMax: "priceMax",
      genderAccommodation: "genderAccommodation",
      permitNumber: "permitNumber",
      permitIssueDate: "permitIssueDate",
      permitExpiryDate: "permitExpiryDate",
      location: "map-section",
    }

    const firstErrorKey = Object.keys(errors)[0]
    if (firstErrorKey && errorFieldIds[firstErrorKey]) {
      const element = document.getElementById(errorFieldIds[firstErrorKey])
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" })
        // Focus the element if it's an input
        if (element.tagName === "INPUT") {
          setTimeout(() => element.focus(), 500)
        }
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(true) // Mark form as touched to show errors
    setError(null)

    // Check for validation errors
    const errors = getFieldErrors()
    if (Object.keys(errors).length > 0) {
      setError("Please fill in all required fields")
      toast.error("Validation Error", {
        description: "Please fill in all required fields before submitting.",
      })
      // Scroll to first error field
      scrollToFirstError(errors)
      return
    }

    setIsSubmitting(true)

    if (!user || !user.id) {
      setError("User not authenticated")
      toast.error("Authentication Error", {
        description: "You must be logged in to register a boarding house.",
      })
      setIsSubmitting(false)
      return
    }

    // Validate that expiry date is in the future
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const [year, month, day] = formData.permitExpiryDate.split('-').map(Number)
    const expiryDate = new Date(year, month - 1, day)
    
    if (expiryDate <= today) {
      setError("Permit expiry date must be in the future")
      toast.error("Invalid Expiry Date", {
        description: "The permit expiry date must be after today's date.",
      })
      setIsSubmitting(false)
      return
    }

    try {
      // New registrations always start as "pending" for admin review
      // Admin will verify and approve, then the system will calculate actual permit status

      // Prepare boarding house data
      const boardingHouseData = {
        ownerId: user.id,
        name: formData.name,
        barangay: formData.barangay,
        address: `${formData.houseNumber} ${formData.street}, ${formData.barangay}${formData.landmarks ? ` (${formData.landmarks})` : ''}`,
        contactNumber: formData.contactNumber,
        permitNumber: formData.permitNumber,
        permitIssueDate: formData.permitIssueDate,
        permitExpiryDate: formData.permitExpiryDate,
        permitDocument: formData.permitDocument?.name || null,
        latitude: formData.latitude,
        longitude: formData.longitude,
        priceMin: formData.priceMin ? Number.parseFloat(formData.priceMin) : null,
        priceMax: formData.priceMax ? Number.parseFloat(formData.priceMax) : null,
        genderAccommodation: formData.genderAccommodation || null,
        isActive: false, // Start as inactive, admin will activate after verification
        permitStatus: "pending" as const, // Always pending until admin approves
      }

      // Create boarding house
      const boardingHouseId = await createBoardingHouse(boardingHouseData)
      
      if (!boardingHouseId) {
        throw new Error('Failed to create boarding house')
      }

      // Create rooms based on totalRooms and bedsPerRoom
      const totalRooms = Number.parseInt(formData.totalRooms) || 0
      const bedsPerRoom = Number.parseInt(formData.bedsPerRoom) || 1

      for (let i = 1; i <= totalRooms; i++) {
        await createRoom({
          boardingHouseId: boardingHouseId,
          name: `Room ${i}`,
          capacity: bedsPerRoom,
        })
      }

      setSuccess(true)
      setIsSubmitting(false)

      // Redirect after success message
      setTimeout(() => {
        router.push("/owner/boarding-houses")
      }, 2000)
    } catch (error) {
      console.error('Error creating boarding house:', error)
      setError('Failed to register boarding house. Please try again.')
      toast.error("Registration Failed", {
        description: "Failed to register boarding house. Please try again.",
      })
      setIsSubmitting(false)
    }
  }

  const isFormValid =
    formData.name &&
    formData.barangay &&
    formData.street &&
    formData.contactNumber &&
    formData.permitNumber &&
    formData.permitIssueDate &&
    formData.permitExpiryDate &&
    formData.latitude &&
    formData.longitude &&
    formData.totalRooms &&
    formData.bedsPerRoom &&
    formData.priceMin &&
    formData.priceMax &&
    formData.genderAccommodation

  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="border-success">
          <CardContent className="py-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
                <CircleCheck className="w-8 h-8 text-success" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Registration Submitted!</h2>
            <p className="text-muted-foreground mb-4">
              Your boarding house registration has been submitted for verification by the LGU.
            </p>
            <p className="text-sm text-muted-foreground">Redirecting to your boarding houses...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/owner">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Register Boarding House</h1>
          <p className="text-muted-foreground">Add a new boarding house property to your portfolio</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5 text-primary" />
              Basic Information
            </CardTitle>
            <CardDescription>Enter the details of your boarding house</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Boarding House Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Casa Esperanza Boarding House"
                required
                className={`bg-background ${fieldErrors.name ? "border-destructive" : ""}`}
              />
              {fieldErrors.name && (
                <p className="text-sm text-destructive">{fieldErrors.name}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="barangay">Barangay *</Label>
                <Select value={formData.barangay} onValueChange={handleSelectChange}>
                  <SelectTrigger className={`bg-background ${fieldErrors.barangay ? "border-destructive" : ""}`}>
                    <SelectValue placeholder="Select barangay" />
                  </SelectTrigger>
                  <SelectContent>
                    {BARANGAYS.map((brgy) => (
                      <SelectItem key={brgy} value={brgy}>
                        {brgy}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.barangay && (
                  <p className="text-sm text-destructive">{fieldErrors.barangay}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactNumber">Contact Number *</Label>
                <Input
                  id="contactNumber"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  placeholder="09171234567"
                  required
                  className={`bg-background ${fieldErrors.contactNumber ? "border-destructive" : ""}`}
                />
                {fieldErrors.contactNumber && (
                  <p className="text-sm text-destructive">{fieldErrors.contactNumber}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="street">Street Name *</Label>
              <Input
                id="street"
                name="street"
                value={formData.street}
                onChange={handleInputChange}
                placeholder="e.g., National Highway"
                required
                className={`bg-background ${fieldErrors.street ? "border-destructive" : ""}`}
              />
              {fieldErrors.street && (
                <p className="text-sm text-destructive">{fieldErrors.street}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="houseNumber">House/Building Number</Label>
                <Input
                  id="houseNumber"
                  name="houseNumber"
                  value={formData.houseNumber}
                  onChange={handleInputChange}
                  placeholder="e.g., 123"
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="landmarks">Nearby Landmarks</Label>
                <Input
                  id="landmarks"
                  name="landmarks"
                  value={formData.landmarks}
                  onChange={handleInputChange}
                  placeholder="e.g., Near Municipal Hall"
                  className="bg-background"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Room Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DoorOpen className="w-5 h-5 text-primary" />
              Room Information
            </CardTitle>
            <CardDescription>Provide details about rooms and accommodations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalRooms">Total Available Rooms *</Label>
                <Input
                  id="totalRooms"
                  name="totalRooms"
                  type="number"
                  min="1"
                  value={formData.totalRooms}
                  onChange={handleInputChange}
                  placeholder="e.g., 10"
                  required
                  className={`bg-background ${fieldErrors.totalRooms ? "border-destructive" : ""}`}
                />
                {fieldErrors.totalRooms && (
                  <p className="text-sm text-destructive">{fieldErrors.totalRooms}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bedsPerRoom">Beds/Capacity per Room *</Label>
                <Input
                  id="bedsPerRoom"
                  name="bedsPerRoom"
                  type="number"
                  min="1"
                  value={formData.bedsPerRoom}
                  onChange={handleInputChange}
                  placeholder="e.g., 4"
                  required
                  className={`bg-background ${fieldErrors.bedsPerRoom ? "border-destructive" : ""}`}
                />
                {fieldErrors.bedsPerRoom && (
                  <p className="text-sm text-destructive">{fieldErrors.bedsPerRoom}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Price Range per Month *</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priceMin" className="text-sm text-muted-foreground">
                    Minimum Price (₱)
                  </Label>
                  <Input
                    id="priceMin"
                    name="priceMin"
                    type="number"
                    min="0"
                    value={formData.priceMin}
                    onChange={handleInputChange}
                    placeholder="e.g., 2000"
                    required
                    className={`bg-background ${fieldErrors.priceMin ? "border-destructive" : ""}`}
                  />
                  {fieldErrors.priceMin && (
                    <p className="text-sm text-destructive">{fieldErrors.priceMin}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priceMax" className="text-sm text-muted-foreground">
                    Maximum Price (₱)
                  </Label>
                  <Input
                    id="priceMax"
                    name="priceMax"
                    type="number"
                    min="0"
                    value={formData.priceMax}
                    onChange={handleInputChange}
                    placeholder="e.g., 5000"
                    required
                    className={`bg-background ${fieldErrors.priceMax ? "border-destructive" : ""}`}
                  />
                  {fieldErrors.priceMax && (
                    <p className="text-sm text-destructive">{fieldErrors.priceMax}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="genderAccommodation">Gender Accommodation *</Label>
              <Select value={formData.genderAccommodation} onValueChange={handleGenderChange}>
                <SelectTrigger className={`bg-background ${fieldErrors.genderAccommodation ? "border-destructive" : ""}`}>
                  <SelectValue placeholder="Select accommodation type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="boys-only">Boys Only</SelectItem>
                  <SelectItem value="girls-only">Girls Only</SelectItem>
                  <SelectItem value="both">Both (Boys and Girls)</SelectItem>
                </SelectContent>
              </Select>
              {fieldErrors.genderAccommodation && (
                <p className="text-sm text-destructive">{fieldErrors.genderAccommodation}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Business Permit */}
        <Card>
          <CardHeader>
            <CardTitle>Business Permit Details</CardTitle>
            <CardDescription>Provide your valid business permit information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Guide for users */}
            <Alert className="bg-primary/5 border-primary/20">
              <AlertCircle className="h-4 w-4 text-primary" />
              <AlertDescription className="text-sm">
                <strong>Important:</strong> Business permits must be valid for at least 1 year. Please ensure your permit expiry date is at least 1 year from the issue date.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="permitNumber">Business Permit Number *</Label>
              <Input
                id="permitNumber"
                name="permitNumber"
                value={formData.permitNumber}
                onChange={handleInputChange}
                placeholder="e.g., BP-2024-001"
                required
                className={`bg-background ${fieldErrors.permitNumber ? "border-destructive" : ""}`}
              />
              {fieldErrors.permitNumber && (
                <p className="text-sm text-destructive">{fieldErrors.permitNumber}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="permitIssueDate">Issue Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="permitIssueDate"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-background",
                        !formData.permitIssueDate && "text-muted-foreground",
                        fieldErrors.permitIssueDate && "border-destructive"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.permitIssueDate ? (
                        format(new Date(formData.permitIssueDate + "T00:00:00"), "PPP")
                      ) : (
                        <span>Select issue date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.permitIssueDate ? new Date(formData.permitIssueDate + "T00:00:00") : undefined}
                      onSelect={(date) => {
                        if (date) {
                          const formatted = format(date, "yyyy-MM-dd")
                          setFormData((prev) => ({ ...prev, permitIssueDate: formatted }))
                        }
                      }}
                      disabled={(date) => date > new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {fieldErrors.permitIssueDate && (
                  <p className="text-sm text-destructive">{fieldErrors.permitIssueDate}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="permitExpiryDate">Expiry Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="permitExpiryDate"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-background",
                        !formData.permitExpiryDate && "text-muted-foreground",
                        fieldErrors.permitExpiryDate && "border-destructive"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.permitExpiryDate ? (
                        format(new Date(formData.permitExpiryDate + "T00:00:00"), "PPP")
                      ) : (
                        <span>Select expiry date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.permitExpiryDate ? new Date(formData.permitExpiryDate + "T00:00:00") : undefined}
                      onSelect={(date) => {
                        if (date) {
                          const formatted = format(date, "yyyy-MM-dd")
                          setFormData((prev) => ({ ...prev, permitExpiryDate: formatted }))
                        }
                      }}
                      disabled={(date) => {
                        const today = new Date()
                        today.setHours(0, 0, 0, 0)
                        return date <= today
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {fieldErrors.permitExpiryDate && (
                  <p className="text-sm text-destructive">{fieldErrors.permitExpiryDate}</p>
                )}
                <p className="text-xs text-muted-foreground">Must be a future date, at least 1 year from issue date</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="permitDocument">Upload Permit Document (Optional)</Label>
              <div className="flex items-center gap-4">
                <label
                  htmlFor="permitDocument"
                  className="flex items-center gap-2 px-4 py-2 border border-dashed rounded-lg cursor-pointer hover:bg-muted transition-colors"
                >
                  <CloudUpload className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {formData.permitDocument ? formData.permitDocument.name : "Choose file"}
                  </span>
                </label>
                <Input
                  id="permitDocument"
                  name="permitDocument"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
              <p className="text-xs text-muted-foreground">Accepted formats: PDF, JPG, PNG (Max 5MB)</p>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card id="map-section">
          <CardHeader>
            <CardTitle>Location on Map</CardTitle>
            <CardDescription>Pin the exact location of your boarding house on the map</CardDescription>
          </CardHeader>
          <CardContent>
            <MapPicker
              latitude={formData.latitude}
              longitude={formData.longitude}
              onLocationChange={handleLocationChange}
              selectedBarangay={formData.barangay}
            />

            {fieldErrors.location && (
              <Alert className="mt-4 bg-destructive/10 border-destructive/50" variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{fieldErrors.location}</AlertDescription>
              </Alert>
            )}

            {!fieldErrors.location && !formData.latitude && !formData.longitude && (
              <Alert className="mt-4 bg-warning/10 border-warning/50">
                <AlertDescription className="text-warning-foreground">
                  Location pinning is required. Your boarding house must have a pinned location to be activated.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex items-center justify-end gap-4">
          <Button type="button" variant="outline" asChild>
            <Link href="/owner">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Registration"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
