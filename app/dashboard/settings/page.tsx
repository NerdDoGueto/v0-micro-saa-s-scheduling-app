import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ProfileSettings } from "@/components/dashboard/profile-settings"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function SettingsPage() {
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

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">Manage your account settings and preferences.</p>
      </div>

      {/* Profile Settings */}
      <ProfileSettings user={user} profile={profile} />

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your account details and authentication information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
            <p className="text-gray-900 dark:text-white">{user.email}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Account Created</label>
            <p className="text-gray-900 dark:text-white">
              {new Date(user.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Sign In</label>
            <p className="text-gray-900 dark:text-white">
              {user.last_sign_in_at
                ? new Date(user.last_sign_in_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })
                : "Never"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
