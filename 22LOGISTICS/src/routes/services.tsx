import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, Plane, ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeader } from "@/components/site/SectionHeader";
import servicesHero from "@/assets/services-hero.jpg";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Service - 22 Logistics" },
      {
        name: "description",
        content:
          "Flexible transportation services: hourly bookings, airport transfers, and corporate scheduling with fixed transparent pricing.",
      },
      { property: "og:title", content: "Service - 22 Logistics" },
      {
        property: "og:description",
        content: "Flexible transportation services tailored for individuals and businesses.",
      },
    ],
  }),
  component: ServicesPage,
});

const services = [
  {
    Icon: Clock,
    title: "3 Hours Ride",
    text: "Perfect for short meetings and quick city movement.",
  },
  { Icon: Clock, title: "6 Hours Ride", text: "Ideal for errands, events, and multiple stops." },
  {
    Icon: Clock,
    title: "10 Hours Ride",
    text: "Designed for full-day transportation and business schedules.",
  },
  {
    Icon: Clock,
    title: "Multi-Day Booking",
    text: "Flexible ride options for extended trips and special schedules.",
  },
];

function ServicesPage() {
  return (
    <SiteLayout>
      <PageHero title="Service" image={servicesHero} />
      <section className="section-surface py-16 md:py-24">
        <div className="container-x">
          <SectionHeader
            eyebrow="Our Services"
            title="Flexible Transportation Services"
            description="Reliable ride solutions tailored for individuals and businesses whether it's hourly bookings, airport transfers, or corporate transportation."
          />
          <div className="grid gap-5 md:grid-cols-2">
            {services.map((s) => (
              <ServiceCard key={s.title} {...s} />
            ))}
          </div>
          <div className="mt-5">
            <ServiceCard
              Icon={Clock}
              title="Airport Pickup & Drop-off"
              text="Seamless airport transfers with reliable scheduling and professional drivers."
              wide
              illustration={
                <Plane className="absolute -right-2 top-6 h-32 w-32 text-white/15 md:h-48 md:w-48" />
              }
            />
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function ServiceCard({
  Icon,
  title,
  text,
  wide,
  illustration,
}: {
  Icon: typeof Clock;
  title: string;
  text: string;
  wide?: boolean;
  illustration?: React.ReactNode;
}) {
  return (
    <div className={`card-service relative p-6 md:p-8 ${wide ? "min-h-[260px]" : "min-h-[220px]"}`}>
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-white text-brand">
        <Icon size={20} />
      </span>
      <h3 className="mt-5 font-display text-2xl font-bold md:text-3xl">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-white/85">{text}</p>
      <div className="mt-8 flex justify-end">
        <Link
          to="/contact"
          className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-xs font-semibold text-white"
        >
          Get Started <ArrowRight size={14} />
        </Link>
      </div>
      {illustration}
    </div>
  );
}
