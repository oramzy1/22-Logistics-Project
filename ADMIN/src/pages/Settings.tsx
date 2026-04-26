import { useState, useEffect } from "react";
import { Settings as SettingsIcon, DollarSign, Building2, Bell, Shield, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useSettings, useUpdateSettings } from "@/hooks/useAdminData";

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

const inputCls = "h-9 w-full px-3 rounded-md border border-border bg-background text-sm";
const PRICE_FIELDS = [
  { key: 'price_3_hours',     label: '3 Hours Rate' },
  { key: 'price_6_hours',     label: '6 Hours Rate' },
  { key: 'price_10_hours',    label: '10 Hours Rate' },
  { key: 'price_airport',     label: 'Airport Schedule' },
  { key: 'price_multiday',    label: 'Multi-day Rate (per day)' },
  { key: 'ext_price_1_hour',  label: 'Extension - 1 Hour' },
  { key: 'ext_price_2_hours', label: 'Extension - 2 Hours' },
  { key: 'ext_price_3_hours', label: 'Extension - 3 Hours' },
];

const Settings = () => {
  const { data: settings, isLoading } = useSettings();
  const update = useUpdateSettings();
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (settings) {
      const map: Record<string, string> = {};
      settings.forEach((s: any) => { map[s.key] = s.value; });
      setValues(map);
    }
  }, [settings]);

  const set = (key: string, value: string) => setValues(v => ({ ...v, [key]: value }));

  const handleSave = () => {
    const payload = Object.entries(values).map(([key, value]) => ({ key, value }));
    update.mutate(payload, {
      onSuccess: () => toast.success('Settings saved'),
      onError: () => toast.error('Failed to save settings'),
    });
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
  
    return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Manage platform configuration and preferences."
        actions={
          <Button onClick={handleSave} size="sm" disabled={update.isPending}>
            {update.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        }
      />
      <div className="space-y-4">
        <Section icon={SettingsIcon} title="General Settings">
          <Field label="Platform Name"><input disabled className={inputCls} defaultValue="22-Logistics" /></Field>
          <Field label="Default Currency"><input disabled className={inputCls} defaultValue="NGN/₦" /></Field>
          <Field label="Time Zone">
            <select disabled className={inputCls}><option>West Africa Time (WAT)</option></select>
          </Field>
        </Section>

        <Section icon={DollarSign} title="Trip & Pricing Settings">
          {PRICE_FIELDS.map(({ key, label }) => (
            <Field key={key} label={label}>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₦</span>
                <input
                  className={`${inputCls} pl-7`}
                  value={values[key] ?? ''}
                  onChange={(e) => set(key, e.target.value)}
                  placeholder="0"
                />
              </div>
            </Field>
          ))}
        </Section>

        <Section icon={Building2} title="Individual & Business Controls">
          <Toggle label="New Business Registrations" desc="Allow new business accounts to register" defaultOn />
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
          <Field label="Session Timeout">
            <select className={inputCls}><option>30 minutes</option><option>1 hour</option><option>8 hours</option></select>
          </Field>
        </Section>
      </div>
    </div>
  );
};

export default Settings;