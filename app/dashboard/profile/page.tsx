import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ProfileManager } from "@/components/dashboard/profile-manager"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

export default async function ProfilePage() {
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader user={user} profile={profile} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Profile Settings</h1>
          <p className="text-gray-600 dark:text-gray-300">Manage your account information and preferences</p>
        </div>

        <ProfileManager user={user} profile={profile} />
      </main>
    </div>
  )
}
