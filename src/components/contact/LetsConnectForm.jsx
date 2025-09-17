// src/components/contact/LetsConnectForm.jsx
"use client";

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
  memo,
} from "react";
import dynamic from "next/dynamic";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  motion,
  AnimatePresence,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";

import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea-glow";

/* ============================ API base & helpers ============================ */
// Where your Express server is hosted (Railway URL in prod; same-origin in dev if proxied)
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "";

const joinUrl = (base, path) =>
  `${(base || "").replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;

// CSRF token fetcher (double submit cookie)
let __csrfToken = null;
async function getCsrfToken() {
  if (typeof window === "undefined") return "";
  if (__csrfToken) return __csrfToken;
  try {
    const res = await fetch(joinUrl(API_BASE, "/csrf"), {
      method: "GET",
      credentials: "same-origin",
      headers: { Accept: "application/json" },
    });
    const body = await res.json().catch(() => ({}));
    __csrfToken = body?.token || "";
  } catch {
    __csrfToken = "";
  }
  return __csrfToken;
}

/* Defer heavy visual wrappers to a separate chunk (faster first paint) */
const AuroraBackground = dynamic(
  () => import("../ui/aurora-background").then((m) => m.AuroraBackground),
  { ssr: false }
);
const ShineBorder = dynamic(
  () => import("../ui/shine-border").then((m) => m.ShineBorder),
  { ssr: false }
);

// Lazy success modal (split out to reduce initial form JS)
const SuccessModal = dynamic(
  () => import("./SuccessModal").then((m) => m.SuccessModal),
  { ssr: false }
);

/* --------------------------------- config --------------------------------- */
const ACCENT = "#7BBF31";
const DISPOSABLE_RE =
  /(tempmail|10min|mailinator|yopmail|guerrillamail|getnada|trashmail|maildrop|sharklasers|dispostable|fakeinbox)/i;
const onlyDigits = (v) => (v || "").replace(/\D/g, "");

/* ------------------------------- Zod schema ------------------------------- */
const FormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter your full name.")
    .max(60, "Name is too long.")
    .regex(/^[a-zA-Z][a-zA-Z\s.'-]+$/, "Use letters, spaces and . ' - only.")
    .refine((v) => !/(.)\1{4,}/.test(v), {
      message: "Looks like repeated characters.",
    }),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email address.")
    .refine((v) => !DISPOSABLE_RE.test(v), {
      message: "Please use a permanent email (not disposable).",
    }),

  phone: z
    .string()
    .trim()
    .transform(onlyDigits)
    .refine((digits) => digits.length === 12 && digits.startsWith("91"), {
      message: "Enter a valid Indian phone: +91 and 10 digits.",
    }),

  type: z.enum(["residential", "commercial"], {
    required_error: "Please choose a property type.",
  }),

  requirements: z.string().trim().min(1, "Please enter your requirements."),

  // Honeypot (must stay empty)
  company: z.string().max(0, "Bot detected."),
});

/* ---------------------------- helpers / constants -------------------------- */
const PREFIX_DISPLAY = "+91 ";
const PREFIX_DIGITS = "91";
const PREFIX_LEN = PREFIX_DISPLAY.length;

const labelCls =
  "block text-[15px] font-extrabold text-black pl-[2px] leading-tight";

function formatPhoneDisplay(v) {
  const digits = onlyDigits(v);
  if (!digits) return "";
  let rest = digits;
  if (rest.startsWith(PREFIX_DIGITS)) rest = rest.slice(PREFIX_DIGITS.length);
  rest = rest.slice(0, 10);
  return `${PREFIX_DISPLAY}${rest}`.trimEnd();
}

/* ------------------------------ media helpers ----------------------------- */
function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = (e) => setMatches(e.matches);
    setMatches(mql.matches);
    mql.addEventListener?.("change", onChange);
    return () => mql.removeEventListener?.("change", onChange);
  }, [query]);
  return matches;
}

/* ---------------- header-style dropdown with the same green glow ----------- */
const OPTIONS = [
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
];

const PropertyTypeSelect = memo(function PropertyTypeSelect({
  value,
  onChange,
  invalid,
  name,
  onBlur,
}) {
  const [open, setOpen] = useState(false);
  const [focusIndex, setFocusIndex] = useState(0);
  const wrapperRef = useRef(null);
  const btnRef = useRef(null);

  const selected = useMemo(
    () => OPTIONS.find((o) => o.value === value) ?? OPTIONS[0],
    [value]
  );

  /* Close on outside click / Escape */
  useEffect(() => {
    const onDocClick = (e) => {
      if (!wrapperRef.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const handleKey = useCallback(
    (e) => {
      if (!open && (e.key === "Enter" || e.key === " " || e.key === "ArrowDown")) {
        e.preventDefault();
        setOpen(true);
        setFocusIndex(Math.max(0, OPTIONS.findIndex((o) => o.value === value)));
        return;
      }
      if (!open) return;
      if (e.key === "Escape") setOpen(false);
      else if (e.key === "ArrowDown")
        setFocusIndex((i) => (i + 1) % OPTIONS.length);
      else if (e.key === "ArrowUp")
        setFocusIndex((i) => (i - 1 + OPTIONS.length) % OPTIONS.length);
      else if (e.key === "Enter") {
        const opt = OPTIONS[focusIndex];
        if (opt) {
          onChange(opt.value);
          setOpen(false);
          btnRef.current?.focus();
        }
      }
    },
    [open, value, focusIndex, onChange]
  );

  /* Hover glow effect — disable for touch devices or reduced motion */
  const prefersReducedMotion = useReducedMotion();
  const canHover = useMediaQuery("(hover: hover) and (pointer: fine)");
  const enableGlow = canHover && !prefersReducedMotion;

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [visible, setVisible] = useState(false);
  const background = useMotionTemplate`
    radial-gradient(
      ${visible ? "120px" : "0px"} circle at ${mouseX}px ${mouseY}px,
      ${ACCENT},
      transparent 80%
    )
  `;

  // rAF throttle for pointer move
  const rAF = useRef(0);
  const onMove = useCallback(
    (e) => {
      if (!enableGlow) return;
      if (rAF.current) return;
      // Capture values synchronously to avoid nulls during rAF
      const el = e.currentTarget;
      const { clientX, clientY } = e;
      if (!el || typeof el.getBoundingClientRect !== "function") return;
      rAF.current = requestAnimationFrame(() => {
        rAF.current = 0;
        // Element may unmount between frames; guard accordingly
        if (!el || !el.isConnected || typeof el.getBoundingClientRect !== "function") return;
        const r = el.getBoundingClientRect();
        mouseX.set(clientX - r.left);
        mouseY.set(clientY - r.top);
      });
    },
    [enableGlow, mouseX, mouseY]
  );

  useEffect(() => () => rAF.current && cancelAnimationFrame(rAF.current), []);

  return (
    <div className="relative" ref={wrapperRef}>
      <motion.div
        onMouseMove={onMove}
        onMouseEnter={() => enableGlow && setVisible(true)}
        onMouseLeave={() => enableGlow && setVisible(false)}
        style={enableGlow ? { background } : undefined}
        className="rounded-xl p-[2px] transition duration-300"
      >
        <button
          ref={btnRef}
          type="button"
          name={name}
          onBlur={onBlur}
          onClick={() => setOpen((v) => !v)}
          onKeyDown={handleKey}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-invalid={invalid || undefined}
          className={[
            "flex h-11 w-full items-center justify-between rounded-xl bg-white",
            "px-3 py-2 text-left text-sm text-[#0B0833]",
            "border shadow-sm outline-none transition will-change-transform",
            invalid
              ? "border-red-500 focus:ring-2 focus:ring-red-500"
              : "border-black/10 focus:ring-2 focus:ring-[#7BBF31] focus:border-[#7BBF31]",
          ].join(" ")}
        >
          <span>{selected.label}</span>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            className={`ml-2 transition-transform ${open ? "rotate-180" : ""}`}
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M6 9l6 6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </motion.div>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 220, damping: 20 }}
            className="absolute left-0 right-0 z-50 mt-1 overflow-hidden rounded-xl bg-white border border-black/10 shadow-xl will-change-transform"
          >
            {OPTIONS.map((opt) => (
              <li key={opt.value} role="option" aria-selected={value === opt.value}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                    btnRef.current?.focus();
                  }}
                  className={[
                    "w-full text-left px-3 py-2.5 text-sm transition-colors",
                    value === opt.value
                      ? "text-[#7BBF31] font-semibold"
                      : "text-[#0B0833] hover:text-[#7BBF31]",
                  ].join(" ")}
                >
                  {opt.label}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
});

/* ---------------------------------- FORM ---------------------------------- */
export default function LetsConnectForm({ containerClassName }) {
  // Success modal visibility
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting, isValid },
    setValue,
    reset,
  } = useForm({
    resolver: zodResolver(FormSchema),
    mode: "onChange",
    reValidateMode: "onBlur",
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      type: "residential",
      requirements: "",
      company: "",
    },
    shouldFocusError: true,
  });

  const phoneInputRef = useRef(null);
  const clampCaret = useCallback(() => {
    const el = phoneInputRef.current;
    if (!el) return;
    const start = Math.max(PREFIX_LEN, el.selectionStart ?? 0);
    const end = Math.max(PREFIX_LEN, el.selectionEnd ?? 0);
    if (start !== el.selectionStart || end !== el.selectionEnd) {
      el.setSelectionRange(start, end);
    }
  }, []);

  const [status, setStatus] = useState({ type: null, msg: "" }); // 'ok' | 'err' | null

  const onSubmit = useCallback(
    async (data) => {
      if (data.company) return; // honeypot

      setStatus({ type: null, msg: "" });

      // Ensure +91 international format for server validator
      const digits = onlyDigits(data.phone);
      const phoneIntl = digits.startsWith("91") ? `+${digits}` : `+91${digits}`;

      // Server expects { name, email, phone, message }
      const payload = {
        name: data.name,
        email: data.email,
        phone: phoneIntl,
        message: [
          `Property type: ${data.type}`,
          `Requirements: ${data.requirements}`,
        ].join("\n"),
      };

      try {
        const csrf = await getCsrfToken();
        const res = await fetch(joinUrl(API_BASE, "/send-email"), {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json", "X-CSRF-Token": csrf },
          body: JSON.stringify(payload),
        });

        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
          const msg =
            body?.error ||
            (Array.isArray(body?.errors) &&
              body.errors.map((e) => e.msg).join(", ")) ||
            body?.message ||
            "Failed to send. Please try again.";
          throw new Error(msg);
        }

        setStatus({ type: "ok", msg: "Thank you! for reaching out. We will get back to you at the earliest convenience." });
        setShowSuccessModal(true);
        reset({
          name: "",
          email: "",
          phone: "",
          type: "residential",
          requirements: "",
          company: "",
        });
      } catch (err) {
        setStatus({
          type: "err",
          msg: err?.message || "Something went wrong. Please try again.",
        });
      }
    },
    [reset]
  );

  const prefersReducedMotion = useReducedMotion();
  const isTouch = useMediaQuery("(pointer: coarse)");
  const outerBorderEnabled = !prefersReducedMotion && !isTouch;

  // Modal animation variants (match page.client.jsx)
  const isMdOrBelow = useMediaQuery("(max-width: 768px)");
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const overlayVariants = useMemo(
    () => ({
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          duration: prefersReducedMotion ? 0 : (isMdOrBelow ? 0.18 : 0.28),
          ease: [0.22, 1, 0.36, 1],
        },
      },
      exit: {
        opacity: 0,
        transition: {
          duration: prefersReducedMotion ? 0 : (isMdOrBelow ? 0.16 : 0.24),
          ease: [0.22, 1, 0.36, 1],
        },
      },
    }),
    [prefersReducedMotion, isMdOrBelow]
  );
  const modalVariants = useMemo(
    () => ({
      hidden: {
        opacity: 0,
        y: isMdOrBelow ? 12 : 20,
        scale: prefersReducedMotion ? 1 : isMdOrBelow ? 1 : 0.98,
      },
      visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
          duration: prefersReducedMotion ? 0 : (isMdOrBelow ? 0.22 : 0.34),
          ease: [0.22, 1, 0.36, 1],
        },
      },
      exit: {
        opacity: 0,
        y: isMdOrBelow ? 12 : 12,
        scale: prefersReducedMotion ? 1 : isMdOrBelow ? 1 : 0.98,
        transition: {
          duration: prefersReducedMotion ? 0 : (isMdOrBelow ? 0.2 : 0.3),
          ease: [0.22, 1, 0.36, 1],
        },
      },
    }),
    [prefersReducedMotion, isMdOrBelow]
  );

  // Close handlers for modal
  const handleCloseSuccessModal = useCallback(() => setShowSuccessModal(false), []);
  useEffect(() => {
    if (!showSuccessModal) return;
    const onKey = (e) => {
      if (e.key === "Escape") setShowSuccessModal(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showSuccessModal]);

  // Prefetch CSRF token on mount (reduce first-submit latency)
  useEffect(() => {
    getCsrfToken().catch(() => {});
  }, []);

  // Lock background scroll when success modal is open
  const lockScrollYRef = useRef(0);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (showSuccessModal) {
      lockScrollYRef.current =
        window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      document.body.style.position = "fixed";
      document.body.style.top = `-${lockScrollYRef.current}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      const y = lockScrollYRef.current || 0;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      if (y) window.scrollTo(0, y);
    }
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [showSuccessModal]);

  return (
    <div className="relative rounded-3xl">
      {/* Decorative shine only when it won't hurt performance */}
      {outerBorderEnabled && (
        <ShineBorder
          borderWidth={2}
          duration={14}
          shineColor={[
            "var(--brand-deep-blue, #080331)",
            "var(--brand-green, #78A323)",
          ]}
        />
      )}

      <AuroraBackground
        className={[
          "w-full mx-auto rounded-3xl border shadow-xl p-6 md:p-8 overflow-hidden will-change-transform",
          containerClassName || "max-w-3xl",
        ].join(" ")}
        showRadialMask={!prefersReducedMotion}
        style={{ borderColor: "rgba(0,0,0,0.08)" }}
      >
        <form
          noValidate
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
          autoComplete="on"
        >
          {/* Honeypot (hidden) */}
          <input
            type="text"
            autoComplete="off"
            tabIndex={-1}
            className="hidden"
            {...register("company")}
          />

          {/* Row 1 */}
          <div className="grid md:grid-cols-2 gap-6 items-start">
            <div className="space-y-1.5">
              <Label htmlFor="name" className={labelCls}>
                Name *
              </Label>
              <Input
                id="name"
                placeholder="Your full name"
                autoComplete="name"
                autoCapitalize="words"
                aria-invalid={!!errors.name || undefined}
                aria-describedby={errors.name ? "name-err" : undefined}
                className={
                  errors.name
                    ? "focus-visible:ring-red-500"
                    : "focus-visible:ring-[#7BBF31]"
                }
                {...register("name")}
              />
              {errors.name && (
                <p id="name-err" role="status" className="text-red-600 text-xs mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className={labelCls}>
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                inputMode="email"
                aria-invalid={!!errors.email || undefined}
                aria-describedby={errors.email ? "email-err" : undefined}
                className={
                  errors.email
                    ? "focus-visible:ring-red-500"
                    : "focus-visible:ring-[#7BBF31]"
                }
                {...register("email")}
              />
              {errors.email && (
                <p id="email-err" role="status" className="text-red-600 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid md:grid-cols-2 gap-6 items-start">
            <div className="space-y-1.5">
              <Label htmlFor="phone" className={labelCls}>
                Phone Number (India) *
              </Label>

              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <Input
                    ref={phoneInputRef}
                    id="phone"
                    inputMode="tel"
                    pattern="[0-9+\s]*"
                    placeholder="+91 XXXXX XXXXX"
                    autoComplete="tel"
                    aria-invalid={!!errors.phone || undefined}
                    aria-describedby={errors.phone ? "phone-err" : undefined}
                    className={
                      errors.phone
                        ? "focus-visible:ring-red-500"
                        : "focus-visible:ring-[#7BBF31]"
                    }
                    value={formatPhoneDisplay(field.value)}
                    onFocus={() => {
                      if (!field.value) {
                        setValue("phone", PREFIX_DIGITS, {
                          shouldValidate: false,
                          shouldTouch: true,
                        });
                      }
                      requestAnimationFrame(clampCaret);
                    }}
                    onMouseUp={() => requestAnimationFrame(clampCaret)}
                    onClick={() => requestAnimationFrame(clampCaret)}
                    onKeyDown={(e) => {
                      const el = phoneInputRef.current;
                      if (!el) return;
                      const pos = el.selectionStart ?? 0;
                      if (
                        (e.key === "Backspace" && pos <= PREFIX_LEN) ||
                        (e.key === "Delete" && pos < PREFIX_LEN)
                      ) {
                        e.preventDefault();
                        requestAnimationFrame(clampCaret);
                      }
                      if (e.key === "ArrowLeft" && pos <= PREFIX_LEN) {
                        e.preventDefault();
                        requestAnimationFrame(clampCaret);
                      }
                      if (e.key === "Home") {
                        e.preventDefault();
                        requestAnimationFrame(clampCaret);
                      }
                    }}
                    onBlur={() => {
                      const digits = onlyDigits(field.value);
                      if (digits === PREFIX_DIGITS) {
                        setValue("phone", "", { shouldValidate: false });
                      }
                    }}
                    onChange={(e) => {
                      let digits = onlyDigits(e.target.value);
                      if (digits && !digits.startsWith(PREFIX_DIGITS))
                        digits = PREFIX_DIGITS + digits;
                      digits = digits.slice(0, 12); // 91 + 10 digits
                      setValue("phone", digits, { shouldValidate: true });
                      requestAnimationFrame(clampCaret);
                    }}
                  />
                )}
              />
              {errors.phone && (
                <p id="phone-err" role="status" className="text-red-600 text-xs mt-1">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className={labelCls}>Property Type *</Label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <PropertyTypeSelect
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    invalid={!!errors.type}
                  />
                )}
              />
              {errors.type && (
                <p role="status" className="text-red-600 text-xs mt-1">
                  {errors.type.message}
                </p>
              )}
            </div>
          </div>

          {/* Requirements */}
          <div className="space-y-1.5">
            <Label htmlFor="requirements" className={labelCls}>
              Your Requirements *
            </Label>
            <Textarea
              id="requirements"
              rows={6}
              placeholder="Tell us about the building, capacity, floors, timelines, and any questions…"
              aria-invalid={!!errors.requirements || undefined}
              aria-describedby={errors.requirements ? "req-err" : undefined}
              borderWidth={1}
              className={
                errors.requirements
                  ? "focus-visible:ring-red-500"
                  : "focus-visible:ring-[#7BBF31]"
              }
              {...register("requirements")}
            />
            {errors.requirements && (
              <p id="req-err" role="status" className="text-red-600 text-xs mt-1">
                {errors.requirements.message}
              </p>
            )}
          </div>

          {/* Status — show inline only for errors; success uses a popup */}
          {status.type === "err" && (
            <p role="status" className="text-sm text-red-600">{status.msg}</p>
          )}

          {/* Submit */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting || !isValid}
              className={[
                "w-full rounded-2xl bg-[#0A0833] text-white font-extrabold uppercase tracking-wide py-4 px-8",
                "transition-colors will-change-transform",
                isSubmitting || !isValid
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:bg-[#09112A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7BBF31]",
              ].join(" ")}
            >
              {isSubmitting ? "Sending…" : "Send Message"}
            </button>
          </div>
        </form>
      </AuroraBackground>
      {/* Success Modal (lazy) */}
      <SuccessModal open={showSuccessModal} onClose={handleCloseSuccessModal} />
    </div>
  );
}
