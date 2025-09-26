"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Save, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

const PRESET_COLORS = [
  "#3B82F6", // Blue
  "#10B981", // Green
  "#F59E0B", // Yellow
  "#EF4444", // Red
  "#8B5CF6", // Purple
  "#06B6D4", // Cyan
  "#F97316", // Orange
  "#84CC16", // Lime
]

interface CalendarSettingsProps {
  calendar: {
    id: string
    title: string
    description: string | null
    color: string | null
    is_active: boolean
  }
}

export function CalendarSettings({ calendar }: CalendarSettingsProps) {
  const [title, setTitle] = useState(calendar.title)
  const [description, setDescription] = useState(calendar.description || "")
  const [color, setColor] = useState(calendar.color || PRESET_COLORS[0])
  const [isActive, setIsActive] = useState(calendar.is_active)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase
        .from("calendars")
        .update({
          title,
          description,
          color,
          is_active: isActive,
        })
        .eq("id", calendar.id)

      if (error) throw error

      // Refresh the page to show updated data
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this calendar? This action cannot be undone.")) {
      return
    }

    const supabase = createClient()
    setIsLoading(true)

    try {
      const { error } = await supabase.from("calendars").delete().eq("id", calendar.id)

      if (error) throw error

      router.push("/dashboard/calendars")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calendar Settings</CardTitle>
        <CardDescription>Update your calendar details and preferences.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Calendar Title</Label>
            <Input
              id="title"
              placeholder="e.g., Consultation Calls, Team Meetings"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what this calendar is for..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Calendar Color</Label>
            <div className="flex space-x-2">
              {PRESET_COLORS.map((presetColor) => (
                <button
                  key={presetColor}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 ${
                    color === presetColor ? "border-gray-900 dark:border-white" : "border-gray-300"
                  }`}
                  style={{ backgroundColor: presetColor }}
                  onClick={() => setColor(presetColor)}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="is-active" checked={isActive} onCheckedChange={setIsActive} />
            <Label htmlFor="is-active">Active (visible to clients)</Label>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex space-x-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={isLoading}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
