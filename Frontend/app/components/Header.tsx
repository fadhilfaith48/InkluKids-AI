'use client';

import React from 'react';
import {
  BookOpen,
  Home,
  Settings,
  Bookmark,
  HelpCircle,
  Camera,
  UserCheck,
  GraduationCap,
  LogIn,
  LogOut,
} from 'lucide-react';
import { UserRole } from '@/types';

interface HeaderProps {
  activeTab: 'home' | 'learn' | 'history' | 'settings';
  setActiveTab: (tab: 'home' | 'learn' | 'history' | 'settings') => void;
  onOpenScan: () => void;
  onOpenHelp: () => void;
  userRole: UserRole;
  onToggleRole: () => void;
  /** Profil Supabase yang sedang login, null bila belum masuk. */
  authUser: { name: string; role: UserRole } | null;
  onOpenLogin: () => void;
  onSignOut: () => void;
  /** Mode Guru hanya boleh dipakai tamu (demo) atau akun guru. */
  canToggleRole: boolean;
}

export function Header({
  activeTab,
  setActiveTab,
  onOpenScan,
  onOpenHelp,
  userRole,
  onToggleRole,
  authUser,
  onOpenLogin,
  onSignOut,
  canToggleRole,
}: HeaderProps) {
  const isGuru = userRole === 'guru';
  const displayName = authUser?.name?.trim() || 'Pengguna';
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');

  return (
    <header className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-2 px-3 py-3 sm:flex-nowrap sm:gap-3 sm:px-6 md:py-6">
      {/* Brand logo & tagline */}
      <button
        className="flex min-h-12 items-center gap-2.5 rounded-2xl px-2 text-left focus-ring sm:gap-3"
        onClick={() => setActiveTab('home')}
        aria-label="Kembali ke Beranda PahamInklusif AI"
      >
        <span
          className={`brand-icon grid h-12 w-12 place-items-center rounded-2xl border-2 border-ink text-ink ${
            isGuru ? 'bg-[#DCE8FD]' : 'bg-mint'
          }`}
        >
          {isGuru ? (
            <UserCheck className="h-6 w-6 stroke-[2.5] text-[#1F5F85]" />
          ) : (
            <BookOpen className="h-6 w-6 stroke-[2.5]" />
          )}
        </span>
        <span className="hidden sm:block">
          <span className="flex items-center gap-1.5">
            <strong className="block text-[18px] leading-tight text-ink font-bold">
              PahamInklusif AI
            </strong>
            {isGuru && (
              <span className="rounded-md bg-[#DCE8FD] border border-[#1F5F85] px-1.5 py-0.2 text-[10px] font-black text-[#1F5F85]">
                GURU
              </span>
            )}
          </span>
          <span className="text-xs text-slateText font-medium">
            {isGuru ? 'Panel Verifikasi Pengajar' : 'Belajar dengan caramu'}
          </span>
        </span>
      </button>

      {/* Navigasi Utama & Role Toggle */}
      <nav className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2.5" aria-label="Navigasi utama">
        {/* Toggle Mode Siswa / Mode Guru */}
        {canToggleRole && (
          <button
            type="button"
            onClick={onToggleRole}
            className={`flex min-h-12 items-center gap-1.5 rounded-2xl border-2 border-ink px-2.5 py-2 text-xs font-black shadow-[2px_2px_0_#17304F] transition-all focus-ring sm:px-3 ${
              isGuru
                ? 'bg-[#DCE8FD] text-[#1F5F85] hover:bg-[#c8ddfb]'
                : 'bg-white text-ink hover:bg-[#FAF6F0]'
            }`}
            title={isGuru ? 'Beralih ke Tampilan Siswa' : 'Beralih ke Mode Verifikasi Guru'}
            aria-label={isGuru ? 'Mode Guru aktif, klik untuk ganti ke Mode Siswa' : 'Klik untuk masuk Mode Guru'}
          >
            {isGuru ? (
              <>
                <UserCheck className="h-4 w-4" />
                <span className="hidden sm:inline">Mode Guru</span>
              </>
            ) : (
              <>
                <GraduationCap className="h-4 w-4 text-forest" />
                <span className="hidden sm:inline">Mode Guru?</span>
              </>
            )}
          </button>
        )}

        {/* Akun: masuk atau keluar */}
        {authUser ? (
          <div className="flex min-h-12 items-center gap-1.5 rounded-2xl border-2 border-ink bg-white px-2 py-1 shadow-[2px_2px_0_#17304F]">
            <span
              className="grid h-7 w-7 place-items-center rounded-xl border border-ink bg-mint text-[11px] font-black text-forest"
              aria-hidden="true"
            >
              {initials || '?'}
            </span>
            <span className="hidden max-w-[7rem] truncate text-xs font-bold text-ink sm:inline">
              {displayName}
            </span>
            <span
              className={`hidden rounded-md px-1.5 py-0.5 text-[10px] font-black xs:inline sm:inline ${
                authUser.role === 'guru'
                  ? 'bg-[#DCE8FD] text-[#1F5F85]'
                  : 'bg-mint text-forest'
              }`}
            >
              {authUser.role === 'guru' ? 'GURU' : 'SISWA'}
            </span>
            <button
              type="button"
              onClick={onSignOut}
              className="grid min-h-10 min-w-10 place-items-center rounded-xl text-slateText hover:bg-[#FAF6F0] hover:text-ink focus-ring"
              aria-label={`Keluar dari akun ${displayName}`}
              title="Keluar"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onOpenLogin}
            className="flex min-h-12 items-center gap-1.5 rounded-2xl border-2 border-ink bg-[#FAF6F0] px-2.5 py-2 text-xs font-black text-ink shadow-[2px_2px_0_#17304F] transition-all hover:bg-white focus-ring sm:px-3"
            aria-label="Masuk ke akun guru atau siswa"
            title="Masuk"
          >
            <LogIn className="h-4 w-4 text-forest" />
            <span className="hidden sm:inline">Masuk</span>
          </button>
        )}

        <button
          className={`nav-button px-2.5 sm:px-4 ${activeTab === 'home' ? 'nav-button-active' : ''}`}
          onClick={() => setActiveTab('home')}
          aria-current={activeTab === 'home' ? 'page' : undefined}
          title="Beranda"
        >
          <Home className="h-5 w-5" />
          <span className="hidden md:inline">Beranda</span>
        </button>

        <button
          className="nav-button bg-mint px-2.5 text-ink hover:bg-[#c9ebd9] sm:px-4"
          onClick={onOpenScan}
          aria-label="Pindai Buku Pelajaran"
          title="Pindai Halaman Buku"
        >
          <Camera className="h-5 w-5 text-forest" />
          <span className="hidden md:inline">Pindai Buku</span>
        </button>

        <button
          className={`nav-button px-2.5 sm:px-4 ${activeTab === 'history' ? 'nav-button-active' : ''}`}
          onClick={() => setActiveTab('history')}
          aria-current={activeTab === 'history' ? 'page' : undefined}
          title="Materi Saya (Riwayat)"
        >
          <Bookmark className="h-5 w-5" />
          <span className="hidden md:inline">Materi Saya</span>
        </button>

        <button
          className={`nav-button px-2.5 sm:px-4 ${activeTab === 'settings' ? 'nav-button-active' : ''}`}
          onClick={() => setActiveTab('settings')}
          aria-current={activeTab === 'settings' ? 'page' : undefined}
          title="Pengaturan Aksesibilitas"
        >
          <Settings className="h-5 w-5" />
          <span className="hidden md:inline">Pengaturan</span>
        </button>

        <button
          className="nav-button bg-white px-2.5 text-ink sm:px-4"
          type="button"
          aria-label="Bantuan penggunaan aplikasi"
          title="Bantuan"
          onClick={onOpenHelp}
        >
          <HelpCircle className="h-5 w-5 text-ink" />
          <span className="hidden lg:inline">Bantuan</span>
        </button>
      </nav>
    </header>
  );
}
