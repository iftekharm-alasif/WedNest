"use client"

import Link from "next/link"
import { useState } from "react"
import { HeartHandshake, Menu, X } from "lucide-react"

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)

  const closeMenu = () => setIsOpen(false)

  return (
    <nav className="sticky top-0 z-50 border-b border-[#F0E5E1] bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        {/* Logo */}
        <Link href="/" onClick={closeMenu} className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F7E9E6] text-[#A65D55]">
            <HeartHandshake size={23} />
          </span>

          <span className="text-2xl font-bold tracking-tight text-[#A65D55]">
            WedNest<span className="text-[#D6A69D]">.</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 md:flex">
          <Link
            href="/"
            className="text-sm font-medium text-gray-600 transition hover:text-[#A65D55]"
          >
            Home{" "}
          </Link>
          <Link
            href="/browse-services"
            className="text-sm font-medium text-gray-600 transition hover:text-[#A65D55]"
          >
            Browse Services
          </Link>

          <Link
            href="/dashboard"
            className="text-sm font-medium text-gray-600 transition hover:text-[#A65D55]"
          >
            Dashboard
          </Link>
        </div>

        {/* Desktop Buttons */}
        <div className="hidden items-center gap-3 md:flex">
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
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-lg p-2 text-[#A65D55] hover:bg-[#FDF3F0] md:hidden"
          aria-label="Toggle menu"
          aria-expanded={isOpen}
        >
          {isOpen ? <X size={25} /> : <Menu size={25} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="border-t border-[#F0E5E1] bg-white px-5 py-5 md:hidden">
          <div className="flex flex-col gap-4">
            <Link
              onClick={closeMenu}
              href="/browse-services"
              className="text-sm font-medium text-gray-600 hover:text-[#A65D55]"
            >
              Browse Services
            </Link>

            <Link
              onClick={closeMenu}
              href="/dashboard"
              className="text-sm font-medium text-gray-600 hover:text-[#A65D55]"
            >
              Dashboard
            </Link>

            <div className="flex flex-col gap-3 border-t border-[#F0E5E1] pt-4">
              <Link
                onClick={closeMenu}
                href="/signin"
                className="rounded-lg border border-[#A65D55] px-5 py-2.5 text-center text-sm font-semibold text-[#A65D55]"
              >
                Sign In
              </Link>

              <Link
                onClick={closeMenu}
                href="/signup"
                className="rounded-lg bg-[#A65D55] px-5 py-2.5 text-center text-sm font-semibold text-white hover:bg-[#884840]"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
