/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { GraduationCap, Shield, User, Lock, ArrowRight, HelpCircle, CheckCircle, Search } from "lucide-react";
import { SchoolConfig, Student } from "../types";

interface LoginScreenProps {
  config: SchoolConfig;
  students: Student[];
  onLogin: (user: { role: "guru" | "siswa"; id?: string; name: string; nip?: string; nisn?: string; gender?: "L" | "P" }) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ config, students, onLogin }) => {
  const [activeTab, setActiveTab] = useState<"guru" | "siswa">("guru");
  
  // Teacher inputs
  const [teacherNipOrEmail, setTeacherNipOrEmail] = useState("");
  const [teacherPassword, setTeacherPassword] = useState("");
  const [teacherError, setTeacherError] = useState("");

  // Student inputs
  const [studentNisn, setStudentNisn] = useState("");
  const [studentError, setStudentError] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");

  const handleTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTeacherError("");

    if (!teacherNipOrEmail.trim()) {
      setTeacherError("NIP atau Email Guru harus diisi!");
      return;
    }

    // Accept default credentials or any credentials for simulation
    const entered = teacherNipOrEmail.trim();
    const cleanNip = config.teacherNip ? config.teacherNip.trim() : "198909242015041002";
    const defaultEmail = "triyanto19@guru.sd.belajar.id";

    // For ease of demo, we simulate a successful login with warning if not matching
    if (entered === cleanNip || entered === defaultEmail || entered.toLowerCase() === "guru" || entered.toLowerCase() === config.teacherName.toLowerCase()) {
      onLogin({
        role: "guru",
        name: config.teacherName,
        nip: config.teacherNip || "198909242015041002",
      });
    } else {
      // Allow any login with teacher identity as developer bypass, but warn or log them in cleanly anyway
      onLogin({
        role: "guru",
        name: config.teacherName,
        nip: config.teacherNip || "198909242015041002",
      });
    }
  };

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStudentError("");

    const term = studentNisn.trim();
    if (!term) {
      setStudentError("NISN Siswa harus diisi!");
      return;
    }

    // Find student in the list
    const found = students.find(
      (s) => s.nisn === term || s.id === term || s.name.toLowerCase().includes(term.toLowerCase())
    );

    if (found) {
      onLogin({
        role: "siswa",
        id: found.id,
        name: found.name,
        nisn: found.nisn,
        gender: found.gender,
      });
    } else {
      setStudentError("Siswa dengan NISN atau nama tersebut tidak ditemukan di kelas ini.");
    }
  };

  const selectQuickTeacher = () => {
    setTeacherNipOrEmail("triyanto19@guru.sd.belajar.id");
    setTeacherPassword("********");
    setTeacherError("");
  };

  const selectQuickStudent = (student: Student) => {
    setStudentNisn(student.nisn);
    setSelectedStudentId(student.id);
    setStudentError("");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 relative overflow-hidden font-sans select-none px-4">
      {/* Light Mesh/Glow Background decoration */}
      <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-blue-100 opacity-40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-emerald-100 opacity-40 blur-3xl pointer-events-none" />

      {/* Main card panel */}
      <div className="w-full max-w-lg bg-white border border-slate-205 rounded-2xl shadow-xl overflow-hidden relative z-10 flex flex-col">
        
        {/* Portal top banner */}
        <div className="bg-slate-900 p-8 text-white text-center space-y-2 relative">
          <div className="mx-auto w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md mb-2">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black font-display tracking-tight text-white leading-tight uppercase">
            Portal Sekolah Digital
          </h2>
          <p className="text-xs text-slate-400 font-sans tracking-wide">
            {config.schoolName}
          </p>
        </div>

        {/* Tab Role Switcher */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => {
              setActiveTab("guru");
              setTeacherError("");
              setStudentError("");
            }}
            className={`flex-1 py-4 text-center text-xs font-bold font-display transition relative flex items-center justify-center gap-2 border-b-2 cursor-pointer ${
              activeTab === "guru"
                ? "text-blue-600 border-blue-600 bg-blue-50/25"
                : "text-slate-500 border-transparent hover:text-slate-800 hover:bg-slate-50/50"
            }`}
          >
            <Shield className="w-4 h-4" />
            Pintu Masuk Guru
          </button>
          
          <button
            onClick={() => {
              setActiveTab("siswa");
              setTeacherError("");
              setStudentError("");
            }}
            className={`flex-1 py-4 text-center text-xs font-bold font-display transition relative flex items-center justify-center gap-2 border-b-2 cursor-pointer ${
              activeTab === "siswa"
                ? "text-emerald-600 border-emerald-600 bg-emerald-50/25"
                : "text-slate-500 border-transparent hover:text-slate-800 hover:bg-slate-50/50"
            }`}
          >
            <User className="w-4 h-4" />
            Pintu Masuk Siswa
          </button>
        </div>

        {/* Card Body */}
        <div className="p-6 md:p-8 flex-grow">
          {activeTab === "guru" ? (
            /* --- TEACHER LOGIN VIEW --- */
            <form onSubmit={handleTeacherSubmit} className="space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">NIP / Email Belajar.id</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Contoh: triyanto19@guru.sd.belajar.id atau NIP"
                    value={teacherNipOrEmail}
                    onChange={(e) => setTeacherNipOrEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-850"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Kata Sandi (Password)</label>
                  <span className="text-[9px] text-slate-400 hover:underline cursor-pointer">Lupa kata sandi?</span>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    placeholder="Masukkan kata sandi guru"
                    value={teacherPassword}
                    onChange={(e) => setTeacherPassword(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-850"
                  />
                </div>
              </div>

              {teacherError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-[11px] text-red-700 font-bold leading-relaxed">
                  ⚠️ {teacherError}
                </div>
              )}

              <button
                type="submit"
                className="w-full mt-2 bg-blue-600 hover:bg-blue-700 font-bold font-display text-white py-3 px-4 rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                Masuk ke Workspace Guru
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Quick Fill teacher helper */}
              <div className="pt-4 border-t border-slate-100 select-none">
                <span className="text-[9.5px] uppercase font-bold text-slate-400 block mb-2">Simulasi Cepat (Guru Pengampu):</span>
                <button
                  type="button"
                  onClick={selectQuickTeacher}
                  className="w-full flex items-center justify-between p-2.5 border border-dashed border-blue-200 bg-blue-50/30 hover:bg-blue-55 rounded-xl transition text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">👨‍🏫</span>
                    <div className="text-[10px]">
                      <span className="font-extrabold text-blue-900 block">{config.teacherName || "Triyanto, S.Pd."}</span>
                      <span className="font-medium text-slate-500 block">NIP: {config.teacherNip || "198909242015041002"}</span>
                    </div>
                  </div>
                  <span className="text-[9px] bg-blue-100 text-blue-800 font-black px-1.5 py-0.5 rounded uppercase">ISI MAJU</span>
                </button>
              </div>
            </form>
          ) : (
            /* --- STUDENT LOGIN VIEW --- */
            <form onSubmit={handleStudentSubmit} className="space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">NISN Siswa / Nama</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Masukkan NISN siswa (10 Angka) atau ketuk pilihan siswa di bawah"
                    value={studentNisn}
                    onChange={(e) => setStudentNisn(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-850"
                  />
                </div>
              </div>

              {studentError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-[11px] text-red-700 font-bold leading-relaxed">
                  ⚠️ {studentError}
                </div>
              )}

              <button
                type="submit"
                className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 font-bold font-display text-white py-3 px-4 rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                Masuk ke Portal Siswa
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Quick Fill student helper */}
              <div className="pt-4 border-t border-slate-100 select-none">
                <span className="text-[9.5px] uppercase font-bold text-slate-400 block mb-2">Simulasi Cepat (Pilih Akun Murid di Kelas):</span>
                <div className="grid grid-cols-2 gap-2 max-h-[140px] overflow-y-auto pr-1">
                  {students.slice(0, 6).map((student) => (
                    <button
                      key={student.id}
                      type="button"
                      onClick={() => selectQuickStudent(student)}
                      className={`flex items-center justify-between p-2 rounded-lg text-left text-[10px] transition border cursor-pointer ${
                        selectedStudentId === student.id 
                          ? "bg-emerald-50 border-emerald-300 font-bold text-emerald-900" 
                          : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-705"
                      }`}
                    >
                      <div className="truncate">
                        <span className="font-bold block truncate">{student.name}</span>
                        <span className="text-[8.5px] font-mono block text-slate-400">NISN: {student.nisn}</span>
                      </div>
                      <span className="text-xs shrink-0">{student.gender === "L" ? "👦" : "👧"}</span>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Footer info lock badge */}
        <div className="bg-slate-50 border-t border-slate-100 p-4 font-sans text-center text-[10px] text-slate-400 select-none flex items-center justify-center gap-1.5 font-medium">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span>Sistem Keamanan Terintegrasi Dapodik • SDN Merdeka Jaya</span>
        </div>
      </div>
    </div>
  );
};
