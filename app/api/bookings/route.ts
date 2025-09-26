import { createClient } from "@/lib/supabase/server"
import { sendBookingConfirmation } from "@/lib/email"
import { isTimeSlotAvailable, checkBookingConflicts } from "@/lib/booking-validation"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { calendarId, timeSlotId, bookingDate, startTime, guestName, guestEmail, notes } = body

    // Validate required fields
    if (!calendarId || !timeSlotId || !bookingDate || !startTime || !guestName || !guestEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get calendar and host details
    const { data: calendar, error: calendarError } = await supabase
      .from("calendars")
      .select("*, profiles(full_name, email, username, timezone)")
      .eq("id", calendarId)
      .eq("is_active", true)
      .single()

    if (calendarError || !calendar) {
      return NextResponse.json({ error: "Calendar not found or inactive" }, { status: 404 })
    }

    // Get time slot details
    const { data: timeSlot, error: timeSlotError } = await supabase
      .from("time_slots")
      .select("*")
      .eq("id", timeSlotId)
      .eq("is_active", true)
      .single()

    if (timeSlotError || !timeSlot) {
      return NextResponse.json({ error: "Time slot not found or inactive" }, { status: 404 })
    }

    const availabilityCheck = await isTimeSlotAvailable(calendarId, timeSlotId, bookingDate, startTime)
    if (!availabilityCheck.available) {
      return NextResponse.json({ error: availabilityCheck.message }, { status: 409 })
    }

    const conflictCheck = await checkBookingConflicts(calendarId, bookingDate, startTime, timeSlot)
    if (conflictCheck.hasConflict) {
      return NextResponse.json({ error: conflictCheck.message }, { status: 409 })
    }

    // Generate cancellation token
    const cancellationToken = crypto.randomUUID()

    // Calculate end time
    const startDateTime = new Date(`2000-01-01T${startTime}`)
    const endDateTime = new Date(startDateTime.getTime() + timeSlot.duration_minutes * 60000)
    const endTime = endDateTime.toTimeString().slice(0, 5)

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        calendar_id: calendarId,
        time_slot_id: timeSlotId,
        booking_date: bookingDate,
        start_time: startTime,
        end_time: endTime,
        guest_name: guestName.trim(),
        guest_email: guestEmail.toLowerCase().trim(),
        notes: notes?.trim() || null,
        status: "confirmed",
        cancellation_token: cancellationToken,
      })
      .select()
      .single()

    if (bookingError) {
      // Check if it's a unique constraint violation (race condition)
      if (bookingError.code === "23505") {
        return NextResponse.json(
          { error: "This time slot was just booked by someone else. Please select another time." },
          { status: 409 },
        )
      }
      console.error("Booking creation error:", bookingError)
      return NextResponse.json({ error: "Failed to create booking" }, { status: 500 })
    }

    // Send email confirmation
    try {
      await sendBookingConfirmation({
        guestName,
        guestEmail,
        calendarTitle: calendar.title,
        bookingDate,
        startTime,
        endTime,
        duration: timeSlot.duration_minutes,
        hostName: calendar.profiles.full_name || calendar.profiles.username,
        hostEmail: calendar.profiles.email,
        notes,
        cancellationToken,
        bookingId: booking.id,
      })
    } catch (emailError) {
      console.error("Failed to send email confirmation:", emailError)
      // Don't fail the booking if email fails
    }

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        booking_date: booking.booking_date,
        start_time: booking.start_time,
        end_time: booking.end_time,
        status: booking.status,
      },
    })
  } catch (error) {
    console.error("Error creating booking:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
