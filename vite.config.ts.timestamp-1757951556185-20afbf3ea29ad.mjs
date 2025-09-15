var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined")
    return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// server/routes/vakif.ts
var vakif_exports = {};
__export(vakif_exports, {
  vakifInit: () => vakifInit,
  vakifReturn: () => vakifReturn
});
import crypto from "node:crypto";
function base64sha(data, algo) {
  return crypto.createHash(algo).update(data, "utf8").digest("base64");
}
function amountToString(amount) {
  return amount.toFixed(2);
}
var vakifInit, vakifReturn;
var init_vakif = __esm({
  "server/routes/vakif.ts"() {
    vakifInit = (req, res) => {
      const body = req.body;
      const clientId = process.env.VAKIF_CLIENT_ID || "";
      const storeKey = process.env.VAKIF_STORE_KEY || "";
      const gatewayUrl = process.env.VAKIF_GATEWAY_URL || "";
      const hashAlgo = process.env.VAKIF_HASH_ALGO || "sha512";
      const currency = (body.currency || process.env.VAKIF_CURRENCY || "EUR").toUpperCase();
      if (!clientId || !storeKey || !gatewayUrl) {
        res.status(500).json({ error: "Vak\u0131fBank credentials are not configured" });
        return;
      }
      const amount = amountToString(body.amount);
      const oid = body.orderId;
      const okUrl = process.env.VAKIF_OK_URL || `${req.protocol}://${req.get("host")}/api/payments/vakif/return`;
      const failUrl = process.env.VAKIF_FAIL_URL || `${req.protocol}://${req.get("host")}/api/payments/vakif/return`;
      const tranType = "Auth";
      const instalment = "";
      const storetype = "3d_pay";
      const lang = "tr";
      const curr = currency === "TRY" ? "949" : currency === "USD" ? "840" : currency === "EUR" ? "978" : currency;
      const rnd = String(Date.now());
      const hashStr = `${clientId}${oid}${amount}${okUrl}${failUrl}${tranType}${instalment}${rnd}${storeKey}`;
      const hash = base64sha(hashStr, hashAlgo);
      const fields = {
        clientid: clientId,
        oid,
        amount,
        okUrl,
        failUrl,
        islemtipi: tranType,
        TranType: tranType,
        taksit: instalment,
        instalment,
        storetype,
        lang,
        currency: String(curr),
        rnd,
        hash,
        Description: body.description || ""
      };
      const response = { gatewayUrl, fields };
      res.json(response);
    };
    vakifReturn = (req, res) => {
      const data = { ...req.query, ...req.body };
      const mdStatus = String(data.mdStatus || "");
      const procCode = String(data.ProcReturnCode || data.procReturnCode || "");
      const success = ["1", "2", "3", "4"].includes(mdStatus) && (procCode === "00" || procCode === "0");
      const oid = data.oid || data.Oid || "";
      const html = `<!doctype html><meta charset='utf-8' />
  <style>body{font-family:Inter,system-ui,Arial,sans-serif;padding:32px} .ok{color:#0a7f2e} .fail{color:#b00020}</style>
  <h2>${success ? "Rezervasyonunuz onaylanm\u0131\u015Ft\u0131r" : "\xD6deme ba\u015Far\u0131s\u0131z"}</h2>
  <p>Sipari\u015F No: <b>${oid}</b></p>
  <p>Durum: mdStatus=${mdStatus} ProcReturnCode=${procCode}</p>
  <script>try{window.localStorage.setItem('payment_result', JSON.stringify(${JSON.stringify(
        { success: true }
      )}));}catch(e){}</script>`;
      res.status(success ? 200 : 400).send(html);
    };
  }
});

// server/routes/voucher.ts
var voucher_exports = {};
__export(voucher_exports, {
  sendVoucherEmail: () => sendVoucherEmail
});
var sendVoucherEmail;
var init_voucher = __esm({
  "server/routes/voucher.ts"() {
    sendVoucherEmail = async (req, res) => {
      try {
        const { to, subject, html } = req.body;
        if (!to)
          return res.status(400).json({ error: "Missing recipient email" });
        const host = process.env.SMTP_HOST;
        const user = process.env.SMTP_USER;
        const pass = process.env.SMTP_PASS;
        const from = process.env.SMTP_FROM || user;
        const port = Number(process.env.SMTP_PORT || 587);
        const secure = String(process.env.SMTP_SECURE || "false").toLowerCase() === "true";
        if (!host || !user || !pass || !from) {
          return res.status(501).json({ error: "SMTP not configured on server" });
        }
        let nodemailer;
        try {
          nodemailer = __require("nodemailer");
        } catch {
          return res.status(501).json({ error: "Email library not installed" });
        }
        const transporter = nodemailer.createTransport({
          host,
          port,
          secure,
          auth: { user, pass }
        });
        await transporter.sendMail({
          from,
          to,
          subject: subject || "Voucher",
          html: html || ""
        });
        res.json({ ok: true });
      } catch (e) {
        res.status(500).json({ error: "Failed to send email" });
      }
    };
  }
});

