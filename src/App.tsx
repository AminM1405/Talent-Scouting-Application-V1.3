/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { MobileHeader } from './components/MobileHeader';
import { BottomNavBar, NavigationTab } from './components/BottomNavBar';
import { DashboardView } from './components/DashboardView';
import { AssessmentView } from './components/AssessmentView';
import { StudentListView } from './components/StudentListView';
import { ReportListView } from './components/ReportListView';
import { GuideView } from './components/GuideView';
import { ReportDetailModal } from './components/ReportDetailModal';
import { ReportPrintView } from './components/ReportPrintView';
import { SuccessSaveModal } from './components/SuccessSaveModal';
import { ToastNotification, ToastMessage } from './components/ToastNotification';
import { BackupReminderBanner } from './components/BackupReminderBanner';
import {
  StudentRecord,
  AssessmentRecord,
  subscribeStudentsRealtime,
  subscribeAssessmentsRealtime,
  saveStudentRecord,
  saveAssessmentRecord,
  testFirestoreConnection
} from './lib/firebase';
import { getBackupStatus } from './lib/exportCsv';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [assessments, setAssessments] = useState<AssessmentRecord[]>([]);

  // Print Mode State (renders full official document for printing/PDF)
  const [printAssessment, setPrintAssessment] = useState<AssessmentRecord | null>(null);

  // Detail Modal State
  const [selectedReport, setSelectedReport] = useState<AssessmentRecord | null>(null);

  // Success Modal State
  const [savedAssessmentModal, setSavedAssessmentModal] = useState<AssessmentRecord | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // Pre-fill student for assessment
  const [prefilledStudent, setPrefilledStudent] = useState<StudentRecord | null>(null);

  // Toast Notification System
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info', title?: string) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newToast: ToastMessage = { id, message, type, title };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Subscribe to real-time updates from Firebase
  useEffect(() => {
    testFirestoreConnection();

    const unsubStudents = subscribeStudentsRealtime((items) => {
      setStudents(items);
    });

    const unsubAssessments = subscribeAssessmentsRealtime((items) => {
      setAssessments(items);
    });

    return () => {
      unsubStudents();
      unsubAssessments();
    };
  }, []);

  // Seed sample data if database is initially empty
  useEffect(() => {
    const hasInitialized = localStorage.getItem('itdf_sample_seeded');
    if (!hasInitialized && students.length === 0 && assessments.length === 0) {
      localStorage.setItem('itdf_sample_seeded', 'true');
      const seedInitialData = async () => {
        try {
          const sample1: AssessmentRecord = {
            student_code: 'ITDF-001',
            student_name: 'Muhammad Rian Pratama',
            school: 'SMAN 3 Bandung',
            grade: 'XI',
            aspiration: 'Teknologi Informasi & Rekayasa Perangkat Lunak',
            scores: {
              interest: 4.5,
              reasoning: 4.33,
              practical: 4.67,
              creative: 3.83,
              social: 3.5,
              leadership: 3.67,
              self: 4.17,
              aspiration: 4.5
            },
            answers: {},
            top_domain: 'Teknis & Praktis',
            top_score: 4.67,
            summary: 'Potensi kuat pada aplikasi praktis dan penalaran sistem.',
            created_at: new Date(Date.now() - 86400000 * 2).toISOString()
          };

          const sample2: AssessmentRecord = {
            student_code: 'ITDF-002',
            student_name: 'Nabila Sarah Azzahra',
            school: 'SMAN 1 Jakarta',
            grade: 'XII',
            aspiration: 'Desain Komunikasi Visual & Animasi',
            scores: {
              interest: 4.67,
              reasoning: 3.67,
              practical: 3.83,
              creative: 4.83,
              social: 4.17,
              leadership: 3.5,
              self: 3.83,
              aspiration: 4.67
            },
            answers: {},
            top_domain: 'Kreativitas & Ekspresi',
            top_score: 4.83,
            summary: 'Sangat menonjol dalam pengembangan ide orisinal dan media visual.',
            created_at: new Date(Date.now() - 86400000).toISOString()
          };

          await saveAssessmentRecord(sample1);
          await saveAssessmentRecord(sample2);
        } catch (e) {
          console.warn('Seed initial sample data note:', e);
        }
      };
      seedInitialData();
    }
  }, [students.length, assessments.length]);

  // Backup Check Refresh State
  const [backupRefreshKey, setBackupRefreshKey] = useState(0);
  const backupStatus = getBackupStatus(assessments.length);

  // Handle Save Assessment
  const handleSaveAssessment = async (assessment: AssessmentRecord) => {
    const saved = await saveAssessmentRecord(assessment);
    setSavedAssessmentModal(saved);
    setIsSuccessModalOpen(true);
    addToast(
      `Hasil asesmen untuk ${assessment.student_name} tersimpan di Firebase Firestore.`,
      'success',
      'Data Tersimpan'
    );

    // Notifikasi jika jumlah data mencapai kelipatan 5
    const totalNow = assessments.length + 1;
    if (totalNow >= 5 && totalNow % 5 === 0) {
      setTimeout(() => {
        addToast(
          `Arsip kini memiliki ${totalNow} data tersimpan. Sangat disarankan mengunduh berkas cadangan (CSV) secara berkala di menu Hasil.`,
          'info',
          'Pengingat Cadangan'
        );
      }, 1200);
    }
  };

  // Handle Add Student
  const handleAddStudent = async (student: StudentRecord) => {
    await saveStudentRecord(student);
    addToast(
      `Siswa ${student.name} (${student.student_code}) berhasil ditambahkan.`,
      'success',
      'Siswa Terdaftar'
    );
  };

  // Handle Start Assessment for existing student
  const handleStartAssessmentForStudent = (student: StudentRecord) => {
    setPrefilledStudent(student);
    setActiveTab('assessment');
    addToast(
      `Data siswa ${student.name} siap untuk asesmen.`,
      'info',
      'Asesmen Siswa'
    );
  };

  // Handle Print PDF
  const handleOpenPrintView = (assessment: AssessmentRecord) => {
    setPrintAssessment(assessment);
  };

  const handleClosePrintView = () => {
    setPrintAssessment(null);
  };

  // If in print view, render the official full printable document
  if (printAssessment) {
    return (
      <ReportPrintView
        assessment={printAssessment}
        onBack={handleClosePrintView}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#fbf8f4] text-[#261c1f] flex flex-col antialiased selection:bg-[#70263d] selection:text-white">
      {/* Toast Notifications */}
      <ToastNotification toasts={toasts} onDismiss={removeToast} />

      {/* Mobile Top Header */}
      <MobileHeader
        activeTab={activeTab}
        studentCount={students.length}
        assessmentCount={assessments.length}
        onNewAssessment={() => {
          setPrefilledStudent(null);
          setActiveTab('assessment');
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-4 sm:py-6 space-y-4">
        {/* Proactive CSV Backup Reminder Banner if large number of assessments stored */}
        {backupStatus.isRecommended && (
          <BackupReminderBanner
            assessments={assessments}
            backupStatus={backupStatus}
            onBackupCompleted={(count, filename) => {
              setBackupRefreshKey((k) => k + 1);
              addToast(
                `Salinan cadangan ${count} data berhasil diunduh (${filename}).`,
                'success',
                'Cadangan Tersimpan'
              );
            }}
            onDismiss={() => {
              setBackupRefreshKey((k) => k + 1);
              addToast(
                'Pengingat cadangan ditunda selama 24 jam.',
                'info',
                'Pengingat Ditunda'
              );
            }}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardView
            students={students}
            assessments={assessments}
            onStartAssessment={() => {
              setPrefilledStudent(null);
              setActiveTab('assessment');
            }}
            onViewReports={() => setActiveTab('reports')}
            onViewStudents={() => setActiveTab('students')}
            onSelectAssessment={(a) => setSelectedReport(a)}
          />
        )}

        {activeTab === 'assessment' && (
          <AssessmentView
            existingStudents={students}
            initialStudent={prefilledStudent}
            onSaveAssessment={handleSaveAssessment}
            onPrintReport={handleOpenPrintView}
            showToast={addToast}
          />
        )}

        {activeTab === 'students' && (
          <StudentListView
            students={students}
            onAddStudent={handleAddStudent}
            onStartAssessmentForStudent={handleStartAssessmentForStudent}
            showToast={addToast}
          />
        )}

        {activeTab === 'reports' && (
          <ReportListView
            assessments={assessments}
            onSelectAssessment={(a) => setSelectedReport(a)}
            onPrintAssessment={handleOpenPrintView}
            showToast={addToast}
            onBackupCompleted={() => setBackupRefreshKey((k) => k + 1)}
          />
        )}

        {activeTab === 'guide' && <GuideView />}
      </main>

      {/* Detail Modal */}
      <ReportDetailModal
        assessment={selectedReport}
        isOpen={selectedReport !== null}
        onClose={() => setSelectedReport(null)}
        onPrint={handleOpenPrintView}
      />

      {/* Success Save Modal */}
      <SuccessSaveModal
        assessment={savedAssessmentModal}
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        onPrintPdf={() => {
          setIsSuccessModalOpen(false);
          if (savedAssessmentModal) {
            handleOpenPrintView(savedAssessmentModal);
          }
        }}
        onViewReports={() => {
          setIsSuccessModalOpen(false);
          setActiveTab('reports');
        }}
        onNewAssessment={() => {
          setIsSuccessModalOpen(false);
          setPrefilledStudent(null);
          setActiveTab('assessment');
        }}
      />

      {/* Bottom Navigation Bar */}
      <BottomNavBar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        studentCount={students.length}
        assessmentCount={assessments.length}
      />
    </div>
  );
}
