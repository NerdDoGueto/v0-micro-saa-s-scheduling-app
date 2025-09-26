import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Plus, Settings, Eye } from "lucide-react"
import Link from "next/link"

export default async function CalendarsPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Get user's calendars
  const { data: calendars } = await supabase
    .from("calendars")
    .select("*, time_slots(count)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Your Calendars</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Create and manage your booking calendars and availability.
          </p>
        </div>
        <Link href="/dashboard/calendars/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Calendar
          </Button>
        </Link>
      </div>

      {/* Calendars Grid */}
      {calendars && calendars.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {calendars.map((calendar) => (
            <Card key={calendar.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: calendar.color || "#3B82F6" }} />
                    <CardTitle className="text-lg">{calendar.title}</CardTitle>
                  </div>
                  <Badge variant={calendar.is_active ? "default" : "secondary"}>
                    {calendar.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2">{calendar.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    {/* @ts-expect-error - Supabase count aggregation */}
                    {calendar.time_slots?.[0]?.count || 0} time slots configured
                  </div>
                  <div className="flex space-x-2">
                    <Link href={`/dashboard/calendars/${calendar.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full bg-transparent">
                        <Settings className="mr-2 h-4 w-4" />
                        Manage
                      </Button>
                    </Link>
                    <Link href={`/dashboard/calendars/${calendar.id}/preview`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No calendars yet</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Create your first calendar to start accepting bookings from clients.
            </p>
            <Link href="/dashboard/calendars/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Calendar
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
