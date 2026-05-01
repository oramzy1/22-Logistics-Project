export function startKeepAlive(url: string) {
  const PING_INTERVAL = 14 * 60 * 1000; // 14 minutes (Render sleeps after 15)
  setInterval(async () => {
    try {
      await fetch(`${url}/health`);
      console.log('🏓 Keep-alive ping sent');
    } catch (e) {
      console.log('Keep-alive failed:', e);
    }
  }, PING_INTERVAL);
}