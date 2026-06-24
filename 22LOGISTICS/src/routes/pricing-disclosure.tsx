import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/site/PolicyPage";

export const Route = createFileRoute("/pricing-disclosure")({
  head: () => ({
    meta: [
      { title: "Service Area & Pricing Disclosure - 22 Logistics" },
      {
        name: "description",
        content:
          "Fixed-rate scheduling, airport pricing, and standard service areas for 22 Logistics.",
      },
    ],
  }),
  component: () => (
    <PolicyPage
      title="Service Area & Pricing"
      intro="22 Logistics is committed to communicating pricing clearly and making customers aware of applicable charges before a schedule is finalized whenever reasonably practicable."
      sections={[
        {
          heading: "Fixed-Rate Scheduling",
          paragraphs: [
            "The following services are offered at published fixed rates displayed within the application and website:",
          ],
          bullets: [
            "3-Hour Schedule",
            "6-Hour Schedule",
            "Full-Day (10-Hour) Schedule",
            "Airport Pickup",
            "Airport Drop-off",
            "Airport Pickup & Drop-off",
            "Designated Out-of-Port Harcourt Routes",
          ],
        },
        {
          heading: "Airport Services",
          paragraphs: [
            "Standalone airport schedules are priced on a fixed-rate basis, with fueling included in the published fare unless otherwise indicated. Customers with an existing duration-based schedule may request an airport add-on subject to operational feasibility.",
          ],
        },
        {
          heading: "Planned Stops",
          paragraphs: [
            "Customers are encouraged to include all expected stops when creating a schedule. This enables accurate pricing, better vehicle allocation, and improved operational planning.",
          ],
        },
        {
          heading: "Standard Service Area",
          paragraphs: ["Standard pricing generally applies to travel within:"],
          bullets: ["Port Harcourt Local Government Area.", "Obio/Akpor Local Government Area."],
        },
        {
          heading: "Additional Charges Outside Standard Areas",
          paragraphs: [
            "Where a scheduled route or any disclosed stop extends beyond the standard service area, additional charges may apply. The application will seek to notify customers of such charges before confirmation whenever possible.",
          ],
        },
        {
          heading: "Out-of-Port Harcourt Destinations",
          paragraphs: [
            "Certain destinations outside the standard service area may be available as predefined fixed-price routes. These destinations and applicable rates may be updated periodically.",
          ],
        },
        {
          heading: "Transparency Commitment",
          paragraphs: [
            "22 Logistics is committed to communicating pricing clearly and making customers aware of applicable charges before a schedule is finalized whenever reasonably practicable.",
          ],
        },
      ]}
    />
  ),
});
