import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CalendarSettings } from "@/components/dashboard/calendar-settings"
import { TimeSlotsList } from "@/components/dashboard/time-slots-list"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface CalendarPageProps {
  params: Promise<{ id: string }>
}

export default async function CalendarPage({ params }: CalendarPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Get calendar details
  const { data: calendar } = await supabase.from("calendars").select("*").eq("id", id).eq("user_id", user.id).single()

  if (!calendar) {
    redirect("/dashboard/calendars")
  }

  // Get time slots for this calendar
  const { data: timeSlots } = await supabase
    .from("time_slots")
    .select("*")
    .eq("calendar_id", id)
    .order("day_of_week", { ascending: true })
    .order("start_time", { ascending: true })

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/calendars">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Calendars
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{calendar.title}</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Manage your calendar settings and time slots.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Calendar Settings */}
        <CalendarSettings calendar={calendar} />

        {/* Time Slots */}
        <TimeSlotsList calendarId={id} timeSlots={timeSlots || []} />
      </div>
    </div>
  )
}
