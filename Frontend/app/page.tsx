'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Eye,
  Volume2,
  Camera,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Bookmark,
  Check,
  RotateCcw,
  UserCheck,
  Award,
} from 'lucide-react';
import { Header } from './components/Header';
import { Mascot } from './components/Mascot';
import { LearningStepsIndicator } from './components/LearningStepsIndicator';
import { SymbolResponseBar } from './components/SymbolResponseBar';
import { ScanModal } from './components/ScanModal';
import { SourceModal } from './components/SourceModal';
import { AITutorModal } from './components/AITutorModal';
import { RestReminderModal } from './components/RestReminderModal';
import { HelpModal } from './components/HelpModal';
import { ReadModeView } from './components/ReadModeView';
import { VisualModeView } from './components/VisualModeView';
import { SoundModeView } from './components/SoundModeView';
import { HistoryView } from './components/HistoryView';
import { SettingsView } from './components/SettingsView';
import { TeacherModeView } from './components/TeacherModeView';
import { QuizModal } from './components/QuizModal';
import { LoginModal } from './components/LoginModal';
import { CreateMaterialModal } from './components/CreateMaterialModal';

import {
  ScanResult,
  LearningMode,
  AccessibilitySettings,
  SymbolResponseType,
  StepProgress,
  UserRole,
} from '@/types';
import { sampleLessons } from '@/lib/seed-data';
import { getHistory, saveToHistory, deleteFromHistory } from '@/lib/history';
import { useAuth } from '@/lib/auth';
import {
  listMaterials,
  saveMaterial,
  deleteMaterial,
  saveVerification,
  saveQuizResult,
  shareMaterialToStudents,
} from '@/lib/materials';

