"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface RouterContextType {
  currentPath: string
  navigate: (path: string) => void
  params: Record<string, string>
}

const RouterContext = createContext<RouterContextType | null>(null)

export function Router({ children }: { children: React.ReactNode }) {
  const [currentPath, setCurrentPath] = useState("/")
  const [params, setParams] = useState<Record<string, string>>({})

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname)
      parseParams(window.location.pathname)
    }

    window.addEventListener("popstate", handlePopState)
    handlePopState() // Set initial path

    return () => window.removeEventListener("popstate", handlePopState)
  }, [])

  const parseParams = (path: string) => {
    const segments = path.split("/").filter(Boolean)
    const newParams: Record<string, string> = {}

    // Simple param parsing for routes like /jobs/:id
    if (segments[0] === "jobs" && segments[1]) {
      newParams.jobId = segments[1]
    } else if (segments[0] === "candidates" && segments[1]) {
      newParams.candidateId = segments[1]
    } else if (segments[0] === "assessments" && segments[1]) {
      newParams.assessmentId = segments[1]
    } else if (segments[0] === "assessment" && segments[1]) {
      newParams.shareableLink = segments[1]
    }

    setParams(newParams)
  }

  const navigate = (path: string) => {
    window.history.pushState({}, "", path)
    setCurrentPath(path)
    parseParams(path)
  }

  return <RouterContext.Provider value={{ currentPath, navigate, params }}>{children}</RouterContext.Provider>
}

export function useRouter() {
  const context = useContext(RouterContext)
  if (!context) {
    throw new Error("useRouter must be used within a Router")
  }
  return context
}

export function Route({ path, component: Component }: { path: string; component: React.ComponentType }) {
  const { currentPath } = useRouter()

  // Simple path matching
  const isMatch = currentPath === path || (path.includes(":") && matchDynamicRoute(path, currentPath))

  return isMatch ? <Component /> : null
}

function matchDynamicRoute(pattern: string, path: string): boolean {
  const patternSegments = pattern.split("/").filter(Boolean)
  const pathSegments = path.split("/").filter(Boolean)

  if (patternSegments.length !== pathSegments.length) return false

  return patternSegments.every((segment, index) => segment.startsWith(":") || segment === pathSegments[index])
}
