"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Clock } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { TimeSlotForm } from "./time-slot-form"

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

interface TimeSlot {
  id: string
  day_of_week: number
  start_time: string
  end_time: string
  duration_minutes: number
  buffer_minutes: number
  is_active: boolean
}

interface TimeSlotsListProps {
  calendarId: string
  timeSlots: TimeSlot[]
}

export function TimeSlotsList({ calendarId, timeSlots }: TimeSlotsListProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async (slotId: string) => {
    if (!confirm("Are you sure you want to delete this time slot?")) {
      return
    }

    const supabase = createClient()
    setIsLoading(true)

    try {
      const { error } = await supabase.from("time_slots").delete().eq("id", slotId)

      if (error) throw error

      router.refresh()
    } catch (error) {
      console.error("Error deleting time slot:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const groupedSlots = timeSlots.reduce(
    (acc, slot) => {
      if (!acc[slot.day_of_week]) {
        acc[slot.day_of_week] = []
      }
      acc[slot.day_of_week].push(slot)
      return acc
    },
    {} as Record<number, TimeSlot[]>,
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Time Slots</CardTitle>
            <CardDescription>Configure your available time slots for bookings.</CardDescription>
          </div>
          <Button onClick={() => setShowForm(true)} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Slot
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {timeSlots.length > 0 ? (
          <div className="space-y-6">
            {DAYS_OF_WEEK.map((dayName, dayIndex) => {
              const daySlots = groupedSlots[dayIndex] || []
              if (daySlots.length === 0) return null

              return (
                <div key={dayIndex}>
                  <h4 className="font-medium text-sm text-muted-foreground mb-3">{dayName}</h4>
                  <div className="space-y-2">
                    {daySlots.map((slot) => (
                      <div
                        key={slot.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <div className="flex items-center space-x-3">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">
                              {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {slot.duration_minutes}min duration, {slot.buffer_minutes}min buffer
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={slot.is_active ? "default" : "secondary"}>
                            {slot.is_active ? "Active" : "Inactive"}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingSlot(slot)
                              setShowForm(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(slot.id)} disabled={isLoading}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No time slots configured</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Add time slots to define when clients can book appointments.
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Time Slot
            </Button>
          </div>
        )}

        {showForm && (
          <TimeSlotForm
            calendarId={calendarId}
            timeSlot={editingSlot}
            onClose={() => {
              setShowForm(false)
              setEditingSlot(null)
            }}
            onSuccess={() => {
              setShowForm(false)
              setEditingSlot(null)
              router.refresh()
            }}
          />
        )}
      </CardContent>
    </Card>
  )
}
