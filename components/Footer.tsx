import Link from "next/link"
import {
  Heart,
  MapPin,
  Mail,
  Phone,
  ArrowUpRight,
  Sparkles,
} from "lucide-react"

const Footer = () => {
  const quickLinks = [
    { label: "Home", href: "/" },
    { label: "Browse Services", href: "/browse-services" },
    { label: "About Us", href: "/about" },
    { label: "Contact Us", href: "/contact" },
  ]

  const accountLinks = [
    { label: "Sign In", href: "/signin" },
    { label: "Create Account", href: "/signup" },
    { label: "Customer Dashboard", href: "/dashboard/customer" },
    { label: "Vendor Dashboard", href: "/dashboard/vendor" },
  ]

  return (
    <footer className="w-full bg-[#211B1A] text-white">
      <div className="mx-auto max-w-7xl px-6 pt-16 sm:px-8 lg:px-10">
        <div className="grid gap-12 border-b border-white/10 pb-14 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr] lg:gap-10">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#A65D55]">
                <Heart size={22} className="fill-white text-white" />
              </div>
              <span className="text-2xl font-bold">
                Wed<span className="text-[#D99A8F]">Nest</span>
              </span>
            </Link>

            <p className="mt-6 max-w-sm text-sm leading-7 text-white/55">
              Every love story deserves a beautiful beginning. Discover trusted
              wedding professionals and plan your special day effortlessly with
              WedNest.
            </p>

            <div className="mt-7 flex gap-3">
              <a
                href="https://www.facebook.com/iftekhar.m.alAsif"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/65 hover:bg-[#A65D55] hover:text-white"
              >
                Facebook
              </a>
              <a
                href="https://www.instagram.com/steike_x_iftekhar/"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/65 hover:bg-[#A65D55] hover:text-white"
              >
                Instagram
              </a>
            </div>
          </div>

          <div>
            <h3 className="mb-6 text-sm font-bold">Quick Links</h3>
            <ul className="space-y-4">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/55 hover:text-[#D99A8F]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-6 text-sm font-bold">Your Account</h3>
            <ul className="space-y-4">
              {accountLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/55 hover:text-[#D99A8F]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-6 text-sm font-bold">Get in Touch</h3>
            <p className="mb-6 text-sm leading-6 text-white/55">
              Have questions or need help planning your wedding? We are here to
              help.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <MapPin size={17} className="text-[#D99A8F]" />
                <span className="text-sm text-white/60">Dhaka, Bangladesh</span>
              </div>

              <a
                href="mailto:support@wednest.com"
                className="flex items-center gap-3 text-sm text-white/60 hover:text-[#D99A8F]"
              >
                <Mail size={17} className="text-[#D99A8F]" />
                iftekharm.alasif@gmail.com
              </a>

              <a
                href="tel:+8801000000000"
                className="flex items-center gap-3 text-sm text-white/60 hover:text-[#D99A8F]"
              >
                <Phone size={17} className="text-[#D99A8F]" />
                +880 1763 058003
              </a>
            </div>
          </div>
        </div>

        <div className="my-12 rounded-2xl border border-white/10 bg-[#A65D55]/10 px-6 py-8 sm:px-10">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <div className="mb-3 flex items-center gap-2 text-[#D99A8F]">
                <Sparkles size={16} />
                <span className="text-xs font-semibold tracking-[0.2em] uppercase">
                  Make It Memorable
                </span>
              </div>
              <h3 className="text-xl font-bold sm:text-2xl">
                Your dream wedding starts with WedNest.
              </h3>
              <p className="mt-2 text-sm text-white/55">
                Find the right people, plan every detail, and celebrate your
                love story.
              </p>
            </div>

            <Link
              href="/browse-services"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#A65D55] px-6 py-3.5 text-sm font-semibold hover:bg-[#914B44]"
            >
              Explore Services
              <ArrowUpRight size={17} />
            </Link>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 py-6 text-center sm:flex-row">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} WedNest. All rights reserved.
          </p>
          <p className="flex items-center gap-1.5 text-xs text-white/45">
            Crafted with
            <Heart size={13} className="fill-[#D99A8F] text-[#D99A8F]" />
            for your special day.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
