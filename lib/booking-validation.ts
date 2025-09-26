import { createClient } from "@/lib/supabase/server"
import { addMinutes, isBefore, isAfter, isEqual } from "date-fns"

export interface BookingConflict {
  type: "overlap" | "buffer_violation" | "time_slot_unavailable" | "past_booking"
  message: string
  conflictingBooking?: any
}

export interface ValidationResult {
  isValid: boolean
  conflicts: BookingConflict[]
}

export async function validateBookingTime(
  calendarId: string,
  timeSlotId: string,
  bookingDate: string,
  startTime: string,
  endTime: string,
  excludeBookingId?: string,
): Promise<ValidationResult> {
  const supabase = await createClient()
  const conflicts: BookingConflict[] = []

  try {
    // Check if booking is in the past
    const bookingDateTime = new Date(`${bookingDate}T${startTime}`)
    const now = new Date()

    if (isBefore(bookingDateTime, now)) {
      conflicts.push({
        type: "past_booking",
        message: "Cannot book appointments in the past",
      })
    }

    // Get the time slot details
    const { data: timeSlot, error: timeSlotError } = await supabase
      .from("time_slots")
      .select("*")
      .eq("id", timeSlotId)
      .single()

    if (timeSlotError || !timeSlot) {
      conflicts.push({
        type: "time_slot_unavailable",
        message: "Time slot not found or unavailable",
      })
      return { isValid: false, conflicts }
    }

    // Check if time slot is active
    if (!timeSlot.is_active) {
      conflicts.push({
        type: "time_slot_unavailable",
        message: "This time slot is currently unavailable",
      })
    }

    // Validate that the booking time falls within the time slot
    const slotStart = new Date(`2000-01-01T${timeSlot.start_time}`)
    const slotEnd = new Date(`2000-01-01T${timeSlot.end_time}`)
    const bookingStart = new Date(`2000-01-01T${startTime}`)
    const bookingEnd = new Date(`2000-01-01T${endTime}`)

    if (isBefore(bookingStart, slotStart) || isAfter(bookingEnd, slotEnd)) {
      conflicts.push({
        type: "time_slot_unavailable",
        message: "Booking time is outside the available time slot",
      })
    }

    // Get existing bookings for the same date and calendar
    const { data: existingBookings, error: bookingsError } = await supabase
      .from("bookings")
      .select(`
        *,
        time_slots (
          buffer_minutes
        )
      `)
      .eq("calendar_id", calendarId)
      .eq("booking_date", bookingDate)
      .eq("status", "confirmed")
      .neq("id", excludeBookingId || "")

    if (bookingsError) {
      console.error("Error fetching existing bookings:", bookingsError)
      conflicts.push({
        type: "overlap",
        message: "Unable to validate booking conflicts",
      })
      return { isValid: false, conflicts }
    }

    // Check for overlaps and buffer violations
    const newBookingStart = new Date(`${bookingDate}T${startTime}`)
    const newBookingEnd = new Date(`${bookingDate}T${endTime}`)

    for (const existingBooking of existingBookings || []) {
      const existingStart = new Date(`${existingBooking.booking_date}T${existingBooking.start_time}`)
      const existingEnd = new Date(`${existingBooking.booking_date}T${existingBooking.end_time}`)
      const bufferMinutes = existingBooking.time_slots?.buffer_minutes || 0

      // Add buffer time to existing booking
      const existingEndWithBuffer = addMinutes(existingEnd, bufferMinutes)
      const existingStartWithBuffer = addMinutes(existingStart, -bufferMinutes)

      // Check for direct overlap
      const hasOverlap =
        ((isAfter(newBookingStart, existingStart) || isEqual(newBookingStart, existingStart)) &&
          (isBefore(newBookingStart, existingEnd) || isEqual(newBookingStart, existingEnd))) ||
        ((isAfter(newBookingEnd, existingStart) || isEqual(newBookingEnd, existingStart)) &&
          (isBefore(newBookingEnd, existingEnd) || isEqual(newBookingEnd, existingEnd))) ||
        ((isBefore(newBookingStart, existingStart) || isEqual(newBookingStart, existingStart)) &&
          (isAfter(newBookingEnd, existingEnd) || isEqual(newBookingEnd, existingEnd)))

      if (hasOverlap) {
        conflicts.push({
          type: "overlap",
          message: `This time slot overlaps with an existing booking at ${existingBooking.start_time}`,
          conflictingBooking: existingBooking,
        })
      }

      // Check for buffer violations
      const hasBufferViolation =
        bufferMinutes > 0 &&
        ((isAfter(newBookingStart, existingStart) && isBefore(newBookingStart, existingEndWithBuffer)) ||
          (isAfter(newBookingEnd, existingStartWithBuffer) && isBefore(newBookingEnd, existingEnd)) ||
          (isBefore(newBookingStart, existingStartWithBuffer) && isAfter(newBookingEnd, existingEndWithBuffer)))

      if (hasBufferViolation && !hasOverlap) {
        conflicts.push({
          type: "buffer_violation",
          message: `This booking violates the ${bufferMinutes}-minute buffer time around an existing appointment`,
          conflictingBooking: existingBooking,
        })
      }
    }

    return {
      isValid: conflicts.length === 0,
      conflicts,
    }
  } catch (error) {
    console.error("Booking validation error:", error)
    return {
      isValid: false,
      conflicts: [
        {
          type: "overlap",
          message: "Unable to validate booking due to system error",
        },
      ],
    }
  }
}

