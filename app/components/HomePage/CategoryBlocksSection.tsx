'use client'

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  DeviceMobile,
  Headphones,
  SpeakerHigh,
  Watch,
  DeviceTabletSpeaker,
  GameController,
  Bag,
  Bluetooth,
  ArrowRight,
} from "@phosphor-icons/react";

const categories = [
  {
    title: "Smart Phones",
    subtitle: "Infinite Possibilities",
    href: "/collections/smart-phones",
    icon: DeviceMobile,
    badge: "Trending",
    pastelBg: "bg-blue-50",
    pastelBgHover: "group-hover:bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    title: "Mobile Accessories",
    subtitle: "Cases, Chargers & More",
    href: "/collections/mobile-accessories-mobiles-and-tablets-2",
    icon: Bag,
    badge: null,
    pastelBg: "bg-slate-50",
    pastelBgHover: "group-hover:bg-slate-100",
    iconColor: "text-slate-600",
  },
  {
    title: "Headphones",
    subtitle: "Immerse in Sound",
    href: "/collections/headphones-and-headsets",
    icon: Headphones,
    badge: "Best Seller",
    pastelBg: "bg-purple-50",
    pastelBgHover: "group-hover:bg-purple-100",
    iconColor: "text-purple-600",
  },
  {
    title: "Wireless Earbuds",
    subtitle: "True Wireless Freedom",
    href: "/collections/wireless-earbuds",
    icon: Bluetooth,
    badge: null,
    pastelBg: "bg-cyan-50",
    pastelBgHover: "group-hover:bg-cyan-100",
    iconColor: "text-cyan-600",
  },
  {
    title: "Smartwatches",
    subtitle: "Stay Connected",
    href: "/collections/smartwatches",
    icon: Watch,
    badge: "New",
    pastelBg: "bg-emerald-50",
    pastelBgHover: "group-hover:bg-emerald-100",
    iconColor: "text-emerald-600",
  },
  {
    title: "Speakers",
    subtitle: "Surround Yourself",
    href: "/collections/smart-speakers",
    icon: SpeakerHigh,
    badge: null,
    pastelBg: "bg-amber-50",
    pastelBgHover: "group-hover:bg-amber-100",
    iconColor: "text-amber-600",
  },
  {
    title: "Gaming",
    subtitle: "Level Up Your Setup",
    href: "/collections/console-gaming-and-accessories",
    icon: GameController,
    badge: null,
    pastelBg: "bg-red-50",
    pastelBgHover: "group-hover:bg-red-100",
    iconColor: "text-red-600",
  },
  {
    title: "Tablets",
    subtitle: "Elevate Productivity",
    href: "/collections/tablet-accessories",
    icon: DeviceTabletSpeaker,
    badge: null,
    pastelBg: "bg-rose-50",
    pastelBgHover: "group-hover:bg-rose-100",
    iconColor: "text-rose-600",
  },
];

export default function CategoryBlockSection() {
  return (
    <div className="grid grid-cols-2 gap-3 py-2 sm:gap-4 md:grid-cols-4">
      {categories.map((cat) => {
        const Icon = cat.icon;
        return (
          <Link key={cat.title} href={cat.href} className="group">
            <motion.div
              className="relative flex h-full min-h-[160px] flex-col justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-colors hover:border-gray-200"
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              style={{ willChange: "transform" }}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div
                    className={`inline-flex rounded-xl p-2.5 ${cat.pastelBg} ${cat.pastelBgHover} transition-all duration-300`}
                  >
                    <Icon
                      weight="duotone"
                      className={`h-7 w-7 ${cat.iconColor} transition-transform duration-300 group-hover:scale-110`}
                    />
                  </div>
                  {cat.badge && (
                    <span className="rounded-full bg-primaryColor px-2.5 py-0.5 text-[11px] font-medium text-white">
                      {cat.badge}
                    </span>
                  )}
                </div>

                <h3 className="mt-3 text-sm font-semibold text-gray-900 sm:text-base">
                  {cat.title}
                </h3>
                <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
                  {cat.subtitle}
                </p>
              </div>

              <div className="mt-3 flex items-center gap-1 text-xs font-medium text-gray-500 group-hover:text-gray-900 sm:text-sm">
                Explore
                <ArrowRight
                  weight="bold"
                  className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
                />
              </div>
            </motion.div>
          </Link>
        );
      })}
    </div>
  );
}
