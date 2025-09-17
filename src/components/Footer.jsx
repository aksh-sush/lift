"use client";
import React, { useMemo, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Mail,
  Phone,
  MapPin,
  Instagram,
} from "lucide-react";
import { LazyMotion, m, useReducedMotion } from "framer-motion";
import { useRouter } from "next/router";
import { usePathname as useNavPathname } from "next/navigation";
/* Load Framer features once (no re-creation per render) */
const loadFramerFeatures = () =>
  import("framer-motion").then((res) => res.domAnimation);
/* Detect desktop + hover-capable devices */
function useDesktopHoverCapable() {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    const mqDesk = window.matchMedia("(min-width: 1024px)");
    const mqHover = window.matchMedia("(hover: hover)");
    const mqPointer = window.matchMedia("(pointer: fine)");
    const check = () => setOk(mqDesk.matches && mqHover.matches && mqPointer.matches);
    check();
    const add = (mq, fn) => (mq.addEventListener ? mq.addEventListener("change", fn) : mq.addListener(fn));
    const rem = (mq, fn) => (mq.removeEventListener ? mq.removeEventListener("change", fn) : mq.removeListener(fn));
    add(mqDesk, check);
    add(mqHover, check);
    add(mqPointer, check);
    return () => {
      rem(mqDesk, check);
      rem(mqHover, check);
      rem(mqPointer, check);
    };
  }, []);
  return ok;
}
/* ---------- Memoized Atoms ---------- */
const SocialIcon = React.memo(({ Icon, label, href = "#", index, reduced, enableHover }) => {
  const hoverAnim = enableHover && !reduced ? { y: -2 } : undefined;
  const tapAnim = enableHover && !reduced ? { scale: 0.96 } : undefined;
  const isInstagram = typeof label === "string" && label.toLowerCase() === "instagram";
  const ringVariants = {
    rest: { rotate: 0 },
    hovered: { rotate: 360, transition: { duration: 8 + index * 2, repeat: Infinity, ease: "linear" } },
  };
  const haloVariants = {
    rest: { boxShadow: "0 0 0 0 rgba(120,163,35,0.25)" },
    hovered: { boxShadow: "0 0 0 10px rgba(120,163,35,0)" },
  };
  const whileHoverState = enableHover && !reduced ? "hovered" : undefined;
  const parentVariants = { rest: { y: 0 }, hovered: { y: -2 } };
  return (
    <m.a
      href={href}
      aria-label={label}
      className={`relative p-2 rounded-full bg-white/10 ${enableHover ? "lg:hover:bg-white/20" : ""} transition will-change-transform ${isInstagram ? "lg:hover:text-[#78A323]" : ""}`}
      target="_blank"
      rel="noopener noreferrer"
      initial="rest"
      whileHover={whileHoverState}
      whileTap={tapAnim}
      variants={parentVariants}
    >
      {/* Decorative ring + halo only on desktop hover-capable to cut cost on mobile */}
      {enableHover && !reduced && (
        <>
          <m.span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-white/15"
            variants={ringVariants}
            style={{ willChange: "transform" }}
          />
          <m.span
            aria-hidden
            className="absolute inset-0 rounded-full"
            variants={haloVariants}
            transition={{ duration: 0.8 }}
          />
        </>
      )}
      <Icon className="w-4 h-4 relative z-10 transition-colors duration-200" />
    </m.a>
  );
});
SocialIcon.displayName = "SocialIcon";
const FooterLink = React.memo(({ href, label, active, reduced, enableHover }) => {
  const hoverItem = enableHover && !reduced ? { x: 4 } : undefined;
  return (
    <m.li whileHover={hoverItem} className="group will-change-transform">
      <Link
        href={href}
        prefetch={false}
        aria-current={active ? "page" : undefined}
        className={`relative ${active ? "text-[#78A323]" : "lg:hover:text-[#78A323]"}`}
      >
        {label}
        <span
          className={`absolute -bottom-1 left-0 h-px bg-[#78A323] transition-all duration-300 ${
            active ? "w-full" : "w-0 lg:group-hover:w-full"
          }`}
        />
      </Link>
    </m.li>
  );
});
FooterLink.displayName = "FooterLink";
const ContactItem = React.memo(({ icon: Icon, href, children, reduced, enableHover }) => {
  const hoverItem = enableHover && !reduced ? { x: 4 } : undefined;
  return (
    <li className="group">
      <m.a
        href={href}
        whileHover={hoverItem}
        /*
          Use a two-column grid so the icon stays in its own column and
          multi-line text (like the address) wraps cleanly beside it.
        */
        className="relative grid grid-cols-[auto_1fr] items-start gap-2 lg:hover:text-[#78A323] will-change-transform"
      >
        <Icon className="w-4 h-4 mt-0.5 shrink-0" aria-hidden />
        <span className="leading-snug break-words">{children}</span>
        <span className="absolute -bottom-1 left-0 h-px w-0 bg-[#78A323] transition-all duration-300 lg:group-hover:w-full" />
      </m.a>
    </li>
  );
});
ContactItem.displayName = "ContactItem";
const SectionTitle = React.memo(({ href, label, active, delay, reduced, id }) => {
  const isLink = Boolean(href);
  return (
    <h4 className="font-semibold py-2 relative inline-block text-base md:text-[12px] lg:text-base" id={id}>
      {isLink ? (
        <Link
          href={href}
          prefetch={false}
          className={`transition-colors lg:hover:text-[#78A323] text-base md:text-[12px] lg:text-base ${active ? "text-[#78A323]" : ""}`}
        >
          {label}
        </Link>
      ) : (
        <span className="text-base md:text-[12px] lg:text-base">{label}</span>
      )}
      {isLink ? (
        <m.span
          className="block h-[2px] bg-white/25 mt-1"
          initial={reduced ? undefined : { scaleX: 0 }}
          animate={reduced ? undefined : { scaleX: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay }}
          style={{ transformOrigin: "left", willChange: "transform" }}
        />
      ) : (
        <span className="block h-[2px] bg-white/25 mt-1" />
      )}
    </h4>
  );
});
SectionTitle.displayName = "SectionTitle";
/* ---------- Footer ---------- */
export default function Footer() {
  let navPathname;
  try {
    navPathname = useNavPathname();
  } catch {
    navPathname = undefined;
  }
  let pagesRouter;
  try {
    pagesRouter = useRouter();
  } catch {
    pagesRouter = null;
  }
  const pathname = useMemo(() => {
    if (typeof navPathname === "string" && navPathname) return navPathname;
    const asPath = pagesRouter?.asPath;
    if (asPath) return (asPath.split("?")[0] || "/");
    if (typeof window !== "undefined") return window.location?.pathname || "/";
    return "/";
  }, [navPathname, pagesRouter?.asPath]);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const isServer = typeof window === "undefined";
  const reducedHook = useReducedMotion();
  const reduced = isServer ? true : reducedHook;
  const enableMotion = mounted && !reduced;
  const desktopHover = useDesktopHoverCapable(); // ← hover effects only if true
  // normalize path (ignore trailing slashes / case)
  const norm = useCallback((p) => {
    if (!p) return "/";
    const cleaned = p.toString().toLowerCase().replace(/\/+$/, "");
    return cleaned === "" ? "/" : cleaned;
  }, []);
  // Match exact path or subpath (parity with header behavior)
  const isActive = useCallback(
    (href) => {
      const p = norm(pathname);
      const h = norm(href);
      if (h === "/") return p === "/";
      return p === h || p.startsWith(h + "/");
    },
    [pathname, norm]
  );
  const here = norm(pathname);
  const atProducts = useMemo(() => here === "/products" || here.startsWith("/products/"), [here]);
  const atServices = useMemo(() => here === "/services" || here.startsWith("/services/"), [here]);
  const atContact  = useMemo(() => here === "/contactus" || here.startsWith("/contactus/"), [here]);
  // Quick Links (mirror header)
  const headerLinks = useMemo(() => [
    { href: "/", label: "Home" },
    { href: "/customize", label: "Customize" },
    { href: "/projects", label: "Projects" },
    { href: "/aboutus", label: "About Us" },
  ], []);
  // Products (canonical order)
  const productLinks = useMemo(() => [
    { href: "/products/passenger", label: "Passenger Elevator" },
    { href: "/products/hospital", label: "Hospital Elevator" },
    { href: "/products/hydraulic", label: "Hydraulic Elevator" },
    { href: "/products/goods", label: "Goods Elevator" },
    { href: "/products/rauli", label: "Rauli Elevator" },
  ], []);
  const serviceLinks = useMemo(() => [
    { href: "/services#installation", label: "Lift Installation" },
    { href: "/services#quality", label: "Quality Assurance" },
    { href: "/services#maintenance", label: "Lift Maintenance" },
    { href: "/services#amc", label: "AMC Plans" },
  ], []);
  const contactItems = useMemo(() => [
    { icon: Phone, href: "tel:+91 90920 80100", text: "+91 90920 80100" },
    { icon: Mail, href: "mailto:svsunitech@gmail.com", text: "svsunitech@gmail.com" },
    { icon: MapPin, href: "https://www.google.com/maps?q=Chennai,India", text: "No.15, Sarayu Park, New Colony, 2nd Main Road, Chennai – 600044" },
  ], []);
  const INSTAGRAM_URL = process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://www.instagram.com/svs_unitechelevatorscom?igsh=N3Y2cXloMTFmb3M=";
  const socialIcons = useMemo(() => [
    { Icon: Instagram, label: "Instagram", href: INSTAGRAM_URL },
  ], [INSTAGRAM_URL]);
  // Motion variants
  const container = useMemo(() => ({
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.08 },
    },
  }), []);
  const item = useMemo(() => ({
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  }), []);
  return (
    <LazyMotion features={loadFramerFeatures}>
      <footer className="bg-[#0B0833] text-white relative overflow-hidden" role="contentinfo">
        {/* Ambient glows only on lg+ to keep md/mobile light */}
        {enableMotion && (
          <m.div
            aria-hidden
            className="pointer-events-none absolute -top-24 right-1/4 h-72 w-72 rounded-full blur-3xl hidden lg:block"
            style={{ background: "radial-gradient(40% 40% at 50% 50%, rgba(120,163,35,0.10), transparent 70%)" }}
            animate={{ x: [0, 10, -10, 0], y: [0, -6, 6, 0] }}
            transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
        {enableMotion && (
          <m.div
            aria-hidden
            className="pointer-events-none absolute -bottom-28 left-10 h-72 w-72 rounded-full blur-3xl hidden lg:block"
            style={{ background: "radial-gradient(40% 40% at 50% 50%, rgba(255,255,255,0.06), transparent 70%)" }}
            animate={{ x: [0, -8, 8, 0], y: [0, 6, -6, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
        <div className="max-w-7xl mx-auto pt-8 md:pt-10 lg:pt-12 pb-4 md:pb-5 lg:pb-6 px-4">
          <m.div
            variants={container}
            initial={enableMotion ? "hidden" : false}
            whileInView={enableMotion ? "visible" : undefined}
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-2 gap-x-8 gap-y-8 md:grid-cols-3 md:gap-x-10 md:gap-y-10 lg:grid-cols-5"
          >
            {/* Follow Us On */}
            <m.div variants={item} className="col-span-2 md:col-span-1">
              <SectionTitle label="Follow Us On" active={false} delay={0} reduced={!enableMotion} id="follow-us" />
              <div className="mt-3 md:mt-4 flex items-center gap-3 md:gap-4" aria-labelledby="follow-us">
                {socialIcons.map((social, index) => (
                  <SocialIcon
                    key={social.label}
                    Icon={social.Icon}
                    label={social.label}
                    href={social.href}
                    index={index}
                    reduced={reduced}
                    enableHover={desktopHover}
                  />
                ))}
              </div>
            </m.div>
            {/* Quick Links */}
            <m.div variants={item}>
              <SectionTitle label="Quick Links" active={false} delay={0.05} reduced={!enableMotion} id="quick-links" />
              <ul className="mt-3 md:mt-4 space-y-2 md:space-y-1.5 text-white/80 text-sm md:text-[15px]" aria-labelledby="quick-links">
                {headerLinks.map((link) => (
                  <FooterLink
                    key={link.href}
                    href={link.href}
                    label={link.label}
                    active={isActive(link.href)}
                    reduced={reduced}
                    enableHover={desktopHover}
                  />
                ))}
              </ul>
            </m.div>
            {/* Products */}
            <m.div variants={item}>
              <SectionTitle href="/products" label="Products" active={atProducts} delay={0.1} reduced={!enableMotion} id="products" />
              <ul className="mt-3 md:mt-4 space-y-2 md:space-y-1.5 text-white/80 text-sm md:text-[15px]" aria-labelledby="products">
                {productLinks.map((link) => (
                  <FooterLink
                    key={link.label}
                    href={link.href}
                    label={link.label}
                    active={isActive(link.href)}
                    reduced={reduced}
                    enableHover={desktopHover}
                  />
                ))}
              </ul>
            </m.div>
            {/* Services */}
            <m.div variants={item}>
              <SectionTitle href="/services" label="Services" active={atServices} delay={0.15} reduced={!enableMotion} id="services" />
              <ul className="mt-3 md:mt-4 space-y-2 md:space-y-1.5 text-white/80 text-sm md:text-[15px]" aria-labelledby="services">
                {serviceLinks.map((link) => (
                  <FooterLink
                    key={link.href}
                    href={link.href}
                    label={link.label}
                    active={false}
                    reduced={reduced}
                    enableHover={desktopHover}
                  />
                ))}
              </ul>
            </m.div>
            {/* Contact Us */}
            <m.div variants={item}>
              <SectionTitle href="/contactus" label="Contact Us" active={atContact} delay={0.2} reduced={!enableMotion} id="contact-us" />
              <ul className="mt-3 md:mt-4 space-y-3 text-white/80 text-sm md:text-[15px]" aria-labelledby="contact-us">
                  {contactItems.map((item, index) => (
                    <ContactItem
                      key={index}
                      icon={item.icon}
                      href={item.href}
                      reduced={reduced}
                      enableHover={desktopHover}
                    >
                      {item.text}
                    </ContactItem>
                  ))}
              </ul>
            </m.div>
          </m.div>
          {/* Divider & bottom line */}
          <div className="mt-8 md:mt-10">
            {/* Gradient divider (matches Services page style, in #78A323) */}
            <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#78A323] to-transparent opacity-80"></div>
            <m.div
              className="pt-5 md:pt-6 flex flex-col md:flex-row items-center justify-center gap-2 md:gap-3 text-sm md:text-base text-white/70 px-2 text-center"
              initial={enableMotion ? { opacity: 0, y: 6 } : false}
              whileInView={enableMotion ? { opacity: 1, y: 0 } : undefined}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <p>
                <span className="whitespace-nowrap md:whitespace-normal">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-[#78A323]">2025</span> ©{" "}
                  <span className="text-[#78A323]">SVS Unitech </span>
                  <span className="text-red-600">Elevators</span>
                  . All rights reserved |
                </span>
                <span className="block md:inline whitespace-nowrap"> {" "}Crafted by {" "}
                  <span className="text-[#78A323]">Nexatrix</span>
                </span>
              </p>
            </m.div>
          </div>
        </div>
      </footer>
    </LazyMotion>
  );
}
