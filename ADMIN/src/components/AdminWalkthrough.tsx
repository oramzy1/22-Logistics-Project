import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import {
  LayoutDashboard,
  CalendarCheck,
  Truck,
  MapPin,
  Users,
  CreditCard,
  HeadphonesIcon,
  Settings,
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
  BookOpen,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface WalkthroughStep {
  id: string;
  title: string;
  description: string;
  detail: string;
  icon: React.ReactNode;
  selector?: string; // CSS selector for the element to highlight
  position: "center" | "sidebar" | "top-right" | "bottom-center";
  badge?: string;
  features?: string[];
  color: string; // accent color for this step
}

interface AdminWalkthroughProps {
  /** Called when the user dismisses or completes the tour */
  onComplete?: () => void;
  /** Storage key for persisting completion state */
  storageKey?: string;
}

// ─── Step Definitions ────────────────────────────────────────────────────────

const STEPS: WalkthroughStep[] = [
  {
    id: "welcome",
    title: "Welcome to 22-Logistics",
    description: "Your command center for managing the entire logistics operation.",
    detail:
      "This quick tour walks you through every section of the admin panel — from real-time trip tracking to revenue analytics. It only takes 2 minutes.",
    icon: <Sparkles size={28} />,
    position: "center",
    badge: "Admin Panel",
    features: [
      "Monitor bookings, drivers & revenue in one place",
      "Real-time socket-powered updates across all pages",
      "Export any dataset to CSV or PDF instantly",
    ],
    color: "#E4A830",
  },
  {
    id: "dashboard",
    title: "Dashboard",
    description: "Your high-level overview of platform health at a glance.",
    detail:
      "The Dashboard surfaces total bookings, active drivers, revenue, and registered users with live hints showing change from yesterday or last month. Switch between 7D / 1M / 6M / 1Y and filter by ride type (All, Business, Individual) to slice the Revenue and Bookings charts dynamically. The Ride Overview donut breaks down scheduled vs completed trips.",
    icon: <LayoutDashboard size={28} />,
    selector: '[href="/"], [href="#/"]',
    position: "sidebar",
    badge: "Overview",
    features: [
      "Live stat cards with period-over-period hints",
      "Interactive revenue area chart & bookings bar chart",
      "Ride breakdown donut with real API data",
      "Recent transactions table linked to /bookings",
    ],
    color: "#E4A830",
  },
  {
    id: "bookings",
    title: "Booking Management",
    description: "Full lifecycle visibility over every booking on the platform.",
    detail:
      "Browse, search, and filter all bookings by status, ride type, date range, or free-text (booking ID or customer name). Cancel any active booking directly from the action menu. Click 'View Details' to open a rich side-sheet with pickup/drop-off, driver assignment, payment status, and timeline. Export the current view as CSV or PDF with one click.",
    icon: <CalendarCheck size={28} />,
    selector: 'a[href="/bookings"]',
    position: "sidebar",
    badge: "Operations",
    features: [
      "Search by Booking ID or Customer Name",
      "Date-range filter + ride type + status filters",
      "Cancel bookings with reason from the action menu",
      "Export CSV / PDF of filtered results",
    ],
    color: "#3B82F6",
  },
  {
    id: "drivers",
    title: "Drivers Management",
    description: "Onboard, verify, and monitor every driver on the fleet.",
    detail:
      "See all drivers with their online status, rating, total trips, and license status. Click the eye icon to open a full detail sheet — view vehicle info, license image, and approve or reject a pending license. Deactivate or permanently delete a driver account. If a driver is online and available, assign them to an awaiting ride directly from the sheet.",
    icon: <Truck size={28} />,
    selector: 'a[href="/drivers"]',
    position: "sidebar",
    badge: "Fleet",
    features: [
      "Approve / Reject driver licenses with one click",
      "Assign available drivers to awaiting rides",
      "Filter by license status or online/offline state",
      "Deactivate or delete driver accounts",
    ],
    color: "#10B981",
  },
  {
    id: "live-trips",
    title: "Live Trips & Tracking",
    description: "Real-time visibility into every active and accepted trip.",
    detail:
      "All ACCEPTED and IN_PROGRESS bookings appear here, auto-refreshing every 30 seconds. Select any trip to see a live OpenStreetMap embed with pickup and drop-off markers geocoded from the address strings. Four info tabs give you Trip Info, Driver Info (with click-to-call), Customer Info, and an Activity Timeline stepper showing where the trip is in its lifecycle.",
    icon: <MapPin size={28} />,
    selector: 'a[href="/live-trips"]',
    position: "sidebar",
    badge: "Real-time",
    features: [
      "OpenStreetMap embed auto-geocodes addresses",
      "Auto-refreshes every 30 seconds",
      "Click-to-call driver or customer from the detail panel",
      "Activity Timeline stepper (Accepted → En Route → Completed)",
    ],
    color: "#F97316",
  },
  {
    id: "users",
    title: "Users Management",
    description: "Manage Business and Individual user accounts separately.",
    detail:
      "Toggling the Business / Individual tab scopes the entire table to that role. Search, filter by status or date range, and act on any user — view their full detail sheet (bookings history, profile, documents), upgrade them to Admin, deactivate, or delete their account. The export button downloads the current filtered list as CSV.",
    icon: <Users size={28} />,
    selector: 'a[href="/users"]',
    position: "sidebar",
    badge: "Accounts",
    features: [
      "Business and Individual tabs with independent filters",
      "Promote any user to Admin role",
      "View full booking history per user",
      "Deactivate / reactivate / delete accounts",
    ],
    color: "#8B5CF6",
  },
  {
    id: "payment",
    title: "Payments & Billing",
    description: "Track all revenue streams — daily, monthly, and all-time.",
    detail:
      "Three revenue cards at the top show Today's Revenue, This Month, and This Year, pulled live from the API. Below, Business vs Individual payment breakdowns show total amounts and transaction counts. The transaction table is the full booking ledger filterable by customer, date, payment status, and ride type.",
    icon: <CreditCard size={28} />,
    selector: 'a[href="/payment"]',
    position: "sidebar",
    badge: "Finance",
    features: [
      "Live revenue cards: today / month / year",
      "Business vs Individual split with transaction counts",
      "Filter transactions by status, date range & type",
      "Export full ledger to CSV",
    ],
    color: "#059669",
  },
  {
    id: "support",
    title: "Support",
    description: "A full helpdesk built into the admin panel.",
    detail:
      "Support tickets created by users appear here in real time via WebSocket. Select a ticket to open a live chat panel — messages sync instantly with the user's app. Change ticket status (Open → In Progress → Resolved → Closed) and priority (Low / Medium / High) from the header dropdowns. Stats at the top track open tickets, in-progress, resolved today, and average response time.",
    icon: <HeadphonesIcon size={28} />,
    selector: 'a[href="/support"]',
    position: "sidebar",
    badge: "Helpdesk",
    features: [
      "Real-time messaging via WebSocket",
      "Filter by status, category (Payment/Driver/Trip/Account)",
      "Set ticket priority and status from the chat header",
      "Avg response time stat updates automatically",
    ],
    color: "#EC4899",
  },
  {
    id: "settings",
    title: "Settings",
    description: "Configure pricing, notifications, and security preferences.",
    detail:
      "The Trip & Pricing section lets you set rates for 3h, 6h, 10h, Airport, Multi-day, and all extension tiers — changes save to the database via the Save Changes button. Notification toggles control which alert types appear in the admin panel (stored in localStorage). The Security section exposes session timeout and 2FA options.",
    icon: <Settings size={28} />,
    selector: 'a[href="/settings"]',
    position: "sidebar",
    badge: "Config",
    features: [
      "Set all trip pricing tiers from the UI",
      "Toggle notification types per-admin",
      "Configure session timeout (30min / 1h / 8h)",
      "Enable 2FA for admin accounts",
    ],
    color: "#64748B",
  },
  {
    id: "complete",
    title: "You're all set!",
    description: "You now know everything the 22-Logistics admin panel has to offer.",
    detail:
      "This tour is saved — it won't show again automatically. You can replay it anytime from the Settings page or the help menu. If you need assistance, the Support section is always available to escalate issues to the platform team.",
    icon: <CheckCircle2 size={28} />,
    position: "center",
    badge: "Complete",
    features: [
      "Replay this tour anytime from Settings",
      "Use the Support tab to reach the platform team",
      "All data updates in real time — no manual refresh needed",
    ],
    color: "#10B981",
  },
];

// ─── Spotlight Overlay ────────────────────────────────────────────────────────

function SpotlightOverlay({
  targetRect,
  color,
}: {
  targetRect: DOMRect | null;
  color: string;
}) {
  const PAD = 8;

  if (!targetRect) {
    return (
      <div
        className="wt-overlay"
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.72)",
          zIndex: 9998,
          pointerEvents: "none",
          backdropFilter: "blur(1px)",
          transition: "all 0.4s cubic-bezier(0.4,0,0.2,1)",
        }}
      />
    );
  }

  const { top, left, width, height } = targetRect;
  const sTop = top - PAD;
  const sLeft = left - PAD;
  const sWidth = width + PAD * 2;
  const sHeight = height + PAD * 2;

  return (
    <>
      {/* dark quadrants */}
      <div style={{ position: "fixed", inset: 0, zIndex: 9998, pointerEvents: "none" }}>
        {/* top */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: sTop, background: "rgba(0,0,0,0.72)", backdropFilter: "blur(1px)" }} />
        {/* bottom */}
        <div style={{ position: "absolute", top: sTop + sHeight, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.72)", backdropFilter: "blur(1px)" }} />
        {/* left */}
        <div style={{ position: "absolute", top: sTop, left: 0, width: sLeft, height: sHeight, background: "rgba(0,0,0,0.72)", backdropFilter: "blur(1px)" }} />
        {/* right */}
        <div style={{ position: "absolute", top: sTop, left: sLeft + sWidth, right: 0, height: sHeight, background: "rgba(0,0,0,0.72)", backdropFilter: "blur(1px)" }} />
        {/* glow ring */}
        <div
          style={{
            position: "absolute",
            top: sTop - 2,
            left: sLeft - 2,
            width: sWidth + 4,
            height: sHeight + 4,
            borderRadius: 10,
            boxShadow: `0 0 0 2px ${color}, 0 0 32px ${color}55`,
            transition: "all 0.4s cubic-bezier(0.4,0,0.2,1)",
          }}
        />
      </div>
    </>
  );
}

