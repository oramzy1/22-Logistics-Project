import { env } from '../helpers/env';

export default async function globalSetup() {
  let res: Response;
  try {
    res = await fetch(`${env.baseUrl}/health`);
  } catch (e: any) {
    throw new Error(`API not reachable at ${env.baseUrl} — start the Backend first (cd Backend && npm run dev). ${e.message}`);
  }
  if (!res.ok) throw new Error(`/health returned ${res.status} — refusing to run smoke suite.`);
  console.log(`\nSmoke target: ${env.baseUrl}`);
  console.log(`Payment tests: ${env.runPaymentTests ? 'ON' : 'off'} | Lifecycle: ${env.runTripLifecycle ? 'ON' : 'off'}\n`);
}