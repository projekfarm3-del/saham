// pages/index.js
import { useState, useCallback } from "react";
import Head from "next/head";

// ─── Helpers ────────────────────────────────────────────────────────────────
const raw = (obj, ...keys) => {
  let cur = obj;
  for (const k of keys) cur = cur?.[k];
  return cur?.raw ?? cur ?? null;
};

const fmt = (n, dec = 0) => {
  if (n == null || isNaN(n)) return "—";
  return Number(n).toLocaleString("id-ID", {
    minimumFractionDigits: dec,
    maximumFractionDigits: dec,
  });
};

const fmtT = (n) => {
  if (n == null || isNaN(n)) return "—";
  if (Math.abs(n) >= 1e12) return (n / 1e12).toFixed(2) + " T";
  if (Math.abs(n) >= 1e9) return (n / 1e9).toFixed(2) + " M";
  return fmt(n);
};

const fmtPct = (n, dec = 1) => {
  if (n == null || isNaN(n)) return "—";
  return (n * 100).toFixed(dec) + "%";
};

const COLOR = {
  green: { bg: "#e6fff8", text: "#006b50", border: "#00c89640" },
  yellow: { bg: "#fff8e6", text: "#8a5c00", border: "#f5a62340" },
  red: { bg: "#fff0f0", text: "#8a0000", border: "#ff444440" },
  blue: { bg: "#e8f3ff", text: "#003d8f", border: "#0070f340" },
  gray: { bg: "#f0f0ee", text: "#555", border: "#e5e5e5" },
};

const POPULAR = ["BBCA", "TLKM", "ASII", "BMRI", "GOTO", "BREN", "UNVR", "HMSP", "BBRI", "ICBP"];

// ─── Sub-components ─────────────────────────────────────────────────────────
function Badge({ color = "blue", children }) {
  const c = COLOR[color];
  return (
    <span style={{
      display: "inline-block",
      background: c.bg,
      color: c.text,
      border: `1px solid ${c.border}`,
      borderRadius: 20,
      padding: "2px 10px",
      fontSize: 12,
      fontWeight: 500,
      fontFamily: "var(--mono)",
    }}>{children}</span>
  );
}

function KpiCard({ label, value, sub, mono = false, color }) {
  const c = color ? COLOR[color] : null;
  return (
    <div style={{
      background: c ? c.bg : "#fff",
      border: `1px solid ${c ? c.border : "#e5e5e5"}`,
      borderRadius: "var(--card-r)",
      padding: "16px",
    }}>
      <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 500 }}>{label}</div>
      <div style={{
        fontSize: 22,
        fontWeight: 600,
        color: c ? c.text : "var(--text)",
        fontFamily: mono ? "var(--mono)" : "var(--sans)",
        lineHeight: 1.2,
        marginBottom: sub ? 4 : 0,
      }}>{value ?? "—"}</div>
      {sub && <div style={{ fontSize: 12, color: c ? c.text : "var(--text-3)", opacity: 0.75 }}>{sub}</div>}
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div style={{
      fontSize: 11,
      fontWeight: 600,
      color: "var(--text-3)",
      textTransform: "uppercase",
      letterSpacing: "0.1em",
      marginBottom: 10,
      display: "flex",
      alignItems: "center",
      gap: 8,
    }}>
      <span style={{ flex: 1, height: 1, background: "var(--border)" }} />
      {children}
      <span style={{ flex: 1, height: 1, background: "var(--border)" }} />
    </div>
  );
}

