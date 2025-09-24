import * as React from "react"

/**
 * The breakpoint for mobile devices, in pixels.
 * @type {number}
 */
const MOBILE_BREAKPOINT = 768

/**
 * A custom hook for detecting if the user is on a mobile device.
 * It uses a media query to check if the window width is less than the mobile breakpoint.
 * @returns {boolean} `true` if the device is considered mobile, `false` otherwise.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)

    /**
     * Updates the `isMobile` state when the media query changes.
     */
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)

    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
