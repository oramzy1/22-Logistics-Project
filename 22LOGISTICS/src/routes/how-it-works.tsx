import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/site/PolicyPage";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How It Works - 22 Logistics" },
      { name: "description", content: "Plan your journey in six simple steps with 22 Logistics." },
    ],
  }),
  component: () => (
    <PolicyPage
      title="How It Works"
      intro="22 Logistics is a premium mobility scheduling platform designed for individuals, families, professionals, and businesses who value reliability and convenience."
      sections={[
        {
          heading: "Step 1: Choose Your Service",
          paragraphs: ["Select the schedule that best suits your needs:"],
          bullets: [
            "3-Hour Schedule",
            "6-Hour Schedule",
            "Full-Day (10 Hours)",
            "Airport Pickup",
            "Airport Drop-off",
            "Airport Pickup & Drop-off",
            "Out-of-Port Harcourt Schedule",
          ],
        },
        {
          heading: "Step 2: Enter Your Itinerary",
          bullets: [
            "Pickup location",
            "Date and preferred start time",
            "Destination",
            "Planned stops along the way",
          ],
        },
        {
          heading: "Step 3: Review Your Schedule",
          bullets: [
            "Your selected service",
            "Pickup and destination details",
            "Planned stops",
            "Any applicable additional charges",
            "Total amount payable",
          ],
        },
        {
          heading: "Step 4: Submit Your Schedule",
          paragraphs: [
            "Once confirmed, your request is sent to our operations team for processing.",
          ],
        },
        {
          heading: "Step 5: Driver & Vehicle Assignment",
          paragraphs: [
            "22 Logistics assigns the most suitable driver and vehicle based on availability and operational requirements. You'll receive a notification once your assignment is confirmed.",
          ],
        },
        {
          heading: "Step 6: Enjoy Your Ride",
          paragraphs: [
            "Your professional driver will arrive at the scheduled pickup point, ready to provide a smooth and dependable experience. For business users, ride records and reporting remain available through your corporate account dashboard.",
          ],
        },
        {
          heading: "Important Notes",
          bullets: [
            "Please schedule rides at least 2 hours in advance whenever possible.",
            "Standard operating hours begin with a 7:00 AM first ride; all services are designed to conclude by 10:00 PM.",
            "Travel outside Port Harcourt LGA or Obio/Akpor LGA may attract additional charges.",
            "Standalone airport schedules include fueling in the published fare.",
          ],
        },
      ]}
    />
  ),
});
