import { isDemoMode } from "@/helpers/isDemoMode"
import {
  logEvent as fbLogEvent,
  getAnalytics,
  setCurrentScreen as fbSetCurrentScreen,
} from "@firebase/analytics"

export const logEvent = (name: string, extraData: any) => {
  if (typeof window !== "undefined") {
    if (isDemoMode()) {
      console.debug("ANALYTICS LOG:", name, extraData)
    } else {
      const analytics = getAnalytics()
      fbLogEvent(analytics, name, extraData)
    }
  }
}

export const setCurrentScreen = (name: string) => {
  if (typeof window !== "undefined") {
    if (isDemoMode()) {
      console.debug("SETTING SCREEN:", name)
    } else {
      const analytics = getAnalytics()
      fbSetCurrentScreen(analytics, name)
    }
  }
}
