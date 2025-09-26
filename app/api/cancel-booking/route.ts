import { createClient } from "@/lib/supabase/server"
import { sendEmail, generateCancellationConfirmationEmail } from "@/lib/email"
import { type NextRequest, NextResponse } from "next/server"
import { format } from "date-fns"

export async function POST(request: NextRequest) {
  try {
    const { cancellationToken } = await request.json()

    if (!cancellationToken) {
      return NextResponse.json({ error: "Cancellation token is required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get booking by cancellation token
    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select(`
        *,
        calendars (
          title,
          profiles (
            full_name,
            username
          )
        ),
        time_slots (
          duration_minutes
        )
      `)
      .eq("cancellation_token", cancellationToken)
      .single()

    if (fetchError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    if (booking.status === "cancelled") {
      return NextResponse.json({ error: "Booking is already cancelled" }, { status: 400 })
    }

    // Check if booking is in the past
    const bookingDateTime = new Date(`${booking.booking_date}T${booking.start_time}`)
    if (bookingDateTime < new Date()) {
      return NextResponse.json({ error: "Cannot cancel past appointments" }, { status: 400 })
    }

    // Update booking status to cancelled
    const { error: updateError } = await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("cancellation_token", cancellationToken)

    if (updateError) {
      return NextResponse.json({ error: "Failed to cancel booking" }, { status: 500 })
    }

    // Send cancellation confirmation email
    const bookingDate = new Date(`${booking.booking_date}T${booking.start_time}`)
    const endTime = new Date(`${booking.booking_date}T${booking.end_time}`)

    const formattedDate = format(bookingDate, "EEEE, MMMM d, yyyy")
    const formattedTime = `${format(bookingDate, "h:mm a")} - ${format(endTime, "h:mm a")}`

    const emailHtml = generateCancellationConfirmationEmail({
      guestName: booking.guest_name,
      calendarTitle: booking.calendars.title,
      date: formattedDate,
      time: formattedTime,
      ownerName: booking.calendars.profiles.full_name || booking.calendars.profiles.username,
    })

    await sendEmail({
      to: booking.guest_email,
      subject: `Booking Cancelled - ${booking.calendars.title}`,
      html: emailHtml,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Cancel booking error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
