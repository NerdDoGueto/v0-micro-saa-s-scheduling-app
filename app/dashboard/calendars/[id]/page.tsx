import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CalendarDetailView } from "@/components/dashboard/calendar-detail-view"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

interface CalendarDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function CalendarDetailPage({ params }: CalendarDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Get calendar with time slots
  const { data: calendar, error: calendarError } = await supabase
    .from("calendars")
    .select(`
      *,
      time_slots (*)
    `)
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (calendarError || !calendar) {
    notFound()
  }

  // Get bookings for this calendar
  const { data: bookings } = await supabase
    .from("bookings")
    .select(`
      *,
      time_slots (
        duration_minutes
      )
    `)
    .eq("calendar_id", id)
    .order("booking_date", { ascending: false })
    .order("start_time", { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader user={user} profile={profile} />

      <main className="container mx-auto px-4 py-8">
        <CalendarDetailView calendar={calendar} bookings={bookings || []} />
      </main>
    </div>
  )
}
