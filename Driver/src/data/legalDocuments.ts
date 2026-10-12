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
          { kind: "paragraph", text: "We are committed to clear and predictable pricing." },
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
          { kind: "paragraph", text: "We support organizations with features such as:" },
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
    id: "driver-conduct",
    title: "Driver Code of Conduct & Terms",
    effectiveDate: "1st, October, 2026",
    sections: [
      {
        heading: "1. Professional Standards",
        blocks: [
          {
            kind: "paragraph",
            text: "Drivers represent the 22 Logistics brand and are expected to demonstrate professionalism, courtesy, punctuality, and integrity at all times.",
          },
        ],
      },
      {
        heading: "2. Attendance",
        blocks: [
          {
            kind: "paragraph",
            text: "Drivers must report for duty at scheduled times and remain available for assignments unless approved otherwise.",
          },
        ],
      },
      {
        heading: "3. Assignment Procedure",
        blocks: [
          {
            kind: "paragraph",
            text: "Drivers may only undertake rides assigned through the official dispatch process. Accepting unauthorized trips while representing 22 Logistics is prohibited.",
          },
        ],
      },
      {
        heading: "4. Vehicle Care",
        blocks: [
          {
            kind: "paragraph",
            text: "Drivers must conduct reasonable pre-trip inspections and promptly report maintenance concerns or safety issues.",
          },
        ],
      },
      {
        heading: "5. Customer Service",
        blocks: [
          { kind: "paragraph", text: "Drivers should:" },
          {
            kind: "bullets",
            items: [
              "Arrive on time.",
              "Dress appropriately.",
              "Maintain clean vehicles.",
              "Communicate respectfully.",
              "Follow lawful customer instructions where safe to do so.",
            ],
          },
        ],
      },
      {
        heading: "6. Safety",
        blocks: [
          {
            kind: "paragraph",
            text: "Drivers must obey traffic laws, avoid distracted driving, and prioritize passenger safety at all times.",
          },
        ],
      },
      {
        heading: "7. Confidentiality",
        blocks: [
          {
            kind: "paragraph",
            text: "Customer information obtained during the course of work must not be disclosed except as required to perform assigned duties or comply with legal obligations.",
          },
        ],
      },
      {
        heading: "8. Alcohol, Drugs, and Impairment",
        blocks: [
          {
            kind: "paragraph",
            text: "Drivers must not operate vehicles while impaired by alcohol, illegal substances, or any condition that materially affects safe driving.",
          },
        ],
      },
      {
        heading: "9. Incidents",
        blocks: [
          {
            kind: "paragraph",
            text: "Accidents, security concerns, customer complaints, or vehicle damage must be reported to management as soon as reasonably possible.",
          },
        ],
      },
      {
        heading: "10. Technology Use",
        blocks: [
          {
            kind: "paragraph",
            text: "Drivers should accurately use the 22 Logistics application to acknowledge assignments, update trip status, and complete required records.",
          },
        ],
      },
      {
        heading: "11. Prohibited Conduct",
        blocks: [
          { kind: "paragraph", text: "Drivers must not:" },
          {
            kind: "bullets",
            items: [
              "Solicit unauthorized payments.",
              "Harass customers.",
              "Falsify trip records.",
              "Use company assets for unauthorized purposes.",
              "Share customer data without authorization.",
            ],
          },
        ],
      },
      {
        heading: "12. Compliance and Discipline",
        blocks: [
          {
            kind: "paragraph",
            text: "Violations of this Code may result in coaching, warnings, suspension, termination of engagement, or other appropriate action depending on the seriousness of the conduct.",
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
