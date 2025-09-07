import { getCurrentUserWithPermissions } from "@/lib/auth-utils"
import { redirect } from "next/navigation"
import { PricingManagement } from "@/components/dashboard/pricing-management"

export default async function PricingPage() {
  const userWithPermissions = await getCurrentUserWithPermissions()

  if (!userWithPermissions || !userWithPermissions.permissions.canUpdatePrices) {
    redirect("/dashboard")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pricing & Services</h1>
        <p className="text-muted-foreground">Manage room rates, services, and pricing policies</p>
      </div>
      <PricingManagement />
    </div>
  )
}