// ─── Progress Dots ────────────────────────────────────────────────────────────

function ProgressDots({
  total,
  current,
  color,
}: {
  total: number;
  current: number;
  color: string;
}) {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            width: i === current ? 20 : 6,
            height: 6,
            borderRadius: 3,
            background: i === current ? color : "rgba(255,255,255,0.2)",
            transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
          }}
        />
      ))}
    </div>
  );
}

// ─── Main Card ────────────────────────────────────────────────────────────────

function WalkthroughCard({
  step,
  stepIndex,
  totalSteps,
  onNext,
  onPrev,
  onSkip,
  targetRect,
}: {
  step: WalkthroughStep;
  stepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  targetRect: DOMRect | null;
}) {
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === totalSteps - 1;
  const isCentered = step.position === "center";

  // Position card relative to spotlight or center
  const cardStyle: React.CSSProperties = (() => {
    if (isCentered || !targetRect) {
      return {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 480,
        maxWidth: "calc(100vw - 48px)",
      };
    }

    // Sidebar items — place card to the right of sidebar (sidebar is 240px wide)
    const SIDEBAR_W = 240;
    return {
      position: "fixed",
      top: Math.max(80, Math.min(targetRect.top - 20, window.innerHeight - 520)),
      left: SIDEBAR_W + 24,
      width: 440,
      maxWidth: `calc(100vw - ${SIDEBAR_W + 48}px)`,
    };
  })();

  return (
    <div
      style={{
        ...cardStyle,
        zIndex: 9999,
        background: "linear-gradient(145deg, #1a1f2e 0%, #13171f 100%)",
        border: `1px solid ${step.color}33`,
        borderRadius: 20,
        boxShadow: `0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px ${step.color}22, inset 0 1px 0 rgba(255,255,255,0.05)`,
        overflow: "hidden",
        animation: "wt-slide-in 0.35s cubic-bezier(0.34,1.56,0.64,1) both",
      }}
    >
      {/* Colored top accent */}
      <div
        style={{
          height: 3,
          background: `linear-gradient(90deg, ${step.color}, ${step.color}88)`,
        }}
      />

      <div style={{ padding: "28px 28px 24px" }}>
        {/* Header row */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* Icon bubble */}
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: `${step.color}18`,
                border: `1px solid ${step.color}44`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: step.color,
                flexShrink: 0,
              }}
            >
              {step.icon}
            </div>
            <div>
              {step.badge && (
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    background: `${step.color}18`,
                    border: `1px solid ${step.color}44`,
                    borderRadius: 20,
                    padding: "2px 10px",
                    fontSize: 11,
                    fontWeight: 600,
                    color: step.color,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    marginBottom: 6,
                  }}
                >
                  {step.badge}
                </div>
              )}
              <h2
                style={{
                  margin: 0,
                  fontSize: 20,
                  fontWeight: 700,
                  color: "#f1f5f9",
                  lineHeight: 1.2,
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                }}
              >
                {step.title}
              </h2>
            </div>
          </div>

          {/* Skip */}
          {!isLast && (
            <button
              onClick={onSkip}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "rgba(255,255,255,0.3)",
                padding: 6,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                transition: "color 0.2s",
                flexShrink: 0,
              }}
              title="Skip tour"
              onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "rgba(255,255,255,0.7)")}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "rgba(255,255,255,0.3)")}
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Description */}
        <p
          style={{
            margin: "0 0 8px",
            fontSize: 14,
            fontWeight: 600,
            color: "rgba(255,255,255,0.85)",
            lineHeight: 1.5,
            fontFamily: "'DM Sans', system-ui, sans-serif",
          }}
        >
          {step.description}
        </p>

        {/* Detail text */}
        <p
          style={{
            margin: "0 0 20px",
            fontSize: 13,
            color: "rgba(255,255,255,0.5)",
            lineHeight: 1.65,
            fontFamily: "'DM Sans', system-ui, sans-serif",
          }}
        >
          {step.detail}
        </p>

        {/* Feature chips */}
        {step.features && step.features.length > 0 && (
          <div
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12,
              padding: "14px 16px",
              marginBottom: 24,
            }}
          >
            {step.features.map((f, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  padding: "5px 0",
                  borderBottom: i < step.features!.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                }}
              >
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: step.color,
                    marginTop: 6,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: 12.5,
                    color: "rgba(255,255,255,0.6)",
                    lineHeight: 1.5,
                    fontFamily: "'DM Sans', system-ui, sans-serif",
                  }}
                >
                  {f}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <ProgressDots total={totalSteps} current={stepIndex} color={step.color} />

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {!isFirst && (
              <button
                onClick={onPrev}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "9px 16px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.05)",
                  color: "rgba(255,255,255,0.6)",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)";
                  (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.9)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
                  (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.6)";
                }}
              >
                <ChevronLeft size={15} />
                Back
              </button>
            )}

            <button
              onClick={onNext}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "9px 22px",
                borderRadius: 10,
                border: "none",
                background: step.color,
                color: stepIndex === 0 ? "#1a1000" : "#fff",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "'DM Sans', system-ui, sans-serif",
                boxShadow: `0 4px 16px ${step.color}44`,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
                (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px ${step.color}55`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 16px ${step.color}44`;
              }}
            >
              {isFirst ? (
                <>
                  <BookOpen size={15} />
                  Start Tour
                  <ArrowRight size={15} />
                </>
              ) : isLast ? (
                <>
                  <CheckCircle2 size={15} />
                  Done
                </>
              ) : (
                <>
                  Next
                  <ChevronRight size={15} />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Step counter */}
        <div
          style={{
            textAlign: "center",
            marginTop: 14,
            fontSize: 11,
            color: "rgba(255,255,255,0.22)",
            fontFamily: "'DM Sans', system-ui, sans-serif",
            letterSpacing: "0.04em",
          }}
        >
          {stepIndex + 1} of {totalSteps}
        </div>
      </div>
    </div>
  );
}

