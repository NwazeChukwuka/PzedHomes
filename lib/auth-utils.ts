import { createClient } from "@/lib/supabase/server"

export type UserRole = "owner" | "manager" | "accountant" | "receptionist" | "staff"

export interface UserPermissions {
  canManageStaff: boolean
  canUpdatePrices: boolean
  canManageServices: boolean
  canViewFinancials: boolean
  canManageRooms: boolean
  canViewAuditLogs: boolean
  canAssignRoles: boolean
  canDeleteRecords: boolean
}

export function getRolePermissions(role: UserRole): UserPermissions {
  switch (role) {
    case "owner":
      return {
        canManageStaff: true,
        canUpdatePrices: true,
        canManageServices: true,
        canViewFinancials: true,
        canManageRooms: true,
        canViewAuditLogs: true,
        canAssignRoles: true,
        canDeleteRecords: true,
      }
    case "manager":
      return {
        canManageStaff: true, // Can manage but not delete staff
        canUpdatePrices: false, // Cannot change prices
        canManageServices: true,
        canViewFinancials: true,
        canManageRooms: true,
        canViewAuditLogs: true,
        canAssignRoles: false, // Cannot assign roles
        canDeleteRecords: false, // Cannot delete records
      }
    case "accountant":
      return {
        canManageStaff: false,
        canUpdatePrices: false,
        canManageServices: false,
        canViewFinancials: true,
        canManageRooms: false,
        canViewAuditLogs: false,
        canAssignRoles: false,
        canDeleteRecords: false,
      }
    case "receptionist":
      return {
        canManageStaff: false,
        canUpdatePrices: false,
        canManageServices: false,
        canViewFinancials: false,
        canManageRooms: true, // Can manage room status
        canViewAuditLogs: false,
        canAssignRoles: false,
        canDeleteRecords: false,
      }
    case "staff":
      return {
        canManageStaff: false,
        canUpdatePrices: false,
        canManageServices: false,
        canViewFinancials: false,
        canManageRooms: false,
        canViewAuditLogs: false,
        canAssignRoles: false,
        canDeleteRecords: false,
      }
    default:
      return {
        canManageStaff: false,
        canUpdatePrices: false,
        canManageServices: false,
        canViewFinancials: false,
        canManageRooms: false,
        canViewAuditLogs: false,
        canAssignRoles: false,
        canDeleteRecords: false,
      }
  }
}

export async function getCurrentUserWithPermissions() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile) return null

  return {
    user,
    profile,
    permissions: getRolePermissions(profile.role as UserRole),
  }
}

export async function logAuditAction(
  action: string,
  tableName?: string,
  recordId?: string,
  oldValues?: any,
  newValues?: any,
) {
  const supabase = await createClient()

  await supabase.from("audit_logs").insert({
    action,
    table_name: tableName,
    record_id: recordId,
    old_values: oldValues,
    new_values: newValues,
  })
}
