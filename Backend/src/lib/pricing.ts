import prisma from "./prisma";
import { getAirportPrices, getCustomExtraPrice, getFuelPrices, getPackagePrices, getUpgradePrice } from "./getPrices";

export const AIRPORT_SERVICES = ["AIRPORT_PICKUP", "AIRPORT_DROPOFF", "AIRPORT_ROUND_TRIP"] as const;
export type AirportService = (typeof AIRPORT_SERVICES)[number];
export const isAirportService = (v: any): v is AirportService => AIRPORT_SERVICES.includes(v);
export class PricingError extends Error {}

export async function computeBookingPrice(i: {
  packageType: string; airportService?: string; addOnKeys?: string[]; fueling?: boolean; customExtra?: string;
}) {
  const isAirport = i.packageType === "Airport Schedule";
  const isMulti = i.packageType === "Multi-day";

  let base = 0;
  if (isAirport) {
    if (!isAirportService(i.airportService)) throw new PricingError("Please select an airport service");
    base = (await getAirportPrices())[i.airportService] ?? 0;
  } else {
    base = (await getPackagePrices())[i.packageType] ?? 0;
  }
  if (!base) throw new PricingError("Invalid package type or custom pricing required");

  const keys = Array.from(new Set(i.addOnKeys ?? []));
  const catalog = keys.length
    ? await prisma.addOn.findMany({ where: { key: { in: keys }, isActive: true } })
    : [];
  if (catalog.length !== keys.length) throw new PricingError("One or more selected add-ons are no longer available");
  const addOnsTotal = catalog.reduce((s, a) => s + a.price, 0);

  const includeFuel = !isMulti && (isAirport || !!i.fueling);
  const fuel = includeFuel ? ((await getFuelPrices())[i.packageType] ?? 0) : 0;

  const custom = i.customExtra?.trim().slice(0, 15) ?? "";
  const customPrice = custom ? await getCustomExtraPrice() : 0;

  return {
    base, addOnsTotal, fuel, customPrice,
    subtotal: base + addOnsTotal + fuel + customPrice,
    fuelAddOnAmount: includeFuel ? fuel : null,
    labels: [
      ...catalog.map((a) => a.label),
      includeFuel ? (isAirport ? "Fueling (Included)" : "Fueling (Pre-paid)") : null,
      custom || null,
    ].filter((v): v is string => !!v),
  };
}

export async function getUpgradeQuote(
  booking: { packageType: string | null; addOns: string[]; fuelAddOnAmount: number | null },
  service: AirportService,
) {
  const pkg = booking.packageType ?? "";
  const [pkgPrices, airportPrices, fuelPrices, configured, discountRow] = await Promise.all([
    getPackagePrices(), getAirportPrices(), getFuelPrices(), getUpgradePrice(service, pkg),
    prisma.appSettings.findUnique({ where: { key: "price_airport_upgrade_discount" } }),
  ]);

  // Admin-set matrix wins. Fallback = old behaviour, but against the ride's BASE price
  // (not totalAmount, which includes add-ons/promo/interstate fees).
  const discountPct = parseFloat(discountRow?.value ?? "0") || 0;
  const baseUpgradeAmount =
    configured > 0
      ? Math.round(configured)
      : Math.round(Math.max(0, (airportPrices[service] ?? 0) - (pkgPrices[pkg] ?? 0)) * (1 - discountPct / 100));

  const hadFuelAddOn = booking.addOns.some((a) => a.toLowerCase().includes("fuel"));
  const fuelTopUpAmount = hadFuelAddOn
    ? Math.max(0, (fuelPrices["Airport Schedule"] ?? 0) - (booking.fuelAddOnAmount ?? 0))
    : 0;

  return { baseUpgradeAmount, fuelTopUpAmount, upgradeAmount: baseUpgradeAmount + fuelTopUpAmount, hadFuelAddOn };
}