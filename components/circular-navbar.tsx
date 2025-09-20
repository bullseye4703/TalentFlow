"use client"

import { useState, useEffect } from "react"
import { useRouter } from "@/lib/router"
import { Briefcase, Users, ClipboardList, Home } from "lucide-react"

const navItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/jobs", icon: Briefcase, label: "Jobs" },
  { path: "/candidates", icon: Users, label: "Candidates" },
  { path: "/assessments", icon: ClipboardList, label: "Assessments" },
]

export function CircularNavbar() {
  const { currentPath, navigate } = useRouter()
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      setIsVisible(currentScrollY < lastScrollY || currentScrollY < 100)
      setLastScrollY(currentScrollY)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY])

  return (
    <nav
      className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ease-out ${
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-20 opacity-0"
      }`}
    >
      <div className="bg-card/90 backdrop-blur-xl border border-border rounded-full p-2 shadow-2xl animate-fade-in-up">
        <div className="flex items-center space-x-1">
          {navItems.map((item, index) => {
            const Icon = item.icon
            const isActive = currentPath === item.path

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`relative group flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ease-out transform hover:scale-110 ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg animate-pulse-glow"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/20"
                }`}
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                <Icon className="w-5 h-5" />

                {/* Tooltip */}
                <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  <div className="bg-popover text-popover-foreground text-xs px-2 py-1 rounded-md shadow-lg whitespace-nowrap">
                    {item.label}
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-popover rotate-45"></div>
                  </div>
                </div>

                {/* Active indicator */}
                {isActive && (
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full animate-pulse"></div>
                )}

                {/* Hover ripple effect */}
                <div className="absolute inset-0 rounded-full bg-primary/20 scale-0 group-hover:scale-100 transition-transform duration-300 ease-out opacity-0 group-hover:opacity-100"></div>
              </button>
            )
          })}
        </div>

        {/* Floating background glow */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 blur-xl -z-10 animate-pulse"></div>
      </div>
    </nav>
  )
}
