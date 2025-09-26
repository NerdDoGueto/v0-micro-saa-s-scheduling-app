"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { X } from "lucide-react"
import { useState } from "react"

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
]

interface TimeSlot {
  id: string
  day_of_week: number
  start_time: string
  end_time: string
  duration_minutes: number
  buffer_minutes: number
  is_active: boolean
}

interface TimeSlotFormProps {
  calendarId: string
  timeSlot?: TimeSlot | null
  onClose: () => void
  onSuccess: () => void
}

export function TimeSlotForm({ calendarId, timeSlot, onClose, onSuccess }: TimeSlotFormProps) {
  const [dayOfWeek, setDayOfWeek] = useState(timeSlot?.day_of_week?.toString() || "1")
  const [startTime, setStartTime] = useState(timeSlot?.start_time || "09:00")
  const [endTime, setEndTime] = useState(timeSlot?.end_time || "17:00")
  const [durationMinutes, setDurationMinutes] = useState(timeSlot?.duration_minutes || 30)
  const [bufferMinutes, setBufferMinutes] = useState(timeSlot?.buffer_minutes || 15)
  const [isActive, setIsActive] = useState(timeSlot?.is_active ?? true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const data = {
        calendar_id: calendarId,
        day_of_week: Number.parseInt(dayOfWeek),
        start_time: startTime,
        end_time: endTime,
        duration_minutes: durationMinutes,
        buffer_minutes: bufferMinutes,
        is_active: isActive,
      }

      if (timeSlot) {
        // Update existing time slot
        const { error } = await supabase.from("time_slots").update(data).eq("id", timeSlot.id)
        if (error) throw error
      } else {
        // Create new time slot
        const { error } = await supabase.from("time_slots").insert(data)
        if (error) throw error
      }

      onSuccess()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{timeSlot ? "Edit Time Slot" : "Add Time Slot"}</CardTitle>
              <CardDescription>Configure when clients can book appointments.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Day of Week</Label>
              <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
                <SelectTrigger>
                  <SelectValue />
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-time">Start Time</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-time">End Time</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="15"
                  max="480"
                  step="15"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number.parseInt(e.target.value))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="buffer">Buffer (minutes)</Label>
                <Input
                  id="buffer"
                  type="number"
                  min="0"
                  max="120"
                  step="5"
                  value={bufferMinutes}
                  onChange={(e) => setBufferMinutes(Number.parseInt(e.target.value))}
                  required
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="is-active" checked={isActive} onCheckedChange={setIsActive} />
              <Label htmlFor="is-active">Active (available for booking)</Label>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex space-x-4">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? "Saving..." : timeSlot ? "Update Slot" : "Add Slot"}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
