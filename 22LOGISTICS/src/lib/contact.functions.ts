import { createServerFn } from "@tanstack/react-start";

const BASE_URL = "https://two2-logistics-project.onrender.com";

export const submitContact = createServerFn({ method: "POST" })
  .inputValidator((data: { name: string; email: string; subject: string; message: string }) => data)
  .handler(async ({ data }) => {
    const payload = {
      name: data.name,
      email: data.email,
      subject: data.subject,
      description: data.message,
      category: "OTHER",
    };

    const attempts = [
      `${BASE_URL}/api/support/public-ticket`,
      `${BASE_URL}/api/contact`,
      `${BASE_URL}/api/support/ticket`,
    ];

    let lastStatus = 0;
    let lastBody = "";
    for (const url of attempts) {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        lastStatus = res.status;
        lastBody = await res.text();
        if (res.ok) {
          return { ok: true as const, message: "Ticket created. We'll be in touch shortly." };
        }
        if (res.status !== 404) break;
      } catch (err) {
        lastBody = (err as Error).message;
      }
    }
    return {
      ok: false as const,
      message:
        lastStatus === 401 || lastStatus === 403
          ? "Our support inbox requires sign-in. Please email or call the numbers above - your message was not delivered."
          : "We couldn't deliver your message right now. Please try again or call us.",
      status: lastStatus,
      detail: lastBody?.slice(0, 200),
    };
  });