// server/routes/rates.ts
var rates_exports = {};
__export(rates_exports, {
  exchangeHandler: () => exchangeHandler
});
async function fetchTCMB() {
  try {
    const res = await fetch("https://www.tcmb.gov.tr/kurlar/today.xml");
    if (!res.ok)
      return null;
    const txt = await res.text();
    const codes = ["USD", "EUR", "GBP", "RUB"];
    const map = {};
    for (const c of codes) {
      const re = new RegExp(`<Currency[^>]*Kod=\\"${c}\\"[\\s\\S]*?<ForexSelling>(.*?)<\\/ForexSelling>`, "i");
      const m = txt.match(re);
      if (m && m[1]) {
        const val = parseFloat(m[1].replace(/,/g, "."));
        map[c] = isNaN(val) ? null : val;
      } else {
        map[c] = null;
      }
    }
    const dateMatch = txt.match(/<Tarih=("|')(.*?)\1/);
    const date = dateMatch ? dateMatch[2] : null;
    return { map, date };
  } catch (e) {
    return null;
  }
}
var CACHE_TTL, cache, exchangeHandler;
var init_rates = __esm({
  "server/routes/rates.ts"() {
    CACHE_TTL = 1e3 * 60 * 5;
    cache = null;
    exchangeHandler = async (req, res) => {
      try {
        const now = Date.now();
        if (cache && now - cache.ts < CACHE_TTL) {
          return res.json(cache.data);
        }
        const symbols = ["USD", "TRY", "GBP", "RUB"].join(",");
        const base = "EUR";
        const tcmb = await fetchTCMB();
        const latestRes = await fetch(`https://api.exchangerate.host/latest?base=${base}&symbols=${symbols}`);
        if (!latestRes.ok) {
          return res.status(502).json({ error: "Failed to fetch latest rates" });
        }
        const latest = await latestRes.json();
        const end = /* @__PURE__ */ new Date();
        const start = /* @__PURE__ */ new Date();
        start.setDate(end.getDate() - 6);
        const s = start.toISOString().slice(0, 10);
        const e = end.toISOString().slice(0, 10);
        const tsRes = await fetch(`https://api.exchangerate.host/timeseries?start_date=${s}&end_date=${e}&base=EUR&symbols=${symbols}`);
        let history = null;
        if (tsRes.ok) {
          const ts = await tsRes.json();
          const obj = {};
          const dates = Object.keys(ts.rates || {}).sort();
          dates.forEach((date) => {
            const day = ts.rates[date];
            Object.entries(day).forEach(([k, v]) => {
              if (!obj[k])
                obj[k] = [];
              obj[k].push(Number(v));
            });
          });
          history = obj;
        }
        const tcmbSelling = {};
        for (const k of ["USD", "EUR", "GBP", "RUB"]) {
          if (tcmb && tcmb.map && tcmb.map[k]) {
            tcmbSelling[k] = tcmb.map[k];
          } else if (latest && latest.rates) {
            const eurToK = Number(latest.rates[k]) || null;
            const eurToTRY = Number(latest.rates["TRY"]) || null;
            if (eurToK && eurToTRY) {
              tcmbSelling[k] = eurToTRY / eurToK;
            } else {
              tcmbSelling[k] = null;
            }
          } else {
            tcmbSelling[k] = null;
          }
        }
        const payload = { rates: latest.rates || null, history, date: latest.date || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), tcmb: tcmbSelling, tcmb_date: (tcmb == null ? void 0 : tcmb.date) || null };
        cache = { ts: now, data: payload };
        return res.json(payload);
      } catch (e) {
        return res.status(500).json({ error: "exchange_error" });
      }
    };
  }
});

// vite.config.ts
import { defineConfig } from "file:///app/code/node_modules/.pnpm/vite@4.5.14_@types+node@24.2.1/node_modules/vite/dist/node/index.js";
import react from "file:///app/code/node_modules/.pnpm/@vitejs+plugin-react-swc@4.0.0_vite@4.5.14_@types+node@24.2.1_/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";

// server/index.ts
import "file:///app/code/node_modules/.pnpm/dotenv@17.2.1/node_modules/dotenv/config.js";
import express from "file:///app/code/node_modules/.pnpm/express@5.1.0/node_modules/express/index.js";
import cors from "file:///app/code/node_modules/.pnpm/cors@2.8.5/node_modules/cors/lib/index.js";

// server/routes/demo.ts
var handleDemo = (req, res) => {
  const response = {
    message: "Hello from Express server"
  };
  res.status(200).json(response);
};

// server/index.ts
function createServer() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });
  app.get("/api/demo", handleDemo);
  const vakif = (init_vakif(), __toCommonJS(vakif_exports));
  app.post("/api/payments/vakif/init", vakif.vakifInit);
  app.all("/api/payments/vakif/return", vakif.vakifReturn);
  const voucher = (init_voucher(), __toCommonJS(voucher_exports));
  app.post("/api/voucher-email", voucher.sendVoucherEmail);
  const exchange = (init_rates(), __toCommonJS(rates_exports));
  app.get("/api/exchange", exchange.exchangeHandler);
  return app;
}