export async function validateTimeSlotConflicts(
  calendarId: string,
  dayOfWeek: number,
  startTime: string,
  endTime: string,
  excludeSlotId?: string,
): Promise<ValidationResult> {
  const supabase = await createClient()
  const conflicts: BookingConflict[] = []

  try {
    // Get existing time slots for the same day
    const { data: existingSlots, error } = await supabase
      .from("time_slots")
      .select("*")
      .eq("calendar_id", calendarId)
      .eq("day_of_week", dayOfWeek)
      .eq("is_active", true)
      .neq("id", excludeSlotId || "")

    if (error) {
      console.error("Error fetching time slots:", error)
      conflicts.push({
        type: "overlap",
        message: "Unable to validate time slot conflicts",
      })
      return { isValid: false, conflicts }
    }

    const newSlotStart = new Date(`2000-01-01T${startTime}`)
    const newSlotEnd = new Date(`2000-01-01T${endTime}`)

    // Validate that start time is before end time
    if (!isBefore(newSlotStart, newSlotEnd)) {
      conflicts.push({
        type: "overlap",
        message: "Start time must be before end time",
      })
    }

    // Check for overlaps with existing time slots
    for (const existingSlot of existingSlots || []) {
      const existingStart = new Date(`2000-01-01T${existingSlot.start_time}`)
      const existingEnd = new Date(`2000-01-01T${existingSlot.end_time}`)

      const hasOverlap =
        ((isAfter(newSlotStart, existingStart) || isEqual(newSlotStart, existingStart)) &&
          (isBefore(newSlotStart, existingEnd) || isEqual(newSlotStart, existingEnd))) ||
        ((isAfter(newSlotEnd, existingStart) || isEqual(newSlotEnd, existingStart)) &&
          (isBefore(newSlotEnd, existingEnd) || isEqual(newSlotEnd, existingEnd))) ||
        ((isBefore(newSlotStart, existingStart) || isEqual(newSlotStart, existingStart)) &&
          (isAfter(newSlotEnd, existingEnd) || isEqual(newSlotEnd, existingEnd)))

      if (hasOverlap) {
        conflicts.push({
          type: "overlap",
          message: `This time slot overlaps with an existing slot (${existingSlot.start_time} - ${existingSlot.end_time})`,
        })
      }
    }

    return {
      isValid: conflicts.length === 0,
      conflicts,
    }
  } catch (error) {
    console.error("Time slot validation error:", error)
    return {
      isValid: false,
      conflicts: [
        {
          type: "overlap",
          message: "Unable to validate time slot due to system error",
        },
      ],
    }
  }
}
