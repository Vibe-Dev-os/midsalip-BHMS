export type UserRole = "admin" | "owner"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
}

export type PermitStatus = "valid" | "expired" | "near-expiry" | "pending"

export interface BoardingHouse {
  id: string
  ownerId: string
  name: string
  barangay: string
  address: string
  contactNumber: string
  permitNumber: string
  permitIssueDate: string
  permitExpiryDate: string
  permitDocument?: string
  latitude: number | null
  longitude: number | null
  priceMin?: number | null
  priceMax?: number | null
  genderAccommodation?: string | null
  isActive: boolean
  permitStatus: PermitStatus
  createdAt: string
  updatedAt: string
}

export interface Room {
  id: string
  boardingHouseId: string
  name: string
  capacity: number
  occupants: Occupant[]
}

export interface Occupant {
  id: string
  roomId: string
  name: string
  contactNumber: string
  moveInDate: string
}

export type NotificationType = "approval" | "rejection" | "warning" | "info"

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: NotificationType
  isRead: boolean
  relatedId?: string | null
  createdAt: string
}

export interface Owner extends User {
  role: "owner"
  boardingHouses: BoardingHouse[]
}
