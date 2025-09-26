import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, Users, TrendingUp } from "lucide-react"

interface DashboardStatsProps {
  calendars: any[]
  bookings: any[]
}

export function DashboardStats({ calendars, bookings }: DashboardStatsProps) {
  const activeCalendars = calendars.filter((cal) => cal.is_active).length
  const totalTimeSlots = calendars.reduce((acc, cal) => acc + (cal.time_slots?.length || 0), 0)
  const upcomingBookings = bookings.filter(
    (booking) => booking.status === "confirmed" && new Date(booking.booking_date) >= new Date(),
  ).length
  const thisWeekBookings = bookings.filter((booking) => {
    const bookingDate = new Date(booking.booking_date)
    const today = new Date()
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    return bookingDate >= today && bookingDate <= weekFromNow
  }).length

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Calendars</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeCalendars}</div>
          <p className="text-xs text-muted-foreground">{calendars.length} total calendars</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Time Slots</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalTimeSlots}</div>
          <p className="text-xs text-muted-foreground">Available time slots</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Upcoming Bookings</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{upcomingBookings}</div>
          <p className="text-xs text-muted-foreground">Confirmed appointments</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">This Week</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{thisWeekBookings}</div>
          <p className="text-xs text-muted-foreground">Bookings this week</p>
        </CardContent>
      </Card>
    </div>
  )
}
