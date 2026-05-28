/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  initialSchoolConfig, initialCalendarWeeks, initialStudents, 
  initialAtpList, initialAttendance, initialJournals, initialCaseLogs, initialGrades, sampleModulAjar 
} from "./mockData";
import { SchoolConfig, CalendarWeek, AlurTujuanPembelajaran, Student, DailyAttendance, TeachingJournal, CaseLog, StudentGrade, ModulAjar, TeacherProfile } from "./types";
import { PlanningModule } from "./components/PlanningModule";
import { ExecutionModule } from "./components/ExecutionModule";
import { AssessmentModule } from "./components/AssessmentModule";
import { AiAsesmenModule } from "./components/AiAsesmenModule";
import { SettingsModule } from "./components/SettingsModule";
import { LoginScreen } from "./components/LoginScreen";
import { StudentPortal } from "./components/StudentPortal";

import { 
  GraduationCap, LayoutDashboard, FileText, CheckSquare, 
  ClipboardList, Award, Sparkles, LogOut, ChevronRight, HelpCircle, AlertCircle, BookOpen,
  Trash2, Plus, Copy, Settings, FolderHeart, Users
} from "lucide-react";

export default function App() {
  // 0. Active User Authentication State
  const [currentUser, setCurrentUser] = useState<any>(() => {
    const cached = localStorage.getItem("sg_current_user");
    return cached ? JSON.parse(cached) : null;
  });

  const handleLogin = (user: { role: "guru" | "siswa"; id?: string; name: string; nip?: string; nisn?: string; gender?: "L" | "P" }) => {
    setCurrentUser(user);
    localStorage.setItem("sg_current_user", JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("sg_current_user");
  };

  // --- MULTI-PROFILE STATE MANAGEMENT ---
  const [profiles, setProfiles] = useState<TeacherProfile[]>(() => {
    const cached = localStorage.getItem("sg_profiles");
    return cached ? JSON.parse(cached) : [{ 
      id: "default", 
      name: "Kelas 5 - Ilmu Pengetahuan Alam dan Sosial (IPAS)", 
      grade: "Kelas 5", 
      subject: "Ilmu Pengetahuan Alam dan Sosial (IPAS)" 
    }];
  });

  const [activeProfileId, setActiveProfileId] = useState<string>(() => {
    const cached = localStorage.getItem("sg_active_profile_id");
    return cached ? cached : "default";
  });

  // 1. Unified State Management (Single Source of Truth)
  const [config, setConfig] = useState<SchoolConfig>(() => {
    const activeId = localStorage.getItem("sg_active_profile_id") || "default";
    const cached = localStorage.getItem(activeId === "default" ? "sg_school_config" : `sg_profile_${activeId}_school_config`);
    return cached ? JSON.parse(cached) : initialSchoolConfig;
  });

  const [weeks, setWeeks] = useState<CalendarWeek[]>(() => {
    const activeId = localStorage.getItem("sg_active_profile_id") || "default";
    const cached = localStorage.getItem(activeId === "default" ? "sg_calendar_weeks" : `sg_profile_${activeId}_calendar_weeks`);
    return cached ? JSON.parse(cached) : initialCalendarWeeks;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const activeId = localStorage.getItem("sg_active_profile_id") || "default";
    const cached = localStorage.getItem(activeId === "default" ? "sg_students" : `sg_profile_${activeId}_students`);
    return cached ? JSON.parse(cached) : initialStudents;
  });

  const [atpList, setAtpList] = useState<AlurTujuanPembelajaran[]>(() => {
    const activeId = localStorage.getItem("sg_active_profile_id") || "default";
    const cached = localStorage.getItem(activeId === "default" ? "sg_atp_list" : `sg_profile_${activeId}_atp_list`);
    return cached ? JSON.parse(cached) : initialAtpList;
  });

  const [attendanceList, setAttendanceList] = useState<DailyAttendance[]>(() => {
    const activeId = localStorage.getItem("sg_active_profile_id") || "default";
    const cached = localStorage.getItem(activeId === "default" ? "sg_attendance_list" : `sg_profile_${activeId}_attendance_list`);
    return cached ? JSON.parse(cached) : initialAttendance;
  });

  const [journals, setJournals] = useState<TeachingJournal[]>(() => {
    const activeId = localStorage.getItem("sg_active_profile_id") || "default";
    const cached = localStorage.getItem(activeId === "default" ? "sg_journals" : `sg_profile_${activeId}_journals`);
    return cached ? JSON.parse(cached) : initialJournals;
  });

  const [caseLogs, setCaseLogs] = useState<CaseLog[]>(() => {
    const activeId = localStorage.getItem("sg_active_profile_id") || "default";
    const cached = localStorage.getItem(activeId === "default" ? "sg_case_logs" : `sg_profile_${activeId}_case_logs`);
    return cached ? JSON.parse(cached) : initialCaseLogs;
  });

  const [grades, setGrades] = useState<StudentGrade[]>(() => {
    const activeId = localStorage.getItem("sg_active_profile_id") || "default";
    const cached = localStorage.getItem(activeId === "default" ? "sg_grades" : `sg_profile_${activeId}_grades`);
    return cached ? JSON.parse(cached) : initialGrades;
  });

  const [modulAjarMap, setModulAjarMap] = useState<{ [tpCode: string]: ModulAjar }>(() => {
    const activeId = localStorage.getItem("sg_active_profile_id") || "default";
    const cached = localStorage.getItem(activeId === "default" ? "sg_modul_ajars" : `sg_profile_${activeId}_modul_ajars`);
    return cached ? JSON.parse(cached) : sampleModulAjar;
  });

  // Modal State for profile configurations
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [newGrade, setNewGrade] = useState("Kelas 1");
  const [newSubject, setNewSubject] = useState("Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)");
  const [copyFromId, setCopyFromId] = useState("");

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGrade || !newSubject) {
      alert("Harap lengkapi semua isian formulir.");
      return;
    }

    const nextId = "p_" + Date.now();
    const profileName = `${newGrade} - ${newSubject}`;

    const newProfile: TeacherProfile = {
      id: nextId,
      name: profileName,
      grade: newGrade,
      subject: newSubject
    };

    const detectedPhase = 
      ["Kelas 1", "Kelas 2"].includes(newGrade) ? "A" :
      ["Kelas 3", "Kelas 4"].includes(newGrade) ? "B" :
      ["Kelas 5", "Kelas 6"].includes(newGrade) ? "C" :
      ["Kelas 7", "Kelas 8", "Kelas 9"].includes(newGrade) ? "D" :
      ["Kelas 10"].includes(newGrade) ? "E" : "F";

    const targetConfig: SchoolConfig = {
      ...config,
      grade: newGrade,
      subject: newSubject,
      phase: detectedPhase as any,
      weeklyJp: 3
    };

    localStorage.setItem(`sg_profile_${nextId}_school_config`, JSON.stringify(targetConfig));

    let copiedStudents = initialStudents;
    let copiedGrades = initialGrades;

    if (copyFromId && copyFromId !== "") {
      const sourceKey = copyFromId === "default" ? "sg_students" : `sg_profile_${copyFromId}_students`;
      const cached = localStorage.getItem(sourceKey);
      if (cached) {
        copiedStudents = JSON.parse(cached);
      }
      
      const gradeSourceKey = copyFromId === "default" ? "sg_grades" : `sg_profile_${copyFromId}_grades`;
      const cachedGrades = localStorage.getItem(gradeSourceKey);
      if (cachedGrades) {
        copiedGrades = JSON.parse(cachedGrades);
      } else {
        copiedGrades = copiedStudents.map(s => ({
          studentId: s.id,
          formativeGrades: {},
          midtermGrade: 0,
          finalGrade: 0
        }));
      }
    }

    localStorage.setItem(`sg_profile_${nextId}_students`, JSON.stringify(copiedStudents));
    localStorage.setItem(`sg_profile_${nextId}_grades`, JSON.stringify(copiedGrades));
    localStorage.setItem(`sg_profile_${nextId}_calendar_weeks`, JSON.stringify(initialCalendarWeeks));
    localStorage.setItem(`sg_profile_${nextId}_atp_list`, JSON.stringify([]));
    localStorage.setItem(`sg_profile_${nextId}_attendance_list`, JSON.stringify([]));
    localStorage.setItem(`sg_profile_${nextId}_journals`, JSON.stringify([]));
    localStorage.setItem(`sg_profile_${nextId}_case_logs`, JSON.stringify([]));
    localStorage.setItem(`sg_profile_${nextId}_modul_ajars`, JSON.stringify({}));

    setProfiles(prev => [...prev, newProfile]);
    setNewGrade("Kelas 1");
    setNewSubject("Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)");
    setCopyFromId("");
    setShowProfileModal(false);
    
    // Force immediate transition
    setTimeout(() => {
      handleSwitchProfile(nextId);
    }, 50);
  };

  const handleDeleteProfile = (profileId: string) => {
    if (profiles.length <= 1) {
      alert("Anda harus menyisakan minimal satu profil kelas & mapel aktif.");
      return;
    }
    if (confirm("Apakah Anda yakin ingin menghapus profil kelas & mapel ini beserta seluruh data jurnal, nilai, dan absensi di dalamnya? Tindakan ini tidak dapat dibatalkan.")) {
      const remaining = profiles.filter(p => p.id !== profileId);
      setProfiles(remaining);
      
      localStorage.removeItem(`sg_profile_${profileId}_school_config`);
      localStorage.removeItem(`sg_profile_${profileId}_calendar_weeks`);
      localStorage.removeItem(`sg_profile_${profileId}_students`);
      localStorage.removeItem(`sg_profile_${profileId}_atp_list`);
      localStorage.removeItem(`sg_profile_${profileId}_attendance_list`);
      localStorage.removeItem(`sg_profile_${profileId}_journals`);
      localStorage.removeItem(`sg_profile_${profileId}_case_logs`);
      localStorage.removeItem(`sg_profile_${profileId}_grades`);
      localStorage.removeItem(`sg_profile_${profileId}_modul_ajars`);

      if (activeProfileId === profileId) {
        handleSwitchProfile(remaining[0].id);
      }
    }
  };

  // Switch profile handler
  const handleSwitchProfile = (targetProfileId: string) => {
    localStorage.setItem("sg_active_profile_id", targetProfileId);
    
    const configKey = targetProfileId === "default" ? "sg_school_config" : `sg_profile_${targetProfileId}_school_config`;
    const cachedConfig = localStorage.getItem(configKey);
    const targetConfig = cachedConfig ? JSON.parse(cachedConfig) : { 
      ...initialSchoolConfig, 
      grade: profiles.find(p => p.id === targetProfileId)?.grade || "Kelas 5",
      subject: profiles.find(p => p.id === targetProfileId)?.subject || "PJOK"
    };
    
    const weeksKey = targetProfileId === "default" ? "sg_calendar_weeks" : `sg_profile_${targetProfileId}_calendar_weeks`;
    const cachedWeeks = localStorage.getItem(weeksKey);
    const targetWeeks = cachedWeeks ? JSON.parse(cachedWeeks) : initialCalendarWeeks;
    
    const studentsKey = targetProfileId === "default" ? "sg_students" : `sg_profile_${targetProfileId}_students`;
    const cachedStudents = localStorage.getItem(studentsKey);
    const targetStudents = cachedStudents ? JSON.parse(cachedStudents) : initialStudents;
    
    const atpKey = targetProfileId === "default" ? "sg_atp_list" : `sg_profile_${targetProfileId}_atp_list`;
    const cachedAtp = localStorage.getItem(atpKey);
    const targetAtp = cachedAtp ? JSON.parse(cachedAtp) : []; 
    
    const attendanceKey = targetProfileId === "default" ? "sg_attendance_list" : `sg_profile_${targetProfileId}_attendance_list`;
    const cachedAttendance = localStorage.getItem(attendanceKey);
    const targetAttendance = cachedAttendance ? JSON.parse(cachedAttendance) : [];
    
    const journalsKey = targetProfileId === "default" ? "sg_journals" : `sg_profile_${targetProfileId}_journals`;
    const cachedJournals = localStorage.getItem(journalsKey);
    const targetJournals = cachedJournals ? JSON.parse(cachedJournals) : [];
    
    const caseLogsKey = targetProfileId === "default" ? "sg_case_logs" : `sg_profile_${targetProfileId}_case_logs`;
    const cachedCaseLogs = localStorage.getItem(caseLogsKey);
    const targetCaseLogs = cachedCaseLogs ? JSON.parse(cachedCaseLogs) : [];
    
    const gradesKey = targetProfileId === "default" ? "sg_grades" : `sg_profile_${targetProfileId}_grades`;
    const cachedGrades = localStorage.getItem(gradesKey);
    const targetGrades = cachedGrades ? JSON.parse(cachedGrades) : targetStudents.map(s => ({
      studentId: s.id,
      formativeGrades: {},
      midtermGrade: 0,
      finalGrade: 0
    }));
    
    const modulKey = targetProfileId === "default" ? "sg_modul_ajars" : `sg_profile_${targetProfileId}_modul_ajars`;
    const cachedModul = localStorage.getItem(modulKey);
    const targetModul = cachedModul ? JSON.parse(cachedModul) : {};

    setActiveProfileId(targetProfileId);
    setConfig(targetConfig);
    setWeeks(targetWeeks);
    setStudents(targetStudents);
    setAtpList(targetAtp);
    setAttendanceList(targetAttendance);
    setJournals(targetJournals);
    setCaseLogs(targetCaseLogs);
    setGrades(targetGrades);
    setModulAjarMap(targetModul);
  };

  // --- PERSISTENCE EFFECT MONITORS ---
  useEffect(() => {
    localStorage.setItem("sg_profiles", JSON.stringify(profiles));
    localStorage.setItem("sg_active_profile_id", activeProfileId);
  }, [profiles, activeProfileId]);

  useEffect(() => {
    const key = activeProfileId === "default" ? "sg_school_config" : `sg_profile_${activeProfileId}_school_config`;
    localStorage.setItem(key, JSON.stringify(config));
    
    // Auto sync names
    setProfiles(prev => prev.map(p => {
      if (p.id === activeProfileId) {
        return { 
          ...p, 
          name: `${config.grade} - ${config.subject}`,
          grade: config.grade,
          subject: config.subject
        };
      }
      return p;
    }));
  }, [config, activeProfileId]);

  useEffect(() => {
    const key = activeProfileId === "default" ? "sg_calendar_weeks" : `sg_profile_${activeProfileId}_calendar_weeks`;
    localStorage.setItem(key, JSON.stringify(weeks));
  }, [weeks, activeProfileId]);

  useEffect(() => {
    const key = activeProfileId === "default" ? "sg_students" : `sg_profile_${activeProfileId}_students`;
    localStorage.setItem(key, JSON.stringify(students));
  }, [students, activeProfileId]);

  useEffect(() => {
    const key = activeProfileId === "default" ? "sg_atp_list" : `sg_profile_${activeProfileId}_atp_list`;
    localStorage.setItem(key, JSON.stringify(atpList));
  }, [atpList, activeProfileId]);

  useEffect(() => {
    const key = activeProfileId === "default" ? "sg_attendance_list" : `sg_profile_${activeProfileId}_attendance_list`;
    localStorage.setItem(key, JSON.stringify(attendanceList));
  }, [attendanceList, activeProfileId]);

  useEffect(() => {
    const key = activeProfileId === "default" ? "sg_journals" : `sg_profile_${activeProfileId}_journals`;
    localStorage.setItem(key, JSON.stringify(journals));
  }, [journals, activeProfileId]);

  useEffect(() => {
    const key = activeProfileId === "default" ? "sg_case_logs" : `sg_profile_${activeProfileId}_case_logs`;
    localStorage.setItem(key, JSON.stringify(caseLogs));
  }, [caseLogs, activeProfileId]);

  useEffect(() => {
    const key = activeProfileId === "default" ? "sg_grades" : `sg_profile_${activeProfileId}_grades`;
    localStorage.setItem(key, JSON.stringify(grades));
  }, [grades, activeProfileId]);

  useEffect(() => {
    const key = activeProfileId === "default" ? "sg_modul_ajars" : `sg_profile_${activeProfileId}_modul_ajars`;
    localStorage.setItem(key, JSON.stringify(modulAjarMap));
  }, [modulAjarMap, activeProfileId]);

  // Main navigation tab control
  const [activeTab, setActiveTab] = useState<"dashboard" | "planning" | "execution" | "assessment" | "ai_assess" | "settings">("dashboard");

  // Core Statistics calculator
  const totalStudents = students.length;
  const effectiveWeeks = weeks.filter(w => w.isEffective).length;
  const totalJp = effectiveWeeks * config.weeklyJp;

  // Real-time student average score stats for chart representation
  const getOverallGradesStat = () => {
    let tuntasCount = 0;
    let remedialCount = 0;
    let totalScoreSum = 0;

    students.forEach(s => {
      const studentGrade = grades.find(g => g.studentId === s.id);
      if (studentGrade) {
        const fVals: number[] = Object.values(studentGrade.formativeGrades) as number[];
        const avgFormative: number = fVals.length > 0 
          ? (fVals.reduce((sum: number, v: number) => sum + Number(v || 0), 0) / fVals.length) 
          : 0;
        let finalScore: number = fVals.length > 0
          ? (avgFormative + Number(studentGrade.midtermGrade || 0) + Number(studentGrade.finalGrade || 0)) / 3
          : (Number(studentGrade.midtermGrade || 0) + Number(studentGrade.finalGrade || 0)) / 2;

        if (studentGrade.remedialScore && studentGrade.remedialScore > finalScore) {
          finalScore = studentGrade.remedialScore;
        }

        totalScoreSum += finalScore;
        if (finalScore >= config.kktp) {
          tuntasCount++;
        } else {
          remedialCount++;
        }
      }
    });

    const averageGrade = totalStudents > 0 ? Math.round(totalScoreSum / totalStudents) : 0;

    return { tuntasCount, remedialCount, averageGrade };
  };

  const gradeStats = getOverallGradesStat();

  // Guard routing based on authenticated user role
  if (!currentUser) {
    return <LoginScreen config={config} students={students} onLogin={handleLogin} />;
  }

  if (currentUser.role === "siswa") {
    return (
      <StudentPortal
        currentUser={currentUser}
        config={config}
        atpList={atpList}
        grades={grades}
        attendanceList={attendanceList}
        caseLogs={caseLogs}
        modulAjarMap={modulAjarMap}
        onLogout={handleLogout}
      />
    );
  }

  // Reset demo defaults handler
  const handleResetDemoData = () => {
    if (confirm("Apakah Anda yakin ingin mengatur ulang data aplikasi ke setelan bawaan demo IPAS Kelas 5?")) {
      localStorage.clear();
      setConfig(initialSchoolConfig);
      setWeeks(initialCalendarWeeks);
      setStudents(initialStudents);
      setAtpList(initialAtpList);
      setAttendanceList(initialAttendance);
      setJournals(initialJournals);
      setCaseLogs(initialCaseLogs);
      setGrades(initialGrades);
      setModulAjarMap(sampleModulAjar);
      setActiveTab("dashboard");
    }
  };

  return (
    <div className="flex h-screen bg-[#fafafc] font-sans text-slate-800 overflow-hidden">
      
      {/* 🚀 Desktop Left Sidebar */}
      <aside className="w-64 bg-white text-slate-800 flex flex-col flex-shrink-0 select-none border-r border-slate-200/85 z-10 hidden md:flex">
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-200/80 flex items-center space-x-3">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="block font-display font-extrabold text-slate-900 text-sm tracking-wide">SMART-GURU</span>
            <span className="block text-[9px] text-blue-600 font-mono font-black tracking-wider uppercase">Admin Panel</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-grow p-4 space-y-1.5 overflow-y-auto">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center px-4 py-2.5 rounded-xl text-left text-xs font-semibold transition ${
              activeTab === "dashboard" ? "bg-blue-50 text-blue-700 font-bold border border-blue-100/50 shadow-[0_1px_2px_rgba(30,41,59,0.02)]" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent"
            }`}
            id="tab-btn-dashboard"
          >
            <LayoutDashboard className={`w-4 h-4 mr-3 ${activeTab === 'dashboard' ? 'text-blue-600' : 'text-slate-400'}`} />
            Dashboard Utama
          </button>

          <button
            onClick={() => setActiveTab("planning")}
            className={`w-full flex items-center px-4 py-2.5 rounded-xl text-left text-xs font-semibold transition ${
              activeTab === "planning" ? "bg-blue-50 text-blue-700 font-bold border border-blue-100/50 shadow-[0_1px_2px_rgba(30,41,59,0.02)]" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent"
            }`}
            id="tab-btn-planning"
          >
            <FileText className={`w-4 h-4 mr-3 ${activeTab === 'planning' ? 'text-blue-600' : 'text-slate-400'}`} />
            Modul 1: Perencanaan
          </button>

          <button
            onClick={() => setActiveTab("execution")}
            className={`w-full flex items-center px-4 py-2.5 rounded-xl text-left text-xs font-semibold transition ${
              activeTab === "execution" ? "bg-blue-50 text-blue-700 font-bold border border-blue-100/50 shadow-[0_1px_2px_rgba(30,41,59,0.02)]" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent"
            }`}
            id="tab-btn-execution"
          >
            <CheckSquare className={`w-4 h-4 mr-3 ${activeTab === 'execution' ? 'text-blue-600' : 'text-slate-400'}`} />
            Modul 2: Pelaksanaan
          </button>

          <button
            onClick={() => setActiveTab("assessment")}
            className={`w-full flex items-center px-4 py-2.5 rounded-xl text-left text-xs font-semibold transition ${
              activeTab === "assessment" ? "bg-blue-50 text-blue-700 font-bold border border-blue-100/50 shadow-[0_1px_2px_rgba(30,41,59,0.02)]" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent"
            }`}
            id="tab-btn-assessment"
          >
            <ClipboardList className={`w-4 h-4 mr-3 ${activeTab === 'assessment' ? 'text-blue-600' : 'text-slate-400'}`} />
            Modul 3: Buku Nilai
          </button>

          <button
            onClick={() => setActiveTab("ai_assess")}
            className={`w-full flex items-center px-4 py-2.5 rounded-xl text-left text-xs font-semibold transition ${
              activeTab === "ai_assess" ? "bg-blue-50 text-blue-700 font-bold border border-blue-100/50 shadow-[0_1px_2px_rgba(30,41,59,0.02)]" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent"
            }`}
            id="tab-btn-ai_assess"
          >
            <Sparkles className={`w-4 h-4 mr-3 ${activeTab === 'ai_assess' ? 'text-blue-600' : 'text-slate-400'}`} />
            Modul 3: AI Asesmen
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`w-full flex items-center px-4 py-2.5 rounded-xl text-left text-xs font-semibold transition ${
              activeTab === "settings" ? "bg-blue-50 text-blue-700 font-bold border border-blue-100/50 shadow-[0_1px_2px_rgba(30,41,59,0.02)]" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent"
            }`}
            id="tab-btn-settings"
          >
            <Settings className={`w-4 h-4 mr-3 ${activeTab === 'settings' ? 'text-blue-600' : 'text-slate-400'}`} />
            Setelan Utama
          </button>
        </nav>

        {/* Reset Demo and Logout buttons at footer */}
        <div className="p-4 border-t border-slate-200/80 space-y-2">
          <button
            onClick={handleResetDemoData}
            className="w-full flex items-center justify-center p-2 rounded-lg text-[10px] uppercase font-bold tracking-wider text-red-650 border border-dashed border-red-200 bg-red-50/45 hover:bg-red-50 hover:border-red-300 transition duration-150 cursor-pointer"
          >
            Reset Setelan Demo
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center p-2 rounded-lg text-[10px] uppercase font-bold tracking-wider text-slate-500 border border-slate-200 hover:bg-slate-50 hover:text-slate-800 transition duration-155 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 mr-1.5" />
            Keluar (Log Out)
          </button>
        </div>
      </aside>

      {/* 🚀 Main Workspace Area */}
      <div className="flex-grow flex flex-col overflow-hidden">
           {/* Sticky top layout header */}
        <header className="bg-white border-b border-slate-205 h-16 flex items-center justify-between px-6 flex-shrink-0">
          {/* Brand header for mobile layout */}
          <div className="flex items-center space-x-3 md:hidden">
            <GraduationCap className="w-5 h-5 text-blue-650" />
            <span className="font-extrabold font-display text-sm tracking-wide select-none text-slate-900">SMART-GURU</span>
          </div>

          {/* Active Class & Subject Dynamic Selector */}
          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200/80 rounded-xl px-2.5 py-1 shadow-xs max-w-[280px] sm:max-w-[420px] truncate select-none">
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Kelas & Mapel Aktif</span>
              <div className="flex items-center space-x-1 mt-0.5">
                <select
                  value={activeProfileId}
                  onChange={e => handleSwitchProfile(e.target.value)}
                  className="font-display font-bold text-slate-850 bg-transparent py-0.5 pr-5 pl-0 border-none outline-none focus:ring-0 text-xs cursor-pointer select-none truncate focus:outline-none focus:border-none"
                  title="Pilih Kelas & Mata Pelajaran"
                >
                  {profiles.map(p => (
                    <option key={p.id} value={p.id} className="text-slate-800 font-sans font-normal text-xs">
                      {p.grade} — {p.subject}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <button
              onClick={() => setShowProfileModal(true)}
              className="p-1.5 hover:bg-slate-200/70 rounded-lg text-slate-500 hover:text-slate-800 transition flex items-center shrink-0 cursor-pointer ml-1"
              title="Kelola Banyak Kelas & Mapel"
            >
              <Settings className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>

          {/* Active School Credentials tag */}
          <div className="flex items-center space-x-4 select-none">
            <div className="text-right hidden sm:block">
              <span className="block text-xs font-bold text-slate-900 font-display leading-none">{config.teacherName}</span>
              <span className="text-[10px] text-slate-405 font-mono mt-1 block">NIP: {config.teacherNip || "-"}</span>
            </div>
            
            <button 
              onClick={handleLogout}
              className="w-9 h-9 rounded-full bg-red-50/80 hover:bg-red-100 flex items-center justify-center border border-red-200 text-red-650 font-bold text-xs select-none cursor-pointer transition"
              title="Klik untuk Keluar"
            >
              <LogOut className="w-4 h-4 text-red-600" />
            </button>
          </div>
        </header>

        {/* Tab selector for Mobile layout specifically */}
        <div className="bg-[#1e293b] text-slate-400 p-2 flex items-center justify-start gap-2 overflow-x-auto text-[10px] uppercase font-bold border-b border-slate-700 md:hidden z-10 select-none scrollbar-none">
          <button onClick={() => setActiveTab("dashboard")} className={`p-1.5 shrink-0 ${activeTab === 'dashboard' ? 'text-blue-305 font-extrabold' : ''}`}>Dashboard</button>
          <button onClick={() => setActiveTab("planning")} className={`p-1.5 shrink-0 ${activeTab === 'planning' ? 'text-blue-305 font-extrabold' : ''}`}>Modul 1</button>
          <button onClick={() => setActiveTab("execution")} className={`p-1.5 shrink-0 ${activeTab === 'execution' ? 'text-blue-305 font-extrabold' : ''}`}>Modul 2</button>
          <button onClick={() => setActiveTab("assessment")} className={`p-1.5 shrink-0 ${activeTab === 'assessment' ? 'text-blue-305 font-extrabold' : ''}`}>Buku Nilai</button>
          <button onClick={() => setActiveTab("ai_assess")} className={`p-1.5 shrink-0 ${activeTab === 'ai_assess' ? 'text-blue-305 font-extrabold' : ''}`}>AI Asesmen</button>
          <button onClick={() => setActiveTab("settings")} className={`p-1.5 shrink-0 ${activeTab === 'settings' ? 'text-blue-305 font-extrabold' : ''}`}>Setting</button>
        </div>

        {/* Tab Canvas Content viewport */}
        <main className="flex-grow p-6 overflow-y-auto select-none md:select-text">
          
          {/* View Tab 1: Dashboard Utama Overview */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              
              {/* Hero header greeting and details */}
              <div className="bg-[#0f172a] rounded-xl p-6 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-sm border border-slate-805">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-blue-400">
                    <Sparkles className="w-4 h-4 text-blue-405" />
                    <span className="text-[11px] font-bold uppercase tracking-widest font-mono text-blue-400">Kurikulum Merdeka Keunggulan AI</span>
                  </div>
                  <h1 className="text-xl md:text-2xl font-black font-display tracking-tight text-white leading-tight">
                    Sistem Manajemen Mengajar & Penilaian &ldquo;Smart-Guru Admin&rdquo;
                  </h1>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                    Selamat mengajar, <strong>{config.teacherName}</strong>. Panel ini mensinkronisasi data harian, kalender efektif, perumusan modul ajar berdiferensiasi kognitif, evaluasi kisi soal, hingga asimilasi rapor kementerian dalam sekali klik.
                  </p>
                </div>
                
                <div className="flex-shrink-0 bg-slate-800/60 p-4 rounded-xl border border-slate-700/50 space-y-1.5 text-xs text-slate-300 select-none">
                  <div className="flex justify-between w-48 text-slate-450 font-medium"><span>Sekolah:</span> <span className="font-extrabold text-white truncate text-right w-24">{config.schoolName}</span></div>
                  <div className="flex justify-between w-48 text-slate-450 font-medium"><span>Fase/Kelas:</span> <span className="font-bold text-white">{config.phase} / {config.grade}</span></div>
                  <div className="flex justify-between w-48 text-slate-450 font-medium"><span>Mata Pelajaran:</span> <span className="font-bold text-white truncate text-right w-24">{config.subject}</span></div>
                </div>
              </div>

              {/* Grid 4 Stats indicators boxes */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-50/80 rounded-lg flex items-center justify-center text-blue-600 border border-blue-100/50">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Siswa Terdaftar</span>
                    <span className="text-base font-black text-slate-900 font-mono mt-0.5">{totalStudents} <span className="text-xs text-slate-400 font-bold uppercase font-sans">Siswa</span></span>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex items-center space-x-4">
                  <div className="w-10 h-10 bg-indigo-50/80 rounded-lg flex items-center justify-center text-indigo-650 border border-indigo-100/50">
                    <LayoutDashboard className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Capaian TP (ATP)</span>
                    <span className="text-base font-black text-slate-900 font-mono mt-0.5">{atpList.length} <span className="text-xs text-slate-400 font-bold uppercase font-sans">Target</span></span>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex items-center space-x-4">
                  <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-600 border border-slate-200/50">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Total Jam Belajar</span>
                    <span className="text-base font-black text-slate-900 font-mono mt-0.5">{totalJp} <span className="text-xs text-slate-400 font-bold uppercase font-sans">JP</span></span>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex items-center space-x-4">
                  <div className="w-10 h-10 bg-sky-50 rounded-lg flex items-center justify-center text-sky-600 border border-sky-100/50">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Rerata Kelas</span>
                    <span className="text-base font-black text-slate-900 font-mono mt-0.5">{gradeStats.averageGrade} <span className="text-xs text-slate-400 font-bold uppercase font-sans">Nilai</span></span>
                  </div>
                </div>
              </div>

              {/* Bento charts split detail info */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Visual Chart Area: Score metrics distribution */}
                <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-display">Proporsi Ketercapaian Pembelajaran Siswa</h3>
                      <p className="text-[11px] text-slate-400 mt-1">Distribusi kelulusan murid versus batas KKTP {config.kktp}.</p>
                    </div>
                    <span className="text-[10px] font-mono leading-none font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100">KKTP: {config.kktp}</span>
                  </div>

                  {/* SVG Chart representation */}
                  <div className="flex flex-col space-y-3 pt-2">
                    <div className="flex justify-between text-xs text-slate-700 font-semibold select-none">
                      <span>Tuntas Pembelajaran ( {gradeStats.tuntasCount} Siswa )</span>
                      <span className="text-blue-600 font-bold">{totalStudents > 0 ? Math.round((gradeStats.tuntasCount / totalStudents) * 100) : 0}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden flex shadow-inner">
                      <div 
                        className="bg-blue-600 h-full transition-all duration-1000" 
                        style={{ width: `${totalStudents > 0 ? (gradeStats.tuntasCount / totalStudents) * 100 : 0}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-xs text-slate-700 font-semibold select-none pt-2">
                      <span>Belum Tuntas ( {gradeStats.remedialCount} Siswa )</span>
                      <span className="text-slate-500 font-bold">{totalStudents > 0 ? Math.round((gradeStats.remedialCount / totalStudents) * 100) : 0}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden flex shadow-inner">
                      <div 
                        className="bg-slate-300 h-full transition-all duration-1000" 
                        style={{ width: `${totalStudents > 0 ? (gradeStats.remedialCount / totalStudents) * 100 : 0}%` }}
                      />
                    </div>

                    <div className="bg-blue-50/50 border border-blue-105 p-3 rounded-lg text-[11px] text-slate-600 mt-4 leading-relaxed font-sans">
                      <strong className="text-blue-900 font-semibold">Rekomendasi Diagnostik:</strong> {gradeStats.remedialCount > 0 
                        ? `Terdapat ${gradeStats.remedialCount} siswa di bawah Kriteria Ketercapaian. Buka tab Buku Nilai untuk memproses program remedial asimilasi kelompok secara personal.` 
                        : "Luar biasa! Seluruh peserta didik melampaui batas KKTP secara memuaskan."}
                    </div>
                  </div>
                </div>

                {/* System shortcuts Area */}
                <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm space-y-4 select-none">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-display">Alur Kerja Cepat Administrasi Guru</h3>
                  
                  <div className="space-y-3 text-xs text-slate-707">
                    <button 
                      onClick={() => setActiveTab("planning")}
                      className="w-full flex items-center justify-between p-3 border border-slate-200/80 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition text-left cursor-pointer"
                    >
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-blue-600 mr-3" />
                        <div>
                          <span className="font-bold text-slate-850">Modul 1: Buat RPP+ (Diferensiasi)</span>
                          <p className="text-[10px] text-slate-400 mt-0.5">Automasi draf lengkap siap akreditasi A Word.</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>

                    <button 
                      onClick={() => setActiveTab("execution")}
                      className="w-full flex items-center justify-between p-3 border border-slate-200/80 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition text-left cursor-pointer"
                    >
                      <div className="flex items-center">
                        <CheckSquare className="w-5 h-5 text-indigo-600 mr-3" />
                        <div>
                          <span className="font-bold text-slate-850">Modul 2: Isi Absensi & Jurnal Harian</span>
                          <p className="text-[10px] text-slate-400 mt-0.5">Mencatat presensi digital dan log pencapaian kelas.</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>

                    <button 
                      onClick={() => setActiveTab("assessment")}
                      className="w-full flex items-center justify-between p-3 border border-slate-200/80 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition text-left cursor-pointer"
                    >
                      <div className="flex items-center">
                        <ClipboardList className="w-5 h-5 text-sky-600 mr-3" />
                        <div>
                          <span className="font-bold text-slate-850">Modul 3: Cetak Analisis e-Rapor & PMM</span>
                          <p className="text-[10px] text-slate-400 mt-0.5">Rekap nilai siswa otomatis dan ekspor data CSV.</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* View Tab 2: Planning Module (Modul 1) */}
          {activeTab === "planning" && (
            <PlanningModule 
              config={config} 
              setConfig={setConfig} 
              weeks={weeks} 
              setWeeks={setWeeks}
              atpList={atpList}
              setAtpList={setAtpList}
              modulAjarMap={modulAjarMap}
              setModulAjarMap={setModulAjarMap}
            />
          )}

          {/* View Tab 3: Execution Module (Modul 2) */}
          {activeTab === "execution" && (
            <ExecutionModule 
              config={config}
              weeks={weeks}
              atpList={atpList}
              students={students}
              setStudents={setStudents}
              attendanceList={attendanceList}
              setAttendanceList={setAttendanceList}
              journals={journals}
              setJournals={setJournals}
              caseLogs={caseLogs}
              setCaseLogs={setCaseLogs}
            />
          )}

          {/* View Tab 4: Book/Scores Spreadsheet Module (Modul 3) */}
          {activeTab === "assessment" && (
            <AssessmentModule 
              config={config}
              weeks={weeks}
              atpList={atpList}
              students={students}
              grades={grades}
              setGrades={setGrades}
            />
          )}

          {/* View Tab 5: AI Exam questions / Blueprints & Rubrics */}
          {activeTab === "ai_assess" && (
            <AiAsesmenModule 
              config={config}
              atpList={atpList}
            />
          )}

          {/* View Tab 6: Settings & Signature Management Module */}
          {activeTab === "settings" && (
            <SettingsModule 
              config={config}
              setConfig={setConfig}
            />
          )}

        </main>

        {/* PROFILE CONFIGURATION MODAL (KELOLA KELAS & MAPEL) */}
        {showProfileModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in select-none">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-scale-up">
              
              {/* Header Modal */}
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-150 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FolderHeart className="w-5 h-5 text-blue-600" />
                  <div>
                    <h2 className="text-sm font-black text-slate-900 font-display uppercase tracking-wide">
                      Kelola Banyak Kelas &amp; Mata Pelajaran
                    </h2>
                    <p className="text-[10px] text-slate-500 font-medium">Sistem Penugasan Mengajar Berkelanjutan (Multi-Class &amp; Multi-Subject Assignment) bagi Pendidik</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="p-1 px-2.5 rounded-lg bg-white border border-slate-200 text-slate-500 font-bold hover:text-slate-850 hover:bg-slate-50 text-xs transition cursor-pointer"
                >
                  Tutup
                </button>
              </div>

              {/* Body Modal Scrollable */}
              <div className="p-6 overflow-y-auto space-y-6 flex-grow text-xs text-slate-705">
                
                {/* Alert Context */}
                <div className="bg-amber-50/50 border border-amber-200/70 p-3 rounded-xl flex items-start space-x-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-bold text-amber-900 block font-display">Tingkatkan Fleksibilitas Struktur Mengajar Anda</span>
                    <p className="text-[10.5px] text-slate-600 leading-relaxed text-justify">
                      Fitur ini dirancang khusus untuk mempermudah tugas guru di sekolah dasar dan menengah. Baik bagi <strong>Guru Mapel (PJOK, Agama, dsb.)</strong> yang mendidik Kelas 1 hingga Kelas 6, ataupun <strong>Guru Kelas SD / Tematik</strong> yang mengajar murid yang sama tetapi mencakup seluruh mata pelajaran (Matematika, IPAS, Bahasa Indonesia, dsb.). Setiap profil memisahkan daftar jurnal harian, kalender efektif, alur pencapaian (ATP), rancangan ajar, absensi harian dan rekap kelulusan kognitif siswa secara mandiri demi efisiensi kerja.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 select-text text-left">
                  
                  {/* Column 1: Active Profiles List */}
                  <div className="md:col-span-7 space-y-3">
                    <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] text-blue-600 border-b pb-1.5 flex items-center justify-between select-none">
                      <span>1. Daftar Kelas &amp; Mapel Anda</span>
                      <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-bold font-mono text-[9px]">{profiles.length} Aktif</span>
                    </h3>
                    
                    <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                      {profiles.map(p => (
                        <div
                          key={p.id}
                          className={`p-3 rounded-xl border transition flex items-center justify-between ${
                            activeProfileId === p.id 
                              ? "bg-blue-50/70 border-blue-200/80 shadow-[0_2px_4px_rgba(37,99,235,0.03)]" 
                              : "bg-white border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          <div className="space-y-1 min-w-0 flex-grow pr-3">
                            <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase select-none ${
                                activeProfileId === p.id ? "bg-blue-600 text-white font-mono" : "bg-slate-100 text-slate-500 font-mono"
                              }`}>
                                {p.grade}
                              </span>
                              {activeProfileId === p.id && (
                                <span className="bg-emerald-100 text-emerald-800 text-[8px] font-bold uppercase rounded px-1 tracking-wider select-none">Sedang Aktif</span>
                              )}
                            </div>
                            <span className="block font-bold text-slate-900 truncate text-[11.5px] font-display">{p.subject}</span>
                          </div>

                          <div className="flex items-center space-x-1.5 shrink-0 select-none">
                            {activeProfileId !== p.id && (
                              <button
                                type="button"
                                onClick={() => handleSwitchProfile(p.id)}
                                className="px-2 py-1 bg-white border border-slate-300 rounded-lg text-[10px] text-slate-750 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300 transition font-black shadow-xs cursor-pointer"
                              >
                                Buka
                              </button>
                            )}
                            
                            <button
                              type="button"
                              onClick={() => handleDeleteProfile(p.id)}
                              disabled={profiles.length <= 1}
                              className={`p-1.5 rounded-lg border transition ${
                                profiles.length <= 1 
                                  ? "opacity-30 cursor-not-allowed border-slate-200 text-slate-400" 
                                  : "border-red-100 hover:bg-red-50 text-red-600 hover:border-red-200 hover:text-red-700 cursor-pointer"
                              }`}
                              title="Hapus Kelas & Mapel"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Column 2: Create Profile Form */}
                  <form onSubmit={handleCreateProfile} className="md:col-span-10 lg:col-span-5 bg-slate-50/55 border border-slate-200 rounded-2xl p-4 space-y-4">
                    <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] text-blue-600 border-b pb-1.5 flex items-center select-none">
                      <Plus className="w-3.5 h-3.5 text-blue-605 mr-1" />
                      <span>2. Tambah Kelas / Mapel</span>
                    </h3>

                    {/* Select Grade */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase select-none">Pilih Jenjang / Kelas</label>
                      <select
                        value={newGrade}
                        onChange={e => setNewGrade(e.target.value)}
                        className="w-full text-xs font-semibold text-slate-800 p-2 border border-slate-250 bg-white rounded-lg focus:ring-1 focus:ring-blue-500 outline-none select-none cursor-pointer"
                      >
                        {["Kelas 1", "Kelas 2", "Kelas 3", "Kelas 4", "Kelas 5", "Kelas 6", "Kelas 7", "Kelas 8", "Kelas 9", "Kelas 10", "Kelas 11", "Kelas 12"].map(g => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>

                    {/* Select / Input Subject */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase select-none">Nama Mata Pelajaran</label>
                      <input
                        type="text"
                        required
                        value={newSubject}
                        onChange={e => setNewSubject(e.target.value)}
                        placeholder="Contoh: PJOK, Matematika, IPAS, dsb."
                        className="w-full text-xs font-semibold text-slate-800 p-2 border border-slate-250 bg-white rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                      <div className="flex flex-wrap gap-1 mt-1 justify-start select-none">
                        {["PJOK", "Matematika", "IPAS", "Bahasa Indonesia", "Bahasa Inggris", "Seni Budaya", "Agama Islam"].map(sub => (
                          <button
                            key={sub}
                            type="button"
                            onClick={() => setNewSubject(sub === "PJOK" ? "Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)" : sub)}
                            className="text-[9px] bg-white border border-slate-250 hover:bg-slate-100/80 text-slate-650 px-1.5 py-0.5 rounded font-medium transition cursor-pointer"
                          >
                            {sub}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Copier Option */}
                    <div className="space-y-1 bg-blue-50/40 border border-blue-105 p-2.5 rounded-xl text-left">
                      <div className="flex items-center space-x-1.5 select-none">
                        <Users className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <label className="block text-[10px] font-extrabold text-slate-500 uppercase">Salin Daftar Murid?</label>
                      </div>
                      <p className="text-[9px] text-slate-500 mt-0.5 leading-tight select-none">Secara opsional salin daftar nama siswa dari kelas Anda sebelumnya agar tidak perlu mengulang input data murid.</p>
                      
                      <select
                        value={copyFromId}
                        onChange={e => setCopyFromId(e.target.value)}
                        className="w-full text-[10px] font-bold text-slate-750 p-1.5 border border-slate-200 bg-white rounded-lg focus:ring-1 focus:ring-blue-500 outline-none mt-1.5 cursor-pointer"
                      >
                        <option value="">Jangan Salin (Gunakan draf bawaan 15 siswa)</option>
                        {profiles.map(p => (
                          <option key={p.id} value={p.id}>
                            Salin dari: {p.grade} — {p.subject.substring(0, 15)}...
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-xs hover:shadow-md transition cursor-pointer flex items-center justify-center space-x-1 select-none"
                    >
                      <Plus className="w-3.5 h-3.5 text-white" />
                      <span>Simpan &amp; Aktifkan</span>
                    </button>

                  </form>

                </div>

              </div>

              {/* Footer Modal Explanation */}
              <div className="px-6 py-3 bg-slate-50 border-t border-slate-105 text-[10px] text-slate-400 text-center flex items-center justify-between select-none">
                <span>Smart-Guru Kurikulum Merdeka Multi-Rombel Engine</span>
                <span className="font-mono text-[9px] text-slate-400">ID: {activeProfileId}</span>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
