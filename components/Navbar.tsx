"use client"

import Link from "next/link"
import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  HeartHandshake,
  Menu,
  X,
  User,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  BriefcaseBusiness,
} from "lucide-react"
import { authClient } from "@/lib/auth-client"

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  const router = useRouter()
  const pathname = usePathname()

  const { data: session, isPending } = authClient.useSession()

  const userRole =
    (session?.user as { role?: string } | undefined)?.role || "customer"

  const dashboardPath =
    userRole === "admin"
      ? "/dashboard/admin"
      : userRole === "vendor"
        ? "/dashboard/vendor"
        : "/dashboard/customer"
  const profilePath =
    userRole === "admin"
      ? "/dashboard/admin/profile"
      : userRole === "vendor"
        ? "/dashboard/vendor/profile"
        : "/dashboard/customer/profile"
  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Browse Services", href: "/browse-services" },
    ...(session?.user ? [{ name: "Dashboard", href: dashboardPath }] : []),
  ]

  const handleLogout = async () => {
    try {
      await authClient.signOut()

      setShowProfile(false)
      setIsOpen(false)

      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  const closeMenu = () => {
    setIsOpen(false)
    setShowProfile(false)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#F0E5E1] bg-white/95 shadow-sm backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-5">
        <div className="flex h-[76px] items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            onClick={closeMenu}
            className="flex shrink-0 items-center gap-2"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F7E9E6] text-[#A65D55]">
              <HeartHandshake size={23} />
            </span>

            <span className="text-2xl font-bold tracking-tight text-[#A65D55]">
              WedNest<span className="text-[#D6A69D]">.</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`relative rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                  isActive(link.href)
                    ? "bg-[#FDF3F0] text-[#A65D55]"
                    : "text-gray-600 hover:bg-[#FDF3F0] hover:text-[#A65D55]"
                }`}
              >
                {link.name}

                {isActive(link.href) && (
                  <span className="absolute bottom-0 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-[#A65D55]" />
                )}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden items-center gap-4 md:flex">
            {isPending ? (
              <div className="h-10 w-24 animate-pulse rounded-lg bg-gray-100" />
            ) : session?.user ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfile(!showProfile)}
                  className="flex items-center gap-3 rounded-xl border border-[#F0E5E1] bg-white px-3 py-2 transition hover:border-[#D6A69D] hover:bg-[#FDF9F7]"
                >
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt="Profile"
                      className="h-9 w-9 rounded-full border border-[#F0E5E1] object-cover"
                    />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#A65D55] font-semibold text-white">
                      {session.user.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}

                  <div className="text-left">
                    <p className="max-w-[110px] truncate text-sm font-semibold text-gray-800">
                      {session.user.name}
                    </p>
                    <p className="text-xs text-[#A65D55] capitalize">
                      {userRole}
                    </p>
                  </div>

                  <ChevronDown
                    className={`h-4 w-4 text-gray-400 transition ${
                      showProfile ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showProfile && (
                  <>
                    <button
                      aria-label="Close profile menu"
                      className="fixed inset-0 z-40 cursor-default"
                      onClick={() => setShowProfile(false)}
                    />

                    <div className="absolute top-14 right-0 z-50 w-60 overflow-hidden rounded-xl border border-[#F0E5E1] bg-white p-2 shadow-xl">
                      <div className="border-b border-[#F0E5E1] px-3 py-3">
                        <p className="truncate text-sm font-semibold text-gray-800">
                          {session.user.name}
                        </p>
                        <p className="truncate text-xs text-gray-500">
                          {session.user.email}
                        </p>
                      </div>

                      <Link
                        href={profilePath}
                        onClick={() => setShowProfile(false)}
                        className="mt-2 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-600 transition hover:bg-[#FDF3F0] hover:text-[#A65D55]"
                      >
                        <User size={17} />
                        My Profile
                      </Link>

                      <Link
                        href={dashboardPath}
                        onClick={() => setShowProfile(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-600 transition hover:bg-[#FDF3F0] hover:text-[#A65D55]"
                      >
                        <LayoutDashboard size={17} />
                        Dashboard
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-500 transition hover:bg-red-50"
                      >
                        <LogOut size={17} />
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/signin"
                  className="rounded-lg px-5 py-2.5 text-sm font-semibold text-[#A65D55] transition hover:bg-[#FDF3F0]"
                >
                  Sign In
                </Link>

                <Link
                  href="/signup"
                  className="rounded-lg bg-[#A65D55] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#884840]"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-lg p-2 text-[#A65D55] transition hover:bg-[#FDF3F0] md:hidden"
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={25} /> : <Menu size={25} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="border-t border-[#F0E5E1] bg-white py-5 md:hidden">
            <div className="flex flex-col gap-3">
              <nav className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={closeMenu}
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                      isActive(link.href)
                        ? "bg-[#A65D55] text-white"
                        : "text-gray-600 hover:bg-[#FDF3F0] hover:text-[#A65D55]"
                    }`}
                  >
                    {link.name === "Browse Services" && (
                      <BriefcaseBusiness size={18} />
                    )}

                    {link.name === "Dashboard" && <LayoutDashboard size={18} />}

                    {link.name === "Home" && <HeartHandshake size={18} />}

                    {link.name}
                  </Link>
                ))}
              </nav>

              <div className="flex flex-col gap-3 border-t border-[#F0E5E1] pt-5">
                {!isPending &&
                  (session?.user ? (
                    <>
                      {/* Mobile Profile */}
                      <div className="flex items-center gap-3 rounded-xl bg-[#FDF3F0] p-3">
                        {session.user.image ? (
                          <img
                            src={session.user.image}
                            alt="Profile"
                            className="h-11 w-11 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#A65D55] font-semibold text-white">
                            {session.user.name?.charAt(0).toUpperCase() || "U"}
                          </div>
                        )}

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-gray-800">
                            {session.user.name}
                          </p>
                          <p className="truncate text-xs text-gray-500">
                            {session.user.email}
                          </p>
                          <p className="text-xs text-[#A65D55] capitalize">
                            {userRole}
                          </p>
                        </div>
                      </div>
                      <Link
                        href={profilePath}
                        onClick={closeMenu}
                        className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-gray-600 transition hover:bg-[#FDF3F0] hover:text-[#A65D55]"
                      >
                        <User size={18} />
                        My Profile
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-red-500 transition hover:bg-red-50"
                      >
                        <LogOut size={18} />
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/signin"
                        onClick={closeMenu}
                        className="rounded-lg border border-[#A65D55] py-3 text-center text-sm font-semibold text-[#A65D55] transition hover:bg-[#FDF3F0]"
                      >
                        Sign In
                      </Link>

                      <Link
                        href="/signup"
                        onClick={closeMenu}
                        className="rounded-lg bg-[#A65D55] py-3 text-center text-sm font-semibold text-white transition hover:bg-[#884840]"
                      >
                        Sign Up
                      </Link>
                    </>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Navbar
