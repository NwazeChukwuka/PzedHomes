import { getCurrentUserWithPermissions } from "@/lib/auth-utils"
import { redirect } from "next/navigation"
import { AuditLogsView } from "@/components/dashboard/audit-logs-view"

export default async function AuditLogsPage() {
  const userWithPermissions = await getCurrentUserWithPermissions()

  if (!userWithPermissions || !userWithPermissions.permissions.canViewAuditLogs) {
    redirect("/dashboard")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
        <p className="text-muted-foreground">Track all system activities and changes made by staff members</p>
      </div>
      <AuditLogsView />
    </div>
  )
}
