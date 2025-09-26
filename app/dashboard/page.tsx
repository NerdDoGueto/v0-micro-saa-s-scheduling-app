import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Users, Plus } from "lucide-react"
import Link from "next/link"

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

  // Get user's calendars count
  const { count: calendarsCount } = await supabase
    .from("calendars")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)

  // Get user's bookings count
  const { count: bookingsCount } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .eq("calendar_id", user.id)

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, {profile?.full_name || user.email}!
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">Manage your calendars and bookings from your dashboard.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Calendars</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{calendarsCount || 0}</div>
            <p className="text-xs text-muted-foreground">Active booking calendars</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookingsCount || 0}</div>
            <p className="text-xs text-muted-foreground">All time bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Booking Page</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium text-blue-600">
              {profile?.username ? `/u/${profile.username}` : "Set username"}
            </div>
            <p className="text-xs text-muted-foreground">Your public booking link</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started with your booking system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/dashboard/calendars/new">
              <Button className="w-full justify-start">
                <Plus className="mr-2 h-4 w-4" />
                Create New Calendar
              </Button>
            </Link>
            <Link href="/dashboard/settings">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Users className="mr-2 h-4 w-4" />
                Update Profile Settings
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Booking Link</CardTitle>
            <CardDescription>Share this link with your clients</CardDescription>
          </CardHeader>
          <CardContent>
            {profile?.username ? (
              <div className="space-y-4">
                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-md">
                  <code className="text-sm">
                    {typeof window !== "undefined" ? window.location.origin : "https://bookly-lite.com"}/u/
                    {profile.username}
                  </code>
                </div>
                <Button variant="outline" className="w-full bg-transparent">
                  Copy Link
                </Button>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-4">Set up your username to get your booking link</p>
                <Link href="/dashboard/settings">
                  <Button>Set Username</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
