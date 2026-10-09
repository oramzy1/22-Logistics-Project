import { useState, useEffect } from "react";
import { Settings as SettingsIcon, DollarSign, Building2, Bell, Shield, Loader2, Plane, PackagePlus, Trash2, Plus } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useAddOns, useCreateAddOn, useDeleteAddOn, useSettings, useUpdateAddOn, useUpdateSettings } from "@/hooks/useAdminData";

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

const AddOnsManager = () => {
  const { data: addOns = [], isLoading } = useAddOns();
  const create = useCreateAddOn(), patch = useUpdateAddOn(), remove = useDeleteAddOn();
  const [draft, setDraft] = useState({ label: '', price: '' });
  const [edits, setEdits] = useState<Record<string, { label?: string; price?: string }>>({});

  const ok = (msg: string) => ({
    onSuccess: () => toast.success(msg),
    onError: (e: any) => toast.error(e?.response?.data?.message ?? e?.message ?? 'Failed'),
  });

  if (isLoading) return <Loader2 className="h-4 w-4 animate-spin" />;
  return (
    <>
      {addOns.map((a: any) => {
        const e = edits[a.id] ?? {};
        const dirty = e.label !== undefined || e.price !== undefined;
        return (
          <div key={a.id} className="flex flex-wrap items-center gap-2">
            <input className={`${inputCls} flex-1 min-w-[140px]`} value={e.label ?? a.label}
              onChange={(ev) => setEdits((s) => ({ ...s, [a.id]: { ...s[a.id], label: ev.target.value } }))} />
            <div className="relative w-32">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₦</span>
              <input className={`${inputCls} pl-7`} value={e.price ?? String(a.price)}
                onChange={(ev) => setEdits((s) => ({ ...s, [a.id]: { ...s[a.id], price: ev.target.value } }))} />
            </div>
            <Switch checked={a.isActive} onCheckedChange={(v) => patch.mutate({ id: a.id, isActive: v }, ok(v ? 'Add-on enabled' : 'Add-on hidden'))} />
            <Button size="sm" disabled={!dirty || patch.isPending}
              onClick={() => patch.mutate({ id: a.id, label: e.label, price: e.price !== undefined ? Number(e.price) : undefined },
                { ...ok('Add-on saved'), onSuccess: () => { toast.success('Add-on saved'); setEdits((s) => { const { [a.id]: _, ...rest } = s; return rest; }); } })}>
              Save
            </Button>
            <Button size="sm" variant="ghost" onClick={() => confirm(`Delete "${a.label}"?`) && remove.mutate(a.id, ok('Add-on deleted'))}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      })}
            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-border">
        <div className="flex-1 min-w-[100px]">
          <input className={inputCls} placeholder="New add-on name" value={draft.label} onChange={(e) => setDraft((d) => ({ ...d, label: e.target.value }))} />
        </div>
        <div className="w-52">
          <input className={inputCls} placeholder="Price (₦)" inputMode="numeric" value={draft.price} onChange={(e) => setDraft((d) => ({ ...d, price: e.target.value }))} />
        </div>
        <Button size="sm" disabled={!draft.label.trim() || !draft.price || create.isPending}
          onClick={() => create.mutate({ label: draft.label, price: Number(draft.price) }, { ...ok('Add-on created'), onSuccess: () => { toast.success('Add-on created'); setDraft({ label: '', price: '' }); } })}>
          <Plus className="mr-1 h-4 w-4" /> Add
        </Button>
      </div>
    </>
  );
};

const inputCls = "h-9 w-full px-3 rounded-md border border-border bg-background text-sm";
const PRICE_FIELDS = [
  { key: 'price_3_hours',     label: '3 Hours Rate' },
  { key: 'price_6_hours',     label: '6 Hours Rate' },
  { key: 'price_10_hours',    label: '10 Hours Rate' },
  // { key: 'price_airport',     label: 'Airport Schedule' },
  { key: 'price_multiday',    label: 'Multi-day Rate (per day)' },
  { key: 'ext_price_1_hour',  label: 'Extension - 1 Hour' },
  { key: 'ext_price_2_hours', label: 'Extension - 2 Hours' },
  { key: 'ext_price_3_hours', label: 'Extension - 3 Hours' },
  { key: 'price_airport_upgrade_discount', label: 'Airport Upgrade Discount (%)' },
  { key: 'price_fuel_3_hours',  label: 'Fueling Add-on - 3 Hours' },
  { key: 'price_fuel_6_hours',  label: 'Fueling Add-on - 6 Hours' },
  { key: 'price_fuel_10_hours', label: 'Fueling Add-on - 10 Hours' },
  { key: 'price_fuel_airport',  label: 'Fueling Add-on - Airport Schedule' },
  {key: 'price_custom_extra', label: "Custom Extra ('Other')" },
];

const AIRPORT_SERVICES = [
  { slug: 'pickup', label: 'Airport Pickup' },
  { slug: 'dropoff', label: 'Airport Drop-off' },
  { slug: 'roundtrip', label: 'Airport Round Trip' },
];
const UPGRADE_HOURS = [
  { slug: '3_hours', label: '3-Hour' }, { slug: '6_hours', label: '6-Hour' }, { slug: '10_hours', label: '10-Hour' },
];
const AIRPORT_PRICE_FIELDS = AIRPORT_SERVICES.map((s) => ({ key: `price_airport_${s.slug}`, label: `${s.label} Rate` }));
const UPGRADE_PRICE_FIELDS = AIRPORT_SERVICES.flatMap((s) =>
  UPGRADE_HOURS.map((h) => ({ key: `price_upgrade_${s.slug}_${h.slug}`, label: `Upgrade to ${s.label} (from ${h.label} ride)` })),
);


const Settings = () => {
  const { data: settings, isLoading } = useSettings();
  const update = useUpdateSettings();
  const [values, setValues] = useState<Record<string, string>>({});
const [notifSettings, setNotifSettings] = useState(() => {
  const saved = localStorage.getItem('admin_notif_prefs');
  return saved ? JSON.parse(saved) : {
    newBookingAlerts: true,
    paymentAlerts: true,
    supportAlerts: true,
    driverVerificationAlerts: true,
  };
});

const [sessionTimeout, setSessionTimeout] = useState("30");

  useEffect(() => {
    if (settings) {
      const map: Record<string, string> = {};
      settings.forEach((s: any) => { map[s.key] = s.value; });
      setValues(map);
    }
  }, [settings]);

  const updateNotif = (key: string, value: boolean) => {
  const updated = { ...notifSettings, [key]: value };
  setNotifSettings(updated);
  localStorage.setItem('admin_notif_prefs', JSON.stringify(updated));
};

  const set = (key: string, value: string) => setValues(v => ({ ...v, [key]: value }));

  const handleSave = () => {
       const original = Object.fromEntries((settings ?? []).map((s: any) => [s.key, s.value]));
    const payload = Object.entries(values)
      .map(([key, raw]) => ({ key, value: raw.trim() }))
      .filter(({ key, value }) => value !== original[key])
      .map(({ key, value }) =>
        value === '' && key.startsWith('price_upgrade_') ? { key, value: '0' } : { key, value },
      )
      .filter(({ value }) => value !== '');
    if (!payload.length) return toast.info('No changes to save');
    update.mutate(payload, {
      onSuccess: () => toast.success('Settings saved'),
      onError: (e: any) => toast.error(e?.response?.data?.message ?? e?.message ?? 'Failed to save settings'),
    });
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );

    const renderPrice = ({ key, label }: { key: string; label: string }) => (
    <Field key={key} label={label}>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₦</span>
        <input className={`${inputCls} pl-7`} value={values[key] ?? ''} onChange={(e) => set(key, e.target.value)} placeholder="0" />
      </div>
    </Field>
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
          {/* {PRICE_FIELDS.map(({ key, label }) => (
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
          ))} */}
           {PRICE_FIELDS.map(renderPrice)}
         </Section>

        <Section icon={Plane} title="Airport Service Pricing">
          {AIRPORT_PRICE_FIELDS.map(renderPrice)}
        </Section>

        <Section icon={Plane} title="Airport Upgrade Pricing">
          <p className="text-xs text-muted-foreground">
            Amount the customer pays on top of their original ride. Leave blank or 0 to auto-calculate (airport rate − ride base price).
          </p>
          {UPGRADE_PRICE_FIELDS.map(renderPrice)}
        </Section>

        <Section icon={PackagePlus} title="Ride Add-ons">
          <AddOnsManager />
        </Section>

        <Section icon={Building2} title="Individual & Business Controls">
          <Toggle label="New Business Registrations" desc="Allow new business accounts to register" defaultOn />
          <Toggle label="Require Email Verification" desc="Customers must verify before booking" defaultOn />
        </Section>

<Section icon={Bell} title="Notifications">
  {[
    { key: "newBookingAlerts", label: "New Booking Alerts", desc: "Email and in-app notifications" },
    { key: "paymentAlerts", label: "Payment Alerts", desc: "Notify on successful or failed payments" },
    { key: "supportAlerts", label: "Support Ticket Alerts", desc: "Get notified on new support requests" },
    { key: "driverVerificationAlerts", label: "Driver Verification Alerts", desc: "On successful onboarding of new drivers" },
  ].map(({ key, label, desc }) => (
    <div key={key} className="flex items-start justify-between gap-3 py-2">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
      </div>
      <Switch
        checked={notifSettings[key as keyof typeof notifSettings]}
        onCheckedChange={(v) => updateNotif(key, v)}
      />
    </div>
  ))}
</Section>

        <Section icon={Shield} title="Security">
          <Toggle label="Two-Factor Authentication" desc="Require 2FA for admin accounts" defaultOn />
          <Field label="Session Timeout">
  <select
    className={inputCls}
    value={sessionTimeout}
    onChange={e => {
      setSessionTimeout(e.target.value);
      // Store in localStorage so auth can read it
      localStorage.setItem('admin_session_timeout_minutes', e.target.value);
    }}
  >
    <option value="30">30 minutes</option>
    <option value="60">1 hour</option>
    <option value="480">8 hours</option>
  </select>
</Field>
        </Section>
      </div>
    </div>
  );
};

export default Settings;