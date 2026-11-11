import React, { useState, useId, useRef } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Save,
  Printer,
  RotateCcw,
  Sparkles,
  Award,
  ChevronDown,
  Info
} from 'lucide-react';
import { DOMAINS, getScoreInterpretation } from '../data/domains';
import { AssessmentRecord, StudentRecord } from '../lib/firebase';

interface AssessmentViewProps {
  existingStudents: StudentRecord[];
  initialStudent?: StudentRecord | null;
  onSaveAssessment: (assessment: AssessmentRecord) => Promise<void>;
  onPrintReport: (assessment: AssessmentRecord) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info', title?: string) => void;
}

export const AssessmentView: React.FC<AssessmentViewProps> = ({
  existingStudents,
  initialStudent,
  onSaveAssessment,
  onPrintReport,
  showToast
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Form Profil Siswa
  const [studentName, setStudentName] = useState(initialStudent?.name || '');
  const [studentCode, setStudentCode] = useState(initialStudent?.student_code || '');
  const [schoolName, setSchoolName] = useState(initialStudent?.school || '');
  const [grade, setGrade] = useState<'X' | 'XI' | 'XII'>((initialStudent?.grade as any) || 'X');
  const [aspiration, setAspiration] = useState('');

  // Update jika initialStudent berganti
  React.useEffect(() => {
    if (initialStudent) {
      setStudentName(initialStudent.name || '');
      setStudentCode(initialStudent.student_code || '');
      setSchoolName(initialStudent.school || '');
      if (initialStudent.grade && ['X', 'XI', 'XII'].includes(initialStudent.grade)) {
        setGrade(initialStudent.grade as 'X' | 'XI' | 'XII');
      }
    }
  }, [initialStudent]);

  // Validation errors
  const [profileErrors, setProfileErrors] = useState<{ name?: string; code?: string }>({});

  // Jawaban 48 Butir Likert (q1 s.d. q48)
  const [answers, setAnswers] = useState<Record<string, number>>({});

  // Hasil Perhitungan
  const [calculatedResult, setCalculatedResult] = useState<AssessmentRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const questionsContainerRef = useRef<HTMLDivElement>(null);

  // Total butir
  const TOTAL_QUESTIONS = 48;
  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round((answeredCount / TOTAL_QUESTIONS) * 100);

  // Validasi Langkah 1
  const validateProfile = (): boolean => {
    const errors: { name?: string; code?: string } = {};

    const cleanName = studentName.trim();
    if (!cleanName) {
      errors.name = 'Nama siswa wajib diisi.';
    } else if (cleanName.length < 3) {
      errors.name = 'Nama siswa minimal 3 karakter.';
    } else if (cleanName.length > 100) {
      errors.name = 'Nama siswa maksimal 100 karakter.';
    }

    const cleanCode = studentCode.trim().toUpperCase();
    if (!cleanCode) {
      errors.code = 'Kode siswa wajib diisi.';
    } else if (!/^[A-Z0-9_-]{3,30}$/.test(cleanCode)) {
      errors.code = 'Format kode: huruf kapital, angka, dash (-), atau underscore (_), panjang 3-30 karakter.';
    }

    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Navigasi ke Langkah 2
  const handleProceedToQuestions = () => {
    if (!validateProfile()) {
      showToast('Periksa kembali input data siswa yang belum valid.', 'error', 'Validasi Gagal');
      return;
    }
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Set jawaban skala Likert
  const handleSelectAnswer = (qKey: string, val: number) => {
    setAnswers((prev) => ({ ...prev, [qKey]: val }));
  };

  // Lompat ke pertanyaan pertama yang belum terjawab
  const jumpToFirstUnanswered = () => {
    for (let di = 0; di < DOMAINS.length; di++) {
      for (let qi = 0; qi < 6; qi++) {
        const qKey = `q${di * 6 + qi + 1}`;
        if (!answers[qKey]) {
          const el = document.getElementById(`box_${qKey}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add('ring-2', 'ring-rose-400');
            setTimeout(() => el.classList.remove('ring-2', 'ring-rose-400'), 2500);
            return;
          }
        }
      }
    }
  };

  // Hitung Skor & Lanjut ke Langkah 3
  const handleCalculateScores = () => {
    if (answeredCount < TOTAL_QUESTIONS) {
      const missing = TOTAL_QUESTIONS - answeredCount;
      showToast(
        `Masih ada ${missing} butir yang belum dijawab. Mohon lengkapi semua pernyataan.`,
        'error',
        'Belum Lengkap'
      );
      jumpToFirstUnanswered();
      return;
    }

    // Hitung rata-rata per domain
    const scores: Record<string, number> = {};
    let highestScore = -1;
    let highestDomainName = '';

    DOMAINS.forEach((domain, di) => {
      let sum = 0;
      for (let qi = 0; qi < 6; qi++) {
        const qKey = `q${di * 6 + qi + 1}`;
        sum += Number(answers[qKey] || 0);
      }
      const avg = Number((sum / 6).toFixed(2));
      scores[domain.key] = avg;

      if (avg > highestScore) {
        highestScore = avg;
        highestDomainName = domain.name;
      }
    });

    const result: AssessmentRecord = {
      student_code: studentCode.trim().toUpperCase(),
      student_name: studentName.trim(),
      school: schoolName.trim(),
      grade,
      aspiration: aspiration.trim(),
      scores,
      answers: { ...answers },
      top_domain: highestDomainName,
      top_score: highestScore,
      summary: `Profil refleksi diri 8 domain ITDF untuk ${studentName.trim()}. Perlu dikonfirmasikan dengan portofolio dan dialog pembimbing.`,
      created_at: new Date().toISOString()
    };

    setCalculatedResult(result);
    setIsSaved(false);
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('Skor asesmen berhasil dihitung.', 'success', 'Perhitungan Selesai');
  };

  // Simpan ke Firestore
  const handleSave = async () => {
    if (!calculatedResult || isSaving || isSaved) return;
    setIsSaving(true);
    try {
      await onSaveAssessment(calculatedResult);
      setIsSaved(true);
      showToast('Hasil asesmen berhasil disimpan ke database.', 'success', 'Tersimpan');
    } catch (err) {
      showToast('Gagal menyimpan ke database. Data tetap ada di cache.', 'error', 'Peringatan');
    } finally {
      setIsSaving(false);
    }
  };

  // Reset Asesmen Baru
  const handleResetForm = () => {
    if (window.confirm('Mulai asesmen siswa baru? Pastikan data saat ini telah disimpan.')) {
      setStudentName('');
      setStudentCode('');
      setSchoolName('');
      setGrade('X');
      setAspiration('');
      setAnswers({});
      setCalculatedResult(null);
      setIsSaved(false);
      setProfileErrors({});
      setCurrentStep(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-4 pb-24 max-w-2xl mx-auto">
      {/* Stepper Header */}
      <div className="bg-white rounded-2xl border border-[#eaded8] p-3 sm:p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                currentStep >= 1 ? 'bg-[#70263d] text-white' : 'bg-stone-100 text-stone-500'
              }`}
            >
              1
            </span>
            <span className={`text-xs font-semibold ${currentStep === 1 ? 'text-stone-900' : 'text-stone-500'}`}>
              Profil
            </span>
          </div>

          <div className="h-0.5 flex-1 mx-2 bg-stone-200" />

          <div className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                currentStep >= 2 ? 'bg-[#70263d] text-white' : 'bg-stone-100 text-stone-500'
              }`}
            >
              2
            </span>
            <span className={`text-xs font-semibold ${currentStep === 2 ? 'text-stone-900' : 'text-stone-500'}`}>
              48 Butir
            </span>
          </div>

          <div className="h-0.5 flex-1 mx-2 bg-stone-200" />

          <div className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                currentStep === 3 ? 'bg-[#70263d] text-white' : 'bg-stone-100 text-stone-500'
              }`}
            >
              3
            </span>
            <span className={`text-xs font-semibold ${currentStep === 3 ? 'text-stone-900' : 'text-stone-500'}`}>
              Hasil
            </span>
          </div>
        </div>
      </div>

      {/* LANGKAH 1: PROFIL SISWA */}
      {currentStep === 1 && (
        <div className="bg-white rounded-2xl border border-[#eaded8] p-5 shadow-xs space-y-4">
          <div className="border-b border-[#eaded8] pb-3">
            <h3 className="text-base font-bold text-stone-900">
              Langkah 1: Identitas &amp; Profil Siswa
            </h3>
            <p className="text-xs text-stone-600 mt-0.5">
              Masukkan data dasar siswa. Semua data tervalidasi secara ketat dan aman.
            </p>
          </div>

          <div className="space-y-3.5">
            {/* Nama Siswa */}
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                Nama Lengkap Siswa <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => {
                  setStudentName(e.target.value);
                  if (profileErrors.name) setProfileErrors((p) => ({ ...p, name: undefined }));
                }}
                placeholder="Contoh: Muhammad Rian Pratama"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-colors outline-hidden focus:ring-2 focus:ring-[#70263d]/20 ${
                  profileErrors.name
                    ? 'border-rose-400 bg-rose-50/30'
                    : 'border-stone-300 focus:border-[#70263d] bg-white'
                }`}
                maxLength={100}
              />
              {profileErrors.name && (
                <p className="text-[11px] text-rose-600 font-medium mt-1">
                  {profileErrors.name}
                </p>
              )}
            </div>

            {/* Kode Siswa */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-stone-800">
                  Kode Siswa / NIS <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] text-stone-600">Huruf/Angka/Dash unik</span>
              </div>
              <input
                type="text"
                value={studentCode}
                onChange={(e) => {
                  const val = e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, '');
                  setStudentCode(val);
                  if (profileErrors.code) setProfileErrors((p) => ({ ...p, code: undefined }));
                }}
                placeholder="Contoh: ITDF-2026-001"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono transition-colors outline-hidden focus:ring-2 focus:ring-[#70263d]/20 ${
                  profileErrors.code
                    ? 'border-rose-400 bg-rose-50/30'
                    : 'border-stone-300 focus:border-[#70263d] bg-white'
                }`}
                maxLength={30}
              />
              {profileErrors.code && (
                <p className="text-[11px] text-rose-600 font-medium mt-1">
                  {profileErrors.code}
                </p>
              )}
            </div>

            {/* Grid Sekolah & Kelas */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Nama Sekolah
                </label>
                <input
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="Contoh: SMAN 1 Jakarta"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-[#70263d] text-sm outline-hidden focus:ring-2 focus:ring-[#70263d]/20"
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Jenjang / Kelas
                </label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value as 'X' | 'XI' | 'XII')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-[#70263d] text-sm bg-white outline-hidden focus:ring-2 focus:ring-[#70263d]/20 font-medium"
                >
                  <option value="X">Kelas X</option>
                  <option value="XI">Kelas XI</option>
                  <option value="XII">Kelas XII</option>
                </select>
              </div>
            </div>

            {/* Bidang Aspirasi */}
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                Aspirasi / Bidang yang Ingin Dieksplorasi (Opsional)
              </label>
              <input
                type="text"
                value={aspiration}
                onChange={(e) => setAspiration(e.target.value)}
                placeholder="Contoh: Teknologi informasi, kedokteran, desain grafis, bisnis"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-[#70263d] text-sm outline-hidden focus:ring-2 focus:ring-[#70263d]/20"
                maxLength={200}
              />
              <span className="text-[10px] text-stone-600 block mt-1">
                Membantu pembimbing membandingkan antara cita-cita awal dengan hasil respons asesmen.
              </span>
            </div>
          </div>

          <div className="pt-3 flex justify-end">
            <button
              onClick={handleProceedToQuestions}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#70263d] hover:bg-[#591b2e] text-white font-bold text-sm shadow-sm transition-all active:scale-[0.98]"
            >
              <span>Lanjut ke 48 Pernyataan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* LANGKAH 2: 48 PERNYATAAN REFLEKSI */}
      {currentStep === 2 && (
        <div className="space-y-4" ref={questionsContainerRef}>
          {/* Sticky Progress Bar */}
          <div className="sticky top-14 z-20 bg-white/95 backdrop-blur-md rounded-2xl border border-[#eaded8] p-3 shadow-sm">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-stone-800">
                Progres Pengisian Pernyataan
              </span>
              <span className="font-mono font-bold text-[#70263d] tabular-nums">
                {answeredCount}/{TOTAL_QUESTIONS} ({progressPercent}%)
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-[#70263d] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            {answeredCount < TOTAL_QUESTIONS && (
              <div className="flex items-center justify-between mt-2 pt-1 border-t border-stone-100 text-[11px]">
                <span className="text-stone-600">
                  {TOTAL_QUESTIONS - answeredCount} butir tersisa
                </span>
                <button
                  onClick={jumpToFirstUnanswered}
                  className="text-[#70263d] font-bold underline"
                >
                  Lompat ke yang belum diisi
                </button>
              </div>
            )}
          </div>

          {/* Petunjuk Pengisian */}
          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs leading-relaxed flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <b>Petunjuk Pengisian:</b> Jawablah sejujurnya berdasarkan apa yang Anda rasakan dan alami saat ini. Skala 1 (Sangat Tidak Sesuai) hingga 5 (Sangat Sesuai). Tidak ada jawaban salah.
            </div>
          </div>

          {/* Render 8 Domain Sections */}
          {DOMAINS.map((domain, di) => (
            <div
              key={domain.key}
              className="bg-white rounded-2xl border border-[#eaded8] p-4 sm:p-5 shadow-xs space-y-3"
            >
              {/* Domain Header */}
              <div className="border-b border-[#eaded8] pb-2.5">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#70263d] tracking-wider uppercase">
                  <span>Domain {di + 1} dari 8</span>
                </div>
                <h4 className="text-sm sm:text-base font-bold text-stone-900 mt-0.5">
                  {domain.name}
                </h4>
                <p className="text-xs text-stone-600 mt-0.5">{domain.desc}</p>
              </div>

              {/* 6 Questions */}
              <div className="space-y-4 pt-1">
                {domain.items.map((qText, qi) => {
                  const qNum = di * 6 + qi + 1;
                  const qKey = `q${qNum}`;
                  const currentVal = answers[qKey];

                  return (
                    <div
                      key={qKey}
                      id={`box_${qKey}`}
                      className={`p-3 rounded-xl transition-all border ${
                        currentVal
                          ? 'border-[#eaded8] bg-[#fdfcfb]'
                          : 'border-stone-200 bg-white'
                      }`}
                    >
                      <p className="text-xs sm:text-sm font-medium text-stone-800 leading-snug mb-2.5">
                        <span className="font-bold text-[#70263d] mr-1">{qNum}.</span>
                        {qText}
                      </p>

                      {/* 5-Option Likert Grid */}
                      <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                        {[
                          { val: 1, label: 'Sangat Tidak' },
                          { val: 2, label: 'Kurang' },
                          { val: 3, label: 'Netral' },
                          { val: 4, label: 'Sesuai' },
                          { val: 5, label: 'Sangat Sesuai' }
                        ].map((opt) => {
                          const isSelected = currentVal === opt.val;
                          return (
                            <button
                              key={opt.val}
                              type="button"
                              onClick={() => handleSelectAnswer(qKey, opt.val)}
                              className={`flex flex-col items-center justify-center p-2 rounded-xl text-center transition-all min-h-[50px] touch-manipulation border ${
                                isSelected
                                  ? 'bg-[#70263d] text-white border-[#70263d] shadow-xs scale-[1.02]'
                                  : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200/80'
                              }`}
                            >
                              <span className="text-sm sm:text-base font-bold leading-none mb-1">
                                {opt.val}
                              </span>
                              <span className="text-[9px] sm:text-[10px] leading-tight opacity-90 line-clamp-1">
                                {opt.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Bottom Actions */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              onClick={() => {
                setCurrentStep(1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-700 text-xs font-semibold hover:bg-stone-50"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Profil</span>
            </button>

            <button
              onClick={handleCalculateScores}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs sm:text-sm shadow-sm transition-all active:scale-[0.98] ${
                answeredCount === TOTAL_QUESTIONS
                  ? 'bg-[#70263d] text-white hover:bg-[#591b2e]'
                  : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
              }`}
            >
              <span>Hitung Skor Asesmen</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* LANGKAH 3: HASIL ASESMEN */}
      {currentStep === 3 && calculatedResult && (
        <div className="space-y-4">
          {/* Header Hasil */}
          <div className="bg-white rounded-2xl border border-[#eaded8] p-5 shadow-xs space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-2 border-b border-[#eaded8] pb-3">
              <div>
                <span className="text-[10px] font-bold tracking-wider text-[#70263d] uppercase">
                  Profil Eksplorasi ITDF
                </span>
                <h3 className="text-lg font-bold text-stone-900 mt-0.5">
                  {calculatedResult.student_name}
                </h3>
                <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 mt-0.5">
                  <span className="font-mono font-medium text-[#70263d]">
                    {calculatedResult.student_code}
                  </span>
                  <span>·</span>
                  <span>Kelas {calculatedResult.grade}</span>
                  {calculatedResult.school && (
                    <>
                      <span>·</span>
                      <span>{calculatedResult.school}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-stone-400 block">Skor Teratas</span>
                <span className="text-xl font-bold text-emerald-700 font-mono">
                  {calculatedResult.top_score?.toFixed(2)}
                  <span className="text-xs text-stone-500">/5</span>
                </span>
              </div>
            </div>

            {calculatedResult.aspiration && (
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70 text-xs">
                <span className="font-semibold text-stone-700">Aspirasi Minat yang Dinyatakan: </span>
                <span className="text-stone-800">{calculatedResult.aspiration}</span>
              </div>
            )}
          </div>

          {/* Skor 8 Domain Lengkap */}
          <div className="bg-white rounded-2xl border border-[#eaded8] p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              Peta Skor 8 Domain
            </h4>
            <div className="space-y-3">
              {DOMAINS.map((domain, index) => {
                const score = calculatedResult.scores[domain.key] || 0;
                const interp = getScoreInterpretation(score);
                const pct = (score / 5) * 100;

                return (
                  <div key={domain.key} className="space-y-1.5 p-2.5 rounded-xl bg-stone-50/60 border border-stone-200/50">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-bold text-stone-800 truncate">
                          {index + 1}. {domain.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${interp.badgeClass}`}>
                          {interp.label}
                        </span>
                        <span className="font-mono font-bold text-stone-900 tabular-nums">
                          {score.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-2 rounded-full bg-stone-200/70 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#70263d] transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3 Domain Unggulan & Rekomendasi Langkah Aksi */}
          <div className="bg-white rounded-2xl border border-[#eaded8] p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-600" />
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                Prioritas Eksplorasi Teratas &amp; Rekomendasi
              </h4>
            </div>

            <div className="space-y-3">
              {DOMAINS.map((d) => ({
                domain: d,
                score: calculatedResult.scores[d.key] || 0
              }))
                .sort((a, b) => b.score - a.score)
                .slice(0, 3)
                .map((item, rank) => (
                  <div
                    key={item.domain.key}
                    className="p-3.5 rounded-xl border border-[#eaded8] bg-[#fdfbf9] space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-[#70263d] text-white flex items-center justify-center text-xs font-bold">
                          {rank + 1}
                        </span>
                        <span className="text-xs font-bold text-stone-900">
                          {item.domain.name}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-xs text-stone-800">
                        {item.score.toFixed(2)} / 5.00
                      </span>
                    </div>

                    <div className="text-[11px] text-stone-600 pl-7 space-y-1">
                      <p>
                        <b>Saran Aksi 1:</b> {item.domain.tips[0]}
                      </p>
                      {item.domain.tips[1] && (
                        <p>
                          <b>Saran Aksi 2:</b> {item.domain.tips[1]}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Catatan Etika & Kehati-hatian */}
          <div className="p-3.5 rounded-xl bg-stone-100 border border-stone-200 text-stone-600 text-xs leading-relaxed">
            <b>Catatan Interpretasi:</b> Hasil ini menggambarkan respons refleksi diri saat pengisian, bukan penetapan kecerdasan baku atau vonis bakat permanen. Gunakan hasil ini sebagai bahan dialog yang sehat antara siswa, keluarga, dan guru pembimbing.
          </div>

          {/* Tombol Aksi Simpan & Ekspor */}
          <div className="space-y-2 pt-2">
            <button
              onClick={handleSave}
              disabled={isSaving || isSaved}
              className={`w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-sm shadow-sm transition-all active:scale-[0.99] ${
                isSaved
                  ? 'bg-emerald-700 text-white cursor-default'
                  : 'bg-[#70263d] hover:bg-[#591b2e] text-white'
              }`}
            >
              {isSaved ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>✓ Data Tersimpan di Firebase</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>{isSaving ? 'Menyimpan ke Cloud...' : 'Simpan Data ke Database'}</span>
                </>
              )}
            </button>

            <button
              onClick={() => onPrintReport(calculatedResult)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs sm:text-sm transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Ekspor Lembar PDF Resmi</span>
            </button>

            <button
              onClick={handleResetForm}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-stone-500 hover:text-stone-800 font-medium text-xs transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Asesmen Siswa Baru</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
