import prisma from './prisma';

export async function getPackagePrices(): Promise<Record<string, number>> {
  const settings = await prisma.appSettings.findMany({
    where: { key: { in: ['price_3_hours','price_6_hours','price_10_hours','price_airport','price_multiday', 'price_airport_upgrade_discount'] } }
  });
  const map: Record<string, number> = {};
  for (const s of settings) {
    const labels: Record<string, string> = {
      price_3_hours: '3 Hours',
      price_6_hours: '6 Hours',
      price_10_hours: '10 Hours',
      price_airport: 'Airport Schedule',
      price_multiday: 'Multi-day',
    };
    if (s.key === 'price_airport_upgrade_discount'){
    map['airport_upgrade_discount'] = parseFloat(s.value);
      continue;
    }
    map[labels[s.key]] = parseFloat(s.value);
  }
  return map;
}

export async function getExtensionPrices(): Promise<Record<string, number>> {
  const settings = await prisma.appSettings.findMany({
    where: { key: { in: ['ext_price_1_hour','ext_price_2_hours','ext_price_3_hours'] } }
  });
  const map: Record<string, number> = {};
  for (const s of settings) {
    const labels: Record<string, string> = {
      ext_price_1_hour: '1-Hours',
      ext_price_2_hours: '2-Hours',
      ext_price_3_hours: '3-Hours',
    };
    map[labels[s.key]] = parseFloat(s.value);
  }
  return map;
}

export const getFuelPrices = async () => {
  const settings = await prisma.appSettings.findMany({
    where: { key: { in: ["price_fuel_3_hours", "price_fuel_6_hours", "price_fuel_10_hours", "price_fuel_airport"] } },
  });
  const map: Record<string, number> = {
    "3 Hours": 0, "6 Hours": 0, "10 Hours": 0, "Airport Schedule": 0,
  };
  const keyToPackage: Record<string, string> = {
    price_fuel_3_hours: "3 Hours",
    price_fuel_6_hours: "6 Hours",
    price_fuel_10_hours: "10 Hours",
    price_fuel_airport: "Airport Schedule",
  };
  settings.forEach((s) => { map[keyToPackage[s.key]] = parseFloat(s.value) || 0; });
  return map;
};


export const AIRPORT_SLUG: Record<string, string> = {
  AIRPORT_PICKUP: "pickup", AIRPORT_DROPOFF: "dropoff", AIRPORT_ROUND_TRIP: "roundtrip",
};
const HOURS_SLUG: Record<string, string> = { "3 Hours": "3_hours", "6 Hours": "6_hours", "10 Hours": "10_hours" };

export const getAirportPrices = async (): Promise<Record<string, number>> => {
  const keys = Object.values(AIRPORT_SLUG).map((s) => `price_airport_${s}`);
  const rows = await prisma.appSettings.findMany({ where: { key: { in: [...keys, "price_airport"] } } });
  const byKey = Object.fromEntries(rows.map((r) => [r.key, parseFloat(r.value) || 0]));
  return Object.fromEntries(
    Object.entries(AIRPORT_SLUG).map(([svc, slug]) => [svc, byKey[`price_airport_${slug}`] || byKey["price_airport"] || 0]),
  );
};

export const getUpgradePrice = async (service: string, fromPackage: string) => {
  const slug = AIRPORT_SLUG[service], h = HOURS_SLUG[fromPackage];
  if (!slug || !h) return 0;
  const s = await prisma.appSettings.findUnique({ where: { key: `price_upgrade_${slug}_${h}` } });
  return s ? parseFloat(s.value) || 0 : 0;
};

export const getCustomExtraPrice = async () => {
  const s = await prisma.appSettings.findUnique({ where: { key: "price_custom_extra" } });
  return s ? parseFloat(s.value) || 2000 : 2000;
};