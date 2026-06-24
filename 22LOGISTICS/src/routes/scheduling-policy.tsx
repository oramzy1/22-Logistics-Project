import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/site/PolicyPage";

export const Route = createFileRoute("/scheduling-policy")({
  head: () => ({
    meta: [
      { title: "Customer Scheduling Policy - 22 Logistics" },
      {
        name: "description",
        content:
          "How advance scheduling works at 22 Logistics, including operating hours and ride windows.",
      },
    ],
  }),
  component: () => (
    <PolicyPage
      title="Customer Scheduling Policy"
      intro="22 Logistics is a premium mobility scheduling platform designed to help individuals and businesses plan their transportation with confidence."
      sections={[
        {
          heading: "Advance Scheduling",
          paragraphs: [
            "Customers are encouraged to schedule rides as early as possible.",
            "As a general operating rule, schedules should be submitted at least two (2) hours before the intended pickup time. Earlier scheduling increases the likelihood of securing the preferred date and time.",
          ],
        },
        {
          heading: "Operating Hours",
          bullets: [
            "First scheduled ride: 7:00 AM",
            "Final scheduled ride must conclude by 10:00 PM",
            "Latest start time for a 3-hour schedule is 7:00 PM.",
            "Latest start time for a 6-hour schedule is 4:00 PM.",
            "Latest start time for a 10-hour full-day schedule is 12:00 PM.",
          ],
        },
        {
          heading: "Driver Assignment",
          paragraphs: [
            "To maintain consistent service quality and optimize fleet utilization, drivers and vehicles are assigned exclusively by the 22 Logistics operations team after a schedule is submitted.",
          ],
          bullets: [
            "Vehicle availability.",
            "Driver availability.",
            "Existing commitments.",
            "Operational requirements.",
            "Service quality standards.",
          ],
        },
        {
          heading: "Schedule Accuracy",
          paragraphs: [
            "Customers should provide complete and accurate information when creating a schedule, including pickup, destination, planned stops, airport requirements, and contact details.",
          ],
        },
        {
          heading: "Modifications",
          paragraphs: [
            "Customers may request changes before the scheduled start time. Modifications remain subject to operational feasibility and vehicle availability.",
          ],
        },
        {
          heading: "Service Availability",
          paragraphs: [
            "While 22 Logistics strives to fulfill every valid request, scheduling remains subject to fleet capacity and operational considerations.",
          ],
        },
      ]}
    />
  ),
});
