import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeader } from "@/components/site/SectionHeader";
import servicesHero from "@/assets/services-hero.jpg";
import road from "@/assets/road.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us - 22 Logistics" },
      {
        name: "description",
        content:
          "22 Logistics is a premium mobility scheduling platform built for individuals, families, professionals, and businesses who value reliability and convenience.",
      },
      { property: "og:title", content: "About 22 Logistics" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const pillars = [
    "Transparent fixed pricing for eligible services",
    "Professional driver assignment managed by our operations team",
    "Flexible scheduling with 3-hour, 6-hour, and full-day options",
    "Dedicated airport services including pickup and drop-off",
    "Support for multiple stops during your journey",
    "Business accounts with delegate scheduling and reporting",
  ];
  return (
    <SiteLayout>
      <PageHero title="About Us" image={servicesHero} />
      <section className="section-surface py-16 md:py-24">
        <div className="container-x">
          <SectionHeader
            eyebrow="Who we are"
            title="Premium mobility, built around your schedule"
            description="22 Logistics is a premium mobility scheduling platform designed for individuals, families, professionals, and businesses who value reliability and convenience."
          />
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div className="overflow-hidden rounded-2xl">
              <img src={road} alt="" className="h-full w-full object-cover" loading="lazy" />
            </div>
            <div>
              <h3 className="font-display text-2xl font-bold text-ink md:text-3xl">
                Why Choose 22 Logistics?
              </h3>
              <p className="mt-3 text-muted-foreground">
                Stop chasing rides at the last minute. With 22 Logistics, you can schedule
                transportation for work, business meetings, airport transfers, family commitments,
                and multi-stop journeys - all through one professionally managed platform.
              </p>
              <ul className="mt-6 space-y-3">
                {pillars.map((p) => (
                  <li key={p} className="flex items-start gap-3 text-sm text-ink">
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-brand" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
