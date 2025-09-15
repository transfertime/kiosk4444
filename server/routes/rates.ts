import { RequestHandler } from "express";

const CACHE_TTL = 1000 * 60 * 5; // 5 minutes
let cache: { ts: number; data: any } | null = null;

export const exchangeHandler: RequestHandler = async (req, res) => {
  try {
    const now = Date.now();
    if (cache && now - cache.ts < CACHE_TTL) {
      return res.json(cache.data);
    }

    const symbols = ["USD","TRY","GBP","RUB"].join(",");
    const base = "EUR";

    const latestRes = await fetch(`https://api.exchangerate.host/latest?base=${base}&symbols=${symbols}`);
    if (!latestRes.ok) {
      return res.status(502).json({ error: "Failed to fetch latest rates" });
    }
    const latest = await latestRes.json();

    // timeseries for last 7 days
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 6);
    const s = start.toISOString().slice(0,10);
    const e = end.toISOString().slice(0,10);
    const tsRes = await fetch(`https://api.exchangerate.host/timeseries?start_date=${s}&end_date=${e}&base=${base}&symbols=${symbols}`);
    let history: any = null;
    if (tsRes.ok) {
      const ts = await tsRes.json();
      // organize into arrays per currency in chronological order
      const obj: Record<string, number[]> = {};
      const dates = Object.keys(ts.rates || {}).sort();
      dates.forEach((date: string) => {
        const day = ts.rates[date];
        Object.entries(day).forEach(([k, v]) => {
          if (!obj[k]) obj[k] = [];
          obj[k].push(Number(v));
        });
      });
      history = obj;
    }

    const payload = { rates: latest.rates || null, history, date: latest.date || new Date().toISOString().slice(0,10) };
    cache = { ts: now, data: payload };
    return res.json(payload);
  } catch (e) {
    return res.status(500).json({ error: "exchange_error" });
  }
};
