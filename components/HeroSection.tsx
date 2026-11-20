
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Heart } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative flex min-h-[650px] items-center overflow-hidden bg-[#F9F3EF] md:min-h-[750px]">

      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2000')",
        }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 py-24 md:px-10">

        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl"
        >
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/15 px-4 py-2 text-sm text-white backdrop-blur-md">
            <Heart size={15} className="fill-[#E8B4A9] text-[#E8B4A9]" />
            Your Journey to Forever Starts Here
          </div>

          {/* Heading */}
          <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
            Make Your Dream Wedding
            <span className="mt-2 block font-serif italic font-normal text-[#F2C9BC]">
              A Beautiful Reality
            </span>
          </h1>

          {/* Description */}
          <p className="mt-7 max-w-xl text-base leading-8 text-white/90 md:text-lg">
            Discover trusted wedding professionals, explore beautiful venues,
            and find everything you need to create your perfect wedding day
            — all in one place.
          </p>

          {/* Buttons */}
          <div className="mt-9 flex flex-col gap-4 sm:flex-row">

            <Link
              href="/browse-services"
              className="group inline-flex items-center justify-center gap-3 rounded-lg bg-[#A65D55] px-7 py-4 font-semibold text-white shadow-lg transition duration-300 hover:-translate-y-1 hover:bg-[#884840]"
            >
              Explore Wedding Services
              <ArrowRight
                size={19}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>

            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-lg border border-white/70 bg-white/10 px-7 py-4 font-semibold text-white backdrop-blur-sm transition hover:bg-white hover:text-[#A65D55]"
            >
              Get Started
            </Link>

          </div>

          {/* Bottom Text */}
          <div className="mt-12 flex flex-wrap items-center gap-6 text-sm text-white/90">
            <span>♡ Trusted Wedding Vendors</span>
            <span>✦ Personalized Planning</span>
          </div>

        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
