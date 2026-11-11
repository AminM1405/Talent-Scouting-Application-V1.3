# ITDF Mobile - Integrated Talent Discovery Framework & Data Management

Aplikasi pendataan dan asesmen bakat/minat siswa berbasis web dengan tampilan *mobile-first*, terintegrasi dengan Firebase Firestore untuk persistensi lintas perangkat tanpa memerlukan login, dilengkapi dashboard statistik ringkas, validasi input ketat, filter pencarian real-time, serta ekspor data ke format CSV dan PDF profesional.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> Keputusan utama telah diselaraskan berdasarkan preferensi yang Anda pilih:
> 1. **Gaya Tampilan & Navigasi**: Tampilan aplikasi mobile modern (*mobile-first app*) dengan bilah navigasi bawah (*bottom navigation bar*), kartu sentuh ergonomis, dan transisi mulus.
> 2. **Cakupan Pendataan**: Menerapkan format Asesmen ITDF 8 domain lengkap (48 butir refleksi diri), dilengkapi validasi profil siswa dan perhitungan skor otomatis.
> 3. **Format Dokumen Ekspor PDF**: Lembar laporan individu bergaya formal dan rapi, dilengkapi profil siswa, grafik sebaran skor 8 domain, indikator interpretasi, dan rekomendasi langkah eksplorasi.
> 4. **Akses Data Tanpa Login**: Sistem pendataan publik/terbuka untuk mempermudah pengisian langsung oleh siswa atau pembimbing di lapangan, dilengkapi penyimpanan ganda (*Firestore + IndexedDB/LocalStorage fallback*).

---

### 1. Overview & Core Concept

- **Apa yang Dibangun**: Aplikasi web pendataan asesmen bakat dan minat siswa *Integrated Talent Discovery Framework* (ITDF) dengan 8 domain utama:
  1. *Minat & eksplorasi karier*
  2. *Penalaran & belajar*
  3. *Teknis & praktis*
  4. *Kreativitas & ekspresi*
  5. *Interpersonal & kolaborasi*
  6. *Kepemimpinan & inisiatif*
  7. *Pengelolaan diri & ketekunan*
  8. *Aspirasi & kesiapan berkembang*
- **Pengguna Target**: Siswa SMA/SMK (usia 15–18 tahun), guru BK, wali kelas, dan pembimbing karier sekolah.
- **Nilai Utama**: Pendataan instan tanpa hambatan login, responsif di berbagai ukuran layar (smartphone hingga desktop), data tersimpan aman dan terpusat di cloud Firestore, serta kemampuan ekspor rekap CSV dan laporan PDF formal dalam sekali sentuh.

---

### 2. User Experience & Visual Design

#### A. Alur Pengguna (User Flows)
1. **Dashboard & Statistik**: Pengguna melihat ringkasan metrik (total siswa, asesmen tersimpan, rata-rata skor per domain, grafik distribusi) dan aktivitas asesmen terbaru.
2. **Formulir Asesmen Bertahap (Stepper)**:
   - *Langkah 1 (Profil)*: Validasi ketat kode siswa (format unik), nama lengkap, sekolah, kelas, dan bidang aspirasi.
   - *Langkah 2 (48 Pernyataan)*: Kuisioner skala Likert 1–5 terorganisir rapi per domain dengan penghitung progres interaktif (*progress bar*) dan deteksi butir yang belum terisi.
   - *Langkah 3 (Hasil Analisis)*: Visualisasi skor 8 domain, penentuan domain teratas, interpretasi refleksi diri, dan rencana eksplorasi.
3. **Penyimpanan & Notifikasi**: Tombol "Simpan ke Database" memicu notifikasi sukses instan dengan animasi toast dan opsi lanjut (Unduh PDF / Asesmen Baru).
4. **Data Siswa & Hasil Asesmen**:
   - Filter pencarian cepat berdasarkan kata kunci nama atau kode siswa.
   - Filter kategori jenjang kelas (X, XI, XII) dan domain bakat.
   - Ekspor data tabel ke format CSV secara real-time.
   - Tampilan modal detail dan cetak/unduh PDF laporan resmi.
5. **Panduan & Validasi Instrumen**: Rujukan metodologi, etika interpretasi (minat vs kemampuan), dan tips pengembangan tiap domain.

#### B. Identitas Visual & Tema Desain
- **Gaya Visual**: Modern, minimalis, dan berwibawa (*editorial academic touch*) dengan palet warna khas ITDF:
  - Dominan Kanvas: Warm Off-White / Cream (`#FDFBF7` dan `#F8F2E8`).
  - Warna Utama / Brand: Deep Maroon (`#70263D`) dan Ruby Accent (`#8B344E`).
  - Permukaan Kartu: White Paper (`#FFFFFF`), Border hairline lembut (`#EADED8`).
  - Status & Aksen: Sage Green (`#28664D`) untuk notifikasi sukses, Warm Amber (`#B47B26`) untuk sorotan.
- **Tipografi**:
  - Display / Judul: Plus Jakarta Sans (Modern, tegas, dan mudah dibaca).
  - Teks Isi: Inter / Plus Jakarta Sans dengan rasio kontras tinggi dan ukuran sentuh nyaman (min. 44px hitbox).
  - Angka & Metrik: Tabular numerals (`tabular-nums font-mono` untuk skor dan statistik).
