import axios from "axios";

const paystackClient = axios.create({
  baseURL: "https://api.paystack.co",
  headers: {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    "Content-Type": "application/json",
  },
});

const API_URL =
  process.env.API_URL || "https://two2-logistics-project.onrender.com";

export const initializeTransaction = async (
  email: string,
  amountInKobo: number,
  metadata: object,
  reference: string,
  channels?: string[],
) => {
  const response = await paystackClient.post("/transaction/initialize", {
    email,
    amount: amountInKobo,
    reference,
    metadata,
    callback_url: `${API_URL}/api/payments/callback`,
    ...(channels && { channels }),
  });
  return response.data.data;
};

export const verifyTransaction = async (reference: string) => {
  const response = await paystackClient.get(`/transaction/verify/${reference}`);
  return response.data.data;
};
