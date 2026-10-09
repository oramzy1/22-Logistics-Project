import crypto from 'node:crypto';

export const uniq = (p = 'x') =>
  `${p}-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;

export const uniqueEmail = (p = 'smoke') => `${uniq(p)}@example.test`;

/** 1x1 transparent PNG used for multer/Cloudinary-free field tests */
export const TINY_PNG = new Uint8Array(
  Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64',
  ),
);

export function form(
  fields: Record<string, string>,
  file?: { field: string; filename: string; contentType?: string; data?: Uint8Array },
): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.append(k, v);
  if (file) {
    fd.append(
      file.field,
      new Blob([(file.data ?? TINY_PNG) as BlobPart], { type: file.contentType ?? 'image/png' }),
      file.filename,
    );
  }
  return fd;
}

/** Booking scheduled tomorrow 10:00 (inside the 07:00-22:00 operating window, >2h ahead) */
export function validBookingPayload(overrides: Record<string, unknown> = {}) {
  const t = new Date();
  t.setDate(t.getDate() + 1);
  t.setHours(10, 0, 0, 0);
  return {
    pickupAddress: '12 Awolowo Road, Ikoyi, Lagos',
    dropoffAddress: 'Murtala Muhammed Airport, Ikeja, Lagos',
    pickupLat: 6.5244,
    pickupLng: 3.3792,
    dropoffLat: 6.5726,
    dropoffLng: 3.3216,
    scheduledAt: t.toISOString(),
    packageType: '3 Hours',
    notes: 'smoke-test booking',
    ...overrides,
  };
}