import { createFileRoute } from "@tanstack/react-router";
import {
  Clock,
  Calendar,
  Building2,
  ShieldCheck,
  CreditCard,
  Headphones,
  MapPin,
  Bell,
  Users,
  BarChart3,
} from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeader } from "@/components/site/SectionHeader";
import { IconTile } from "@/components/ui/icon-tile";
import servicesHero from "@/assets/services-hero.jpg";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Features - 22 Logistics" },
      {
        name: "description",
        content:
          "A complete toolkit for moving - scheduling, tracking, billing, and reporting designed around speed, transparency, and trust.",
      },
    ],
  }),
  component: FeaturesPage,
});

const features = [
  {
    Icon: Calendar,
    t: "Advance Scheduling",
    d: "Schedule rides at least two hours ahead and lock in your preferred time.",
  },
  {
    Icon: Clock,
    t: "Fixed-Duration Rides",
    d: "3-hour, 6-hour, and full-day schedules with transparent pricing.",
  },
  {
    Icon: MapPin,
    t: "Multi-Stop Itineraries",
    d: "Add every planned stop up-front for accurate pricing and routing.",
  },
  {
    Icon: ShieldCheck,
    t: "Verified Drivers",
    d: "Every driver is background-checked and held to a code of conduct.",
  },
  {
    Icon: Building2,
    t: "Corporate Accounts",
    d: "Delegate scheduling, consolidated invoicing, and ride reports.",
  },
  {
    Icon: CreditCard,
    t: "Secure Payments",
    d: "Encrypted in-app payments with receipts and itemized invoices.",
  },
  {
    Icon: Bell,
    t: "Real-Time Notifications",
    d: "Updates on driver assignment, ETA changes, and trip completion.",
  },
  {
    Icon: Users,
    t: "Delegate Management",
    d: "Authorize team members to book on behalf of your organization.",
  },
  {
    Icon: BarChart3,
    t: "Reporting Dashboard",
    d: "Track usage, spend, and on-time performance in one place.",
  },
  {
    Icon: Headphones,
    t: "Dedicated Support",
    d: "Reach our operations team through the channels you prefer.",
  },
];

function FeaturesPage() {
  return (
    <SiteLayout>
      <PageHero title="Feature" image={servicesHero} />
      <section className="section-surface py-16 md:py-24">
        <div className="container-x">
          <SectionHeader
            eyebrow="Features"
            title="Everything you need to move"
            description="A complete toolkit designed around speed, transparency, and trust."
          />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.t} className="rounded-xl border border-border bg-white p-6">
                <IconTile Icon={f.Icon} />
                <h3 className="mt-4 font-display text-base font-semibold text-ink">{f.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
