"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Home,
  Users,
  Bed,
  Calendar,
  DollarSign,
  UtensilsCrossed,
  ClipboardList,
  Settings,
  UserCheck,
  MessageSquare,
  BarChart3,
  Package,
  FileText,
  Tag,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface SidebarNavigationProps {
  userRole: string
}

export function SidebarNavigation({ userRole }: SidebarNavigationProps) {
  const pathname = usePathname()

  const getMenuItems = (role: string) => {
    const baseItems = [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: Home,
        roles: ["owner", "manager", "accountant", "receptionist", "staff"],
      },
      {
        title: "Reservations",
        href: "/dashboard/reservations",
        icon: Calendar,
        roles: ["owner", "manager", "receptionist"],
      },
      {
        title: "Guests",
        href: "/dashboard/guests",
        icon: Users,
        roles: ["owner", "manager", "receptionist"],
      },
      {
        title: "Rooms",
        href: "/dashboard/rooms",
        icon: Bed,
        roles: ["owner", "manager", "receptionist", "staff"],
      },
      {
        title: "Housekeeping",
        href: "/dashboard/housekeeping",
        icon: ClipboardList,
        roles: ["owner", "manager", "staff"],
      },
      {
        title: "Restaurant & Bar",
        href: "/dashboard/restaurant",
        icon: UtensilsCrossed,
        roles: ["owner", "manager", "staff"],
      },
      {
        title: "Pricing & Services",
        href: "/dashboard/pricing",
        icon: Tag,
        roles: ["owner"],
      },
      {
        title: "Financial",
        href: "/dashboard/financial",
        icon: DollarSign,
        roles: ["owner", "manager", "accountant"],
      },
      {
        title: "Staff Management",
        href: "/dashboard/staff",
        icon: UserCheck,
        roles: ["owner", "manager"],
      },
      {
        title: "Inventory",
        href: "/dashboard/inventory",
        icon: Package,
        roles: ["owner", "manager"],
      },
      {
        title: "Reports",
        href: "/dashboard/reports",
        icon: BarChart3,
        roles: ["owner", "manager", "accountant"],
      },
      {
        title: "Audit Logs",
        href: "/dashboard/audit-logs",
        icon: FileText,
        roles: ["owner", "manager"],
      },
      {
        title: "Guest Feedback",
        href: "/dashboard/feedback",
        icon: MessageSquare,
        roles: ["owner", "manager", "receptionist"],
      },
      {
        title: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
        roles: ["owner", "manager"],
      },
    ]

    return baseItems.filter((item) => item.roles.includes(role))
  }

  const menuItems = getMenuItems(userRole)

  return (
    <div className="pb-12 w-64">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">P-ZED Hotels</h2>
          <div className="space-y-1">
            <ScrollArea className="h-[calc(100vh-8rem)]">
              {menuItems.map((item) => (
                <Button
                  key={item.href}
                  variant={pathname === item.href ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    pathname === item.href && "bg-slate-100 text-slate-900 font-medium",
                  )}
                  asChild
                >
                  <Link href={item.href}>
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.title}
                  </Link>
                </Button>
              ))}
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  )
}
