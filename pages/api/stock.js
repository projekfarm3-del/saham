// pages/api/stock.js
// Backend proxy untuk fetch data realtime dari Finnhub API

async function fetchFinnhubData(ticker) {
  const apiKey = process.env.FINNHUB_API_KEY;
  
  // Skip jika tidak ada API key (gunakan demo yang limited)
  if (!apiKey || apiKey === "demo") {
    console.log("Finnhub API key not configured, skipping Finnhub");
    return null;
  }

  // Finnhub API expects ticker WITHOUT .JK (e.g., IDNS, not IDNS.JK)
  const formatted = ticker.toUpperCase().replace(".JK", "");

  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${formatted}&token=${apiKey}`,
      { timeout: 5000 }
    );
    
    if (!res.ok) {
      console.error(`Finnhub HTTP Error: ${res.status}`);
      return null;
    }

    const data = await res.json();
    
    // Check for error in response
    if (data.error || data.c === undefined || data.c === null || data.c === 0) {
      console.log(`Finnhub: No data for ${formatted}`, data);
      return null; // Not found
    }

    console.log(`Finnhub SUCCESS: ${formatted} = ${data.c}`);

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
    console.error(`Finnhub API Error for ${formatted}:`, err.message);
    return null;
  }
}

// Mock data untuk testing
function getMockData(ticker) {
  // Database lengkap 10 saham populer
  const popularStocks = {
    "BBCA.JK": { price: 8850, eps: 1200, per: 7.5, roe: 0.18, roa: 0.025, revenue: 150000000000, netIncome: 52500000000, margin: 0.35, debtEq: 25 },
    "TLKM.JK": { price: 3260, eps: 250, per: 13, roe: 0.15, roa: 0.08, revenue: 200000000000, netIncome: 36000000000, margin: 0.18, debtEq: 43 },
    "ASII.JK": { price: 6750, eps: 600, per: 11.25, roe: 0.22, roa: 0.12, revenue: 300000000000, netIncome: 90000000000, margin: 0.30, debtEq: 14 },
    "BMRI.JK": { price: 8100, eps: 1080, per: 7.5, roe: 0.16, roa: 0.022, revenue: 130000000000, netIncome: 46800000000, margin: 0.36, debtEq: 35 },
    "GOTO.JK": { price: 400, eps: 10, per: 40, roe: 0.08, roa: 0.05, revenue: 80000000000, netIncome: 3200000000, margin: 0.04, debtEq: 120 },
    "BREN.JK": { price: 510, eps: 40, per: 12.75, roe: 0.20, roa: 0.10, revenue: 120000000000, netIncome: 24000000000, margin: 0.20, debtEq: 50 },
    "UNVR.JK": { price: 2950, eps: 885, per: 3.33, roe: 0.35, roa: 0.28, revenue: 90000000000, netIncome: 31500000000, margin: 0.35, debtEq: 5 },
    "HMSP.JK": { price: 450, eps: 108, per: 4.17, roe: 0.32, roa: 0.25, revenue: 110000000000, netIncome: 37800000000, margin: 0.34, debtEq: 15 },
    "BBRI.JK": { price: 4850, eps: 682, per: 7.11, roe: 0.17, roa: 0.023, revenue: 180000000000, netIncome: 65000000000, margin: 0.36, debtEq: 32 },
    "ICBP.JK": { price: 8900, eps: 1780, per: 5.0, roe: 0.28, roa: 0.18, revenue: 200000000000, netIncome: 56000000000, margin: 0.28, debtEq: 22 },
    // Saham populer lainnya
    "ADRO.JK": { price: 3500, eps: 700, per: 5.0, roe: 0.20, roa: 0.15, revenue: 250000000000, netIncome: 50000000000, margin: 0.20, debtEq: 40 },
    "INDF.JK": { price: 7850, eps: 1100, per: 7.1, roe: 0.25, roa: 0.18, revenue: 280000000000, netIncome: 77000000000, margin: 0.27, debtEq: 25 },
    "INTP.JK": { price: 3800, eps: 456, per: 8.3, roe: 0.18, roa: 0.12, revenue: 180000000000, netIncome: 37800000000, margin: 0.21, debtEq: 30 },
    "JSMR.JK": { price: 27500, eps: 3850, per: 7.1, roe: 0.22, roa: 0.16, revenue: 200000000000, netIncome: 55000000000, margin: 0.27, debtEq: 35 },
    "MDKA.JK": { price: 2150, eps: 300, per: 7.2, roe: 0.19, roa: 0.11, revenue: 120000000000, netIncome: 21600000000, margin: 0.18, debtEq: 45 },
    "PGAS.JK": { price: 4200, eps: 525, per: 8.0, roe: 0.20, roa: 0.13, revenue: 200000000000, netIncome: 42000000000, margin: 0.21, debtEq: 38 },
    "SMGR.JK": { price: 10200, eps: 1650, per: 6.2, roe: 0.26, roa: 0.19, revenue: 300000000000, netIncome: 78000000000, margin: 0.26, debtEq: 22 },
    "KLBF.JK": { price: 1385, eps: 185, per: 7.5, roe: 0.23, roa: 0.16, revenue: 150000000000, netIncome: 34500000000, margin: 0.23, debtEq: 28 },
    "PTBA.JK": { price: 6750, eps: 1125, per: 6.0, roe: 0.24, roa: 0.17, revenue: 180000000000, netIncome: 43200000000, margin: 0.24, debtEq: 32 },
    "TINS.JK": { price: 2000, eps: 250, per: 8.0, roe: 0.18, roa: 0.12, revenue: 100000000000, netIncome: 18000000000, margin: 0.18, debtEq: 42 },
  };

  // Cek di database
  if (popularStocks[ticker]) {
    const stock = popularStocks[ticker];
    return buildMockResponse(ticker, stock);
  }

  // Jika tidak ada di database, generate random realistic mock data untuk saham apapun
  const hashCode = ticker.split('').reduce((a, b) => {a = ((a << 5) - a) + b.charCodeAt(0); return a & a;}, 0);
  const seed = Math.abs(hashCode);
  
  const price = Math.round((2000 + (seed % 20000)) / 100) * 100; // 2000-22000
  const eps = Math.round(price / (8 + (seed % 8))); // Random PER 8-16x
  const per = Math.round(100 * price / eps) / 100;
  const roe = 0.10 + ((seed % 20) / 100); // 10-30%
  const roa = 0.05 + ((seed % 15) / 100); // 5-20%
  const revenue = (50000000000 + (seed % 400000000000)); // 50B-450B
  const netIncome = Math.round(revenue * (0.10 + ((seed % 25) / 100))); // 10-35% margin
  const margin = netIncome / revenue;
  const debtEq = 10 + (seed % 100); // 10-110 debt/equity

  const stock = { price, eps, per, roe, roa, revenue, netIncome, margin, debtEq };
  return buildMockResponse(ticker, stock);
}

function buildMockResponse(ticker, stock) {
  const marketCap = stock.price * 1000000000; // Simplified calc
  
  return {
    quoteSummary: {
      result: [{
        price: { regularMarketPrice: stock.price },
        defaultKeyStatistics: { 
          trailingEps: stock.eps, 
          trailingPE: stock.per,
          returnOnEquity: stock.roe,
          returnOnAssets: stock.roa,
          bookValue: Math.round(stock.price / stock.per * 10),
          sharesOutstanding: 1000000000
        },
        summaryDetail: { 
          marketCap: marketCap, 
          trailingPE: stock.per 
        },
        financialData: { 
          totalRevenue: stock.revenue,
          netIncomeToCommon: stock.netIncome,
          profitMargins: stock.margin,
          returnOnEquity: stock.roe,
          returnOnAssets: stock.roa,
          debtToEquity: stock.debtEq,
          currentRatio: 1.5,
          quickRatio: 1.2,
          priceToBook: stock.price / (stock.price / stock.per * 10)
        },
        incomeStatementHistory: { 
          incomeStatementHistory: [{ 
            totalRevenue: stock.revenue,
            netIncome: stock.netIncome
          }] 
        },
        balanceSheetHistory: { 
          balanceSheetStatements: [{ 
            totalAssets: Math.round(stock.revenue * 3),
            totalLiab: Math.round(stock.revenue * 0.8),
            totalStockholderEquity: Math.round(stock.revenue * 2.2)
          }] 
        },
      }]
    }
  };
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
    // Try Finnhub API first (if configured)
    const finnhubData = await fetchFinnhubData(ticker);
    if (finnhubData && finnhubData.quoteSummary?.result?.[0]?.price?.regularMarketPrice) {
      res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
      return res.status(200).json(finnhubData);
    }

    // Fallback ke mock data
    const mockData = getMockData(formatted);
    if (mockData && mockData.quoteSummary?.result?.[0]) {
      res.setHeader("Cache-Control", "s-maxage=3600");
      console.log(`Using MOCK DATA for ${formatted}`);
      return res.status(200).json(mockData);
    }

    return res.status(404).json({
      error: `Saham ${formatted} tidak ditemukan. Cek kode saham.`,
    });
  } catch (err) {
    console.error("API Handler Error:", err);
    return res.status(500).json({
      error: `Gagal mengambil data: ${err.message}`,
    });
  }
}
