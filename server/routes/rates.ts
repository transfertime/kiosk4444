import type { RequestHandler } from "express";

import type { RequestHandler } from "express";

const CACHE_TTL = 1000 * 60 * 5; // 5 minutes
let cache: { ts: number; data: any } | null = null;

async function fetchTCMB() {
  try {
    const res = await fetch("https://www.tcmb.gov.tr/kurlar/today.xml");
    if (!res.ok) return null;
    const txt = await res.text();
    const codes = ["USD","EUR","GBP","RUB"];
    const map: Record<string, number | null> = {};
    for (const c of codes) {
      const re = new RegExp(`<Currency[^>]*Kod=\\"${c}\\"[\\s\\S]*?<ForexSelling>(.*?)<\\/ForexSelling>`, "i");
      const m = txt.match(re);
      if (m && m[1]) {
        const val = parseFloat(m[1].replace(/,/g, '.'));
        map[c] = isNaN(val) ? null : val;
      } else {
        map[c] = null;
      }
    }
    // date attribute on <Tarih="...">
    const dateMatch = txt.match(/<Tarih=("|')(.*?)\1/);
    const date = dateMatch ? dateMatch[2] : null;
    return { map, date };
  } catch (e) {
    return null;
  }
}

export const exchangeHandler: RequestHandler = async (req, res) => {
  try {
    const now = Date.now();
    if (cache && now - cache.ts < CACHE_TTL) {
      return res.json(cache.data);
    }

    const symbols = ["USD","TRY","GBP","RUB"].join(",");
    const base = "EUR";

    // TCMB latest TRY rates
    const tcmb = await fetchTCMB();

    // fallback/latest from exchangerate.host for EUR base and timeseries
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
    const tsRes = await fetch(`https://api.exchangerate.host/timeseries?start_date=${s}&end_date=${e}&base=EUR&symbols=${symbols}`);
    let history: any = null;
    if (tsRes.ok) {
      const ts = await tsRes.json();
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

    const tcmbSelling: Record<string, number | null> = {};
    if (tcmb && tcmb.map) {
      for (const k of ["USD","EUR","GBP","RUB"]) {
        tcmbSelling[k] = tcmb.map[k] ?? null;
      }
    }

    const payload = { rates: latest.rates || null, history, date: latest.date || new Date().toISOString().slice(0,10), tcmb: tcmbSelling, tcmb_date: tcmb?.date || null };
    cache = { ts: now, data: payload };
    return res.json(payload);
  } catch (e) {
    return res.status(500).json({ error: "exchange_error" });
  }
};
