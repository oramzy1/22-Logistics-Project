import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About Us" },
  { to: "/features", label: "Feature" },
  { to: "/services", label: "Service" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur">
      <div className="container-x flex h-16 items-center justify-between md:h-20">
        <Logo />
        <nav className="hidden items-center gap-8 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-ink"
              activeProps={{ className: "text-ink font-semibold border-b-2 border-brand pb-1" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden lg:block">
          <a
            href="#download"
            className="inline-flex items-center rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-ink/90"
          >
            Download App
          </a>
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md text-ink lg:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {open && (
        <div className="border-t border-border bg-background lg:hidden">
          <div className="container-x flex flex-col gap-1 py-3">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-ink"
                activeProps={{ className: "text-ink bg-secondary font-semibold" }}
                activeOptions={{ exact: item.to === "/" }}
              >
                {item.label}
              </Link>
            ))}
            <a
              href="#download"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white"
            >
              Download App
            </a>
          </div>
        </div>
      )}
    </header>
  );
}