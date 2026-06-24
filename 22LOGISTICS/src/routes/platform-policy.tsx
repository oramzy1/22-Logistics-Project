import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/site/PolicyPage";

export const Route = createFileRoute("/platform-policy")({
  head: () => ({
    meta: [
      { title: "Platform Use Policy - 22 Logistics" },
      {
        name: "description",
        content: "Acceptable use of the 22 Logistics website and mobile application.",
      },
    ],
  }),
  component: () => (
    <PolicyPage
      title="Platform Use Policy"
      intro="This Policy governs acceptable use of the 22 Logistics website and mobile application by customers, business users, delegates, and visitors."
      sections={[
        {
          heading: "1. Purpose",
          paragraphs: [
            "This Policy governs acceptable use of the 22 Logistics website and mobile application by customers, business users, delegates, and visitors.",
          ],
        },
        {
          heading: "2. Service Coverage",
          paragraphs: [
            "22 Logistics operates within approved service areas and designated routes. Travel outside standard service zones may incur additional charges or require operational approval.",
          ],
        },
        {
          heading: "3. Scheduling Philosophy",
          paragraphs: [
            "The platform is designed primarily for advance scheduling rather than on-demand transportation. Customers should schedule rides in accordance with published notice requirements and operating hours.",
          ],
        },
        {
          heading: "4. Operating Hours",
          paragraphs: [
            "Service availability, scheduling windows, and ride durations are determined by 22 Logistics and may change periodically. Some ride types may have latest permissible start times to ensure completion within operating hours.",
          ],
        },
        {
          heading: "5. Account Security",
          paragraphs: [
            "Users are responsible for safeguarding login credentials and must promptly notify 22 Logistics of unauthorized account access.",
          ],
        },
        {
          heading: "6. Prohibited Conduct",
          paragraphs: ["Users must not:"],
          bullets: [
            "Provide false identity or booking information.",
            "Interfere with platform security.",
            "Attempt unauthorized access to systems or accounts.",
            "Use the platform for unlawful purposes.",
            "Harass drivers, staff, or other users.",
            "Misrepresent destinations or intentionally conceal trip details.",
          ],
        },
        {
          heading: "7. Multi-Stop and Destination Accuracy",
          paragraphs: [
            "Customers should accurately disclose planned stops and destinations during scheduling. Failure to do so may result in additional charges, operational changes, or cancellation where appropriate.",
          ],
        },
        {
          heading: "8. Business Delegates",
          paragraphs: [
            "Organizations remain responsible for activities carried out by authorized delegates using corporate accounts.",
          ],
        },
        {
          heading: "9. Communications",
          paragraphs: [
            "By using the platform, users consent to receiving service-related communications such as confirmations, assignment notifications, receipts, security alerts, and support messages.",
          ],
        },
        {
          heading: "10. Maintenance and Interruptions",
          paragraphs: [
            "The website and application may occasionally be unavailable due to maintenance, upgrades, or circumstances beyond our control.",
          ],
        },
        {
          heading: "11. Feedback",
          paragraphs: [
            "Suggestions and feedback submitted to 22 Logistics may be used to improve services without creating any obligation to compensate the contributor.",
          ],
        },
        {
          heading: "12. Enforcement",
          paragraphs: [
            "Violations of this Policy may result in warnings, temporary suspension, permanent account closure, refusal of future service, or legal action where appropriate.",
          ],
        },
        {
          heading: "13. Contact",
          paragraphs: [
            "Questions regarding this Policy should be directed to 22 Logistics through its official customer support channels or website contact information.",
          ],
        },
      ]}
    />
  ),
});
