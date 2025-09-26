"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Plus, Trash2, Clock, AlertTriangle } from "lucide-react"

interface ManageTimeSlotsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  calendar: any
}

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
]

export function ManageTimeSlotsDialog({ open, onOpenChange, calendar }: ManageTimeSlotsDialogProps) {
  const [timeSlots, setTimeSlots] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [newSlot, setNewSlot] = useState({
    day_of_week: "",
    start_time: "",
    end_time: "",
    duration_minutes: 30,
    buffer_minutes: 0,
  })
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (open && calendar) {
      fetchTimeSlots()
    }
  }, [open, calendar])

  const fetchTimeSlots = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("time_slots")
      .select("*")
      .eq("calendar_id", calendar.id)
      .order("day_of_week")
      .order("start_time")

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch time slots",
        variant: "destructive",
      })
    } else {
      setTimeSlots(data || [])
    }
  }

  const handleAddTimeSlot = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSlot.day_of_week || !newSlot.start_time || !newSlot.end_time) return

    setIsLoading(true)
    setValidationErrors([])

    try {
      const validationResponse = await fetch("/api/validate-time-slot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          calendarId: calendar.id,
          dayOfWeek: Number.parseInt(newSlot.day_of_week),
          startTime: newSlot.start_time,
          endTime: newSlot.end_time,
        }),
      })

      const validation = await validationResponse.json()

      if (!validation.isValid) {
        setValidationErrors(validation.conflicts.map((conflict: any) => conflict.message))
        return
      }

      const supabase = createClient()
      const { error } = await supabase.from("time_slots").insert({
        calendar_id: calendar.id,
        day_of_week: Number.parseInt(newSlot.day_of_week),
        start_time: newSlot.start_time,
        end_time: newSlot.end_time,
        duration_minutes: newSlot.duration_minutes,
        buffer_minutes: newSlot.buffer_minutes,
      })

      if (error) throw error

      toast({
        title: "Time slot added",
        description: "New time slot has been added successfully.",
      })

      setNewSlot({
        day_of_week: "",
        start_time: "",
        end_time: "",
        duration_minutes: 30,
        buffer_minutes: 0,
      })
      setShowAddForm(false)
      setValidationErrors([])
      fetchTimeSlots()
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add time slot",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteTimeSlot = async (slotId: string) => {
    const supabase = createClient()

    try {
      // Check if there are any confirmed bookings for this time slot
      const { data: bookings, error: bookingsError } = await supabase
        .from("bookings")
        .select("id")
        .eq("time_slot_id", slotId)
        .eq("status", "confirmed")
        .gte("booking_date", new Date().toISOString().split("T")[0])

      if (bookingsError) throw bookingsError

      if (bookings && bookings.length > 0) {
        toast({
          title: "Cannot delete time slot",
          description: "This time slot has confirmed bookings. Cancel the bookings first.",
          variant: "destructive",
        })
        return
      }

      const { error } = await supabase.from("time_slots").delete().eq("id", slotId)

      if (error) throw error

      toast({
        title: "Time slot deleted",
        description: "Time slot has been removed successfully.",
      })

      fetchTimeSlots()
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete time slot",
        variant: "destructive",
      })
    }
  }

  const getDayName = (dayOfWeek: number) => {
    return DAYS_OF_WEEK.find((day) => day.value === dayOfWeek)?.label || "Unknown"
  }

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Time Slots - {calendar?.title}</DialogTitle>
          <DialogDescription>Define your availability by adding time slots for each day of the week.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Existing Time Slots */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Current Time Slots</h3>
              <Button onClick={() => setShowAddForm(!showAddForm)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Time Slot
              </Button>
            </div>

            {timeSlots.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Clock className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-gray-600 dark:text-gray-300">No time slots configured</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {timeSlots.map((slot) => (
                  <Card key={slot.id}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        <Badge variant="outline">{getDayName(slot.day_of_week)}</Badge>
                        <div className="text-sm">
                          <span className="font-medium">
                            {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                          </span>
                          <div className="text-gray-500">
                            {slot.duration_minutes}min slots
                            {slot.buffer_minutes > 0 && ` • ${slot.buffer_minutes}min buffer`}
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteTimeSlot(slot.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Add New Time Slot Form */}
          {showAddForm && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Add New Time Slot</CardTitle>
              </CardHeader>
              <CardContent>
                {validationErrors.length > 0 && (
                  <Alert className="mb-4 border-red-200 bg-red-50 dark:bg-red-900/20">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800 dark:text-red-200">
                      <div className="font-medium mb-2">Cannot create time slot:</div>
                      <ul className="list-disc list-inside space-y-1">
                        {validationErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleAddTimeSlot} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="day">Day of Week</Label>
                      <Select
                        value={newSlot.day_of_week}
                        onValueChange={(value) => setNewSlot({ ...newSlot, day_of_week: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select day" />
                        </SelectTrigger>
                        <SelectContent>
                          {DAYS_OF_WEEK.map((day) => (
                            <SelectItem key={day.value} value={day.value.toString()}>
                              {day.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="duration">Duration (minutes)</Label>
                      <Input
                        id="duration"
                        type="number"
                        min="15"
                        max="480"
                        step="15"
                        value={newSlot.duration_minutes}
                        onChange={(e) => setNewSlot({ ...newSlot, duration_minutes: Number.parseInt(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start_time">Start Time</Label>
                      <Input
                        id="start_time"
                        type="time"
                        value={newSlot.start_time}
                        onChange={(e) => setNewSlot({ ...newSlot, start_time: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="end_time">End Time</Label>
                      <Input
                        id="end_time"
                        type="time"
                        value={newSlot.end_time}
                        onChange={(e) => setNewSlot({ ...newSlot, end_time: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="buffer">Buffer Time (minutes)</Label>
                    <Input
                      id="buffer"
                      type="number"
                      min="0"
                      max="60"
                      step="5"
                      value={newSlot.buffer_minutes}
                      onChange={(e) => setNewSlot({ ...newSlot, buffer_minutes: Number.parseInt(e.target.value) })}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Time between bookings to prepare for the next appointment
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Adding..." : "Add Time Slot"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowAddForm(false)
                        setValidationErrors([])
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
