import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/site/PolicyPage";

export const Route = createFileRoute("/refund-policy")({
  head: () => ({
    meta: [
      { title: "Cancellation & Refund Policy - 22 Logistics" },
      {
        name: "description",
        content:
          "How ride schedules may be cancelled, rescheduled, and refunded through 22 Logistics.",
      },
    ],
  }),
  component: () => (
    <PolicyPage
      title="Cancellation & Refund Policy"
      intro="This policy explains how ride schedules may be cancelled, rescheduled, and refunded through the 22 Logistics website and mobile application."
      sections={[
        {
          heading: "1. Purpose",
          paragraphs: [
            "This policy explains how ride schedules may be cancelled, rescheduled, and refunded through the 22 Logistics website and mobile application.",
          ],
        },
        {
          heading: "2. Customer Cancellations",
          paragraphs: [
            "Customers may cancel a scheduled ride through the app, website, or by contacting 22 Logistics support.",
          ],
          bullets: [
            "More than 1 hour before the scheduled start time: Eligible for a full refund of any prepaid amount, subject to payment processor timelines.",
            "Within 1 hour of the scheduled start time: A cancellation fee may apply to cover operational costs.",
            "After a driver has been assigned and dispatched: Additional charges may apply depending on the circumstances.",
          ],
        },
        {
          heading: "3. Rescheduling",
          paragraphs: [
            "Customers may request to reschedule a ride instead of cancelling. Approval is subject to vehicle and driver availability.",
            "If the new schedule changes the ride category or requires additional services, revised pricing may apply.",
          ],
        },
        {
          heading: "4. Business Accounts",
          paragraphs: [
            "Corporate customers may modify or cancel scheduled rides through authorized administrators or delegates. Any charges will be applied in accordance with the company's billing arrangement.",
          ],
        },
        {
          heading: "5. Airport Schedules",
          paragraphs: [
            "Airport schedules should be cancelled as early as possible. If a driver has already been dispatched or is waiting at the airport, waiting or cancellation fees may apply.",
          ],
        },
        {
          heading: "6. Out-of-Town and Special Trips",
          paragraphs: [
            "Trips involving destinations outside standard service areas may have customized cancellation terms communicated at the time of scheduling.",
          ],
        },
        {
          heading: "7. Company Cancellations",
          paragraphs: ["22 Logistics reserves the right to cancel or reschedule rides due to:"],
          bullets: [
            "Vehicle breakdowns.",
            "Driver emergencies.",
            "Safety concerns.",
            "Severe weather.",
            "Road closures.",
            "Other operational circumstances beyond reasonable control.",
          ],
        },
        {
          heading: "8. Refund Processing",
          paragraphs: [
            "Approved refunds will be processed through the original payment method where feasible. Processing times may vary depending on banks and payment providers.",
          ],
        },
        {
          heading: "9. No-Show Policy",
          paragraphs: [
            "If a customer cannot be reached within the applicable waiting period after driver arrival, the ride may be treated as a no-show and applicable charges may be incurred.",
          ],
        },
        {
          heading: "10. Exceptional Circumstances",
          paragraphs: [
            "22 Logistics may exercise reasonable discretion to waive cancellation fees in genuine emergencies or other exceptional situations.",
          ],
        },
      ]}
    />
  ),
});
