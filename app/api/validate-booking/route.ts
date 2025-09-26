import { validateBookingTime } from "@/lib/booking-validation"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { calendarId, timeSlotId, bookingDate, startTime, endTime, excludeBookingId } = await request.json()

    if (!calendarId || !timeSlotId || !bookingDate || !startTime || !endTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const validation = await validateBookingTime(
      calendarId,
      timeSlotId,
      bookingDate,
      startTime,
      endTime,
      excludeBookingId,
    )

    return NextResponse.json(validation)
  } catch (error) {
    console.error("Validation API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
