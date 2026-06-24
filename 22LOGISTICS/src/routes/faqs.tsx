import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHero } from "@/components/site/PageHero";
import servicesHero from "@/assets/services-hero.jpg";

export const Route = createFileRoute("/faqs")({
  head: () => ({
    meta: [
      { title: "FAQs - 22 Logistics" },
      {
        name: "description",
        content:
          "Answers to common questions about scheduling, payments, drivers, and business accounts.",
      },
    ],
  }),
  component: FaqsPage,
});

const FAQS = [
  {
    q: "How do I book a ride with 22 Logistics?",
    a: "Download the app or sign in on the web, choose your service, enter your itinerary, and submit. Our operations team will assign a driver and confirm your schedule.",
  },
  {
    q: "How far in advance should I book?",
    a: "As a general operating rule, please schedule at least two (2) hours before your intended pickup time. Earlier scheduling improves availability.",
  },
  {
    q: "What are the operating hours?",
    a: "First scheduled ride begins at 7:00 AM and all rides are designed to conclude by 10:00 PM.",
  },
  {
    q: "Can I choose my driver?",
    a: "Drivers and vehicles are assigned by the 22 Logistics operations team to ensure consistent service quality and efficient fleet management.",
  },
  {
    q: "What if I need to cancel?",
    a: "Cancellations more than one hour before the scheduled start time are eligible for a full refund of any prepaid amount. See the Cancellation & Refund Policy for full details.",
  },
  {
    q: "Do you serve destinations outside Port Harcourt?",
    a: "Yes - selected out-of-Port-Harcourt destinations are available as predefined fixed-price routes. Travel beyond standard service areas may attract additional charges.",
  },
  {
    q: "How does corporate billing work?",
    a: "Corporate accounts can use pay-per-schedule or consolidated invoicing arrangements with delegate scheduling, ride summaries, and usage reports.",
  },
  {
    q: "Is my data safe?",
    a: "We use reasonable technical and organizational safeguards. See our Privacy Policy for full details on how we collect, use, and protect your information.",
  },
];

function FaqsPage() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <SiteLayout>
      <PageHero title="FAQs" image={servicesHero} />
      <section className="section-surface py-16 md:py-24">
        <div className="container-x">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-2xl border border-border bg-white p-2">
              {FAQS.map((f, i) => (
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
            <p className="mt-8 text-center text-sm text-muted-foreground">
              Still have questions?{" "}
              <Link to="/contact" className="font-semibold text-brand">
                Contact our team
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
