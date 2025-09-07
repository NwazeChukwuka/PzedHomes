import { getCurrentUserWithPermissions } from "@/lib/auth-utils"
import { redirect } from "next/navigation"
import { RestaurantDashboard } from "@/components/dashboard/restaurant-dashboard"

export default async function RestaurantPage() {
  const userWithPermissions = await getCurrentUserWithPermissions()

  if (
    !userWithPermissions ||
    !userWithPermissions.profile.role ||
    !["owner", "manager", "staff"].includes(userWithPermissions.profile.role)
  ) {
    redirect("/dashboard")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Restaurant & Bar</h1>
        <p className="text-muted-foreground">Point of Sale system for restaurant and bar operations</p>
      </div>
      <RestaurantDashboard userRole={userWithPermissions.profile.role} />
    </div>
  )
}
