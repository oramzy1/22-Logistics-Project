import { useState } from "react";
import { Settings as SettingsIcon, DollarSign, Building2, Bell, Shield } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const Section = ({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) => (
  <div className="bg-surface rounded-xl border border-border p-5">
    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
      <Icon className="h-4 w-4 text-accent" />
      <h3 className="font-semibold">{title}</h3>
    </div>
    <div className="space-y-4">{children}</div>
  </div>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:items-center">
    <label className="text-sm">{label}</label>
    <div>{children}</div>
  </div>
);

const Toggle = ({ label, desc, defaultOn = false }: { label: string; desc?: string; defaultOn?: boolean }) => {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-start justify-between gap-3 py-2">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {desc && <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>}
      </div>
      <Switch checked={on} onCheckedChange={setOn} />
    </div>
  );
};

const input = "h-9 w-full px-3 rounded-md border border-border bg-background text-sm";

const Settings = () => (
  <div>
    <PageHeader
      title="Settings"
      subtitle="Manage platform configuration and preferences."
      actions={<Button onClick={() => toast.success("Changes saved")} size="sm">Save Changes</Button>}
    />
    <div className="space-y-4">
      <Section icon={SettingsIcon} title="General Settings">
        <Field label="Platform Name"><input className={input} defaultValue="ZZ Logistics" /></Field>
        <Field label="Default Currency"><input className={input} defaultValue="NGN/N" /></Field>
        <Field label="Time Zone"><select className={input}><option>West Africa Time (WAT)</option></select></Field>
      </Section>

      <Section icon={DollarSign} title="Trip & Pricing Settings">
        <Field label="Drivers Rate"><input className={input} defaultValue="₦ 6900" /></Field>
        <Field label="6 hours Rate"><input className={input} defaultValue="₦ 6900" /></Field>
        <Field label="12 hours Rate"><input className={input} defaultValue="₦ 6900" /></Field>
        <Field label="Multi day Rate (per day)"><input className={input} defaultValue="₦ 6900" /></Field>
        <Field label="Airport pickup"><input className={input} defaultValue="₦ 6900" /></Field>
        <Field label="Cancellation Policy"><select className={input}><option>2 hours</option></select></Field>
      </Section>

      <Section icon={Building2} title="Individual & Business Controls">
        <Toggle label="New Business Registrations" desc="Allow new business accounts to register" defaultOn />
        <Field label="Default Monthly Budget Cap"><input className={input} defaultValue="₦200000" /></Field>
        <Toggle label="Require Email Verification" desc="Customers must verify before booking" defaultOn />
      </Section>

      <Section icon={Bell} title="Notifications">
        <Toggle label="New Booking Alerts" desc="Email and in-app notifications" defaultOn />
        <Toggle label="Payment Alerts" desc="Notify on successful or failed payments" defaultOn />
        <Toggle label="Support Ticket Alerts" desc="Get notified on new support requests" defaultOn />
        <Toggle label="Driver Verification Alerts" desc="On successful onboarding of new drivers" />
      </Section>

      <Section icon={Shield} title="Security">
        <Toggle label="Two-Factor Authentication" desc="Require 2FA for admin accounts" defaultOn />
        <Field label="Session Timeout"><select className={input}><option>30 minutes</option></select></Field>
        <Field label="Out-of-Date in Permissions"><select className={input}><option>Manager Roles</option></select></Field>
      </Section>
    </div>
  </div>
);

export default Settings;