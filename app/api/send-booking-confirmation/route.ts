import { createClient } from "@/lib/supabase/server"
import { sendEmail, generateBookingConfirmationEmail } from "@/lib/email"
import { type NextRequest, NextResponse } from "next/server"
import { format } from "date-fns"

export async function POST(request: NextRequest) {
  try {
    const { bookingId } = await request.json()

    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID is required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get booking details with related data
    const { data: booking, error } = await supabase
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
      .eq("id", bookingId)
      .single()

    if (error || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Format date and time
    const bookingDate = new Date(`${booking.booking_date}T${booking.start_time}`)
    const endTime = new Date(`${booking.booking_date}T${booking.end_time}`)

    const formattedDate = format(bookingDate, "EEEE, MMMM d, yyyy")
    const formattedTime = `${format(bookingDate, "h:mm a")} - ${format(endTime, "h:mm a")}`

    // Generate cancellation URL
    const cancellationUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/cancel/${booking.cancellation_token}`

    // Generate email HTML
    const emailHtml = generateBookingConfirmationEmail({
      guestName: booking.guest_name,
      calendarTitle: booking.calendars.title,
      date: formattedDate,
      time: formattedTime,
      duration: booking.time_slots.duration_minutes,
      ownerName: booking.calendars.profiles.full_name || booking.calendars.profiles.username,
      cancellationUrl,
      notes: booking.notes,
    })

    // Send email
    const emailResult = await sendEmail({
      to: booking.guest_email,
      subject: `Booking Confirmation - ${booking.calendars.title}`,
      html: emailHtml,
    })

    if (!emailResult.success) {
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Send confirmation email error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
