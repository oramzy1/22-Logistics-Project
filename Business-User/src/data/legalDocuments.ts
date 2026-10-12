export type LegalBlock =
  | { kind: "paragraph"; text: string }
  | { kind: "subheading"; text: string }
  | { kind: "bullets"; items: string[] };

export type LegalSection = {
  heading?: string;
  blocks: LegalBlock[];
};

export type LegalDocument = {
  id: string;
  title: string;
  effectiveDate?: string;
  intro?: string;
  sections: LegalSection[];
};

export const LEGAL_DOCUMENTS: LegalDocument[] = [
  {
    id: "terms",
    title: "Terms & Conditions",
    effectiveDate: "1st, October, 2026",
    sections: [
      {
        heading: "1. Acceptance",
        blocks: [
          {
            kind: "paragraph",
            text: "By accessing or using the 22 Logistics website or mobile application, you agree to these Terms and Conditions.",
          },
        ],
      },
      {
        heading: "2. Nature of the Service",
        blocks: [
          {
            kind: "paragraph",
            text: "22 Logistics provides a mobility scheduling platform that enables customers to schedule transportation services, including fixed-duration rides, airport schedules, and approved out-of-town trips.",
          },
        ],
      },
      {
        heading: "3. Scheduling Requirements",
        blocks: [
          {
            kind: "bullets",
            items: [
              "Rides must generally be scheduled at least two (2) hours before the requested start time.",
              "Availability is subject to fleet capacity and operational constraints.",
              "Submission of a schedule request does not guarantee immediate driver assignment.",
            ],
          },
        ],
      },
      {
        heading: "4. Driver and Vehicle Assignment",
        blocks: [
          {
            kind: "paragraph",
            text: "Drivers and vehicles are assigned exclusively by 22 Logistics based on availability and operational considerations. Customers cannot select or directly assign drivers unless expressly offered by the platform.",
          },
        ],
      },
      {
        heading: "5. Fixed Pricing",
        blocks: [
          {
            kind: "paragraph",
            text: "Certain services, including 3-hour, 6-hour, full-day schedules, airport schedules, and designated out-of-town routes, may be offered at fixed prices published within the app or website.",
          },
        ],
      },
      {
        heading: "6. Airport Services",
        blocks: [
          {
            kind: "paragraph",
            text: "Standalone airport schedules include fueling within the published fixed fare unless otherwise stated. Airport add-ons attached to existing duration-based schedules may be subject to separate pricing rules.",
          },
        ],
      },
      {
        heading: "7. Additional Charges",
        blocks: [
          { kind: "paragraph", text: "Additional fees may apply for:" },
          {
            kind: "bullets",
            items: [
              "Travel outside designated service areas.",
              "Extended waiting beyond included allowances.",
              "Customer-requested changes after confirmation.",
              "Damage caused by passengers.",
              "Cleaning fees where reasonably required.",
            ],
          },
          {
            kind: "paragraph",
            text: "Any applicable charges will be communicated where practicable.",
          },
        ],
      },
      {
        heading: "8. Customer Responsibilities",
        blocks: [
          { kind: "paragraph", text: "Customers agree to:" },
          {
            kind: "bullets",
            items: [
              "Provide accurate scheduling information.",
              "Be available at the agreed pickup location.",
              "Treat drivers and vehicles respectfully.",
              "Comply with applicable laws and safety requirements.",
            ],
          },
        ],
      },
      {
        heading: "9. Business Accounts and Delegates",
        blocks: [
          {
            kind: "paragraph",
            text: "Business administrators are responsible for activities performed by authorized delegates using their organization’s account.",
          },
        ],
      },
      {
        heading: "10. Cancellations and Changes",
        blocks: [
          {
            kind: "paragraph",
            text: "Cancellation, modification, refund, and rescheduling policies may vary depending on timing and service type. Applicable rules will be communicated through the platform.",
          },
        ],
      },
      {
        heading: "11. Service Availability",
        blocks: [
          {
            kind: "paragraph",
            text: "22 Logistics reserves the right to decline, postpone, or cancel schedules where operational, safety, legal, or unforeseen circumstances make fulfillment impractical.",
          },
        ],
      },
      {
        heading: "12. Limitation of Liability",
        blocks: [
          {
            kind: "paragraph",
            text: "To the maximum extent permitted by law, 22 Logistics shall not be liable for indirect, incidental, consequential, or special damages arising from use of the platform or transportation services.",
          },
        ],
      },
      {
        heading: "13. Intellectual Property",
        blocks: [
          {
            kind: "paragraph",
            text: "All trademarks, branding, software, designs, text, and content associated with 22 Logistics remain the property of 22 Logistics or its licensors.",
          },
        ],
      },
      {
        heading: "14. Suspension or Termination",
        blocks: [
          {
            kind: "paragraph",
            text: "Accounts may be suspended or terminated for fraud, abuse, illegal activity, misuse of the platform, or violation of these Terms.",
          },
        ],
      },
      {
        heading: "15. Governing Law",
        blocks: [
          {
            kind: "paragraph",
            text: "These Terms shall be governed by the applicable laws of the Federal Republic of Nigeria unless otherwise required by law.",
          },
        ],
      },
      {
        heading: "16. Amendments",
        blocks: [
          {
            kind: "paragraph",
            text: "22 Logistics may update these Terms from time to time. Continued use of the platform constitutes acceptance of revised Terms.",
          },
        ],
      },
    ],
  },
  {
    id: "privacy",
    title: "Privacy Policy",
    effectiveDate: "1st, October, 2026",
    sections: [
      {
        heading: "1. Introduction",
        blocks: [
          {
            kind: "paragraph",
            text: "22 Logistics (“we”, “our”, or “us”) is committed to protecting the privacy of users of our mobile application, website, and related services. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.",
          },
        ],
      },
      {
        heading: "2. Information We Collect",
        blocks: [
          { kind: "paragraph", text: "We may collect:" },
          {
            kind: "bullets",
            items: [
              "Name, phone number, email address, and profile information.",
              "Pickup locations, destinations, scheduled stops, and ride preferences.",
              "Business account information, including company name and authorized delegates.",
              "Payment-related information processed through approved third-party payment providers.",
              "Device information, IP address, operating system, and app usage analytics.",
              "GPS location data while using our services where permission has been granted.",
              "Customer support communications and feedback.",
            ],
          },
        ],
      },
      {
        heading: "3. How We Use Your Information",
        blocks: [
          { kind: "paragraph", text: "We use collected information to:" },
          {
            kind: "bullets",
            items: [
              "Create and manage user accounts.",
              "Schedule and manage transportation services.",
              "Assign drivers and vehicles.",
              "Process payments and generate invoices.",
              "Communicate ride updates and customer support messages.",
              "Improve our services, security, and user experience.",
              "Detect fraud or unauthorized activity.",
              "Comply with legal and regulatory obligations.",
            ],
          },
        ],
      },
      {
        heading: "4. Location Information",
        blocks: [
          { kind: "paragraph", text: "Location information may be used to:" },
          {
            kind: "bullets",
            items: [
              "Determine pickup and destination points.",
              "Support driver navigation.",
              "Verify service availability.",
              "Calculate applicable service area charges.",
              "Improve operational efficiency and safety.",
            ],
          },
        ],
      },
      {
        heading: "5. Business Accounts",
        blocks: [
          {
            kind: "paragraph",
            text: "Business customers may authorize delegates to schedule rides. The business administrator is responsible for managing delegate permissions and ensuring authorized use.",
          },
        ],
      },
      {
        heading: "6. Sharing of Information",
        blocks: [
          { kind: "paragraph", text: "We may share information with:" },
          {
            kind: "bullets",
            items: [
              "Assigned drivers for the purpose of completing scheduled rides.",
              "Payment processors and financial service providers.",
              "Technology vendors supporting our platform.",
              "Government authorities where legally required.",
              "Professional advisers or successors in connection with a business transaction.",
            ],
          },
          {
            kind: "paragraph",
            text: "We do not sell personal information to third parties.",
          },
        ],
      },
      {
        heading: "7. Data Security",
        blocks: [
          {
            kind: "paragraph",
            text: "We implement reasonable technical and organizational safeguards to protect personal information from unauthorized access, alteration, disclosure, or destruction. However, no electronic system is completely secure.",
          },
        ],
      },
      {
        heading: "8. Data Retention",
        blocks: [
          {
            kind: "paragraph",
            text: "Information is retained only for as long as necessary to provide services, maintain business records, resolve disputes, comply with legal obligations, and enforce agreements.",
          },
        ],
      },
      {
        heading: "9. User Rights",
        blocks: [
          {
            kind: "paragraph",
            text: "Subject to applicable law, users may request to:",
          },
          {
            kind: "bullets",
            items: [
              "Access their information.",
              "Correct inaccurate information.",
              "Update account details.",
              "Delete eligible account information.",
              "Withdraw certain permissions where technically feasible.",
            ],
          },
        ],
      },
      {
        heading: "10. Cookies and Analytics",
        blocks: [
          {
            kind: "paragraph",
            text: "Our website may use cookies and similar technologies to improve functionality, understand usage patterns, and enhance performance.",
          },
        ],
      },
      {
        heading: "11. Children’s Privacy",
        blocks: [
          {
            kind: "paragraph",
            text: "Our services are not intended for individuals below the minimum age permitted under applicable law without appropriate parental or guardian authorization.",
          },
        ],
      },
      {
        heading: "12. Changes to this Policy",
        blocks: [
          {
            kind: "paragraph",
            text: "We may revise this Privacy Policy periodically. Updated versions become effective upon publication.",
          },
        ],
      },
      {
        heading: "13. Contact",
        blocks: [
          {
            kind: "paragraph",
            text: "Questions regarding this Privacy Policy may be directed to 22 Logistics through our official customer support channels.",
          },
        ],
      },
    ],
  },
  {
    id: "platform-use",
    title: "Platform Use Policy",
    effectiveDate: "1st, October, 2026",
    sections: [
      {
        heading: "1. Purpose",
        blocks: [
          {
            kind: "paragraph",
            text: "This Policy governs acceptable use of the 22 Logistics website and mobile application by customers, business users, delegates, and visitors.",
          },
        ],
      },
      {
        heading: "2. Service Coverage",
        blocks: [
          {
            kind: "paragraph",
            text: "22 Logistics operates within approved service areas and designated routes. Travel outside standard service zones may incur additional charges or require operational approval.",
          },
        ],
      },
      {
        heading: "3. Scheduling Philosophy",
        blocks: [
          {
            kind: "paragraph",
            text: "The platform is designed primarily for advance scheduling rather than on-demand transportation. Customers should schedule rides in accordance with published notice requirements and operating hours.",
          },
        ],
      },
      {
        heading: "4. Operating Hours",
        blocks: [
          {
            kind: "paragraph",
            text: "Service availability, scheduling windows, and ride durations are determined by 22 Logistics and may change periodically. Some ride types may have latest permissible start times to ensure completion within operating hours.",
          },
        ],
      },
      {
        heading: "5. Account Security",
        blocks: [
          {
            kind: "paragraph",
            text: "Users are responsible for safeguarding login credentials and must promptly notify 22 Logistics of unauthorized account access.",
          },
        ],
      },
      {
        heading: "6. Prohibited Conduct",
        blocks: [
          { kind: "paragraph", text: "Users must not:" },
          {
            kind: "bullets",
            items: [
              "Provide false identity or booking information.",
              "Interfere with platform security.",
              "Attempt unauthorized access to systems or accounts.",
              "Use the platform for unlawful purposes.",
              "Harass drivers, staff, or other users.",
              "Misrepresent destinations or intentionally conceal trip details.",
            ],
          },
        ],
      },
      {
        heading: "7. Multi-Stop and Destination Accuracy",
        blocks: [
          {
            kind: "paragraph",
            text: "Customers should accurately disclose planned stops and destinations during scheduling. Failure to do so may result in additional charges, operational changes, or cancellation where appropriate.",
          },
        ],
      },
      {
        heading: "8. Business Delegates",
        blocks: [
          {
            kind: "paragraph",
            text: "Organizations remain responsible for activities carried out by authorized delegates using corporate accounts.",
          },
        ],
      },
      {
        heading: "9. Communications",
        blocks: [
          {
            kind: "paragraph",
            text: "By using the platform, users consent to receiving service-related communications such as confirmations, assignment notifications, receipts, security alerts, and support messages.",
          },
        ],
      },
      {
        heading: "10. Maintenance and Interruptions",
        blocks: [
          {
            kind: "paragraph",
            text: "The website and application may occasionally be unavailable due to maintenance, upgrades, or circumstances beyond our control.",
          },
        ],
      },
      {
        heading: "11. Feedback",
        blocks: [
          {
            kind: "paragraph",
            text: "Suggestions and feedback submitted to 22 Logistics may be used to improve services without creating any obligation to compensate the contributor.",
          },
        ],
      },
      {
        heading: "12. Enforcement",
        blocks: [
          {
            kind: "paragraph",
            text: "Violations of this Policy may result in warnings, temporary suspension, permanent account closure, refusal of future service, or legal action where appropriate.",
          },
        ],
      },
      {
        heading: "13. Contact",
        blocks: [
          {
            kind: "paragraph",
            text: "Questions regarding this Policy should be directed to 22 Logistics through its official customer support channels or website contact information.",
          },
        ],
      },
    ],
  },
  {
    id: "cancellation-refund",
    title: "Cancellation & Refund Policy",
    effectiveDate: "1st, October, 2026",
    sections: [
      {
        heading: "1. Purpose",
        blocks: [
          {
            kind: "paragraph",
            text: "This policy explains how ride schedules may be cancelled, rescheduled, and refunded through the 22 Logistics website and mobile application.",
          },
        ],
      },
      {
        heading: "2. Customer Cancellations",
        blocks: [
          {
            kind: "paragraph",
            text: "Customers may cancel a scheduled ride through the app, website, or by contacting 22 Logistics support.",
          },
          { kind: "subheading", text: "Cancellation Windows" },
          {
            kind: "bullets",
            items: [
              "More than 1 hour before the scheduled start time: Eligible for a full refund of any prepaid amount, subject to payment processor timelines.",
              "Within 1 hour of the scheduled start time: A cancellation fee may apply to cover operational costs.",
              "After a driver has been assigned and dispatched: Additional charges may apply depending on the circumstances.",
            ],
          },
        ],
      },
      {
        heading: "3. Rescheduling",
        blocks: [
          {
            kind: "paragraph",
            text: "Customers may request to reschedule a ride instead of cancelling. Approval is subject to vehicle and driver availability.",
          },
          {
            kind: "paragraph",
            text: "If the new schedule changes the ride category or requires additional services, revised pricing may apply.",
          },
        ],
      },
      {
        heading: "4. Business Accounts",
        blocks: [
          {
            kind: "paragraph",
            text: "Corporate customers may modify or cancel scheduled rides through authorized administrators or delegates. Any charges will be applied in accordance with the company’s billing arrangement.",
          },
        ],
      },
      {
        heading: "5. Airport Schedules",
        blocks: [
          {
            kind: "paragraph",
            text: "Airport schedules should be cancelled as early as possible. If a driver has already been dispatched or is waiting at the airport, waiting or cancellation fees may apply.",
          },
        ],
      },
      {
        heading: "6. Out-of-Town and Special Trips",
        blocks: [
          {
            kind: "paragraph",
            text: "Trips involving destinations outside standard service areas may have customized cancellation terms communicated at the time of scheduling.",
          },
        ],
      },
      {
        heading: "7. Company Cancellations",
        blocks: [
          {
            kind: "paragraph",
            text: "22 Logistics reserves the right to cancel or reschedule rides due to:",
          },
          {
            kind: "bullets",
            items: [
              "Vehicle breakdowns.",
              "Driver emergencies.",
              "Safety concerns.",
              "Severe weather.",
              "Road closures.",
              "Other operational circumstances beyond reasonable control.",
            ],
          },
          {
            kind: "paragraph",
            text: "Where possible, an alternative vehicle or revised schedule will be offered.",
          },
        ],
      },
      {
        heading: "8. Refund Processing",
        blocks: [
          {
            kind: "paragraph",
            text: "Approved refunds will be processed through the original payment method where feasible. Processing times may vary depending on banks and payment providers.",
          },
        ],
      },
      {
        heading: "9. No-Show Policy",
        blocks: [
          {
            kind: "paragraph",
            text: "If a customer cannot be reached within the applicable waiting period after driver arrival, the ride may be treated as a no-show and applicable charges may be incurred.",
          },
        ],
      },
      {
        heading: "10. Exceptional Circumstances",
        blocks: [
          {
            kind: "paragraph",
            text: "22 Logistics may exercise reasonable discretion to waive cancellation fees in genuine emergencies or other exceptional situations.",
          },
        ],
      },
    ],
  },
  {
    id: "business-account",
    title: "Business Account Agreement",
    effectiveDate: "1st, October, 2026",
    sections: [
      {
        heading: "1. Scope",
        blocks: [
          {
            kind: "paragraph",
            text: "This Agreement governs organizations using 22 Logistics for employee, executive, guest, or operational transportation.",
          },
        ],
      },
      {
        heading: "2. Account Administration",
        blocks: [
          {
            kind: "paragraph",
            text: "Each business account must designate at least one authorized administrator responsible for:",
          },
          {
            kind: "bullets",
            items: [
              "Managing delegates.",
              "Reviewing ride activity.",
              "Monitoring invoices.",
              "Maintaining accurate company information.",
            ],
          },
        ],
      },
      {
        heading: "3. Delegates",
        blocks: [
          {
            kind: "paragraph",
            text: "Authorized delegates may schedule rides within the permissions assigned by the business administrator. The organization accepts responsibility for rides scheduled by approved delegates.",
          },
        ],
      },
      {
        heading: "4. Billing",
        blocks: [
          {
            kind: "paragraph",
            text: "Businesses may choose approved payment arrangements, including pay-per-schedule or consolidated invoicing where offered by 22 Logistics.",
          },
          {
            kind: "paragraph",
            text: "Invoices should be settled within the agreed payment period.",
          },
        ],
      },
      {
        heading: "5. Scheduling Rules",
        blocks: [
          {
            kind: "paragraph",
            text: "Business users remain subject to platform scheduling requirements, including minimum advance notice, service hours, and vehicle availability.",
          },
        ],
      },
      {
        heading: "6. Driver Assignment",
        blocks: [
          {
            kind: "paragraph",
            text: "Driver and vehicle allocation remains solely at the discretion of 22 Logistics to ensure safe and efficient fleet operations.",
          },
        ],
      },
      {
        heading: "7. Compliance",
        blocks: [
          {
            kind: "paragraph",
            text: "The organization agrees not to misuse the platform or authorize fraudulent, unlawful, or misleading scheduling activity.",
          },
        ],
      },
      {
        heading: "8. Reports",
        blocks: [
          {
            kind: "paragraph",
            text: "Business customers may receive ride summaries, invoices, and usage reports through the platform or designated communication channels.",
          },
        ],
      },
      {
        heading: "9. Confidentiality",
        blocks: [
          {
            kind: "paragraph",
            text: "Both parties should maintain appropriate confidentiality regarding commercially sensitive information shared during the course of the relationship.",
          },
        ],
      },
      {
        heading: "10. Suspension",
        blocks: [
          {
            kind: "paragraph",
            text: "22 Logistics may suspend or terminate a business account for material breaches of this Agreement, fraudulent conduct, persistent non-payment, or unlawful activity.",
          },
        ],
      },
      {
        heading: "11. Amendments",
        blocks: [
          {
            kind: "paragraph",
            text: "Operational procedures and service offerings may evolve over time. Continued use of the account after notice of updates constitutes acceptance of revised terms.",
          },
        ],
      },
    ],
  },
  {
    id: "customer-scheduling",
    title: "Customer Scheduling Policy",
    intro:
      "22 Logistics is a premium mobility scheduling platform designed to help individuals and businesses plan their transportation with confidence. To ensure reliable service and efficient fleet management, all transportation requests are managed through an advance scheduling process.",
    sections: [
      {
        heading: "Advance Scheduling",
        blocks: [
          {
            kind: "paragraph",
            text: "Customers are encouraged to schedule rides as early as possible.",
          },
          {
            kind: "paragraph",
            text: "As a general operating rule, schedules should be submitted at least two (2) hours before the intended pickup time. Earlier scheduling increases the likelihood of securing the preferred date and time.",
          },
        ],
      },
      {
        heading: "Operating Hours",
        blocks: [
          {
            kind: "bullets",
            items: [
              "First scheduled ride: 7:00 AM",
              "Final scheduled ride must conclude by 10:00 PM",
            ],
          },
          { kind: "paragraph", text: "Accordingly:" },
          {
            kind: "bullets",
            items: [
              "The latest start time for a 3-hour schedule is 7:00 PM.",
              "The latest start time for a 6-hour schedule is 4:00 PM.",
              "The latest start time for a 10-hour full-day schedule is 12:00 PM.",
            ],
          },
          {
            kind: "paragraph",
            text: "The platform may restrict time selections that fall outside these operating limits.",
          },
        ],
      },
      {
        heading: "Driver Assignment",
        blocks: [
          {
            kind: "paragraph",
            text: "To maintain consistent service quality and optimize fleet utilization, drivers and vehicles are assigned exclusively by the 22 Logistics operations team after a schedule is submitted.",
          },
          { kind: "paragraph", text: "Assignment decisions may consider:" },
          {
            kind: "bullets",
            items: [
              "Vehicle availability.",
              "Driver availability.",
              "Existing commitments.",
              "Operational requirements.",
              "Service quality standards.",
            ],
          },
        ],
      },
      {
        heading: "Schedule Accuracy",
        blocks: [
          {
            kind: "paragraph",
            text: "Customers should provide complete and accurate information when creating a schedule, including:",
          },
          {
            kind: "bullets",
            items: [
              "Pickup location.",
              "Destination.",
              "Planned intermediate stops.",
              "Airport requirements where applicable.",
              "Contact details.",
            ],
          },
          {
            kind: "paragraph",
            text: "Incomplete or inaccurate information may affect pricing, assignment, or service availability.",
          },
        ],
      },
      {
        heading: "Modifications",
        blocks: [
          {
            kind: "paragraph",
            text: "Customers may request changes before the scheduled start time. Modifications remain subject to operational feasibility and vehicle availability.",
          },
        ],
      },
      {
        heading: "Service Availability",
        blocks: [
          {
            kind: "paragraph",
            text: "While 22 Logistics strives to fulfill every valid request, scheduling remains subject to fleet capacity and operational considerations.",
          },
        ],
      },
    ],
  },
  {
    id: "service-area-pricing",
    title: "Service Area & Pricing Disclosure",
    sections: [
      {
        heading: "Fixed-Rate Scheduling",
        blocks: [
          {
            kind: "paragraph",
            text: "The following services are offered at published fixed rates displayed within the application and website:",
          },
          {
            kind: "bullets",
            items: [
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
            kind: "paragraph",
            text: "Applicable rates are shown to customers before confirmation.",
          },
        ],
      },
      {
        heading: "Airport Services",
        blocks: [
          {
            kind: "paragraph",
            text: "Standalone airport schedules are priced on a fixed-rate basis, with fueling included in the published fare unless otherwise indicated.",
          },
          {
            kind: "paragraph",
            text: "Customers who have already scheduled a 3-hour, 6-hour, or full-day service may request an airport add-on. In such cases:",
          },
          {
            kind: "bullets",
            items: [
              "An airport add-on fee may apply.",
              "Fueling arrangements for the original scheduled service remain unchanged.",
              "Approval may be subject to operational feasibility.",
            ],
          },
        ],
      },
      {
        heading: "Planned Stops",
        blocks: [
          {
            kind: "paragraph",
            text: "Customers are encouraged to include all expected stops when creating a schedule.",
          },
          {
            kind: "paragraph",
            text: "Providing complete itinerary information enables:",
          },
          {
            kind: "bullets",
            items: [
              "Accurate pricing.",
              "Better vehicle allocation.",
              "Improved operational planning.",
              "Advance notification of any applicable additional charges.",
            ],
          },
        ],
      },
      {
        heading: "Standard Service Area",
        blocks: [
          {
            kind: "paragraph",
            text: "Standard pricing generally applies to travel within:",
          },
          {
            kind: "bullets",
            items: [
              "Port Harcourt Local Government Area.",
              "Obio/Akpor Local Government Area.",
            ],
          },
        ],
      },
      {
        heading: "Additional Charges Outside Standard Areas",
        blocks: [
          {
            kind: "paragraph",
            text: "Where a scheduled route or any disclosed stop extends beyond the standard service area, additional charges may apply.",
          },
          {
            kind: "paragraph",
            text: "The application will seek to notify customers of such charges before confirmation whenever possible.",
          },
        ],
      },
      {
        heading: "Out-of-Port Harcourt Destinations",
        blocks: [
          {
            kind: "paragraph",
            text: "Certain destinations outside the standard service area may be available as predefined fixed-price routes through the application. These destinations and applicable rates may be updated periodically.",
          },
        ],
      },
      {
        heading: "Transparency Commitment",
        blocks: [
          {
            kind: "paragraph",
            text: "22 Logistics is committed to communicating pricing clearly and making customers aware of applicable charges before a schedule is finalized whenever reasonably practicable.",
          },
        ],
      },
    ],
  },
  {
    id: "service-charter",
    title: "Service Charter",
    intro:
      "At 22 Logistics, we believe transportation should be planned with confidence, delivered with professionalism, and executed with excellence. Our mission is to provide a premium mobility scheduling experience that values your time, safety, and peace of mind.",
    sections: [
      {
        heading: "1. We Put Your Schedule First",
        blocks: [
          {
            kind: "paragraph",
            text: "Our platform is designed for advance scheduling, helping you plan your day with confidence. Whether it’s a business meeting, airport transfer, or multiple-stop itinerary, we are committed to supporting your plans with dependable service.",
          },
        ],
      },
      {
        heading: "2. Transparent Pricing",
        blocks: [
          {
            kind: "paragraph",
            text: "We are committed to clear and predictable pricing.",
          },
          {
            kind: "bullets",
            items: [
              "Fixed-duration schedules (such as 3-hour, 6-hour, and full-day services) are offered at published rates.",
              "Airport schedules and designated out-of-town routes are also provided at clearly communicated prices where applicable.",
              "Any additional charges, including travel outside our standard service areas, will be disclosed before confirmation whenever reasonably possible.",
            ],
          },
        ],
      },
      {
        heading: "3. Professional Driver Assignment",
        blocks: [
          {
            kind: "paragraph",
            text: "To maintain service quality and efficient fleet management, drivers and vehicles are assigned by our operations team based on availability and operational needs. This approach helps us deliver reliable service across all scheduled trips.",
          },
        ],
      },
      {
        heading: "4. Safety and Respect",
        blocks: [
          { kind: "paragraph", text: "We strive to provide:" },
          {
            kind: "bullets",
            items: [
              "Professionally presented drivers.",
              "Well-maintained vehicles.",
              "Courteous and respectful interactions.",
              "Compliance with applicable road safety requirements.",
            ],
          },
          {
            kind: "paragraph",
            text: "We also expect our customers to treat our drivers and staff with the same respect.",
          },
        ],
      },
      {
        heading: "5. Reliability",
        blocks: [
          {
            kind: "paragraph",
            text: "Our goal is to ensure every scheduled ride is managed with care and attention. While unforeseen events may occasionally affect operations, we will communicate promptly and work to provide suitable alternatives whenever possible.",
          },
        ],
      },
      {
        heading: "6. Airport Excellence",
        blocks: [
          {
            kind: "paragraph",
            text: "Our airport scheduling services are designed to make travel simpler and more convenient, with dedicated booking options and clear pricing structures to support timely arrivals and departures.",
          },
        ],
      },
      {
        heading: "7. Business Mobility Solutions",
        blocks: [
          {
            kind: "paragraph",
            text: "We support organizations with features such as:",
          },
          {
            kind: "bullets",
            items: [
              "Delegate scheduling.",
              "Corporate accounts.",
              "Consolidated reporting.",
              "Professional invoicing.",
              "Centralized ride management.",
            ],
          },
        ],
      },
      {
        heading: "8. Clear Communication",
        blocks: [
          {
            kind: "paragraph",
            text: "From schedule confirmation to driver assignment and ride completion, we aim to keep customers informed through timely notifications and responsive support channels.",
          },
        ],
      },
      {
        heading: "9. Privacy and Confidentiality",
        blocks: [
          {
            kind: "paragraph",
            text: "We respect the confidentiality of our customers’ information and handle personal data in accordance with our Privacy Policy and applicable legal requirements.",
          },
        ],
      },
      {
        heading: "10. Continuous Improvement",
        blocks: [
          {
            kind: "paragraph",
            text: "We value feedback and regularly review our operations, technology, and customer experience to improve our services and maintain the high standards expected of 22 Logistics.",
          },
        ],
      },
      {
        heading: "Our Commitment",
        blocks: [
          {
            kind: "paragraph",
            text: "When you choose 22 Logistics, you are choosing a partner committed to professionalism, planning, and premium mobility solutions. We are dedicated to helping individuals, families, and businesses move with confidence—one schedule at a time.",
          },
        ],
      },
    ],
  },
  {
    id: "bill-of-rights",
    title: "Customer Bill of Rights",
    intro:
      "At 22 Logistics, every customer deserves a professional, transparent, and dependable experience. When you use our platform, you can expect the following:",
    sections: [
      {
        heading: "1. The Right to Transparent Pricing",
        blocks: [
          {
            kind: "paragraph",
            text: "You have the right to know the applicable price for your selected schedule before confirming your request, including any disclosed additional charges for airport services, out-of-service-area travel, or optional add-ons.",
          },
        ],
      },
      {
        heading: "2. The Right to Respectful Service",
        blocks: [
          {
            kind: "paragraph",
            text: "You will be treated with courtesy, professionalism, and dignity by our drivers and support team.",
          },
        ],
      },
      {
        heading: "3. The Right to Safe Transportation",
        blocks: [
          {
            kind: "paragraph",
            text: "We strive to provide qualified drivers and properly maintained vehicles suitable for the services we offer.",
          },
        ],
      },
      {
        heading: "4. The Right to Clear Communication",
        blocks: [
          {
            kind: "paragraph",
            text: "You have the right to receive timely updates regarding your schedule, driver assignment, operational changes, and completed trips.",
          },
        ],
      },
      {
        heading: "5. The Right to Privacy",
        blocks: [
          {
            kind: "paragraph",
            text: "Your personal information and trip details will be handled responsibly and in accordance with our Privacy Policy.",
          },
        ],
      },
      {
        heading: "6. The Right to Accurate Information",
        blocks: [
          {
            kind: "paragraph",
            text: "You have the right to receive accurate receipts, invoices, and summaries for completed schedules and payments.",
          },
        ],
      },
      {
        heading: "7. The Right to Honest Scheduling Expectations",
        blocks: [
          {
            kind: "paragraph",
            text: "We will communicate service availability, scheduling requirements, operating hours, and any operational limitations as clearly as reasonably possible.",
          },
        ],
      },
      {
        heading: "8. The Right to Raise Concerns",
        blocks: [
          {
            kind: "paragraph",
            text: "You may report complaints, provide feedback, or request assistance through our official support channels. We are committed to reviewing concerns fairly and professionally.",
          },
        ],
      },
      {
        heading: "9. The Right to Equal Treatment",
        blocks: [
          {
            kind: "paragraph",
            text: "We aim to provide our services fairly and without unlawful discrimination.",
          },
        ],
      },
      {
        heading: "10. The Right to Continuous Improvement",
        blocks: [
          {
            kind: "paragraph",
            text: "Your feedback helps us improve our technology, operations, and customer experience, and we encourage you to share suggestions with us.",
          },
        ],
      },
    ],
  },
  {
    id: "corporate-handbook",
    title: "Corporate Account Handbook",
    intro:
      "A 22 Logistics Corporate Account is designed for organizations that require reliable, scheduled transportation for executives, employees, clients, and guests.",
    sections: [
      {
        heading: "Business Dashboard Features",
        blocks: [
          { kind: "paragraph", text: "Your organization can:" },
          {
            kind: "bullets",
            items: [
              "Schedule fixed-duration rides.",
              "Arrange airport transfers.",
              "Manage authorized delegates.",
              "Review ride history.",
              "Access consolidated invoices and reports.",
            ],
          },
        ],
      },
      {
        heading: "Delegate Management",
        blocks: [
          {
            kind: "paragraph",
            text: "Corporate administrators may authorize delegates to schedule transportation on behalf of the organization.",
          },
          { kind: "paragraph", text: "Recommended permission levels include:" },
          {
            kind: "bullets",
            items: [
              "Book for self.",
              "Book for designated colleagues.",
              "Full scheduling privileges.",
              "Reporting-only access.",
            ],
          },
          {
            kind: "paragraph",
            text: "Administrators should regularly review delegate access and remove permissions that are no longer required.",
          },
        ],
      },
      {
        heading: "Scheduling",
        blocks: [
          { kind: "paragraph", text: "When creating a schedule:" },
          {
            kind: "bullets",
            items: [
              "Select the service type.",
              "Choose the preferred date and time.",
              "Enter pickup location.",
              "Add planned stops where applicable.",
              "Confirm destination details.",
              "Review pricing and submit.",
            ],
          },
          {
            kind: "paragraph",
            text: "Driver and vehicle assignments are managed by the 22 Logistics operations team.",
          },
        ],
      },
      {
        heading: "Airport Services",
        blocks: [
          { kind: "paragraph", text: "Corporate users may schedule:" },
          {
            kind: "bullets",
            items: [
              "Airport pickups.",
              "Airport drop-offs.",
              "Airport pickup and drop-off combinations.",
            ],
          },
          {
            kind: "paragraph",
            text: "Airport services follow the pricing structure communicated through the platform.",
          },
        ],
      },
      {
        heading: "Multiple Stops",
        blocks: [
          {
            kind: "paragraph",
            text: "To improve planning and pricing accuracy, organizations should disclose planned stops during scheduling. Additional charges may apply where travel extends beyond standard service areas.",
          },
        ],
      },
      {
        heading: "Billing",
        blocks: [
          {
            kind: "paragraph",
            text: "Depending on the agreed arrangement, invoices may be generated:",
          },
          {
            kind: "bullets",
            items: ["Per schedule.", "Weekly.", "Monthly."],
          },
          {
            kind: "paragraph",
            text: "Organizations should verify invoice details promptly and notify 22 Logistics of any questions.",
          },
        ],
      },
      {
        heading: "Reporting",
        blocks: [
          {
            kind: "paragraph",
            text: "Authorized users may access ride information including:",
          },
          {
            kind: "bullets",
            items: [
              "Dates and times.",
              "Assigned travellers.",
              "Schedule categories.",
              "Pickup and destination details.",
              "Billing summaries.",
            ],
          },
        ],
      },
      {
        heading: "Best Practices",
        blocks: [
          { kind: "paragraph", text: "To ensure the best experience:" },
          {
            kind: "bullets",
            items: [
              "Schedule rides as early as practical.",
              "Keep delegate information current.",
              "Provide accurate pickup instructions.",
              "Include planned stops during booking.",
              "Notify 22 Logistics promptly if plans change.",
            ],
          },
        ],
      },
      {
        heading: "Support",
        blocks: [
          {
            kind: "paragraph",
            text: "For operational assistance, account updates, or billing enquiries, please contact 22 Logistics through your designated support channels or account representative.",
          },
        ],
      },
    ],
  },
  {
    id: "how-it-works",
    title: "How It Works",
    intro:
      "Plan Your Journey. We’ll Handle the Rest. 22 Logistics is a premium mobility scheduling platform designed for individuals, families, professionals, and businesses who value reliability and convenience.",
    sections: [
      {
        heading: "Step 1: Choose Your Service",
        blocks: [
          {
            kind: "paragraph",
            text: "Select the schedule that best suits your needs:",
          },
          {
            kind: "bullets",
            items: [
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
            kind: "paragraph",
            text: "All eligible services display transparent fixed pricing before confirmation.",
          },
        ],
      },
      {
        heading: "Step 2: Enter Your Itinerary",
        blocks: [
          { kind: "paragraph", text: "Provide your:" },
          {
            kind: "bullets",
            items: [
              "Pickup location",
              "Date and preferred start time",
              "Destination",
              "Planned stops along the way",
            ],
          },
          {
            kind: "paragraph",
            text: "Including all planned stops helps us prepare the most accurate pricing and service plan for your journey.",
          },
        ],
      },
      {
        heading: "Step 3: Review Your Schedule",
        blocks: [
          { kind: "paragraph", text: "Before submitting, review:" },
          {
            kind: "bullets",
            items: [
              "Your selected service",
              "Pickup and destination details",
              "Planned stops",
              "Any applicable additional charges",
              "Total amount payable",
            ],
          },
        ],
      },
      {
        heading: "Step 4: Submit Your Schedule",
        blocks: [
          {
            kind: "paragraph",
            text: "Once confirmed, your request is sent to our operations team for processing.",
          },
        ],
      },
      {
        heading: "Step 5: Driver & Vehicle Assignment",
        blocks: [
          {
            kind: "paragraph",
            text: "To ensure quality and efficient fleet management, 22 Logistics assigns the most suitable driver and vehicle based on availability and operational requirements.",
          },
          {
            kind: "paragraph",
            text: "You’ll receive a notification once your assignment is confirmed.",
          },
        ],
      },
      {
        heading: "Step 6: Enjoy Your Ride",
        blocks: [
          {
            kind: "paragraph",
            text: "Your professional driver will arrive at the scheduled pickup point, ready to provide a smooth and dependable experience.",
          },
          {
            kind: "paragraph",
            text: "For business users, ride records and reporting remain available through your corporate account dashboard.",
          },
        ],
      },
      {
        heading: "Important Notes",
        blocks: [
          {
            kind: "bullets",
            items: [
              "Please schedule rides at least 2 hours in advance whenever possible.",
              "Standard operating hours begin with a 7:00 AM first ride, and all scheduled services are designed to conclude by 10:00 PM.",
              "Travel outside Port Harcourt LGA or Obio/Akpor LGA may attract additional charges.",
              "Standalone airport schedules include fueling in the published fare. Airport add-ons to an existing duration-based schedule may follow different pricing rules as displayed in the app.",
            ],
          },
        ],
      },
    ],
  },
];

export const getLegalDocument = (id?: string): LegalDocument => {
  const found = LEGAL_DOCUMENTS.find((doc) => doc.id === id);
  return found ?? LEGAL_DOCUMENTS[0];
};
