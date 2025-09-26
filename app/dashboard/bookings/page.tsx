import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { BookingsTable } from "@/components/dashboard/bookings-table"
import { BookingsStats } from "@/components/dashboard/bookings-stats"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Download, Calendar } from "lucide-react"

interface SearchParams {
  status?: string
  calendar?: string
  date?: string
}

interface BookingsPageProps {
  searchParams: Promise<SearchParams>
}

export default async function BookingsPage({ searchParams }: BookingsPageProps) {
  const params = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Get user's calendars for filtering
  const { data: calendars } = await supabase
    .from("calendars")
    .select("id, title")
    .eq("user_id", user.id)
    .order("title", { ascending: true })

  // Build query for bookings
  let bookingsQuery = supabase
    .from("bookings")
    .select(`
      *,
      calendars!inner(id, title, user_id),
      time_slots(duration_minutes)
    `)
    .eq("calendars.user_id", user.id)
    .order("booking_date", { ascending: false })
    .order("start_time", { ascending: false })

  // Apply filters
  if (params.status && params.status !== "all") {
    bookingsQuery = bookingsQuery.eq("status", params.status)
  }

  if (params.calendar) {
    bookingsQuery = bookingsQuery.eq("calendar_id", params.calendar)
  }

  if (params.date) {
    bookingsQuery = bookingsQuery.eq("booking_date", params.date)
  }

  const { data: bookings } = await bookingsQuery

  // Get booking statistics
  const { data: stats } = await supabase
    .from("bookings")
    .select(`
      status,
      calendars!inner(user_id)
    `)
    .eq("calendars.user_id", user.id)

  const bookingStats = {
    total: stats?.length || 0,
    confirmed: stats?.filter((b) => b.status === "confirmed").length || 0,
    cancelled: stats?.filter((b) => b.status === "cancelled").length || 0,
    completed: stats?.filter((b) => b.status === "completed").length || 0,
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Bookings Management</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">View and manage all your appointments and bookings.</p>
        </div>
        <div className="flex items-center space-x-4">
          <form action="/api/bookings/export" method="GET">
            <input type="hidden" name="user_id" value={user.id} />
            <Button type="submit" variant="outline" className="bg-transparent">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </form>
        </div>
      </div>

      {/* Stats */}
      <BookingsStats stats={bookingStats} />

      {/* Bookings Table */}
      {bookings && bookings.length > 0 ? (
        <BookingsTable
          bookings={bookings}
          calendars={calendars || []}
          currentFilters={{
            status: params.status || "all",
            calendar: params.calendar || "",
            date: params.date || "",
          }}
        />
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No bookings found</h3>
            <p className="text-gray-600 dark:text-gray-300">
              {Object.keys(params).length > 0
                ? "No bookings match your current filters. Try adjusting your search criteria."
                : "You don't have any bookings yet. Once clients start booking appointments, they'll appear here."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
