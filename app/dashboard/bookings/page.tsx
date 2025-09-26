import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { BookingsManager } from "@/components/dashboard/bookings-manager"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

export default async function BookingsPage() {
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

  // Get user's bookings with related data
  const { data: bookings } = await supabase
    .from("bookings")
    .select(`
      *,
      calendars!inner (
        id,
        title,
        color,
        user_id
      ),
      time_slots (
        duration_minutes
      )
    `)
    .eq("calendars.user_id", user.id)
    .order("booking_date", { ascending: false })
    .order("start_time", { ascending: false })

  // Get user calendars for filtering
  const { data: calendars } = await supabase
    .from("calendars")
    .select("id, title, color")
    .eq("user_id", user.id)
    .order("title")

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader user={user} profile={profile} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Bookings Management</h1>
          <p className="text-gray-600 dark:text-gray-300">View and manage all your appointments</p>
        </div>

        <BookingsManager bookings={bookings || []} calendars={calendars || []} />
      </main>
    </div>
  )
}
