"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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
import { Plus, FileText, Calendar } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

interface Transaction {
  id: string
  transaction_date: string
  description: string
  amount: number
  transaction_type: string
  reference_number: string
  created_at: string
  accounting_entries: {
    id: string
    account_id: string
    debit_amount: number
    credit_amount: number
    chart_of_accounts: {
      account_name: string
      account_code: string
    }
  }[]
}

interface Account {
  id: string
  account_code: string
  account_name: string
  account_type: string
}

interface TransactionManagerProps {
  onTransactionUpdate: () => void
}

export function TransactionManager({ onTransactionUpdate }: TransactionManagerProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [newTransaction, setNewTransaction] = useState({
    description: "",
    amount: 0,
    transaction_type: "",
    reference_number: "",
    debit_account: "",
    credit_account: "",
  })
  const supabase = createBrowserClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [transactionsResponse, accountsResponse] = await Promise.all([
        supabase
          .from("accounting_transactions")
          .select(`
            *,
            accounting_entries (
              id,
              account_id,
              debit_amount,
              credit_amount,
              chart_of_accounts (
                account_name,
                account_code
              )
            )
          `)
          .order("created_at", { ascending: false })
          .limit(50),
        supabase.from("chart_of_accounts").select("*").eq("is_active", true).order("account_code"),
      ])

      if (transactionsResponse.data) setTransactions(transactionsResponse.data)
      if (accountsResponse.data) setAccounts(accountsResponse.data)
    } catch (error) {
      console.error("Failed to fetch transaction data:", error)
    } finally {
      setLoading(false)
    }
  }

  const createTransaction = async () => {
    if (
      !newTransaction.description ||
      !newTransaction.debit_account ||
      !newTransaction.credit_account ||
      newTransaction.amount <= 0
    ) {
      toast.error("Please fill in all required fields")
      return
    }

    if (newTransaction.debit_account === newTransaction.credit_account) {
      toast.error("Debit and credit accounts must be different")
      return
    }

    try {
      // Create the transaction
      const { data: transaction, error: transactionError } = await supabase
        .from("accounting_transactions")
        .insert({
          transaction_date: new Date().toISOString().split("T")[0],
          description: newTransaction.description,
          amount: newTransaction.amount,
          transaction_type: newTransaction.transaction_type,
          reference_number: newTransaction.reference_number || `TXN-${Date.now()}`,
        })
        .select()
        .single()

      if (transactionError) throw transactionError

      // Create the double-entry accounting entries
      const entries = [
        {
          transaction_id: transaction.id,
          account_id: newTransaction.debit_account,
          debit_amount: newTransaction.amount,
          credit_amount: 0,
        },
        {
          transaction_id: transaction.id,
          account_id: newTransaction.credit_account,
          debit_amount: 0,
          credit_amount: newTransaction.amount,
        },
      ]

      const { error: entriesError } = await supabase.from("accounting_entries").insert(entries)

      if (entriesError) throw entriesError

      // Reset form
      setNewTransaction({
        description: "",
        amount: 0,
        transaction_type: "",
        reference_number: "",
        debit_account: "",
        credit_account: "",
      })

      fetchData()
      onTransactionUpdate()
      toast.success("Transaction recorded successfully")
    } catch (error) {
      toast.error("Failed to record transaction")
      console.error("Transaction creation error:", error)
    }
  }

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case "revenue":
        return "bg-green-100 text-green-800"
      case "expense":
        return "bg-red-100 text-red-800"
      case "asset":
        return "bg-blue-100 text-blue-800"
      case "liability":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading transactions...</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Transaction Manager
              </CardTitle>
              <CardDescription>
                Record and manage all financial transactions with double-entry bookkeeping
              </CardDescription>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Transaction
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Record New Transaction</DialogTitle>
                  <DialogDescription>Create a new financial transaction with double-entry accounting</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Description *</Label>
                    <Input
                      value={newTransaction.description}
                      onChange={(e) => setNewTransaction((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="e.g., Office supplies purchase"
                    />
                  </div>
                  <div>
                    <Label>Amount (₦) *</Label>
                    <Input
                      type="number"
                      value={newTransaction.amount}
                      onChange={(e) => setNewTransaction((prev) => ({ ...prev, amount: Number(e.target.value) }))}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <Label>Transaction Type</Label>
                    <Select
                      value={newTransaction.transaction_type}
                      onValueChange={(value) => setNewTransaction((prev) => ({ ...prev, transaction_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="revenue">Revenue</SelectItem>
                        <SelectItem value="expense">Expense</SelectItem>
                        <SelectItem value="asset">Asset</SelectItem>
                        <SelectItem value="liability">Liability</SelectItem>
                        <SelectItem value="equity">Equity</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Debit Account *</Label>
                    <Select
                      value={newTransaction.debit_account}
                      onValueChange={(value) => setNewTransaction((prev) => ({ ...prev, debit_account: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select debit account" />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.account_code} - {account.account_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Credit Account *</Label>
                    <Select
                      value={newTransaction.credit_account}
                      onValueChange={(value) => setNewTransaction((prev) => ({ ...prev, credit_account: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select credit account" />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.account_code} - {account.account_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Reference Number</Label>
                    <Input
                      value={newTransaction.reference_number}
                      onChange={(e) => setNewTransaction((prev) => ({ ...prev, reference_number: e.target.value }))}
                      placeholder="Optional reference number"
                    />
                  </div>
                  <Button onClick={createTransaction} className="w-full">
                    Record Transaction
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Latest financial transactions with accounting entries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{transaction.description}</h3>
                      <Badge className={getTransactionTypeColor(transaction.transaction_type)}>
                        {transaction.transaction_type}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">Reference: {transaction.reference_number}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">₦{transaction.amount.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(transaction.transaction_date), "MMM dd, yyyy")}
                    </div>
                  </div>
                </div>

                {/* Accounting Entries */}
                <div className="border-t pt-3">
                  <div className="text-sm font-medium mb-2">Accounting Entries:</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {transaction.accounting_entries.map((entry) => (
                      <div key={entry.id} className="flex justify-between p-2 bg-gray-50 rounded">
                        <span>
                          {entry.chart_of_accounts.account_code} - {entry.chart_of_accounts.account_name}
                        </span>
                        <span className={entry.debit_amount > 0 ? "text-red-600" : "text-green-600"}>
                          {entry.debit_amount > 0 ? "Dr" : "Cr"} ₦
                          {(entry.debit_amount || entry.credit_amount).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {transactions.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No transactions recorded yet. Create your first transaction above.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
