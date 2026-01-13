"use client"

import Link from "next/link"
import { Building2, MapPin, Shield, BarChart3, Users, ClipboardCheck, ArrowRight, Menu, X } from "lucide-react"
import { useState } from "react"

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Building2 className="h-6 w-6 text-primary-foreground" strokeWidth={2} />
            </div>
            <span className="hidden font-semibold sm:inline">Midsalip BH System</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium hover:text-primary transition">
              Features
            </a>
            <a href="#how-it-works" className="text-sm font-medium hover:text-primary transition">
              How It Works
            </a>
          </div>

          {/* Desktop Actions */}
          <div className="hidden items-center gap-3 md:flex">
            <Link href="/login" className="text-sm font-medium hover:text-primary transition">
              Sign In
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-6 w-6" strokeWidth={2} /> : <Menu className="h-6 w-6" strokeWidth={2} />}
          </button>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-border px-4 py-4 md:hidden">
            <div className="flex flex-col gap-4">
              <a href="#features" className="text-sm font-medium hover:text-primary">
                Features
              </a>
              <a href="#how-it-works" className="text-sm font-medium hover:text-primary">
                How It Works
              </a>
              <Link href="/login" className="text-sm font-medium hover:text-primary">
                Sign In
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2 text-sm font-medium text-primary-foreground"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-12 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 sm:gap-12 lg:grid-cols-2 lg:gap-8 items-center">
            <div className="flex flex-col gap-4 sm:gap-6">
              <div>
                <p className="mb-2 inline-block rounded-full bg-primary/15 px-3 py-1 text-xs sm:text-sm font-medium text-primary">
                  Official Municipal System
                </p>
                <h1 className="text-pretty text-3xl sm:text-4xl lg:text-6xl font-bold tracking-tight">
                  Boarding House Management Made Simple
                </h1>
              </div>
              <p className="text-base sm:text-lg text-muted-foreground">
                Streamline registration, monitoring, and compliance for boarding houses across the Municipality of
                Midsalip. An efficient solution for property owners and local government administrators.
              </p>
              <div className="flex flex-col gap-3 w-full sm:w-auto">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 sm:px-8 py-3 font-medium text-primary-foreground hover:bg-primary/90 transition w-full sm:w-auto"
                >
                  Access Portal
                  <ArrowRight className="h-5 w-5" strokeWidth={2} />
                </Link>
                <button className="inline-flex items-center justify-center rounded-full border border-border px-6 sm:px-8 py-3 font-medium hover:bg-muted transition w-full sm:w-auto">
                  Learn More
                </button>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative hidden sm:block">
              <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 blur-2xl" />
              <img
                src="/HERO.jpg"
                alt="Boarding House Management System Dashboard"
                className="w-full rounded-2xl border border-border object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="border-t border-border px-4 py-16 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-pretty text-2xl sm:text-3xl lg:text-4xl font-bold">Powerful Features</h2>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg text-muted-foreground">
              Everything you need to manage boarding houses effectively
            </p>
          </div>

          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="rounded-xl border border-border bg-card p-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/15">
                <Building2 className="h-6 w-6 text-primary" strokeWidth={2} />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Property Registration</h3>
              <p className="text-muted-foreground">
                Easy-to-use registration forms for new boarding houses with complete compliance documentation.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-xl border border-border bg-card p-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-success/15">
                <BarChart3 className="h-6 w-6 text-success" strokeWidth={2} />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Real-time Monitoring</h3>
              <p className="text-muted-foreground">
                Track occupancy rates, room availability, and occupant information in real-time dashboards.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-xl border border-border bg-card p-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-warning/15">
                <MapPin className="h-6 w-6 text-warning" strokeWidth={2} />
              </div>
              <h3 className="mb-2 text-lg font-semibold">GIS Mapping</h3>
              <p className="text-muted-foreground">
                Interactive map view showing all registered boarding houses with location-based filtering.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="rounded-xl border border-border bg-card p-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-chart-2/40">
                <ClipboardCheck className="h-6 w-6 text-primary" strokeWidth={2} />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Permit Management</h3>
              <p className="text-muted-foreground">
                Streamlined permit verification and renewal tracking for administrators.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="rounded-xl border border-border bg-card p-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-success/15">
                <Users className="h-6 w-6 text-success" strokeWidth={2} />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Occupant Management</h3>
              <p className="text-muted-foreground">
                Maintain detailed records of residents with contact information and move-in dates.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="rounded-xl border border-border bg-card p-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/15">
                <Shield className="h-6 w-6 text-primary" strokeWidth={2} />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Secure Access</h3>
              <p className="text-muted-foreground">
                Role-based access control for property owners and municipal administrators.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="border-t border-border px-4 py-20 sm:px-6 lg:px-8 bg-muted/40">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-pretty text-3xl font-bold sm:text-4xl">How It Works</h2>
            <p className="mt-4 text-lg text-muted-foreground">Simple steps to get started with the system</p>
          </div>

          <div className="grid gap-8 md:grid-cols-4">
            {[
              { step: 1, title: "Register", description: "Create an account and sign in to the system" },
              { step: 2, title: "Add Property", description: "Register your boarding house with required details" },
              { step: 3, title: "Manage Rooms", description: "Add rooms and set occupancy information" },
              { step: 4, title: "Track Data", description: "Monitor occupants and compliance in real-time" },
            ].map((item) => (
              <div key={item.step} className="relative flex flex-col items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-primary bg-primary/10 font-bold text-primary text-lg">
                  {item.step}
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-lg">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-pretty text-3xl font-bold sm:text-4xl">Ready to Get Started?</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Join the Municipality of Midsalip's modern boarding house management system today.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 font-medium text-primary-foreground hover:bg-primary/90 transition"
            >
              Access Portal
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <Building2 className="h-5 w-5 text-primary-foreground" strokeWidth={2} />
                </div>
                <span className="font-semibold">Midsalip BH System</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Municipality of Midsalip's official boarding house management platform.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">System</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#features" className="text-muted-foreground hover:text-foreground">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="text-muted-foreground hover:text-foreground">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="/login" className="text-muted-foreground hover:text-foreground">
                    Portal
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2026 Municipality of Midsalip. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
