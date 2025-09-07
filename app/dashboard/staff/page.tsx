import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { StaffManagement } from "@/components/dashboard/staff-management"

export default async function StaffPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user profile with role
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  if (!profile || !["owner", "manager"].includes(profile.role)) {
    redirect("/dashboard")
  }

  return <StaffManagement />
}
