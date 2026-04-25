import prisma from './prisma';

export async function getPackagePrices(): Promise<Record<string, number>> {
  const settings = await prisma.appSettings.findMany({
    where: { key: { in: ['price_3_hours','price_6_hours','price_10_hours','price_airport','price_multiday'] } }
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