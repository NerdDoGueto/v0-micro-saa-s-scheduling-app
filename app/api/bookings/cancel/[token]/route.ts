import { createClient } from "@/lib/supabase/server"
import { sendCancellationConfirmation } from "@/lib/email"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const supabase = await createClient()

  try {
    // Find booking by cancellation token
    const { data: booking, error: findError } = await supabase
      .from("bookings")
      .select("*, calendars(title, user_id, profiles(full_name, email, username))")
      .eq("cancellation_token", token)
      .single()

    if (findError || !booking) {
      return NextResponse.json({ error: "Booking not found or invalid token" }, { status: 404 })
    }

    // Check if already cancelled
    if (booking.status === "cancelled") {
      return NextResponse.json({ error: "Booking is already cancelled" }, { status: 400 })
    }

    // Cancel the booking
    const { error: cancelError } = await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("cancellation_token", token)

    if (cancelError) {
      throw cancelError
    }

    try {
      await sendCancellationConfirmation({
        guestName: booking.guest_name,
        guestEmail: booking.guest_email,
        calendarTitle: booking.calendars.title,
        bookingDate: booking.booking_date,
        startTime: booking.start_time,
        hostName: booking.calendars.profiles.full_name || booking.calendars.profiles.username,
        hostEmail: booking.calendars.profiles.email,
      })
    } catch (emailError) {
      console.error("Failed to send cancellation emails:", emailError)
      // Don't fail the cancellation if email fails
    }

    // Return success response with booking details
    return NextResponse.json({
      success: true,
      booking: {
        guest_name: booking.guest_name,
        booking_date: booking.booking_date,
        start_time: booking.start_time,
        calendar_title: booking.calendars.title,
      },
    })
  } catch (error) {
    console.error("Error cancelling booking:", error)
    return NextResponse.json({ error: "Failed to cancel booking" }, { status: 500 })
  }
}
