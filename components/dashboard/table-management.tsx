"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { Users, Plus, Edit, Trash2 } from "lucide-react"
import { toast } from "sonner"

interface Table {
  id: string
  table_number: string
  capacity: number
  status: string
  location: string
  created_at: string
}

interface TableManagementProps {
  onTableUpdate: () => void
}

export function TableManagement({ onTableUpdate }: TableManagementProps) {
  const [tables, setTables] = useState<Table[]>([])
  const [loading, setLoading] = useState(true)
  const [editingTable, setEditingTable] = useState<Table | null>(null)
  const [newTable, setNewTable] = useState({
    table_number: "",
    capacity: 2,
    location: "",
  })
  const supabase = createClient()

  useEffect(() => {
    fetchTables()
  }, [])

  const fetchTables = async () => {
    try {
      const { data, error } = await supabase
        .from("restaurant_tables")
        .select("*")
        .order("table_number", { ascending: true })

      if (error) throw error
      setTables(data || [])
    } catch (error) {
      console.error("Failed to fetch tables:", error)
    } finally {
      setLoading(false)
    }
  }

  const createTable = async () => {
    if (!newTable.table_number) {
      toast.error("Table number is required")
      return
    }

    try {
      const { error } = await supabase.from("restaurant_tables").insert({
        table_number: newTable.table_number,
        capacity: newTable.capacity,
        location: newTable.location,
        status: "available",
      })

      if (error) throw error

      setNewTable({ table_number: "", capacity: 2, location: "" })
      fetchTables()
      onTableUpdate()
      toast.success("Table created successfully")
    } catch (error) {
      toast.error("Failed to create table")
    }
  }

  const updateTable = async (id: string, updates: Partial<Table>) => {
    try {
      const { error } = await supabase.from("restaurant_tables").update(updates).eq("id", id)

      if (error) throw error

      fetchTables()
      onTableUpdate()
      setEditingTable(null)
      toast.success("Table updated successfully")
    } catch (error) {
      toast.error("Failed to update table")
    }
  }

  const updateTableStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase.from("restaurant_tables").update({ status }).eq("id", id)

      if (error) throw error

      fetchTables()
      onTableUpdate()
      toast.success(`Table marked as ${status}`)
    } catch (error) {
      toast.error("Failed to update table status")
    }
  }

  const deleteTable = async (id: string) => {
    if (!confirm("Are you sure you want to delete this table?")) return

    try {
      const { error } = await supabase.from("restaurant_tables").delete().eq("id", id)

      if (error) throw error

      fetchTables()
      onTableUpdate()
      toast.success("Table deleted successfully")
    } catch (error) {
      toast.error("Failed to delete table")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800"
      case "occupied":
        return "bg-red-100 text-red-800"
      case "reserved":
        return "bg-blue-100 text-blue-800"
      case "cleaning":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading table management...</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Table Management
              </CardTitle>
              <CardDescription>
                Total tables: {tables.length} | Available: {tables.filter((t) => t.status === "available").length} |
                Occupied: {tables.filter((t) => t.status === "occupied").length}
              </CardDescription>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Table
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Table</DialogTitle>
                  <DialogDescription>Create a new table for the restaurant</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Table Number</Label>
                    <Input
                      value={newTable.table_number}
                      onChange={(e) => setNewTable((prev) => ({ ...prev, table_number: e.target.value }))}
                      placeholder="e.g., T01, A1, etc."
                    />
                  </div>
                  <div>
                    <Label>Capacity</Label>
                    <Input
                      type="number"
                      value={newTable.capacity}
                      onChange={(e) => setNewTable((prev) => ({ ...prev, capacity: Number(e.target.value) }))}
                      min="1"
                      max="20"
                    />
                  </div>
                  <div>
                    <Label>Location</Label>
                    <Input
                      value={newTable.location}
                      onChange={(e) => setNewTable((prev) => ({ ...prev, location: e.target.value }))}
                      placeholder="e.g., Main dining, Terrace, VIP section"
                    />
                  </div>
                  <Button onClick={createTable} className="w-full">
                    Create Table
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tables.map((table) => (
          <Card key={table.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Table {table.table_number}</CardTitle>
                <Badge className={getStatusColor(table.status)}>{table.status}</Badge>
              </div>
              <CardDescription>
                Capacity: {table.capacity} people
                {table.location && (
                  <>
                    <br />
                    Location: {table.location}
                  </>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {table.status === "available" && (
                  <>
                    <Button size="sm" variant="outline" onClick={() => updateTableStatus(table.id, "occupied")}>
                      Mark Occupied
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => updateTableStatus(table.id, "reserved")}>
                      Reserve
                    </Button>
                  </>
                )}
                {table.status === "occupied" && (
                  <>
                    <Button size="sm" variant="outline" onClick={() => updateTableStatus(table.id, "cleaning")}>
                      Needs Cleaning
                    </Button>
                    <Button size="sm" onClick={() => updateTableStatus(table.id, "available")}>
                      Clear Table
                    </Button>
                  </>
                )}
                {table.status === "cleaning" && (
                  <Button size="sm" onClick={() => updateTableStatus(table.id, "available")}>
                    Cleaning Done
                  </Button>
                )}
                {table.status === "reserved" && (
                  <Button size="sm" onClick={() => updateTableStatus(table.id, "occupied")}>
                    Seat Guests
                  </Button>
                )}
              </div>

              <div className="flex gap-2 pt-2 border-t">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" onClick={() => setEditingTable(table)}>
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Table {table.table_number}</DialogTitle>
                    </DialogHeader>
                    {editingTable && (
                      <div className="space-y-4">
                        <div>
                          <Label>Table Number</Label>
                          <Input
                            value={editingTable.table_number}
                            onChange={(e) =>
                              setEditingTable((prev) => (prev ? { ...prev, table_number: e.target.value } : null))
                            }
                          />
                        </div>
                        <div>
                          <Label>Capacity</Label>
                          <Input
                            type="number"
                            value={editingTable.capacity}
                            onChange={(e) =>
                              setEditingTable((prev) => (prev ? { ...prev, capacity: Number(e.target.value) } : null))
                            }
                          />
                        </div>
                        <div>
                          <Label>Location</Label>
                          <Input
                            value={editingTable.location}
                            onChange={(e) =>
                              setEditingTable((prev) => (prev ? { ...prev, location: e.target.value } : null))
                            }
                          />
                        </div>
                        <Button onClick={() => updateTable(table.id, editingTable)} className="w-full">
                          Update Table
                        </Button>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
                <Button size="sm" variant="destructive" onClick={() => deleteTable(table.id)}>
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
