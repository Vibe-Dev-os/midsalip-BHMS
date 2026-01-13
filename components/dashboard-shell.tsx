"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { NotificationBell } from "@/components/notification-bell"
import { cn } from "@/lib/utils"
import {
  Landmark,
  LayoutGrid,
  Building,
  MapPinned,
  ClipboardCheck,
  LogOut,
  Menu,
  X,
  ChevronRight,
  CircleUser,
} from "lucide-react"

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
}

const ownerNavItems: NavItem[] = [
  { title: "Dashboard", href: "/owner", icon: <LayoutGrid className="w-6 h-6" strokeWidth={2} /> },
  {
    title: "My Boarding Houses",
    href: "/owner/boarding-houses",
    icon: <Building className="w-6 h-6" strokeWidth={2} />,
  },
  { title: "Register New", href: "/owner/register", icon: <ClipboardCheck className="w-6 h-6" strokeWidth={2} /> },
]

const adminNavItems: NavItem[] = [
  { title: "Dashboard", href: "/admin", icon: <LayoutGrid className="w-6 h-6" strokeWidth={2} /> },
  {
    title: "All Boarding Houses",
    href: "/admin/boarding-houses",
    icon: <Building className="w-6 h-6" strokeWidth={2} />,
  },
  { title: "GIS Map", href: "/admin/map", icon: <MapPinned className="w-6 h-6" strokeWidth={2} /> },
  {
    title: "Permit Verification",
    href: "/admin/permits",
    icon: <ClipboardCheck className="w-6 h-6" strokeWidth={2} />,
  },
]

interface DashboardShellProps {
  children: React.ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()

  const isAdmin = user?.role === "admin"
  const navItems = isAdmin ? adminNavItems : ownerNavItems

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-sidebar border-b border-sidebar-border flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {sidebarOpen ? <X className="w-7 h-7" strokeWidth={2} /> : <Menu className="w-7 h-7" strokeWidth={2} />}
          </Button>
          <div className="flex items-center gap-2">
            <Landmark className="w-7 h-7 text-sidebar-primary" strokeWidth={2} />
            <span className="font-semibold text-sidebar-foreground">Midsalip BHMS</span>
          </div>
        </div>
        {user?.role === "owner" && <NotificationBell />}
      </header>

      {/* Desktop Header */}
      <header className="hidden lg:block fixed top-0 left-64 right-0 z-40 h-16 bg-background border-b flex items-center justify-end px-6">
        {user?.role === "owner" && <NotificationBell />}
      </header>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center gap-3 px-4 border-b border-sidebar-border">
            <div className="flex items-center justify-center w-11 h-11 rounded-lg bg-sidebar-primary">
              <Landmark className="w-6 h-6 text-sidebar-primary-foreground" strokeWidth={2} />
            </div>
            <div>
              <h2 className="font-semibold text-sidebar-foreground text-sm">Midsalip</h2>
              <p className="text-xs text-sidebar-foreground/70">Boarding House System</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  {item.icon}
                  {item.title}
                  {isActive && <ChevronRight className="w-5 h-5 ml-auto" strokeWidth={2.5} />}
                </Link>
              )
            })}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center justify-center w-11 h-11 rounded-full bg-sidebar-accent">
                <CircleUser className="w-6 h-6 text-sidebar-accent-foreground" strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.name}</p>
                <p className="text-xs text-sidebar-foreground/70 truncate capitalize">{user?.role}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5 mr-2" strokeWidth={2} />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:pl-64 pt-16 min-h-screen">
        <div className="p-4 lg:p-6 lg:pt-20">{children}</div>
      </main>
    </div>
  )
}
