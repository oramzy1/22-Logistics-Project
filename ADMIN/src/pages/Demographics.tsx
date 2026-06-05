import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { MapPin, User, Truck } from 'lucide-react';

const DemoTable = ({ title, icon: Icon, data, col }: any) => (
  <div className="bg-surface rounded-xl border border-border p-5">
    <div className="flex items-center gap-2 mb-4">
      <Icon className="h-4 w-4 text-accent" />
      <h3 className="font-semibold">{title}</h3>
    </div>
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-xs text-muted-foreground border-b border-border">
          <th className="py-2">#</th>
          <th className="py-2">{col}</th>
          <th className="py-2 text-right">Count</th>
        </tr>
      </thead>
      <tbody>
        {data.map((r: any, i: number) => (
          <tr key={i} className="border-b border-border/50 last:border-0">
            <td className="py-2 text-muted-foreground">{i + 1}</td>
            <td className="py-2 font-medium truncate max-w-[240px]">{r.address ?? r.name ?? r.email}</td>
            <td className="py-2 text-right font-bold">{r.count ?? r.totalStops}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const TripDemographics = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.get('/admin/trips/demographics?limit=10').then(setData);
  }, []);

  if (!data) return <div className="p-8 text-muted-foreground">Loading...</div>;

  return (
    <div>
      <PageHeader title="Trip Demographics" subtitle="Pickup hotspots, popular stops, and user patterns." />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DemoTable title="Top Pickup Locations" icon={MapPin} data={data.topPickups} col="Address" />
        <DemoTable title="Top Intermediate Stops" icon={MapPin} data={data.topStops} col="Address" />
        <DemoTable title="Top Dropoff Locations" icon={MapPin} data={data.topDropoffs} col="Address" />
        <DemoTable title="Users with Most Stops" icon={User} data={data.mostStopsPerUser} col="Customer" />
        <DemoTable title="Driver Stop Leaderboard" icon={Truck} data={data.driverStopLeaderboard} col="Driver" />
      </div>
    </div>
  );
};

export default TripDemographics;