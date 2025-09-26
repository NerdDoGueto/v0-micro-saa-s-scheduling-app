"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Users, Settings, ArrowLeft, ExternalLink, BarChart3 } from "lucide-react"
import Link from "next/link"
import { format, isAfter } from "date-fns"
import { ManageTimeSlotsDialog } from "./manage-time-slots-dialog"

interface CalendarDetailViewProps {
  calendar: any
  bookings: any[]
}

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export function CalendarDetailView({ calendar, bookings }: CalendarDetailViewProps) {
  const [showTimeSlotsDialog, setShowTimeSlotsDialog] = useState(false)

  const confirmedBookings = bookings.filter((booking) => booking.status === "confirmed")
  const upcomingBookings = confirmedBookings.filter((booking) =>
    isAfter(new Date(`${booking.booking_date}T${booking.start_time}`), new Date()),
  )
  const totalRevenue = confirmedBookings.length * 50 // Placeholder calculation

  const timeSlotsByDay =
    calendar.time_slots?.reduce((acc: any, slot: any) => {
      if (!acc[slot.day_of_week]) {
        acc[slot.day_of_week] = []
      }
      acc[slot.day_of_week].push(slot)
      return acc
    }, {}) || {}

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const recentBookings = bookings.slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: calendar.color }} />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{calendar.title}</h1>
            <Badge variant={calendar.is_active ? "default" : "secondary"}>
              {calendar.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowTimeSlotsDialog(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Manage Time Slots
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/u/${calendar.profiles?.username}`} target="_blank">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Public Page
            </Link>
          </Button>
        </div>
      </div>

      {/* Description */}
      {calendar.description && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-600 dark:text-gray-300">{calendar.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookings.length}</div>
            <p className="text-xs text-muted-foreground">{confirmedBookings.length} confirmed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingBookings.length}</div>
            <p className="text-xs text-muted-foreground">Scheduled appointments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Slots</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{calendar.time_slots?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Available slots</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue}</div>
            <p className="text-xs text-muted-foreground">Estimated total</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time Slots */}
        <Card>
          <CardHeader>
            <CardTitle>Time Slots</CardTitle>
            <CardDescription>Your availability schedule</CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(timeSlotsByDay).length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 dark:text-gray-300">No time slots configured</p>
                <Button variant="outline" className="mt-2 bg-transparent" onClick={() => setShowTimeSlotsDialog(true)}>
                  Add Time Slots
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(timeSlotsByDay)
                  .sort(([a], [b]) => Number.parseInt(a) - Number.parseInt(b))
                  .map(([dayOfWeek, slots]: [string, any]) => (
                    <div key={dayOfWeek} className="border rounded-lg p-3">
                      <h4 className="font-medium mb-2">{DAYS_OF_WEEK[Number.parseInt(dayOfWeek)]}</h4>
                      <div className="space-y-1">
                        {slots.map((slot: any) => (
                          <div key={slot.id} className="text-sm text-gray-600 dark:text-gray-300">
                            {formatTime(slot.start_time)} - {formatTime(slot.end_time)} ({slot.duration_minutes}min
                            slots)
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
            <CardDescription>Latest appointments for this calendar</CardDescription>
          </CardHeader>
          <CardContent>
            {recentBookings.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 dark:text-gray-300">No bookings yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentBookings.map((booking) => {
                  const bookingDate = new Date(`${booking.booking_date}T${booking.start_time}`)
                  const endTime = new Date(`${booking.booking_date}T${booking.end_time}`)

                  return (
                    <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{booking.guest_name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {format(bookingDate, "MMM d, yyyy")} at {format(bookingDate, "h:mm a")}
                        </div>
                      </div>
                      <Badge
                        variant={booking.status === "confirmed" ? "default" : "secondary"}
                        className={
                          booking.status === "confirmed"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                            : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                        }
                      >
                        {booking.status}
                      </Badge>
                    </div>
                  )
                })}
                <div className="text-center pt-2">
                  <Link href="/dashboard/bookings">
                    <Button variant="outline" size="sm">
                      View All Bookings
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Manage Time Slots Dialog */}
      <ManageTimeSlotsDialog open={showTimeSlotsDialog} onOpenChange={setShowTimeSlotsDialog} calendar={calendar} />
    </div>
  )
}