// vite.config.ts
var __vite_injected_original_dirname = "/app/code";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    fs: {
      allow: ["./client", "./shared"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"]
    }
  },
  build: {
    outDir: "dist/spa"
  },
  plugins: [react(), expressPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./client"),
      "@shared": path.resolve(__vite_injected_original_dirname, "./shared")
    }
  }
}));
function expressPlugin() {
  return {
    name: "express-plugin",
    apply: "serve",
    // Only apply during development (serve mode)
    configureServer(server) {
      const app = createServer();
      server.middlewares.use(app);
    }
  };
}
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic2VydmVyL3JvdXRlcy92YWtpZi50cyIsICJzZXJ2ZXIvcm91dGVzL3ZvdWNoZXIudHMiLCAic2VydmVyL3JvdXRlcy9yYXRlcy50cyIsICJ2aXRlLmNvbmZpZy50cyIsICJzZXJ2ZXIvaW5kZXgudHMiLCAic2VydmVyL3JvdXRlcy9kZW1vLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2FwcC9jb2RlL3NlcnZlci9yb3V0ZXNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9hcHAvY29kZS9zZXJ2ZXIvcm91dGVzL3Zha2lmLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9hcHAvY29kZS9zZXJ2ZXIvcm91dGVzL3Zha2lmLnRzXCI7aW1wb3J0IHR5cGUgeyBSZXF1ZXN0SGFuZGxlciB9IGZyb20gXCJleHByZXNzXCI7XG5pbXBvcnQgY3J5cHRvIGZyb20gXCJub2RlOmNyeXB0b1wiO1xuaW1wb3J0IHR5cGUgeyBWYWtpZkluaXRSZXF1ZXN0LCBWYWtpZkluaXRSZXNwb25zZSB9IGZyb20gXCJAc2hhcmVkL2FwaVwiO1xuXG5mdW5jdGlvbiBiYXNlNjRzaGEoZGF0YTogc3RyaW5nLCBhbGdvOiBzdHJpbmcpIHtcbiAgcmV0dXJuIGNyeXB0by5jcmVhdGVIYXNoKGFsZ28pLnVwZGF0ZShkYXRhLCBcInV0ZjhcIikuZGlnZXN0KFwiYmFzZTY0XCIpO1xufVxuXG5mdW5jdGlvbiBhbW91bnRUb1N0cmluZyhhbW91bnQ6IG51bWJlcikge1xuICAvLyBWYWtpZi9OZXN0UGF5IGV4cGVjdHMgZG90IGFzIGRlY2ltYWwgc2VwYXJhdG9yOyBpbnRlZ2VycyBhcmUgZmluZVxuICByZXR1cm4gYW1vdW50LnRvRml4ZWQoMik7XG59XG5cbmV4cG9ydCBjb25zdCB2YWtpZkluaXQ6IFJlcXVlc3RIYW5kbGVyID0gKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IGJvZHkgPSByZXEuYm9keSBhcyBWYWtpZkluaXRSZXF1ZXN0O1xuICBjb25zdCBjbGllbnRJZCA9IHByb2Nlc3MuZW52LlZBS0lGX0NMSUVOVF9JRCB8fCBcIlwiO1xuICBjb25zdCBzdG9yZUtleSA9IHByb2Nlc3MuZW52LlZBS0lGX1NUT1JFX0tFWSB8fCBcIlwiO1xuICBjb25zdCBnYXRld2F5VXJsID0gcHJvY2Vzcy5lbnYuVkFLSUZfR0FURVdBWV9VUkwgfHwgXCJcIjsgLy8gZS5nLiBodHRwczovL3RycG9zLXRlc3QudmFraWZiYW5rLmNvbS50ci9maW0vZXN0M0RnYXRlXG4gIGNvbnN0IGhhc2hBbGdvID0gcHJvY2Vzcy5lbnYuVkFLSUZfSEFTSF9BTEdPIHx8IFwic2hhNTEyXCI7IC8vIHVzdWFsbHkgc2hhNTEyXG4gIGNvbnN0IGN1cnJlbmN5ID0gKFxuICAgIGJvZHkuY3VycmVuY3kgfHxcbiAgICBwcm9jZXNzLmVudi5WQUtJRl9DVVJSRU5DWSB8fFxuICAgIFwiRVVSXCJcbiAgKS50b1VwcGVyQ2FzZSgpO1xuXG4gIGlmICghY2xpZW50SWQgfHwgIXN0b3JlS2V5IHx8ICFnYXRld2F5VXJsKSB7XG4gICAgcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogXCJWYWtcdTAxMzFmQmFuayBjcmVkZW50aWFscyBhcmUgbm90IGNvbmZpZ3VyZWRcIiB9KTtcbiAgICByZXR1cm47XG4gIH1cblxuICBjb25zdCBhbW91bnQgPSBhbW91bnRUb1N0cmluZyhib2R5LmFtb3VudCk7XG4gIGNvbnN0IG9pZCA9IGJvZHkub3JkZXJJZDsgLy8gdW5pcXVlIG9yZGVyIGlkXG4gIGNvbnN0IG9rVXJsID1cbiAgICBwcm9jZXNzLmVudi5WQUtJRl9PS19VUkwgfHxcbiAgICBgJHtyZXEucHJvdG9jb2x9Oi8vJHtyZXEuZ2V0KFwiaG9zdFwiKX0vYXBpL3BheW1lbnRzL3Zha2lmL3JldHVybmA7XG4gIGNvbnN0IGZhaWxVcmwgPVxuICAgIHByb2Nlc3MuZW52LlZBS0lGX0ZBSUxfVVJMIHx8XG4gICAgYCR7cmVxLnByb3RvY29sfTovLyR7cmVxLmdldChcImhvc3RcIil9L2FwaS9wYXltZW50cy92YWtpZi9yZXR1cm5gO1xuICBjb25zdCB0cmFuVHlwZSA9IFwiQXV0aFwiOyAvLyBzYWxlXG4gIGNvbnN0IGluc3RhbG1lbnQgPSBcIlwiOyAvLyBubyBpbnN0YWxsbWVudFxuICBjb25zdCBzdG9yZXR5cGUgPSBcIjNkX3BheVwiOyAvLyAzRCBIb3N0IFBheVxuICBjb25zdCBsYW5nID0gXCJ0clwiO1xuICBjb25zdCBjdXJyID1cbiAgICBjdXJyZW5jeSA9PT0gXCJUUllcIlxuICAgICAgPyBcIjk0OVwiXG4gICAgICA6IGN1cnJlbmN5ID09PSBcIlVTRFwiXG4gICAgICAgID8gXCI4NDBcIlxuICAgICAgICA6IGN1cnJlbmN5ID09PSBcIkVVUlwiXG4gICAgICAgICAgPyBcIjk3OFwiXG4gICAgICAgICAgOiBjdXJyZW5jeTsgLy8gYWNjZXB0IG51bWVyaWMgb3IgY29kZVxuICBjb25zdCBybmQgPSBTdHJpbmcoRGF0ZS5ub3coKSk7XG5cbiAgLy8gQ29tbW9uIE5lc3RQYXkgaGFzaCBjb21wb3NpdGlvblxuICBjb25zdCBoYXNoU3RyID0gYCR7Y2xpZW50SWR9JHtvaWR9JHthbW91bnR9JHtva1VybH0ke2ZhaWxVcmx9JHt0cmFuVHlwZX0ke2luc3RhbG1lbnR9JHtybmR9JHtzdG9yZUtleX1gO1xuICBjb25zdCBoYXNoID0gYmFzZTY0c2hhKGhhc2hTdHIsIGhhc2hBbGdvKTtcblxuICBjb25zdCBmaWVsZHM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XG4gICAgY2xpZW50aWQ6IGNsaWVudElkLFxuICAgIG9pZCxcbiAgICBhbW91bnQsXG4gICAgb2tVcmwsXG4gICAgZmFpbFVybCxcbiAgICBpc2xlbXRpcGk6IHRyYW5UeXBlLFxuICAgIFRyYW5UeXBlOiB0cmFuVHlwZSxcbiAgICB0YWtzaXQ6IGluc3RhbG1lbnQsXG4gICAgaW5zdGFsbWVudCxcbiAgICBzdG9yZXR5cGUsXG4gICAgbGFuZyxcbiAgICBjdXJyZW5jeTogU3RyaW5nKGN1cnIpLFxuICAgIHJuZCxcbiAgICBoYXNoLFxuICAgIERlc2NyaXB0aW9uOiBib2R5LmRlc2NyaXB0aW9uIHx8IFwiXCIsXG4gIH07XG5cbiAgY29uc3QgcmVzcG9uc2U6IFZha2lmSW5pdFJlc3BvbnNlID0geyBnYXRld2F5VXJsLCBmaWVsZHMgfTtcbiAgcmVzLmpzb24ocmVzcG9uc2UpO1xufTtcblxuZXhwb3J0IGNvbnN0IHZha2lmUmV0dXJuOiBSZXF1ZXN0SGFuZGxlciA9IChyZXEsIHJlcykgPT4ge1xuICBjb25zdCBkYXRhID0geyAuLi5yZXEucXVlcnksIC4uLnJlcS5ib2R5IH0gYXMgUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcbiAgY29uc3QgbWRTdGF0dXMgPSBTdHJpbmcoZGF0YS5tZFN0YXR1cyB8fCBcIlwiKTtcbiAgY29uc3QgcHJvY0NvZGUgPSBTdHJpbmcoZGF0YS5Qcm9jUmV0dXJuQ29kZSB8fCBkYXRhLnByb2NSZXR1cm5Db2RlIHx8IFwiXCIpO1xuICBjb25zdCBzdWNjZXNzID1cbiAgICBbXCIxXCIsIFwiMlwiLCBcIjNcIiwgXCI0XCJdLmluY2x1ZGVzKG1kU3RhdHVzKSAmJlxuICAgIChwcm9jQ29kZSA9PT0gXCIwMFwiIHx8IHByb2NDb2RlID09PSBcIjBcIik7XG4gIGNvbnN0IG9pZCA9IGRhdGEub2lkIHx8IGRhdGEuT2lkIHx8IFwiXCI7XG5cbiAgY29uc3QgaHRtbCA9IGA8IWRvY3R5cGUgaHRtbD48bWV0YSBjaGFyc2V0PSd1dGYtOCcgLz5cbiAgPHN0eWxlPmJvZHl7Zm9udC1mYW1pbHk6SW50ZXIsc3lzdGVtLXVpLEFyaWFsLHNhbnMtc2VyaWY7cGFkZGluZzozMnB4fSAub2t7Y29sb3I6IzBhN2YyZX0gLmZhaWx7Y29sb3I6I2IwMDAyMH08L3N0eWxlPlxuICA8aDI+JHtzdWNjZXNzID8gXCJSZXplcnZhc3lvbnVudXogb25heWxhbm1cdTAxMzFcdTAxNUZ0XHUwMTMxclwiIDogXCJcdTAwRDZkZW1lIGJhXHUwMTVGYXJcdTAxMzFzXHUwMTMxelwifTwvaDI+XG4gIDxwPlNpcGFyaVx1MDE1RiBObzogPGI+JHtvaWR9PC9iPjwvcD5cbiAgPHA+RHVydW06IG1kU3RhdHVzPSR7bWRTdGF0dXN9IFByb2NSZXR1cm5Db2RlPSR7cHJvY0NvZGV9PC9wPlxuICA8c2NyaXB0PnRyeXt3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3BheW1lbnRfcmVzdWx0JywgSlNPTi5zdHJpbmdpZnkoJHtKU09OLnN0cmluZ2lmeShcbiAgICB7IHN1Y2Nlc3M6IHRydWUgfSxcbiAgKX0pKTt9Y2F0Y2goZSl7fTwvc2NyaXB0PmA7XG5cbiAgcmVzLnN0YXR1cyhzdWNjZXNzID8gMjAwIDogNDAwKS5zZW5kKGh0bWwpO1xufTtcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2FwcC9jb2RlL3NlcnZlci9yb3V0ZXNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9hcHAvY29kZS9zZXJ2ZXIvcm91dGVzL3ZvdWNoZXIudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2FwcC9jb2RlL3NlcnZlci9yb3V0ZXMvdm91Y2hlci50c1wiO2ltcG9ydCB0eXBlIHsgUmVxdWVzdEhhbmRsZXIgfSBmcm9tIFwiZXhwcmVzc1wiO1xuXG5leHBvcnQgY29uc3Qgc2VuZFZvdWNoZXJFbWFpbDogUmVxdWVzdEhhbmRsZXIgPSBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCB7IHRvLCBzdWJqZWN0LCBodG1sIH0gPSByZXEuYm9keSBhcyB7XG4gICAgICB0bz86IHN0cmluZztcbiAgICAgIHN1YmplY3Q/OiBzdHJpbmc7XG4gICAgICBodG1sPzogc3RyaW5nO1xuICAgIH07XG4gICAgaWYgKCF0bykgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKHsgZXJyb3I6IFwiTWlzc2luZyByZWNpcGllbnQgZW1haWxcIiB9KTtcblxuICAgIGNvbnN0IGhvc3QgPSBwcm9jZXNzLmVudi5TTVRQX0hPU1Q7XG4gICAgY29uc3QgdXNlciA9IHByb2Nlc3MuZW52LlNNVFBfVVNFUjtcbiAgICBjb25zdCBwYXNzID0gcHJvY2Vzcy5lbnYuU01UUF9QQVNTO1xuICAgIGNvbnN0IGZyb20gPSBwcm9jZXNzLmVudi5TTVRQX0ZST00gfHwgdXNlcjtcbiAgICBjb25zdCBwb3J0ID0gTnVtYmVyKHByb2Nlc3MuZW52LlNNVFBfUE9SVCB8fCA1ODcpO1xuICAgIGNvbnN0IHNlY3VyZSA9XG4gICAgICBTdHJpbmcocHJvY2Vzcy5lbnYuU01UUF9TRUNVUkUgfHwgXCJmYWxzZVwiKS50b0xvd2VyQ2FzZSgpID09PSBcInRydWVcIjtcblxuICAgIGlmICghaG9zdCB8fCAhdXNlciB8fCAhcGFzcyB8fCAhZnJvbSkge1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAxKS5qc29uKHsgZXJyb3I6IFwiU01UUCBub3QgY29uZmlndXJlZCBvbiBzZXJ2ZXJcIiB9KTtcbiAgICB9XG5cbiAgICBsZXQgbm9kZW1haWxlcjogYW55O1xuICAgIHRyeSB7XG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXZhci1yZXF1aXJlc1xuICAgICAgbm9kZW1haWxlciA9IHJlcXVpcmUoXCJub2RlbWFpbGVyXCIpO1xuICAgIH0gY2F0Y2gge1xuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAxKS5qc29uKHsgZXJyb3I6IFwiRW1haWwgbGlicmFyeSBub3QgaW5zdGFsbGVkXCIgfSk7XG4gICAgfVxuXG4gICAgY29uc3QgdHJhbnNwb3J0ZXIgPSBub2RlbWFpbGVyLmNyZWF0ZVRyYW5zcG9ydCh7XG4gICAgICBob3N0LFxuICAgICAgcG9ydCxcbiAgICAgIHNlY3VyZSxcbiAgICAgIGF1dGg6IHsgdXNlciwgcGFzcyB9LFxuICAgIH0pO1xuICAgIGF3YWl0IHRyYW5zcG9ydGVyLnNlbmRNYWlsKHtcbiAgICAgIGZyb20sXG4gICAgICB0byxcbiAgICAgIHN1YmplY3Q6IHN1YmplY3QgfHwgXCJWb3VjaGVyXCIsXG4gICAgICBodG1sOiBodG1sIHx8IFwiXCIsXG4gICAgfSk7XG4gICAgcmVzLmpzb24oeyBvazogdHJ1ZSB9KTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6IFwiRmFpbGVkIHRvIHNlbmQgZW1haWxcIiB9KTtcbiAgfVxufTtcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2FwcC9jb2RlL3NlcnZlci9yb3V0ZXNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9hcHAvY29kZS9zZXJ2ZXIvcm91dGVzL3JhdGVzLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9hcHAvY29kZS9zZXJ2ZXIvcm91dGVzL3JhdGVzLnRzXCI7Y29uc3QgQ0FDSEVfVFRMID0gMTAwMCAqIDYwICogNTsgLy8gNSBtaW51dGVzXG5sZXQgY2FjaGUgPSBudWxsO1xuXG5hc3luYyBmdW5jdGlvbiBmZXRjaFRDTUIoKSB7XG4gIHRyeSB7XG4gICAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goXCJodHRwczovL3d3dy50Y21iLmdvdi50ci9rdXJsYXIvdG9kYXkueG1sXCIpO1xuICAgIGlmICghcmVzLm9rKSByZXR1cm4gbnVsbDtcbiAgICBjb25zdCB0eHQgPSBhd2FpdCByZXMudGV4dCgpO1xuICAgIGNvbnN0IGNvZGVzID0gW1wiVVNEXCIsIFwiRVVSXCIsIFwiR0JQXCIsIFwiUlVCXCJdO1xuICAgIGNvbnN0IG1hcCA9IHt9O1xuICAgIGZvciAoY29uc3QgYyBvZiBjb2Rlcykge1xuICAgICAgY29uc3QgcmUgPSBuZXcgUmVnRXhwKGA8Q3VycmVuY3lbXj5dKktvZD1cXFxcXCIke2N9XFxcXFwiW1xcXFxzXFxcXFNdKj88Rm9yZXhTZWxsaW5nPiguKj8pPFxcXFwvRm9yZXhTZWxsaW5nPmAsIFwiaVwiKTtcbiAgICAgIGNvbnN0IG0gPSB0eHQubWF0Y2gocmUpO1xuICAgICAgaWYgKG0gJiYgbVsxXSkge1xuICAgICAgICBjb25zdCB2YWwgPSBwYXJzZUZsb2F0KG1bMV0ucmVwbGFjZSgvLC9nLCAnLicpKTtcbiAgICAgICAgbWFwW2NdID0gaXNOYU4odmFsKSA/IG51bGwgOiB2YWw7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBtYXBbY10gPSBudWxsO1xuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBkYXRlTWF0Y2ggPSB0eHQubWF0Y2goLzxUYXJpaD0oXCJ8JykoLio/KVxcMS8pO1xuICAgIGNvbnN0IGRhdGUgPSBkYXRlTWF0Y2ggPyBkYXRlTWF0Y2hbMl0gOiBudWxsO1xuICAgIHJldHVybiB7IG1hcCwgZGF0ZSB9O1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IGV4Y2hhbmdlSGFuZGxlciA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICB0cnkge1xuICAgIGNvbnN0IG5vdyA9IERhdGUubm93KCk7XG4gICAgaWYgKGNhY2hlICYmIG5vdyAtIGNhY2hlLnRzIDwgQ0FDSEVfVFRMKSB7XG4gICAgICByZXR1cm4gcmVzLmpzb24oY2FjaGUuZGF0YSk7XG4gICAgfVxuXG4gICAgY29uc3Qgc3ltYm9scyA9IFtcIlVTRFwiLCBcIlRSWVwiLCBcIkdCUFwiLCBcIlJVQlwiXS5qb2luKFwiLFwiKTtcbiAgICBjb25zdCBiYXNlID0gXCJFVVJcIjtcblxuICAgIGNvbnN0IHRjbWIgPSBhd2FpdCBmZXRjaFRDTUIoKTtcblxuICAgIGNvbnN0IGxhdGVzdFJlcyA9IGF3YWl0IGZldGNoKGBodHRwczovL2FwaS5leGNoYW5nZXJhdGUuaG9zdC9sYXRlc3Q/YmFzZT0ke2Jhc2V9JnN5bWJvbHM9JHtzeW1ib2xzfWApO1xuICAgIGlmICghbGF0ZXN0UmVzLm9rKSB7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDIpLmpzb24oeyBlcnJvcjogXCJGYWlsZWQgdG8gZmV0Y2ggbGF0ZXN0IHJhdGVzXCIgfSk7XG4gICAgfVxuICAgIGNvbnN0IGxhdGVzdCA9IGF3YWl0IGxhdGVzdFJlcy5qc29uKCk7XG5cbiAgICBjb25zdCBlbmQgPSBuZXcgRGF0ZSgpO1xuICAgIGNvbnN0IHN0YXJ0ID0gbmV3IERhdGUoKTtcbiAgICBzdGFydC5zZXREYXRlKGVuZC5nZXREYXRlKCkgLSA2KTtcbiAgICBjb25zdCBzID0gc3RhcnQudG9JU09TdHJpbmcoKS5zbGljZSgwLCAxMCk7XG4gICAgY29uc3QgZSA9IGVuZC50b0lTT1N0cmluZygpLnNsaWNlKDAsIDEwKTtcbiAgICBjb25zdCB0c1JlcyA9IGF3YWl0IGZldGNoKGBodHRwczovL2FwaS5leGNoYW5nZXJhdGUuaG9zdC90aW1lc2VyaWVzP3N0YXJ0X2RhdGU9JHtzfSZlbmRfZGF0ZT0ke2V9JmJhc2U9RVVSJnN5bWJvbHM9JHtzeW1ib2xzfWApO1xuICAgIGxldCBoaXN0b3J5ID0gbnVsbDtcbiAgICBpZiAodHNSZXMub2spIHtcbiAgICAgIGNvbnN0IHRzID0gYXdhaXQgdHNSZXMuanNvbigpO1xuICAgICAgY29uc3Qgb2JqID0ge307XG4gICAgICBjb25zdCBkYXRlcyA9IE9iamVjdC5rZXlzKHRzLnJhdGVzIHx8IHt9KS5zb3J0KCk7XG4gICAgICBkYXRlcy5mb3JFYWNoKChkYXRlKSA9PiB7XG4gICAgICAgIGNvbnN0IGRheSA9IHRzLnJhdGVzW2RhdGVdO1xuICAgICAgICBPYmplY3QuZW50cmllcyhkYXkpLmZvckVhY2goKFtrLCB2XSkgPT4ge1xuICAgICAgICAgIGlmICghb2JqW2tdKSBvYmpba10gPSBbXTtcbiAgICAgICAgICBvYmpba10ucHVzaChOdW1iZXIodikpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgICAgaGlzdG9yeSA9IG9iajtcbiAgICB9XG5cbiAgICBjb25zdCB0Y21iU2VsbGluZyA9IHt9O1xuICAgIGZvciAoY29uc3QgayBvZiBbXCJVU0RcIiwgXCJFVVJcIiwgXCJHQlBcIiwgXCJSVUJcIl0pIHtcbiAgICAgIGlmICh0Y21iICYmIHRjbWIubWFwICYmIHRjbWIubWFwW2tdKSB7XG4gICAgICAgIHRjbWJTZWxsaW5nW2tdID0gdGNtYi5tYXBba107XG4gICAgICB9IGVsc2UgaWYgKGxhdGVzdCAmJiBsYXRlc3QucmF0ZXMpIHtcbiAgICAgICAgY29uc3QgZXVyVG9LID0gTnVtYmVyKGxhdGVzdC5yYXRlc1trXSkgfHwgbnVsbDtcbiAgICAgICAgY29uc3QgZXVyVG9UUlkgPSBOdW1iZXIobGF0ZXN0LnJhdGVzWydUUlknXSkgfHwgbnVsbDtcbiAgICAgICAgaWYgKGV1clRvSyAmJiBldXJUb1RSWSkge1xuICAgICAgICAgIHRjbWJTZWxsaW5nW2tdID0gZXVyVG9UUlkgLyBldXJUb0s7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGNtYlNlbGxpbmdba10gPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0Y21iU2VsbGluZ1trXSA9IG51bGw7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgcGF5bG9hZCA9IHsgcmF0ZXM6IGxhdGVzdC5yYXRlcyB8fCBudWxsLCBoaXN0b3J5LCBkYXRlOiBsYXRlc3QuZGF0ZSB8fCBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkuc2xpY2UoMCwgMTApLCB0Y21iOiB0Y21iU2VsbGluZywgdGNtYl9kYXRlOiB0Y21iPy5kYXRlIHx8IG51bGwgfTtcbiAgICBjYWNoZSA9IHsgdHM6IG5vdywgZGF0YTogcGF5bG9hZCB9O1xuICAgIHJldHVybiByZXMuanNvbihwYXlsb2FkKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiBcImV4Y2hhbmdlX2Vycm9yXCIgfSk7XG4gIH1cbn07XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9hcHAvY29kZVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2FwcC9jb2RlL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9hcHAvY29kZS92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZywgUGx1Z2luIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3Qtc3djXCI7XG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHsgY3JlYXRlU2VydmVyIH0gZnJvbSBcIi4vc2VydmVyXCI7XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiAoe1xuICBzZXJ2ZXI6IHtcbiAgICBob3N0OiBcIjo6XCIsXG4gICAgcG9ydDogODA4MCxcbiAgICBmczoge1xuICAgICAgYWxsb3c6IFtcIi4vY2xpZW50XCIsIFwiLi9zaGFyZWRcIl0sXG4gICAgICBkZW55OiBbXCIuZW52XCIsIFwiLmVudi4qXCIsIFwiKi57Y3J0LHBlbX1cIiwgXCIqKi8uZ2l0LyoqXCIsIFwic2VydmVyLyoqXCJdLFxuICAgIH0sXG4gIH0sXG4gIGJ1aWxkOiB7XG4gICAgb3V0RGlyOiBcImRpc3Qvc3BhXCIsXG4gIH0sXG4gIHBsdWdpbnM6IFtyZWFjdCgpLCBleHByZXNzUGx1Z2luKCldLFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vY2xpZW50XCIpLFxuICAgICAgXCJAc2hhcmVkXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zaGFyZWRcIiksXG4gICAgfSxcbiAgfSxcbn0pKTtcblxuZnVuY3Rpb24gZXhwcmVzc1BsdWdpbigpOiBQbHVnaW4ge1xuICByZXR1cm4ge1xuICAgIG5hbWU6IFwiZXhwcmVzcy1wbHVnaW5cIixcbiAgICBhcHBseTogXCJzZXJ2ZVwiLCAvLyBPbmx5IGFwcGx5IGR1cmluZyBkZXZlbG9wbWVudCAoc2VydmUgbW9kZSlcbiAgICBjb25maWd1cmVTZXJ2ZXIoc2VydmVyKSB7XG4gICAgICBjb25zdCBhcHAgPSBjcmVhdGVTZXJ2ZXIoKTtcblxuICAgICAgLy8gQWRkIEV4cHJlc3MgYXBwIGFzIG1pZGRsZXdhcmUgdG8gVml0ZSBkZXYgc2VydmVyXG4gICAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKGFwcCk7XG4gICAgfSxcbiAgfTtcbn1cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2FwcC9jb2RlL3NlcnZlclwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2FwcC9jb2RlL3NlcnZlci9pbmRleC50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vYXBwL2NvZGUvc2VydmVyL2luZGV4LnRzXCI7aW1wb3J0IFwiZG90ZW52L2NvbmZpZ1wiO1xuaW1wb3J0IGV4cHJlc3MgZnJvbSBcImV4cHJlc3NcIjtcbmltcG9ydCBjb3JzIGZyb20gXCJjb3JzXCI7XG5pbXBvcnQgeyBoYW5kbGVEZW1vIH0gZnJvbSBcIi4vcm91dGVzL2RlbW9cIjtcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVNlcnZlcigpIHtcbiAgY29uc3QgYXBwID0gZXhwcmVzcygpO1xuXG4gIC8vIE1pZGRsZXdhcmVcbiAgYXBwLnVzZShjb3JzKCkpO1xuICBhcHAudXNlKGV4cHJlc3MuanNvbigpKTtcbiAgYXBwLnVzZShleHByZXNzLnVybGVuY29kZWQoeyBleHRlbmRlZDogdHJ1ZSB9KSk7XG5cbiAgLy8gRXhhbXBsZSBBUEkgcm91dGVzXG4gIGFwcC5nZXQoXCIvYXBpL3BpbmdcIiwgKF9yZXEsIHJlcykgPT4ge1xuICAgIGNvbnN0IHBpbmcgPSBwcm9jZXNzLmVudi5QSU5HX01FU1NBR0UgPz8gXCJwaW5nXCI7XG4gICAgcmVzLmpzb24oeyBtZXNzYWdlOiBwaW5nIH0pO1xuICB9KTtcblxuICBhcHAuZ2V0KFwiL2FwaS9kZW1vXCIsIGhhbmRsZURlbW8pO1xuXG4gIC8vIFZha2lmQmFuayBwYXltZW50IGVuZHBvaW50c1xuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXZhci1yZXF1aXJlc1xuICBjb25zdCB2YWtpZiA9IHJlcXVpcmUoXCIuL3JvdXRlcy92YWtpZlwiKSBhcyB0eXBlb2YgaW1wb3J0KFwiLi9yb3V0ZXMvdmFraWZcIik7XG4gIGFwcC5wb3N0KFwiL2FwaS9wYXltZW50cy92YWtpZi9pbml0XCIsIHZha2lmLnZha2lmSW5pdCk7XG4gIGFwcC5hbGwoXCIvYXBpL3BheW1lbnRzL3Zha2lmL3JldHVyblwiLCB2YWtpZi52YWtpZlJldHVybik7XG5cbiAgY29uc3Qgdm91Y2hlciA9XG4gICAgcmVxdWlyZShcIi4vcm91dGVzL3ZvdWNoZXJcIikgYXMgdHlwZW9mIGltcG9ydChcIi4vcm91dGVzL3ZvdWNoZXJcIik7XG4gIGFwcC5wb3N0KFwiL2FwaS92b3VjaGVyLWVtYWlsXCIsIHZvdWNoZXIuc2VuZFZvdWNoZXJFbWFpbCk7XG5cbiAgLy8gRXhjaGFuZ2UgcmF0ZXMgcHJveHkgKyBjYWNoZVxuICBjb25zdCBleGNoYW5nZSA9IHJlcXVpcmUoXCIuL3JvdXRlcy9yYXRlc1wiKSBhcyB0eXBlb2YgaW1wb3J0KFwiLi9yb3V0ZXMvcmF0ZXNcIik7XG4gIGFwcC5nZXQoXCIvYXBpL2V4Y2hhbmdlXCIsIGV4Y2hhbmdlLmV4Y2hhbmdlSGFuZGxlcik7XG5cbiAgcmV0dXJuIGFwcDtcbn1cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2FwcC9jb2RlL3NlcnZlci9yb3V0ZXNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9hcHAvY29kZS9zZXJ2ZXIvcm91dGVzL2RlbW8udHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2FwcC9jb2RlL3NlcnZlci9yb3V0ZXMvZGVtby50c1wiO2ltcG9ydCB7IFJlcXVlc3RIYW5kbGVyIH0gZnJvbSBcImV4cHJlc3NcIjtcbmltcG9ydCB7IERlbW9SZXNwb25zZSB9IGZyb20gXCJAc2hhcmVkL2FwaVwiO1xuXG5leHBvcnQgY29uc3QgaGFuZGxlRGVtbzogUmVxdWVzdEhhbmRsZXIgPSAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgcmVzcG9uc2U6IERlbW9SZXNwb25zZSA9IHtcbiAgICBtZXNzYWdlOiBcIkhlbGxvIGZyb20gRXhwcmVzcyBzZXJ2ZXJcIixcbiAgfTtcbiAgcmVzLnN0YXR1cygyMDApLmpzb24ocmVzcG9uc2UpO1xufTtcbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUNBLE9BQU8sWUFBWTtBQUduQixTQUFTLFVBQVUsTUFBYyxNQUFjO0FBQzdDLFNBQU8sT0FBTyxXQUFXLElBQUksRUFBRSxPQUFPLE1BQU0sTUFBTSxFQUFFLE9BQU8sUUFBUTtBQUNyRTtBQUVBLFNBQVMsZUFBZSxRQUFnQjtBQUV0QyxTQUFPLE9BQU8sUUFBUSxDQUFDO0FBQ3pCO0FBWEEsSUFhYSxXQWlFQTtBQTlFYjtBQUFBO0FBYU8sSUFBTSxZQUE0QixDQUFDLEtBQUssUUFBUTtBQUNyRCxZQUFNLE9BQU8sSUFBSTtBQUNqQixZQUFNLFdBQVcsUUFBUSxJQUFJLG1CQUFtQjtBQUNoRCxZQUFNLFdBQVcsUUFBUSxJQUFJLG1CQUFtQjtBQUNoRCxZQUFNLGFBQWEs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
