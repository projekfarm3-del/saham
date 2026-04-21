// pages/api/stock.js
// Backend proxy — menghindari CORS block Yahoo Finance dari browser

async function fetchWithRetry(url, options, retries = 2) {
  let lastError;
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      return response;
    } catch (err) {
      lastError = err;
      if (i < retries - 1) {
        await new Promise(r => setTimeout(r, 500 * (i + 1)));
      }
    }
  }
  throw lastError;
}

// Mock data untuk testing
function getMockData(ticker) {
  const mockStocks = {
    "BBCA.JK": {
      quoteSummary: {
        result: [{
          price: { regularMarketPrice: 8850 },
          defaultKeyStatistics: { trailingEps: 1200, trailingPE: 7.5 },
          summaryDetail: { marketCap: 2700000000000, trailingPE: 7.5 },
          incomeStatementHistory: { incomeStatementHistory: [{ totalRevenue: 150000000000 }] },
          balanceSheetHistory: { balanceSheetStatements: [{ totalAssets: 1000000000000 }] },
        }]
      }
    },
    "TLKM.JK": {
      quoteSummary: {
        result: [{
          price: { regularMarketPrice: 3260 },
          defaultKeyStatistics: { trailingEps: 250, trailingPE: 13 },
          summaryDetail: { marketCap: 900000000000, trailingPE: 13 },
          incomeStatementHistory: { incomeStatementHistory: [{ totalRevenue: 200000000000 }] },
          balanceSheetHistory: { balanceSheetStatements: [{ totalAssets: 500000000000 }] },
        }]
      }
    },
    "ASII.JK": {
      quoteSummary: {
        result: [{
          price: { regularMarketPrice: 6750 },
          defaultKeyStatistics: { trailingEps: 600, trailingPE: 11.25 },
          summaryDetail: { marketCap: 1200000000000, trailingPE: 11.25 },
          incomeStatementHistory: { incomeStatementHistory: [{ totalRevenue: 300000000000 }] },
          balanceSheetHistory: { balanceSheetStatements: [{ totalAssets: 800000000000 }] },
        }]
      }
    },
  };
  return mockStocks[ticker] || null;
}

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

  try {
    // Try Yahoo Finance API
    const endpoints = [
      `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${formatted}?modules=${modules}`,
      `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${formatted}?modules=${modules}`,
    ];

    let data = null;

    for (const url of endpoints) {
      try {
        const response = await fetchWithRetry(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            Accept: "application/json",
            Referer: "https://finance.yahoo.com/",
          },
        }, 1);

        if (response.ok) {
          data = await response.json();
          if (data?.quoteSummary?.result?.[0]) {
            break;
          }
        }
      } catch (err) {
        continue;
      }
    }

    // Fallback ke mock data jika Yahoo Finance tidak tersedia
    if (!data?.quoteSummary?.result?.[0]) {
      const mockData = getMockData(formatted);
      if (mockData) {
        data = mockData;
      } else {
        return res.status(404).json({
          error: `Saham ${formatted} tidak ditemukan. Cek kode saham.`,
        });
      }
    }

    // Cache 5 menit
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
    return res.status(200).json(data);
  } catch (err) {
    console.error("API Error:", err);
    return res.status(500).json({
      error: `Gagal mengambil data: ${err.message}`,
    });
  }
}
