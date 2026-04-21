// pages/api/stock.js
// Backend proxy untuk fetch data realtime dari Finnhub API

async function fetchFinnhubData(ticker) {
  const apiKey = process.env.FINNHUB_API_KEY || "demo"; // Replace dengan API key di .env
  const formatted = ticker.toUpperCase().includes(".JK") 
    ? ticker.toUpperCase() 
    : ticker.toUpperCase() + ".JK";

  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${formatted}&token=${apiKey}`
    );
    const data = await res.json();
    
    if (data.c === undefined || data.c === null) {
      return null; // Not found
    }

    // Transform Finnhub response to our format
    return {
      quoteSummary: {
        result: [{
          price: {
            regularMarketPrice: data.c,
            regularMarketChangePercent: data.dp,
            regularMarketChange: data.d,
          },
          defaultKeyStatistics: {
            trailingEps: null,
            trailingPE: null,
          },
          summaryDetail: {
            marketCap: null,
          },
          financialData: {
            totalRevenue: null,
            netIncomeToCommon: null,
            profitMargins: null,
            returnOnEquity: null,
            returnOnAssets: null,
            debtToEquity: null,
          },
        }]
      }
    };
  } catch (err) {
    console.error("Finnhub API Error:", err);
    return null;
  }
}

// Mock data untuk testing
function getMockData(ticker) {
  const mockStocks = {
    "BBCA.JK": {
      quoteSummary: { result: [{
        price: { regularMarketPrice: 8850 },
        defaultKeyStatistics: { trailingEps: 1200, trailingPE: 7.5, returnOnEquity: 0.18, returnOnAssets: 0.025, bookValue: 45000, sharesOutstanding: 30000000000 },
        summaryDetail: { marketCap: 2700000000000, trailingPE: 7.5 },
        financialData: { totalRevenue: 150000000000, netIncomeToCommon: 52500000000, profitMargins: 0.35, returnOnEquity: 0.18, returnOnAssets: 0.025, debtToEquity: 25, currentRatio: 1.5, quickRatio: 1.2, priceToBook: 1.97 },
        incomeStatementHistory: { incomeStatementHistory: [{ totalRevenue: 150000000000, netIncome: 52500000000 }] },
        balanceSheetHistory: { balanceSheetStatements: [{ totalAssets: 1000000000000, totalLiab: 200000000000, totalStockholderEquity: 800000000000 }] },
      }] }
    },
    "TLKM.JK": {
      quoteSummary: { result: [{
        price: { regularMarketPrice: 3260 },
        defaultKeyStatistics: { trailingEps: 250, trailingPE: 13, returnOnEquity: 0.15, returnOnAssets: 0.08, bookValue: 15000, sharesOutstanding: 276000000000 },
        summaryDetail: { marketCap: 900000000000, trailingPE: 13 },
        financialData: { totalRevenue: 200000000000, netIncomeToCommon: 36000000000, profitMargins: 0.18, returnOnEquity: 0.15, returnOnAssets: 0.08, debtToEquity: 43, currentRatio: 1.3, quickRatio: 1.1, priceToBook: 0.87 },
        incomeStatementHistory: { incomeStatementHistory: [{ totalRevenue: 200000000000, netIncome: 36000000000 }] },
        balanceSheetHistory: { balanceSheetStatements: [{ totalAssets: 500000000000, totalLiab: 150000000000, totalStockholderEquity: 350000000000 }] },
      }] }
    },
    "ASII.JK": {
      quoteSummary: { result: [{
        price: { regularMarketPrice: 6750 },
        defaultKeyStatistics: { trailingEps: 600, trailingPE: 11.25, returnOnEquity: 0.22, returnOnAssets: 0.12, bookValue: 32000, sharesOutstanding: 178800000000 },
        summaryDetail: { marketCap: 1200000000000, trailingPE: 11.25 },
        financialData: { totalRevenue: 300000000000, netIncomeToCommon: 90000000000, profitMargins: 0.30, returnOnEquity: 0.22, returnOnAssets: 0.12, debtToEquity: 14, currentRatio: 1.8, quickRatio: 1.5, priceToBook: 2.11 },
        incomeStatementHistory: { incomeStatementHistory: [{ totalRevenue: 300000000000, netIncome: 90000000000 }] },
        balanceSheetHistory: { balanceSheetStatements: [{ totalAssets: 800000000000, totalLiab: 100000000000, totalStockholderEquity: 700000000000 }] },
      }] }
    },
    "BMRI.JK": {
      quoteSummary: { result: [{
        price: { regularMarketPrice: 8100 },
        defaultKeyStatistics: { trailingEps: 1080, trailingPE: 7.5, returnOnEquity: 0.16, returnOnAssets: 0.022, bookValue: 40000, sharesOutstanding: 28000000000 },
        summaryDetail: { marketCap: 2268000000000, trailingPE: 7.5 },
        financialData: { totalRevenue: 130000000000, netIncomeToCommon: 46800000000, profitMargins: 0.36, returnOnEquity: 0.16, returnOnAssets: 0.022, debtToEquity: 35, currentRatio: 1.4, quickRatio: 1.1, priceToBook: 2.02 },
        incomeStatementHistory: { incomeStatementHistory: [{ totalRevenue: 130000000000, netIncome: 46800000000 }] },
        balanceSheetHistory: { balanceSheetStatements: [{ totalAssets: 900000000000, totalLiab: 250000000000, totalStockholderEquity: 650000000000 }] },
      }] }
    },
    "GOTO.JK": {
      quoteSummary: { result: [{
        price: { regularMarketPrice: 400 },
        defaultKeyStatistics: { trailingEps: 10, trailingPE: 40, returnOnEquity: 0.08, returnOnAssets: 0.05, bookValue: 8000, sharesOutstanding: 40000000000 },
        summaryDetail: { marketCap: 160000000000, trailingPE: 40 },
        financialData: { totalRevenue: 80000000000, netIncomeToCommon: 3200000000, profitMargins: 0.04, returnOnEquity: 0.08, returnOnAssets: 0.05, debtToEquity: 120, currentRatio: 1.2, quickRatio: 0.9, priceToBook: 2.0 },
        incomeStatementHistory: { incomeStatementHistory: [{ totalRevenue: 80000000000, netIncome: 3200000000 }] },
        balanceSheetHistory: { balanceSheetStatements: [{ totalAssets: 160000000000, totalLiab: 120000000000, totalStockholderEquity: 40000000000 }] },
      }] }
    },
    "BREN.JK": {
      quoteSummary: { result: [{
        price: { regularMarketPrice: 510 },
        defaultKeyStatistics: { trailingEps: 40, trailingPE: 12.75, returnOnEquity: 0.20, returnOnAssets: 0.10, bookValue: 2000, sharesOutstanding: 8000000000 },
        summaryDetail: { marketCap: 408000000000, trailingPE: 12.75 },
        financialData: { totalRevenue: 120000000000, netIncomeToCommon: 24000000000, profitMargins: 0.20, returnOnEquity: 0.20, returnOnAssets: 0.10, debtToEquity: 50, currentRatio: 1.6, quickRatio: 1.3, priceToBook: 2.04 },
        incomeStatementHistory: { incomeStatementHistory: [{ totalRevenue: 120000000000, netIncome: 24000000000 }] },
        balanceSheetHistory: { balanceSheetStatements: [{ totalAssets: 240000000000, totalLiab: 80000000000, totalStockholderEquity: 160000000000 }] },
      }] }
    },
    "UNVR.JK": {
      quoteSummary: { result: [{
        price: { regularMarketPrice: 2950 },
        defaultKeyStatistics: { trailingEps: 885, trailingPE: 3.33, returnOnEquity: 0.35, returnOnAssets: 0.28, bookValue: 3000, sharesOutstanding: 420000000 },
        summaryDetail: { marketCap: 1239000000000, trailingPE: 3.33 },
        financialData: { totalRevenue: 90000000000, netIncomeToCommon: 31500000000, profitMargins: 0.35, returnOnEquity: 0.35, returnOnAssets: 0.28, debtToEquity: 5, currentRatio: 2.5, quickRatio: 2.1, priceToBook: 4.10 },
        incomeStatementHistory: { incomeStatementHistory: [{ totalRevenue: 90000000000, netIncome: 31500000000 }] },
        balanceSheetHistory: { balanceSheetStatements: [{ totalAssets: 112500000000, totalLiab: 5000000000, totalStockholderEquity: 107500000000 }] },
      }] }
    },
    "HMSP.JK": {
      quoteSummary: { result: [{
        price: { regularMarketPrice: 450 },
        defaultKeyStatistics: { trailingEps: 108, trailingPE: 4.17, returnOnEquity: 0.32, returnOnAssets: 0.25, bookValue: 1500, sharesOutstanding: 3500000000 },
        summaryDetail: { marketCap: 1575000000000, trailingPE: 4.17 },
        financialData: { totalRevenue: 110000000000, netIncomeToCommon: 37800000000, profitMargins: 0.34, returnOnEquity: 0.32, returnOnAssets: 0.25, debtToEquity: 15, currentRatio: 1.9, quickRatio: 1.6, priceToBook: 3.0 },
        incomeStatementHistory: { incomeStatementHistory: [{ totalRevenue: 110000000000, netIncome: 37800000000 }] },
        balanceSheetHistory: { balanceSheetStatements: [{ totalAssets: 150000000000, totalLiab: 20000000000, totalStockholderEquity: 130000000000 }] },
      }] }
    },
    "BBRI.JK": {
      quoteSummary: { result: [{
        price: { regularMarketPrice: 4850 },
        defaultKeyStatistics: { trailingEps: 682, trailingPE: 7.11, returnOnEquity: 0.17, returnOnAssets: 0.023, bookValue: 38000, sharesOutstanding: 65000000000 },
        summaryDetail: { marketCap: 3152500000000, trailingPE: 7.11 },
        financialData: { totalRevenue: 180000000000, netIncomeToCommon: 65000000000, profitMargins: 0.36, returnOnEquity: 0.17, returnOnAssets: 0.023, debtToEquity: 32, currentRatio: 1.5, quickRatio: 1.2, priceToBook: 1.95 },
        incomeStatementHistory: { incomeStatementHistory: [{ totalRevenue: 180000000000, netIncome: 65000000000 }] },
        balanceSheetHistory: { balanceSheetStatements: [{ totalAssets: 1100000000000, totalLiab: 350000000000, totalStockholderEquity: 750000000000 }] },
      }] }
    },
    "ICBP.JK": {
      quoteSummary: { result: [{
        price: { regularMarketPrice: 8900 },
        defaultKeyStatistics: { trailingEps: 1780, trailingPE: 5.0, returnOnEquity: 0.28, returnOnAssets: 0.18, bookValue: 35000, sharesOutstanding: 8000000000 },
        summaryDetail: { marketCap: 712000000000, trailingPE: 5.0 },
        financialData: { totalRevenue: 200000000000, netIncomeToCommon: 56000000000, profitMargins: 0.28, returnOnEquity: 0.28, returnOnAssets: 0.18, debtToEquity: 22, currentRatio: 1.7, quickRatio: 1.4, priceToBook: 2.14 },
        incomeStatementHistory: { incomeStatementHistory: [{ totalRevenue: 200000000000, netIncome: 56000000000 }] },
        balanceSheetHistory: { balanceSheetStatements: [{ totalAssets: 310000000000, totalLiab: 60000000000, totalStockholderEquity: 250000000000 }] },
      }] }
    },
  };
  return mockStocks[ticker] || null;
}

export default async function handler(req, res) {
  const { ticker } = req.query;

  if (!ticker) {
    return res.status(400).json({ error: "Ticker diperlukan" });
  }

  const formatted = ticker.toUpperCase().includes(".JK") 
    ? ticker.toUpperCase() 
    : ticker.toUpperCase() + ".JK";

  try {
    // Try Finnhub API first
    const finnhubData = await fetchFinnhubData(ticker);
    if (finnhubData) {
      res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
      return res.status(200).json(finnhubData);
    }

    // Fallback ke mock data
    const mockData = getMockData(formatted);
    if (mockData) {
      res.setHeader("Cache-Control", "s-maxage=3600");
      return res.status(200).json(mockData);
    }

    return res.status(404).json({
      error: `Saham ${formatted} tidak ditemukan. Cek kode saham.`,
    });
  } catch (err) {
    console.error("API Error:", err);
    return res.status(500).json({
      error: `Gagal mengambil data: ${err.message}`,
    });
  }
}
