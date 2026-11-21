"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Users,
  UserRound,
  Store,
  ShieldCheck,
  Search,
  RefreshCw,
  Mail,
  CalendarDays,
  LoaderCircle,
} from "lucide-react"
import { toast } from "sonner"
import {
  getAdminUsers,
  updateUserRole,
  banUser,
  unbanUser,
  deleteUser,
} from "@/lib/actions/users";

type UserRole = "admin" | "vendor" | "customer"

type User = {
  _id: string
  name: string
  email: string
  image: string
  role: UserRole
  businessName: string
  subscriptionPlan: string
  createdAt: string | null
  isBanned: boolean
  banReason: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [updatingId, setUpdatingId] = useState("")

  const loadUsers = async () => {
    setLoading(true)

    const result = await getAdminUsers()

    if (result.success) {
      setUsers(result.users as User[])
    } else {
      toast.error(result.message)
    }

    setLoading(false)
  }

  useEffect(() => {
    let active = true

    getAdminUsers().then((result) => {
      if (!active) return

      if (result.success) {
        setUsers(result.users as User[])
      } else {
        toast.error(result.message)
      }

      setLoading(false)
    })

    return () => {
      active = false
    }
  }, [])

  const handleBanToggle = async (user: User) => {
    const result = user.isBanned
      ? await unbanUser(user._id)
      : await banUser(user._id)

    if (result.success) {
      toast.success(result.message)
      await loadUsers()
    } else {
      toast.error(result.message)
    }
  }

  const handleDelete = async (user: User) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete ${user.name}?`
    )

    if (!confirmed) return

    const result = await deleteUser(user._id)

    if (result.success) {
      toast.success(result.message)
      await loadUsers()
    } else {
      toast.error(result.message)
    }
  }

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchMatch =
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())

      const roleMatch = roleFilter === "all" || user.role === roleFilter

      return searchMatch && roleMatch
    })
  }, [users, search, roleFilter])

  const adminCount = users.filter((user) => user.role === "admin").length
  const vendorCount = users.filter((user) => user.role === "vendor").length
  const customerCount = users.filter((user) => user.role === "customer").length

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setUpdatingId(userId)

    const result = await updateUserRole(userId, newRole)

    if (result.success) {
      toast.success(result.message)
      await loadUsers()
    } else {
      toast.error(result.message)
    }

    setUpdatingId("")
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
  }

  const getRoleStyle = (role: string) => {
    if (role === "admin") {
      return "bg-purple-50 text-purple-700 border-purple-100"
    }

    if (role === "vendor") {
      return "bg-orange-50 text-[#A65D55] border-orange-100"
    }

    return "bg-blue-50 text-blue-700 border-blue-100"
  }

  return (
    <div className="min-h-screen space-y-7 bg-[#FAF8F7] p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[#A65D55]">
            <ShieldCheck size={17} />
            Admin Management
          </div>

          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            User Management
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Manage platform users, monitor roles and control access.
          </p>
        </div>

        <button
          onClick={loadUsers}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl border border-[#F0E5E1] bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-[#FFF8F6] disabled:opacity-60"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh Users
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-[#F0E5E1] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                {users.length}
              </h2>
            </div>
            <div className="rounded-xl bg-[#FFF1ED] p-3 text-[#A65D55]">
              <Users size={23} />
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-400">
            Registered platform accounts
          </p>
        </div>

        <div className="rounded-2xl border border-[#F0E5E1] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Customers</p>
              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                {customerCount}
              </h2>
            </div>
            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <UserRound size={23} />
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-400">Customer accounts</p>
        </div>

        <div className="rounded-2xl border border-[#F0E5E1] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Vendors</p>
              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                {vendorCount}
              </h2>
            </div>
            <div className="rounded-xl bg-orange-50 p-3 text-orange-600">
              <Store size={23} />
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-400">
            Service provider accounts
          </p>
        </div>

        <div className="rounded-2xl border border-[#F0E5E1] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Administrators
              </p>
              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                {adminCount}
              </h2>
            </div>
            <div className="rounded-xl bg-purple-50 p-3 text-purple-600">
              <ShieldCheck size={23} />
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-400">Users with admin access</p>
        </div>
      </div>

      {/* User Table */}
      <div className="overflow-hidden rounded-2xl border border-[#F0E5E1] bg-white shadow-sm">
        <div className="border-b border-[#F0E5E1] p-5 sm:p-6">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-900">All Users</h2>
              <p className="mt-1 text-sm text-gray-500">
                View and manage registered accounts.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name or email..."
                  className="w-full rounded-xl border border-[#EAE2DF] py-3 pr-4 pl-10 text-sm transition outline-none focus:border-[#A65D55] sm:w-64"
                />
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="rounded-xl border border-[#EAE2DF] bg-white px-4 py-3 text-sm text-gray-700 outline-none focus:border-[#A65D55]"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="vendor">Vendor</option>
                <option value="customer">Customer</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead className="bg-[#FCF9F8]">
              <tr className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Subscription</th>
                <th className="px-6 py-4">Joined Date</th>
                <th className="px-6 py-4">Manage Role</th>
                <th className="px-6 py-4">Account Status</th>
                <th className="px-6 py-4">Actions</th>
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
                      Loading users...
                    </p>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <Users size={32} className="mx-auto text-gray-300" />
                    <p className="mt-3 font-semibold text-gray-700">
                      No users found
                    </p>
                    <p className="mt-1 text-sm text-gray-400">
                      Try changing your search or filter.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="transition hover:bg-[#FFFCFB]">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {user.image ? (
                          <img
                            src={user.image}
                            alt={user.name}
                            className="h-11 w-11 rounded-full border border-gray-100 object-cover"
                          />
                        ) : (
                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F8EAE6] text-sm font-bold text-[#A65D55]">
                            {getInitials(user.name)}
                          </div>
                        )}

                        <div>
                          <p className="font-semibold text-gray-900">
                            {user.name}
                          </p>
                          <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                            <Mail size={12} />
                            {user.email}
                          </p>
                          {user.businessName && (
                            <p className="mt-1 text-xs text-gray-400">
                              {user.businessName}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getRoleStyle(user.role)}`}
                      >
                        {user.role}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 capitalize">
                        {user.subscriptionPlan}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <CalendarDays size={15} />
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : "N/A"}
                      </div>
                    </td>
