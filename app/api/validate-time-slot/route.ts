import { validateTimeSlotConflicts } from "@/lib/booking-validation"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { calendarId, dayOfWeek, startTime, endTime, excludeSlotId } = await request.json()

    if (!calendarId || dayOfWeek === undefined || !startTime || !endTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const validation = await validateTimeSlotConflicts(calendarId, dayOfWeek, startTime, endTime, excludeSlotId)

    return NextResponse.json(validation)
  } catch (error) {
    console.error("Time slot validation API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
