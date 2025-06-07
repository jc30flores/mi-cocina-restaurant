
import * as React from "react"

export enum BreakpointSize {
  xs = 0,
  sm = 640,
  md = 768,
  lg = 1024,
  xl = 1280,
  "2xl" = 1536,
}

type Breakpoint = keyof typeof BreakpointSize;

export function useBreakpoint(breakpoint: Breakpoint) {
  const [isAboveBreakpoint, setIsAboveBreakpoint] = React.useState<boolean>(false)
  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
    
    const checkBreakpoint = () => {
      const windowWidth = window.innerWidth
      setIsAboveBreakpoint(windowWidth >= BreakpointSize[breakpoint])
    }
    
    // Initial check
    checkBreakpoint()
    
    // Add event listener for resize
    window.addEventListener("resize", checkBreakpoint)
    
    return () => window.removeEventListener("resize", checkBreakpoint)
  }, [breakpoint])

  return isMounted ? isAboveBreakpoint : false
}

export function useIsMobile() {
  return !useBreakpoint("md") 
}

export function useIsTablet() {
  const isAboveMobile = useBreakpoint("md")
  const isBelowDesktop = !useBreakpoint("lg")
  
  return isAboveMobile && isBelowDesktop
}

export function useIsDesktop() {
  return useBreakpoint("lg")
}

export function useScreenSize() {
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()
  const isDesktop = useIsDesktop()
  
  return { isMobile, isTablet, isDesktop }
}