// ─── Main Walkthrough Component ───────────────────────────────────────────────

export function AdminWalkthrough({
  onComplete,
  storageKey = "22logistics_walkthrough_done",
}: AdminWalkthroughProps) {
  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [mounted, setMounted] = useState(false);
  const animFrameRef = useRef<number>();

  // Check if already completed
  useEffect(() => {
    const done = localStorage.getItem(storageKey);
    if (!done) {
      // Delay slightly so the app has rendered
      const t = setTimeout(() => setActive(true), 800);
      return () => clearTimeout(t);
    }
  }, [storageKey]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentStep = STEPS[stepIndex];

  // Resolve target element rect
  const resolveRect = useCallback(() => {
    if (!currentStep?.selector) {
      setTargetRect(null);
      return;
    }
    const el = document.querySelector(currentStep.selector);
    if (el) {
      setTargetRect(el.getBoundingClientRect());
    } else {
      setTargetRect(null);
    }
  }, [currentStep?.selector]);

  useEffect(() => {
    if (!active) return;
    resolveRect();
    // Keep rect updated if layout shifts
    animFrameRef.current = requestAnimationFrame(resolveRect);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [active, stepIndex, resolveRect]);

  // Keyboard navigation
  useEffect(() => {
    if (!active) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "Enter") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "Escape") handleSkip();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [active, stepIndex]);

  const handleNext = () => {
    if (stepIndex >= STEPS.length - 1) {
      handleComplete();
    } else {
      setStepIndex((i) => i + 1);
    }
  };

  const handlePrev = () => {
    setStepIndex((i) => Math.max(0, i - 1));
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    localStorage.setItem(storageKey, "true");
    setActive(false);
    onComplete?.();
  };

  if (!active || !mounted) return null;

  const isCentered = currentStep.position === "center" || !currentStep.selector;

  return createPortal(
    <>
      {/* Inject animation keyframes */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes wt-slide-in {
          from { opacity: 0; transform: ${isCentered ? "translate(-50%, calc(-50% + 20px))" : "translateY(16px)"}; }
          to   { opacity: 1; transform: ${isCentered ? "translate(-50%, -50%)" : "translateY(0)"}; }
        }
        @keyframes wt-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>

      <SpotlightOverlay
        targetRect={isCentered ? null : targetRect}
        color={currentStep.color}
      />

      <WalkthroughCard
        step={currentStep}
        stepIndex={stepIndex}
        totalSteps={STEPS.length}
        onNext={handleNext}
        onPrev={handlePrev}
        onSkip={handleSkip}
        targetRect={isCentered ? null : targetRect}
      />

      {/* Keyboard hint */}
      <div
        style={{
          position: "fixed",
          bottom: 20,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10000,
          display: "flex",
          gap: 12,
          animation: "wt-fade-in 0.6s ease 1s both",
        }}
      >
        {[
          { key: "←", label: "Back" },
          { key: "→", label: "Next" },
          { key: "Esc", label: "Skip" },
        ].map(({ key, label }) => (
          <div
            key={key}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              padding: "5px 10px",
              fontSize: 11,
              color: "rgba(255,255,255,0.4)",
              fontFamily: "'DM Sans', system-ui, sans-serif",
            }}
          >
            <kbd
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 4,
                padding: "1px 5px",
                fontSize: 10,
                color: "rgba(255,255,255,0.6)",
              }}
            >
              {key}
            </kbd>
            {label}
          </div>
        ))}
      </div>
    </>,
    document.body,
  );
}

// ─── Trigger Button (for Settings / Help menu) ────────────────────────────────

export function WalkthroughTrigger({
  storageKey = "22logistics_walkthrough_done",
  className,
}: {
  storageKey?: string;
  className?: string;
}) {
  const [show, setShow] = useState(false);

  const handleStart = () => {
    localStorage.removeItem(storageKey);
    setShow(true);
  };

  return (
    <>
      <button
        onClick={handleStart}
        className={className}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 16px",
          borderRadius: 8,
          border: "1px solid rgba(228,168,48,0.3)",
          background: "rgba(228,168,48,0.08)",
          color: "#E4A830",
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: "'DM Sans', system-ui, sans-serif",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background = "rgba(228,168,48,0.15)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = "rgba(228,168,48,0.08)";
        }}
      >
        <BookOpen size={15} />
        Replay Product Tour
      </button>
      {show && (
        <AdminWalkthrough
          storageKey={storageKey}
          onComplete={() => setShow(false)}
        />
      )}
    </>
  );
}

export default AdminWalkthrough;