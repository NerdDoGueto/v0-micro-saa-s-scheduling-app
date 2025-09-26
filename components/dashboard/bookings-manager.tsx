"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, User, Mail, FileText, Download, Search, Filter, X } from "lucide-react"
import { format, isAfter, isBefore, startOfDay, endOfDay } from "date-fns"
import { BookingDetailsDialog } from "./booking-details-dialog"

interface BookingsManagerProps {
  bookings: any[]
  calendars: any[]
}

export function BookingsManager({ bookings, calendars }: BookingsManagerProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [calendarFilter, setCalendarFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [selectedBooking, setSelectedBooking] = useState<any>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const matchesSearch =
          booking.guest_name.toLowerCase().includes(searchLower) ||
          booking.guest_email.toLowerCase().includes(searchLower) ||
          booking.calendars.title.toLowerCase().includes(searchLower)
        if (!matchesSearch) return false
      }

      // Status filter
      if (statusFilter !== "all" && booking.status !== statusFilter) {
        return false
      }

      // Calendar filter
      if (calendarFilter !== "all" && booking.calendar_id !== calendarFilter) {
        return false
      }

      // Date filter
      if (dateFilter !== "all") {
        const bookingDate = new Date(booking.booking_date)
        const today = startOfDay(new Date())

        switch (dateFilter) {
          case "upcoming":
            if (!isAfter(bookingDate, today)) return false
            break
          case "past":
            if (!isBefore(bookingDate, today)) return false
            break
          case "today":
            if (!(bookingDate >= today && bookingDate <= endOfDay(new Date()))) return false
            break
        }
      }

      return true
    })
  }, [bookings, searchTerm, statusFilter, calendarFilter, dateFilter])

  const handleExportCSV = () => {
    const csvData = filteredBookings.map((booking) => ({
      Date: booking.booking_date,
      Time: `${booking.start_time} - ${booking.end_time}`,
      Service: booking.calendars.title,
      "Guest Name": booking.guest_name,
      "Guest Email": booking.guest_email,
      Status: booking.status,
      Notes: booking.notes || "",
      "Created At": format(new Date(booking.created_at), "yyyy-MM-dd HH:mm:ss"),
    }))

    const csvContent = [
      Object.keys(csvData[0]).join(","),
      ...csvData.map((row) =>
        Object.values(row)
          .map((value) => `"${value}"`)
          .join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `bookings-${format(new Date(), "yyyy-MM-dd")}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setCalendarFilter("all")
    setDateFilter("all")
  }

  const hasActiveFilters = searchTerm || statusFilter !== "all" || calendarFilter !== "all" || dateFilter !== "all"

  const handleViewDetails = (booking: any) => {
    setSelectedBooking(booking)
    setShowDetailsDialog(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300"
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={calendarFilter} onValueChange={setCalendarFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Calendar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Calendars</SelectItem>
                {calendars.map((calendar) => (
                  <SelectItem key={calendar.id} value={calendar.id}>
                    {calendar.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dates</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="past">Past</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters} className="flex-1 bg-transparent">
                  <X className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              )}
              <Button onClick={handleExportCSV} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Showing {filteredBookings.length} of {bookings.length} bookings
        </p>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No bookings found</h3>
            <p className="text-gray-600 dark:text-gray-300 text-center">
              {hasActiveFilters ? "Try adjusting your filters" : "You don't have any bookings yet"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredBookings.map((booking) => {
            const bookingDate = new Date(`${booking.booking_date}T${booking.start_time}`)
            const endTime = new Date(`${booking.booking_date}T${booking.end_time}`)
            const isUpcoming = isAfter(bookingDate, new Date())

            return (
              <Card key={booking.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: booking.calendars.color }} />
                          <h3 className="font-semibold text-lg">{booking.calendars.title}</h3>
                        </div>
                        <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                        {isUpcoming && (
                          <Badge variant="outline" className="text-blue-600 border-blue-600">
                            Upcoming
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span>{format(bookingDate, "EEEE, MMMM d, yyyy")}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span>
                            {format(bookingDate, "h:mm a")} - {format(endTime, "h:mm a")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span>{booking.guest_name}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <Mail className="h-4 w-4" />
                        <span>{booking.guest_email}</span>
                      </div>

                      {booking.notes && (
                        <div className="flex items-start gap-2 text-sm">
                          <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
                          <span className="text-gray-600 dark:text-gray-300">{booking.notes}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleViewDetails(booking)}>
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Booking Details Dialog */}
      {selectedBooking && (
        <BookingDetailsDialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog} booking={selectedBooking} />
      )}
    </div>
  )
}
