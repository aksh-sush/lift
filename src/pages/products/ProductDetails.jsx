// src/pages/products/[id].jsx

import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { Award, Phone, Star, Settings, Building2, ThumbsUp } from "lucide-react";
import SafetyShieldIcon from "@/components/icons/SafetyShieldIcon";
import ClockTickIcon from "@/components/icons/ClockTickIcon";
// Header and Footer are rendered globally in _app.jsx
import { useMemo, useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BackgroundGradient } from "@/components/ui/BackgroundGradient";
import { Spotlight } from "@/components/ui/Spotlight";

/** Respect OS “Reduce motion” preference */
const FORCE_MOTION = false;

const PRODUCT_DATA = {
  rauli: {
    name: "Rauli Elevator",
    subtitle: "Rope Type",
    description:
      "Premium rope-driven elevator systems engineered for high-rise buildings and superior performance. Our Rauli elevators represent the pinnacle of vertical transportation technology.",
    image:
      "/Products/RauliNew.avif",
    color: "blue",
    specifications: [
      { label: "Load Capacity", value: "1000–3000 kg" },
      { label: "Speed Range", value: "1.0–4.0 m/s" },
      { label: "Travel Height", value: "Up to 300 m" },
      { label: "Machine Room", value: "Required" },
      { label: "Door Type", value: "Automatic sliding" },
      { label: "Control System", value: "Microprocessor-based" },
    ],
    features: [
      "High-speed operation up to 4.0 m/s",
      "Energy-efficient regenerative drive",
      "Superior ride quality with minimal vibration",
      "Advanced safety systems with multiple backups",
      "Smooth acceleration and deceleration",
      "Intelligent destination control system",
      "Emergency communication system",
      "Fire service operation capability",
    ],
    applications: [
      "High-rise office buildings",
      "Luxury residential towers",
      "Commercial complexes",
      "Mixed-use developments",
      "Corporate headquarters",
      "Premium hotels",
    ],
    advantages: [
      "Exceptional ride comfort and smoothness",
      "Energy-efficient operation reduces costs",
      "Minimal noise levels for quiet operation",
      "Advanced control systems for optimal performance",
      "Reliable operation with minimal downtime",
      "Customizable cabin designs and finishes",
    ],
  },
  hydraulic: {
    name: "Hydraulic Elevator",
    subtitle: "Hole Type",
    description:
      "Reliable hydraulic systems perfect for low to mid-rise buildings with exceptional durability. Our hydraulic elevators offer cost-effective solutions without compromising on quality.",
    image:
      "/Products/HydraulicNew.avif",
    color: "emerald",
    specifications: [
      { label: "Load Capacity", value: "500–2500 kg" },
      { label: "Speed Range", value: "0.15–1.0 m/s" },
      { label: "Travel Height", value: "Up to 18 m" },
      { label: "Machine Room", value: "Not required" },
      { label: "Power Supply", value: "220V/380V" },
      { label: "Hydraulic System", value: "In-ground or holeless" },
    ],
    features: [
      "Cost-effective installation and maintenance",
      "Reliable hydraulic operation system",
      "Low maintenance requirements",
      "Precise floor leveling capability",
      "Smooth and quiet operation",
      "Space-saving design options",
      "Emergency manual lowering system",
      "Environmentally friendly hydraulic fluid",
    ],
    applications: [
      "Low-rise office buildings",
      "Shopping centers and malls",
      "Small residential buildings",
      "Warehouses and industrial facilities",
      "Medical facilities",
      "Educational institutions",
    ],
    advantages: [
      "Lower initial installation cost",
      "Smooth and comfortable operation",
      "Easy maintenance and servicing",
      "Space-saving machine roomless design",
      "Reliable performance in various conditions",
      "Flexible installation options",
    ],
  },
  goods: {
    name: "Goods Elevator",
    subtitle: "Manual Door",
    description:
      "Heavy-duty freight elevators designed for industrial and commercial cargo transportation. Built to handle the toughest loads with maximum durability and reliability.",
    image:
      "/Products/GoodsNew.avif",
    color: "orange",
    specifications: [
      { label: "Load Capacity", value: "1000–5000 kg" },
      { label: "Speed Range", value: "0.25–1.0 m/s" },
      { label: "Platform Size", value: "Customizable" },
      { label: "Door Type", value: "Manual sliding" },
      { label: "Construction", value: "Heavy-duty steel" },
      { label: "Safety Features", value: "Industrial grade" },
    ],
    features: [
      "High load capacity up to 5000 kg",
      "Robust steel construction",
      "Manual door operation for durability",
      "Industrial-grade safety systems",
      "Customizable platform dimensions",
      "Heavy-duty guide rails",
      "Overload protection system",
      "Emergency stop functionality",
    ],
    applications: [
      "Warehouses and distribution centers",
      "Manufacturing facilities",
      "Loading docks and freight terminals",
      "Industrial complexes",
      "Automotive service centers",
      "Construction sites",
    ],
    advantages: [
      "Heavy-duty construction for maximum durability",
      "Cost-effective operation and maintenance",
      "Minimal maintenance requirements",
      "Reliable performance under heavy use",
      "Customizable to specific requirements",
      "Long service life with proper maintenance",
    ],
  },
  passenger: {
    name: "Passenger Elevator",
    subtitle: "Auto Door",
    description:
      "Sophisticated passenger elevators with automatic doors for seamless urban transportation. Designed for comfort, efficiency, and modern aesthetics.",
    image:
      "/Products/PassengerNew.avif",
    color: "purple",
    specifications: [
      { label: "Load Capacity", value: "450–1600 kg" },
      { label: "Speed Range", value: "1.0–2.5 m/s" },
      { label: "Cabin Size", value: "Standard / Custom" },
      { label: "Door Type", value: "Automatic sliding" },
      { label: "Passengers", value: "6–21 persons" },
      { label: "Control System", value: "Microprocessor" },
    ],
    features: [
      "Automatic door system with sensors",
      "Smooth and quiet operation",
      "Modern cabin design and finishes",
      "User-friendly control panels",
      "LED lighting systems",
      "Voice announcement system",
      "Emergency communication",
      "Energy-efficient operation",
    ],
    applications: [
      "Office buildings and corporate centers",
      "Hotels and hospitality venues",
      "Residential apartment buildings",
      "Shopping malls and retail centers",
      "Educational institutions",
      "Government buildings",
    ],
    advantages: [
      "Elegant design enhances building aesthetics",
      "Quiet operation for user comfort",
      "Advanced safety features for peace of mind",
      "Energy-efficient systems reduce operating costs",
      "Customizable cabin interiors",
      "Reliable performance with minimal downtime",
    ],
  },
  hospital: {
    name: "Hospital Elevator",
    subtitle: "Stretchers / Wheelchairs",
    description:
      "Specialized medical elevators designed for healthcare facilities with accessibility features. Engineered to meet the unique demands of medical environments.",
    image:
      "/Products/HospitalNew.avif",
    color: "red",
    specifications: [
      { label: "Load Capacity", value: "1000–2500 kg" },
      { label: "Speed Range", value: "1.0–1.6 m/s" },
      { label: "Door Width", value: "1100–1400 mm" },
      { label: "Cabin Depth", value: "Extended for stretchers" },
      { label: "Door Type", value: "Automatic with sensors" },
      { label: "Special Features", value: "Medical-grade materials" },
    ],
    features: [
      "Extra-wide doors for stretcher access",
      "Smooth acceleration for patient comfort",
      "Hygienic and easy-to-clean surfaces",
      "Emergency communication systems",
      "Antibacterial cabin materials",
      "Extended door open time",
      "Priority call functionality",
      "Independent service operation",
    ],
    applications: [
      "Hospitals and medical centers",
      "Nursing homes and care facilities",
      "Rehabilitation centers",
      "Medical research facilities",
      "Emergency medical services",
      "Specialized healthcare facilities",
    ],
    advantages: [
      "Stretcher and wheelchair compatible design",
      "Antibacterial surfaces for hygiene",
      "Emergency communication for safety",
      "Smooth ride quality for patient comfort",
      "Reliable operation in critical environments",
      "Compliance with medical facility standards",
    ],
  },
};

