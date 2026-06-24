import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/site/PolicyPage";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions - 22 Logistics" },
      {
        name: "description",
        content:
          "Terms governing use of the 22 Logistics platform and transportation scheduling services.",
      },
    ],
  }),
  component: () => (
    <PolicyPage
      title="Terms & Conditions"
      intro="By accessing or using the 22 Logistics website or mobile application, you agree to these Terms and Conditions."
      sections={[
        {
          heading: "1. Acceptance",
          paragraphs: [
            "By accessing or using the 22 Logistics website or mobile application, you agree to these Terms and Conditions.",
          ],
        },
        {
          heading: "2. Nature of the Service",
          paragraphs: [
            "22 Logistics provides a mobility scheduling platform that enables customers to schedule transportation services, including fixed-duration rides, airport schedules, and approved out-of-town trips.",
          ],
        },
        {
          heading: "3. Scheduling Requirements",
          bullets: [
            "Rides must generally be scheduled at least two (2) hours before the requested start time.",
            "Availability is subject to fleet capacity and operational constraints.",
            "Submission of a schedule request does not guarantee immediate driver assignment.",
          ],
        },
        {
          heading: "4. Driver and Vehicle Assignment",
          paragraphs: [
            "Drivers and vehicles are assigned exclusively by 22 Logistics based on availability and operational considerations. Customers cannot select or directly assign drivers unless expressly offered by the platform.",
          ],
        },
        {
          heading: "5. Fixed Pricing",
          paragraphs: [
            "Certain services, including 3-hour, 6-hour, full-day schedules, airport schedules, and designated out-of-town routes, may be offered at fixed prices published within the app or website.",
          ],
        },
        {
          heading: "6. Airport Services",
          paragraphs: [
            "Standalone airport schedules include fueling within the published fixed fare unless otherwise stated. Airport add-ons attached to existing duration-based schedules may be subject to separate pricing rules.",
          ],
        },
        {
          heading: "7. Additional Charges",
          bullets: [
            "Travel outside designated service areas.",
            "Extended waiting beyond included allowances.",
            "Customer-requested changes after confirmation.",
            "Damage caused by passengers.",
            "Cleaning fees where reasonably required.",
          ],
          paragraphs: ["Any applicable charges will be communicated where practicable."],
        },
        {
          heading: "8. Customer Responsibilities",
          bullets: [
            "Provide accurate scheduling information.",
            "Be available at the agreed pickup location.",
            "Treat drivers and vehicles respectfully.",
            "Comply with applicable laws and safety requirements.",
          ],
        },
        {
          heading: "9. Business Accounts and Delegates",
          paragraphs: [
            "Business administrators are responsible for activities performed by authorized delegates using their organization's account.",
          ],
        },
        {
          heading: "10. Cancellations and Changes",
          paragraphs: [
            "Cancellation, modification, refund, and rescheduling policies may vary depending on timing and service type. Applicable rules will be communicated through the platform.",
          ],
        },
        {
          heading: "11. Service Availability",
          paragraphs: [
            "22 Logistics reserves the right to decline, postpone, or cancel schedules where operational, safety, legal, or unforeseen circumstances make fulfillment impractical.",
          ],
        },
        {
          heading: "12. Limitation of Liability",
          paragraphs: [
            "To the maximum extent permitted by law, 22 Logistics shall not be liable for indirect, incidental, consequential, or special damages arising from use of the platform or transportation services.",
          ],
        },
        {
          heading: "13. Intellectual Property",
          paragraphs: [
            "All trademarks, branding, software, designs, text, and content associated with 22 Logistics remain the property of 22 Logistics or its licensors.",
          ],
        },
        {
          heading: "14. Suspension or Termination",
          paragraphs: [
            "Accounts may be suspended or terminated for fraud, abuse, illegal activity, misuse of the platform, or violation of these Terms.",
          ],
        },
        {
          heading: "15. Governing Law",
          paragraphs: [
            "These Terms shall be governed by the applicable laws of the Federal Republic of Nigeria unless otherwise required by law.",
          ],
        },
        {
          heading: "16. Amendments",
          paragraphs: [
            "22 Logistics may update these Terms from time to time. Continued use of the platform constitutes acceptance of revised Terms.",
          ],
        },
      ]}
    />
  ),
});
