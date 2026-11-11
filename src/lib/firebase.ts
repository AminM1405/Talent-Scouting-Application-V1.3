import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  onSnapshot,
  getDocFromServer,
  query,
  orderBy,
  limit
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Inisialisasi Firebase App
const app = initializeApp(firebaseConfig);

// CRITICAL: Sesuai panduan, firestoreDatabaseId harus dilewatkan ke getFirestore
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Uji koneksi awal ke Firestore
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client berada dalam mode offline / cache.');
    }
    return true; // Firebase offline cache is active
  }
}

export interface StudentRecord {
  id?: string;
  student_code: string;
  name: string;
  school: string;
  grade: 'X' | 'XI' | 'XII' | string;
  created_at: string;
}

export interface AssessmentRecord {
  id?: string;
  student_code: string;
  student_name: string;
  school: string;
  grade: string;
  aspiration: string;
  scores: Record<string, number>;
  answers: Record<string, number>;
  top_domain: string;
  top_score: number;
  summary: string;
  created_at: string;
}

const LOCAL_STUDENTS_KEY = 'itdf_students_cache';
const LOCAL_ASSESSMENTS_KEY = 'itdf_assessments_cache';

export function getLocalStudents(): StudentRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_STUDENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function setLocalStudents(students: StudentRecord[]) {
  try {
    localStorage.setItem(LOCAL_STUDENTS_KEY, JSON.stringify(students));
  } catch {}
}

export function getLocalAssessments(): AssessmentRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_ASSESSMENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function setLocalAssessments(assessments: AssessmentRecord[]) {
  try {
    localStorage.setItem(LOCAL_ASSESSMENTS_KEY, JSON.stringify(assessments));
  } catch {}
}

/**
 * Sinkronisasi real-time daftar siswa dari Firestore dengan cadangan LocalStorage
 */
export function subscribeStudentsRealtime(
  onData: (data: StudentRecord[]) => void,
  onError?: (err: Error) => void
) {
  const localInitial = getLocalStudents();
  if (localInitial.length > 0) {
    onData(localInitial);
  }

  const collPath = 'students';
  try {
    const q = query(collection(db, collPath), limit(300));
    return onSnapshot(
      q,
      (snapshot) => {
        const items: StudentRecord[] = [];
        snapshot.forEach((d) => {
          items.push({ id: d.id, ...(d.data() as Omit<StudentRecord, 'id'>) });
        });
        // Sort descending by created_at
        items.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
        setLocalStudents(items);
        onData(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, collPath);
        onError?.(error);
      }
    );
  } catch (err) {
    console.warn('Real-time listener students error, menggunakan fallback lokal:', err);
    return () => {};
  }
}

/**
 * Sinkronisasi real-time daftar asesmen dari Firestore dengan cadangan LocalStorage
 */
export function subscribeAssessmentsRealtime(
  onData: (data: AssessmentRecord[]) => void,
  onError?: (err: Error) => void
) {
  const localInitial = getLocalAssessments();
  if (localInitial.length > 0) {
    onData(localInitial);
  }

  const collPath = 'assessments';
  try {
    const q = query(collection(db, collPath), limit(500));
    return onSnapshot(
      q,
      (snapshot) => {
        const items: AssessmentRecord[] = [];
        snapshot.forEach((d) => {
          items.push({ id: d.id, ...(d.data() as Omit<AssessmentRecord, 'id'>) });
        });
        items.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
        setLocalAssessments(items);
        onData(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, collPath);
        onError?.(error);
      }
    );
  } catch (err) {
    console.warn('Real-time listener assessments error, menggunakan fallback lokal:', err);
    return () => {};
  }
}

/**
 * Simpan data siswa baru ke Firestore & LocalStorage
 */
export async function saveStudentRecord(student: StudentRecord): Promise<StudentRecord> {
  const id = student.id || `std_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const record: StudentRecord = { ...student, id };

  // Simpan ke local lebih dulu untuk responsifitas instan
  const localList = getLocalStudents();
  if (!localList.some((s) => s.student_code.toLowerCase() === record.student_code.toLowerCase())) {
    localList.unshift(record);
    setLocalStudents(localList);
  }

  // Kirim ke Firestore
  const collPath = `students/${id}`;
  try {
    await setDoc(doc(db, 'students', id), {
      student_code: record.student_code,
      name: record.name,
      school: record.school || '',
      grade: record.grade || 'X',
      created_at: record.created_at || new Date().toISOString()
    });
  } catch (error) {
    console.error('Gagal menulis ke Firestore, tersimpan di cache lokal:', error);
    // Tidak melempar error fatal jika local berhasil disimpan
  }

  return record;
}

/**
 * Simpan hasil asesmen baru ke Firestore & LocalStorage
 */
export async function saveAssessmentRecord(assessment: AssessmentRecord): Promise<AssessmentRecord> {
  const id = assessment.id || `asm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const record: AssessmentRecord = { ...assessment, id };

  // Simpan lokal
  const localList = getLocalAssessments();
  localList.unshift(record);
  setLocalAssessments(localList);

  // Pastikan data siswa juga tercatat
  saveStudentRecord({
    student_code: record.student_code,
    name: record.student_name,
    school: record.school,
    grade: record.grade,
    created_at: record.created_at
  }).catch(() => {});

  // Kirim ke Firestore
  const collPath = `assessments/${id}`;
  try {
    await setDoc(doc(db, 'assessments', id), {
      student_code: record.student_code,
      student_name: record.student_name,
      school: record.school || '',
      grade: record.grade || 'X',
      aspiration: record.aspiration || '',
      scores: record.scores || {},
      answers: record.answers || {},
      top_domain: record.top_domain || '',
      top_score: record.top_score || 0,
      summary: record.summary || 'Profil eksplorasi bakat & minat ITDF.',
      created_at: record.created_at || new Date().toISOString()
    });
  } catch (error) {
    console.error('Gagal menulis hasil asesmen ke Firestore, tersimpan di cache lokal:', error);
  }

  return record;
}
