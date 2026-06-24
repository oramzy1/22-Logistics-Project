import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/site/PolicyPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy - 22 Logistics" },
      {
        name: "description",
        content: "How 22 Logistics collects, uses, and protects your personal information.",
      },
    ],
  }),
  component: () => (
    <PolicyPage
      title="Privacy Policy"
      intro="22 Logistics is committed to protecting the privacy of users of our mobile application, website, and related services."
      sections={[
        {
          heading: "1. Introduction",
          paragraphs: [
            '22 Logistics ("we", "our", or "us") is committed to protecting the privacy of users of our mobile application, website, and related services. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.',
          ],
        },
        {
          heading: "2. Information We Collect",
          bullets: [
            "Name, phone number, email address, and profile information.",
            "Pickup locations, destinations, scheduled stops, and ride preferences.",
            "Business account information, including company name and authorized delegates.",
            "Payment-related information processed through approved third-party payment providers.",
            "Device information, IP address, operating system, and app usage analytics.",
            "GPS location data while using our services where permission has been granted.",
            "Customer support communications and feedback.",
          ],
        },
        {
          heading: "3. How We Use Your Information",
          bullets: [
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
        {
          heading: "4. Location Information",
          bullets: [
            "Determine pickup and destination points.",
            "Support driver navigation.",
            "Verify service availability.",
            "Calculate applicable service area charges.",
            "Improve operational efficiency and safety.",
          ],
        },
        {
          heading: "5. Business Accounts",
          paragraphs: [
            "Business customers may authorize delegates to schedule rides. The business administrator is responsible for managing delegate permissions and ensuring authorized use.",
          ],
        },
        {
          heading: "6. Sharing of Information",
          bullets: [
            "Assigned drivers for the purpose of completing scheduled rides.",
            "Payment processors and financial service providers.",
            "Technology vendors supporting our platform.",
            "Government authorities where legally required.",
            "Professional advisers or successors in connection with a business transaction.",
          ],
          paragraphs: ["We do not sell personal information to third parties."],
        },
        {
          heading: "7. Data Security",
          paragraphs: [
            "We implement reasonable technical and organizational safeguards to protect personal information from unauthorized access, alteration, disclosure, or destruction. However, no electronic system is completely secure.",
          ],
        },
        {
          heading: "8. Data Retention",
          paragraphs: [
            "Information is retained only for as long as necessary to provide services, maintain business records, resolve disputes, comply with legal obligations, and enforce agreements.",
          ],
        },
        {
          heading: "9. User Rights",
          bullets: [
            "Access their information.",
            "Correct inaccurate information.",
            "Update account details.",
            "Delete eligible account information.",
            "Withdraw certain permissions where technically feasible.",
          ],
        },
        {
          heading: "10. Cookies and Analytics",
          paragraphs: [
            "Our website may use cookies and similar technologies to improve functionality, understand usage patterns, and enhance performance.",
          ],
        },
        {
          heading: "11. Children's Privacy",
          paragraphs: [
            "Our services are not intended for individuals below the minimum age permitted under applicable law without appropriate parental or guardian authorization.",
          ],
        },
        {
          heading: "12. Changes to this Policy",
          paragraphs: [
            "We may revise this Privacy Policy periodically. Updated versions become effective upon publication.",
          ],
        },
        {
          heading: "13. Contact",
          paragraphs: [
            "Questions regarding this Privacy Policy may be directed to 22 Logistics through our official customer support channels.",
          ],
        },
      ]}
    />
  ),
});
