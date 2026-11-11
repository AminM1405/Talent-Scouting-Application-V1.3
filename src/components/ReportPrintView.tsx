import React, { useEffect } from 'react';
import { ArrowLeft, Printer, Award, ShieldCheck, Check } from 'lucide-react';
import { AssessmentRecord } from '../lib/firebase';
import { DOMAINS, getScoreInterpretation } from '../data/domains';

interface ReportPrintViewProps {
  assessment: AssessmentRecord | null;
  onBack: () => void;
}

export const ReportPrintView: React.FC<ReportPrintViewProps> = ({ assessment, onBack }) => {
  if (!assessment) return null;

  const formattedDate = assessment.created_at
    ? new Date(assessment.created_at).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
    : '—';

  const topThree = DOMAINS.map((d) => ({
    domain: d,
    score: assessment.scores?.[d.key] || 0
  }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-stone-100 py-6 px-4">
      {/* Action Bar (Hidden on print) */}
      <div className="max-w-3xl mx-auto mb-4 flex items-center justify-between no-print">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-50 shadow-2xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Aplikasi</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#70263d] text-white text-xs font-bold hover:bg-[#591b2e] shadow-sm transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Simpan ke PDF Sekarang</span>
          </button>
        </div>
      </div>

      {/* Official A4 Sheet Container */}
      <div className="max-w-3xl mx-auto bg-white p-8 sm:p-12 shadow-lg border border-stone-200 rounded-xl print-page">
        {/* Header Dokumen Resmi */}
        <div className="border-b-2 border-[#70263d] pb-4 mb-6 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#70263d] text-white flex items-center justify-center font-black text-2xl shadow-xs">
              T
            </div>
            <div>
              <span className="text-[10px] font-extrabold tracking-widest text-[#70263d] uppercase">
                Integrated Talent Discovery Framework (ITDF)
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-stone-900 leading-tight">
                Laporan Profil Eksplorasi Bakat &amp; Minat
              </h1>
              <p className="text-[11px] text-stone-500">
                Dokumen hasil asesmen refleksi diri terpadu usia 15–18 tahun
              </p>
            </div>
          </div>

          <div className="text-right text-[11px] text-stone-500 shrink-0">
            <span className="block font-semibold text-stone-800">Nomor Registrasi:</span>
            <span className="font-mono font-bold text-[#70263d] text-sm">{assessment.student_code}</span>
          </div>
        </div>

        {/* Tabel Identitas Siswa */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-stone-50 border border-stone-200 mb-6 text-xs print-card">
          <div>
            <span className="text-[10px] text-stone-400 font-semibold block uppercase">Nama Siswa</span>
            <span className="font-bold text-stone-900">{assessment.student_name}</span>
          </div>
          <div>
            <span className="text-[10px] text-stone-400 font-semibold block uppercase">Jenjang / Kelas</span>
            <span className="font-medium text-stone-800">Kelas {assessment.grade || '—'}</span>
          </div>
          <div>
            <span className="text-[10px] text-stone-400 font-semibold block uppercase">Nama Sekolah</span>
            <span className="font-medium text-stone-800 truncate block">{assessment.school || '—'}</span>
          </div>
          <div>
            <span className="text-[10px] text-stone-400 font-semibold block uppercase">Tanggal Pelaksanaan</span>
            <span className="font-medium text-stone-800">{formattedDate}</span>
          </div>
        </div>

        {/* Aspirasi Siswa jika ada */}
        {assessment.aspiration && (
          <div className="mb-6 p-3 rounded-lg border border-stone-200 bg-[#fdfcfb] text-xs">
            <span className="font-bold text-stone-800 block text-[11px] mb-0.5">
              Aspirasi Bidang yang Diminati Siswa:
            </span>
            <p className="text-stone-700 italic">"{assessment.aspiration}"</p>
          </div>
        )}

        {/* Peta 8 Domain Asesmen */}
        <div className="mb-6 space-y-3">
          <div className="flex items-center justify-between border-b border-stone-200 pb-1.5">
            <h2 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              1. Peta Skor Respons 8 Domain Eksplorasi
            </h2>
            <span className="text-[10px] text-stone-500">Skala Penilaian: 1.00 – 5.00</span>
          </div>

          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500 text-[11px]">
                <th className="text-left py-2 font-bold w-8">No</th>
                <th className="text-left py-2 font-bold">Domain Asesmen</th>
                <th className="text-left py-2 font-bold w-48 hidden sm:table-cell">Distribusi Visual</th>
                <th className="text-right py-2 font-bold w-20">Skor (1–5)</th>
                <th className="text-left py-2 pl-4 font-bold w-36">Interpretasi Refleksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {DOMAINS.map((domain, index) => {
                const score = assessment.scores?.[domain.key] || 0;
                const interp = getScoreInterpretation(score);
                const pct = (score / 5) * 100;

                return (
                  <tr key={domain.key} className="py-2 hover:bg-stone-50/50">
                    <td className="py-2 text-stone-400 font-mono">{index + 1}</td>
                    <td className="py-2 pr-2">
                      <span className="font-bold text-stone-900 block">{domain.name}</span>
                      <span className="text-[10px] text-stone-500 block line-clamp-1">{domain.desc}</span>
                    </td>
                    <td className="py-2 pr-4 hidden sm:table-cell align-middle">
                      <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
                        <div
                          className="h-full bg-[#70263d]"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-2 text-right font-mono font-bold text-stone-900 tabular-nums">
                      {score.toFixed(2)}
                    </td>
                    <td className="py-2 pl-4">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${interp.badgeClass}`}>
                        {interp.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Rekomendasi 3 Domain Unggulan */}
        <div className="mb-6 space-y-3 print-card">
          <div className="border-b border-stone-200 pb-1.5 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-[#70263d]" />
            <h2 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              2. Domain Prioritas &amp; Langkah Aksi Awal
            </h2>
          </div>

          <div className="space-y-2.5">
            {topThree.map((item, idx) => (
              <div
                key={item.domain.key}
                className="p-3 rounded-xl border border-stone-200 bg-stone-50/50 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#70263d] text-white flex items-center justify-center font-bold text-[11px]">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-stone-900">{item.domain.name}</span>
                  </div>
                  <span className="font-mono font-bold text-[#70263d]">
                    Skor: {item.score.toFixed(2)} / 5.00
                  </span>
                </div>
                <div className="pl-7 text-[11px] text-stone-600 space-y-0.5">
                  <p><b>Rekomendasi Eksplorasi:</b> {item.domain.tips[0]}</p>
                  {item.domain.tips[1] && (
                    <p><b>Langkah Lanjutan:</b> {item.domain.tips[1]}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Prinsip Kehati-hatian & Triangulasi Data */}
        <div className="mb-8 p-3 rounded-lg border border-amber-200 bg-amber-50/60 text-[11px] text-amber-900 leading-relaxed print-card">
          <b>Prinsip Interpretasi yang Bertanggung Jawab:</b> Hasil asesmen ini merupakan gambaran persepsi dan ketertarikan siswa saat pengisian instrumen, bukan penetapan IQ atau vonis bakat definitif. Minat tinggi belum membuktikan kemahiran teknis, dan skor yang lebih rendah tidak berarti ketiadaan potensi. Rekomendasi wajib ditriangulasi dengan portofolio nyata, prestasi sekolah, observasi guru BK, dan percakapan terbuka bersama orang tua.
        </div>

        {/* Kolom Tanda Tangan */}
        <div className="grid grid-cols-2 gap-8 text-xs pt-4 border-t border-stone-200 print-card">
          <div className="text-center space-y-16">
            <p className="text-stone-500">Siswa yang Mengikuti Asesmen,</p>
            <div>
              <p className="font-bold text-stone-900 border-b border-stone-400 pb-1 inline-block min-w-[160px]">
                {assessment.student_name}
              </p>
              <p className="text-[10px] text-stone-500 mt-0.5">NIS / Kode: {assessment.student_code}</p>
            </div>
          </div>

          <div className="text-center space-y-16">
            <p className="text-stone-500">
              Guru Bimbingan Konseling / Pembimbing,
            </p>
            <div>
              <p className="font-bold text-stone-900 border-b border-stone-400 pb-1 inline-block min-w-[160px]">
                (&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;)
              </p>
              <p className="text-[10px] text-stone-500 mt-0.5">NIP / Identitas Pembimbing</p>
            </div>
          </div>
        </div>

        {/* Footer Dokumen */}
        <div className="mt-8 pt-4 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-400">
          <span>Dihasilkan secara otomatis oleh ITDF Mobile</span>
          <span>Dicetak pada: {new Date().toLocaleDateString('id-ID', { dateStyle: 'long', timeStyle: 'short' } as any)}</span>
        </div>
      </div>
    </div>
  );
};
