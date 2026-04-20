// pages/api/stock.js
// Backend proxy — menghindari CORS block Yahoo Finance dari browser
import { queryQuoteSummary } from 'yahoo-finance2/dist/esm/modules/quoteSummary';

export default async function handler(req, res) {
  const { ticker } = req.query;

  if (!ticker) {
    return res.status(400).json({ error: "Ticker diperlukan" });
  }

  // Format ticker IDX: BBCA → BBCA.JK
  const formatted = ticker.toUpperCase().includes(".")
    ? ticker.toUpperCase()
    : ticker.toUpperCase() + ".JK";

  try {
    const result = await queryQuoteSummary(formatted, {
      modules: [
        "price",
        "summaryDetail",
        "financialData",
        "defaultKeyStatistics",
        "recommendationTrend",
        "earningsTrend",
        "incomeStatementHistory",
        "balanceSheetHistory",
        "cashflowStatementHistory",
      ],
    });

    if (!result) {
      return res.status(404).json({
        error: `Saham ${formatted} tidak ditemukan. Pastikan kode benar.`,
      });
    }

    // Format response sesuai ekspektasi frontend
    const data = {
      quoteSummary: {
        result: [result],
      },
    };

    // Cache 5 menit
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
    return res.status(200).json(data);
  } catch (err) {
    console.error("Yahoo Finance API Error:", err);
    return res.status(500).json({
      error: `Gagal mengambil data ${formatted}: ${err.message}`,
    });
  }
}
