/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  GraduationCap, LogOut, Award, CheckSquare, FileText, 
  BookOpen, Heart, Calendar, ChevronRight, CheckCircle, 
  Smile, UserCheck, Play, ArrowLeft, Clock, Sparkles 
} from "lucide-react";
import { SchoolConfig, AlurTujuanPembelajaran, StudentGrade, DailyAttendance, CaseLog, ModulAjar } from "../types";
import { HeaderKop } from "./HeaderKop";

interface StudentPortalProps {
  currentUser: { id: string; name: string; nisn: string; gender: "L" | "P" };
  config: SchoolConfig;
  atpList: AlurTujuanPembelajaran[];
  grades: StudentGrade[];
  attendanceList: DailyAttendance[];
  caseLogs: CaseLog[];
  modulAjarMap: { [tpCode: string]: ModulAjar };
  onLogout: () => void;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({
  currentUser,
  config,
  atpList,
  grades,
  attendanceList,
  caseLogs,
  modulAjarMap,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<"dashboard" | "learning" | "attendance" | "character">("dashboard");
  const [selectedTpCode, setSelectedTpCode] = useState<string>(atpList[0]?.code || "");
  const [showPrintableRapor, setShowPrintableRapor] = useState(false);
  
  // Interactive LKPD simulation state
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Compute student stats
  const studentGradeEntry = grades.find((g) => g.studentId === currentUser.id);
  const myFormativeGrades = studentGradeEntry?.formativeGrades || {};
  const myMidterm = studentGradeEntry?.midtermGrade || 0;
  const myFinal = studentGradeEntry?.finalGrade || 0;

  // Formative average
  const formativeValues: number[] = Object.values(myFormativeGrades) as number[];
  const totalFormative = formativeValues.reduce((sum: number, v: number) => sum + Number(v || 0), 0);
  const avgFormative = formativeValues.length > 0 
    ? Math.round(totalFormative / formativeValues.length)
    : 0;

  // Ultimate Final Score calculation (matching App.tsx)
  let myFinalScore = formativeValues.length > 0
    ? Math.round((avgFormative + Number(myMidterm) + Number(myFinal)) / 3)
    : Math.round((Number(myMidterm) + Number(myFinal)) / 2);

  if (studentGradeEntry?.remedialScore && studentGradeEntry.remedialScore > myFinalScore) {
    myFinalScore = studentGradeEntry.remedialScore;
  }

  const isTuntas = myFinalScore >= config.kktp;

  // Check how many TPs has been graded and achieved >= KKTP
  const totalTpsAssessed = Object.keys(myFormativeGrades).length;
  const tpsPassedCount = Object.entries(myFormativeGrades).filter(([_, score]) => score >= config.kktp).length;

  // Filter attendance logs for this student
  let hadirCount = 0;
  let sakitCount = 0;
  let izinCount = 0;
  let alpaCount = 0;

  const myAttendanceHistory = attendanceList.map((day) => {
    const status = day.records[currentUser.id] || "Belum Diisi";
    if (status === "Hadir") hadirCount++;
    else if (status === "Sakit") sakitCount++;
    else if (status === "Izin") izinCount++;
    else if (status === "Alpa") alpaCount++;
    return { date: day.date, status };
  });

  const totalPresenceDays = myAttendanceHistory.filter(h => h.status !== "Belum Diisi").length;
  const attendanceRate = totalPresenceDays > 0 ? Math.round((hadirCount / totalPresenceDays) * 100) : 100;

  // Character logs (Case logs) related to this student
  const myCharacterLogs = caseLogs.filter((log) => log.studentId === currentUser.id);

  // Submit digital worksheet simulation
  const handleAnswersSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      alert("✅ Jawaban Lembar Kerja (LKPD) berhasil disimpan dan dikirimkan ke Guru Pengampu (Pak " + config.teacherName + ")!");
    }, 1500);
  };

  const selectedModul = modulAjarMap[selectedTpCode];

  return (
    <div className="flex h-screen bg-[#fafafc] font-sans text-slate-800 overflow-hidden text-left">
      
      {/* 🚀 Student Desktop Left Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col flex-shrink-0 select-none z-10 hidden md:flex">
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
          <div className="w-9 h-9 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="block font-display font-extrabold text-white text-sm tracking-wide">PORTAL SISWA</span>
            <span className="block text-[9px] text-emerald-400 font-mono font-black tracking-wider uppercase">SDN Merdeka Jaya</span>
          </div>
        </div>

        {/* Student Mini Profile in Sidebar */}
        <div className="p-5 border-b border-slate-800 bg-slate-850/40 text-left space-y-2">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-extrabold text-base border border-emerald-500/40">
              {currentUser.gender === "L" ? "👦" : "👧"}
            </div>
            <div className="truncate">
              <span className="block text-xs font-bold text-white truncate leading-tight">{currentUser.name}</span>
              <span className="block text-[9.5px] text-slate-400 font-mono mt-0.5">NISN: {currentUser.nisn}</span>
            </div>
          </div>
          <div className="text-[10px] bg-slate-800 p-2 rounded-lg border border-slate-750/50 space-y-1 text-slate-300 select-none">
            <div className="flex justify-between"><span>Kelas:</span> <span className="font-bold text-white">{config.grade}</span></div>
            <div className="flex justify-between"><span>Mapel:</span> <span className="font-bold text-white truncate w-24 text-right">{config.subject}</span></div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-grow p-4 space-y-1.5 overflow-y-auto">
          <button
            onClick={() => { setActiveTab("dashboard"); setShowPrintableRapor(false); }}
            className={`w-full flex items-center px-4 py-2.5 rounded-xl text-left text-xs font-semibold transition ${
              activeTab === "dashboard" ? "bg-emerald-600 text-white font-bold shadow-sm" : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <Award className="w-4 h-4 mr-3" />
            Rapor Belajarku
          </button>

          <button
            onClick={() => { setActiveTab("learning"); setShowPrintableRapor(false); }}
            className={`w-full flex items-center px-4 py-2.5 rounded-xl text-left text-xs font-semibold transition ${
              activeTab === "learning" ? "bg-emerald-600 text-white font-bold shadow-sm" : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <BookOpen className="w-4 h-4 mr-3" />
            Materi & LKPD Digital
          </button>

          <button
            onClick={() => { setActiveTab("attendance"); setShowPrintableRapor(false); }}
            className={`w-full flex items-center px-4 py-2.5 rounded-xl text-left text-xs font-semibold transition ${
              activeTab === "attendance" ? "bg-emerald-600 text-white font-bold shadow-sm" : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <UserCheck className="w-4 h-4 mr-3" />
            Presensi Harian Saya
          </button>

          <button
            onClick={() => { setActiveTab("character"); setShowPrintableRapor(false); }}
            className={`w-full flex items-center px-4 py-2.5 rounded-xl text-left text-xs font-semibold transition ${
              activeTab === "character" ? "bg-emerald-600 text-white font-bold shadow-sm" : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <Heart className="w-4 h-4 mr-3" />
            Karakter Pancasila
          </button>
        </nav>

        {/* Logout at bottom */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center p-2.5 rounded-xl text-xs font-bold text-red-400 border border-transparent hover:border-red-500/20 hover:bg-red-500/10 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Keluar dari Portal
          </button>
        </div>
      </aside>

      {/* 🚀 Student Main Workspace */}
      <div className="flex-grow flex flex-col overflow-hidden">
        
        {/* Sticky top layout header */}
        <header className="bg-white border-b border-slate-205 h-16 flex items-center justify-between px-6 flex-shrink-0 z-10 w-full select-none">
          <div className="flex items-center space-x-3">
            <GraduationCap className="w-5 h-5 text-emerald-600 font-bold shrink-0 block md:hidden" />
            <span className="font-extrabold font-display text-sm tracking-wide text-slate-900 md:hidden leading-none">PORTAL SISWA</span>
            <span className="hidden md:block text-xs font-bold text-slate-500 font-sans">
              Lembar Kemajuan Hasil Belajar Kurikulum Merdeka Terintegrasi
            </span>
          </div>

          <div className="flex items-center space-x-4 shrink-0">
            <div className="text-right">
              <span className="block text-xs font-bold text-slate-900 font-display leading-none">{currentUser.name}</span>
              <span className="text-[10px] text-slate-400 font-mono mt-1 block">NISN: {currentUser.nisn}</span>
            </div>
            <button
              onClick={onLogout}
              className="md:hidden p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition cursor-pointer"
              title="Keluar"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Tab switch specifically on Mobile device */}
        <div className="bg-[#1e293b] text-slate-400 p-2 flex items-center justify-around text-[10px] uppercase font-bold border-b border-slate-700 md:hidden z-10 select-none">
          <button onClick={() => { setActiveTab("dashboard"); setShowPrintableRapor(false); }} className={`p-1.5 ${activeTab === 'dashboard' ? 'text-emerald-300 font-bold' : ''}`}>Raporku</button>
          <button onClick={() => { setActiveTab("learning"); setShowPrintableRapor(false); }} className={`p-1.5 ${activeTab === 'learning' ? 'text-emerald-300 font-bold' : ''}`}>Materi</button>
          <button onClick={() => { setActiveTab("attendance"); setShowPrintableRapor(false); }} className={`p-1.5 ${activeTab === 'attendance' ? 'text-emerald-300 font-bold' : ''}`}>Kehadiran</button>
          <button onClick={() => { setActiveTab("character"); setShowPrintableRapor(false); }} className={`p-1.5 ${activeTab === 'character' ? 'text-emerald-300 font-bold' : ''}`}>Karakter</button>
        </div>

        {/* Tab Canvas Content viewport */}
        <main className="flex-grow p-6 overflow-y-auto w-full select-none md:select-text">
          
          {showPrintableRapor ? (
            /* --- RENDER PRINTABLE RAPOR / REPORT TAB --- */
            <div className="space-y-6 max-w-4xl mx-auto">
              <button 
                onClick={() => setShowPrintableRapor(false)}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition font-bold select-none cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Kembali ke Ringkasan Dashboard
              </button>

              <div className="bg-white border rounded-2xl shadow-sm p-8 space-y-6 bg-radial from-white to-slate-50 border-slate-200">
                <HeaderKop config={config} documentTitle="KARTU HASIL BELAJAR PESERTA DIDIK (RAPOR SEMESTER)" />
                
                {/* School Report Metadata */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-150">
                  <div className="text-xs">
                    <span className="block font-semibold text-slate-500">Nama Siswa:</span>
                    <span className="font-extrabold text-slate-900 block mt-0.5">{currentUser.name}</span>
                  </div>
                  <div className="text-xs">
                    <span className="block font-semibold text-slate-500">NISN Peserta Didik:</span>
                    <span className="font-mono font-bold text-slate-900 block mt-0.5">{currentUser.nisn}</span>
                  </div>
                  <div className="text-xs">
                    <span className="block font-semibold text-slate-500">Kriteria Minimum (KKTP):</span>
                    <span className="font-extrabold text-blue-700 block mt-0.5">{config.kktp}</span>
                  </div>
                  <div className="text-xs">
                    <span className="block font-semibold text-slate-500">Nilai Akhir Rata-Rata:</span>
                    <span className={`font-black block mt-0.5 ${isTuntas ? "text-emerald-600" : "text-amber-600"}`}>
                      {myFinalScore} ({isTuntas ? "TUNTAS" : "REMEDIAL"})
                    </span>
                  </div>
                </div>

                {/* Score breakdown per TP */}
                <div className="my-6">
                  <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wide border-b pb-1.5 border-slate-205">Rincian Kemajuan Belajar per Tujuan Pembelajaran (TP)</h3>
                  
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                    <table className="w-full text-xs font-semibold text-left">
                      <thead className="bg-slate-100/80 text-slate-650 tracking-wider">
                        <tr>
                          <th className="px-4 py-3 text-center border-r w-16">Kode</th>
                          <th className="px-4 py-3 border-r">Deskripsi Kompetensi / Tujuan Pembelajaran</th>
                          <th className="px-4 py-3 border-r text-center w-28">Formatif Rerata</th>
                          <th className="px-4 py-3 border-r text-center w-20">UTS</th>
                          <th className="px-4 py-3 border-r text-center w-20">UAS</th>
                          <th className="px-4 py-3 text-center w-28">Status Capaian</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-750">
                        {atpList.map((tp) => {
                          const val = myFormativeGrades[tp.code];
                          const score = val !== undefined ? Number(val) : null;
                          const tActive = score !== null ? (score >= config.kktp) : null;

                          return (
                            <tr key={tp.id} className="hover:bg-slate-50/50">
                              <td className="px-4 py-3 text-center bg-slate-50 font-bold border-r font-mono text-slate-600">{tp.code}</td>
                              <td className="px-4 py-3 border-r leading-relaxed font-sans">{tp.tpText}</td>
                              <td className="px-4 py-3 border-r text-center font-mono font-bold">
                                {score !== null ? score : <span className="text-slate-350 italic">Belum dinilai</span>}
                              </td>
                              <td className="px-4 py-3 border-r text-center font-mono">{myMidterm || "-"}</td>
                              <td className="px-4 py-3 border-r text-center font-mono">{myFinal || "-"}</td>
                              <td className="px-4 py-3 text-center">
                                {score !== null ? (
                                  <span className={`px-2 py-1 rounded-md text-[10px] uppercase font-black tracking-wide ${
                                    tActive ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                                  }`}>
                                    {tActive ? "Tuntas" : "Remedial"}
                                  </span>
                                ) : (
                                  <span className="text-slate-400 italic">Antrean asimilasi</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Teacher notes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-150">
                  <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-150 text-xs text-left leading-relaxed font-sans">
                    <span className="font-bold text-blue-900 block border-b border-blue-100 pb-1 uppercase tracking-wide text-[10px]">Ringkasan Evaluasi Guru Pengampu:</span>
                    <p className="mt-2 text-slate-700">
                      Ananda <strong>{currentUser.name}</strong> menunjukkan {isTuntas ? "kecakapan dan penguasaan materi yang memuaskan" : "kebutuhan dukungan bimbingan terarah"} pada materi pembelajaran <em>{config.subject}</em>. Terus pertahankan semangat membaca, mengikuti eksperimen harian pancaindra, dan memperkaya catatan kasus disiplin positif.
                    </p>
                  </div>

                  <div className="flex flex-col items-end justify-center text-xs text-slate-800 pr-5 select-none pt-4 md:pt-0 font-sans">
                    <p className="text-slate-500 font-medium">Jakarta, 28 Mei 2026</p>
                    <p className="font-extrabold text-slate-900 mt-1">Guru Kelas 5SD,</p>
                    <div className="h-10 w-24 border-b border-slate-350 flex items-center justify-center font-serif text-[10px] text-slate-400 italic">
                      TtD Digital
                    </div>
                    <p className="font-bold mt-1 text-slate-850">{config.teacherName}</p>
                    <p className="text-[10px] text-slate-450 font-mono">NIP. {config.teacherNip || "-"}</p>
                  </div>
                </div>

                {/* Print Notice bar */}
                <div className="p-3 bg-slate-100 border border-slate-205 rounded-xl text-center text-[10px] text-slate-500 font-medium select-none flex items-center justify-center gap-1.5">
                  <span>Nota: Laporan ini adalah lembar draf digital yang diselaraskan dengan server utama Dapodik SDN Merdeka Jaya.</span>
                </div>
              </div>
            </div>
          ) : (
            /* --- RENDER MAIN TABS --- */
            <div className="space-y-6">
              
              {/* Core tab: Dashboard kemajuan hasil belajar */}
              {activeTab === "dashboard" && (
                <div className="space-y-6">
                  {/* Student portal welcome banner */}
                  <div className="bg-[#0f172a] rounded-2xl p-6 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-sm border border-slate-805">
                    <div className="space-y-2 text-left">
                      <div className="flex items-center space-x-2 text-emerald-400">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest font-mono">Portal Kurikulum Merdeka</span>
                      </div>
                      <h1 className="text-xl md:text-2xl font-black font-display tracking-tight text-white leading-tight">
                        Selamat Datang, {currentUser.name}! 📚
                      </h1>
                      <p className="text-xs text-slate-300 leading-relaxed max-w-2xl font-sans">
                        Di portal siswa, kamu bisa memantau perolehan nilai sumatif harian, mengakses materi bahan ajar digital, Lembar Kerja LKPD, absensi kehadiran, dan log karakter Pancasilamu sendiri.
                      </p>
                    </div>

                    <div className="flex-shrink-0 bg-slate-800/60 p-4 rounded-xl border border-slate-700/50 space-y-1 text-xs select-none text-left font-mono">
                      <div className="flex justify-between w-48 text-slate-400 font-medium"><span>NISN Anda:</span> <span className="font-extrabold text-emerald-400">{currentUser.nisn}</span></div>
                      <div className="flex justify-between w-48 text-slate-400 font-medium"><span>Kriteria Lulus:</span> <span className="font-bold text-white">KKTP {config.kktp}</span></div>
                      <div className="flex justify-between w-48 text-slate-400 font-medium"><span>Guru Kelas:</span> <span className="font-bold text-white truncate w-24 text-right">{config.teacherName}</span></div>
                    </div>
                  </div>

                  {/* Top score indicators card grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 select-none">
                    <div className="bg-white rounded-xl border border-slate-200/85 p-4 shadow-sm flex items-center space-x-4">
                      <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-650 border border-indigo-100/50">
                        <Award className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <span className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Nilai Rerata Saya</span>
                        <span className="text-base font-black text-slate-900 font-mono mt-0.5">{myFinalScore}</span>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200/85 p-4 shadow-sm flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
                        isTuntas ? "bg-emerald-50 text-emerald-600 border-emerald-100/50" : "bg-amber-50 text-amber-600 border-amber-100/50"
                      }`}>
                        <CheckSquare className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <span className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Capaian Kelas</span>
                        <span className="text-base font-black text-slate-900 font-mono mt-0.5 uppercase">
                          {isTuntas ? "Tuntas" : "Remedial"}
                        </span>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200/85 p-4 shadow-sm flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 border border-blue-100/50">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <span className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Tujuan Selesai</span>
                        <span className="text-base font-black text-slate-900 font-mono mt-0.5">{tpsPassedCount} / {atpList.length} TP</span>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200/85 p-4 shadow-sm flex items-center space-x-4">
                      <div className="w-10 h-10 bg-sky-50 rounded-lg flex items-center justify-center text-sky-600 border border-sky-100/50">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <span className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Tingkat Kehadiran</span>
                        <span className="text-base font-black text-slate-900 font-mono mt-0.5">{attendanceRate}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Visual charts and list divided */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* Column Left: Visual list of graded TPs */}
                    <div className="lg:col-span-8 bg-white p-5 rounded-xl border border-slate-200/85 shadow-2xs space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-3 gap-2">
                        <div className="text-left">
                          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-display flex items-center gap-1.5">
                            <FileText className="w-4 h-4 text-emerald-600" />
                            Matriks Kompetensi & Perkembangan TP Kamu
                          </h3>
                          <p className="text-[11px] text-slate-400 mt-0.5 font-sans">Semua nilai asimilasi formatif, tugas, dan ujian tengah/akhir yang telah tercatat oleh wali kelas.</p>
                        </div>

                        <button
                          onClick={() => setShowPrintableRapor(true)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-lg text-xs flex items-center gap-1 transition shadow-xs cursor-pointer"
                        >
                          👁️ Cetak Laporan Rapor
                        </button>
                      </div>

                      <div className="space-y-3">
                        {atpList.map((tp) => {
                          const val = myFormativeGrades[tp.code];
                          const score = val !== undefined ? Number(val) : null;
                          const tpPass = score !== null ? (score >= config.kktp) : null;

                          return (
                            <div key={tp.id} className="p-3.5 border rounded-xl bg-slate-50/40 hover:bg-slate-50 transition border-slate-180 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 font-sans select-none text-left">
                              <div className="space-y-1 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="bg-slate-200 text-slate-700 text-[10px] font-extrabold font-mono px-1.5 py-0.5 rounded">
                                    {tp.code}
                                  </span>
                                  <span className="text-[10px] font-bold text-slate-400 font-sans tracking-wide">
                                    Mata Pelajaran {config.subject}
                                  </span>
                                </div>
                                <p className="text-xs font-bold tracking-tight text-slate-905 font-sans leading-snug">
                                  {tp.tpText}
                                </p>
                              </div>

                              <div className="flex items-center space-x-4 shrink-0 justify-between sm:justify-end border-t sm:border-none pt-2.5 sm:pt-0">
                                <div className="text-right">
                                  <span className="block text-[9px] font-extrabold text-slate-400 uppercase">Nilai Formatif</span>
                                  <span className="block text-sm font-black font-mono text-slate-800">
                                    {score !== null ? score : <span className="text-xs text-slate-350 font-normal italic">Belum diisi</span>}
                                  </span>
                                </div>

                                <div className="w-24 text-center">
                                  {score !== null ? (
                                    <span className={`px-2 py-1 rounded text-[9.5px] uppercase font-black block text-center ${
                                      tpPass ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                                    }`}>
                                      {tpPass ? "Tuntas" : "Remedial"}
                                    </span>
                                  ) : (
                                    <span className="text-[9.5px] text-slate-400 bg-slate-200/50 border border-slate-150 rounded px-2 py-1 block text-center italic">
                                      Menunggu
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Column Right: Custom Progress Visual Circle Gauge */}
                    <div className="lg:col-span-4 space-y-6">
                      <div className="bg-white p-5 rounded-xl border border-slate-200/85 shadow-2xs space-y-4 text-center">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-display">Target Kelulusan KKTP</h4>
                        
                        <div className="relative w-36 h-36 mx-auto flex items-center justify-center select-none font-mono">
                          {/* Circle progress under-ring */}
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
                            <circle 
                              cx="50" 
                              cy="50" 
                              r="40" 
                              stroke={isTuntas ? "#10b981" : "#f59e0b"} 
                              strokeWidth="8" 
                              fill="transparent" 
                              strokeDasharray={`${2 * Math.PI * 40}`} 
                              strokeDashoffset={`${2 * Math.PI * 40 * (1 - Math.min(myFinalScore, 100) / 100)}`}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col justify-center items-center font-sans">
                            <span className="text-3xl font-black text-slate-900 font-mono tracking-tight">{myFinalScore}</span>
                            <span className="text-[10px] uppercase font-bold text-slate-400 mt-0.5">Nilai Akhir</span>
                          </div>
                        </div>

                        <div className="p-3.5 bg-slate-50 border border-slate-150 rounded-xl text-left text-xs leading-normal font-sans space-y-2 text-slate-700">
                          <span className="font-extrabold text-[10px] text-slate-800 uppercase block tracking-wider">Info Batas KKTP Semester</span>
                          <p>
                            Batas Ketuntasan Kriteria Minimal (KKTP) yang ditentukan di {config.schoolName} adalah <strong>{config.kktp}</strong>.
                          </p>
                          <div className="flex items-center gap-1">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                            <span><strong>Status:</strong> {isTuntas ? "Lulus dengan memuaskan!" : "Perlu perbaikan / remedial harian."}</span>
                          </div>
                        </div>
                      </div>

                      {/* Character log alert inside sidebar for prompt reflex */}
                      {myCharacterLogs.filter(c => c.behaviorType === "Positif").length > 0 && (
                        <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl border border-emerald-250 leading-relaxed text-xs space-y-1.5 text-left font-sans select-none">
                          <div className="flex items-center gap-1.5">
                            <Smile className="w-4 h-4 text-emerald-600" />
                            <span className="font-extrabold uppercase tracking-wide text-[10.5px]">Apresiasi Perilaku Pancasila</span>
                          </div>
                          <p className="font-medium text-slate-700 mt-1">
                            Kamu tercatat melakukan tindakan teladan positif di kelas! Buka tab <strong>Karakter pancasila</strong> untuk melihat masukan pujian tertulis dari gurumu.
                          </p>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              )}

              {/* Tab 2: Bahan Ajar & Interactive LKPD */}
              {activeTab === "learning" && (
                <div className="space-y-6 text-left">
                  <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-3 gap-2">
                      <div className="text-left">
                        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 font-display">
                          <BookOpen className="w-4.5 h-4.5 text-emerald-600" />
                          Materi Membaca & Lembar Kerja Digital (LKPD) Siswa
                        </h2>
                        <p className="text-xs text-slate-500 font-sans mt-0.5">Pilih Tujuan Pembelajaran yang sedang diajarkan di kelas untuk membuka materi bahan bacaan serta melakukan latihan mandiri.</p>
                      </div>

                      {/* TP Selector Dropdown */}
                      <div className="flex items-center space-x-2 shrink-0 select-none">
                        <span className="text-xs font-bold text-slate-600">Pilih Materi TP:</span>
                        <select
                          value={selectedTpCode}
                          onChange={(e) => setSelectedTpCode(e.target.value)}
                          className="px-2.5 py-1.5 border bg-white rounded-lg text-xs font-bold text-slate-800 shadow-3xs"
                        >
                          {atpList.map((tp) => (
                            <option key={tp.id} value={tp.code}>
                              {tp.code} - {tp.tpText.slice(0, 30)}...
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {selectedModul ? (
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-sans">
                        
                        {/* Column Left: Reading Text / Materials / PPT */}
                        <div className="lg:col-span-6 space-y-5">
                          {/* Visual identity identifier */}
                          <div className="bg-[#f0fdf4] p-4 rounded-xl border border-[#bbf7d0] space-y-3">
                            <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded text-[9.5px] font-black uppercase tracking-wider">Identitas Kelompok Belajar</span>
                            <div className="grid grid-cols-2 gap-3 text-xs text-slate-700 leading-relaxed select-text mt-1">
                              <div><span className="font-semibold block">Materi Pembelajaran:</span> <span className="font-extrabold text-slate-900">{selectedModul.identitas?.mapel}</span></div>
                              <div><span className="font-semibold block">Model Ajar:</span> <span className="font-bold text-slate-800">{selectedModul.identitas?.modelPembelajaran}</span></div>
                              <div><span className="font-semibold block">Profil Pancasila:</span> <span className="font-medium text-slate-650">{selectedModul.identitas?.profilPancasila?.join(", ")}</span></div>
                              <div><span className="font-semibold block">Target Siswa:</span> <span className="font-medium text-slate-650">{selectedModul.identitas?.targetSiswa}</span></div>
                            </div>
                          </div>

                          {/* Reading content blocks */}
                          <div className="bg-white p-5 rounded-xl border border-slate-205 shadow-3xs space-y-3 text-left">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b pb-2 flex items-center gap-1.5 font-display select-none">
                              <FileText className="w-4 h-4 text-emerald-600" />
                              Bahan Bacaan & Rangkuman Harian
                            </h4>

                            <div className="text-xs text-slate-700 font-medium leading-relaxed font-sans select-text space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                              {selectedModul.materiBahanAjar ? (
                                <p className="whitespace-pre-wrap">{selectedModul.materiBahanAjar}</p>
                              ) : (
                                <div className="space-y-3">
                                  <p className="font-bold text-slate-900 text-xs">Materi: Rangkuman Hubungan Pancaindra dan Pergerakan Tubuh</p>
                                  <p>Pancaindra manusia terdiri dari mata (melihat), telinga (mendengar), hidung (membau/mencium), lidah (mengecap), dan kulit (meraba). Seluruh reseptor ini mengirimkan sinyal kelistrikan saraf ke pusat otak untuk memerintahkan respons fisik secara cepat.</p>
                                  <p>Organ gerak pada vertebrata (hewan bertulang belakang) didasari oleh struktur matriks kalsium tulang keras yang digerakkan oleh kontraksi otot seran lintang harian, sementara avertebrata memanfaatkan otot perut atau sistem hidrolik cangkang luar.</p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Interactive Slides view component */}
                          {selectedModul.pptOverview?.slides && (
                            <div className="bg-slate-900 text-white p-4.5 rounded-xl border border-slate-800 text-xs space-y-3 text-left select-none">
                              <span className="text-[10px] uppercase font-bold tracking-wider text-blue-400 block font-mono">Presentasi Slide Bahan Ajar Harian</span>
                              <div className="space-y-4 font-sans leading-relaxed max-h-[180px] overflow-y-auto pr-1">
                                {selectedModul.pptOverview.slides.map((s: any) => (
                                  <div key={s.slideNum} className="border-l-2 border-emerald-500 pl-3.5 space-y-1">
                                    <span className="font-mono font-black text-emerald-400 block text-[10px]">Slide {s.slideNum}: {s.title}</span>
                                    <ul className="list-disc pl-4 text-slate-300 text-[11px] font-medium space-y-0.5">
                                      {s.content?.map((line: string, i: number) => <li key={i}>{line}</li>)}
                                    </ul>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Column Right: Interactive digital LKPD Form */}
                        <div className="lg:col-span-6 bg-white border border-slate-205 p-5 rounded-xl shadow-2xs space-y-4">
                          <div className="border-b pb-2 text-left">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Lembar Kegiatan Peserta Didik (LKPD)</span>
                            <h3 className="text-xs font-bold text-slate-850 mt-1 uppercase font-display select-none">Lembar Tugas & Isian Logika Saya</h3>
                          </div>

                          {/* Instructions of worksheet */}
                          {selectedModul.lkpd?.petunjuk && (
                            <div className="p-3 bg-amber-50/50 border border-amber-205 rounded-xl text-[10.5px] leading-relaxed text-slate-700 text-left font-sans">
                              <strong className="text-amber-900 font-bold block select-none uppercase tracking-wider text-[9.5px]">Petunjuk Pengisian Tugas:</strong>
                              <ul className="list-decimal pl-4 mt-1 font-medium text-[10px] space-y-0.5">
                                {selectedModul.lkpd.petunjuk.map((p: string, i: number) => <li key={i}>{p}</li>)}
                              </ul>
                            </div>
                          )}

                          <form onSubmit={handleAnswersSubmit} className="space-y-4 text-left font-sans">
                            <div className="space-y-2">
                              {selectedModul.lkpd?.aktivitas ? (
                                <p className="text-xs text-slate-850 font-extrabold leading-normal">{selectedModul.lkpd.aktivitas}</p>
                              ) : (
                                <p className="text-xs text-slate-850 font-extrabold leading-normal">Simulasikan pengisian Laporan Pengamatan Mandiri hubungan bentuk organ gerak hewan avertebrata di lingkungan rumahmu:</p>
                              )}

                              {/* Question fields */}
                              <div className="space-y-3.5">
                                {(selectedModul.lkpd?.pertanyaanPemantikLogika || [
                                  "1. Mengapa siput dapat berjalan lambat tetapi lancar tanpa terluka di atas pecahan batu?",
                                  "2. Jelaskan perbedaan struktur otot gerak cacing tanah dengan kupu-kupu!"
                                ]).map((q: string, idx: number) => (
                                  <div key={idx} className="space-y-1.5">
                                    <span className="text-xs font-bold text-slate-750 block">{q}</span>
                                    <textarea
                                      required
                                      rows={2}
                                      value={answers[`q-${selectedTpCode}-${idx}`] || ""}
                                      onChange={(e) => setAnswers({ ...answers, [`q-${selectedTpCode}-${idx}`]: e.target.value })}
                                      placeholder="Ketikkan jawaban tulisan analisis ilmiah kamu di sini..."
                                      className="w-full text-xs font-medium p-2.5 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-800 shadow-inner"
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>

                            <button
                              type="submit"
                              disabled={isSubmitted}
                              className={`w-full font-bold uppercase tracking-wider font-display text-xs py-3 px-4 rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer ${
                                isSubmitted 
                                  ? "bg-slate-200 text-slate-400 cursor-not-allowed" 
                                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
                              }`}
                            >
                              <Play className="w-3.5 h-3.5" />
                              {isSubmitted ? "Sedang Mengirim..." : "Kirimkan Jawaban ke Guru"}
                            </button>
                          </form>
                        </div>

                      </div>
                    ) : (
                      <div className="p-12 text-center text-slate-400 border-2 border-dashed border-slate-250 rounded-xl space-y-1 select-none">
                        <FileText className="w-12 h-12 text-slate-300 mx-auto" />
                        <h3 className="text-sm font-bold text-slate-600">Dokumen Belum Disiapkan oleh Guru</h3>
                        <p className="text-[11px] text-slate-400 max-w-sm mx-auto">Dokumen RPP+ dan bahan ajar untuk materi TP ini belum diramalkan oleh Pak {config.teacherName}. Silakan beralih kembali ke akun guru untuk membentuknya.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 3: Presensi Harian Saya */}
              {activeTab === "attendance" && (
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6 text-left font-sans select-none">
                  <div className="border-b pb-3">
                    <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 font-display">
                      <UserCheck className="w-4.5 h-4.5 text-emerald-650" />
                      Presensi Kehadiran & Partisipasi Belajar Saya
                    </h2>
                    <p className="text-xs text-slate-500 font-sans mt-0.5">Rekapitulasi tanda kehadiran harian digital yang diinputkan oleh guru kelas pada jam asimilasi harian.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                    
                    {/* Circle presence distribution counts Column */}
                    <div className="md:col-span-4 bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Metrik Kehadiran</span>
                      
                      <div className="grid grid-cols-2 gap-3 text-center">
                        <div className="p-3 bg-white rounded-xl border font-mono">
                          <span className="block text-[9px] uppercase font-bold text-slate-400">Hadir</span>
                          <span className="text-xl font-black text-emerald-600 block mt-0.5">{hadirCount}</span>
                        </div>
                        <div className="p-3 bg-white rounded-xl border font-mono">
                          <span className="block text-[9px] uppercase font-bold text-slate-400">Sakit</span>
                          <span className="text-xl font-black text-blue-600 block mt-0.5">{sakitCount}</span>
                        </div>
                        <div className="p-3 bg-white rounded-xl border font-mono">
                          <span className="block text-[9px] uppercase font-bold text-slate-400">Izin</span>
                          <span className="text-xl font-black text-amber-600 block mt-0.5">{izinCount}</span>
                        </div>
                        <div className="p-3 bg-white rounded-xl border font-mono">
                          <span className="block text-[9px] uppercase font-bold text-slate-400">Alpa</span>
                          <span className="text-xl font-black text-red-600 block mt-0.5">{alpaCount}</span>
                        </div>
                      </div>

                      <div className="border-t pt-3 space-y-2 text-xs text-slate-600 font-sans leading-normal text-left font-medium">
                        <p>Total Pencatatan Kelas: <strong>{totalPresenceDays} Hari Efektif</strong></p>
                        <p>Persentase Kedisiplinan: <strong className="text-slate-900">{attendanceRate}% Kehadiran</strong></p>
                      </div>
                    </div>

                    {/* Dynamic Attendance log table Column */}
                    <div className="md:col-span-8 space-y-3">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wide block">Linimasa Absensi Harian</span>
                      
                      <div className="border rounded-xl overflow-hidden shadow-3xs">
                        <table className="w-full text-xs font-semibold text-left">
                          <thead className="bg-slate-50 text-slate-550 border-b tracking-wide">
                            <tr>
                              <th className="px-4 py-2.5">No</th>
                              <th className="px-4 py-2.5">Tanggal Pelaksanaan</th>
                              <th className="px-4 py-2.5 text-center">Tanda Status</th>
                              <th className="px-4 py-2.5 text-right">Keterangan</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y text-slate-705">
                            {myAttendanceHistory.map((h, i) => (
                              <tr key={h.date} className="hover:bg-slate-50/40">
                                <td className="px-4 py-3 text-slate-400 font-mono">{i + 1}</td>
                                <td className="px-4 py-3 font-sans">{h.date}</td>
                                <td className="px-4 py-3 text-center">
                                  <span className={`px-2 py-0.5 rounded text-[8.5px] uppercase font-black tracking-wide inline-block ${
                                    h.status === "Hadir" ? "bg-emerald-100 text-emerald-800" :
                                    h.status === "Sakit" ? "bg-blue-105 text-blue-800" :
                                    h.status === "Izin" ? "bg-amber-100 text-amber-800" : "bg-red-101 text-red-800"
                                  }`}>
                                    {h.status}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-right text-slate-400">Presensi Terkonfirmasi</td>
                              </tr>
                            ))}
                            {myAttendanceHistory.length === 0 && (
                              <tr>
                                <td colSpan={4} className="px-4 py-8 text-center text-slate-400 italic">Belum ada pencatatan kehadiran semester terdaftar.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* Tab 4: Catatan Pancasila */}
              {activeTab === "character" && (
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6 text-left font-sans select-none">
                  <div className="border-b pb-3">
                    <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 font-display">
                      <Heart className="w-4.5 h-4.5 text-red-650" />
                      Buku Karakter Disiplin Positif (Profil Pelajar Pancasila)
                    </h2>
                    <p className="text-xs text-slate-500 font-sans mt-0.5">Catatan perkembangan profil karakter Pancasila siswa. Guru menggunakan log ini untuk membina perilaku moral positif siswa secara berkelanjutan.</p>
                  </div>

                  <div className="space-y-4 font-sans leading-relaxed">
                    {myCharacterLogs.map((log) => (
                      <div 
                        key={log.id} 
                        className={`p-4 rounded-xl border text-xs space-y-2 text-left font-sans ${
                          log.behaviorType === "Positif" 
                            ? "bg-emerald-50/55 border-emerald-200 text-emerald-900" 
                            : "bg-red-50/40 border-red-200 text-red-900"
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold font-sans border-b pb-1">
                          <span className={log.behaviorType === "Positif" ? "text-emerald-800" : "text-red-800"}>
                            {log.behaviorType === "Positif" ? "🌟 APRESIASI DAN TELADAN POSITIF" : "⚠️ EVALUASI SIKAP & PERILAKU"}
                          </span>
                          <span>Tanggal: {log.date}</span>
                        </div>

                        <div className="space-y-1.5 text-[11px] text-slate-705">
                          <p>
                            <strong>Deskripsi Kejadian:</strong> {log.behaviorDescription}
                          </p>
                          <p>
                            <strong>Tindak Lanjut / Saran Guru:</strong> <span className="font-semibold text-slate-800">{log.followUp}</span>
                          </p>
                        </div>
                      </div>
                    ))}

                    {myCharacterLogs.length === 0 && (
                      <div className="p-12 text-center text-slate-400 border border-dashed rounded-xl space-y-1">
                        <Smile className="w-10 h-10 text-slate-300 mx-auto" />
                        <h4 className="text-xs font-bold text-slate-600 block">Belum Ada Kejadian Karakter Tercatat</h4>
                        <p className="text-[10.5px] text-slate-400 max-w-sm mx-auto">Sangat luar biasa! Tidak ada perilaku indisipliner tercatat dan seluruh pembinaan berada pada jalur kondusif.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          )}

        </main>
      </div>
    </div>
  );
};
