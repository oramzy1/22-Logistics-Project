const defaults = [
  ["baby_seat", "Baby Car Seat", 2000], ["extra_luggage", "Extra Luggage", 2000],
  ["wifi", "WiFi", 4000], ["cold_water", "Cold Water", 2000],
  ["pet_friendly", "Pet Friendly", 2000], ["wheelchair", "Wheelchair Access", 2000],
];
for (const [i, [key, label, price]] of defaults.entries())
  await prisma.addOn.upsert({ where: { key: key as string }, update: {}, create: { key: key as string, label: label as string, price: price as number, sortOrder: i } });

const legacy = await prisma.appSettings.findUnique({ where: { key: "price_airport" } });
for (const slug of ["pickup", "dropoff", "roundtrip"])
  await prisma.appSettings.upsert({ where: { key: `price_airport_${slug}` }, update: {}, create: { key: `price_airport_${slug}`, value: legacy?.value ?? "0" } });
await prisma.appSettings.upsert({ where: { key: "price_custom_extra" }, update: {}, create: { key: "price_custom_extra", value: "2000" } });