"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Calendar, Clock, User, Mail, FileText, ExternalLink, Trash2 } from "lucide-react"
import { format } from "date-fns"

interface BookingDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  booking: any
}

export function BookingDetailsDialog({ open, onOpenChange, booking }: BookingDetailsDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleCancelBooking = async () => {
    if (!booking.cancellation_token) {
      toast({
        title: "Error",
        description: "No cancellation token found for this booking",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/cancel-booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cancellationToken: booking.cancellation_token,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to cancel booking")
      }

      toast({
        title: "Booking cancelled",
        description: "The booking has been successfully cancelled",
      })

      onOpenChange(false)
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to cancel booking",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!booking) return null

  const bookingDate = new Date(`${booking.booking_date}T${booking.start_time}`)
  const endTime = new Date(`${booking.booking_date}T${booking.end_time}`)
  const isPastBooking = bookingDate < new Date()
  const canCancel = booking.status === "confirmed" && !isPastBooking

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Booking Details
          </DialogTitle>
          <DialogDescription>Complete information about this appointment</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Service */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: booking.calendars.color }} />
              <h3 className="text-lg font-semibold">{booking.calendars.title}</h3>
            </div>
            <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="font-medium">{format(bookingDate, "EEEE, MMMM d, yyyy")}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {format(bookingDate, "h:mm a")} - {format(endTime, "h:mm a")}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="font-medium">Duration</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {booking.time_slots?.duration_minutes || 30} minutes
                </div>
              </div>
            </div>
          </div>

          {/* Guest Information */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-white">Guest Information</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-gray-500" />
                <span>{booking.guest_name}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-500" />
                <span>{booking.guest_email}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {booking.notes && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Notes
              </h4>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <p className="text-sm text-gray-700 dark:text-gray-300">{booking.notes}</p>
              </div>
            </div>
          )}

          {/* Booking Metadata */}
          <div className="space-y-2 text-xs text-gray-500 border-t pt-4">
            <div className="flex justify-between">
              <span>Booking ID:</span>
              <span className="font-mono">{booking.id}</span>
            </div>
            <div className="flex justify-between">
              <span>Created:</span>
              <span>{format(new Date(booking.created_at), "MMM d, yyyy 'at' h:mm a")}</span>
            </div>
            {booking.updated_at !== booking.created_at && (
              <div className="flex justify-between">
                <span>Updated:</span>
                <span>{format(new Date(booking.updated_at), "MMM d, yyyy 'at' h:mm a")}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            {booking.cancellation_token && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`/cancel/${booking.cancellation_token}`, "_blank")}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Cancellation Link
              </Button>
            )}

            {canCancel && (
              <Button variant="destructive" size="sm" onClick={handleCancelBooking} disabled={isLoading}>
                <Trash2 className="h-4 w-4 mr-2" />
                {isLoading ? "Cancelling..." : "Cancel Booking"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
