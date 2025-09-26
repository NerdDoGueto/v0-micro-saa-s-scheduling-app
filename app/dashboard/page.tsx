import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CalendarList } from "@/components/dashboard/calendar-list"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"

export default async function DashboardPage() {
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

  // Get user calendars
  const { data: calendars } = await supabase
    .from("calendars")
    .select(`
      *,
      time_slots (*)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  // Get recent bookings for stats
  const { data: bookings } = await supabase
    .from("bookings")
    .select(`
      *,
      calendars!inner (user_id)
    `)
    .eq("calendars.user_id", user.id)
    .gte("booking_date", new Date().toISOString().split("T")[0])
    .order("created_at", { ascending: false })
    .limit(10)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader user={user} profile={profile} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {profile?.full_name || user.email}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">Manage your calendars and view your upcoming bookings</p>
        </div>

        <DashboardStats calendars={calendars || []} bookings={bookings || []} />

        <div className="mt-8">
          <CalendarList calendars={calendars || []} />
        </div>
      </main>
    </div>
  )
}
