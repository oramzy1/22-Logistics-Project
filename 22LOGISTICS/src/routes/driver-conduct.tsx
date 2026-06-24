import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/site/PolicyPage";

export const Route = createFileRoute("/driver-conduct")({
  head: () => ({
    meta: [
      { title: "Driver Code of Conduct - 22 Logistics" },
      {
        name: "description",
        content: "Professional standards every 22 Logistics driver is expected to uphold.",
      },
    ],
  }),
  component: () => (
    <PolicyPage
      title="Driver Code of Conduct"
      intro="Drivers represent the 22 Logistics brand and are expected to demonstrate professionalism, courtesy, punctuality, and integrity at all times."
      sections={[
        {
          heading: "1. Professional Standards",
          paragraphs: [
            "Drivers represent the 22 Logistics brand and are expected to demonstrate professionalism, courtesy, punctuality, and integrity at all times.",
          ],
        },
        {
          heading: "2. Attendance",
          paragraphs: [
            "Drivers must report for duty at scheduled times and remain available for assignments unless approved otherwise.",
          ],
        },
        {
          heading: "3. Assignment Procedure",
          paragraphs: [
            "Drivers may only undertake rides assigned through the official dispatch process. Accepting unauthorized trips while representing 22 Logistics is prohibited.",
          ],
        },
        {
          heading: "4. Vehicle Care",
          paragraphs: [
            "Drivers must conduct reasonable pre-trip inspections and promptly report maintenance concerns or safety issues.",
          ],
        },
        {
          heading: "5. Customer Service",
          bullets: [
            "Arrive on time.",
            "Dress appropriately.",
            "Maintain clean vehicles.",
            "Communicate respectfully.",
            "Follow lawful customer instructions where safe to do so.",
          ],
        },
        {
          heading: "6. Safety",
          paragraphs: [
            "Drivers must obey traffic laws, avoid distracted driving, and prioritize passenger safety at all times.",
          ],
        },
        {
          heading: "7. Confidentiality",
          paragraphs: [
            "Customer information obtained during the course of work must not be disclosed except as required to perform assigned duties or comply with legal obligations.",
          ],
        },
        {
          heading: "8. Alcohol, Drugs, and Impairment",
          paragraphs: [
            "Drivers must not operate vehicles while impaired by alcohol, illegal substances, or any condition that materially affects safe driving.",
          ],
        },
        {
          heading: "9. Incidents",
          paragraphs: [
            "Accidents, security concerns, customer complaints, or vehicle damage must be reported to management as soon as reasonably possible.",
          ],
        },
        {
          heading: "10. Technology Use",
          paragraphs: [
            "Drivers should accurately use the 22 Logistics application to acknowledge assignments, update trip status, and complete required records.",
          ],
        },
        {
          heading: "11. Prohibited Conduct",
          bullets: [
            "Solicit unauthorized payments.",
            "Harass customers.",
            "Falsify trip records.",
            "Use company assets for unauthorized purposes.",
            "Share customer data without authorization.",
          ],
        },
        {
          heading: "12. Compliance and Discipline",
          paragraphs: [
            "Violations of this Code may result in coaching, warnings, suspension, termination of engagement, or other appropriate action depending on the seriousness of the conduct.",
          ],
        },
      ]}
    />
  ),
});
