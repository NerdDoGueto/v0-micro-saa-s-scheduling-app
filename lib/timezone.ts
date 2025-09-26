import { format, toZonedTime, fromZonedTime } from "date-fns-tz"

export function convertToUserTimezone(date: Date, timezone: string): Date {
  return toZonedTime(date, timezone)
}

export function convertFromUserTimezone(date: Date, timezone: string): Date {
  return fromZonedTime(date, timezone)
}

export function formatInTimezone(date: Date, timezone: string, formatStr = "yyyy-MM-dd HH:mm:ss"): string {
  const zonedDate = toZonedTime(date, timezone)
  return format(zonedDate, formatStr, { timeZone: timezone })
}

export function getCurrentTimeInTimezone(timezone: string): Date {
  return toZonedTime(new Date(), timezone)
}

export function createDateInTimezone(dateString: string, timeString: string, timezone: string): Date {
  const dateTimeString = `${dateString}T${timeString}`
  const localDate = new Date(dateTimeString)
  return fromZonedTime(localDate, timezone)
}

export function isValidTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone })
    return true
  } catch {
    return false
  }
}

export function getTimezoneOffset(timezone: string): string {
  const now = new Date()
  const utc = new Date(now.getTime() + now.getTimezoneOffset() * 60000)
  const targetTime = new Date(utc.toLocaleString("en-US", { timeZone: timezone }))
  const diff = targetTime.getTime() - utc.getTime()
  const hours = Math.floor(Math.abs(diff) / (1000 * 60 * 60))
  const minutes = Math.floor((Math.abs(diff) % (1000 * 60 * 60)) / (1000 * 60))
  const sign = diff >= 0 ? "+" : "-"
  return `${sign}${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
}
