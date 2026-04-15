import CDP from "chrome-remote-interface";

export const HOST = process.env.TV_CDP_HOST || "localhost";
export const PORT = Number(process.env.TV_CDP_PORT) || 9222;

export interface TestClient extends CDP.Client {
  // Add any helper properties if needed
}

/**
 * Finds the TradingView chart target and establishes a CDP connection.
 */
export async function getCDPConnection(): Promise<CDP.Client | null> {
  try {
    const targets = await CDP.List({ host: HOST, port: PORT });
    const chartTarget = targets.find((t: any) => 
      t.url && (t.url.includes("tradingview.com/chart") || t.url.includes("tradingview.com/desktop"))
    );
    
    if (!chartTarget) {
      console.warn(`No TradingView chart target found on ${HOST}:${PORT}`);
      return null;
    }

    const client = await CDP({ host: HOST, port: PORT, target: chartTarget.id });
    
    // Basic setup needed for most tests
    await Promise.all([
      client.Runtime.enable(),
      client.Page.enable()
    ]);

    return client;
  } catch (err) {
    console.error(`Failed to connect to CDP on ${HOST}:${PORT}:`, err);
    return null;
  }
}
