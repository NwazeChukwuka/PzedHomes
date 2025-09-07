"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Clock, CheckCircle, AlertCircle, User } from "lucide-react"

interface HousekeepingTask {
  id: string
  room: {
    room_number: string
    room_categories: {
      name: string
    }
  }
  task_type: string
  priority: string
  status: string
  description: string
  estimated_duration: number | null
  assigned_to: string | null
  assigned_staff?: {
    full_name: string
  }
  created_at: string
  started_at: string | null
  completed_at: string | null
}

interface Staff {
  id: string
  full_name: string
}

export function HousekeepingManagement() {
  const [tasks, setTasks] = useState<HousekeepingTask[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [formData, setFormData] = useState({
    room_id: "",
    task_type: "",
    priority: "normal",
    description: "",
    estimated_duration: "",
    assigned_to: "",
  })

  useEffect(() => {
    fetchTasks()
    fetchStaff()
  }, [])

  const fetchTasks = async () => {
    const supabase = createClient()
    try {
      const { data, error } = await supabase
        .from("housekeeping_tasks")
        .select(`
          *,
          rooms (
            room_number,
            room_categories (
              name
            )
          ),
          profiles!housekeeping_tasks_assigned_to_fkey (
            full_name
          )
        `)
        .order("created_at", { ascending: false })

      if (error) throw error

      const transformedTasks =
        data?.map((task: any) => ({
          id: task.id,
          room: {
            room_number: task.rooms.room_number,
            room_categories: {
              name: task.rooms.room_categories.name,
            },
          },
          task_type: task.task_type,
          priority: task.priority,
          status: task.status,
          description: task.description,
          estimated_duration: task.estimated_duration,
          assigned_to: task.assigned_to,
          assigned_staff: task.profiles ? { full_name: task.profiles.full_name } : undefined,
          created_at: task.created_at,
          started_at: task.started_at,
          completed_at: task.completed_at,
        })) || []

      setTasks(transformedTasks)
    } catch (error) {
      console.error("Error fetching tasks:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStaff = async () => {
    const supabase = createClient()
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("role", ["staff", "manager"])
        .eq("is_active", true)

      if (error) throw error
      setStaff(data || [])
    } catch (error) {
      console.error("Error fetching staff:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()

    try {
      const { error } = await supabase.from("housekeeping_tasks").insert({
        room_id: formData.room_id,
        task_type: formData.task_type,
        priority: formData.priority,
        description: formData.description,
        estimated_duration: formData.estimated_duration ? Number.parseInt(formData.estimated_duration) : null,
        assigned_to: formData.assigned_to || null,
      })

      if (error) throw error

      await fetchTasks()
      setShowAddDialog(false)
      setFormData({
        room_id: "",
        task_type: "",
        priority: "normal",
        description: "",
        estimated_duration: "",
        assigned_to: "",
      })
    } catch (error) {
      console.error("Error creating task:", error)
      alert("Failed to create task")
    }
  }

  const updateTaskStatus = async (taskId: string, status: string) => {
    const supabase = createClient()
    try {
      const updates: any = { status }
      if (status === "in_progress") {
        updates.started_at = new Date().toISOString()
      } else if (status === "completed") {
        updates.completed_at = new Date().toISOString()
      }

      const { error } = await supabase.from("housekeeping_tasks").update(updates).eq("id", taskId)

      if (error) throw error
      await fetchTasks()
    } catch (error) {
      console.error("Error updating task:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "normal":
        return "bg-blue-100 text-blue-800"
      case "low":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTasksByStatus = (status: string) => {
    return tasks.filter((task) => task.status === status)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-200 rounded w-48 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-16 bg-slate-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Housekeeping Management</h1>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-slate-900 hover:bg-slate-800">
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
              <DialogDescription>Add a new housekeeping task to the system</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="task_type">Task Type</Label>
                  <Select
                    value={formData.task_type}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, task_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select task type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cleaning">Cleaning</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="inspection">Inspection</SelectItem>
                      <SelectItem value="setup">Room Setup</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    required
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="estimated_duration">Estimated Duration (minutes)</Label>
                  <Input
                    id="estimated_duration"
                    type="number"
                    value={formData.estimated_duration}
                    onChange={(e) => setFormData((prev) => ({ ...prev, estimated_duration: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="assigned_to">Assign To</Label>
                  <Select
                    value={formData.assigned_to}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, assigned_to: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select staff member" />
                    </SelectTrigger>
                    <SelectContent>
                      {staff.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-slate-900 hover:bg-slate-800">
                  Create Task
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Pending</p>
                <p className="text-2xl font-bold text-slate-900">{getTasksByStatus("pending").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">In Progress</p>
                <p className="text-2xl font-bold text-slate-900">{getTasksByStatus("in_progress").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Completed</p>
                <p className="text-2xl font-bold text-slate-900">{getTasksByStatus("completed").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <User className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Staff Available</p>
                <p className="text-2xl font-bold text-slate-900">{staff.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Room</TableHead>
                <TableHead>Task</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{task.room.room_number}</div>
                      <div className="text-sm text-slate-500">{task.room.room_categories.name}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium capitalize">{task.task_type.replace("_", " ")}</div>
                      <div className="text-sm text-slate-500">{task.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPriorityColor(task.priority)}>{task.priority.toUpperCase()}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(task.status)}>{task.status.replace("_", " ").toUpperCase()}</Badge>
                  </TableCell>
                  <TableCell>
                    {task.assigned_staff ? (
                      <div className="text-sm">{task.assigned_staff.full_name}</div>
                    ) : (
                      <span className="text-slate-400">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell>{task.estimated_duration ? `${task.estimated_duration} min` : "Not set"}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {task.status === "pending" && (
                        <Button variant="outline" size="sm" onClick={() => updateTaskStatus(task.id, "in_progress")}>
                          Start
                        </Button>
                      )}
                      {task.status === "in_progress" && (
                        <Button variant="outline" size="sm" onClick={() => updateTaskStatus(task.id, "completed")}>
                          Complete
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
