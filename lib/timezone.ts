/**
 * Timezone utilities for handling booking times across different timezones
 */

export function convertToUserTimezone(utcTime: string, timezone: string): string {
  try {
    const date = new Date(`2000-01-01T${utcTime}Z`)
    return date.toLocaleTimeString("en-US", {
      timeZone: timezone,
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch (error) {
    console.error("Error converting timezone:", error)
    return utcTime
  }
}

export function convertFromUserTimezone(localTime: string, timezone: string): string {
  try {
    // Create a date in the user's timezone
    const today = new Date().toISOString().split("T")[0]
    const localDateTime = new Date(`${today}T${localTime}`)

    // Get the timezone offset
    const utcTime = new Date(localDateTime.toLocaleString("en-US", { timeZone: "UTC" }))
    const userTime = new Date(localDateTime.toLocaleString("en-US", { timeZone: timezone }))
    const offset = utcTime.getTime() - userTime.getTime()

    // Apply offset to get UTC time
    const utcDateTime = new Date(localDateTime.getTime() + offset)

    return utcDateTime.toTimeString().slice(0, 5)
  } catch (error) {
    console.error("Error converting from timezone:", error)
    return localTime
  }
}

export function getTimezoneOffset(timezone: string): number {
  try {
    const now = new Date()
    const utc = new Date(now.toLocaleString("en-US", { timeZone: "UTC" }))
    const local = new Date(now.toLocaleString("en-US", { timeZone: timezone }))
    return (utc.getTime() - local.getTime()) / (1000 * 60) // Return offset in minutes
  } catch (error) {
    console.error("Error getting timezone offset:", error)
    return 0
  }
}

export function formatTimeInTimezone(time: string, timezone: string): string {
  try {
    const date = new Date(`2000-01-01T${time}`)
    return date.toLocaleTimeString("en-US", {
      timeZone: timezone,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  } catch (error) {
    console.error("Error formatting time in timezone:", error)
    return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }
}