<td className="px-6 py-4">
  <span
    className={`rounded-full px-3 py-1 text-xs font-semibold ${
      user.isBanned
        ? "bg-red-50 text-red-600"
        : "bg-green-50 text-green-700"
    }`}
  >
    {user.isBanned ? "Banned" : "Active"}
  </span>
</td>

<td className="px-6 py-4">
  <div className="flex items-center gap-2">
    <button
      onClick={() => handleBanToggle(user)}
      className={`rounded-lg px-3 py-2 text-xs font-semibold ${
        user.isBanned
          ? "bg-green-50 text-green-700 hover:bg-green-100"
          : "bg-orange-50 text-orange-700 hover:bg-orange-100"
      }`}
    >
      {user.isBanned ? "Unban" : "Ban"}
    </button>

    <button
      onClick={() => handleDelete(user)}
      className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100"
    >
      Delete
    </button>
  </div>
</td>
                    <td className="px-6 py-4">
                      <div className="relative flex items-center gap-2">
                        <select
                          value={user.role}
                          disabled={updatingId === user._id}
                          onChange={(e) =>
                            handleRoleChange(
                              user._id,
                              e.target.value as UserRole
                            )
                          }
                          className="rounded-lg border border-[#EAE2DF] bg-white px-3 py-2 text-sm font-medium text-gray-700 capitalize outline-none focus:border-[#A65D55] disabled:opacity-50"
                        >
                          <option value="customer">Customer</option>
                          <option value="vendor">Vendor</option>
                          <option value="admin">Admin</option>
                        </select>

                        {updatingId === user._id && (
                          <LoaderCircle
                            size={16}
                            className="animate-spin text-[#A65D55]"
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col justify-between gap-2 border-t border-[#F0E5E1] px-6 py-4 text-xs text-gray-500 sm:flex-row sm:items-center">
          <p>
            Showing {filteredUsers.length} of {users.length} users
          </p>
          <p>WedNest Admin Panel</p>
        </div>
      </div>
    </div>
  )
}
