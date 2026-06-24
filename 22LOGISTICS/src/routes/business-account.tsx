import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/site/PolicyPage";

export const Route = createFileRoute("/business-account")({
  head: () => ({
    meta: [
      { title: "Business Account Agreement - 22 Logistics" },
      {
        name: "description",
        content:
          "Terms governing organizations that use 22 Logistics for corporate transportation.",
      },
    ],
  }),
  component: () => (
    <PolicyPage
      title="Business Account Agreement"
      intro="This Agreement governs organizations using 22 Logistics for employee, executive, guest, or operational transportation."
      sections={[
        {
          heading: "1. Scope",
          paragraphs: [
            "This Agreement governs organizations using 22 Logistics for employee, executive, guest, or operational transportation.",
          ],
        },
        {
          heading: "2. Account Administration",
          paragraphs: [
            "Each business account must designate at least one authorized administrator responsible for:",
          ],
          bullets: [
            "Managing delegates.",
            "Reviewing ride activity.",
            "Monitoring invoices.",
            "Maintaining accurate company information.",
          ],
        },
        {
          heading: "3. Delegates",
          paragraphs: [
            "Authorized delegates may schedule rides within the permissions assigned by the business administrator. The organization accepts responsibility for rides scheduled by approved delegates.",
          ],
        },
        {
          heading: "4. Billing",
          paragraphs: [
            "Businesses may choose approved payment arrangements, including pay-per-schedule or consolidated invoicing where offered by 22 Logistics. Invoices should be settled within the agreed payment period.",
          ],
        },
        {
          heading: "5. Scheduling Rules",
          paragraphs: [
            "Business users remain subject to platform scheduling requirements, including minimum advance notice, service hours, and vehicle availability.",
          ],
        },
        {
          heading: "6. Driver Assignment",
          paragraphs: [
            "Driver and vehicle allocation remains solely at the discretion of 22 Logistics to ensure safe and efficient fleet operations.",
          ],
        },
        {
          heading: "7. Compliance",
          paragraphs: [
            "The organization agrees not to misuse the platform or authorize fraudulent, unlawful, or misleading scheduling activity.",
          ],
        },
        {
          heading: "8. Reports",
          paragraphs: [
            "Business customers may receive ride summaries, invoices, and usage reports through the platform or designated communication channels.",
          ],
        },
        {
          heading: "9. Confidentiality",
          paragraphs: [
            "Both parties should maintain appropriate confidentiality regarding commercially sensitive information shared during the course of the relationship.",
          ],
        },
        {
          heading: "10. Suspension",
          paragraphs: [
            "22 Logistics may suspend or terminate a business account for material breaches of this Agreement, fraudulent conduct, persistent non-payment, or unlawful activity.",
          ],
        },
        {
          heading: "11. Amendments",
          paragraphs: [
            "Operational procedures and service offerings may evolve over time. Continued use of the account after notice of updates constitutes acceptance of revised terms.",
          ],
        },
      ]}
    />
  ),
});
