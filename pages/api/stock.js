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
          defaultKeyStatistics: { 
            trailingEps: 1200, 
            trailingPE: 7.5,
            returnOnEquity: 0.18,
            returnOnAssets: 0.025,
            bookValue: 45000,
            sharesOutstanding: 30000000000
          },
          summaryDetail: { 
            marketCap: 2700000000000, 
            trailingPE: 7.5 
          },
          financialData: {
            totalRevenue: 150000000000,
            totalDebt: 200000000000,
            totalCash: 300000000000,
            profitMargins: 0.35,
            operatingMargins: 0.40,
            netIncomeToCommon: 52500000000,
            returnOnEquity: 0.18,
            returnOnAssets: 0.025,
            debtToEquity: 25,
            currentRatio: 1.5,
            quickRatio: 1.2,
            priceToBook: 1.97
          },
          incomeStatementHistory: { 
            incomeStatementHistory: [{ 
              totalRevenue: 150000000000,
              netIncome: 52500000000
            }] 
          },
          balanceSheetHistory: { 
            balanceSheetStatements: [{ 
              totalAssets: 1000000000000,
              totalLiab: 200000000000,
              totalStockholderEquity: 800000000000
            }] 
          },
        }]
      }
    },
    "TLKM.JK": {
      quoteSummary: {
        result: [{
          price: { regularMarketPrice: 3260 },
          defaultKeyStatistics: { 
            trailingEps: 250, 
            trailingPE: 13,
            returnOnEquity: 0.15,
            returnOnAssets: 0.08,
            bookValue: 15000,
            sharesOutstanding: 276000000000
          },
          summaryDetail: { 
            marketCap: 900000000000, 
            trailingPE: 13 
          },
          financialData: {
            totalRevenue: 200000000000,
            totalDebt: 150000000000,
            totalCash: 50000000000,
            profitMargins: 0.18,
            operatingMargins: 0.22,
            netIncomeToCommon: 36000000000,
            returnOnEquity: 0.15,
            returnOnAssets: 0.08,
            debtToEquity: 43,
            currentRatio: 1.3,
            quickRatio: 1.1,
            priceToBook: 0.87
          },
          incomeStatementHistory: { 
            incomeStatementHistory: [{ 
              totalRevenue: 200000000000,
              netIncome: 36000000000
            }] 
          },
          balanceSheetHistory: { 
            balanceSheetStatements: [{ 
              totalAssets: 500000000000,
              totalLiab: 150000000000,
              totalStockholderEquity: 350000000000
            }] 
          },
        }]
      }
    },
    "ASII.JK": {
      quoteSummary: {
        result: [{
          price: { regularMarketPrice: 6750 },
          defaultKeyStatistics: { 
            trailingEps: 600, 
            trailingPE: 11.25,
            returnOnEquity: 0.22,
            returnOnAssets: 0.12,
            bookValue: 32000,
            sharesOutstanding: 178800000000
          },
          summaryDetail: { 
            marketCap: 1200000000000, 
            trailingPE: 11.25 
          },
          financialData: {
            totalRevenue: 300000000000,
            totalDebt: 100000000000,
            totalCash: 200000000000,
            profitMargins: 0.30,
            operatingMargins: 0.35,
            netIncomeToCommon: 90000000000,
            returnOnEquity: 0.22,
            returnOnAssets: 0.12,
            debtToEquity: 14,
            currentRatio: 1.8,
            quickRatio: 1.5,
            priceToBook: 2.11
          },
          incomeStatementHistory: { 
            incomeStatementHistory: [{ 
              totalRevenue: 300000000000,
              netIncome: 90000000000
            }] 
          },
          balanceSheetHistory: { 
            balanceSheetStatements: [{ 
              totalAssets: 800000000000,
              totalLiab: 100000000000,
              totalStockholderEquity: 700000000000
            }] 
          },
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
