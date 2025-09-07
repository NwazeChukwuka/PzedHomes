"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { MenuManagement } from "./menu-management"
import { POSSystem } from "./pos-system"
import { KitchenDisplay } from "./kitchen-display"
import { TableManagement } from "./table-management"
import { UtensilsCrossed, ChefHat, Users, BarChart3 } from "lucide-react"

interface RestaurantDashboardProps {
  userRole: string
}

export function RestaurantDashboard({ userRole }: RestaurantDashboardProps) {
  const [stats, setStats] = useState({
    todayOrders: 0,
    todayRevenue: 0,
    activeOrders: 0,
    availableTables: 0,
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const today = new Date().toISOString().split("T")[0]

      const [ordersResponse, tablesResponse] = await Promise.all([
        supabase
          .from("restaurant_orders")
          .select("total_amount, status")
          .gte("created_at", `${today}T00:00:00`)
          .lte("created_at", `${today}T23:59:59`),
        supabase.from("restaurant_tables").select("status"),
      ])

      if (ordersResponse.data) {
        const orders = ordersResponse.data
        setStats((prev) => ({
          ...prev,
          todayOrders: orders.length,
          todayRevenue: orders.reduce((sum, order) => sum + (order.total_amount || 0), 0),
          activeOrders: orders.filter((order) => order.status === "preparing" || order.status === "ready").length,
        }))
      }

      if (tablesResponse.data) {
        const tables = tablesResponse.data
        setStats((prev) => ({
          ...prev,
          availableTables: tables.filter((table) => table.status === "available").length,
        }))
      }
    } catch (error) {
      console.error("Failed to fetch restaurant stats:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
            <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{stats.todayRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <ChefHat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Tables</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.availableTables}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main POS Interface */}
      <Tabs defaultValue="pos" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pos">Point of Sale</TabsTrigger>
          <TabsTrigger value="kitchen">Kitchen Display</TabsTrigger>
          <TabsTrigger value="tables">Table Management</TabsTrigger>
          {(userRole === "owner" || userRole === "manager") && <TabsTrigger value="menu">Menu Management</TabsTrigger>}
        </TabsList>

        <TabsContent value="pos" className="space-y-4">
          <POSSystem onOrderUpdate={fetchStats} />
        </TabsContent>

        <TabsContent value="kitchen" className="space-y-4">
          <KitchenDisplay onStatusUpdate={fetchStats} />
        </TabsContent>

        <TabsContent value="tables" className="space-y-4">
          <TableManagement onTableUpdate={fetchStats} />
        </TabsContent>

        {(userRole === "owner" || userRole === "manager") && (
          <TabsContent value="menu" className="space-y-4">
            <MenuManagement />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
