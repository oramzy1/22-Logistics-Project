import { Link } from "@tanstack/react-router";
import { Facebook, Linkedin, Instagram, Twitter, Apple, Play } from "lucide-react";
import { Logo } from "./Logo";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/features", label: "Features" },
  { to: "/about", label: "About" },
  { to: "/services", label: "Service" },
];
const SUPPORT = [
  { to: "/faqs", label: "FAQS" },
  { to: "/contact", label: "Contact" },
];
const LEGAL = [
  { to: "/terms", label: "Terms & Conditions" },
  { to: "/privacy", label: "Privacy Policy" },
  { to: "/refund-policy", label: "Cancellation & Refund" },
  { to: "/platform-policy", label: "Platform Use Policy" },
  { to: "/customer-rights", label: "Customer Bill of Rights" },
  { to: "/service-charter", label: "Service Charter" },
];

export function Footer() {
  return (
    <footer className="bg-ink text-white">
      <div className="container-x grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Logo light />
          <p className="mt-5 max-w-xs text-sm text-white/70">
            Reliable transportation and logistics for individuals and businesses - all from one
            modern mobile app.
          </p>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-semibold text-white">Navigation</h4>
          <ul className="space-y-2.5 text-sm text-white/70">
            {NAV.map((i) => (
              <li key={i.to}>
                <Link to={i.to} className="hover:text-white">
                  {i.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-semibold text-white">Support</h4>
          <ul className="space-y-2.5 text-sm text-white/70">
            {SUPPORT.map((i) => (
              <li key={i.to}>
                <Link to={i.to} className="hover:text-white">
                  {i.label}
                </Link>
              </li>
            ))}
            {LEGAL.map((i) => (
              <li key={i.to}>
                <Link to={i.to} className="hover:text-white">
                  {i.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div id="download">
          <h4 className="mb-4 text-sm font-semibold text-white">Get the App</h4>
          <p className="mb-3 text-sm text-white/70">Download our App</p>
          <div className="flex flex-col gap-3">
            <a
              href="#"
              className="inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-sm hover:bg-white/15"
            >
              <Apple size={18} />{" "}
              <span>
                <span className="block text-[10px] leading-none text-white/60">Download on</span>
                <span className="font-semibold">App Store</span>
              </span>
            </a>
            <a
              href="#"
              className="inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-sm hover:bg-white/15"
            >
              <Play size={18} />{" "}
              <span>
                <span className="block text-[10px] leading-none text-white/60">GET IT ON</span>
                <span className="font-semibold">Google Play</span>
              </span>
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-4 py-5 text-sm text-white/60 md:flex-row">
          <p>© 2026 All rights reserved</p>
          <div className="flex items-center gap-3">
            <span className="text-white/60">Follow us on Socials</span>
            {[Facebook, Linkedin, Instagram, Twitter].map((Icon, i) => (
              <a
                key={i}
                href="#"
                aria-label="social"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 hover:bg-white/10"
              >
                <Icon size={14} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
