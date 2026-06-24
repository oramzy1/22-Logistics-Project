import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/site/PolicyPage";

export const Route = createFileRoute("/customer-rights")({
  head: () => ({
    meta: [
      { title: "Customer Bill of Rights - 22 Logistics" },
      {
        name: "description",
        content:
          "Our commitment to every customer - pricing, service, safety, communication, privacy, and more.",
      },
    ],
  }),
  component: () => (
    <PolicyPage
      title="Customer Bill of Rights"
      intro="At 22 Logistics, every customer deserves a professional, transparent, and dependable experience. When you use our platform, you can expect the following."
      sections={[
        {
          heading: "1. The Right to Transparent Pricing",
          paragraphs: [
            "You have the right to know the applicable price for your selected schedule before confirming your request, including any disclosed additional charges for airport services, out-of-service-area travel, or optional add-ons.",
          ],
        },
        {
          heading: "2. The Right to Respectful Service",
          paragraphs: [
            "You will be treated with courtesy, professionalism, and dignity by our drivers and support team.",
          ],
        },
        {
          heading: "3. The Right to Safe Transportation",
          paragraphs: [
            "We strive to provide qualified drivers and properly maintained vehicles suitable for the services we offer.",
          ],
        },
        {
          heading: "4. The Right to Clear Communication",
          paragraphs: [
            "You have the right to receive timely updates regarding your schedule, driver assignment, operational changes, and completed trips.",
          ],
        },
        {
          heading: "5. The Right to Privacy",
          paragraphs: [
            "Your personal information and trip details will be handled responsibly and in accordance with our Privacy Policy.",
          ],
        },
        {
          heading: "6. The Right to Accurate Information",
          paragraphs: [
            "You have the right to receive accurate receipts, invoices, and summaries for completed schedules and payments.",
          ],
        },
        {
          heading: "7. The Right to Honest Scheduling Expectations",
          paragraphs: [
            "We will communicate service availability, scheduling requirements, operating hours, and any operational limitations as clearly as reasonably possible.",
          ],
        },
        {
          heading: "8. The Right to Raise Concerns",
          paragraphs: [
            "You may report complaints, provide feedback, or request assistance through our official support channels. We are committed to reviewing concerns fairly and professionally.",
          ],
        },
        {
          heading: "9. The Right to Equal Treatment",
          paragraphs: [
            "We aim to provide our services fairly and without unlawful discrimination.",
          ],
        },
        {
          heading: "10. The Right to Continuous Improvement",
          paragraphs: [
            "Your feedback helps us improve our technology, operations, and customer experience, and we encourage you to share suggestions with us.",
          ],
        },
      ]}
    />
  ),
});
