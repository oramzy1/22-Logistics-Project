import prisma from "./prisma";

export class PromoError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

export async function calculatePromoDiscount(code: string, userId: string, amount: number) {
  const [user, promo] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { role: true } }),
    prisma.promoCode.findUnique({ where: { code: code.toUpperCase() } }),
  ]);
  if (!promo || !promo.isActive) throw new PromoError("Invalid or inactive promo code", 404);
  if (promo.expiresAt && new Date() > promo.expiresAt) throw new PromoError("Promo code has expired");
  if (promo.usageLimit && promo.usedCount >= promo.usageLimit) throw new PromoError("Promo code usage limit reached");
  if (promo.minBookingAmount && amount < promo.minBookingAmount)
    throw new PromoError(`Minimum booking amount is ₦${promo.minBookingAmount.toLocaleString()}`);
  if (promo.targetType === "USER_SPECIFIC" && !promo.targetUserIds.includes(userId))
    throw new PromoError("This promo code is not available for your account", 403);
  if (promo.targetType === "INDIVIDUAL" && user?.role !== "INDIVIDUAL")
    throw new PromoError("This promo is for individual customers only", 403);
  if (promo.targetType === "BUSINESS" && user?.role !== "BUSINESS")
    throw new PromoError("This promo is for business customers only", 403);
  if (await prisma.promoUsage.findFirst({ where: { promoId: promo.id, userId } }))
    throw new PromoError("You have already used this promo code");

  let discountAmount =
    promo.discountType === "PERCENTAGE"
      ? Math.min((amount * promo.discountValue) / 100, promo.maxDiscount ?? Infinity)
      : Math.min(promo.discountValue, amount);
  discountAmount = Math.round(discountAmount); // whole naira, so Paystack kobo stays an integer

  return { promo, code: promo.code, discountAmount, finalAmount: amount - discountAmount };
}