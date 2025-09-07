import { getCurrentUserWithPermissions } from "@/lib/auth-utils"
import { redirect } from "next/navigation"
import { FinancialDashboard } from "@/components/dashboard/financial-dashboard"

export default async function FinancialPage() {
  const userWithPermissions = await getCurrentUserWithPermissions()

  if (!userWithPermissions || !userWithPermissions.permissions.canViewFinancials) {
    redirect("/dashboard")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Financial Management</h1>
        <p className="text-muted-foreground">Double-entry bookkeeping, reports, and financial analytics</p>
      </div>
      <FinancialDashboard userRole={userWithPermissions.profile.role} permissions={userWithPermissions.permissions} />
    </div>
  )
}
