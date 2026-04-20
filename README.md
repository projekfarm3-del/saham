# 📈 SahamAnalyzer — Tools Analisa Saham IDX

Web app analisa valuasi saham Indonesia secara realtime. Cukup masukkan kode saham (BBCA, TLKM, dll.) dan semua data fundamental langsung tersedia.

## ✨ Fitur

- **Data Realtime** dari Yahoo Finance (delay ~15 menit)
- **Valuasi otomatis**: Fair Value, Margin of Safety, Expected Return
- **Proyeksi 1–10 tahun**: Future EPS, Future Price, CAGR
- **Skenario** Bull / Base / Bear
- **Rasio lengkap**: PER, PBV, PSR, ROE, ROA, Debt/Equity, Current Ratio
- **Konsensus analis**: target harga, rekomendasi, jumlah analis
- **52-Minggu Range** visual
- **Backend proxy** — tidak kena CORS block

---

## 🚀 Deploy ke Vercel (Gratis, 5 menit)

### Cara 1: Via GitHub (Direkomendasikan)

1. **Upload ke GitHub**
   ```bash
   git init
   git add .
   git commit -m "first commit"
   git branch -M main
   git remote add origin https://github.com/USERNAME/saham-analyzer.git
   git push -u origin main
   ```

2. **Deploy ke Vercel**
   - Buka [vercel.com](https://vercel.com) → Sign up / Login
   - Klik **"Add New Project"**
   - Import repo GitHub yang baru dibuat
   - Klik **Deploy** — selesai! URL live otomatis diberikan

### Cara 2: Via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Di folder project
vercel

# Ikuti instruksi (login, confirm settings)
# URL live langsung tersedia
```

---

## 💻 Jalankan Lokal (Development)

```bash
# Install dependencies
npm install

# Jalankan dev server
npm run dev

# Buka browser: http://localhost:3000
```

---

## 🏗️ Struktur Project

```
saham-analyzer/
├── pages/
│   ├── index.js          # Halaman utama (UI lengkap)
│   └── api/
│       └── stock.js      # Backend proxy Yahoo Finance
├── styles/
│   └── globals.css       # Font & CSS variables
├── package.json
├── next.config.js
├── vercel.json
└── README.md
```

---

## 📊 Cara Pakai

1. Buka web app
2. Ketik kode saham IDX (contoh: `BBCA`, `TLKM`, `GOTO`)
3. Klik **Analisa** atau tekan Enter
4. Ubah asumsi proyeksi (EPS Growth, PER Target, dll.) sesuai pandangan Anda
5. Baca verdict: **UNDERVALUED / FAIR VALUE / OVERVALUED**

---

## 🔧 Kustomisasi

### Ubah daftar chip saham populer
Edit file `pages/index.js`, cari baris:
```js
const POPULAR = ["BBCA", "TLKM", "ASII", "BMRI", "GOTO", "BREN", "UNVR", "HMSP", "BBRI", "ICBP"];
```

### Ubah default asumsi proyeksi
```js
const [params, setParams] = useState({ growth: 10, perTarget: 15, years: 5, mos: 30 });
```
- `growth`: EPS Growth default (%)
- `perTarget`: PER Target default
- `years`: Tahun proyeksi default
- `mos`: Margin of Safety default (%)

### Ubah threshold warna verdict
Di fungsi `calcProjection`, ubah logika:
```js
if (price <= mosPrice) verdict = "undervalued";
else if (price <= fvBase * 1.1) verdict = "fair";  // ±10% dari FV
else verdict = "overvalued";
```

---

## ⚠️ Disclaimer

Data bersumber dari Yahoo Finance. Fair Value adalah estimasi model sederhana — **bukan rekomendasi investasi**. Selalu lakukan riset mandiri sebelum berinvestasi. Investasi saham mengandung risiko kerugian.

---

## 🛠️ Tech Stack

- **Next.js 14** — React framework
- **Yahoo Finance API** — Data saham
- **Vercel** — Hosting (gratis)
- **Font**: Sora + DM Mono (Google Fonts)

---

## 📝 Lisensi

MIT — bebas digunakan dan dimodifikasi.