/* INR pricing to match Products page */
const PRICING = {
  rauli: { amount: "₹6,800,000", currency: "INR", note: "Installation included" },
  hydraulic: { amount: "₹3,600,000", currency: "INR", note: "Complete hydraulic system" },
  goods: { amount: "₹5,200,000", currency: "INR", note: "Heavy-duty construction" },
  passenger: { amount: "₹4,400,000", currency: "INR", note: "Auto door system included" },
  hospital: { amount: "₹6,000,000", currency: "INR", note: "Medical grade materials" },
};

const COLOR_MAP = {
  blue: { bg: "from-blue-500 to-blue-600", text: "text-blue-600", accent: "bg-blue-50" },
  emerald: { bg: "from-emerald-500 to-emerald-600", text: "text-emerald-600", accent: "bg-emerald-50" },
  orange: { bg: "from-orange-500 to-orange-600", text: "text-orange-600", accent: "bg-orange-50" },
  purple: { bg: "from-purple-500 to-purple-600", text: "text-purple-600", accent: "bg-purple-50" },
  red: { bg: "from-red-500 to-red-600", text: "text-red-600", accent: "bg-red-50" },
};

// Price helpers (match Products.jsx)
const parseMoney = (str) => {
  const n = parseFloat(String(str).replace(/[^0-9.]/g, ""));
  return isNaN(n) ? 0 : n;
};
const findSymbol = (str) => (String(str).match(/^[^\d]+/)?.[0] || "₹").trim();
const formatMoney = (n, symbol = "₹") => `${symbol}${Math.round(n).toLocaleString("en-IN")}`;

