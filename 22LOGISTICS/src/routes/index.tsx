import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Clock,
  Calendar,
  Building2,
  ShieldCheck,
  CreditCard,
  Headphones,
  Download,
  ArrowRight,
  CheckCircle2,
  MapPin,
  Star,
  Apple,
  Play,
  Sparkles,
  Zap,
  Smile,
  Award,
  Lock,
  Smartphone,
  Plus,
  Minus,
} from "lucide-react";
import { useState } from "react"; 
import { SiteLayout } from "@/components/site/SiteLayout";
import { SectionHeader } from "@/components/site/SectionHeader";
import { IconTile } from "@/components/ui/icon-tile";
import heroCar from "@/assets/herocar.png";
import road from "@/assets/road.jpg";
import driverPhone from "@/assets/driver-phone.jpg";
import phonesMockup from "@/assets/phones-mockup.png";
import singlePhone from "@/assets/single-phone.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "22 Logistics - Seamless Logistics for Individuals & Businesses" },
      {
        name: "description",
        content:
          "Manage transportation, schedule trips, and track journeys seamlessly with 22 Logistics. Premium mobility scheduling in Port Harcourt.",
      },
      { property: "og:title", content: "22 Logistics - Seamless Logistics" },
      {
        property: "og:description",
        content:
          "Manage transportation, schedule trips, and track journeys seamlessly with 22 Logistics.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <SiteLayout>
      <Hero />
      <Stats />
      <BuiltFor />
      <Features />
      <HowItWorks />
      <AppPreview />
      <WhyChoose />
      <Testimonials />
      <FAQ />
      <DownloadCTA />
    </SiteLayout>
  );
}

