import {
  Calendar,
  Truck,
  Wallet,
  UserCheck,
  Filter,
  Loader2,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { PageHeader } from "@/components/dashboard/PageHeader";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { useDashboard } from "@/hooks/useAdminData";

const revenue = [
  { day: "Mon", v: 1800 },
  { day: "Tue", v: 2200 },
  { day: "Wed", v: 1500 },
  { day: "Thu", v: 2700 },
  { day: "Fri", v: 2400 },
  { day: "Sat", v: 4200 },
];

const bookings = [
  { m: "Jan", v: 2400 },
  { m: "Feb", v: 3200 },
  { m: "Mar", v: 2800 },
  { m: "Apr", v: 3800 },
  { m: "May", v: 4200 },
  { m: "Jun", v: 3500 },
  { m: "Jul", v: 4500 },
  { m: "Aug", v: 4100 },
  { m: "Sep", v: 5000 },
  { m: "Oct", v: 4700 },
  { m: "Nov", v: 5300 },
  { m: "Dec", v: 5800 },
];

const ride = [
  { name: "Schedule", value: 80 },
  { name: "Completed", value: 20 },
];

const txns = [
  {
    id: "ZZL#1230",
    name: "Jane D",
    type: "Individual",
    amt: "₦24,000",
    date: "Mon, Sep, 2nd 2025,2:30:48 PM",
    status: "Completed",
  },
  {
    id: "ZZL#1234",
    name: "Ade ayo...",
    type: "Business",
    amt: "₦34,000",
    date: "Mon, Sep, 2nd 2025,2:30:48 PM",
    status: "Completed",
  },
  {
    id: "ZZL#1237",
    name: "Bayo",
    type: "Business",
    amt: "₦54,000",
    date: "Mon, Sep, 2nd 2025,2:30:48 PM",
    status: "Failed",
  },
  {
    id: "ZZL#1238",
    name: "Samuel",
    type: "Individual",
    amt: "₦34,000",
    date: "Mon, Sep, 2nd 2025,2:30:48 PM",
    status: "Completed",
  },
];

const Dashboard = () => {
  const { data, isLoading } = useDashboard();

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Welcome back! Here's your overview"
        actions={
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" /> Filter
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="grid grid-cols-2 gap-4 lg:col-span-2">
          <StatCard
            label="Total Bookings"
            value={String(data?.totalBookings ?? 0)}
            hint="+0% from yesterday"
            icon={Calendar}
            iconBg="bg-warning/15 text-warning"
          />
          <StatCard
            label="Active Drivers"
            value={String(data?.activeDrivers ?? 0)}
            hint="3 pending assignments"
            hintTone="muted"
            icon={Truck}
            iconBg="bg-accent/15 text-accent"
          />
          <StatCard
            label="Total Revenue"
            value={`₦${(data?.totalRevenue ?? 0).toLocaleString()}`}
            hint="+8% from yesterday"
            icon={Wallet}
            iconBg="bg-success/15 text-success"
          />
          <StatCard
            label="Registered Users"
            value={String(data?.registeredUsers ?? 0)}
            hint="+25 this week"
            icon={UserCheck}
            iconBg="bg-warning/15 text-warning"
          />
        </div>

        <div className="bg-surface rounded-xl p-5 border border-border">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold">Ride Overview</h3>
              <p className="text-xs text-muted-foreground">
                Business booking trends
              </p>
            </div>
          </div>
          <div className="h-44 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ride}
                  dataKey="value"
                  innerRadius={55}
                  outerRadius={75}
                  startAngle={180}
                  endAngle={0}
                  paddingAngle={2}
                >
                  <Cell fill="hsl(var(--accent))" />
                  <Cell fill="hsl(var(--primary))" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-x-0 bottom-6 text-center">
              <p className="text-2xl font-bold">100%</p>
            </div>
          </div>
          <div className="flex justify-center gap-4 text-xs">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-accent" /> Schedule (80%)
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-primary" /> Completed
              (20%)
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <div className="bg-surface rounded-xl p-5 border border-border">
          <div className="mb-3">
            <h3 className="font-semibold">Revenue Overview</h3>
            <p className="text-xs text-muted-foreground">
              Weekly revenue and booking trends
            </p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.weeklyRevenue ?? []}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="hsl(var(--accent))"
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="100%"
                      stopColor="hsl(var(--accent))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="day"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--surface))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke="hsl(var(--accent))"
                  strokeWidth={2}
                  fill="url(#rev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-surface rounded-xl p-5 border border-border">
          <div className="mb-3">
            <h3 className="font-semibold">Bookings Overview</h3>
            <p className="text-xs text-muted-foreground">Business</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bookings}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="m"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--surface))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                  }}
                />
                <Bar
                  dataKey="v"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-surface rounded-xl p-5 border border-border mt-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Recent Transaction</h3>
          <Button variant="link" size="sm">
            View More
          </Button>
        </div>
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="text-left text-xs text-muted-foreground border-b border-border">
                <th className="py-3 font-medium">Transaction ID</th>
                <th className="py-3 font-medium">Customer Name</th>
                <th className="py-3 font-medium">Type</th>
                <th className="py-3 font-medium">Amount</th>
                <th className="py-3 font-medium">Transaction Date</th>
                <th className="py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {(data?.recentTransactions ?? []).map((t: any) => (
                <tr
                  key={t.id}
                  className="border-b border-border/60 last:border-0"
                >
                  <td className="py-3">{t.trackingId ?? t.id}</td>
                  <td className="py-3">{t.customer?.name ?? "—"}</td>
                  <td className="py-3 text-muted-foreground">{t.rideType}</td>
                  <td className="py-3">₦{t.totalAmount?.toLocaleString()}</td>
                  <td className="py-3 text-muted-foreground">
                    {new Date(t.createdAt).toLocaleString()}
                  </td>
                  <td className="py-3">
                    <StatusBadge status={t.paymentStatus} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
