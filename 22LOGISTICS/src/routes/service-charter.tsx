import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/site/PolicyPage";

export const Route = createFileRoute("/service-charter")({
  head: () => ({
    meta: [
      { title: "Service Charter - 22 Logistics" },
      {
        name: "description",
        content:
          "Our promise - premium mobility scheduling delivered with professionalism and care.",
      },
    ],
  }),
  component: () => (
    <PolicyPage
      title="Service Charter"
      intro="At 22 Logistics, we believe transportation should be planned with confidence, delivered with professionalism, and executed with excellence."
      sections={[
        {
          heading: "1. We Put Your Schedule First",
          paragraphs: [
            "Our platform is designed for advance scheduling, helping you plan your day with confidence. Whether it's a business meeting, airport transfer, or multiple-stop itinerary, we are committed to supporting your plans with dependable service.",
          ],
        },
        {
          heading: "2. Transparent Pricing",
          bullets: [
            "Fixed-duration schedules (3-hour, 6-hour, and full-day services) are offered at published rates.",
            "Airport schedules and designated out-of-town routes are also provided at clearly communicated prices where applicable.",
            "Any additional charges, including travel outside our standard service areas, will be disclosed before confirmation whenever reasonably possible.",
          ],
        },
        {
          heading: "3. Professional Driver Assignment",
          paragraphs: [
            "To maintain service quality and efficient fleet management, drivers and vehicles are assigned by our operations team based on availability and operational needs.",
          ],
        },
        {
          heading: "4. Safety and Respect",
          bullets: [
            "Professionally presented drivers.",
            "Well-maintained vehicles.",
            "Courteous and respectful interactions.",
            "Compliance with applicable road safety requirements.",
          ],
        },
        {
          heading: "5. Reliability",
          paragraphs: [
            "Our goal is to ensure every scheduled ride is managed with care and attention. While unforeseen events may occasionally affect operations, we will communicate promptly and work to provide suitable alternatives whenever possible.",
          ],
        },
        {
          heading: "6. Airport Excellence",
          paragraphs: [
            "Our airport scheduling services are designed to make travel simpler and more convenient, with dedicated booking options and clear pricing structures.",
          ],
        },
        {
          heading: "7. Business Mobility Solutions",
          bullets: [
            "Delegate scheduling.",
            "Corporate accounts.",
            "Consolidated reporting.",
            "Professional invoicing.",
            "Centralized ride management.",
          ],
        },
        {
          heading: "8. Clear Communication",
          paragraphs: [
            "From schedule confirmation to driver assignment and ride completion, we aim to keep customers informed through timely notifications and responsive support channels.",
          ],
        },
        {
          heading: "9. Privacy and Confidentiality",
          paragraphs: [
            "We respect the confidentiality of our customers' information and handle personal data in accordance with our Privacy Policy and applicable legal requirements.",
          ],
        },
        {
          heading: "10. Continuous Improvement",
          paragraphs: [
            "We value feedback and regularly review our operations, technology, and customer experience to improve our services and maintain the high standards expected of 22 Logistics.",
          ],
        },
      ]}
    />
  ),
});
