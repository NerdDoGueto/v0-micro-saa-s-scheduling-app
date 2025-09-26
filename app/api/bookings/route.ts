import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { calendar_id, time_slot_id, guest_name, guest_email, booking_date, start_time, end_time, notes } = body

    const supabase = await createClient()

    // Validate required fields
    if (!calendar_id || !time_slot_id || !guest_name || !guest_email || !booking_date || !start_time || !end_time) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if the time slot is still available
    const { data: existingBooking } = await supabase
      .from("bookings")
      .select("id")
      .eq("calendar_id", calendar_id)
      .eq("booking_date", booking_date)
      .eq("start_time", start_time)
      .eq("status", "confirmed")
      .single()

    if (existingBooking) {
      return NextResponse.json({ error: "This time slot is no longer available" }, { status: 409 })
    }

    // Generate cancellation token
    const cancellationToken = crypto.randomUUID()

    // Create the booking
    const { data, error } = await supabase
      .from("bookings")
      .insert({
        calendar_id,
        time_slot_id,
        guest_name,
        guest_email,
        booking_date,
        start_time,
        end_time,
        notes: notes || null,
        cancellation_token: cancellationToken,
        status: "confirmed",
      })
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to create booking" }, { status: 500 })
    }

    return NextResponse.json({ booking: data }, { status: 201 })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