export default function App() {
  // Akun Supabase (bila sudah login)
  const { profile, signOut } = useAuth();

  // Navigation & Page State
  const [activeTab, setActiveTab] = useState<'home' | 'learn' | 'history' | 'settings'>('home');
  const [activeMode, setActiveMode] = useState<LearningMode>('read');
  const [currentStep, setCurrentStep] = useState<StepProgress>('read');
  const [userRole, setUserRole] = useState<UserRole>('siswa');

  // Active Lesson
  const [currentLesson, setCurrentLesson] = useState<ScanResult>(sampleLessons[0]);
  const [history, setHistory] = useState<ScanResult[]>([]);

  // Modals
  const [isScanOpen, setIsScanOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isRestOpen, setIsRestOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isCreateMaterialOpen, setIsCreateMaterialOpen] = useState(false);

  // Source Modal (Explainable AI)
  const [sourceModalData, setSourceModalData] = useState<{
    isOpen: boolean;
    pointText: string;
    sourceQuote: string;
    isValid?: boolean;
  }>({
    isOpen: false,
    pointText: '',
    sourceQuote: '',
    isValid: true,
  });

  // AI Tutor Modal (Tanya Penjelasan Lain)
  const [tutorModalData, setTutorModalData] = useState<{
    isOpen: boolean;
    pointText: string;
  }>({
    isOpen: false,
    pointText: '',
  });

  // Accessibility Settings
  const [settings, setSettings] = useState<AccessibilitySettings>({
    mode: 'read',
    fontSize: 'normal',
    fontPreference: 'lexend',
    lineSpacing: 'normal',
    calmMode: false,
    highContrast: false,
    soundEnabled: true,
  });

  // Mascot dynamic messages
  const [mascotMessage, setMascotMessage] = useState(
    'Halo teman! Mau belajar apa hari ini?'
  );

  // Muat materi: localStorage (mode lokal) atau Supabase (mode supabase).
  useEffect(() => {
    let active = true;

    listMaterials().then((list) => {
      if (!active) return;
      setHistory(list);
      if (list.length > 0) {
        setCurrentLesson((prev) => list.find((item) => item.id === prev.id) ?? list[0]);
      }
    });

    return () => {
      active = false;
    };
  }, [profile?.id]);

  // Ikuti peran akun Supabase: guru → Mode Guru, siswa → Mode Siswa.
  // Tamu (belum login) tetap memakai mode demo seperti sebelumnya.
  useEffect(() => {
    setUserRole(profile ? profile.role : 'siswa');
  }, [profile]);

  // Update mascot messages on tab/role change
  useEffect(() => {
    if (userRole === 'guru') {
      setMascotMessage('Mode Guru aktif! Bapak/Ibu dapat memverifikasi & menyesuaikan poin materi untuk murid.');
      return;
    }

    switch (activeTab) {
      case 'home':
        setMascotMessage('Pilih cara belajar yang paling nyaman untukmu, ya!');
        break;
      case 'learn':
        setMascotMessage(
          activeMode === 'read'
            ? 'Mode Baca aktif! Poin-poin pendek ramah disleksia.'
            : activeMode === 'visual'
              ? 'Mode Visual aktif! Pelajari urutan gambar dan isyarat.'
              : 'Mode Suara aktif! Dengarkan pembacaan dengan santai.'
        );
        break;
      case 'history':
        setMascotMessage('Di sini tersimpan semua materi yang pernah kamu pelajari.');
        break;
      case 'settings':
        setMascotMessage('Atur ukuran teks dan kenyamanan sesukamu.');
        break;
    }
  }, [activeTab, activeMode, userRole]);

  // Text-To-Speech function
  const speakText = (text: string) => {
    if (!settings.soundEnabled || typeof window === 'undefined') return;
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID';
    utterance.rate = 0.88;
    window.speechSynthesis.speak(utterance);
  };

  const updateSettings = (newSettings: Partial<AccessibilitySettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const handleToggleRole = () => {
    const nextRole = userRole === 'siswa' ? 'guru' : 'siswa';
    setUserRole(nextRole);
    if (nextRole === 'guru') {
      speakText('Beralih ke Mode Verifikasi Guru dan Pendamping.');
    } else {
      speakText('Beralih ke Mode Siswa.');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setUserRole('siswa');
    setActiveTab('home');
    setMascotMessage('Kamu sudah keluar. Materi di perangkat ini tetap tersimpan.');
    speakText('Kamu sudah keluar dari akun.');
  };

  // Mulai belajar dengan mode terpilih dari Beranda
  const handleStartLearning = (mode: LearningMode) => {
    setActiveMode(mode);
    setCurrentStep('read');
    setActiveTab('learn');
    speakText(`Mulai belajar ${currentLesson.title} dalam Mode ${mode === 'read' ? 'Baca' : mode === 'visual' ? 'Visual' : 'Suara'}`);
  };

  // Saat selesai scan buku baru
  const handleScanSuccess = (newLesson: ScanResult) => {
    setCurrentLesson(newLesson);
    setCurrentStep('read');
    setActiveTab('learn');
    setMascotMessage(`Buku "${newLesson.title}" berhasil dipindai!`);
    speakText(`Buku ${newLesson.title} berhasil dipindai dan siap dipelajari.`);

    void saveMaterial(newLesson).then(({ items, saved }) => {
      setCurrentLesson(saved);
      setHistory(items);
    });
  };

  // Buka materi dari riwayat
  const handleSelectHistoryLesson = (lesson: ScanResult) => {
    setCurrentLesson(lesson);
    setCurrentStep('read');
    setActiveTab('learn');
    speakText(`Membuka materi ${lesson.title}`);
  };

  // Hapus materi dari riwayat
  const handleDeleteHistoryLesson = (id: string) => {
    void deleteMaterial(id).then((items) => setHistory(items));
  };

  // Simpan kemajuan materi (selesai belajar / update bintang)
  const handleUpdateLesson = (updated: ScanResult) => {
    setCurrentLesson(updated);
    void saveMaterial(updated).then(({ items, saved }) => {
      setCurrentLesson(saved);
      setHistory(items);
    });
  };

  // Simpan verifikasi guru (status, catatan, dan poin yang disunting)
  const handleVerifyLesson = (updated: ScanResult) => {
    setCurrentLesson(updated);
    void saveVerification(updated).then(({ items, saved }) => {
      setCurrentLesson(saved);
      setHistory(items);
    });
  };

  // Simpan materi buatan guru, lalu bagikan ke semua siswa binaan bila diminta.
  const handleCreateMaterial = (lesson: ScanResult, share: boolean) => {
    setIsCreateMaterialOpen(false);
    setMascotMessage('Menyimpan materi buatan guru...');

    void (async () => {
      const { items, saved } = await saveMaterial(lesson);
      setHistory(items);
      setCurrentLesson(saved);
      setActiveTab('history');

      if (!share) {
        setMascotMessage('Materi tersimpan. Klik "Buat Materi Sendiri" lagi untuk berbagi.');
        speakText('Materi berhasil disimpan.');
        return;
      }

      const result = await shareMaterialToStudents(saved);
      setHistory(result.items);

      if (result.error) {
        setMascotMessage(
          'Materi tersimpan, tetapi gagal dibagikan. Pastikan SQL fitur materi guru sudah dijalankan di Supabase.'
        );
        speakText('Materi tersimpan, tetapi gagal dibagikan ke siswa.');
        return;
      }

      if (result.sharedCount === 0) {
        setMascotMessage(
          'Materi tersimpan, tetapi belum ada siswa yang terhubung dengan akun guru ini.'
        );
        speakText('Materi tersimpan, tetapi belum ada siswa yang terhubung.');
        return;
      }

      setMascotMessage(`Materi dibagikan ke ${result.sharedCount} siswa.`);
      speakText(`Materi berhasil dibagikan ke ${result.sharedCount} siswa.`);
    })();
  };

  // Buka modal bukti sumber (Explainable AI)
  const handleOpenSourceModal = (pointText: string, quote: string, isValid = true) => {
    setCurrentStep('source');
    setSourceModalData({
      isOpen: true,
      pointText,
      sourceQuote: quote,
      isValid,
    });
    setMascotMessage('Di sini kamu bisa melihat kalimat asli dari buku cetak!');
  };

  // Buka modal AI Tutor (Tanya Penjelasan Lain)
  const handleOpenTutorModal = (pointText: string) => {
    setTutorModalData({
      isOpen: true,
      pointText,
    });
    setMascotMessage('Mau penjelasan yang lebih mudah atau contoh lain? Tanya Milo!');
  };

  // Respon dari Kartu Simbol Cepat
  const handleSymbolSelect = (symbol: SymbolResponseType) => {
    switch (symbol) {
      case 'confused':
      case 'easier':
        if (currentLesson?.points?.[0]) {
          handleOpenTutorModal(currentLesson.points[0].text);
        }
        break;
      case 'example':
        if (currentLesson?.points?.[0]) {
          handleOpenTutorModal(currentLesson.points[0].text);
        }
        break;
      case 'repeat':
        if (currentLesson?.points?.[0]) {
          speakText(currentLesson.points[0].text);
        }
        break;
      case 'rest':
        setIsRestOpen(true);
        break;
    }
  };

  // Saat siswa menyelesaikan materi
  const handleCompleteLesson = () => {
    setCurrentStep('star');
    setMascotMessage('Hebat sekali! Kamu berhasil menyelesaikan materi ini! Yuk coba Kuis Ceria!');
    const alreadyCompleted = currentLesson.lesson_completed === true;
    const updatedLesson = {
      ...currentLesson,
      lesson_completed: true,
      stars_earned: (currentLesson.stars_earned || 0) + (alreadyCompleted ? 0 : 1),
    };
    handleUpdateLesson(updatedLesson);
  };

  // Saat kuis selesai
  const handleCompleteQuiz = (score: number, total: number) => {
    const previousBest = currentLesson.quiz_best_score ?? currentLesson.quiz_score ?? 0;
    const wasCompleted = currentLesson.quiz_completed === true;
    // Bintang hanya bertambah saat skor terbaik meningkat, bukan setiap percobaan.
    const earnedStars = wasCompleted ? Math.max(0, score - previousBest) : score;
    const updatedLesson = {
      ...currentLesson,
      quiz_score: score,
      quiz_total: total,
      quiz_best_score: Math.max(previousBest, score),
      quiz_attempts: (currentLesson.quiz_attempts || 0) + 1,
      quiz_completed: true,
      stars_earned: (currentLesson.stars_earned || 0) + earnedStars,
    };
    setCurrentLesson(updatedLesson);
    void saveQuizResult(updatedLesson, score, total).then(({ items, saved }) => {
      setCurrentLesson(saved);
      setHistory(items);
    });
  };

  const modeDetails: Record<
    LearningMode,
    { label: string; desc: string; icon: React.ReactNode; color: string; badge: string }
  > = {
    read: {
      label: 'Mode Baca',
      desc: 'Poin pendek, jelas, analogi dunia nyata, dan font ramah disleksia.',
      icon: <BookOpen className="h-9 w-9 stroke-[2.5]" />,
      color: 'bg-sky',
      badge: 'Disleksia & ADHD',
    },
    visual: {
      label: 'Mode Visual',
      desc: 'Langkah visual berurutan dan deskripsi gerakan isyarat teks.',
      icon: <Eye className="h-9 w-9 stroke-[2.5]" />,
      color: 'bg-mint',
      badge: 'Tunarungu & Autisme',
    },
    sound: {
      label: 'Mode Suara',
      desc: 'Materi dibacakan otomatis dengan kontrol besar dan navigasi ramah.',
      icon: <Volume2 className="h-9 w-9 stroke-[2.5]" />,
      color: 'bg-peach',
      badge: 'Tunanetra & Low Vision',
    },
  };

  return (
    <div
      className={`app-shell font-${settings.fontSize} ${
        settings.fontPreference === 'dyslexic' ? 'font-dyslexic' : 'font-sans'
      } ${settings.lineSpacing === 'wide' ? 'spacing-wide' : ''} ${
        settings.calmMode ? 'calm-mode' : ''
      } ${settings.highContrast ? 'high-contrast' : ''}`}
    >
      <a href="#main-content" className="skip-link">
        Lewati ke konten utama
      </a>

      {/* Navigasi Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenScan={() => setIsScanOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        userRole={userRole}
        onToggleRole={handleToggleRole}
        authUser={profile ? { name: profile.name, role: profile.role } : null}
        onOpenLogin={() => setIsLoginOpen(true)}
        onSignOut={handleSignOut}
        canToggleRole={!profile || profile.role === 'guru'}
      />

      {/* Konten Halaman */}
      <main id="main-content" tabIndex={-1} className="focus:outline-none">
        {/* ===================== TAB 1: BERANDA ===================== */}
        {activeTab === 'home' && (
          <div className="mx-auto w-full max-w-6xl px-4 pb-44 pt-6 sm:px-6 md:pt-10">
            {/* Banner Mode Guru (Jika sedang aktif) */}
            {userRole === 'guru' && (
              <div className="mb-6 rounded-2xl border-2 border-[#1F5F85] bg-[#DCE8FD] p-4 flex flex-wrap items-center justify-between gap-3 shadow-[2px_2px_0_#17304F]">
                <div className="flex items-center gap-2.5">
                  <UserCheck className="h-5 w-5 text-[#1F5F85]" />
                  <span className="text-sm font-extrabold text-[#1F5F85]">
                    Anda sedang berada di Mode Guru / Pendamping.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('learn')}
                  className="rounded-xl border-2 border-ink bg-white px-3 py-1.5 text-xs font-bold text-ink shadow-[1px_1px_0_#17304F]"
                >
                  Buka Panel Verifikasi Materi ➔
                </button>
              </div>
            )}

            {/* Hero Section */}
            <section className="max-w-3xl">
              <div className="status-badge mb-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-ink shadow-[2px_2px_0_#17304F]">
                <span className="h-2.5 w-2.5 rounded-full bg-forest" />
                Siap belajar hari ini
              </div>
              <h1 className="text-[clamp(2.4rem,5.5vw,4.5rem)] font-extrabold leading-[1.08] tracking-[-0.035em] text-ink">
                Halo, teman!
                <span className="mt-2 block text-[#1F5F85]">
                  Mau belajar dengan cara apa?
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slateText md:text-xl">
                Satu halaman buku pelajaran umum diubah menjadi materi ramah untukmu.
                Pilih cara yang paling kamu sukai.
              </p>

              {/* Quick Actions */}
              <div className="mt-8 flex flex-wrap gap-4">
                <button
                  className="primary-button text-base sm:text-lg px-6 py-4 flex items-center gap-3"
                  onClick={() => setIsScanOpen(true)}
                >
                  <Camera className="h-6 w-6" /> Pindai Buku Pelajaran
                </button>

                <button
                  className="secondary-button text-base sm:text-lg px-6 py-4 flex items-center gap-2"
                  onClick={() => setActiveTab('history')}
                >
                  <Bookmark className="h-5 w-5 text-forest" /> Materi Saya
                </button>

                <button
                  className="secondary-button text-base sm:text-lg px-6 py-4 flex items-center gap-2 bg-[#FFF9E6]"
                  onClick={() => setIsQuizOpen(true)}
                >
                  <Award className="h-5 w-5 text-[#F2A33A]" /> Kuis Ceria Singkat
                </button>
              </div>
            </section>

            {/* Pilihan 3 Mode Belajar */}
            <section className="mt-12" aria-label="Pilih Mode Belajar Utama">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-extrabold text-ink md:text-2xl">
                  Pilih Mode Belajarmu
                </h2>
                <span className="text-xs font-bold text-slateText">
                  Buku Aktif: &ldquo;{currentLesson.title}&rdquo;
                </span>
              </div>

              <div className="grid gap-5 sm:grid-cols-1 md:grid-cols-3">
                {(Object.keys(modeDetails) as LearningMode[]).map((modeKey) => {
                  const item = modeDetails[modeKey];
                  return (
                    <button
                      key={modeKey}
                      className={`mode-card ${item.color} focus-ring group`}
                      onClick={() => handleStartLearning(modeKey)}
                      aria-label={`Mulai belajar dengan ${item.label}: ${item.desc}`}
                    >
                      <div className="flex w-full items-center justify-between">
                        <span className="mode-icon shadow-[2px_2px_0_#17304F]">
                          {item.icon}
                        </span>
                        <span className="rounded-full border border-ink bg-white px-2.5 py-1 text-[11px] font-bold text-ink">
                          {item.badge}
                        </span>
                      </div>

                      <h3 className="mt-6 text-2xl font-extrabold text-ink md:text-3xl">
                        {item.label}
                      </h3>
                      <p className="mt-2 text-sm font-medium leading-relaxed text-slateText">
                        {item.desc}
                      </p>

                      <div className="mt-6 flex items-center gap-2 font-bold text-ink group-hover:translate-x-1 transition-transform">
                        <span>Mulai Belajar</span>
                        <ArrowRight className="h-5 w-5 stroke-[2.5]" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Fitur Unggulan */}
            <section className="mt-14 rounded-3xl border-3 border-ink bg-white p-6 md:p-8 shadow-[4px_4px_0_#17304F]">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-mint text-forest border border-ink">
                    <ShieldCheck className="h-6 w-6" />
                  </span>
                  <div>
                    <h4 className="font-extrabold text-ink">Explainable AI & Verifikasi Guru</h4>
                    <p className="mt-1 text-xs text-slateText leading-relaxed">
                      Setiap penjelasan terhubung ke teks buku asli dan dapat diverifikasi langsung oleh guru pendamping.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-sky text-ink border border-ink">
                    <Sparkles className="h-6 w-6" />
                  </span>
                  <div>
                    <h4 className="font-extrabold text-ink">Smart & Fun (Kuis Ceria)</h4>
                    <p className="mt-1 text-xs text-slateText leading-relaxed">
                      Kuis tanpa tekanan, apresiasi bintang emas, dan maskot Milo yang ramah menyemangati.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-peach text-ink border border-ink">
                    <BookOpen className="h-6 w-6" />
                  </span>
                  <div>
                    <h4 className="font-extrabold text-ink">Ramah Disabilitas</h4>
                    <p className="mt-1 text-xs text-slateText leading-relaxed">
                      Dukungan font disleksia, mode tenang, kontras tinggi, kartu simbol, dan text-to-speech.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ===================== TAB 2: SESI BELAJAR (LEARN) ===================== */}
        {activeTab === 'learn' && (
          <div className="mx-auto w-full max-w-4xl px-4 pb-44 pt-4 sm:px-6 md:pt-6">
            {/* Tampilan Khusus Jika Mode Guru Aktif */}
            {userRole === 'guru' ? (
              <TeacherModeView
                key={currentLesson.id}
                lesson={currentLesson}
                onUpdateLesson={handleVerifyLesson}
                speakText={speakText}
                calmMode={settings.calmMode}
              />
            ) : (
              <>
                {/* Top Bar: Pemilih Mode Belajar & Tombol Kuis & Pindai Buku */}
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex rounded-2xl border-2 border-ink bg-[#FAF6F0] p-1 shadow-[2px_2px_0_#17304F]">
                    {(['read', 'visual', 'sound'] as LearningMode[]).map((mKey) => (
                      <button
                        key={mKey}
                        className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all focus-ring ${
                          activeMode === mKey
                            ? 'border-2 border-ink bg-white text-ink shadow-[1px_1px_0_#17304F]'
                            : 'text-slateText hover:text-ink'
                        }`}
                        onClick={() => {
                          setActiveMode(mKey);
                          speakText(`Beralih ke Mode ${mKey === 'read' ? 'Baca' : mKey === 'visual' ? 'Visual' : 'Suara'}`);
                        }}
                        aria-label={`Beralih ke ${modeDetails[mKey].label}`}
                      >
                        {mKey === 'read' && <BookOpen className="h-4 w-4" />}
                        {mKey === 'visual' && <Eye className="h-4 w-4" />}
                        {mKey === 'sound' && <Volume2 className="h-4 w-4" />}
                        <span>{modeDetails[mKey].label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      className="secondary-button text-xs font-bold py-2 px-3 flex items-center gap-1.5 bg-[#FFF9E6]"
                      onClick={() => setIsQuizOpen(true)}
                    >
                      <Award className="h-4 w-4 text-[#F2A33A]" />
                      Kuis Ceria
                    </button>

                    <button
                      className="secondary-button text-xs font-bold py-2 px-3.5 flex items-center gap-1.5"
                      onClick={() => setIsScanOpen(true)}
                    >
                      <Camera className="h-4 w-4 text-forest" />
                      Ganti Buku
                    </button>
                  </div>
                </div>

                {/* Langkah Belajar Visual (Foto ➔ Baca ➔ Cek Sumber ➔ Bintang) */}
                <LearningStepsIndicator currentStep={currentStep} />

                {/* Tampilan Sesuai Mode Belajar Aktif */}
                {activeMode === 'read' && (
                  <ReadModeView
                    lesson={currentLesson}
                    onOpenSourceModal={handleOpenSourceModal}
                    onOpenTutorModal={handleOpenTutorModal}
                    onOpenQuiz={() => setIsQuizOpen(true)}
                    onOpenFlashcardForTerm={(term) => {
                      setActiveMode('visual');
                      setMascotMessage(`Membuka visual flashcard untuk kata "${term}"!`);
                      speakText(`Membuka flashcard visual untuk kata ${term}`);
                    }}
                    speakText={speakText}
                    onCompleteLesson={handleCompleteLesson}
                    calmMode={settings.calmMode}
                  />
                )}

                {activeMode === 'visual' && (
                  <VisualModeView
                    lesson={currentLesson}
                    onOpenSourceModal={handleOpenSourceModal}
                    onOpenQuiz={() => setIsQuizOpen(true)}
                    speakText={speakText}
                    onCompleteLesson={handleCompleteLesson}
                    calmMode={settings.calmMode}
                  />
                )}

                {activeMode === 'sound' && (
                  <SoundModeView
                    lesson={currentLesson}
                    onOpenSourceModal={handleOpenSourceModal}
                    onOpenQuiz={() => setIsQuizOpen(true)}
                    speakText={speakText}
                    onCompleteLesson={handleCompleteLesson}
                    calmMode={settings.calmMode}
                  />
                )}

                {/* Kartu Respons Simbol Cepat */}
                <SymbolResponseBar
                  onSelectSymbol={handleSymbolSelect}
                  speakText={speakText}
                />
              </>
            )}
          </div>
        )}

        {/* ===================== TAB 3: MATERI SAYA (HISTORY) ===================== */}
        {activeTab === 'history' && (
          <HistoryView
            history={history}
            onSelectLesson={handleSelectHistoryLesson}
            onDeleteLesson={handleDeleteHistoryLesson}
            onOpenScan={() => setIsScanOpen(true)}
            onCreateMaterial={
              profile?.role === 'guru'
                ? () => setIsCreateMaterialOpen(true)
                : undefined
            }
            viewerId={profile?.id}
            viewerRole={profile?.role}
            speakText={speakText}
          />
        )}

        {/* ===================== TAB 4: PENGATURAN ===================== */}
        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            updateSettings={updateSettings}
            speakText={speakText}
          />
        )}
      </main>

      {/* Maskot Milo */}
      <Mascot message={mascotMessage} />

      {/* Modals */}
      <ScanModal
        isOpen={isScanOpen}
        onClose={() => setIsScanOpen(false)}
        onScanSuccess={handleScanSuccess}
      />

      <CreateMaterialModal
        isOpen={isCreateMaterialOpen}
        onClose={() => setIsCreateMaterialOpen(false)}
        onSave={handleCreateMaterial}
        speakText={speakText}
      />

      <SourceModal
        isOpen={sourceModalData.isOpen}
        onClose={() => setSourceModalData((prev) => ({ ...prev, isOpen: false }))}
        title={currentLesson.title}
        pointText={sourceModalData.pointText}
        sourceQuote={sourceModalData.sourceQuote}
        isValidQuote={sourceModalData.isValid}
        ocrFullText={currentLesson.ocr_text}
        teacherEdited={
          currentLesson.teacher_verification?.isVerified &&
          currentLesson.teacher_verification?.edited
        }
        verifiedBy={
          currentLesson.teacher_verification?.isVerified
            ? currentLesson.teacher_verification?.verifiedBy
            : undefined
        }
      />

      <AITutorModal
        isOpen={tutorModalData.isOpen}
        onClose={() => setTutorModalData((prev) => ({ ...prev, isOpen: false }))}
        pointText={tutorModalData.pointText}
        ocrText={currentLesson.ocr_text}
        speakText={speakText}
        onViewSource={(quote, isValid) =>
          handleOpenSourceModal(tutorModalData.pointText, quote, isValid)
        }
      />

      <QuizModal
        key={`${currentLesson.id}-${isQuizOpen ? 'open' : 'closed'}`}
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        lesson={currentLesson}
        onCompleteQuiz={handleCompleteQuiz}
        speakText={speakText}
        calmMode={settings.calmMode}
        onOpenSource={(pointText, quote, isValid) =>
          handleOpenSourceModal(pointText, quote, isValid)
        }
      />

      <RestReminderModal
        isOpen={isRestOpen}
        onClose={() => setIsRestOpen(false)}
        speakText={speakText}
      />

      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />
    </div>
  );
}
