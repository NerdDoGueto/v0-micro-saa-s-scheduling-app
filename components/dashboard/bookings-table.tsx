"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Filter, X, Mail, Calendar, Clock } from "lucide-react"

interface Booking {
  id: string
  booking_date: string
  start_time: string
  end_time: string
  guest_name: string
  guest_email: string
  notes: string | null
  status: string
  created_at: string
  calendars: {
    id: string
    title: string
  }
  time_slots: {
    duration_minutes: number
  }[]
}

interface BookingsTableProps {
  bookings: Booking[]
  calendarList: Calendar[]
  currentFilters: {
    status: string
    calendar: string
    date: string
  }
}

interface Calendar {
  id: string
  title: string
}

export function BookingsTable({ bookings, calendarList, currentFilters }: BookingsTableProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Confirmed</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Cancelled</Badge>
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Completed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    const supabase = createClient()
    setIsLoading(true)

    try {
      const { error } = await supabase.from("bookings").update({ status: newStatus }).eq("id", bookingId)

      if (error) throw error

      router.refresh()
    } catch (error) {
      console.error("Error updating booking status:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = (filters: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString())

    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "all" && value !== "") {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })

    router.push(`/dashboard/bookings?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push("/dashboard/bookings")
  }

  const hasActiveFilters = currentFilters.status !== "all" || currentFilters.calendar || currentFilters.date

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>All Bookings</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="bg-transparent">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="mr-2 h-4 w-4" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="grid md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={currentFilters.status}
                onValueChange={(value) => applyFilters({ ...currentFilters, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Calendar</Label>
              <Select
                value={currentFilters.calendar}
                onValueChange={(value) => applyFilters({ ...currentFilters, calendar: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Calendars" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Calendars</SelectItem>
                  {calendarList.map((calendar) => (
                    <SelectItem key={calendar.id} value={calendar.id}>
                      {calendar.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={currentFilters.date}
                onChange={(e) => applyFilters({ ...currentFilters, date: e.target.value })}
              />
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Guest</TableHead>
                <TableHead>Calendar</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{booking.guest_name}</div>
                      <div className="text-sm text-muted-foreground flex items-center">
                        <Mail className="mr-1 h-3 w-3" />
                        {booking.guest_email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{booking.calendars.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{formatDate(booking.booking_date)}</div>
                      <div className="text-sm text-muted-foreground flex items-center">
                        <Clock className="mr-1 h-3 w-3" />
                        {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{booking.time_slots[0]?.duration_minutes || 30} min</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(booking.status)}</TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {new Date(booking.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" disabled={isLoading}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {booking.status === "confirmed" && (
                          <>
                            <DropdownMenuItem onClick={() => handleStatusChange(booking.id, "completed")}>
                              Mark as Completed
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(booking.id, "cancelled")}>
                              Cancel Booking
                            </DropdownMenuItem>
                          </>
                        )}
                        {booking.status === "cancelled" && (
                          <DropdownMenuItem onClick={() => handleStatusChange(booking.id, "confirmed")}>
                            Restore Booking
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => {
                            const subject = `Re: ${booking.calendars.title} - ${formatDate(booking.booking_date)}`
                            const body = `Hi ${booking.guest_name},\n\nRegarding your appointment on ${formatDate(booking.booking_date)} at ${formatTime(booking.start_time)}.\n\nBest regards`
                            window.location.href = `mailto:${booking.guest_email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
                          }}
                        >
                          Send Email
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
