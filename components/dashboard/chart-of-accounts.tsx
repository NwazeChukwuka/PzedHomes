"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createBrowserClient } from "@/lib/supabase/client"
import { Plus, Edit, BookOpen } from "lucide-react"
import { toast } from "sonner"

interface Account {
  id: string
  account_code: string
  account_name: string
  account_type: string
  parent_account_id?: string
  is_active: boolean
  description?: string
  created_at: string
}

export function ChartOfAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [newAccount, setNewAccount] = useState({
    account_code: "",
    account_name: "",
    account_type: "",
    description: "",
  })
  const supabase = createBrowserClient()

  const accountTypes = ["Assets", "Liabilities", "Equity", "Revenue", "Expenses", "Cost of Goods Sold"]

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    try {
      const { data, error } = await supabase.from("chart_of_accounts").select("*").order("account_code")

      if (error) throw error
      setAccounts(data || [])
    } catch (error) {
      console.error("Failed to fetch chart of accounts:", error)
    } finally {
      setLoading(false)
    }
  }

  const createAccount = async () => {
    if (!newAccount.account_code || !newAccount.account_name || !newAccount.account_type) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      const { error } = await supabase.from("chart_of_accounts").insert({
        account_code: newAccount.account_code,
        account_name: newAccount.account_name,
        account_type: newAccount.account_type,
        description: newAccount.description,
        is_active: true,
      })

      if (error) throw error

      setNewAccount({ account_code: "", account_name: "", account_type: "", description: "" })
      fetchAccounts()
      toast.success("Account created successfully")
    } catch (error) {
      toast.error("Failed to create account")
    }
  }

  const updateAccount = async (id: string, updates: Partial<Account>) => {
    try {
      const { error } = await supabase.from("chart_of_accounts").update(updates).eq("id", id)

      if (error) throw error

      fetchAccounts()
      setEditingAccount(null)
      toast.success("Account updated successfully")
    } catch (error) {
      toast.error("Failed to update account")
    }
  }

  const toggleAccountStatus = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase.from("chart_of_accounts").update({ is_active: isActive }).eq("id", id)

      if (error) throw error

      fetchAccounts()
      toast.success(`Account ${isActive ? "activated" : "deactivated"} successfully`)
    } catch (error) {
      toast.error("Failed to update account status")
    }
  }

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case "Assets":
        return "bg-blue-100 text-blue-800"
      case "Liabilities":
        return "bg-red-100 text-red-800"
      case "Equity":
        return "bg-purple-100 text-purple-800"
      case "Revenue":
        return "bg-green-100 text-green-800"
      case "Expenses":
        return "bg-orange-100 text-orange-800"
      case "Cost of Goods Sold":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const groupedAccounts = accountTypes.reduce(
    (groups, type) => {
      groups[type] = accounts.filter((account) => account.account_type === type)
      return groups
    },
    {} as Record<string, Account[]>,
  )

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading chart of accounts...</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Chart of Accounts
              </CardTitle>
              <CardDescription>
                Manage your accounting structure with {accounts.length} accounts across {accountTypes.length} categories
              </CardDescription>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Account
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Account</DialogTitle>
                  <DialogDescription>Create a new account in your chart of accounts</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Account Code *</Label>
                    <Input
                      value={newAccount.account_code}
                      onChange={(e) => setNewAccount((prev) => ({ ...prev, account_code: e.target.value }))}
                      placeholder="e.g., 1001, 2001, 3001"
                    />
                  </div>
                  <div>
                    <Label>Account Name *</Label>
                    <Input
                      value={newAccount.account_name}
                      onChange={(e) => setNewAccount((prev) => ({ ...prev, account_name: e.target.value }))}
                      placeholder="e.g., Cash in Bank, Accounts Payable"
                    />
                  </div>
                  <div>
                    <Label>Account Type *</Label>
                    <Select
                      value={newAccount.account_type}
                      onValueChange={(value) => setNewAccount((prev) => ({ ...prev, account_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                      <SelectContent>
                        {accountTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Input
                      value={newAccount.description}
                      onChange={(e) => setNewAccount((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Optional description"
                    />
                  </div>
                  <Button onClick={createAccount} className="w-full">
                    Create Account
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Accounts by Type */}
      <div className="space-y-6">
        {accountTypes.map((type) => (
          <Card key={type}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge className={getAccountTypeColor(type)}>{type}</Badge>
                <span className="text-sm font-normal text-muted-foreground">
                  ({groupedAccounts[type]?.length || 0} accounts)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {groupedAccounts[type]?.map((account) => (
                  <div
                    key={account.id}
                    className={`flex items-center justify-between p-3 border rounded-lg ${!account.is_active ? "opacity-60" : ""}`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-medium">{account.account_code}</span>
                        <span className="font-medium">{account.account_name}</span>
                        {!account.is_active && <Badge variant="secondary">Inactive</Badge>}
                      </div>
                      {account.description && (
                        <p className="text-sm text-muted-foreground mt-1">{account.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={account.is_active}
                        onCheckedChange={(checked) => toggleAccountStatus(account.id, checked)}
                      />
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" onClick={() => setEditingAccount(account)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Edit Account</DialogTitle>
                          </DialogHeader>
                          {editingAccount && (
                            <div className="space-y-4">
                              <div>
                                <Label>Account Code</Label>
                                <Input
                                  value={editingAccount.account_code}
                                  onChange={(e) =>
                                    setEditingAccount((prev) =>
                                      prev ? { ...prev, account_code: e.target.value } : null,
                                    )
                                  }
                                />
                              </div>
                              <div>
                                <Label>Account Name</Label>
                                <Input
                                  value={editingAccount.account_name}
                                  onChange={(e) =>
                                    setEditingAccount((prev) =>
                                      prev ? { ...prev, account_name: e.target.value } : null,
                                    )
                                  }
                                />
                              </div>
                              <div>
                                <Label>Account Type</Label>
                                <Select
                                  value={editingAccount.account_type}
                                  onValueChange={(value) =>
                                    setEditingAccount((prev) => (prev ? { ...prev, account_type: value } : null))
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {accountTypes.map((type) => (
                                      <SelectItem key={type} value={type}>
                                        {type}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label>Description</Label>
                                <Input
                                  value={editingAccount.description || ""}
                                  onChange={(e) =>
                                    setEditingAccount((prev) =>
                                      prev ? { ...prev, description: e.target.value } : null,
                                    )
                                  }
                                />
                              </div>
                              <Button onClick={() => updateAccount(account.id, editingAccount)} className="w-full">
                                Update Account
                              </Button>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}
                {(!groupedAccounts[type] || groupedAccounts[type].length === 0) && (
                  <div className="text-center py-4 text-muted-foreground">
                    No {type.toLowerCase()} accounts created yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