// Match Services page CTA animation
const EASE = [0.22, 1, 0.36, 1];
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE },
  },
};

/** Hydration-safe reduce-motion check with optional override */
function useCanAnimate() {
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (FORCE_MOTION || !reduce) && mounted;
}

export default function ProductDetails(props) {
  const router = useRouter();
  const routeId = router?.query?.id;
  const id = props?.id || (typeof routeId === "string" ? routeId : undefined);

  const product = useMemo(() => {
    if (!id || typeof id !== "string") return null;
    return PRODUCT_DATA[id];
  }, [id]);

  const pricing = useMemo(() => {
    if (!id || typeof id !== "string") return PRICING.rauli;
    return PRICING[id] || PRICING.rauli;
  }, [id]);

  const colors = useMemo(() => {
    if (!product) return COLOR_MAP.blue;
    return COLOR_MAP[product.color] || COLOR_MAP.blue;
  }, [product]);

  const canAnimate = useCanAnimate();

  // Pricing helpers to mirror Products page visuals
  const symbol = useMemo(() => findSymbol(pricing.amount), [pricing.amount]);
  const nowPrice = useMemo(() => parseMoney(pricing.amount), [pricing.amount]);
  const originalPrice = useMemo(() => (nowPrice > 0 ? nowPrice / 0.85 : 0), [nowPrice]);

  if (!id) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <span className="text-gray-600">Loading…</span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white pt-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <Link href="/products" className="text-blue-600 hover:text-blue-800">
            Return to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>{`${product.name} — SVS Unitech Elevators`}</title>
        <meta
          name="description"
          content={`${product.name} details, specifications, features and applications.`}
        />
      </Head>

      {/* Header rendered in _app.jsx */}

      {/* Hero Section */}
      <section className="relative pt-2 sm:pt-4 md:pt-6 pb-12 sm:pb-16 md:pb-20 bg-white">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-white" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Subtitle pill — match Products page style */}
          <div className="mb-6">
            <span className="inline-block px-3 py-1.5 bg-[#7BBF31]/20 backdrop-blur-sm rounded-full text-[#7BBF31] text-xs font-medium border border-[#7BBF31]/30">
              {product.subtitle}
            </span>
          </div>
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-stretch">
            {/* Left: Content */}
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                {product.name}
              </h1>

              <p className="text-lg sm:text-xl text-gray-600 leading-relaxed mb-8">
                {product.description}
              </p>

              {/* Pricing Card — wrapped with BackgroundGradient */}
              <div className="mt-8">
                <BackgroundGradient
                  animate
                  containerClassName="rounded-3xl ring-1 ring-[#78A323]/60"
                  className="rounded-3xl"
                >
                  <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-[#080331] shadow-2xl">
                    {/* Copied price UI */}
                    <div className="relative">
                    {/* main card */}
                    <div className="relative bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-5 shadow-2xl overflow-hidden">
                      {/* animated background */}
                      <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/30 via-transparent to-white/10"></div>
                        <div className="absolute -top-3 -right-3 w-20 h-20 bg-white/20 rounded-full animate-bounce"></div>
                        <div className="absolute -bottom-2 -left-2 w-14 h-14 bg-white/15 rounded-full animate-float-1"></div>
                      </div>

                      {/* glowing border */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/20 via-transparent to-white/20"></div>

                      {/* content */}
                      <div className="relative z-10 text-center text-white">
                        {/* Innovative pill */}
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-xs font-extrabold tracking-widest mb-3">
                          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/70">
                            STARTING FROM
                          </span>
                        </div>

                        {/* shimmer underline */}
                        <div className="relative mx-auto -mt-1 mb-4 h-px w-28 overflow-hidden rounded-full">
                          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/70 to-transparent" />
                        </div>

                        {/* prices row */}
                        <div className="mb-2.5 flex items-baseline justify-center gap-3">
                          <div className="text-3xl font-black">{pricing.amount}</div>
                          {originalPrice > 0 && (
                            <div className="text-lg font-bold line-through opacity-80">
                              {formatMoney(originalPrice, symbol)}
                            </div>
                          )}
                        </div>

                        {/* badges row */}
                        <div className="mt-2 flex items-center justify-center space-x-4 text-xs md:text-sm">
                          <div className="flex items-center space-x-2">
                            <div className="w-2.5 h-2.5 bg-[#080331] rounded-full"></div>
                            <span className="font-semibold">Best Value</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-2.5 h-2.5 bg-[#7BBF31] rounded-full"></div>
                            <span className="font-semibold">Premium Quality</span>
                          </div>
                        </div>
                      </div>

                      {/* float bits */}
                      <div className="absolute top-3 right-3 w-6 h-6 bg-white/30 rounded-full animate-float-3"></div>
                      <div className="absolute bottom-3 left-3 w-5 h-5 bg-white/25 rounded-full animate-float-1"></div>

                      {/* sheen */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shine"></div>
                    </div>

                    {/* hover glow removed */}

                    {/* SAVE 15% tag */}
                    <div className="absolute -top-3 -right-3">
                      <div className="bg-gradient-to-r from-red-700 to-red-700 text-white px-3 py-1 rounded-xl shadow-lg font-bold text-xs animate-bounce">
                        SAVE 15%
                      </div>
                    </div>
                  </div>
                  </div>
                </BackgroundGradient>
              </div>
            </div>

            {/* Right: Image – match height from heading to price card on lg+ */}
            <div className="relative lg:self-stretch h-full">
              <BackgroundGradient
                animate
                containerClassName="w-full h-[420px] sm:h-[480px] lg:h-full rounded-3xl shadow-2xl"
                className="w-full h-full rounded-3xl overflow-hidden"
             >
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 640px"
                  className="object-cover"
                  priority={/\.(png|jpe?g|webp|avif)$/i.test(product.image)}
                  decoding="async"
                />
              </BackgroundGradient>
            </div>
          </div>
        </div>
      </section>

      {/* Specifications */}
      <section className="pt-6 sm:pt-8 pb-16 sm:pb-20" style={{ contentVisibility: "auto", containIntrinsicSize: "1px 800px" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">
            Technical Specifications
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {product.specifications.map((spec, idx) => (
              <BackgroundGradient
                key={idx}
                animate
                containerClassName="rounded-2xl overflow-hidden ring-1 ring-[#78A323]/60 h-full"
                className="rounded-2xl h-full"
              >
                <div className="relative isolate overflow-hidden rounded-2xl p-6 text-white bg-[#080331] shadow-2xl h-full">
                  <div
                    className="absolute inset-0 opacity-[0.6] pointer-events-none"
                    style={{
                      backgroundImage:
                        `repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 24px),` +
                        `repeating-linear-gradient(90deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 24px)`,
                    }}
                  />
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="font-medium text-[#7BBF31]">{spec.label}</span>
                    <span className="font-bold text-red-600">{spec.value}</span>
                  </div>
                </div>
              </BackgroundGradient>
            ))}
          </div>
        </div>
      </section>

      {/* Separator (matches Services.jsx) */}
      <motion.div
        className="mx-auto max-w-6xl px-6"
        initial={{ opacity: 0, scaleX: 0 }}
        whileInView={{ opacity: 1, scaleX: 1, transition: { duration: 0.5, ease: EASE } }}
        viewport={{ once: true, amount: 0.6 }}
        style={{ transformOrigin: "center" }}
      >
        <div className="h-[2px] bg-gradient-to-r from-transparent via-[#080331] to-transparent opacity-80"></div>
      </motion.div>

      {/* Features, Applications, Advantages — equal size + perfectly clipped gradient */}
      <section className="py-16 sm:py-20 bg-white" style={{ contentVisibility: "auto", containIntrinsicSize: "1px 1000px" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Equal columns + equal row heights */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 auto-rows-fr items-stretch">
            {[
              { title: "Key Features", items: product.features },
              { title: "Applications", items: product.applications },
              { title: "Advantages", items: product.advantages },
            ].map((section) => (
              <BackgroundGradient
                key={section.title}
                animate
                containerClassName={
                  `relative isolate overflow-hidden rounded-[28px] ring-1 ring-[#78A323]/60 shadow-[0_12px_40px_-12px_rgba(8,3,49,0.5)] h-full ` +
                  // On medium screens, center the single second-row card (Advantages)
                  (section.title === "Advantages"
                    ? "md:col-span-2 md:justify-self-center md:w-full md:max-w-[calc(50%-1rem)] lg:col-span-1 lg:justify-self-auto lg:max-w-none"
                    : "")
                }
                className="rounded-[28px] h-full"
              >
                <div className="relative flex h-full min-h-[480px] md:min-h-[520px] lg:min-h-[560px] flex-col rounded-[28px] bg-[#080331]">
                  {/* perfectly aligned wash inside the same radius */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-[28px]
                               bg-[linear-gradient(180deg,rgba(123,191,49,0.16),transparent_35%)]"
                  />

                  {/* header / badge keeps alignment consistent across cards */}
                  <div className="relative z-10 px-7 pt-12 pb-6 text-center">
                    <div className="mx-auto mb-3 grid place-items-center">
                      <div
                        className="relative grid h-16 w-16 place-items-center rounded-2xl
                                    bg-gradient-to-b from-[#0E133A] to-[#0A0F2A]
                                    ring-1 ring-white/10 shadow-xl"
                      >
                        {/* keep the curvy box border */}
                        <span className="absolute inset-0 rounded-2xl ring-4 ring-[#7BBF31]/40" />

                        {/* pulsing ring animation */}
                        {canAnimate && (
                          <motion.span
                            className="pointer-events-none absolute inset-0 rounded-2xl"
                            initial={{ boxShadow: "0 0 0 0 rgba(123,191,49,0.35)" }}
                            animate={{
                              boxShadow: [
                                "0 0 0 0 rgba(123,191,49,0.35)",
                                "0 0 0 14px rgba(123,191,49,0)",
                              ],
                            }}
                            transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
                            aria-hidden
                          />
                        )}

                        {/* static icon (removed bounce animation) */}
                        {(() => {
                          const SectionIcon =
                            section.title === "Key Features"
                              ? Settings
                              : section.title === "Applications"
                              ? Building2
                              : section.title === "Advantages"
                              ? ThumbsUp
                              : Star;

                          return <SectionIcon className="w-8 h-8 text-[#7BBF31]" />;
                        })()}
                      </div>
                    </div>
                    <h3 className="text-white text-2xl md:text-3xl font-black">
                      {section.title}
                    </h3>
                  </div>

                  {/* content grows; card height remains equal via auto-rows-fr + h-full */}
                  <div className="relative z-10 px-7 pb-8 pt-2 flex-1">
                    <ul className="space-y-3.5 sm:space-y-4 text-gray-300">
                      {section.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-4">
                          {/* Innovative gradient bullet with subtle glow */}
                          <span className="relative mt-1.5 h-3.5 w-3.5 shrink-0">
                            <span className="absolute inset-0 rounded-full bg-gradient-to-r from-[#7BBF31] to-[#78A323]" />
                            <span className="absolute inset-0 rounded-full ring-2 ring-[#7BBF31]/30" aria-hidden />
                            <span className="absolute -inset-1 rounded-full bg-[#7BBF31]/15 blur-sm" aria-hidden />
                          </span>
                          <span className="leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </BackgroundGradient>
            ))}
          </div>
        </div>
      </section>

      {/* Separator above Trust Indicators (matches Services.jsx) */}
      <motion.div
        className="mx-auto max-w-6xl px-6"
        initial={{ opacity: 0, scaleX: 0 }}
        whileInView={{ opacity: 1, scaleX: 1, transition: { duration: 0.5, ease: EASE } }}
        viewport={{ once: true, amount: 0.6 }}
        style={{ transformOrigin: "center" }}
      >
        <div className="h-[2px] bg-gradient-to-r from-transparent via-[#080331] to-transparent opacity-80"></div>
      </motion.div>

      {/* Trust Indicators */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { Icon: SafetyShieldIcon, title: "Safety Certified", desc: "All products meet international safety standards, ensuring secure and reliable operation for every passenger." },
              { Icon: ClockTickIcon, title: "24/7 Support", desc: "Round-the-clock maintenance and service to keep your elevators running smoothly at all times." },
              { Icon: Award, title: "Quality Assured", desc: "Premium materials and expert craftsmanship guarantee durability, performance, and long-lasting reliability." },
            ].map(({ Icon, title, desc }, idx) => {
              const animate = canAnimate
                ? title === "24/7 Support"
                  ? undefined
                  : title === "Safety Certified"
                  ? undefined
                  : title === "Quality Assured"
                  ? { scale: [1, 1.1, 1] }
                  : { scale: [1, 1.08, 1] }
                : undefined;

              const transition = canAnimate
                ? title === "24/7 Support"
                  ? undefined
                  : title === "Safety Certified"
                  ? undefined
                  : title === "Quality Assured"
                  ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" }
                  : { duration: 1.8, repeat: Infinity, ease: "easeInOut" }
                : undefined;

              return (
                <BackgroundGradient
                  key={idx}
                  animate
                  containerClassName="rounded-2xl overflow-hidden ring-1 ring-[#78A323]/60 h-full"
                  className="rounded-2xl h-full"
                >
                  <div className="relative isolate overflow-hidden rounded-2xl p-8 text-white bg-[#080331] shadow-2xl min-h-[18rem] h-full flex flex-col items-center text-center">
                    <div
                      className="absolute inset-0 opacity-[0.6] pointer-events-none"
                      style={{
                        backgroundImage:
                          `repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 24px),` +
                          `repeating-linear-gradient(90deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 24px)`,
                      }}
                    />
                    {canAnimate && (
                      <Spotlight
                        fill="rgba(255,255,255,0.95)"
                        className="opacity-60 mix-blend-screen left-[25%] top-[-45%] w-full h-[700%] [animation-duration:1.2s] hidden lg:block md:animate-none lg:motion-safe:animate-spotlight"
                      />
                    )}
                    <div className="relative z-10">
                      <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 ring-1 ring-[#7BBF31]/35 overflow-visible mb-6">
                        {/* Animate only the icon, not the circular border */}
                        <motion.div
                          animate={animate}
                          transition={transition}
                          aria-hidden
                          className="relative z-10 flex items-center justify-center origin-center"
                          style={{ transformOrigin: "50% 50%" }}
                        >
                          {title === "Safety Certified" ? (
                            <SafetyShieldIcon className="w-8 h-8" />
                          ) : title === "24/7 Support" ? (
                            <ClockTickIcon className="w-8 h-8" />
                          ) : (
                            // Fallback for Quality Assured
                            <Icon className="w-8 h-8 text-[#7BBF31]" />
                          )}
                        </motion.div>
                      </div>
                      <h3 className="text-xl font-bold mb-2">{title}</h3>
                      <p className="text-white/80">{desc}</p>
                    </div>
                  </div>
                </BackgroundGradient>
              );
            })}
          </div>
        </div>
      </section>

      {/* Separator below Features/Applications/Advantages (matches Services.jsx) */}
      <motion.div
        className="mx-auto max-w-6xl px-6"
        initial={{ opacity: 0, scaleX: 0 }}
        whileInView={{ opacity: 1, scaleX: 1, transition: { duration: 0.5, ease: EASE } }}
        viewport={{ once: true, amount: 0.6 }}
        style={{ transformOrigin: "center" }}
      >
        <div className="h-[2px] bg-gradient-to-r from-transparent via-[#080331] to-transparent opacity-80"></div>
      </motion.div>

      {/* Contact CTA (from Services page) */}
      <section
        className="py-16 sm:py-20 bg-white"
        style={{ contentVisibility: "auto", containIntrinsicSize: "800px" }}
      >
        <motion.div
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={fadeUp}
        >
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
            variants={fadeUp}
          >
            Smarter movement, safer floors
          </motion.h2>
          <motion.p
            className="text-xl text-[#78A323] mb-12 leading-relaxed"
            variants={fadeUp}
            transition={{ delay: 0.05 }}
          >
            Let us match you to the perfect specification.
          </motion.p>
          <motion.div
            variants={fadeUp}
            whileHover={{ y: -2, boxShadow: "0 12px 30px rgba(123,191,49,0.35)" }}
            transition={{ type: "spring", stiffness: 320, damping: 22 }}
            className="w-fit mx-auto"
          >
            <Link
              href="/contactus"
              prefetch
              className="
                group relative inline-flex items-center justify-center
                overflow-hidden rounded-2xl px-12 py-4
                text-white font-bold text-lg
                shadow-lg
                bg-[#080331]
                transition-all duration-300
                hover:bg-[#7BBF31]
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7BBF31]/60
              "
            >
              <span
                className="
                  pointer-events-none absolute inset-y-0 -left-1/2 w-1/2
                  -skew-x-12 bg-white/20 blur-sm
                  transition-transform duration-500
                  group-hover:translate-x-[220%]
                "
                aria-hidden
              />
              <span className="phone-wave relative mr-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20">
                <Phone className="h-4 w-4 text-white" strokeWidth={2} aria-hidden />
              </span>
              Let’s Connect
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer rendered in _app.jsx */}
    </div>
  );
}
