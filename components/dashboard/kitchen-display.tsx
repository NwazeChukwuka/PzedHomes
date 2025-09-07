"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { Clock, CheckCircle, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

interface Order {
  id: string
  table_id: string
  total_amount: number
  status: string
  order_type: string
  created_at: string
  restaurant_tables: {
    table_number: string
  }
  restaurant_order_items: {
    id: string
    quantity: number
    menu_items: {
      name: string
      category: string
    }
  }[]
}

interface KitchenDisplayProps {
  onStatusUpdate: () => void
}

export function KitchenDisplay({ onStatusUpdate }: KitchenDisplayProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchOrders()

    // Set up real-time subscription for new orders
    const subscription = supabase
      .channel("kitchen-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "restaurant_orders" }, () => fetchOrders())
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("restaurant_orders")
        .select(`
          *,
          restaurant_tables (
            table_number
          ),
          restaurant_order_items (
            id,
            quantity,
            menu_items (
              name,
              category
            )
          )
        `)
        .in("status", ["preparing", "ready"])
        .order("created_at", { ascending: true })

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error("Failed to fetch kitchen orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase.from("restaurant_orders").update({ status: newStatus }).eq("id", orderId)

      if (error) throw error

      fetchOrders()
      onStatusUpdate()
      toast.success(`Order marked as ${newStatus}`)
    } catch (error) {
      toast.error("Failed to update order status")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "preparing":
        return "bg-yellow-100 text-yellow-800"
      case "ready":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getOrderAge = (createdAt: string) => {
    const now = new Date()
    const orderTime = new Date(createdAt)
    const diffMinutes = Math.floor((now.getTime() - orderTime.getTime()) / (1000 * 60))
    return diffMinutes
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading kitchen display...</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Kitchen Display System
          </CardTitle>
          <CardDescription>
            Active orders: {orders.length} | Preparing: {orders.filter((o) => o.status === "preparing").length} | Ready:{" "}
            {orders.filter((o) => o.status === "ready").length}
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {orders.map((order) => {
          const orderAge = getOrderAge(order.created_at)
          const isUrgent = orderAge > 15 // Orders older than 15 minutes are urgent

          return (
            <Card key={order.id} className={`${isUrgent ? "border-red-500 bg-red-50" : ""}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Table {order.restaurant_tables.table_number}</CardTitle>
                  <div className="flex items-center gap-2">
                    {isUrgent && <AlertCircle className="h-4 w-4 text-red-500" />}
                    <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                  </div>
                </div>
                <CardDescription>
                  Order #{order.id.slice(0, 8)} • {orderAge} min ago
                  <br />
                  {format(new Date(order.created_at), "HH:mm")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {order.restaurant_order_items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-2 bg-white rounded border">
                      <div>
                        <div className="font-medium">{item.menu_items.name}</div>
                        <div className="text-sm text-muted-foreground">{item.menu_items.category}</div>
                      </div>
                      <Badge variant="outline">x{item.quantity}</Badge>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  {order.status === "preparing" && (
                    <Button className="flex-1" onClick={() => updateOrderStatus(order.id, "ready")}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark Ready
                    </Button>
                  )}
                  {order.status === "ready" && (
                    <Button
                      variant="outline"
                      className="flex-1 bg-transparent"
                      onClick={() => updateOrderStatus(order.id, "served")}
                    >
                      Mark Served
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}

        {orders.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No active orders</h3>
            <p>Kitchen is all caught up!</p>
          </div>
        )}
      </div>
    </div>
  )
}