- **Mobile Ergonomics**:
  - Bilah navigasi bawah tetap (*Sticky Bottom Navigation Bar*) dengan 5 tab: **Ringkasan**, **Asesmen**, **Data Siswa**, **Hasil**, dan **Panduan**.
  - Tombol aksi utama (*floating bottom CTA*) di zona jempol (*thumb-zone*).
  - Notifikasi toast mengambang dengan umpan balik visual yang jelas.

---

### 3. Key Product Decisions & Trade-Offs

1. **Firebase Firestore vs. Penyimpanan Lokal Tunggal**:
   - *Pilihan*: Menggunakan Firebase Firestore sebagai penyimpanan cloud utama, dipadukan dengan sinkronisasi reaktif (*real-time snapshot*) dan fallback ke LocalStorage/cache offline.
   - *Alasan*: Pengguna meminta integrasi Firestore agar data tersinkronisasi antarperangkat tanpa login, namun tetap berfungsi tangguh bila koneksi internet siswa tidak stabil.
2. **Validasi Input Ketat Sisi Klien**:
   - *Pilihan*: Validasi regex untuk kode siswa (`^[A-Z0-9_-]{3,20}$`), panjang karakter nama minimal 3 huruf, sanitasi HTML, dan verifikasi kelengkapan seluruh 48 pernyataan sebelum perhitungan skor.
   - *Alasan*: Mencegah data sampah (*dirty data*), duplikasi kode siswa, dan bias asesmen akibat butir yang terlewat.
3. **Mekanisme Ekspor PDF**:
   - *Pilihan*: Menggunakan layout cetak terisolasi berstandar A4 dengan CSS `@media print` yang dioptimalkan serta pustaka HTML-to-PDF / print view terstruktur (logo ITDF, tabel skor rapi, bar visual, dan rekomendasi resmi).
   - *Alasan*: Memberikan hasil cetak tajam, cepat, tanpa dependensi server yang berat, dan kompatibel di peramban seluler (Chrome/Safari iOS/Android).

---

### 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                       React SPA UI                          │
│                                                             │
│  ┌───────────────┐ ┌────────────────┐ ┌──────────────────┐  │
│  │ Mobile Header │ │ Page Container │ │ Sticky Bottom Nav│  │
│  │ & Status Bar  │ │  (Tab Views)   │ │ (5 Primary Tabs) │  │
│  └───────────────┘ └────────────────┘ └──────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Interactive Components:                               │  │
│  │ • DashboardStats (Real-time summary, KPI counters)    │  │
│  │ • AssessmentStepper (Profil -> 48 Likert -> Hasil)    │  │
│  │ • StudentDataTable (Search filter, chips, CSV export) │  │
│  │ • ReportDetailModal (Detail skor, PDF export view)    │  │
│  │ • ToastNotification (Konfirmasi sukses simpan data)   │  │
│  └───────────────────────────────────────────────────────┘  │
└───────────────────────────────┬─────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                 Data Access & Sync Layer                    │
│                                                             │
│  ┌──────────────────────┐        ┌───────────────────────┐  │
│  │  Firebase Firestore  │◄──────►│ Offline-First Storage │  │
│  │  (Cloud Database)    │  Sync  │ (LocalStorage Backup) │  │
│  └──────────────────────┘        └───────────────────────┘  │
│                                                             │
│  Collections:                                               │
│  • /students/{studentId}                                    │
│  • /assessments/{assessmentId}                              │
└─────────────────────────────────────────────────────────────┘
```

#### Struktur Koleksi Firestore:
- **`students`**:
  - `id`: string (UUID / sanitized code)
  - `student_code`: string (mis. `ITDF-001`, unik)
  - `name`: string
  - `school`: string
  - `grade`: string (`'X' | 'XI' | 'XII'`)
  - `created_at`: string (ISO Timestamp)
- **`assessments`**:
  - `id`: string
  - `student_code`: string
  - `student_name`: string
  - `school`: string
  - `grade`: string
  - `aspiration`: string
  - `scores`: object `{ interest: number, reasoning: number, ... }`
  - `answers`: object `{ q1: number, ..., q48: number }`
  - `top_domain`: string
  - `top_score`: number
  - `created_at`: string (ISO Timestamp)

#### Rencana Pelaksanaan:
1. **Langkah 1: Setup Firebase & Firestore Rules**:
   - Jalankan alur inisialisasi Firebase (`show_aistudio_ui` dengan `firebase_setup`), verifikasi syarat, dan provisi Firestore.
   - Buat `firebase-blueprint.json` dan `firestore.rules` yang aman.
2. **Langkah 2: Komponen Frontend Mobile-First & Navigasi Bawah**:
   - Susun kerangka antarmuka mobile dengan styling Tailwind CSS yang bersih dan ergonomis.
   - Sediakan 5 tab navigasi bawah yang responsif di ponsel maupun desktop.
3. **Langkah 3: Formulir Asesmen, Validasi Ketat & Notifikasi**:
   - Kuesioner 48 butir dengan indikator kemajuan responsif.
   - Sistem validasi input yang ketat dan modal notifikasi sukses interaktif.
4. **Langkah 4: Fitur Pencarian, Filter & Ekspor CSV/PDF**:
   - Implementasikan pencarian instan dan filter multi-kriteria.
   - Ekspor data CSV real-time dengan BOM UTF-8 (kompatibel Microsoft Excel).
   - Lembar laporan profil resmi siap cetak/simpan sebagai PDF.
5. **Langkah 5: Verifikasi & Pengujian Kualitas**:
   - Verifikasi kompilasi (`compile_applet`) dan linter (`lint_applet`).
   - Uji alur input, penyimpanan, dan ekspor.
