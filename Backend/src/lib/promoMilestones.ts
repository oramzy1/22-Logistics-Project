import prisma from "./prisma";
import { sendPromoEmail } from "./email.service";
import { createNotification } from "./notifications";

// Define milestone rules
const MILESTONE_RULES = [
  {
    bookingCount: 1,
    code: "WELCOME10",
    discountType: "PERCENTAGE",
    discountValue: 10,
    description: "10% off your second ride!",
  },
  {
    bookingCount: 5,
    code: "LOYAL15",
    discountType: "PERCENTAGE",
    discountValue: 15,
    description: "15% off - thanks for 5 trips!",
  },
  {
    bookingCount: 10,
    code: "VIP20",
    discountType: "PERCENTAGE",
    discountValue: 20,
    description: "20% off - you're a VIP!",
  },
  {
    bookingCount: 20,
    code: "ELITE25",
    discountType: "PERCENTAGE",
    discountValue: 25,
    description: "25% off - Elite member reward!",
  },
];

const MILESTONE_COUNTS = [1, 5, 10, 20] as const;

async function getMilestoneSettings() {
  const keys = [
    "policy_welcome_enabled",
    "policy_welcome_discount",
    "policy_welcome_days",
    ...MILESTONE_COUNTS.flatMap((c) => [
      `milestone_${c}_enabled`,
      `milestone_${c}_discount`,
      `milestone_${c}_days`,
    ]),
  ];
  const rows = await prisma.appSettings.findMany({
    where: { key: { in: keys } },
  });
  const map: Record<string, string> = {};
  rows.forEach((r) => {
    map[r.key] = r.value;
  });
  return map;
}

// ── Called after every booking completion ─────────────────────
export async function checkAndGrantMilestonePromo(userId: string) {
  const completedCount = await prisma.booking.count({
    where: { customerId: userId, status: "COMPLETED", paymentStatus: "PAID" },
  });

  // Only fire on exact milestone counts
  if (!(MILESTONE_COUNTS as readonly number[]).includes(completedCount)) return;

  const settings = await getMilestoneSettings();
  const enabledKey = `milestone_${completedCount}_enabled`;
  if (settings[enabledKey] === "false") return; // admin disabled this milestone

  const discount = parseFloat(
    settings[`milestone_${completedCount}_discount`] ?? "10",
  );
  const days = parseInt(settings[`milestone_${completedCount}_days`] ?? "30");

  const prefixMap: Record<number, string> = {
    1: "WELCOME10",
    5: "LOYAL15",
    10: "VIP20",
    20: "ELITE25",
  };
  const prefix = prefixMap[completedCount] ?? `MILE${completedCount}`;
  const suffix = userId.slice(0, 6).toUpperCase();
  const code = `${prefix}-${suffix}`;
  const description = `${discount}% off - reward for ${completedCount} trip${completedCount > 1 ? "s" : ""}!`;

  // Guard: don't double-issue
  const existing = await prisma.promoCode.findUnique({ where: { code } });
  if (existing) return;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });
  if (!user) return;

  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  await prisma.promoCode.create({
    data: {
      code,
      description,
      discountType: "PERCENTAGE",
      discountValue: discount,
      usageLimit: 1,
      expiresAt,
      targetType: "USER_SPECIFIC",
      targetUserIds: [userId],
      isActive: true,
      createdBy: "system",
    },
  });

  await createNotification(
    userId,
    "🎉 You earned a promo!",
    `${description} Use code: ${code}`,
    "PROMO_GRANTED",
    undefined,
  );

  await sendPromoEmail(
    user.email,
    user.name,
    code,
    description,
    discount,
    "PERCENTAGE",
    expiresAt,
  );
}

export async function grantNewUserPromo(
  userId: string,
  email: string,
  name: string,
) {
  const code = `NEW10-${userId.slice(0, 6).toUpperCase()}`;

  const existing = await prisma.promoCode.findUnique({ where: { code } });
  if (existing) return;

  const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days

  await prisma.promoCode.create({
    data: {
      code,
      description: "Welcome! 10% off your first ride.",
      discountType: "PERCENTAGE",
      discountValue: 10,
      usageLimit: 1,
      expiresAt,
      targetType: "USER_SPECIFIC",
      targetUserIds: [userId],
      isActive: true,
      createdBy: "system",
    },
  });

  await createNotification(
    userId,
    "🎁 Welcome promo unlocked!",
    `Use code ${code} for 10% off your first ride. Valid for 14 days.`,
    "PROMO_GRANTED",
    undefined,
  );

  await sendPromoEmail(
    email,
    name,
    code,
    "Welcome! 10% off your first ride.",
    10,
    "PERCENTAGE",
    expiresAt,
  );
}
