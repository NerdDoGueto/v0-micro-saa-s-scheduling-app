import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("user_id")

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 })
  }

  const supabase = await createClient()

  try {
    // Verify user authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user || user.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all bookings for the user
    const { data: bookings, error } = await supabase
      .from("bookings")
      .select(`
        *,
        calendars!inner(title, user_id),
        time_slots(duration_minutes)
      `)
      .eq("calendars.user_id", userId)
      .order("booking_date", { ascending: false })
      .order("start_time", { ascending: false })

    if (error) {
      throw error
    }

    // Generate CSV content
    const csvHeaders = [
      "Booking ID",
      "Guest Name",
      "Guest Email",
      "Calendar",
      "Date",
      "Start Time",
      "End Time",
      "Duration (min)",
      "Status",
      "Notes",
      "Created At",
    ]

    const csvRows = bookings?.map((booking) => [
      booking.id,
      booking.guest_name,
      booking.guest_email,
      booking.calendars.title,
      booking.booking_date,
      booking.start_time,
      booking.end_time,
      booking.time_slots[0]?.duration_minutes || 30,
      booking.status,
      booking.notes || "",
      new Date(booking.created_at).toISOString(),
    ])

    const csvContent = [csvHeaders, ...(csvRows || [])]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n")

    // Return CSV file
    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="bookings-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error("Error exporting bookings:", error)
    return NextResponse.json({ error: "Failed to export bookings" }, { status: 500 })
  }
}