function Hero() {
  return (
    <section className="section-surface">
      <div className="container-x py-10 md:py-16">
        <div className="rounded-3xl bg-gradient-to-b from-white to-brand-soft/40 p-6 md:p-12">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-ink shadow-sm">
                <Sparkles size={12} className="text-brand" /> Trusted by 200+ businesses
              </span>
              <h1 className="mt-5 font-display text-4xl font-bold leading-tight text-ink md:text-6xl">
                Seamless Logistics for
                <br />
                <span className="gradient-gold-text">Individuals &amp; Businesses</span>
              </h1>
              <p className="mt-5 max-w-md text-base text-muted-foreground md:text-lg">
                Manage transportation, schedule trips, and track journeys seamlessly with 22
                Logistics.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <a
                  href="#download"
                  className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white hover:bg-ink/90"
                >
                  <Download size={16} /> Download App
                </a>
                <Link
                  to="/features"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-ink shadow-sm hover:bg-muted"
                >
                  Explore Features <ArrowRight size={16} />
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="relative">
  <img
    src={heroCar}
    alt="22 Logistics fleet vehicle"
    className="w-full"
  />

  {/* Top Left Card */}
  <div className="absolute left-[-10] top-[-10] rounded-2xl border border-slate-100 bg-white px-5 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50">
        <Clock size={16} className="text-blue-500" />
      </div>

      <div>
        <p className="text-sm font-bold text-slate-900">99.2%</p>
        <p className="text-xs text-slate-500">On-time delivery</p>
      </div>
    </div>
  </div>

  {/* Top Right Card */}
  <div className="absolute right-4 top-[-20] rounded-2xl border border-slate-100 bg-white px-5 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50">
        <ShieldCheck size={16} className="text-blue-500" />
      </div>

      <div>
        <p className="text-xs text-slate-400">Verified drivers</p>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-slate-900">Mark</span>
          <span className="text-sm font-medium text-slate-700">
            4.9 ★
          </span>
          <span className="text-xs text-slate-500">
            1,204 trips
          </span>
        </div>
      </div>
    </div>
  </div>

  {/* Bottom Left Card */}
  <div className="absolute bottom-[-45] left-[-20] rounded-3xl border border-slate-100 bg-white p-3 pe-7 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50">
        <MapPin size={13} className="text-blue-500" />
      </div>

      <div>
        <p className="text-xs text-slate-400">Live Trip</p>
        <p className="font-semibold text-sm text-slate-900">
          ETA 12 min
        </p>
      </div>
    </div>

    <div className="mt-3 h-1.5 w-full rounded-full bg-slate-100">
      <div className="h-full w-[65%] rounded-full bg-blue-500" />
    </div>
  </div>
</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stats() {
  const stats = [
    { value: "5k+", label: "Trips Completed" },
    { value: "200+", label: "Businesses" },
    { value: "98%", label: "Satisfaction" },
  ];
  return (
    <section className="border-b border-border bg-background py-10">
      <div className="container-x grid grid-cols-3 gap-4 text-center">
        {stats.map((s) => (
          <div key={s.label}>
            <p className="font-display text-3xl font-bold text-ink md:text-4xl">{s.value}</p>
            <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function BuiltFor() {
  const items = [
    "End-to-end visibility on every shipment",
    "Dedicated account management for businesses",
    "Operate at city, regional, and national scale",
  ];
  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container-x grid items-center gap-10 md:grid-cols-2">
        <div className="overflow-hidden rounded-2xl">
          <img
            src={road}
            alt="Winding road"
            className="h-full w-full object-cover"
            loading="lazy"
            width={1024}
            height={1024}
          />
        </div>
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-brand">About</p>
          <h2 className="font-display text-3xl font-bold text-ink md:text-4xl">
            Built for Smarter Transportation
          </h2>
          <p className="mt-4 max-w-lg text-base text-muted-foreground">
            22 Logistics combines reliable drivers, modern technology, and transparent pricing in
            one seamless platform so individuals and businesses can move with confidence.
          </p>
          <ul className="mt-6 space-y-3">
            {items.map((i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-ink">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-brand" />
                <span>{i}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Features() {
  const features = [
    {
      Icon: Clock,
      title: "Everything you need to move",
      text: "A complete toolkit designed around speed, transparency, and trust.",
    },
    {
      Icon: Calendar,
      title: "Easy Ride Scheduling",
      text: "Plan one-off or recurring rides in seconds, from anywhere.",
    },
    {
      Icon: Building2,
      title: "Corporate Transportation",
      text: "Centralized booking, billing, and reporting for teams of any size.",
    },
    {
      Icon: ShieldCheck,
      title: "Verified Drivers",
      text: "Background-checked, vetted professionals with quality ratings.",
    },
    {
      Icon: CreditCard,
      title: "Secure Payments",
      text: "Encrypted in-app payments with receipts and itemized invoices.",
    },
    {
      Icon: Headphones,
      title: "Fast Support",
      text: "Round-the-clock support team ready whenever you need help.",
    },
  ];
  return (
    <section className="section-surface py-16 md:py-24">
      <div className="container-x">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-brand">Features</p>
        <h2 className="max-w-xl font-display text-3xl font-bold text-ink md:text-4xl">
          Everything you need to move
        </h2>
        <p className="mt-3 max-w-xl text-muted-foreground">
          A complete toolkit designed around speed, transparency, and trust.
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-xl border border-border bg-white p-6">
              <IconTile Icon={f.Icon} />
              <h3 className="mt-4 font-display text-base font-semibold text-ink">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: 1, t: "Download the App", d: "Get 22 Logistics on iOS or Android in seconds." },
    { n: 2, t: "Create an Account", d: "Sign up as an individual or invite your team." },
    { n: 3, t: "Schedule a Ride for your need", d: "Pick a route, time, hour for your ride." },
    { n: 4, t: "Track Trips Seamlessly", d: "Monitor every journey live until it's complete." },
  ];
  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container-x grid items-center gap-10 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl">
          <img
            src={driverPhone}
            alt="Driver with phone"
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-brand">
            How it works
          </p>
          <h2 className="font-display text-3xl font-bold text-ink md:text-4xl">
            Get moving in four simple steps
          </h2>
          <p className="mt-3 max-w-md text-muted-foreground">
            Schedule rides, track trips, and reach your destination seamlessly with a fast and
            reliable experience.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {steps.map((s) => (
              <div key={s.n} className="rounded-xl border border-border bg-white p-5">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-brand-soft text-xs font-bold text-brand">
                  {s.n}
                </span>
                <h3 className="mt-3 font-display text-sm font-semibold text-ink">{s.t}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function AppPreview() {
  return (
    <section className="section-surface py-16 md:py-24">
      <div className="container-x text-center">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-brand">App Preview</p>
        <h2 className="font-display text-3xl font-bold text-ink md:text-4xl">
          Manage Every Trip From Your Phone
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
          Booking, tracking, drivers, and payments - all in one beautifully simple app.
        </p>
        <div className="mt-10 flex justify-center">
          <img
            src={phonesMockup}
            alt="22 Logistics app"
            className="max-h-[480px] w-auto"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}

function WhyChoose() {
  const items = [
    {
      Icon: Award,
      t: "Reliable Service",
      d: "Consistent on-time performance you can plan around.",
    },
    {
      Icon: Zap,
      t: "Fast Driver Assignment",
      d: "Average pickup confirmations in under 60 seconds.",
    },
    {
      Icon: Building2,
      t: "Business-Friendly",
      d: "Tools, billing, and reporting built for teams.",
    },
    { Icon: CreditCard, t: "Transparent Pricing", d: "Fixed-rate schedules and disclosed extras." },
    {
      Icon: Lock,
      t: "Safe & Verified Drivers",
      d: "Every driver is background-checked and rated.",
    },
    {
      Icon: Smile,
      t: "Seamless Mobile Experience",
      d: "Designed mobile-first for speed and clarity.",
    },
  ];
  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container-x">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-brand">
          Why 22 Logistic
        </p>
        <h2 className="font-display text-3xl font-bold text-ink md:text-4xl">
          A platform people actually trust
        </h2>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {items.map((i) => (
            <div key={i.t} className="text-center">
              <span className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-lg bg-brand-soft text-brand">
                <i.Icon size={20} />
              </span>
              <h3 className="mt-3 font-display text-sm font-semibold text-ink">{i.t}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{i.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const items = [
    {
      name: "Amelia Carter",
      stars: 5,
      body: "We replaced three vendors with 22 Logistics. Reporting and reliability are night and day.",
    },
    {
      name: "Daniel Okafor",
      stars: 4,
      body: "I book daily commutes through the app - drivers are punctual and tracking is flawless.",
    },
    {
      name: "Priya Shah",
      stars: 5,
      body: "Setting up corporate accounts took ten minutes. Our team finally has one source of truth.",
    },
  ];
  return (
    <section className="section-surface py-16 md:py-24">
      <div className="container-x">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-brand">
          Testimonials
        </p>
        <h2 className="font-display text-3xl font-bold text-ink md:text-4xl">
          Loved by Individuals and businesses
        </h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Trusted by everyday commuters and growing businesses for reliable, seamless, and efficient
          transportation solutions.
        </p>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {items.map((t) => (
            <div key={t.name} className="card-service rounded-2xl p-6">
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={i < t.stars ? "fill-white text-white" : "text-white/40"}
                  />
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-white/90">"{t.body}"</p>
              <div className="mt-5 flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-xs font-semibold">
                  {t.name
                    .split(" ")
                    .map((p) => p[0])
                    .join("")}
                </span>
                <span className="text-sm font-medium">{t.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const faqs = [
    {
      q: "How do I book a ride with 22 Logistics?",
      a: "Download the app or sign in on the web, choose your service, enter your itinerary, and submit. Our operations team assigns a driver and confirms your schedule.",
    },
    {
      q: "Can businesses use 22 Logistics for company transportation?",
      a: "Yes. Corporate accounts include delegate scheduling, consolidated invoicing, and ride reports.",
    },
    {
      q: "Can I track my trip in real time?",
      a: "Yes. Once your driver is assigned and dispatched, you can follow the trip from the app.",
    },
    {
      q: "What payment methods are supported?",
      a: "We support major cards and approved corporate billing arrangements via secure third-party processors.",
    },
    {
      q: "Are the drivers verified?",
      a: "Every driver is background-checked, vetted, and held to the 22 Logistics Driver Code of Conduct.",
    },
  ];
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-brand">FAQ</p>
          <h2 className="font-display text-3xl font-bold text-ink md:text-4xl">
            Questions, answered
          </h2>
        </div>
        <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-border bg-white p-2">
          {faqs.map((f, i) => (
            <button
              key={i}
              onClick={() => setOpen(open === i ? null : i)}
              className="block w-full border-b border-border px-5 py-4 text-left last:border-b-0"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-medium text-ink">{f.q}</span>
                {open === i ? (
                  <Minus size={16} className="text-brand" />
                ) : (
                  <Plus size={16} className="text-muted-foreground" />
                )}
              </div>
              {open === i && <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function DownloadCTA() {
  return (
    <section className="bg-brand py-14 text-white md:py-20">
      <div className="container-x grid items-center gap-8 md:grid-cols-2">
        <div>
          <h2 className="font-display text-3xl font-bold md:text-4xl">
            Download the 22 Logistics App Today
          </h2>
          <p className="mt-3 max-w-md text-white/85">
            Book, track, and manage every trip from one beautifully simple mobile experience.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="#"
              className="inline-flex items-center gap-2 rounded-md bg-black px-4 py-3 text-sm font-semibold"
            >
              <Apple size={18} /> App Store
            </a>
            <a
              href="#"
              className="inline-flex items-center gap-2 rounded-md bg-black px-4 py-3 text-sm font-semibold"
            >
              <Play size={18} /> Google Play
            </a>
          </div>
        </div>
        <div className="flex justify-center md:justify-end">
          <img
            src={singlePhone}
            alt="App preview"
            className="max-h-[420px] w-auto"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}
