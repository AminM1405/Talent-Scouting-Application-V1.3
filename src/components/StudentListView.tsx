import React, { useState, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  CheckCircle2,
  X,
  Plus,
  PlayCircle,
  GraduationCap
} from 'lucide-react';
import { StudentRecord } from '../lib/firebase';

interface StudentListProps {
  students: StudentRecord[];
  onAddStudent: (student: StudentRecord) => Promise<void>;
  onStartAssessmentForStudent: (student: StudentRecord) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info', title?: string) => void;
}

export const StudentListView: React.FC<StudentListProps> = ({
  students,
  onAddStudent,
  onStartAssessmentForStudent,
  showToast
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('ALL');

  // New Student Form States
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newSchool, setNewSchool] = useState('');
  const [newGrade, setNewGrade] = useState<'X' | 'XI' | 'XII'>('X');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<{ code?: string; name?: string }>({});

  const validateNewStudent = (): boolean => {
    const errors: { code?: string; name?: string } = {};

    const cleanCode = newCode.trim().toUpperCase();
    if (!cleanCode) {
      errors.code = 'Kode siswa wajib diisi.';
    } else if (!/^[A-Z0-9_-]{3,30}$/.test(cleanCode)) {
      errors.code = 'Kode harus alfanumerik (huruf kapital, angka, - atau _), panjang 3-30.';
    } else if (
      students.some((s) => s.student_code.toUpperCase() === cleanCode)
    ) {
      errors.code = 'Kode siswa ini sudah terdaftar di sistem.';
    }

    const cleanName = newName.trim();
    if (!cleanName) {
      errors.name = 'Nama siswa wajib diisi.';
    } else if (cleanName.length < 3) {
      errors.name = 'Nama siswa minimal 3 karakter.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateNewStudent()) return;

    setIsSubmitting(true);
    try {
      await onAddStudent({
        student_code: newCode.trim().toUpperCase(),
        name: newName.trim(),
        school: newSchool.trim(),
        grade: newGrade,
        created_at: new Date().toISOString()
      });

      // Reset Form
      setNewCode('');
      setNewName('');
      setNewSchool('');
      setNewGrade('X');
      setShowAddForm(false);
      setFormErrors({});
      showToast('Data siswa berhasil ditambahkan ke database.', 'success', 'Siswa Tersimpan');
    } catch (err) {
      showToast('Gagal menambahkan siswa. Periksa koneksi internet.', 'error', 'Gagal Simpan');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered & Searched Students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        searchQuery === '' ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.student_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.school && s.school.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchGrade = selectedGrade === 'ALL' || s.grade === selectedGrade;

      return matchSearch && matchGrade;
    });
  }, [students, searchQuery, selectedGrade]);

  return (
    <div className="space-y-4 pb-24 max-w-2xl mx-auto">
      {/* Header & Add Button */}
      <div className="bg-white rounded-2xl border border-[#eaded8] p-4 sm:p-5 shadow-xs flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-stone-900">Data Siswa</h3>
          <p className="text-xs text-stone-600 mt-0.5">
            Daftar subjek asesmen yang terdaftar di Firestore
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#70263d] hover:bg-[#591b2e] text-white font-semibold text-xs transition-all shadow-xs active:scale-95"
        >
          {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4 stroke-[2.5]" />}
          <span>{showAddForm ? 'Tutup' : 'Tambah Siswa'}</span>
        </button>
      </div>

      {/* Form Tambah Siswa */}
      {showAddForm && (
        <form
          onSubmit={handleSaveStudent}
          className="bg-white rounded-2xl border border-[#70263d]/30 p-5 shadow-sm space-y-3.5 animate-in fade-in duration-200"
        >
          <div className="border-b border-[#eaded8] pb-2.5">
            <h4 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
              <UserPlus className="w-4 h-4 text-[#70263d]" />
              Formulir Tambah Siswa Baru
            </h4>
            <p className="text-xs text-stone-500 mt-0.5">
              Pastikan kode siswa unik dan tidak mengandung karakter terlarang.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Kode Siswa */}
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                Kode Siswa / NIS <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={newCode}
                onChange={(e) => {
                  const val = e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, '');
                  setNewCode(val);
                  if (formErrors.code) setFormErrors((p) => ({ ...p, code: undefined }));
                }}
                placeholder="Mis. ITDF-010"
                className={`w-full px-3 py-2 rounded-xl border text-sm font-mono outline-hidden focus:ring-2 focus:ring-[#70263d]/20 ${
                  formErrors.code ? 'border-rose-400 bg-rose-50/30' : 'border-stone-300'
                }`}
                maxLength={30}
              />
              {formErrors.code && (
                <p className="text-[11px] text-rose-600 font-medium mt-1">
                  {formErrors.code}
                </p>
              )}
            </div>

            {/* Nama Siswa */}
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                Nama Lengkap <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value);
                  if (formErrors.name) setFormErrors((p) => ({ ...p, name: undefined }));
                }}
                placeholder="Nama lengkap siswa"
                className={`w-full px-3 py-2 rounded-xl border text-sm outline-hidden focus:ring-2 focus:ring-[#70263d]/20 ${
                  formErrors.name ? 'border-rose-400 bg-rose-50/30' : 'border-stone-300'
                }`}
                maxLength={100}
              />
              {formErrors.name && (
                <p className="text-[11px] text-rose-600 font-medium mt-1">
                  {formErrors.name}
                </p>
              )}
            </div>

            {/* Nama Sekolah */}
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                Nama Sekolah
              </label>
              <input
                type="text"
                value={newSchool}
                onChange={(e) => setNewSchool(e.target.value)}
                placeholder="SMA/SMK ..."
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm outline-hidden focus:ring-2 focus:ring-[#70263d]/20"
                maxLength={100}
              />
            </div>

            {/* Kelas */}
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                Jenjang / Kelas
              </label>
              <select
                value={newGrade}
                onChange={(e) => setNewGrade(e.target.value as 'X' | 'XI' | 'XII')}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm bg-white outline-hidden focus:ring-2 focus:ring-[#70263d]/20 font-medium"
              >
                <option value="X">Kelas X</option>
                <option value="XI">Kelas XI</option>
                <option value="XII">Kelas XII</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-xl border border-stone-300 text-stone-600 text-xs font-semibold hover:bg-stone-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-[#70263d] hover:bg-[#591b2e] text-white text-xs font-bold transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Siswa'}
            </button>
          </div>
        </form>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-[#eaded8] p-3.5 shadow-xs space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-stone-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari siswa berdasarkan nama, kode, atau sekolah..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm outline-hidden focus:border-[#70263d] focus:ring-2 focus:ring-[#70263d]/20 bg-stone-50/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Grade Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] text-stone-400 mr-1 shrink-0">Filter Kelas:</span>
          {['ALL', 'X', 'XI', 'XII'].map((gr) => (
            <button
              key={gr}
              onClick={() => setSelectedGrade(gr)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                selectedGrade === gr
                  ? 'bg-[#70263d] text-white shadow-2xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
              }`}
            >
              {gr === 'ALL' ? 'Semua Kelas' : `Kelas ${gr}`}
            </button>
          ))}
        </div>
      </div>

      {/* Student List Count info */}
      <div className="flex items-center justify-between text-xs text-stone-500 px-1">
        <span>
          Menampilkan <b>{filteredStudents.length}</b> dari {students.length} siswa
        </span>
      </div>

      {/* Student Cards List */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#eaded8] p-8 text-center text-stone-500 space-y-2">
          <Users className="w-8 h-8 text-stone-300 mx-auto" />
          <p className="text-xs">
            {searchQuery || selectedGrade !== 'ALL'
              ? 'Tidak ada siswa yang cocok dengan filter pencarian.'
              : 'Belum ada data siswa terdaftar. Klik "Tambah Siswa" untuk memulai.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredStudents.map((student) => (
            <div
              key={student.id || student.student_code}
              className="bg-white rounded-xl border border-[#eaded8] p-3.5 shadow-xs hover:border-[#70263d]/30 transition-all flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs sm:text-sm text-stone-900 truncate">
                    {student.name}
                  </span>
                  <span className="font-mono text-[10px] font-semibold text-[#70263d] bg-[#f3e6e0] px-1.5 py-0.2 rounded">
                    {student.student_code}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-1">
                  <span className="flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-stone-400" />
                    Kelas {student.grade || 'X'}
                  </span>
                  {student.school && (
                    <>
                      <span>·</span>
                      <span className="truncate">{student.school}</span>
                    </>
                  )}
                </div>
              </div>

              <button
                onClick={() => onStartAssessmentForStudent(student)}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-[#70263d] hover:text-white text-stone-700 text-xs font-semibold transition-all active:scale-95"
                title="Mulai Asesmen untuk Siswa Ini"
              >
                <PlayCircle className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Asesmen</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
