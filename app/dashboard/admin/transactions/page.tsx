"use client"

import { useEffect, useMemo, useState } from "react"
import {
  CreditCard,
  Wallet,
  CheckCircle2,
  Clock3,
  XCircle,
  Search,
  RefreshCw,
  Eye,
  X,
  CalendarDays,
  Store,
  Hash,
  ReceiptText,
  LoaderCircle,
  ArrowUpRight,
} from "lucide-react"
import { toast } from "sonner"
import { getAdminTransactions } from "@/lib/actions/admin-transactions"

type TransactionStatus = "completed" | "pending" | "failed" | "cancelled"

type Transaction = {
  _id: string
  vendorId: string
  vendorName: string
  vendorEmail: string
  plan: string
  amount: number
  currency: string
  status: TransactionStatus
  stripeSessionId: string
  stripeSubscriptionId: string
  createdAt: string | null
}

type Stats = {
  total: number
  completed: number
  pending: number
  failed: number
  cancelled: number
  revenue: number
}

type FilterType = "all" | TransactionStatus

const initialStats: Stats = {
  total: 0,
  completed: 0,
  pending: 0,
  failed: 0,
  cancelled: 0,
  revenue: 0,
}

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [stats, setStats] = useState(initialStats)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<FilterType>("all")
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null)

  const loadTransactions = async () => {
    setLoading(true)

    const result = await getAdminTransactions()

    if (result.success) {
      setTransactions(result.transactions as Transaction[])
      setStats(result.stats)
    } else {
      toast.error(result.message)
    }

    setLoading(false)
  }

  useEffect(() => {
    let active = true

    getAdminTransactions().then((result) => {
      if (!active) return

      if (result.success) {
        setTransactions(result.transactions as Transaction[])
        setStats(result.stats)
      } else {
        toast.error(result.message)
      }

      setLoading(false)
    })

    return () => {
      active = false
    }
  }, [])

  const filteredTransactions = useMemo(() => {
    return transactions.filter((item) => {
      const term = search.toLowerCase()

      const matchesSearch =
        item.vendorName.toLowerCase().includes(term) ||
        item.vendorEmail.toLowerCase().includes(term) ||
        item.plan.toLowerCase().includes(term) ||
        item.stripeSessionId.toLowerCase().includes(term) ||
        item.stripeSubscriptionId.toLowerCase().includes(term)

      const matchesFilter = filter === "all" || item.status === filter

      return matchesSearch && matchesFilter
    })
  }, [transactions, search, filter])

  const revenueByCurrency = useMemo(() => {
    const totals = new Map<string, number>()

    transactions
      .filter((item) => item.status === "completed")
      .forEach((item) => {
        totals.set(
          item.currency,
          (totals.get(item.currency) || 0) + item.amount
        )
      })

    return Array.from(totals.entries())
  }, [transactions])

  const formatAmount = (amount: number, currency: string) => {
    try {
      return new Intl.NumberFormat("en-BD", {
        style: "currency",
        currency: currency || "BDT",
        maximumFractionDigits: 2,
      }).format(amount)
    } catch {
      return `${currency} ${amount.toLocaleString()}`
    }
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "completed":
        return "border-green-100 bg-green-50 text-green-700"
      case "failed":
        return "border-red-100 bg-red-50 text-red-700"
      case "cancelled":
        return "border-gray-200 bg-gray-100 text-gray-600"
      default:
        return "border-amber-100 bg-amber-50 text-amber-700"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 size={14} />
      case "failed":
        return <XCircle size={14} />
      case "cancelled":
        return <XCircle size={14} />
      default:
        return <Clock3 size={14} />
    }
  }

  const tabs: {
    label: string
    value: FilterType
    count: number
  }[] = [
    { label: "All Transactions", value: "all", count: stats.total },
    { label: "Completed", value: "completed", count: stats.completed },
    { label: "Pending", value: "pending", count: stats.pending },
    { label: "Failed", value: "failed", count: stats.failed },
    { label: "Cancelled", value: "cancelled", count: stats.cancelled },
  ]

  return (
    <div className="min-h-screen space-y-7 bg-[#FAF8F7] p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[#A65D55]">
            <CreditCard size={17} />
            Finance Management
          </div>

          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Transactions
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Monitor subscription payments and track platform revenue.
          </p>
        </div>

        <button
          onClick={loadTransactions}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl border border-[#F0E5E1] bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-[#FFF8F6] disabled:opacity-60"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-[#F0E5E1] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Total Transactions
              </p>
              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                {stats.total}
              </h2>
            </div>
            <div className="rounded-xl bg-[#FFF1ED] p-3 text-[#A65D55]">
              <ReceiptText size={23} />
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-400">All recorded payments</p>
        </div>

        <div className="rounded-2xl border border-[#F0E5E1] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Successful Payments
              </p>
              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                {stats.completed}
              </h2>
            </div>
            <div className="rounded-xl bg-green-50 p-3 text-green-600">
              <CheckCircle2 size={23} />
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-400">Completed transactions</p>
        </div>

        <div className="rounded-2xl border border-[#F0E5E1] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Pending Payments
              </p>
              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                {stats.pending}
              </h2>
            </div>
            <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
              <Clock3 size={23} />
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-400">Awaiting confirmation</p>
        </div>

        <div className="rounded-2xl border border-[#F0E5E1] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Failed Payments
              </p>
              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                {stats.failed}
              </h2>
            </div>
            <div className="rounded-xl bg-red-50 p-3 text-red-600">
              <XCircle size={23} />
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-400">Unsuccessful payments</p>
        </div>
      </div>

      {/* Revenue Summary */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl bg-[#A65D55] p-6 text-white shadow-sm sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-white/80">
            <Wallet size={18} />
            Completed Payment Amount
          </div>

          <div className="mt-3 space-y-1">
            {revenueByCurrency.length > 0 ? (
              revenueByCurrency.map(([currency, amount]) => (
                <h2 key={currency} className="text-3xl font-bold">
                  {formatAmount(amount, currency)}
                </h2>
              ))
            ) : (
              <h2 className="text-3xl font-bold">৳0.00</h2>
            )}
          </div>

          <p className="mt-2 text-sm text-white/75">
            Based on recorded completed transactions
          </p>
        </div>

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
          <ArrowUpRight size={30} />
        </div>
      </div>

      {/* Transaction Table */}
      <div className="overflow-hidden rounded-2xl border border-[#F0E5E1] bg-white shadow-sm">
        <div className="space-y-5 border-b border-[#F0E5E1] p-5 sm:p-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Payment History</h2>
            <p className="mt-1 text-sm text-gray-500">
              Review vendor subscription transactions.
            </p>
          </div>

          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setFilter(tab.value)}
                  className={`rounded-xl px-3.5 py-2.5 text-xs font-semibold transition sm:text-sm ${
                    filter === tab.value
                      ? "bg-[#A65D55] text-white"
                      : "border border-[#F0E5E1] bg-white text-gray-600 hover:bg-[#FFF8F6]"
                  }`}
                >
                  {tab.label}
                  <span className="ml-1.5 opacity-75">{tab.count}</span>
                </button>
              ))}
            </div>

            <div className="relative">
              <Search
                size={18}
                className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search vendor, plan or Stripe ID..."
                className="w-full rounded-xl border border-[#EAE2DF] py-3 pr-4 pl-10 text-sm transition outline-none focus:border-[#A65D55] sm:w-72"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead className="bg-[#FCF9F8]">
              <tr className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
                <th className="px-6 py-4">Transaction</th>
                <th className="px-6 py-4">Vendor</th>
                <th className="px-6 py-4">Plan</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Details</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#F3EEEC]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <LoaderCircle
                      size={28}
                      className="mx-auto animate-spin text-[#A65D55]"
                    />
                    <p className="mt-3 text-sm text-gray-500">
                      Loading transactions...
                    </p>
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <CreditCard size={34} className="mx-auto text-gray-300" />
                    <p className="mt-3 font-semibold text-gray-700">
                      No transactions found
                    </p>
                    <p className="mt-1 text-sm text-gray-400">
                      Try another search or status filter.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((item) => (
                  <tr key={item._id} className="transition hover:bg-[#FFFCFB]">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-800">
                        #{item._id.slice(-8).toUpperCase()}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        {item.stripeSessionId
                          ? `${item.stripeSessionId.slice(0, 18)}...`
                          : "No session ID"}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F8EAE6] text-[#A65D55]">
                          <Store size={16} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">
                            {item.vendorName}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {item.vendorEmail || "Email unavailable"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="rounded-lg bg-[#FFF1ED] px-3 py-1.5 text-xs font-semibold text-[#A65D55] capitalize">
                        {item.plan}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">
                        {formatAmount(item.amount, item.currency)}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <CalendarDays size={15} />
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString()
                          : "N/A"}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${getStatusStyle(item.status)}`}
                      >
                        {getStatusIcon(item.status)}
                        {item.status}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedTransaction(item)}
                        className="flex items-center gap-1.5 rounded-lg border border-[#F0E5E1] px-3 py-2 text-xs font-semibold text-gray-600 transition hover:bg-[#FFF1ED] hover:text-[#A65D55]"
                      >
                        <Eye size={15} />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col justify-between gap-2 border-t border-[#F0E5E1] px-6 py-4 text-xs text-gray-500 sm:flex-row sm:items-center">
          <p>
            Showing {filteredTransactions.length} of {transactions.length}{" "}
            transactions
          </p>
          <p>WedNest Finance Management</p>
        </div>
      </div>

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={() => setSelectedTransaction(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#F0E5E1] p-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Transaction Details
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Complete payment information
                </p>
              </div>

              <button
                onClick={() => setSelectedTransaction(null)}
                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div className="rounded-2xl bg-[#FFF5F2] p-5 text-center">
                <p className="text-sm text-gray-500">Transaction Amount</p>
                <h3 className="mt-2 text-3xl font-bold text-[#A65D55]">
                  {formatAmount(
                    selectedTransaction.amount,
                    selectedTransaction.currency
                  )}
                </h3>

                <span
                  className={`mt-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getStatusStyle(selectedTransaction.status)}`}
                >
                  {getStatusIcon(selectedTransaction.status)}
                  {selectedTransaction.status}
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Store size={18} className="mt-0.5 text-[#A65D55]" />
                  <div>
                    <p className="text-xs text-gray-400">Vendor</p>
                    <p className="mt-1 font-semibold text-gray-800">
                      {selectedTransaction.vendorName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {selectedTransaction.vendorEmail || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CreditCard size={18} className="mt-0.5 text-[#A65D55]" />
                  <div>
                    <p className="text-xs text-gray-400">Subscription Plan</p>
                    <p className="mt-1 font-semibold text-gray-800 capitalize">
                      {selectedTransaction.plan}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CalendarDays size={18} className="mt-0.5 text-[#A65D55]" />
                  <div>
                    <p className="text-xs text-gray-400">Transaction Date</p>
                    <p className="mt-1 font-semibold text-gray-800">
                      {selectedTransaction.createdAt
                        ? new Date(
                            selectedTransaction.createdAt
                          ).toLocaleString()
                        : "Not available"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Hash size={18} className="mt-0.5 text-[#A65D55]" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-400">Stripe Session ID</p>
                    <p className="mt-1 text-sm font-medium break-all text-gray-800">
                      {selectedTransaction.stripeSessionId || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Hash size={18} className="mt-0.5 text-[#A65D55]" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-400">
                      Stripe Subscription ID
                    </p>
                    <p className="mt-1 text-sm font-medium break-all text-gray-800">
                      {selectedTransaction.stripeSubscriptionId || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-[#F0E5E1] p-5">
              <button
                onClick={() => setSelectedTransaction(null)}
                className="w-full rounded-xl bg-[#A65D55] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#914C45]"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
