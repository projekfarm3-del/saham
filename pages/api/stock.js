// pages/api/stock.js
// Backend proxy — menghindari CORS block Yahoo Finance dari browser

export default async function handler(req, res) {
  const { ticker } = req.query;

  if (!ticker) {
    return res.status(400).json({ error: "Ticker diperlukan" });
  }

  // Format ticker IDX: BBCA → BBCA.JK
  const formatted = ticker.toUpperCase().includes(".")
    ? ticker.toUpperCase()
    : ticker.toUpperCase() + ".JK";

  const modules = [
    "price",
    "summaryDetail",
    "financialData",
    "defaultKeyStatistics",
    "recommendationTrend",
    "earningsTrend",
    "incomeStatementHistory",
    "balanceSheetHistory",
    "cashflowStatementHistory",
  ].join("%2C");

  const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${formatted}?modules=${modules}`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/json",
        "Accept-Language": "en-US,en;q=0.9",
        Referer: "https://finance.yahoo.com/",
      },
    });

    if (!response.ok) {
      // Coba query2 sebagai fallback
      const url2 = url.replace("query1", "query2");
      const r2 = await fetch(url2, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Accept: "application/json",
          Referer: "https://finance.yahoo.com/",
        },
      });
      if (!r2.ok) {
        return res.status(404).json({
          error: `Saham ${formatted} tidak ditemukan. Pastikan kode benar.`,
        });
      }
      const data2 = await r2.json();
      return res.status(200).json(data2);
    }

    const data = await response.json();

    if (data.quoteSummary?.error) {
      return res.status(404).json({
        error: `Saham ${formatted} tidak ditemukan. Cek kode saham.`,
      });
    }

    // Cache 5 menit
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({
      error: "Gagal mengambil data: " + err.message,
    });
  }
}
