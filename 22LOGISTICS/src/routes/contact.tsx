import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Mail, Phone, MapPin } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHero } from "@/components/site/PageHero";
import contactHero from "@/assets/contact-hero.jpg";
import { submitContact } from "@/lib/contact.functions";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact - 22 Logistics" },
      {
        name: "description",
        content: "Reach the 22 Logistics team for support, inquiries, or help getting started.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const submit = useServerFn(submitContact);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<{ kind: "idle" | "loading" | "ok" | "err"; msg?: string }>({
    kind: "idle",
  });

  const update =
    (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus({ kind: "loading" });
    try {
      const res = await submit({ data: form });
      if (res.ok) {
        setStatus({ kind: "ok", msg: res.message });
        setForm({ name: "", email: "", subject: "", message: "" });
      } else {
        setStatus({ kind: "err", msg: res.message });
      }
    } catch {
      setStatus({ kind: "err", msg: "Network error. Please try again." });
    }
  }

  return (
    <SiteLayout>
      <PageHero title="Contact" image={contactHero} />
      <section className="section-surface py-16 md:py-24">
        <div className="container-x">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-brand">
              Contact Us
            </p>
            <h2 className="font-display text-3xl font-bold text-ink md:text-4xl">
              Contact For Any Enquiry
            </h2>
          </div>

          <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
            <div>
              <p className="max-w-md text-muted-foreground">
                Connect with our team for support, inquiries, or assistance getting started with 22
                Logistics.
              </p>
              <p className="mt-6 font-semibold text-ink">You tell, We listen.</p>
              <ul className="mt-6 space-y-4 text-sm text-ink">
                <li className="flex items-center gap-3">
                  <Mail size={16} className="text-brand" /> support@22logistics.com
                </li>
                <li className="flex items-center gap-3">
                  <Phone size={16} className="text-brand" /> +234 80719934
                </li>
                <li className="flex items-center gap-3">
                  <MapPin size={16} className="text-brand" /> GRA Phase 2, Port Harcourt, Rivers
                  State
                </li>
              </ul>
              <div className="mt-12">
                <p className="text-sm text-ink">Need help? Call Us</p>
                <a
                  href="tel:+23490999934"
                  className="mt-1 block font-display text-3xl font-bold text-brand md:text-4xl"
                >
                  +234 90999934
                </a>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-border bg-white p-6 shadow-sm md:p-10"
            >
              <h3 className="font-display text-xl font-semibold text-ink md:text-2xl">
                Have any Queries? we're here to help.
              </h3>
              <div className="mt-6 space-y-4">
                <Field label="NAME">
                  <input
                    required
                    value={form.name}
                    onChange={update("name")}
                    className="form-input"
                  />
                </Field>
                <Field label="EMAIL">
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={update("email")}
                    className="form-input"
                  />
                </Field>
                <Field label="SUBJECT">
                  <input
                    required
                    value={form.subject}
                    onChange={update("subject")}
                    className="form-input"
                  />
                </Field>
                <Field label="MESSAGE">
                  <textarea
                    required
                    rows={6}
                    value={form.message}
                    onChange={update("message")}
                    className="form-input resize-none"
                  />
                </Field>
              </div>
              {status.kind === "ok" && (
                <p className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                  {status.msg}
                </p>
              )}
              {status.kind === "err" && (
                <p className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  {status.msg}
                </p>
              )}
              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={status.kind === "loading"}
                  className="inline-flex items-center justify-center rounded-md bg-ink px-7 py-3 text-sm font-semibold uppercase tracking-wider text-white hover:bg-ink/90 disabled:opacity-60"
                >
                  {status.kind === "loading" ? "Sending…" : "Send Message"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
      <style>{`
        .form-input { width: 100%; background: oklch(0.97 0.005 240); border: 1px solid transparent; border-radius: 0.5rem; padding: 0.95rem 1rem; font-size: 0.875rem; color: var(--color-ink); outline: none; transition: border-color 150ms; }
        .form-input:focus { border-color: var(--color-brand); background: white; }
      `}</style>
    </SiteLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
