import { createClient } from "@/lib/supabase/server"

interface TimeSlot {
  id: string
  start_time: string
  end_time: string
  duration_minutes: number
  buffer_minutes: number
}

interface BookingConflict {
  hasConflict: boolean
  conflictingBooking?: {
    id: string
    guest_name: string
    start_time: string
    end_time: string
  }
  message?: string
}

/**
 * Check for booking conflicts including buffer time
 */
export async function checkBookingConflicts(
  calendarId: string,
  bookingDate: string,
  startTime: string,
  timeSlot: TimeSlot,
  excludeBookingId?: string,
): Promise<BookingConflict> {
  const supabase = await createClient()

  try {
    // Calculate the actual time range including buffer
    const startDateTime = new Date(`2000-01-01T${startTime}`)
    const endDateTime = new Date(startDateTime.getTime() + timeSlot.duration_minutes * 60000)
    const bufferStartDateTime = new Date(startDateTime.getTime() - timeSlot.buffer_minutes * 60000)
    const bufferEndDateTime = new Date(endDateTime.getTime() + timeSlot.buffer_minutes * 60000)

    const bufferStartTime = bufferStartDateTime.toTimeString().slice(0, 5)
    const bufferEndTime = bufferEndDateTime.toTimeString().slice(0, 5)

    // Query for conflicting bookings
    let query = supabase
      .from("bookings")
      .select("id, guest_name, start_time, end_time")
      .eq("calendar_id", calendarId)
      .eq("booking_date", bookingDate)
      .neq("status", "cancelled")

    if (excludeBookingId) {
      query = query.neq("id", excludeBookingId)
    }

    const { data: existingBookings, error } = await query

    if (error) {
      throw error
    }

    // Check for time conflicts
    for (const booking of existingBookings || []) {
      const existingStart = booking.start_time
      const existingEnd = booking.end_time

      // Check if the new booking (with buffer) overlaps with existing booking
      const hasOverlap =
        (bufferStartTime < existingEnd && bufferEndTime > existingStart) ||
        (existingStart < bufferEndTime && existingEnd > bufferStartTime)

      if (hasOverlap) {
        return {
          hasConflict: true,
          conflictingBooking: booking,
          message: `This time slot conflicts with an existing booking for ${booking.guest_name} from ${formatTime(existingStart)} to ${formatTime(existingEnd)}.`,
        }
      }
    }

    return { hasConflict: false }
  } catch (error) {
    console.error("Error checking booking conflicts:", error)
    return {
      hasConflict: true,
      message: "Unable to verify booking availability. Please try again.",
    }
  }
}

/**
 * Validate that the booking time falls within the time slot's availability
 */
export function validateTimeSlotAvailability(
  bookingDate: string,
  startTime: string,
  timeSlot: TimeSlot,
): { isValid: boolean; message?: string } {
  try {
    const bookingDay = new Date(bookingDate).getDay()
    const bookingStartTime = startTime

    // Check if the booking time matches the time slot start time
    if (bookingStartTime !== timeSlot.start_time) {
      return {
        isValid: false,
        message: "Booking time does not match available time slot.",
      }
    }

    // Check if booking is not in the past
    const now = new Date()
    const bookingDateTime = new Date(`${bookingDate}T${startTime}`)

    if (bookingDateTime <= now) {
      return {
        isValid: false,
        message: "Cannot book appointments in the past.",
      }
    }

    // Check if booking is not too far in the future (e.g., 6 months)
    const sixMonthsFromNow = new Date()
    sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6)

    if (bookingDateTime > sixMonthsFromNow) {
      return {
        isValid: false,
        message: "Cannot book appointments more than 6 months in advance.",
      }
    }

    return { isValid: true }
  } catch (error) {
    console.error("Error validating time slot availability:", error)
    return {
      isValid: false,
      message: "Invalid booking time format.",
    }
  }
}

/**
 * Check if a time slot is available on a specific date
 */
export async function isTimeSlotAvailable(
  calendarId: string,
  timeSlotId: string,
  bookingDate: string,
  startTime: string,
): Promise<{ available: boolean; message?: string }> {
  const supabase = await createClient()

  try {
    // Get the time slot details
    const { data: timeSlot, error: timeSlotError } = await supabase
      .from("time_slots")
      .select("*")
      .eq("id", timeSlotId)
      .eq("is_active", true)
      .single()

    if (timeSlotError || !timeSlot) {
      return {
        available: false,
        message: "Time slot not found or is inactive.",
      }
    }

    // Validate the booking date and time
    const validation = validateTimeSlotAvailability(bookingDate, startTime, timeSlot)
    if (!validation.isValid) {
      return {
        available: false,
        message: validation.message,
      }
    }

    // Check for conflicts
    const conflictCheck = await checkBookingConflicts(calendarId, bookingDate, startTime, timeSlot)
    if (conflictCheck.hasConflict) {
      return {
        available: false,
        message: conflictCheck.message,
      }
    }

    return { available: true }
  } catch (error) {
    console.error("Error checking time slot availability:", error)
    return {
      available: false,
      message: "Unable to check availability. Please try again.",
    }
  }
}

function formatTime(time: string): string {
  return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}