function Table({ headers, rows }) {
  return (
    <div style={{ overflowX: "auto", border: "1px solid var(--border)", borderRadius: "var(--card-r)" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontFamily: "var(--mono)" }}>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} style={{
                padding: "10px 14px",
                textAlign: i === 0 ? "left" : "right",
                background: "#f0f0ee",
                fontFamily: "var(--sans)",
                fontWeight: 600,
                fontSize: 11,
                color: "var(--text-2)",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                borderBottom: "1px solid var(--border)",
                whiteSpace: "nowrap",
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{ borderBottom: ri < rows.length - 1 ? "1px solid var(--border)" : "none" }}>
              {row.map((cell, ci) => (
                <td key={ci} style={{
                  padding: "10px 14px",
                  textAlign: ci === 0 ? "left" : "right",
                  color: "var(--text)",
                }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Projection Engine ───────────────────────────────────────────────────────
function calcProjection({ eps, price, growth, perTarget, years, mos }) {
  const g = growth / 100;
  const mosD = mos / 100;
  const fvBase = eps * Math.pow(1 + g, years) * perTarget;
  const mosPrice = fvBase * (1 - mosD);
  const expRet = ((fvBase - price) / price) * 100;

  let verdict;
  if (price <= mosPrice) verdict = "undervalued";
  else if (price <= fvBase * 1.1) verdict = "fair";
  else verdict = "overvalued";

  const projRows = Array.from({ length: years }, (_, i) => {
    const yr = i + 1;
    const fEps = eps * Math.pow(1 + g, yr);
    const fPrc = fEps * perTarget;
    const ret = ((fPrc - price) / price) * 100;
    const cagr = (Math.pow(fPrc / price, 1 / yr) - 1) * 100;
    return { yr, fEps, fPrc, ret, cagr };
  });

  const scenarios = [
    { name: "Bull 🐂", gm: 1.5, pm: 1.2 },
    { name: "Base 📊", gm: 1.0, pm: 1.0 },
    { name: "Bear 🐻", gm: 0.5, pm: 0.8 },
  ].map((s) => {
    const fEps = eps * Math.pow(1 + g * s.gm, years);
    const fPrc = fEps * perTarget * s.pm;
    const ret = ((fPrc - price) / price) * 100;
    const cagr = (Math.pow(fPrc / price, 1 / years) - 1) * 100;
    return { ...s, fPrc, ret, cagr };
  });

  return { fvBase, mosPrice, expRet, verdict, projRows, scenarios };
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function Home() {
  const [ticker, setTicker] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);
  const [params, setParams] = useState({ growth: 10, perTarget: 15, years: 5, mos: 30 });

  const analyze = useCallback(async (t) => {
    const symbol = (t || ticker).trim().toUpperCase();
    if (!symbol) return;
    setLoading(true);
    setError("");
    setData(null);

    try {
      const res = await fetch(`/api/stock?ticker=${symbol}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal mengambil data");
      if (!json.quoteSummary?.result?.[0]) throw new Error("Data tidak tersedia untuk " + symbol);
      const d = json.quoteSummary.result[0];
      const eps = raw(d, "defaultKeyStatistics", "trailingEps");
      const per = raw(d, "summaryDetail", "trailingPE") || raw(d, "defaultKeyStatistics", "trailingPE");
      setParams((p) => ({ ...p, perTarget: per ? Math.round(per) : 15 }));
      setData(d);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [ticker]);

  const handleKey = (e) => { if (e.key === "Enter") analyze(); };

  // Derived data
  let derived = null;
  if (data) {
    const price = raw(data, "price", "regularMarketPrice");
    const eps = raw(data, "defaultKeyStatistics", "trailingEps");
    if (eps && price) {
      derived = calcProjection({ eps, price, ...params });
    }
  }

  const verdictStyle = derived
    ? derived.verdict === "undervalued" ? COLOR.green
      : derived.verdict === "fair" ? COLOR.yellow
      : COLOR.red
    : null;

  const verdictText = derived
    ? derived.verdict === "undervalued"
      ? { label: "Sinyal Beli", title: "UNDERVALUED", emoji: "↓" }
      : derived.verdict === "fair"
      ? { label: "Harga Wajar", title: "FAIR VALUE", emoji: "=" }
      : { label: "Harga Mahal", title: "OVERVALUED", emoji: "↑" }
    : null;

  return (
    <>
      <Head>
        <title>Analisa Saham IDX — Tools Valuasi Saham Indonesia</title>
        <meta name="description" content="Tools analisa valuasi saham Indonesia secara realtime. Cukup masukkan kode saham IDX." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div style={{ minHeight: "100vh", background: "var(--surface)" }}>
        {/* ── Topbar ── */}
        <div style={{
          background: "#fff",
          borderBottom: "1px solid var(--border)",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          height: 56,
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}>
          <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: "-0.02em", color: "var(--text)" }}>
            <span style={{ color: "var(--green)" }}>▲</span> SahamAnalyzer
          </div>
          <div style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-3)", fontFamily: "var(--mono)" }}>
            Data: Yahoo Finance · IDX
          </div>
        </div>

        <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 20px 80px" }}>

          {/* ── Hero Search ── */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <h1 style={{
              fontSize: "clamp(28px, 5vw, 44px)",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              color: "var(--text)",
              marginBottom: 8,
              lineHeight: 1.1,
            }}>
              Analisa Saham IDX
            </h1>
            <p style={{ fontSize: 15, color: "var(--text-2)", marginBottom: 28 }}>
              Ketik kode saham → data fundamental & valuasi langsung tersedia
            </p>

            {/* Search */}
            <div style={{
              display: "flex",
              gap: 8,
              maxWidth: 480,
              margin: "0 auto 16px",
            }}>
              <input
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                onKeyDown={handleKey}
                placeholder="BBCA, TLKM, GOTO ..."
                style={{
                  flex: 1,
                  height: 48,
                  padding: "0 16px",
                  fontSize: 16,
                  fontFamily: "var(--mono)",
                  fontWeight: 500,
                  letterSpacing: "0.05em",
                  border: "1.5px solid var(--border)",
                  borderRadius: "var(--card-r)",
                  background: "#fff",
                  color: "var(--text)",
                  outline: "none",
                  transition: "border-color 0.15s",
                }}
                onFocus={(e) => e.target.style.borderColor = "var(--green)"}
                onBlur={(e) => e.target.style.borderColor = "var(--border)"}
              />
              <button
                onClick={() => analyze()}
                disabled={loading}
                style={{
                  height: 48,
                  padding: "0 24px",
                  background: loading ? "#ccc" : "var(--green)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "var(--card-r)",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "background 0.15s, transform 0.1s",
                  fontFamily: "var(--sans)",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => !loading && (e.target.style.background = "var(--green-d)")}
                onMouseLeave={(e) => !loading && (e.target.style.background = "var(--green)")}
              >
                {loading ? "Memuat..." : "Analisa →"}
              </button>
            </div>

            {/* Chips */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>
              {POPULAR.map((t) => (
                <button
                  key={t}
                  onClick={() => { setTicker(t); analyze(t); }}
                  style={{
                    background: "#fff",
                    border: "1px solid var(--border)",
                    borderRadius: 20,
                    padding: "4px 12px",
                    fontSize: 12,
                    fontFamily: "var(--mono)",
                    color: "var(--text-2)",
                    cursor: "pointer",
                    transition: "border-color 0.12s, color 0.12s",
                  }}
                  onMouseEnter={(e) => { e.target.style.borderColor = "var(--green)"; e.target.style.color = "var(--green-d)"; }}
                  onMouseLeave={(e) => { e.target.style.borderColor = "var(--border)"; e.target.style.color = "var(--text-2)"; }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* ── Error ── */}
          {error && (
            <div style={{
              background: COLOR.red.bg,
              border: `1px solid ${COLOR.red.border}`,
              borderRadius: "var(--card-r)",
              padding: "14px 18px",
              color: COLOR.red.text,
              fontSize: 14,
              marginBottom: 24,
            }}>
              <strong>Gagal:</strong> {error}
            </div>
          )}

          {/* ── Loading skeleton ── */}
          {loading && (
            <div style={{ textAlign: "center", padding: "80px 0", color: "var(--text-3)" }}>
              <div style={{
                width: 40, height: 40, border: "3px solid var(--border)",
                borderTopColor: "var(--green)", borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
                margin: "0 auto 16px",
              }} />
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              <div style={{ fontSize: 14 }}>Mengambil data dari Yahoo Finance...</div>
            </div>
          )}

          {/* ── Main Result ── */}
          {data && !loading && (() => {
            const d = data;
            const price     = raw(d, "price", "regularMarketPrice");
            const change    = raw(d, "price", "regularMarketChangePercent");
            const changeAbs = raw(d, "price", "regularMarketChange");
            const mktcap    = raw(d, "price", "marketCap");
            const eps       = raw(d, "defaultKeyStatistics", "trailingEps");
            const per       = raw(d, "summaryDetail", "trailingPE") || raw(d, "defaultKeyStatistics", "trailingPE");
            const pbv       = raw(d, "defaultKeyStatistics", "priceToBook");
            const psr       = raw(d, "summaryDetail", "priceToSalesTrailing12Months");
            const rev       = raw(d, "financialData", "totalRevenue");
            const netInc    = raw(d, "financialData", "netIncomeToCommon");
            const margin    = raw(d, "financialData", "profitMargins");
            const roe       = raw(d, "financialData", "returnOnEquity");
            const roa       = raw(d, "financialData", "returnOnAssets");
            const divY      = raw(d, "summaryDetail", "dividendYield");
            const divRate   = raw(d, "summaryDetail", "dividendRate");
            const beta      = raw(d, "summaryDetail", "beta");
            const tgtMean   = raw(d, "financialData", "targetMeanPrice");
            const tgtHigh   = raw(d, "financialData", "targetHighPrice");
            const tgtLow    = raw(d, "financialData", "targetLowPrice");
            const rec       = raw(d, "financialData", "recommendationKey");
            const recN      = raw(d, "financialData", "numberOfAnalystOpinions");
            const equity    = raw(d, "defaultKeyStatistics", "bookValue");
            const shares    = raw(d, "defaultKeyStatistics", "sharesOutstanding");
            const debtEq    = raw(d, "financialData", "debtToEquity");
            const currRat   = raw(d, "financialData", "currentRatio");
            const quickRat  = raw(d, "financialData", "quickRatio");
            const fiftyTwoH = raw(d, "summaryDetail", "fiftyTwoWeekHigh");
            const fiftyTwoL = raw(d, "summaryDetail", "fiftyTwoWeekLow");
            const name      = raw(d, "price", "longName") || raw(d, "price", "shortName") || ticker;
            const sector    = raw(d, "summaryDetail", "sector") || "—";
            const currency  = raw(d, "price", "currency") || "IDR";

            // Analyst EPS estimates
            const epsEst = raw(d, "earningsTrend", "trend", 0, "epsTrend", "current");
            const epsGrowthEst = raw(d, "earningsTrend", "trend", 0, "growth", "raw");

            const recMap = {
              strong_buy: "Strong Buy", buy: "Buy", hold: "Hold",
              underperform: "Underperform", sell: "Sell",
            };
            const recColorMap = {
              strong_buy: "green", buy: "green", hold: "yellow",
              underperform: "red", sell: "red",
            };

            const bvPerShare = equity;
            const upside = tgtMean && price ? ((tgtMean - price) / price * 100) : null;

            return (
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

                {/* ── Company Header ── */}
                <div style={{
                  background: "#fff",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--card-r)",
                  padding: "20px 24px",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  flexWrap: "wrap",
                }}>
                  <div style={{
                    width: 48, height: 48,
                    background: "var(--green-bg)",
                    borderRadius: 10,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 700, fontSize: 16,
                    color: "var(--green-d)",
                    fontFamily: "var(--mono)",
                    flexShrink: 0,
                  }}>
                    {(ticker || "").substring(0, 2)}
                  </div>
                  <div style={{ flex: 1, minWidth: 120 }}>
                    <div style={{ fontWeight: 700, fontSize: 18, letterSpacing: "-0.01em" }}>{name}</div>
                    <div style={{ fontSize: 12, color: "var(--text-3)", fontFamily: "var(--mono)", marginTop: 2 }}>
                      {(ticker.includes(".") ? ticker : ticker + ".JK")} · {currency}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "var(--mono)", letterSpacing: "-0.02em" }}>
                      Rp {fmt(price)}
                    </div>
                    <div style={{ fontSize: 13, fontFamily: "var(--mono)", color: change >= 0 ? "var(--green-d)" : "var(--red-d)" }}>
                      {change >= 0 ? "▲" : "▼"} Rp {fmt(Math.abs(changeAbs))} ({change != null ? (change * 100).toFixed(2) : "—"}%)
                    </div>
                  </div>
                </div>

                {/* ── Verdict ── */}
                {derived && (
                  <div style={{
                    background: verdictStyle.bg,
                    border: `1.5px solid ${verdictStyle.border}`,
                    borderRadius: "var(--card-r)",
                    padding: "20px 24px",
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    gap: 16,
                    alignItems: "center",
                  }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: verdictStyle.text, opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>
                        Status Valuasi
                      </div>
                      <div style={{ fontSize: 28, fontWeight: 700, color: verdictStyle.text, letterSpacing: "-0.02em", marginBottom: 6 }}>
                        {verdictText.title}
                      </div>
                      <div style={{ fontSize: 13, color: verdictStyle.text, opacity: 0.8 }}>
                        {derived.verdict === "undervalued"
                          ? `Harga Rp ${fmt(price)} ≤ MoS Price Rp ${fmt(derived.mosPrice)} · Potensi return ${derived.expRet.toFixed(1)}%`
                          : derived.verdict === "fair"
                          ? `Harga Rp ${fmt(price)} mendekati Fair Value Rp ${fmt(derived.fvBase)} · Pertimbangkan cicil beli`
                          : `Harga Rp ${fmt(price)} di atas Fair Value Rp ${fmt(derived.fvBase)} · Tunggu koreksi`}
                      </div>
                    </div>
                    <div style={{
                      width: 64, height: 64,
                      background: verdictStyle.text,
                      borderRadius: 12,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 28, color: verdictStyle.bg, fontWeight: 700,
                    }}>
                      {verdictText.emoji}
                    </div>
                  </div>
                )}

                {/* ── Fair Value & Price Targets ── */}
                {derived && (
                  <>
                    <SectionTitle>Valuasi & Target Harga</SectionTitle>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
                      <KpiCard label="Fair Value (Proyeksi)" value={`Rp ${fmt(derived.fvBase)}`} sub={`EPS × (1+g)^${params.years} × PER ${params.perTarget}x`} mono color="green" />
                      <KpiCard label={`Harga Ideal (MoS ${params.mos}%)`} value={`Rp ${fmt(derived.mosPrice)}`} sub="Harga beli dengan margin aman" mono color="green" />
                      <KpiCard label="Expected Return" value={`${derived.expRet.toFixed(1)}%`} sub={`Dalam ${params.years} tahun`} mono color={derived.expRet > 0 ? "green" : "red"} />
                      {tgtMean && <KpiCard label="Target Analis (Rata-rata)" value={`Rp ${fmt(tgtMean)}`} sub={upside != null ? `Upside ${upside.toFixed(1)}%` : "—"} mono color="blue" />}
                    </div>
                  </>
                )}

                {/* ── 52-Week Range ── */}
                {fiftyTwoH && fiftyTwoL && price && (
                  <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--card-r)", padding: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12 }}>52 Minggu Range</div>
                    <div style={{ position: "relative", height: 6, background: "var(--border)", borderRadius: 3, marginBottom: 8 }}>
                      <div style={{
                        position: "absolute",
                        left: `${Math.max(0, Math.min(100, ((price - fiftyTwoL) / (fiftyTwoH - fiftyTwoL)) * 100))}%`,
                        transform: "translateX(-50%)",
                        width: 14, height: 14,
                        background: "var(--green)",
                        borderRadius: "50%",
                        top: -4,
                        border: "2px solid #fff",
                        boxShadow: "0 1px 4px #0002",
                      }} />
                      <div style={{
                        position: "absolute",
                        left: 0,
                        width: `${((price - fiftyTwoL) / (fiftyTwoH - fiftyTwoL)) * 100}%`,
                        height: "100%",
                        background: "var(--green)",
                        borderRadius: 3,
                        opacity: 0.3,
                      }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontFamily: "var(--mono)", color: "var(--text-2)" }}>
                      <span>Low: Rp {fmt(fiftyTwoL)}</span>
                      <span style={{ fontWeight: 600, color: "var(--text)" }}>Rp {fmt(price)}</span>
                      <span>High: Rp {fmt(fiftyTwoH)}</span>
                    </div>
                  </div>
                )}

                {/* ── Valuasi Rasio ── */}
                <SectionTitle>Rasio Valuasi</SectionTitle>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
                  <KpiCard label="P/E Ratio" value={per ? fmt(per, 1) + "x" : "—"} sub={per ? (per < 10 ? "Rendah" : per < 20 ? "Wajar" : "Tinggi") : "—"} mono color={per ? (per < 10 ? "green" : per < 25 ? "blue" : "red") : null} />
                  <KpiCard label="P/B Ratio" value={pbv ? fmt(pbv, 2) + "x" : "—"} sub={pbv ? (pbv < 1 ? "Di bawah book value" : pbv < 3 ? "Wajar" : "Premium") : "—"} mono color={pbv ? (pbv < 1 ? "green" : pbv < 3 ? "blue" : "yellow") : null} />
                  <KpiCard label="P/S Ratio" value={psr ? fmt(psr, 2) + "x" : "—"} sub="Price to Sales" mono />
                  <KpiCard label="EPS (TTM)" value={eps ? "Rp " + fmt(eps, 0) : "—"} sub="Laba per lembar" mono />
                  {bvPerShare && <KpiCard label="Book Value/Saham" value={`Rp ${fmt(bvPerShare, 0)}`} sub="Nilai buku per lembar" mono />}
                  {beta != null && <KpiCard label="Beta" value={fmt(beta, 2)} sub={beta < 1 ? "Defensif" : beta > 1.5 ? "Volatil tinggi" : "Moderate"} mono color={beta < 1 ? "green" : beta > 1.5 ? "red" : "blue"} />}
                </div>

                {/* ── Fundamental ── */}
                <SectionTitle>Fundamental</SectionTitle>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
                  <KpiCard label="Market Cap" value={fmtT(mktcap)} sub="Nilai pasar total" mono />
                  <KpiCard label="Revenue (TTM)" value={fmtT(rev)} sub="Pendapatan tahunan" mono />
                  <KpiCard label="Net Income" value={fmtT(netInc)} sub="Laba bersih" mono color={netInc > 0 ? "green" : "red"} />
                  <KpiCard label="Profit Margin" value={fmtPct(margin)} sub="Net profit margin" mono color={margin > 0.2 ? "green" : margin > 0.05 ? "blue" : "red"} />
                  <KpiCard label="ROE" value={fmtPct(roe)} sub="Return on Equity" mono color={roe > 0.15 ? "green" : roe > 0.08 ? "blue" : "red"} />
                  <KpiCard label="ROA" value={fmtPct(roa)} sub="Return on Assets" mono color={roa > 0.05 ? "green" : roa > 0.02 ? "blue" : "red"} />
                </div>

                {/* ── Kesehatan Keuangan ── */}
                <SectionTitle>Kesehatan Keuangan</SectionTitle>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
                  {debtEq != null && <KpiCard label="Debt/Equity" value={fmt(debtEq / 100, 2) + "x"} sub={debtEq < 100 ? "Utang rendah" : debtEq < 200 ? "Utang moderat" : "Utang tinggi"} mono color={debtEq < 100 ? "green" : debtEq < 200 ? "yellow" : "red"} />}
                  {currRat != null && <KpiCard label="Current Ratio" value={fmt(currRat, 2)} sub={currRat > 2 ? "Likuiditas baik" : currRat > 1 ? "Cukup" : "Perhatian"} mono color={currRat > 2 ? "green" : currRat > 1 ? "blue" : "red"} />}
                  {quickRat != null && <KpiCard label="Quick Ratio" value={fmt(quickRat, 2)} sub="Rasio aset cair" mono color={quickRat > 1 ? "green" : "yellow"} />}
                  {shares && <KpiCard label="Shares Outstanding" value={fmtT(shares)} sub="Jumlah lembar beredar" mono />}
                </div>

                {/* ── Dividen ── */}
                {(divY != null || divRate != null) && (
                  <>
                    <SectionTitle>Dividen</SectionTitle>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
                      {divY != null && <KpiCard label="Dividend Yield" value={fmtPct(divY)} sub="Yield tahunan" mono color={divY > 0.04 ? "green" : "blue"} />}
                      {divRate != null && <KpiCard label="Dividend Rate" value={`Rp ${fmt(divRate, 0)}`} sub="Dividen per lembar/tahun" mono />}
                    </div>
                  </>
                )}

                {/* ── Proyeksi Asumsi ── */}
                {eps && price && (
                  <>
                    <SectionTitle>Asumsi Proyeksi</SectionTitle>
                    <div style={{
                      background: "#fff",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--card-r)",
                      padding: "20px",
                    }}>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12, marginBottom: 16 }}>
                        {[
                          { key: "growth", label: "EPS Growth (%/tahun)", min: 1, max: 50, step: 1 },
                          { key: "perTarget", label: "PER Target", min: 5, max: 60, step: 1 },
                          { key: "years", label: "Tahun Proyeksi", min: 1, max: 10, step: 1 },
                          { key: "mos", label: "Margin of Safety (%)", min: 0, max: 50, step: 5 },
                        ].map(({ key, label, min, max, step }) => (
                          <div key={key}>
                            <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 6, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <input
                                type="number"
                                value={params[key]}
                                min={min} max={max} step={step}
                                onChange={(e) => setParams((p) => ({ ...p, [key]: parseFloat(e.target.value) || 0 }))}
                                style={{
                                  flex: 1,
                                  height: 36,
                                  padding: "0 10px",
                                  fontSize: 14,
                                  fontFamily: "var(--mono)",
                                  fontWeight: 500,
                                  border: "1px solid var(--border)",
                                  borderRadius: 8,
                                  background: "#f7f7f5",
                                  color: "var(--text)",
                                  outline: "none",
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      <p style={{ fontSize: 12, color: "var(--text-3)" }}>
                        * Ubah nilai di atas untuk update proyeksi secara langsung. PER diisi otomatis dari data pasar.
                      </p>
                    </div>
                  </>
                )}

                {/* ── Proyeksi Return Tabel ── */}
                {derived && (
                  <>
                    <SectionTitle>Proyeksi Return Per Tahun</SectionTitle>
                    <Table
                      headers={["Tahun", "Future EPS", "Future Price", "Expected Return", "CAGR"]}
                      rows={derived.projRows.map((r) => [
                        `Tahun ke-${r.yr}`,
                        `Rp ${fmt(r.fEps, 0)}`,
                        `Rp ${fmt(r.fPrc, 0)}`,
                        <Badge key="ret" color={r.ret > 30 ? "green" : r.ret > 0 ? "blue" : "red"}>{r.ret.toFixed(1)}%</Badge>,
                        `${r.cagr.toFixed(1)}%/yr`,
                      ])}
                    />
                  </>
                )}

                {/* ── Skenario ── */}
                {derived && (
                  <>
                    <SectionTitle>Skenario Bull / Base / Bear</SectionTitle>
                    <Table
                      headers={["Skenario", "Asumsi Growth", "Future Price", "Total Return", "CAGR"]}
                      rows={derived.scenarios.map((s, i) => [
                        s.name,
                        `${(params.growth * [1.5, 1.0, 0.5][i]).toFixed(1)}% / tahun`,
                        `Rp ${fmt(s.fPrc, 0)}`,
                        <Badge key="r" color={s.ret > 30 ? "green" : s.ret > 0 ? "blue" : "red"}>{s.ret.toFixed(1)}%</Badge>,
                        `${s.cagr.toFixed(1)}%/yr`,
                      ])}
                    />
                  </>
                )}

                {/* ── Analis ── */}
                {(tgtMean || rec) && (
                  <>
                    <SectionTitle>Konsensus Analis</SectionTitle>
                    <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--card-r)", padding: 20 }}>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
                        {rec && (
                          <div>
                            <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 500 }}>Rekomendasi</div>
                            <Badge color={recColorMap[rec] || "blue"}>{recMap[rec] || rec}</Badge>
                            {recN && <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 4 }}>{recN} analis</div>}
                          </div>
                        )}
                        {tgtMean && (
                          <KpiCard label="Target Rata-rata" value={`Rp ${fmt(tgtMean)}`}
                            sub={upside != null ? `${upside > 0 ? "+" : ""}${upside.toFixed(1)}% dari harga kini` : "—"}
                            mono color={upside > 0 ? "green" : "red"} />
                        )}
                        {tgtHigh && <KpiCard label="Target Optimis" value={`Rp ${fmt(tgtHigh)}`} sub="Analis paling bullish" mono />}
                        {tgtLow && <KpiCard label="Target Pesimis" value={`Rp ${fmt(tgtLow)}`} sub="Analis paling bearish" mono />}
                      </div>
                    </div>
                  </>
                )}

                {/* ── Disclaimer ── */}
                <div style={{
                  padding: "16px 20px",
                  background: "#f7f7f5",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--card-r)",
                  fontSize: 12,
                  color: "var(--text-3)",
                  lineHeight: 1.6,
                }}>
                  <strong style={{ color: "var(--text-2)" }}>⚠️ Disclaimer:</strong>{" "}
                  Data bersumber dari Yahoo Finance dengan delay ~15 menit. Fair Value adalah estimasi berdasarkan model DCF sederhana — bukan rekomendasi investasi.
                  Selalu lakukan riset mandiri dan konsultasikan dengan perencana keuangan sebelum mengambil keputusan investasi.
                  Investasi saham mengandung risiko kerugian.
                </div>

              </div>
            );
          })()}

          {/* ── Empty state ── */}
          {!data && !loading && !error && (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-3)" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
              <div style={{ fontSize: 15, fontWeight: 500, color: "var(--text-2)", marginBottom: 6 }}>Belum ada saham dipilih</div>
              <div style={{ fontSize: 13 }}>Ketik kode saham di atas atau pilih dari chip populer</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
