"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { DashboardShell } from "@/components/dashboard-shell"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Wait for auth state to be restored before redirecting
    if (isLoading) return
    
    if (!isAuthenticated) {
      router.push("/")
    } else if (user?.role !== "admin") {
      router.push("/owner")
    }
  }, [isAuthenticated, user, router, isLoading])

  // Show loading while restoring auth state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return null
  }

  return <DashboardShell>{children}</DashboardShell>
}
