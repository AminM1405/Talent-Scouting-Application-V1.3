import React from 'react';
import { BookOpen, ShieldAlert, CheckCircle, Scale, Sparkles, HelpCircle } from 'lucide-react';
import { DOMAINS } from '../data/domains';

export const GuideView: React.FC = () => {
  return (
    <div className="space-y-4 pb-24 max-w-2xl mx-auto">
      {/* Header Panduan */}
      <div className="bg-white rounded-2xl border border-[#eaded8] p-4 sm:p-5 shadow-xs">
        <h3 className="text-base font-bold text-stone-900">
          Panduan Implementasi &amp; Validasi
        </h3>
        <p className="text-xs text-stone-600 mt-0.5">
          Kerangka kerja etis dan metodologis penggunaan ITDF di lingkungan pendidikan
        </p>
      </div>

      {/* 4 Prinsip Interpretasi */}
      <div className="bg-white rounded-2xl border border-[#eaded8] p-4 sm:p-5 shadow-xs space-y-3">
        <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
          <Scale className="w-4 h-4 text-[#70263d]" />
          4 Prinsip Interpretasi yang Bertanggung Jawab
        </h4>

        <div className="space-y-2.5 text-xs">
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70 space-y-1">
            <span className="font-bold text-[#70263d] block">
              1. Minat Berbeda dengan Kemampuan
            </span>
            <p className="text-stone-600 leading-relaxed text-[11px]">
              Ketertarikan tinggi pada satu domain belum membuktikan penguasaan keterampilan teknis. Sebaliknya, hal itu menandakan potensi area yang patut dieksplorasi dengan latihan nyata.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70 space-y-1">
            <span className="font-bold text-[#70263d] block">
              2. Potensi Membutuhkan Bukti Nyata
            </span>
            <p className="text-stone-600 leading-relaxed text-[11px]">
              Gunakan portofolio, hasil karya, tugas kelas, dan observasi perilaku dari waktu ke waktu untuk memvalidasi minat siswa secara adil dan objektif.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70 space-y-1">
            <span className="font-bold text-[#70263d] block">
              3. Hasil Asesmen Bukan Label Permanen
            </span>
            <p className="text-stone-600 leading-relaxed text-[11px]">
              Profil refleksi diri dapat berubah dinamis seiring bertambahnya usia, wawasan, pergaulan, dan kesempatan belajar baru yang dialami siswa.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70 space-y-1">
            <span className="font-bold text-[#70263d] block">
              4. Keputusan Tetap Manusiawi
            </span>
            <p className="text-stone-600 leading-relaxed text-[11px]">
              Rekomendasi sistem adalah bahan dialog untuk memperkaya diskusi antara siswa, orang tua, dan guru BK, bukan vonis algoritmik otomatis yang membatasi jurusan.
            </p>
          </div>
        </div>
      </div>

      {/* Rincian 8 Domain */}
      <div className="bg-white rounded-2xl border border-[#eaded8] p-4 sm:p-5 shadow-xs space-y-3">
        <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
          Rincian 8 Domain Eksplorasi ITDF
        </h4>

        <div className="space-y-2">
          {DOMAINS.map((domain, index) => (
            <div
              key={domain.key}
              className="p-3 rounded-xl border border-stone-100 bg-[#fdfcfb] space-y-1 text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-[#70263d] text-white flex items-center justify-center font-bold text-[10px]">
                  {index + 1}
                </span>
                <span className="font-bold text-stone-900">{domain.name}</span>
              </div>
              <p className="text-[11px] text-stone-600 pl-7">{domain.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Alur Validasi */}
      <div className="bg-white rounded-2xl border border-[#eaded8] p-4 sm:p-5 shadow-xs space-y-3">
        <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
          <CheckCircle className="w-4 h-4 text-emerald-700" />
          Alur Validasi Berkelanjutan
        </h4>

        <div className="space-y-2 text-xs">
          <div className="flex items-start gap-2.5 p-2 rounded-lg">
            <span className="font-mono font-bold text-[#70263d]">A.</span>
            <span className="text-stone-700">
              <b>Definisi Konstruk:</b> Penetapan 8 domain minat eksploratif dan indikator perilaku siswa usia 15–18 tahun.
            </span>
          </div>
          <div className="flex items-start gap-2.5 p-2 rounded-lg">
            <span className="font-mono font-bold text-[#70263d]">B.</span>
            <span className="text-stone-700">
              <b>Telaah Ahli:</b> Peninjauan butir kuesioner oleh praktisi psikologi dan konselor bimbingan konseling.
            </span>
          </div>
          <div className="flex items-start gap-2.5 p-2 rounded-lg">
            <span className="font-mono font-bold text-[#70263d]">C.</span>
            <span className="text-stone-700">
              <b>Uji Konsistensi:</b> Verifikasi distribusi skor dan keterbacaan bahasa bagi siswa di berbagai sekolah.
            </span>
          </div>
        </div>
      </div>

      {/* Disclaimer Box */}
      <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/90 text-amber-900 text-xs leading-relaxed flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <b>Peringatan Kebijakan Privasi:</b> Kelola data kode siswa dan nama sesuai regulasi perlindungan data pribadi siswa. Hindari mencantumkan NIK atau dokumen sensitif. Gunakan akun guru BK atau perangkat sekolah yang terlindungi.
        </div>
      </div>
    </div>
  );
};
