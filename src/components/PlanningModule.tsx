/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { SchoolConfig, CalendarWeek, AlurTujuanPembelajaran, ModulAjar } from "../types";
import { HeaderKop } from "./HeaderKop";
import { 
  Settings, Calendar, FileText, Sparkles, Plus, Trash2, Edit3, 
  HelpCircle, CheckCircle, Download, Copy, Play, ArrowRight, Save, Layout,
  Users, MessageSquare, Shield, ShieldAlert, History, Share2, Eye, User, Check,
  BookOpen, ClipboardList, Presentation, CheckSquare
} from "lucide-react";

interface CollabComment {
  id: string;
  tpCode: string;
  author: string;
  email: string;
  text: string;
  timestamp: string;
}

interface CollabRevision {
  id: string;
  tpCode: string;
  editor: string;
  email: string;
  action: string;
  timestamp: string;
}

interface PlanningModuleProps {
  config: SchoolConfig;
  setConfig: React.Dispatch<React.SetStateAction<SchoolConfig>>;
  weeks: CalendarWeek[];
  setWeeks: React.Dispatch<React.SetStateAction<CalendarWeek[]>>;
  atpList: AlurTujuanPembelajaran[];
  setAtpList: React.Dispatch<React.SetStateAction<AlurTujuanPembelajaran[]>>;
  modulAjarMap: { [tpCode: string]: ModulAjar };
  setModulAjarMap: React.Dispatch<React.SetStateAction<{ [tpCode: string]: ModulAjar }>>;
}

export const PlanningModule: React.FC<PlanningModuleProps> = ({
  config,
  setConfig,
  weeks,
  setWeeks,
  atpList,
  setAtpList,
  modulAjarMap,
  setModulAjarMap,
}) => {
  // UI Tabs
  const [activeSubTab, setActiveSubTab] = useState<"config" | "calendar" | "promes" | "modul" | "lkpd" | "bahan" | "asesmen" | "slide">("promes");
  const [activeDocTab, setActiveDocTab] = useState<"modul" | "bahan" | "slide" | "lkpd">("modul");
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);

  // Local Form state
  const [editingAtp, setEditingAtp] = useState<AlurTujuanPembelajaran | null>(null);
  const [atpCode, setAtpCode] = useState("");
  const [atpText, setAtpText] = useState("");
  const [atpJp, setAtpJp] = useState(8);
  const [atpWeeksStr, setAtpWeeksStr] = useState("");

  // Modul Ajar Generation choices
  const [selectedTpForAjar, setSelectedTpForAjar] = useState<string>(atpList[0]?.code || "");
  const [diffType, setDiffType] = useState<"Tidak" | "Gaya Belajar" | "Diferensiasi Kognitif">("Tidak");
  const [isGeneratingModul, setIsGeneratingModul] = useState(false);
  const [isGeneratingBahanAjar, setIsGeneratingBahanAjar] = useState(false);
  const [isGeneratingPPT, setIsGeneratingPPT] = useState(false);
  const [isGeneratingLKPD, setIsGeneratingLKPD] = useState(false);
  const [isGeneratingAsesmen, setIsGeneratingAsesmen] = useState(false);
  
  const [generationStep, setGenerationStep] = useState("");
  const [apiError, setApiError] = useState("");
  const [lkpdError, setLkpdError] = useState("");
  const [bahanError, setBahanError] = useState("");
  const [pptError, setPptError] = useState("");
  const [asesmenError, setAsesmenError] = useState("");

  // --- PEMBELAJARAN MENDALAM STATES ---
  const [jenjang, setJenjang] = useState<"SD" | "SMP" | "SMA">("SD");
  const [kelas, setKelas] = useState("Kelas 5");
  const [capaianPembelajaran, setCapaianPembelajaran] = useState(
    "Peserta didik mengidentifikasi sistem organ tubuh manusia (pencernaan, pernapasan, peredaran darah) dan hubungannya dengan kesehatan tubuh, serta mendeskripsikan siklus air dan dampaknya terhadap bumi."
  );
  const [materiPelajaran, setMateriPelajaran] = useState("Sistem Pernapasan Manusia & Organ Tubuh");
  const [jumlahPertemuan, setJumlahPertemuan] = useState<number>(2);
  const [durasiSetiapPertemuan, setDurasiSetiapPertemuan] = useState("2 x 35 menit");
  const [praktikPedagogisPerPertemuan, setPraktikPedagogisPerPertemuan] = useState<string[]>([
    "Inkuiri-Discovery Learning",
    "Problem Based Learning"
  ]);
  const [dimensiLulusan, setDimensiLulusan] = useState<string[]>([
    "Penalaran Kritis",
    "Kreativitas",
    "Kolaborasi"
  ]);

  // --- TEACHER COLLABORATION STATES ---
  const [collabSharedDrafts, setCollabSharedDrafts] = useState<{ [tpCode: string]: boolean }>(() => {
    const cached = localStorage.getItem("sg_collab_shared");
    return cached ? JSON.parse(cached) : { "TP 1.1": true };
  });

  const [collabPermissions, setCollabPermissions] = useState<{ [tpCode: string]: "Semua Guru Edit" | "Hanya Pemilik Edit" }>(() => {
    const cached = localStorage.getItem("sg_collab_permissions");
    return cached ? JSON.parse(cached) : { "TP 1.1": "Semua Guru Edit" };
  });

  const [collabComments, setCollabComments] = useState<{ [tpCode: string]: CollabComment[] }>(() => {
    const cached = localStorage.getItem("sg_collab_comments");
    if (cached) return JSON.parse(cached);
    
    return {
      "TP 1.1": [
        {
          id: "comment-1",
          tpCode: "TP 1.1",
          author: "Ibu Siti Aminah, S.Pd. (Guru IPA Kelas V-A)",
          email: "siti.aminah@guru.sd.belajar.id",
          text: "Materi metode ilmiah ini sangat tepat menggunakan eksperimen cawan air! Terima kasih idenya Pak Triyanto.",
          timestamp: "28 Mei 2026, 08:32 WIB"
        },
        {
          id: "comment-2",
          tpCode: "TP 1.1",
          author: "Pak Ahmad Fauzi, M.Pd. (Waka Kurikulum)",
          email: "ahmad.fauzi@guru.sd.belajar.id",
          text: "Draf kegiatannya mantap dan sesuai dengan Panduan Pembelajaran & Asesmen (PPA) Kemendikbudristek 2024.",
          timestamp: "28 Mei 2026, 09:12 WIB"
        }
      ]
    };
  });

  const [collabRevisions, setCollabRevisions] = useState<{ [tpCode: string]: CollabRevision[] }>(() => {
    const cached = localStorage.getItem("sg_collab_revisions");
    if (cached) return JSON.parse(cached);

    return {
      "TP 1.1": [
        {
          id: "rev-starter",
          tpCode: "TP 1.1",
          editor: "Pak Triyanto, S.Pd. (Pemilik)",
          email: "triyanto19@guru.sd.belajar.id",
          action: "Membangun draf awal Modul Ajar Kurikulum Merdeka menggunakan AI Ko-Pilot.",
          timestamp: "27 Mei 2026, 17:01 WIB"
        }
      ]
    };
  });

  const [activeSimulationEmail, setActiveSimulationEmail] = useState<string>("siti.aminah@guru.sd.belajar.id");
  const [commentInput, setCommentInput] = useState("");
  const [collabSuccessMsg, setCollabSuccessMsg] = useState("");
  const [collabErrorMsg, setCollabErrorMsg] = useState("");

  // --- REGION: ACADEMIC CALENDAR & INDONESIAN HOLIDAYS ENGINE ---
  const [customHolidays, setCustomHolidays] = useState<{ id: string; name: string; date: string; type: "nasional" | "keagamaan" | "akademik"; description: string; suggestedActivityName?: string }[]>(() => {
    const cached = localStorage.getItem("sg_custom_holidays");
    return cached ? JSON.parse(cached) : [];
  });

  const [holidayTab, setHolidayTab] = useState<"semua" | "nasional" | "keagamaan" | "akademik">("semua");
  const [showAddHolidayForm, setShowAddHolidayForm] = useState(false);
  const [newHolidayName, setNewHolidayName] = useState("");
  const [newHolidayDate, setNewHolidayDate] = useState("");
  const [newHolidayType, setNewHolidayType] = useState<"nasional" | "keagamaan" | "akademik">("nasional");
  const [newHolidayDesc, setNewHolidayDesc] = useState("");
  const [newSuggestedActivity, setNewSuggestedActivity] = useState("");
  const [holidaySuccessMsg, setHolidaySuccessMsg] = useState("");

  // --- REGION: ACADEMIC CALENDAR GENERATION ENGINE ---
  const [selectedGenerateYear, setSelectedGenerateYear] = useState("2026/2027");
  const [weeksCountToGenerate, setWeeksCountToGenerate] = useState<18 | 36>(36);

  const formatIndoDateRange = (mon: Date, fri: Date) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
    const monDay = String(mon.getDate()).padStart(2, '0');
    const friDay = String(fri.getDate()).padStart(2, '0');
    const monMonth = months[mon.getMonth()];
    const friMonth = months[fri.getMonth()];
    const monYear = mon.getFullYear();
    const friYear = fri.getFullYear();
    
    if (monMonth === friMonth) {
      return `${monDay} - ${friDay} ${monMonth} ${friYear}`;
    } else {
      if (monYear === friYear) {
        return `${monDay} ${monMonth} - ${friDay} ${friMonth} ${friYear}`;
      } else {
        return `${monDay} ${monMonth} ${monYear} - ${friDay} ${friMonth} ${friYear}`;
      }
    }
  };

  const handleGenerateAcademicCalendar = (yearStr: string, limitWeeks: 18 | 36) => {
    const startYear = parseInt(yearStr.split("/")[0]) || 2026;
    
    // Find first Monday of July of that starting year
    let d = new Date(startYear, 6, 1); // 6 is July
    while (d.getDay() !== 1) { // 1 = Monday
      d.setDate(d.getDate() + 1);
    }
    
    // If generating 18 weeks and selected semester is Genap, start from January of startYear + 1
    if (limitWeeks === 18 && config.semester === "Genap") {
      d = new Date(startYear + 1, 0, 1); // 0 is January
      while (d.getDay() !== 1) {
        d.setDate(d.getDate() + 1);
      }
    }
    
    const newWeeks: CalendarWeek[] = [];
    
    for (let i = 1; i <= limitWeeks; i++) {
      const monday = new Date(d);
      const friday = new Date(monday);
      friday.setDate(monday.getDate() + 4);
      
      const dateRangeStr = formatIndoDateRange(monday, friday);
      
      let isEffective = true;
      let activityName = "Belajar Efektif (TP Baru)";
      
      if (limitWeeks === 18) {
        if (config.semester === "Ganjil") {
          if (i === 1) {
            isEffective = false;
            activityName = "MPLS (Pekan Pertama)";
          } else if (i === 6) {
            isEffective = false;
            activityName = "Peringatan HUT Kemerdekaan RI";
          } else if (i === 10) {
            isEffective = false;
            activityName = "Sumatif Tengah Semester (STS) Ganjil";
          } else if (i === 17) {
            isEffective = false;
            activityName = "Sumatif Akhir Semester (SAS) Ganjil";
          } else if (i === 18) {
            isEffective = false;
            activityName = "Rapor & Jeda Jurnal Semester";
          }
        } else {
          if (i === 1) {
            isEffective = true;
            activityName = "Awal Semester Genap (Materi Baru)";
          } else if (i === 10) {
            isEffective = false;
            activityName = "Sumatif Tengah Semester (STS) Genap";
          } else if (i === 16) {
            isEffective = false;
            activityName = "Asesmen Sumatif Akhir Tahun (ASAT)";
          } else if (i === 17) {
            isEffective = false;
            activityName = "Sumatif Akhir Jenjang / Class Meeting";
          } else if (i === 18) {
            isEffective = false;
            activityName = "Pembagian Rapor & Kenaikan Kelas";
          }
        }
      } else {
        // Full 36 weeks from July to June
        if (i === 1) {
          isEffective = false;
          activityName = "MPLS (Hari pertama sekolah)";
        } else if (i === 6) {
          isEffective = false;
          activityName = "Peringatan HUT Kemerdekaan RI";
        } else if (i === 10) {
          isEffective = false;
          activityName = "Sumatif Tengah Semester (STS) Ganjil";
        } else if (i === 17) {
          isEffective = false;
          activityName = "Sumatif Akhir Semester (SAS) Ganjil";
        } else if (i === 18) {
          isEffective = false;
          activityName = "Rapor & Libur Semester Ganjil";
        } else if (i === 19) {
          isEffective = true;
          activityName = "Awal Semester Genap (Pekan ke-19)";
        } else if (i === 28) {
          isEffective = false;
          activityName = "Sumatif Tengah Semester (STS) Genap";
        } else if (i === 34) {
          isEffective = false;
          activityName = "Asesmen Sumatif Akhir Tahun (ASAT)";
        } else if (i === 35) {
          isEffective = false;
          activityName = "Class Meeting / Refleksi Nilai";
        } else if (i === 36) {
          isEffective = false;
          activityName = "Pembagian Rapor & Kenaikan Kelas";
        }
      }
      
      newWeeks.push({
        weekNum: i,
        dateRange: dateRangeStr,
        isEffective,
        activityName
      });
      
      d.setDate(d.getDate() + 7);
    }
    
    setWeeks(newWeeks);
    
    setConfig(prev => ({
      ...prev,
      academicYear: yearStr
    }));
    
    setHolidaySuccessMsg(`Kalender Akademik Tahun Pelajaran ${yearStr} berhasil di-generate dari bulan Juli s.d. Juni (${limitWeeks} pekan)!`);
    setTimeout(() => setHolidaySuccessMsg(""), 6000);
  };

  // Save custom holidays to LocalStorage
  const saveCustomHolidays = (updated: any[]) => {
    setCustomHolidays(updated);
    localStorage.setItem("sg_custom_holidays", JSON.stringify(updated));
  };

  const handleAddCustomHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHolidayName.trim() || !newHolidayDate.trim()) return;

    const newH = {
      id: "h_custom_" + Date.now(),
      name: newHolidayName.trim(),
      date: newHolidayDate.trim(),
      type: newHolidayType,
      description: newHolidayDesc.trim() || "Hari libur / kegiatan lokal luar kalender utama.",
      suggestedActivityName: newSuggestedActivity.trim() || newHolidayName.trim()
    };

    const updated = [...customHolidays, newH];
    saveCustomHolidays(updated);

    // Clear form
    setNewHolidayName("");
    setNewHolidayDate("");
    setNewHolidayType("nasional");
    setNewHolidayDesc("");
    setNewSuggestedActivity("");
    setShowAddHolidayForm(false);
    setHolidaySuccessMsg("Hari libur kustom berhasil ditambahkan!");
    setTimeout(() => setHolidaySuccessMsg(""), 4000);
  };

  const handleDeleteCustomHoliday = (id: string) => {
    const remaining = customHolidays.filter(h => h.id !== id);
    saveCustomHolidays(remaining);
  };

  // Static Standard Academic and Indonesian Holidays
  const masterHolidays = [
    {
      id: "h_kemerdekaan",
      name: "Hari Kemerdekaan Republik Indonesia ke-80",
      date: "17 Agustus 2025",
      type: "nasional" as const,
      description: "Peringatan HUT kemerdekaan Republik Indonesia. Sekolah melangsungkan upacara bendera kenegaraan dan festival perlombaan kreativitas siswa.",
      suggestedActivityName: "HUT Kemerdekaan RI & Lomba Sekolah"
    },
    {
      id: "h_pahlawan",
      name: "Hari Pahlawan Nasional",
      date: "10 November 2025",
      type: "nasional" as const,
      description: "Mengenang pertempuran heroik di Surabaya untuk memperkuat pemahaman nilai-nilai profil pelajar Pancasila (Kebinekaan Global dan Patriotisme).",
      suggestedActivityName: "Peringatan Hari Pahlawan Nasional"
    },
    {
      id: "h_lahir_pancasila",
      name: "Hari Lahir Pancasila",
      date: "01 Juni 2026",
      type: "nasional" as const,
      description: "Memperingati fondasi dasar ideologi bangsa Pancasila, diisi upacara kenegaraan terpadu.",
      suggestedActivityName: "Libur Hari Lahir Pancasila"
    },
    {
      id: "h_buruh",
      name: "Hari Buruh Internasional (May Day)",
      date: "01 Mei 2026",
      type: "nasional" as const,
      description: "Hari buruh sedunia, ditetapkan sebagai hari libur resmi nasional.",
      suggestedActivityName: "Libur Hari Buruh Internasional"
    },
    {
      id: "h_tahun_baru_masehi",
      name: "Tahun Baru Masehi 2026",
      date: "01 Januari 2026",
      type: "nasional" as const,
      description: "Tahun Baru kalender Masehi global.",
      suggestedActivityName: "Libur Tahun Baru Masehi"
    },
    {
      id: "h_tahun_baru_islam",
      name: "Tahun Baru Islam 1447 H",
      date: "27 Juni 2025",
      type: "keagamaan" as const,
      description: "Pergantian tahun kalender Hijriah bagi umat Muslim di seluruh dunia.",
      suggestedActivityName: "Libur Tahun Baru Islam 1447 H"
    },
    {
      id: "h_maulid",
      name: "Maulid Nabi Muhammad SAW",
      date: "05 September 2025",
      type: "keagamaan" as const,
      description: "Peringatan kelahiran Nabi Muhammad SAW pada tanggal 12 Rabiul Awal kalender Hijriah.",
      suggestedActivityName: "Maulid Nabi Muhammad SAW"
    },
    {
      id: "h_natal",
      name: "Hari Raya Natal",
      date: "25 Desember 2025",
      type: "keagamaan" as const,
      description: "Perayaan kelahiran Yesus Kristus bagi umat Kristen dan Katolik.",
      suggestedActivityName: "Libur Hari Raya Natal & Bersama"
    },
    {
      id: "h_imlek",
      name: "Tahun Baru Imlek 2577 Kongzili",
      date: "29 Januari 2026",
      type: "keagamaan" as const,
      description: "Perayaan tahun baru etnis Tionghoa berdasar perhitungan lunar.",
      suggestedActivityName: "Libur Tahun Baru Imlek"
    },
    {
      id: "h_nyepi",
      name: "Hari Raya Nyepi (Tahun Baru Saka 1948)",
      date: "19 Maret 2026",
      type: "keagamaan" as const,
      description: "Tahun Baru umat Hindu yang diisi dengan catur brata penyepian.",
      suggestedActivityName: "Libur Hari Raya Nyepi"
    },
    {
      id: "h_idul_fitri",
      name: "Hari Raya Idul Fitri 1447 Hijriah",
      date: "20-21 Maret 2026",
      type: "keagamaan" as const,
      description: "Hari raya kemenangan bagi seluruh umat Muslim sesudah ibadah puasa Ramadan sebulan penuh.",
      suggestedActivityName: "Idul Fitri & Cuti Bersama 1447H"
    },
    {
      id: "h_idul_adha",
      name: "Hari Raya Idul Adha 1447 H",
      date: "27 Mei 2026",
      type: "keagamaan" as const,
      description: "Hari raya haji dan ibadah kurban bagi umat Muslim.",
      suggestedActivityName: "Libur Hari Raya Idul Adha"
    },
    {
      id: "h_waisak",
      name: "Hari Raya Waisak 2570 BE",
      date: "31 Mei 2026",
      type: "keagamaan" as const,
      description: "Suci Triwaisak bagi umat Buddha untuk merenungkan pencerahan sempurna.",
      suggestedActivityName: "Libur Hari Raya Waisak"
    },
    {
      id: "h_libur_ganzil",
      name: "Libur Jeda Semester 1 (Ganjil)",
      date: "22 Desember 2025 - 02 Januari 2026",
      type: "akademik" as const,
      description: "Libur akhir semester ganjil pasca pembagian buku laporan hasil belajar siswa (rapor).",
      suggestedActivityName: "Libur Semester Ganjil"
    },
    {
      id: "h_libur_genap",
      name: "Libur Akhir Tahun / Semester 2 (Kenaikan Kelas)",
      date: "22 Juni - 10 Juli 2026",
      type: "akademik" as const,
      description: "Libur panjang akhir tahun pelajaran/semester genap untuk proses transisi kelas baru.",
      suggestedActivityName: "Libur Kenaikan Kelas / Akhir Tahun"
    },
    {
      id: "h_sts_period",
      name: "Pekan Penilaian Sumatif Tengah Semester (STS)",
      date: "15 - 19 September 2025",
      type: "akademik" as const,
      description: "Evaluasi penilaian akademik paruh semester.",
      suggestedActivityName: "Sumatif Tengah Semester (STS)"
    },
    {
      id: "h_sas_period",
      name: "Pekan Penilaian Sumatif Akhir Semester (SAS)",
      date: "03 - 07 November 2025",
      type: "akademik" as const,
      description: "Evaluasi besar akhir semester yang menentukan kelulusan capaian TP rapor.",
      suggestedActivityName: "Sumatif Akhir Semester (SAS)"
    },
    {
      id: "h_hari_guru",
      name: "Hari Guru Nasional (HGN) & HUT PGRI",
      date: "25 November 2025",
      type: "akademik" as const,
      description: "Hari penghargaan khusus bagi jasa pahlawan tanpa tanda jasa, biasanya diisi dengan pentas seni siswa.",
      suggestedActivityName: "Apresiasi Hari Guru Nasional"
    }
  ];

  // Merge static & custom holidays
  const allHolidays = [...masterHolidays, ...customHolidays];

  // Filtered holidays
  const filteredHolidays = allHolidays.filter(h => {
    if (holidayTab === "semua") return true;
    return h.type === holidayTab;
  });

  const handleConnectHolidayToWeek = (weekIdx: number, activityText: string) => {
    const updated = [...weeks];
    updated[weekIdx].isEffective = false;
    updated[weekIdx].activityName = activityText;
    setWeeks(updated);

    setHolidaySuccessMsg(`Libur berhasil ditandakan! Minggu Ke-${weekIdx + 1} kini diatur ke Non-Efektif dengan agenda "${activityText}".`);
    setTimeout(() => setHolidaySuccessMsg(""), 5000);
  };
  // ---------------------------------------------------------------

  // Save collaboration changes to LocalStorage
  const saveCollabDataToStorage = (
    shared: { [tpCode: string]: boolean },
    perms: { [tpCode: string]: "Semua Guru Edit" | "Hanya Pemilik Edit" },
    comments: { [tpCode: string]: CollabComment[] },
    revisions: { [tpCode: string]: CollabRevision[] }
  ) => {
    localStorage.setItem("sg_collab_shared", JSON.stringify(shared));
    localStorage.setItem("sg_collab_permissions", JSON.stringify(perms));
    localStorage.setItem("sg_collab_comments", JSON.stringify(comments));
    localStorage.setItem("sg_collab_revisions", JSON.stringify(revisions));
  };

  const handleToggleCollabShare = (tpCode: string) => {
    const updatedShared = { ...collabSharedDrafts, [tpCode]: !collabSharedDrafts[tpCode] };
    setCollabSharedDrafts(updatedShared);
    
    // Auto-create initial comment array for this TP if vacant
    const updatedComments = { ...collabComments };
    if (!updatedComments[tpCode]) {
      updatedComments[tpCode] = [];
    }
    const updatedRevisions = { ...collabRevisions };
    if (!updatedRevisions[tpCode]) {
      updatedRevisions[tpCode] = [
        {
          id: "rev-init-" + Date.now(),
          tpCode: tpCode,
          editor: "Pak Triyanto, S.Pd. (Pemilik)",
          email: "triyanto19@guru.sd.belajar.id",
          action: "Membuka status draf Modul Ajar untuk kolaborasi antar guru sekolah.",
          timestamp: "Hari ini"
        }
      ];
    }
    setCollabComments(updatedComments);
    setCollabRevisions(updatedRevisions);
    saveCollabDataToStorage(updatedShared, collabPermissions, updatedComments, updatedRevisions);
  };

  const handleChangePermissionMode = (tpCode: string, mode: "Semua Guru Edit" | "Hanya Pemilik Edit") => {
    const updatedPerms = { ...collabPermissions, [tpCode]: mode };
    setCollabPermissions(updatedPerms);
    saveCollabDataToStorage(collabSharedDrafts, updatedPerms, collabComments, collabRevisions);
  };

  // Add Comment manually by current user (Triyanto)
  const handleAddCollabComment = (tpCode: string) => {
    if (!commentInput.trim()) return;

    const newComment: CollabComment = {
      id: "comment-" + Date.now(),
      tpCode: tpCode,
      author: "Pak Triyanto, S.Pd. (Pemilik draf)",
      email: "triyanto19@guru.sd.belajar.id",
      text: commentInput.trim(),
      timestamp: "Hari ini, " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " WIB"
    };

    const updatedComments = {
      ...collabComments,
      [tpCode]: [...(collabComments[tpCode] || []), newComment]
    };
    setCollabComments(updatedComments);
    setCommentInput("");
    saveCollabDataToStorage(collabSharedDrafts, collabPermissions, updatedComments, collabRevisions);
  };

  // Co-Teacher Action Simulator Runner
  const handleSimulateCoTeacherComment = (tpCode: string) => {
    setCollabErrorMsg("");
    setCollabSuccessMsg("");

    const isShared = collabSharedDrafts[tpCode];
    if (!isShared) {
      setCollabErrorMsg("Akses Ditolak: Draf Modul Ajar ini belum berstatus 'DIBAGIKAN' ke SDN Merdeka Jaya.");
      return;
    }

    const name = activeSimulationEmail === "siti.aminah@guru.sd.belajar.id" ? "Ibu Siti Aminah, S.Pd." : "Pak Ahmad Fauzi, M.Pd.";
    
    const presetComments = [
      "Bagian penutup asyik sekali! Bisa dimodifikasi dengan kuis cepat kah?",
      "Pembagian sarana prasarana sangat memadai dan mudah kita praktikan di lab paralel kelas.",
      "Luar biasa inovatif Pak Tri! Saya akan adaptasikan ke materi kelas IV esok lusa.",
      "Pertanyaan pemantiknya sangat kontekstual dengan lingkungan pertanian sekolah kita."
    ];
    const chosenText = presetComments[Math.floor(Math.random() * presetComments.length)];

    const simComment: CollabComment = {
      id: "comment-" + Date.now(),
      tpCode: tpCode,
      author: name,
      email: activeSimulationEmail,
      text: chosenText,
      timestamp: "Baru Saja"
    };

    const updatedComments = {
      ...collabComments,
      [tpCode]: [...(collabComments[tpCode] || []), simComment]
    };
    setCollabComments(updatedComments);
    setCollabSuccessMsg(`${name} berhasil menambahkan ulasan draf!`);
    setTimeout(() => setCollabSuccessMsg(""), 5000);
    saveCollabDataToStorage(collabSharedDrafts, collabPermissions, updatedComments, collabRevisions);
  };

  const handleSimulateCoTeacherEdit = (tpCode: string) => {
    setCollabErrorMsg("");
    setCollabSuccessMsg("");

    const isShared = collabSharedDrafts[tpCode];
    if (!isShared) {
      setCollabErrorMsg("Akses Ditolak: Draf Modul Ajar ini belum berstatus 'DIBAGIKAN' ke SDN Merdeka Jaya.");
      return;
    }

    // Access evaluation: Check if the permission mode is restricted to Owner's Edit (Viewer for colleagues)
    const mode = collabPermissions[tpCode] || "Hanya Pemilik Edit";
    
    const name = activeSimulationEmail === "siti.aminah@guru.sd.belajar.id" ? "Ibu Siti Aminah, S.Pd." : "Pak Ahmad Fauzi, M.Pd.";

    // If the permission mode is restricted to "Hanya Pemilik Edit", then colleagues are VIEWERS ONLY!
    if (mode === "Hanya Pemilik Edit") {
      setCollabErrorMsg(`Izin Ditolak! ${name} terdaftar sebagai VIEWER pada draf ini. Ubah 'Hak Akses Rekan Sekolah' draf Anda menjadi EDITOR terlebih dahulu.`);
      return;
    }

    // If "Semua Guru Edit", they can modify!
    // Try to append a change into the Modul Ajar
    const currentModul = modulAjarMap[tpCode];
    if (!currentModul) {
      setCollabErrorMsg("Draf RPP belum dibangun oleh AI. Pastikan klik tombol AI di sebelah kiri terlebih dahulu!");
      return;
    }

    const modifiedModul = { ...currentModul };
    const randomAdditions = [
      " [Disempurnakan oleh Ibu Siti: Penambahan Kit Praktikum Alat Peraga IPA]",
      " [Masukan dari Pak Ahmad: Disparitas bahan ajar audio visual youtube ditambahkan]",
      " [Catatan Revisi Rekan: Media kuis Kahoot interaktif disiapkan]"
    ];
    const phrase = randomAdditions[Math.floor(Math.random() * randomAdditions.length)];

    // Apply simulation edit to Sarana Prasarana
    modifiedModul.identitas = {
      ...modifiedModul.identitas,
      saranaPrasarana: modifiedModul.identitas.saranaPrasarana + phrase
    };

    setModulAjarMap(prev => ({
      ...prev,
      [tpCode]: modifiedModul
    }));

    // Add log to revisions
    const logItem: CollabRevision = {
      id: "rev-" + Date.now(),
      tpCode: tpCode,
      editor: name,
      email: activeSimulationEmail,
      action: `Menyempurnakan Sarana & Prasarana Modul Ajar: Menambahkan rujukan inovasi media pembelajaran.`,
      timestamp: "Baru Saja"
    };

    const updatedRevisions = {
      ...collabRevisions,
      [tpCode]: [logItem, ...(collabRevisions[tpCode] || [])]
    };
    setCollabRevisions(updatedRevisions);
    setCollabSuccessMsg(`Berhasil! ${name} (Editor) menyempurnakan dokumen draf Anda secara real-time.`);
    setTimeout(() => setCollabSuccessMsg(""), 6000);
    saveCollabDataToStorage(collabSharedDrafts, collabPermissions, collabComments, updatedRevisions);
  };
  // ------------------------------------

  // Total Effective calculation
  const totalWeeks = weeks.length;
  const effectiveWeeksCount = weeks.filter(w => w.isEffective).length;
  const totalEffectiveJp = effectiveWeeksCount * config.weeklyJp;

  // Dynamic Month Matrix Calculation helper
  const getMonthsAndWeeksForCurrentSemester = () => {
    const startYr = parseInt(config.academicYear.split("/")[0]) || 2025;
    const is36W = weeks.length >= 36;
    
    // helper to map range index of weeks
    const makeRange = (start: number, end: number) => {
      const list: number[] = [];
      for (let i = start; i < end; i++) {
        if (i < weeks.length) {
          list.push(i);
        }
      }
      return list;
    };

    if (config.semester === "Ganjil") {
      const baseIndex = 0;
      return [
        { name: `Juli ${startYr}`, weeksInMonth: makeRange(baseIndex, baseIndex + 3), desc: "Awal Semester" },
        { name: `Agustus ${startYr}`, weeksInMonth: makeRange(baseIndex + 3, baseIndex + 7), desc: "Proklamasi RI" },
        { name: `September ${startYr}`, weeksInMonth: makeRange(baseIndex + 7, baseIndex + 12), desc: "Kondisi STS" },
        { name: `Oktober ${startYr}`, weeksInMonth: makeRange(baseIndex + 12, baseIndex + 16), desc: "Kreativitas P5" },
        { name: `November ${startYr}`, weeksInMonth: makeRange(baseIndex + 16, baseIndex + 18), desc: "Evaluasi SAS" },
        { name: `Desember ${startYr}`, weeksInMonth: makeRange(baseIndex + 18, Math.min(baseIndex + 19, weeks.length)), desc: "Libur Akhir Semester" }
      ];
    } else {
      const baseIndex = is36W ? 18 : 0;
      const endYr = startYr + 1;
      return [
        { name: `Januari ${endYr}`, weeksInMonth: makeRange(baseIndex, baseIndex + 3), desc: "Semester Baru" },
        { name: `Februari ${endYr}`, weeksInMonth: makeRange(baseIndex + 3, baseIndex + 7), desc: "Belajar Efektif" },
        { name: `Maret ${endYr}`, weeksInMonth: makeRange(baseIndex + 7, baseIndex + 12), desc: "STS Semester 2" },
        { name: `April ${endYr}`, weeksInMonth: makeRange(baseIndex + 12, baseIndex + 16), desc: "Kolaborasi Kelas" },
        { name: `Mei ${endYr}`, weeksInMonth: makeRange(baseIndex + 16, baseIndex + 18), desc: "Sumatif Akhir" },
        { name: `Juni ${endYr}`, weeksInMonth: makeRange(baseIndex + 18, Math.min(baseIndex + 19, weeks.length)), desc: "Kenaikan Kelas" }
      ];
    }
  };

  // Toggle effective status of a week
  const handleToggleWeek = (index: number) => {
    const updated = [...weeks];
    updated[index].isEffective = !updated[index].isEffective;
    // Realtime reaction (SSOT): if changed to ineffective, clear TP name from it
    if (!updated[index].isEffective) {
      updated[index].activityName = "Minggu Non-Efektif / Kegiatan Sekolah";
    } else {
      updated[index].activityName = "Belajar Efektif (TP Baru)";
    }
    setWeeks(updated);
  };

  // Update activity name of a week
  const handleWeekActivityChange = (index: number, val: string) => {
    const updated = [...weeks];
    updated[index].activityName = val;
    setWeeks(updated);
  };

  // Add ATP
  const handleSaveAtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!atpCode.trim() || !atpText.trim()) return;

    const weeksArray = atpWeeksStr
      .split(",")
      .map(w => parseInt(w.trim()))
      .filter(w => !isNaN(w) && w >= 1 && w <= totalWeeks);

    if (editingAtp) {
      // Modify
      setAtpList(prev => prev.map(item => item.id === editingAtp.id ? {
        ...item,
        code: atpCode,
        tpText: atpText,
        jpAllocation: atpJp,
        targetWeeks: weeksArray
      } : item));
      setEditingAtp(null);
    } else {
      // Create new
      const newVal: AlurTujuanPembelajaran = {
        id: "ATP" + Date.now(),
        code: atpCode,
        tpText: atpText,
        jpAllocation: atpJp,
        targetWeeks: weeksArray
      };
      setAtpList(prev => [...prev, newVal]);
    }

    // Reset inputs
    setAtpCode("");
    setAtpText("");
    setAtpJp(8);
    setAtpWeeksStr("");
  };

  // Trigger editing state for ATP
  const triggerEditAtp = (atp: AlurTujuanPembelajaran) => {
    setEditingAtp(atp);
    setAtpCode(atp.code);
    setAtpText(atp.tpText);
    setAtpJp(atp.jpAllocation);
    setAtpWeeksStr(atp.targetWeeks.join(", "));
  };

  // Delete ATP
  const handleDeleteAtp = (id: string) => {
    setAtpList(prev => prev.filter(item => item.id !== id));
  };

  // API Call: Auto Distribute Promes with AI
  const handleAutoGeneratePromes = async () => {
    try {
      setIsGeneratingModul(true);
      setApiError("");
      setGenerationStep("AI sedang merencanakan kurikulum dan membagi bobot JP secara otomatis...");
      
      const response = await fetch("/api/generate/promes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phase: config.phase,
          grade: config.grade,
          subject: config.subject,
          semester: config.semester,
          weeklyJp: config.weeklyJp,
          totalWeeks: effectiveWeeksCount,
          schoolName: config.schoolName
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gagal menghubungi server AI");
      }

      const generatedAtp: AlurTujuanPembelajaran[] = await response.json();
      if (generatedAtp && generatedAtp.length > 0) {
        setAtpList(generatedAtp);
        
        // Dynamic synchronization: Map generated ATPs back to effective calendar weeks (SSOT)
        const updatedWeeks = [...weeks];
        let currentEffectiveIdx = 0;
        
        // Loop and tag
        updatedWeeks.forEach((wk, index) => {
          if (wk.isEffective) {
            currentEffectiveIdx++;
            // Find which ATP targets this effective week number
            const matchingAtp = generatedAtp.find(atp => atp.targetWeeks.includes(currentEffectiveIdx));
            if (matchingAtp) {
              wk.activityName = `Belajar Efektif (${matchingAtp.code})`;
            }
          }
        });
        setWeeks(updatedWeeks);
      }
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || "Terdapat kendala jaringan atau Kunci API belum diatur.");
    } finally {
      setIsGeneratingModul(false);
    }
  };

  // API Call: Auto Generate Modul Ajar with AI
  const handleGenerateModulAjar = async () => {
    if (!selectedTpForAjar) {
      setApiError("Silakan pilih Tujuan Pembelajaran (TP) terlebih dahulu.");
      return;
    }

    const currentTp = atpList.find(a => a.code === selectedTpForAjar);
    if (!currentTp) return;

    try {
      setIsGeneratingModul(true);
      setApiError("");
      
      setGenerationStep("Tahap 1: Memetakan Kompetensi Awal & Profil Pancasila...");
      await new Promise(r => setTimeout(r, 600));
      
      setGenerationStep("Tahap 2: Merumuskan Pemahaman Bermakna & Pertanyaan Pemantik...");
      await new Promise(r => setTimeout(r, 600));
      
      setGenerationStep("Tahap 3: Merancang Aktivitas Pembelajaran " + (diffType !== "Tidak" ? `Berdiferensiasi (${diffType})` : "Aktif") + "...");
      
      const response = await fetch("/api/generate/modul-ajar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tpCode: currentTp.code,
          tpText: currentTp.tpText,
          schoolConfig: config,
          differentiationType: diffType,
          jenjang,
          kelas,
          capaianPembelajaran,
          materiPelajaran,
          jumlahPertemuan,
          durasiSetiapPertemuan,
          praktikPedagogisPerPertemuan,
          dimensiLulusan
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gagal merumuskan draf Modul Ajar");
      }

      setGenerationStep("Tahap 4: Menyusun LKPD Analitik & Media Paparan Presentasi...");
      const fullModul: ModulAjar = await response.json();
      
      setModulAjarMap(prev => ({
        ...prev,
        [currentTp.code]: fullModul
      }));

    } catch (err: any) {
      console.error(err);
      setApiError(err.message || "Gagal menghasilkan modul. Pastikan koneksi AI Studio aktif.");
    } finally {
      setIsGeneratingModul(false);
    }
  };

  // API Call: Auto Generate LKPD
  const handleGenerateLKPD = async () => {
    if (!selectedTpForAjar) {
      setLkpdError("Silakan pilih Tujuan Pembelajaran (TP) terlebih dahulu.");
      return;
    }
    const currentTp = atpList.find(a => a.code === selectedTpForAjar);
    if (!currentTp) return;

    if (!modulAjarMap[selectedTpForAjar]) {
      setLkpdError("Silakan susun draf Modul Ajar utama terlebih dahulu agar selaras.");
      return;
    }

    try {
      setIsGeneratingLKPD(true);
      setLkpdError("");
      const response = await fetch("/api/generate/lkpd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tpCode: currentTp.code,
          tpText: currentTp.tpText,
          schoolConfig: config,
          grade: kelas,
          subject: config.subject
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gagal menghasilkan draf LKPD");
      }

      const lkpdData = await response.json();
      setModulAjarMap(prev => {
        const existing = prev[selectedTpForAjar];
        return {
          ...prev,
          [selectedTpForAjar]: {
            ...existing,
            generatedLkpd: lkpdData
          }
        };
      });
    } catch (err: any) {
      console.error(err);
      setLkpdError(err.message || "Gagal menghasilkan LKPD.");
    } finally {
      setIsGeneratingLKPD(false);
    }
  };

  // API Call: Auto Generate Bahan Ajar
  const handleGenerateBahanAjar = async () => {
    if (!selectedTpForAjar) {
      setBahanError("Silakan pilih Tujuan Pembelajaran (TP) terlebih dahulu.");
      return;
    }
    const currentTp = atpList.find(a => a.code === selectedTpForAjar);
    if (!currentTp) return;

    if (!modulAjarMap[selectedTpForAjar]) {
      setBahanError("Silakan susun draf Modul Ajar utama terlebih dahulu agar selaras.");
      return;
    }

    try {
      setIsGeneratingBahanAjar(true);
      setBahanError("");
      const response = await fetch("/api/generate/bahan-ajar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tpCode: currentTp.code,
          tpText: currentTp.tpText,
          schoolConfig: config,
          grade: kelas,
          subject: config.subject
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gagal menghasilkan draf Bahan Ajar");
      }

      const bahanData = await response.json();
      setModulAjarMap(prev => {
        const existing = prev[selectedTpForAjar];
        return {
          ...prev,
          [selectedTpForAjar]: {
            ...existing,
            generatedBahanAjar: bahanData
          }
        };
      });
    } catch (err: any) {
      console.error(err);
      setBahanError(err.message || "Gagal menghasilkan Bahan Ajar.");
    } finally {
      setIsGeneratingBahanAjar(false);
    }
  };

  // API Call: Auto Generate PPT Presentation
  const handleGeneratePPT = async () => {
    if (!selectedTpForAjar) {
      setPptError("Silakan pilih Tujuan Pembelajaran (TP) terlebih dahulu.");
      return;
    }
    const currentTp = atpList.find(a => a.code === selectedTpForAjar);
    if (!currentTp) return;

    if (!modulAjarMap[selectedTpForAjar]) {
      setPptError("Silakan susun draf Modul Ajar utama terlebih dahulu agar selaras.");
      return;
    }

    try {
      setIsGeneratingPPT(true);
      setPptError("");
      const response = await fetch("/api/generate/presentasi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tpCode: currentTp.code,
          tpText: currentTp.tpText,
          schoolConfig: config,
          grade: kelas,
          subject: config.subject
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gagal menghasilkan draf Slide");
      }

      const pptData = await response.json();
      setModulAjarMap(prev => {
        const existing = prev[selectedTpForAjar];
        return {
          ...prev,
          [selectedTpForAjar]: {
            ...existing,
            generatedPresentasi: pptData
          }
        };
      });
    } catch (err: any) {
      console.error(err);
      setPptError(err.message || "Gagal menghasilkan Slide Presentasi.");
    } finally {
      setIsGeneratingPPT(false);
    }
  };

  // API Call: Auto Generate Asesmen Formatif (Kuis & Rubrik Kinerja)
  const handleGenerateAsesmenFormatif = async () => {
    if (!selectedTpForAjar) {
      setAsesmenError("Silakan pilih Tujuan Pembelajaran (TP) terlebih dahulu.");
      return;
    }
    const currentTp = atpList.find(a => a.code === selectedTpForAjar);
    if (!currentTp) return;

    if (!modulAjarMap[selectedTpForAjar]) {
      setAsesmenError("Silakan susun draf Modul Ajar utama terlebih dahulu agar selaras.");
      return;
    }

    try {
      setIsGeneratingAsesmen(true);
      setAsesmenError("");

      // 1. Generate Kuis PG (5 Soal)
      const kuisRes = await fetch("/api/generate/kisi-kisi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tpCode: currentTp.code,
          tpText: currentTp.tpText,
          examType: "Formatif Harian",
          questionCount: 5,
          subjectName: config.subject
        })
      });

      if (!kuisRes.ok) {
        throw new Error("Gagal memperoleh kuis pilihan ganda dari AI.");
      }
      const kuisPlg = await kuisRes.json();

      // 2. Generate Rubrik Kinerja (Observasi Formatif)
      const rubrikRes = await fetch("/api/generate/performance-rubric", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tpCode: currentTp.code,
          tpText: currentTp.tpText,
          rubricTitle: "Rubrik Observasi Capaian Formatif Proses Pembelajaran"
        })
      });

      if (!rubrikRes.ok) {
        throw new Error("Gagal memperoleh rubrik instrumen observasi dari AI.");
      }
      const rubrikKnj = await rubrikRes.json();

      setModulAjarMap(prev => {
        const existing = prev[selectedTpForAjar];
        return {
          ...prev,
          [selectedTpForAjar]: {
            ...existing,
            generatedAsesmenFormatif: {
              tpCode: currentTp.code,
              tpText: currentTp.tpText,
              kuisPilihanGanda: kuisPlg,
              rubrikKinerja: rubrikKnj
            }
          }
        };
      });
    } catch (err: any) {
      console.error(err);
      setAsesmenError(err.message || "Gagal menyusun Asesmen Formatif.");
    } finally {
      setIsGeneratingAsesmen(false);
    }
  };

  // Helper exporter
  const handleDownloadModulHtml = (tpCode: string) => {
    const modul = modulAjarMap[tpCode];
    if (!modul) return;

    const htmlContent = `
      <html>
        <head>
          <title>Modul Ajar ${modul.tpCode}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; line-height: 1.6; }
            .kop { border-bottom: 4px double #000; padding-bottom: 20px; text-align: center; margin-bottom: 30px; }
            .header-meta { border: 1px solid #ddd; background: #f9f9f9; padding: 15px; margin-bottom: 25px; font-size: 13px; }
            h1, h2, h3 { color: #1e293b; }
            .section { margin-bottom: 35px; border-bottom: 1px solid #eee; padding-bottom: 15px; }
            .bold { font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="kop">
            <h2>PEMERINTAH PROVINSI DKI JAKARTA</h2>
            <h3>DINAS PENDIDIKAN - ${config.schoolName}</h3>
            <p>Jurnal Merdeka Pendidikan Raya, Jakarta Pusat</p>
          </div>
          <h1 style="text-align: center;">MODUL AJAR KURIKULUM MERDEKA</h1>
          <h3 style="text-align: center; font-weight: normal;">TP ${modul.tpCode}: ${modul.tpText}</h3>

          <div class="header-meta">
            <strong>Sekolah:</strong> ${modul.identitas.sekolah} | 
            <strong>Fase:</strong> ${modul.identitas.fase} | 
            <strong>Kelas:</strong> ${modul.identitas.kelas} | 
            <strong>Mata Pelajaran:</strong> ${modul.identitas.mapel}<br/>
            <strong>Alokasi Waktu:</strong> ${modul.identitas.alokasiWaktu} | 
            <strong>Model Pembelajaran:</strong> ${modul.identitas.modelPembelajaran}
          </div>

          ${modul.pembelajaranMendalam ? `
          <div class="section">
            <h2 style="color: #15803d; border-bottom: 2px solid #15803d; padding-bottom: 5px;">TABEL RANCANGAN PEMBELAJARAN MENDALAM (DEEP LEARNING MODEL)</h2>
            <p style="font-size: 11px; color: #666; font-style: italic;">Sesuai Standar Kompetensi Pembelajaran Mendalam Puskurjar Kemendikbudristek RI dan Penulisan Rata Kanan Kiri (Text Justify).</p>
            <table style="width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 25px; border: 1px solid #cbd5e1; font-size: 12px; line-height: 1.5;">
              <thead>
                <tr style="background-color: #f8fafc; border-bottom: 1px solid #cbd5e1;">
                  <th style="border: 1px solid #cbd5e1; padding: 10px; text-align: left; width: 25%; font-weight: bold; color: #334155;">Aspek Utama</th>
                  <th style="border: 1px solid #cbd5e1; padding: 10px; text-align: justify; font-weight: bold; color: #334155;">Rincian Modul Mendalam</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="border: 1px solid #cbd5e1; padding: 10px; font-weight: bold; background-color: #f8fafc;">1. Identitas Pembelajaran</td>
                  <td style="border: 1px solid #cbd5e1; padding: 10px; text-align: justify;">
                    <strong>Satuan Pendidikan:</strong> ${modul.pembelajaranMendalam.identitas?.satuanPendidikan || '-'}<br/>
                    <strong>Mata Pelajaran:</strong> ${modul.pembelajaranMendalam.identitas?.mataPelajaran || '-'}<br/>
                    <strong>Kelas/Semester:</strong> ${modul.pembelajaranMendalam.identitas?.kelasSemester || '-'}<br/>
                    <strong>Durasi Pertemuan:</strong> ${modul.pembelajaranMendalam.identitas?.durasiPertemuan || '-'}
                  </td>
                </tr>
                <tr>
                  <td style="border: 1px solid #cbd5e1; padding: 10px; font-weight: bold; background-color: #f8fafc;">2. Identifikasi</td>
                  <td style="border: 1px solid #cbd5e1; padding: 10px; text-align: justify;">
                    <strong>Karakteristik Siswa / Sasaran:</strong> ${modul.pembelajaranMendalam.identifikasi?.siswa || '-'}<br/>
                    <strong>Materi Pelajaran:</strong> ${modul.pembelajaranMendalam.identifikasi?.materiPelajaran || '-'}<br/>
                    <strong>Capaian Dimensi Lulusan:</strong> ${(modul.pembelajaranMendalam.identifikasi?.capaianDimensiLulusan || []).join(", ") || '-'}
                  </td>
                </tr>
                <tr>
                  <td style="border: 1px solid #cbd5e1; padding: 10px; font-weight: bold; background-color: #f8fafc;">3. Desain Pembelajaran</td>
                  <td style="border: 1px solid #cbd5e1; padding: 10px; text-align: justify;">
                    <strong>Capaian Pembelajaran (CP):</strong> ${modul.pembelajaranMendalam.desainPembelajaran?.capaianPembelajaran || '-'}<br/><br/>
                    <strong>Lintas Disiplin Ilmu:</strong> ${modul.pembelajaranMendalam.desainPembelajaran?.lintasDisiplinIlmu || '-'}<br/><br/>
                    <strong>Tujuan Pembelajaran:</strong> ${modul.pembelajaranMendalam.desainPembelajaran?.tujuanPembelajaran || '-'}<br/><br/>
                    <strong>Topik Pembelajaran:</strong> ${modul.pembelajaranMendalam.desainPembelajaran?.topikPembelajaran || '-'}<br/><br/>
                    <strong>Praktik Pedagogis per Pertemuan:</strong> ${modul.pembelajaranMendalam.desainPembelajaran?.praktikPedagogisPerPertemuan || '-'}<br/><br/>
                    <strong>Kemitraan Pembelajaran:</strong> ${modul.pembelajaranMendalam.desainPembelajaran?.kemitraanPembelajaran || '-'}<br/><br/>
                    <strong>Lingkungan Pembelajaran:</strong> ${modul.pembelajaranMendalam.desainPembelajaran?.lingkunganPembelajaran || '-'}<br/><br/>
                    <strong>Pemanfaatan Digital:</strong> ${modul.pembelajaranMendalam.desainPembelajaran?.pemanfaatanDigital || '-'}
                  </td>
                </tr>
                <tr>
                  <td style="border: 1px solid #cbd5e1; padding: 10px; font-weight: bold; background-color: #f8fafc;">4. Pengalaman Belajar</td>
                  <td style="border: 1px solid #cbd5e1; padding: 10px; text-align: justify;">
                    <strong>Memahami (Mindful Learning):</strong> ${modul.pembelajaranMendalam.pengalamanBelajar?.memahami || '-'}<br/><br/>
                    <strong>Mengaplikasikan (Meaningful Learning):</strong> ${modul.pembelajaranMendalam.pengalamanBelajar?.mengaplikasi || '-'}<br/><br/>
                    <strong>Merefleksikan (Joyful Learning):</strong> ${modul.pembelajaranMendalam.pengalamanBelajar?.refleksi || '-'}
                  </td>
                </tr>
                <tr>
                  <td style="border: 1px solid #cbd5e1; padding: 10px; font-weight: bold; background-color: #f8fafc;">5. Asesmen Pembelajaran</td>
                  <td style="border: 1px solid #cbd5e1; padding: 10px; text-align: justify;">
                    <strong>Asesmen Awal (Diagnostik):</strong> ${modul.pembelajaranMendalam.asesmenPembelajaran?.awal || '-'}<br/><br/>
                    <strong>Asesmen Proses (Formatif):</strong> ${modul.pembelajaranMendalam.asesmenPembelajaran?.proses || '-'}<br/><br/>
                    <strong>Asesmen Akhir (Sumatif):</strong> ${modul.pembelajaranMendalam.asesmenPembelajaran?.akhir || '-'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          ` : ""}

          <div class="section">
            <h2>I. PROFIL PELAJAR PANCASILA</h2>
            <p>${modul.identitas.profilPancasila.join(", ")}</p>
          </div>

          <div class="section">
            <h2>II. KOMPONEN INTI</h2>
            <p><strong>Tujuan:</strong> ${modul.komponenInti.tujuanPembelajaran}</p>
            <p><strong>Pemahaman Bermakna:</strong> ${modul.komponenInti.pemahamanBermakna}</p>
            <p><strong>Pertanyaan Pemantik:</strong> ${modul.komponenInti.pertanyaanPemantik}</p>
          </div>

          <div class="section">
            <h2>III. RENCANA ASESMEN</h2>
            <p><strong>Asesmen Awal (Diagnostik):</strong> ${modul.komponenInti.asesmenAwalDiagnostik}</p>
          </div>

          <div class="section">
            <h2>IV. LANGKAH PEMBELAJARAN</h2>
            <h3>A. Kegiatan Pendahuluan</h3>
            <div>${modul.langkahPembelajaran.pendahuluan}</div>
            <h3>B. Kegiatan Inti (${modul.diferensiasiType})</h3>
            <div>${modul.langkahPembelajaran.inti}</div>
            <h3>C. Kegiatan Penutup</h3>
            <div>${modul.langkahPembelajaran.penutup}</div>
          </div>

          <div class="section">
            <h2>V. BAHAN AJAR MATERI</h2>
            <pre style="white-space: pre-wrap; font-family: inherit;">${modul.generatedBahanAjar ? modul.generatedBahanAjar.materiBahanAjar : modul.materiBahanAjar}</pre>
            ${modul.generatedBahanAjar?.ringkasanTabel ? `
              <h4>Ringkasan Konsep Utama:</h4>
              <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd; font-size: 11px;">
                <thead>
                  <tr style="background: #f3f4f6;">
                    ${modul.generatedBahanAjar.ringkasanTabel.headers.map(h => `<th style="padding: 6px; border: 1px solid #ddd; text-align: left;">${h}</th>`).join("")}
                  </tr>
                </thead>
                <tbody>
                  ${modul.generatedBahanAjar.ringkasanTabel.rows.map(row => `
                    <tr>
                      ${row.map(val => `<td style="padding: 6px; border: 1px solid #ddd;">${val}</td>`).join("")}
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            ` : ""}
          </div>

          <div class="section">
            <h2>VI. LEMBAR KERJA PESERTA DIDIK (LKPD)</h2>
            <p><strong>Petunjuk:</strong></p>
            <ul>
              ${(modul.generatedLkpd ? modul.generatedLkpd.petunjuk : modul.lkpd.petunjuk).map(p => `<li>${p}</li>`).join("")}
            </ul>
            <p><strong>Aktivitas:</strong> ${modul.generatedLkpd ? modul.generatedLkpd.aktivitas : modul.lkpd.aktivitas}</p>
            <p><strong>Logika Refleksi Murid:</strong></p>
            <ol>
              ${(modul.generatedLkpd ? modul.generatedLkpd.pertanyaanPemantikLogika : modul.lkpd.pertanyaanPemantikLogika).map(q => `<li>${q}</li>`).join("")}
            </</ol>
            ${modul.generatedLkpd?.rubrikTabel ? `
              <h4>Rubrik Penilaian:</h4>
              <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd; font-size: 11px;">
                <thead>
                  <tr style="background: #f3f4f6;">
                    ${modul.generatedLkpd.rubrikTabel.headers.map(h => `<th style="padding: 6px; border: 1px solid #ddd; text-align: left;">${h}</th>`).join("")}
                  </tr>
                </thead>
                <tbody>
                  ${modul.generatedLkpd.rubrikTabel.rows.map(row => `
                    <tr>
                      ${row.map(val => `<td style="padding: 6px; border: 1px solid #ddd;">${val}</td>`).join("")}
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            ` : ""}
          </div>
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Modul_Ajar_${modul.tpCode.replace(/\s+/g, '_')}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Tab Selectors */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-2 gap-4">
        <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveSubTab("config")}
            className={`flex items-center px-3 py-1.5 rounded-md text-xs font-medium transition ${
              activeSubTab === "config" ? "bg-white text-slate-800 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
            id="btn-subtab-config"
          >
            <Settings className="w-3.5 h-3.5 mr-1.5" />
            Konfigurasi & Profil
          </button>
          <button
            onClick={() => setActiveSubTab("calendar")}
            className={`flex items-center px-3 py-1.5 rounded-md text-xs font-medium transition ${
              activeSubTab === "calendar" ? "bg-white text-slate-800 shadow-sm" : "text-slate-600 hover:text-slate-950"
            }`}
            id="btn-subtab-calendar"
          >
            <Calendar className="w-3.5 h-3.5 mr-1.5" />
            Kalender Akademik
          </button>
          <button
            onClick={() => setActiveSubTab("promes")}
            className={`flex items-center px-3 py-1.5 rounded-md text-xs font-medium transition ${
              activeSubTab === "promes" ? "bg-white text-slate-800 shadow-sm font-bold" : "text-slate-600 hover:text-slate-950"
            }`}
            id="btn-subtab-promes"
          >
            <Layout className="w-3.5 h-3.5 mr-1.5" />
            ATP, Prota & Promes
          </button>
          <button
            onClick={() => setActiveSubTab("modul")}
            className={`flex items-center px-3 py-1.5 rounded-md text-xs font-medium transition ${
              activeSubTab === "modul" ? "bg-white text-slate-800 shadow-sm font-bold" : "text-slate-600 hover:text-slate-950"
            }`}
            id="btn-subtab-modul"
          >
            <FileText className="w-3.5 h-3.5 mr-1.5" />
            Modul Ajar (RPP+)
          </button>
          <button
            onClick={() => {
              setActiveSubTab("lkpd");
              setActiveDocTab("lkpd");
            }}
            className={`flex items-center px-3 py-1.5 rounded-md text-xs font-medium transition ${
              activeSubTab === "lkpd" ? "bg-white text-slate-800 shadow-sm font-bold" : "text-slate-600 hover:text-slate-950"
            }`}
            id="btn-subtab-lkpd"
          >
            <ClipboardList className="w-3.5 h-3.5 mr-1.5" />
            LKPD
          </button>
          <button
            onClick={() => {
              setActiveSubTab("bahan");
              setActiveDocTab("bahan");
            }}
            className={`flex items-center px-3 py-1.5 rounded-md text-xs font-medium transition ${
              activeSubTab === "bahan" ? "bg-white text-slate-805 shadow-sm font-bold" : "text-slate-600 hover:text-slate-950"
            }`}
            id="btn-subtab-bahan"
          >
            <BookOpen className="w-3.5 h-3.5 mr-1.5" />
            Bahan Ajar
          </button>
          <button
            onClick={() => setActiveSubTab("asesmen")}
            className={`flex items-center px-3 py-1.5 rounded-md text-xs font-medium transition ${
              activeSubTab === "asesmen" ? "bg-white text-slate-808 shadow-sm font-bold" : "text-slate-600 hover:text-slate-950"
            }`}
            id="btn-subtab-asesmen"
          >
            <CheckSquare className="w-3.5 h-3.5 mr-1.5" />
            Asesmen Formatif
          </button>
          <button
            onClick={() => {
              setActiveSubTab("slide");
              setActiveDocTab("slide");
            }}
            className={`flex items-center px-3 py-1.5 rounded-md text-xs font-medium transition ${
              activeSubTab === "slide" ? "bg-white text-slate-810 shadow-sm font-bold" : "text-slate-600 hover:text-slate-955"
            }`}
            id="btn-subtab-slide"
          >
            <Presentation className="w-3.5 h-3.5 mr-1.5" />
            Slide Materi PPT
          </button>
        </div>

        {/* Live Counters */}
        <div className="flex items-center space-x-4 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 text-[11px] text-emerald-800">
          <div>
            <span className="font-semibold">Minggu Efektif:</span> {effectiveWeeksCount} / {totalWeeks} Pekan
          </div>
          <div className="h-3 w-px bg-emerald-200"></div>
          <div>
            <span className="font-semibold">Total Alokasi Efektif:</span> {totalEffectiveJp} JP
          </div>
        </div>
      </div>

      {/* Main Panel Content */}

      {/* Sub-tab 1: Configuration Form */}
      {activeSubTab === "config" && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3 border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 font-display">Identitas Administrasi Sekolah & Guru</h2>
              <p className="text-xs text-slate-500">Sesuaikan data kop kedinasan, batas ketuntasan, dan alokasi mengajar.</p>
            </div>
            <Save className="text-emerald-500 w-5 h-5" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Nama Satuan Pendidikan (Sekolah)</label>
              <input
                type="text"
                value={config.schoolName}
                onChange={e => setConfig(prev => ({ ...prev, schoolName: e.target.value }))}
                className="w-full text-xs border rounded-lg p-2 focus:ring-1 focus:ring-emerald-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Fase Kurikulum</label>
              <select
                value={config.phase}
                onChange={e => setConfig(prev => ({ ...prev, phase: e.target.value as any }))}
                className="w-full text-xs border rounded-lg p-2 focus:ring-1 focus:ring-emerald-500 font-medium"
              >
                <option value="A">A (Kelas 1 - 2)</option>
                <option value="B">B (Kelas 3 - 4)</option>
                <option value="C">C (Kelas 5 - 6)</option>
                <option value="D">D (Kelas 7 - 9)</option>
                <option value="E">E (Kelas 10)</option>
                <option value="F">F (Kelas 11 - 12)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Romawi Kelas</label>
              <input
                type="text"
                value={config.grade}
                onChange={e => setConfig(prev => ({ ...prev, grade: e.target.value }))}
                className="w-full text-xs border rounded-lg p-2 focus:ring-1 focus:ring-emerald-500 font-medium"
                placeholder="Misal: Kelas 5"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Mata Pelajaran</label>
              <input
                type="text"
                value={config.subject}
                onChange={e => setConfig(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full text-xs border rounded-lg p-2 focus:ring-1 focus:ring-emerald-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Tahun Ajaran</label>
              <input
                type="text"
                value={config.academicYear}
                onChange={e => setConfig(prev => ({ ...prev, academicYear: e.target.value }))}
                className="w-full text-xs border rounded-lg p-2 focus:ring-1 focus:ring-emerald-500 font-medium font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Semester</label>
              <select
                value={config.semester}
                onChange={e => setConfig(prev => ({ ...prev, semester: e.target.value as any }))}
                className="w-full text-xs border rounded-lg p-2 focus:ring-1 focus:ring-emerald-500 font-medium"
              >
                <option value="Ganjil">Semester Ganjil</option>
                <option value="Genap">Semester Genap</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Target KKTP Nilai Lulus</label>
              <input
                type="number"
                value={config.kktp}
                onChange={e => setConfig(prev => ({ ...prev, kktp: parseInt(e.target.value) || 70 }))}
                className="w-full text-xs border rounded-lg p-2 focus:ring-1 focus:ring-emerald-500 font-medium font-mono"
                min="50" max="100"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Jam Pelajaran Per Pekan (JP)</label>
              <input
                type="number"
                value={config.weeklyJp}
                onChange={e => setConfig(prev => ({ ...prev, weeklyJp: parseInt(e.target.value) || 4 }))}
                className="w-full text-xs border rounded-lg p-2 focus:ring-1 focus:ring-emerald-500 font-medium font-mono"
                min="1" max="10"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Nama Guru Pengampu</label>
              <input
                type="text"
                value={config.teacherName}
                onChange={e => setConfig(prev => ({ ...prev, teacherName: e.target.value }))}
                className="w-full text-xs border rounded-lg p-2 focus:ring-1 focus:ring-emerald-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">NIP Guru</label>
              <input
                type="text"
                value={config.teacherNip}
                onChange={e => setConfig(prev => ({ ...prev, teacherNip: e.target.value }))}
                className="w-full text-xs border rounded-lg p-2 focus:ring-1 focus:ring-emerald-500 font-mono"
                placeholder="Masukan NIP"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Nama Kepala Sekolah</label>
              <input
                type="text"
                value={config.headmasterName}
                onChange={e => setConfig(prev => ({ ...prev, headmasterName: e.target.value }))}
                className="w-full text-xs border rounded-lg p-2 focus:ring-1 focus:ring-emerald-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">NIP Kepala Sekolah</label>
              <input
                type="text"
                value={config.headmasterNip}
                onChange={e => setConfig(prev => ({ ...prev, headmasterNip: e.target.value }))}
                className="w-full text-xs border rounded-lg p-2 focus:ring-1 focus:ring-emerald-500 font-mono"
              />
            </div>
          </div>
          <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 flex items-start text-xs text-amber-800">
            <HelpCircle className="w-5 h-5 mr-3 text-amber-600 flex-shrink-0" />
            <div>
              <p className="font-bold mb-1">Perubahan Terpadu:</p>
              Semua info di atas disinkronkan secara total (Single Source of Truth) ke dalam berkas kop resmi, estimasi draf RPP, kisi evaluasi harian, hingga penilaian akhir semester.
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab 2: Calendar Management */}
      {activeSubTab === "calendar" && (
        <div className="space-y-6">
          {/* Header & Academic General Info */}
          <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
            <div className="absolute right-0 bottom-0 opacity-10 translate-x-1/4 translate-y-1/4">
              <Calendar className="w-64 h-64 text-white" />
            </div>
            <div className="max-w-xl relative z-10 space-y-2">
              <span className="bg-blue-600 text-blue-100 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-blue-400">
                Hub Kurikulum Merdeka
              </span>
              <h2 className="text-xl font-black font-display tracking-tight text-white uppercase">
                Kalender Akademik &amp; Manajemen Hari Libur Terpadu
              </h2>
              <p className="text-xs text-blue-100/90 leading-relaxed text-justify">
                Kelola hari efektif belajar mengajar secara rincian, sinkronkan hari libur keagamaan, libur nasional, jeda semester, maupun kegiatan khusus sekolah secara interaktif ke pekan ajar aktif.
              </p>
            </div>
          </div>

          {/* GENERATOR HARI EFEKTIF / BULAN JULI - JUNI */}
          <div className="bg-slate-50 border border-slate-205 rounded-2xl p-6 shadow-xs space-y-4 text-left">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-xl text-blue-700">
                <Settings className="w-5 h-5 animate-spin-slow" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 font-display">
                  Inisialisasi &amp; Generator Rentang Kalender Akademik
                </h3>
                <p className="text-[11px] text-slate-500">
                  Konfigurasikan Tahun Pelajaran dan generate daftar pekan akademik dari bulan Juli s.d. Juni secara otomatis.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end text-xs">
              <div className="space-y-1 md:col-span-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Pilih Tahun Pelajaran
                </label>
                <select
                  value={selectedGenerateYear}
                  onChange={e => setSelectedGenerateYear(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 bg-white rounded-xl font-bold text-slate-800 focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="2025/2026">2025/2026</option>
                  <option value="2026/2027">2026/2027</option>
                  <option value="2027/2028">2027/2028</option>
                  <option value="2028/2029">2028/2029</option>
                  <option value="2029/2030">2029/2030</option>
                </select>
              </div>

              <div className="space-y-1 md:col-span-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Cakup Rentang Pekan
                </label>
                <div className="flex space-x-1 p-1 bg-slate-200/50 border border-slate-200 rounded-xl select-none h-11 items-center">
                  <button
                    type="button"
                    onClick={() => setWeeksCountToGenerate(18)}
                    className={`flex-1 text-center py-1.5 rounded-lg text-[11px] font-bold transition duration-150 ${
                      weeksCountToGenerate === 18
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    18 Pekan (1 Sem)
                  </button>
                  <button
                    type="button"
                    onClick={() => setWeeksCountToGenerate(36)}
                    className={`flex-1 text-center py-1.5 rounded-lg text-[11px] font-bold transition duration-150 ${
                      weeksCountToGenerate === 36
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    36 Pekan (Full Yr)
                  </button>
                </div>
              </div>

              <div className="md:col-span-2">
                <button
                  type="button"
                  onClick={() => handleGenerateAcademicCalendar(selectedGenerateYear, weeksCountToGenerate)}
                  className="w-full flex items-center justify-center p-3 h-11 font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 hover:shadow-xs transition duration-150"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Generate Pekan Akademik (Juli s.d Juni)
                </button>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 italic">
              *Catatan: Langkah pengisian ulang ini akan menyelaraskan hari efektif dan rentang tanggal baru secara otomatis (Single Source of Truth).
            </p>
          </div>

          {/* Success Alerts */}
          {holidaySuccessMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-250 text-emerald-800 rounded-xl text-xs font-bold animate-fade-in flex items-center shadow-xs">
              <CheckCircle className="w-5 h-5 text-emerald-650 mr-2 shrink-0" />
              <span>{holidaySuccessMsg}</span>
            </div>
          )}

          {/* Core Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* COLUMN 1: INTERACTIVE HOLIDAY HUB (LEFT COLUMN, col-span-7) */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-205 p-6 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-extrabold text-slate-900 font-display">
                    Daftar Hari Libur &amp; Agenda Daerah
                  </h3>
                  <p className="text-[11px] text-slate-500">Tap tombol hubungkan untuk sinkronisasi otomatis ke minggu akademik.</p>
                </div>
                
                <button
                  onClick={() => setShowAddHolidayForm(!showAddHolidayForm)}
                  className="flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-950 text-white shadow-xs transition"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  {showAddHolidayForm ? "Sembunyikan Form" : "Tambah Kustom"}
                </button>
              </div>

              {/* Form to Add Custom Holiday */}
              {showAddHolidayForm && (
                <form 
                  onSubmit={handleAddCustomHoliday}
                  className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 animate-slide-down text-left"
                >
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center">
                    <Plus className="w-3.5 h-3.5 text-blue-600 mr-1.5" />
                    Tambah Hari Libur / Agenda Baru
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Nama Hari Libur</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Libur Hari Pendidikan Nasional"
                        value={newHolidayName}
                        onChange={e => setNewHolidayName(e.target.value)}
                        className="w-full p-2 border border-slate-250 bg-white rounded-lg font-medium text-slate-850"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Kategori Libur</label>
                      <select
                        value={newHolidayType}
                        onChange={e => setNewHolidayType(e.target.value as any)}
                        className="w-full p-2 border border-slate-250 bg-white rounded-lg font-bold text-slate-750"
                      >
                        <option value="nasional">🇮🇩 Libur Nasional / Kenegaraan</option>
                        <option value="keagamaan">🕌 Libur Keagamaan</option>
                        <option value="akademik">🎓 Libur Akademik &amp; Sekolah</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Waktu / Tanggal</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: 02 Mei 2026"
                        value={newHolidayDate}
                        onChange={e => setNewHolidayDate(e.target.value)}
                        className="w-full p-2 border border-slate-250 bg-white rounded-lg font-medium text-slate-850"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Agenda Pekan (Otomatis Ditulis)</label>
                      <input
                        type="text"
                        placeholder="Contoh: Libur Hardiknas"
                        value={newSuggestedActivity}
                        onChange={e => setNewSuggestedActivity(e.target.value)}
                        className="w-full p-2 border border-slate-250 bg-white rounded-lg font-medium font-mono text-[11px] text-slate-850"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Deskripsi / Penjelasan Singkat</label>
                    <textarea
                      rows={2}
                      placeholder="Catatan pemicu / makna kegiatan ini..."
                      value={newHolidayDesc}
                      onChange={e => setNewHolidayDesc(e.target.value)}
                      className="w-full p-2 border border-slate-250 bg-white rounded-lg text-xs"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddHolidayForm(false)}
                      className="px-3 py-1.5 rounded-lg border border-slate-205 text-slate-600 bg-white hover:bg-slate-50 text-xs font-bold font-display"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold font-display"
                    >
                      Simpan Agenda
                    </button>
                  </div>
                </form>
              )}

              {/* Holiday Filters Subtabs */}
              <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl scrollbar-none select-none">
                {[
                  { id: "semua", label: "Semua Libur" },
                  { id: "nasional", label: "🇮🇩 Nasional" },
                  { id: "keagamaan", label: "🕌 Keagamaan" },
                  { id: "akademik", label: "🎓 Akademik / Sekolah" }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setHolidayTab(tab.id as any)}
                    className={`flex-1 text-center py-1.5 px-3 rounded-lg text-xs font-bold transition duration-150 ${
                      holidayTab === tab.id 
                        ? "bg-white text-slate-900 shadow-xs" 
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* list of filtered holidays */}
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {filteredHolidays.map(holiday => {
                  // Find if this holiday suggestedActivityName is already map to any of the week's activityName
                  const connectedWeek = weeks.find(w => w.activityName && w.activityName.toLowerCase().includes((holiday.suggestedActivityName || holiday.name).toLowerCase()));
                  
                  return (
                    <div 
                      key={holiday.id}
                      className={`p-3.5 rounded-xl border transition text-left flex flex-col space-y-2.5 ${
                        connectedWeek 
                          ? "bg-emerald-50/20 border-emerald-200/80 shadow-[0_2px_4px_rgba(16,185,129,0.02)]" 
                          : "bg-white border-slate-200 hover:bg-slate-50/50"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                            {holiday.type === "nasional" && (
                              <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded text-[9px] font-extrabold uppercase border border-red-200 tracking-wider">
                                🇮🇩 Nasional
                              </span>
                            )}
                            {holiday.type === "keagamaan" && (
                              <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-[9px] font-extrabold uppercase border border-amber-200 tracking-wider">
                                🕌 Keagamaan
                              </span>
                            )}
                            {holiday.type === "akademik" && (
                              <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[9px] font-extrabold uppercase border border-indigo-200 tracking-wider">
                                🎓 Akademik
                              </span>
                            )}
                            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono text-[9px] font-bold">
                              {holiday.date}
                            </span>
                          </div>
                          <span className="block font-black font-display text-slate-900 text-xs sm:text-[13px] leading-tight">
                            {holiday.name}
                          </span>
                        </div>

                        {/* If custom, allow deleting */}
                        {holiday.id.startsWith("h_custom_") && (
                          <button
                            type="button"
                            onClick={() => handleDeleteCustomHoliday(holiday.id)}
                            className="p-1 text-slate-400 hover:text-red-600 transition hover:bg-slate-100 rounded-lg shrink-0"
                            title="Hapus Libur Kustom"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <p className="text-[10.5px] text-slate-500 leading-relaxed text-justify italic">
                        {holiday.description}
                      </p>

                      <div className="pt-2 border-t border-dashed border-slate-150 flex flex-wrap items-center justify-between gap-2">
                        {connectedWeek ? (
                          <div className="flex items-center space-x-1 text-[10px] text-emerald-650 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-150 select-none">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Terkoneksi pada Minggu Ke-{connectedWeek.weekNum}</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1.5 w-full sm:w-auto mt-1 sm:mt-0 justify-between sm:justify-start">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mr-1">Tautkan Pekan:</span>
                            <div className="flex items-center space-x-1">
                              <select
                                className="p-1 px-2 text-[10.5px] font-black text-slate-755 bg-slate-50 border border-slate-200 rounded-md outline-none cursor-pointer focus:ring-1 focus:ring-blue-500"
                                onChange={(e) => {
                                  const idx = parseInt(e.target.value);
                                  if (!isNaN(idx)) {
                                    handleConnectHolidayToWeek(idx, holiday.suggestedActivityName || holiday.name);
                                    e.target.value = ""; // reset
                                  }
                                }}
                                title="Pilih Minggu untuk dihubungkan"
                              >
                                <option value="">Pilih Pekan Efektif...</option>
                                {weeks.map((w, index) => (
                                  <option key={w.weekNum} value={index}>
                                    Pek-{w.weekNum} ({w.isEffective ? "Aktif" : "Libur"} - {w.dateRange})
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        )}
                        
                        <div className="text-[10px] text-slate-400 font-medium font-mono">
                          Revisi ajar: <strong className="text-slate-600">0 JP</strong>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* COLUMN 2: SEMESTER GRAPHICAL VISUALIZATION & WEEK LIST (RIGHT COLUMN, col-span-5) */}
            <div className="lg:col-span-12 xl:col-span-5 space-y-6">
              
              {/* Semester Months Grid (Jul 2025 - Des 2025) */}
              <div className="bg-white rounded-2xl border border-slate-205 p-6 shadow-xs space-y-4">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-extrabold text-slate-900 font-display">
                    Matriks Bulanan Semester {config.semester}
                  </h3>
                  <p className="text-[11px] text-slate-500">Visualisasi status program ajar (Merah = Libur, Hijau = Belajar).</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-left">
                  {getMonthsAndWeeksForCurrentSemester().map(m => {
                    return (
                      <div key={m.name} className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                        <div className="flex items-center justify-between select-none">
                          <span className="text-[11px] font-black text-slate-900 font-display">{m.name}</span>
                          <span className="text-[9px] text-slate-400 truncate max-w-[60px]">{m.desc}</span>
                        </div>

                        {m.weeksInMonth.length > 0 ? (
                          <div className="flex items-center space-x-1 pt-1 justify-start">
                            {m.weeksInMonth.map(wIdx => {
                              const wk = weeks[wIdx];
                              if (!wk) return null;
                              return (
                                <div
                                  key={wk.weekNum}
                                  className={`w-7 h-7 rounded-lg text-[9px] font-bold flex flex-col items-center justify-center border text-center font-mono cursor-pointer transition select-none ${
                                    wk.isEffective
                                      ? "bg-emerald-500 border-emerald-600 text-white hover:bg-emerald-600"
                                      : "bg-red-500 border-red-650 text-white hover:bg-red-600"
                                  }`}
                                  onClick={() => handleToggleWeek(wIdx)}
                                  title={`Minggu ${wk.weekNum} (${wk.dateRange}): ${wk.activityName}`}
                                >
                                  <span>W{wk.weekNum}</span>
                                  <div className={`w-1 h-1 rounded-full ${wk.isEffective ? 'bg-emerald-200' : 'bg-red-200'}`} />
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-[9px] font-semibold text-slate-405 italic pt-1 pb-1">
                            Semester Break (Libur)
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Weeks Interactive List */}
              <div className="bg-white rounded-2xl border border-slate-205 p-6 shadow-xs space-y-4">
                <div className="space-y-0.5 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 font-display">
                      Modifikasi {weeks.length} Pekan Akademik
                    </h3>
                    <p className="text-[11px] text-slate-500">Sesuaikan draf rincian agenda ajar harian per minggu.</p>
                  </div>
                  <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold rounded-lg px-2.5 py-0.5 font-mono select-none">
                    SSOT SYNCED
                  </span>
                </div>

                <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                  {weeks.map((wk, idx) => (
                    <div 
                      key={wk.weekNum}
                      className={`p-3 rounded-xl border transition flex items-start space-x-2.5 text-xs ${
                        wk.isEffective 
                          ? "bg-slate-50 border-slate-200 hover:bg-slate-100/50" 
                          : "bg-red-50/40 border-red-150 hover:bg-red-50/70"
                      }`}
                    >
                      <div className="mt-1 shrink-0">
                        <input
                          type="checkbox"
                          checked={wk.isEffective}
                          onChange={() => handleToggleWeek(idx)}
                          className="rounded border-slate-350 text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                        />
                      </div>
                      <div className="flex-grow space-y-1.5 text-left min-w-0">
                        <div className="flex items-center justify-between select-none">
                          <span className="font-bold text-slate-900 font-display">Minggu Ke-{wk.weekNum}</span>
                          <span className="text-[9.5px] text-slate-450 font-mono font-medium">{wk.dateRange}</span>
                        </div>
                        <input
                          type="text"
                          value={wk.activityName}
                          onChange={e => handleWeekActivityChange(idx, e.target.value)}
                          className={`w-full p-1.5 py-1 text-[11px] border rounded bg-white font-medium focus:ring-1 focus:ring-blue-500 ${
                            wk.isEffective ? "text-slate-800 border-slate-205" : "text-red-750 font-black border-red-200"
                          }`}
                        />
                        <div className="text-[9px] text-slate-400 select-none flex items-center justify-between font-medium">
                          <span>{wk.isEffective ? `Kegiatan Belajar (+ ${config.weeklyJp} JP)` : "Non-Efektif (0 JP)"}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${wk.isEffective ? 'bg-emerald-100 text-emerald-850' : 'bg-red-100 text-red-850'}`}>
                            {wk.isEffective ? 'Aktif' : 'Libur'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Sub-tab 3: ATP & Prota / Promes Mapping */}
      {activeSubTab === "promes" && (
        <div className="space-y-6">
          {/* Section: Head Office Information & Setup ATP */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between border-b pb-3 border-slate-100 gap-2">
              <div>
                <h2 className="text-sm font-bold text-slate-900 font-display">Tujuan Pembelajaran (ATP) & Distribusi Prota</h2>
                <p className="text-xs text-slate-500">Mendaftarkan capaian Alur Tujuan Pembelajaran dan menjatah mingguan efektif semesteran secara seimbang.</p>
              </div>

              {/* AI Auto Distribute button */}
              <button
                onClick={handleAutoGeneratePromes}
                disabled={isGeneratingModul}
                className="flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5 animate-pulse" />
                {isGeneratingModul ? "Memproses..." : "AI Hasilkan ATP & Promes Proporsional"}
              </button>
            </div>

            {/* Error alerts if any */}
            {apiError && (
              <div className="p-3 bg-red-100 text-red-800 text-xs rounded-xl flex items-center justify-between">
                <span><strong>Kesalahan:</strong> {apiError}</span>
                <button onClick={() => setApiError("")} className="text-red-900 font-bold ml-2">X</button>
              </div>
            )}

            {/* AI Generation Step Indicator */}
            {isGeneratingModul && (
              <div className="p-4 bg-slate-50 border rounded-xl flex flex-col items-center justify-center space-y-3">
                <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin"></div>
                <p className="text-xs text-slate-700 font-medium animate-pulse">{generationStep}</p>
              </div>
            )}

            {/* Add / Edit ATP Form */}
            <form onSubmit={handleSaveAtp} className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-slate-700 mb-1 uppercase tracking-wider">Kode TP</label>
                <input
                  type="text"
                  value={atpCode}
                  onChange={e => setAtpCode(e.target.value)}
                  className="w-full text-xs border rounded-lg p-2 bg-white font-mono placeholder:text-slate-400"
                  placeholder="E.g., TP 1.1"
                  required
                />
              </div>
              <div className="md:col-span-6">
                <label className="block text-[10px] font-bold text-slate-700 mb-1 uppercase tracking-wider">Rumusan Tujuan Pembelajaran (ATP)</label>
                <input
                  type="text"
                  value={atpText}
                  onChange={e => setAtpText(e.target.value)}
                  className="w-full text-xs border rounded-lg p-2 bg-white placeholder:text-slate-400 font-medium text-slate-800"
                  placeholder="Capaian kognitif operasional Kurikulum Merdeka..."
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-slate-700 mb-1 uppercase tracking-wider">Alokasi JP</label>
                <input
                  type="number"
                  value={atpJp}
                  onChange={e => setAtpJp(parseInt(e.target.value) || 8)}
                  className="w-full text-xs border rounded-lg p-2 bg-white font-mono"
                  placeholder="JP"
                  min="2" max="32"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="w-full bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center transition shadow-sm h-[34px]"
                >
                  {editingAtp ? "Simpan Perubahan" : "Tambah TP"}
                </button>
              </div>
            </form>

            {/* ATP List Table (Prota Preview) */}
            <div className="overflow-x-auto border rounded-xl border-slate-200">
              <table className="min-w-full text-xs text-left text-slate-600">
                <thead className="bg-slate-100 text-[10px] uppercase text-slate-700 font-bold tracking-wider">
                  <tr>
                    <th scope="col" className="px-4 py-3 w-20">Kode</th>
                    <th scope="col" className="px-4 py-3">Deskripsi Tujuan Pembelajaran (TP)</th>
                    <th scope="col" className="px-4 py-3 w-24 text-center">Alokasi JP</th>
                    <th scope="col" className="px-4 py-3 w-28 text-center">Rencana Pekan</th>
                    <th scope="col" className="px-4 py-3 w-28 text-center">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {atpList.map(atp => (
                    <tr key={atp.id} className="hover:bg-slate-50 transition font-medium">
                      <td className="px-4 py-3.5 font-bold text-slate-900 font-mono">{atp.code}</td>
                      <td className="px-4 py-3.5 text-slate-800 leading-relaxed max-w-sm sm:max-w-md">{atp.tpText}</td>
                      <td className="px-4 py-3.5 text-center font-mono font-bold text-slate-800 bg-slate-50/50">{atp.jpAllocation} JP</td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="bg-slate-100 text-slate-800 px-2 py-1 rounded text-[10px] font-mono leading-none">
                          Wk {atp.targetWeeks.join(", ") || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center space-x-1.5 flex items-center justify-center h-full">
                        <button
                          onClick={() => triggerEditAtp(atp)}
                          className="bg-slate-100 text-slate-700 p-1.5 rounded hover:bg-emerald-50 hover:text-emerald-700 transition"
                          title="Ubah ATP"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteAtp(atp.id)}
                          className="bg-slate-100 text-slate-700 p-1.5 rounded hover:bg-red-50 hover:text-red-700 transition"
                          title="Hapus ATP"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {atpList.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-slate-400 italic">
                        Belum ada Alur Tujuan Pembelajaran. Ketuk tombol &quot;AI Hasilkan ATP&quot; di atas untuk otomatisasi instan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section: Program Semester (Promes) Visual Matrix Grid */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 font-display">Matriks Visual Program Semester (Promes)</h2>
              <p className="text-xs text-slate-500">Representasi distribusi pekan pembelajaran efektif. Shading hijau menunjukan target mengajar materi tertentu.</p>
            </div>

            <div className="overflow-x-auto border rounded-xl border-slate-200">
              <table className="min-w-full text-xs text-center border-collapse">
                <thead>
                  <tr className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200">
                    <th className="px-4 py-3 text-left w-24">Kode TP</th>
                    <th className="px-4 py-3 text-left max-w-xs">Tujuan Pembelajaran</th>
                    <th className="px-2 py-3 w-16">JP</th>
                    {weeks.map(w => (
                      <th 
                        key={w.weekNum} 
                        className={`px-1 py-3 text-[10px] w-8 border-l border-slate-200 font-mono ${
                          !w.isEffective ? "bg-red-50 text-red-800" : ""
                        }`}
                        title={w.activityName}
                      >
                        W{w.weekNum}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {atpList.map(atp => (
                    <tr key={atp.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 text-left font-bold text-slate-900 font-mono">{atp.code}</td>
                      <td className="px-4 py-3 text-left max-w-xs truncate text-slate-700" title={atp.tpText}>{atp.tpText}</td>
                      <td className="px-2 py-3 font-mono font-semibold text-slate-800 bg-slate-50">{atp.jpAllocation}</td>
                      
                      {/* Grid representation per week */}
                      {weeks.map((w, idx) => {
                        // Check if this week targets this ATP
                        const totalEffectiveWeeksSoFar = weeks.slice(0, idx + 1).filter(item => item.isEffective).length;
                        const isThisAtpTarget = w.isEffective && atp.targetWeeks.includes(totalEffectiveWeeksSoFar);

                        return (
                          <td 
                            key={w.weekNum} 
                            className={`border-l border-slate-200 p-1 ${
                              !w.isEffective 
                                ? "bg-red-50 text-red-800 text-[10px]" 
                                : isThisAtpTarget 
                                  ? "bg-emerald-500 hover:bg-emerald-600 border-emerald-300"
                                  : ""
                            }`}
                            title={`${atp.code} - Week ${w.weekNum}: ${w.activityName}`}
                          >
                            {isThisAtpTarget && (
                              <div className="w-2 h-2 rounded-full bg-white mx-auto shadow-sm" />
                            )}
                            {!w.isEffective && (
                              <span className="font-bold text-[9px] scale-90 block text-red-500">X</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  {atpList.length === 0 && (
                    <tr>
                      <td colSpan={totalWeeks + 3} className="px-4 py-6 text-slate-500 italic">
                        Belum ada matriks Promes. Sinkronkan dengan AI di atas terlebih dahulu.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center space-x-6 text-[11px] text-slate-600 bg-slate-50 p-3 rounded-lg border">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-emerald-500 rounded-sm mr-2" />
                <span>Pekan Target Pembelajaran Aktif</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-50 border border-red-100 flex items-center justify-center text-red-500 font-bold text-[9px] mr-2">X</div>
                <span>Pekan Non-Efektif (Libur/Kegiatan Sekolah)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-white border border-slate-200 rounded-sm mr-2" />
                <span>Pekan Efektif/Antrean Materi</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab 4: AI Modul Ajar (RPP+) Generator */}
      {activeSubTab === "modul" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left panel: Trigger list */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4 max-h-[850px] overflow-y-auto">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-display flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Rancangan Pembelajaran Mendalam (AI)</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Lengkapi parameter di bawah untuk memicu perumusan modul ajar berbasis 3 pilar Pembelajaran Mendalam (Deep Learning).</p>
            </div>

            {/* Selector TP */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-700">1. Pilih Tujuan Pembelajaran (TP)</label>
              <select
                value={selectedTpForAjar}
                onChange={e => setSelectedTpForAjar(e.target.value)}
                className="w-full text-xs border rounded-lg p-2 bg-white font-medium focus:ring-1 focus:ring-emerald-500"
              >
                <option value="">-- Silakan Pilih --</option>
                {atpList.map(a => (
                  <option key={a.id} value={a.code}>{a.code} - {a.tpText}</option>
                ))}
              </select>
            </div>

            {/* Jenjang & Kelas */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-700">2. Jenjang</label>
                <select
                  value={jenjang}
                  onChange={e => {
                    const nextJenjang = e.target.value as "SD" | "SMP" | "SMA";
                    setJenjang(nextJenjang);
                    // Reset to first class option in that level
                    if (nextJenjang === "SD") setKelas("Kelas 5");
                    else if (nextJenjang === "SMP") setKelas("Kelas 7");
                    else setKelas("Kelas 10");
                  }}
                  className="w-full text-xs border rounded-lg p-2 bg-white focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="SD">SD</option>
                  <option value="SMP">SMP</option>
                  <option value="SMA">SMA</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-700">3. Kelas</label>
                <select
                  value={kelas}
                  onChange={e => setKelas(e.target.value)}
                  className="w-full text-xs border rounded-lg p-2 bg-white focus:ring-1 focus:ring-emerald-500"
                >
                  {jenjang === "SD" && ["Kelas 1", "Kelas 2", "Kelas 3", "Kelas 4", "Kelas 5", "Kelas 6"].map(c => <option key={c} value={c}>{c}</option>)}
                  {jenjang === "SMP" && ["Kelas 7", "Kelas 8", "Kelas 9"].map(c => <option key={c} value={c}>{c}</option>)}
                  {jenjang === "SMA" && ["Kelas 10", "Kelas 11", "Kelas 12"].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Materi Pelajaran & Durasi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-700">4. Materi Pelajaran</label>
                <input
                  type="text"
                  value={materiPelajaran}
                  onChange={e => setMateriPelajaran(e.target.value)}
                  placeholder="Misal: Sistem Pernapasan"
                  className="w-full text-xs border rounded-lg p-2 bg-white focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-700 font-sans">5. Durasi Pertemuan</label>
                <input
                  type="text"
                  value={durasiSetiapPertemuan}
                  onChange={e => setDurasiSetiapPertemuan(e.target.value)}
                  placeholder="Contoh: 2 x 35 menit"
                  className="w-full text-xs border rounded-lg p-2 bg-white focus:ring-1 focus:ring-emerald-500 font-sans"
                />
              </div>
            </div>

            {/* Capaian Pembelajaran */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-700">6. Capaian Pembelajaran (CP) Isian</label>
              <textarea
                value={capaianPembelajaran}
                onChange={e => setCapaianPembelajaran(e.target.value)}
                placeholder="Salin atau ketik capaian pembelajaran di sini..."
                className="w-full text-xs border rounded-lg p-2 h-16 bg-white focus:ring-1 focus:ring-emerald-500 leading-relaxed font-sans scrollbar-thin"
              />
            </div>

            {/* Jumlah Pertemuan & Gaya Diferensiasi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-700">7. Jumlah Pertemuan</label>
                <select
                  value={jumlahPertemuan}
                  onChange={e => {
                    const val = Number(e.target.value);
                    setJumlahPertemuan(val);
                    setPraktikPedagogisPerPertemuan(prev => {
                      const cloned = [...prev];
                      if (cloned.length < val) {
                        while (cloned.length < val) {
                          cloned.push("Inkuiri-Discovery Learning");
                        }
                      } else if (cloned.length > val) {
                        return cloned.slice(0, val);
                      }
                      return cloned;
                    });
                  }}
                  className="w-full text-xs border rounded-lg p-2 bg-white focus:ring-1 focus:ring-emerald-500"
                >
                  {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} Pertemuan</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-700">8. Gaya Diferensiasi</label>
                <select
                  value={diffType}
                  onChange={e => setDiffType(e.target.value as any)}
                  className="w-full text-xs border rounded-lg p-2 bg-white focus:ring-1 focus:ring-emerald-500 font-medium"
                >
                  <option value="Tidak">Tanpa Diferensiasi Khusus</option>
                  <option value="Gaya Belajar">Diferensiasi Gaya Belajar</option>
                  <option value="Diferensiasi Kognitif">Diferensiasi Kognitif</option>
                </select>
              </div>
            </div>

            {/* Praktik Pedagogis per Pertemuan */}
            <div className="bg-slate-50/70 rounded-lg p-3 border border-slate-100 space-y-2">
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">9. Praktik Pedagogis per Pertemuan</span>
              <div className="space-y-2">
                {Array.from({ length: jumlahPertemuan }).map((_, idx) => (
                  <div key={idx} className="flex flex-col space-y-0.5">
                    <span className="text-[10px] font-semibold text-slate-600">Pertemuan {idx + 1}:</span>
                    <select
                      value={praktikPedagogisPerPertemuan[idx] || "Inkuiri-Discovery Learning"}
                      onChange={e => {
                        const nextVal = e.target.value;
                        setPraktikPedagogisPerPertemuan(prev => {
                          const cloned = [...prev];
                          cloned[idx] = nextVal;
                          return cloned;
                        });
                      }}
                      className="w-full text-[11px] border rounded-md p-1.5 bg-white focus:ring-1 focus:ring-emerald-500 font-medium"
                    >
                      <option value="Inkuiri-Discovery Learning">Inkuiri-Discovery Learning</option>
                      <option value="PjBL (Project Based Learning)">PjBL (Project Based Learning)</option>
                      <option value="Problem Based Learning">Problem Based Learning</option>
                      <option value="Game Based Learning">Game Based Learning</option>
                      <option value="Station Learning">Station Learning</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* Dimensi Lulusan (Multi check) */}
            <div className="space-y-1.5 bg-slate-50/70 rounded-lg p-3 border border-slate-100">
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">10. Dimensi Lulusan Terpilih</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  "Keimanan & Ketakwaan",
                  "Kewargaan",
                  "Penalaran Kritis",
                  "Kreativitas",
                  "Kolaborasi",
                  "Kemandirian",
                  "Kesehatan",
                  "Komunikasi"
                ].map(dim => {
                  const isChecked = dimensiLulusan.includes(dim);
                  return (
                    <label 
                      key={dim} 
                      className={`flex items-center space-x-1.5 p-1.5 rounded border border-dashed transition cursor-pointer select-none ${
                        isChecked ? "border-emerald-250 bg-emerald-50/30 text-emerald-900" : "border-slate-200 bg-white text-slate-600"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          setDimensiLulusan(prev => 
                            prev.includes(dim) ? prev.filter(d => d !== dim) : [...prev, dim]
                          );
                        }}
                        className="text-emerald-600 focus:ring-emerald-500 rounded h-3 w-3 cursor-pointer"
                      />
                      <span className="text-[10px] font-medium leading-none">{dim}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Click to trigger generation */}
            <button
              onClick={handleGenerateModulAjar}
              disabled={isGeneratingModul || !selectedTpForAjar}
              className="w-full flex items-center justify-center py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition disabled:opacity-50 cursor-pointer"
              id="btn-do-generate-modul"
            >
              <Sparkles className="w-4 h-4 mr-1.5 animate-bounce" />
              {isGeneratingModul ? "Menyusun dengan AI..." : "AI Solusi Modul Ajar (Sekali Klik)"}
            </button>

            {/* Progress tracking */}
            {isGeneratingModul && (
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-2 animate-pulse">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping"></div>
                  <span className="font-bold">Pedagogis Tracker:</span>
                </div>
                <p className="italic">{generationStep}</p>
              </div>
            )}

            {apiError && (
              <div className="p-3 bg-red-50 text-red-850 text-[11px] rounded-lg border border-red-100">
                <strong>Gagal:</strong> {apiError}
              </div>
            )}
          </div>

          {/* Right panel: Document results */}
          <div className="lg:col-span-8 space-y-4">
            {modulAjarMap[selectedTpForAjar] ? (
              <>
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6 max-h-[750px] overflow-y-auto">
                
                {/* Exporter controllers */}
                <div className="flex items-center justify-between border-b pb-3 sticky top-0 bg-white z-10">
                  <span className="text-xs bg-slate-100 text-slate-800 px-2 py-1 rounded font-bold font-mono">
                    TP-CODE: {modulAjarMap[selectedTpForAjar].tpCode}
                  </span>
                  <div className="flex space-x-2">
                    <button
                        onClick={() => {
                          navigator.clipboard.writeText(JSON.stringify(modulAjarMap[selectedTpForAjar], null, 2));
                          alert("Modul Ajar berhasil disalin ke Clipboard dalam format JSON!");
                        }}
                        className="flex items-center px-2.5 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-bold text-slate-700 transition"
                      >
                      <Copy className="w-3.5 h-3.5 mr-1" />
                      Salin JSON
                    </button>
                    <button
                      onClick={() => handleDownloadModulHtml(selectedTpForAjar)}
                      className="flex items-center px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-xs font-bold text-white transition shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5 mr-1" />
                      Ekspor ke .DOCX (Word)
                    </button>
                  </div>
                </div>

                {/* Kop Surat Header */}
                <HeaderKop config={config} documentTitle="MODUL AJAR (RPP+) KURIKULUM MERDEKA" />

                {/* Part 0: Matriks Rancangan Pembelajaran Mendalam */}
                {modulAjarMap[selectedTpForAjar].pembelajaranMendalam && (
                  <div className="space-y-3 bg-slate-150/40 p-4 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 border-l-2 border-emerald-500 pl-2">
                        MATRIKS RANCANGAN PEMBELAJARAN MENDALAM (DEEP LEARNING MODEL)
                      </h3>
                      <span className="bg-emerald-100 text-emerald-800 text-[9px] px-2 py-0.5 rounded-full font-bold">Standard Kurikulum Merdeka</span>
                    </div>
                    <p className="text-[11px] text-slate-500 italic pl-2">Format keluaran resmi modul mendalam dengan text-justify (rata kanan-kiri) sesuai standar kesantunan ejaan EYD Bahasa Indonesia.</p>
                    
                    <div className="overflow-x-auto pl-2">
                      <table className="w-full border-collapse border border-slate-300 text-xs text-slate-800 bg-white shadow-xs rounded-lg overflow-hidden">
                        <thead>
                          <tr className="bg-slate-100/80 border-b border-slate-300">
                            <th className="border border-slate-300 p-2.5 text-left font-bold text-slate-700 w-1/4">Aspek Utama</th>
                            <th className="border border-slate-300 p-2.5 text-left font-bold text-slate-700">Rincian Modul Mendalam (Rata Kanan Kiri)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {/* 1. Identitas */}
                          <tr>
                            <td className="border border-slate-300 p-3 font-bold bg-slate-50/55 text-slate-700">
                              1. Identitas Pembelajaran
                            </td>
                            <td className="border border-slate-300 p-3 text-justify leading-relaxed text-slate-800">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                                <div><span className="font-bold text-slate-500">Satuan Pendidikan:</span> {modulAjarMap[selectedTpForAjar].pembelajaranMendalam.identitas?.satuanPendidikan || config.schoolName || "-"}</div>
                                <div><span className="font-bold text-slate-500">Mata Pelajaran:</span> {modulAjarMap[selectedTpForAjar].pembelajaranMendalam.identitas?.mataPelajaran || config.subject || "-"}</div>
                                <div><span className="font-bold text-slate-500">Kelas/Semester:</span> {modulAjarMap[selectedTpForAjar].pembelajaranMendalam.identitas?.kelasSemester || `${config.grade} / Semester ${config.semester}`}</div>
                                <div><span className="font-bold text-slate-500">Durasi Pertemuan:</span> {modulAjarMap[selectedTpForAjar].pembelajaranMendalam.identitas?.durasiPertemuan || "2 x 35 menit"}</div>
                              </div>
                            </td>
                          </tr>

                          {/* 2. Identifikasi */}
                          <tr>
                            <td className="border border-slate-300 p-3 font-bold bg-slate-50/55 text-slate-700">
                              2. Identifikasi
                            </td>
                            <td className="border border-slate-300 p-3 text-justify leading-relaxed text-slate-800 space-y-2">
                              <div>
                                <span className="font-bold text-slate-600 block text-[10px] uppercase">Karakteristik Murid (Siswa):</span>
                                <p className="text-[11px] text-slate-700 mt-0.5 text-justify">{modulAjarMap[selectedTpForAjar].pembelajaranMendalam.identifikasi?.siswa}</p>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                                <div><span className="font-bold text-slate-600">Materi Pelajaran:</span> {modulAjarMap[selectedTpForAjar].pembelajaranMendalam.identifikasi?.materiPelajaran || "-"}</div>
                                <div>
                                  <span className="font-bold text-slate-600">Capaian Dimensi Lulusan:</span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {(modulAjarMap[selectedTpForAjar].pembelajaranMendalam.identifikasi?.capaianDimensiLulusan || []).map((dim: string) => (
                                      <span key={dim} className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[9px] px-2 py-0.5 rounded font-medium">{dim}</span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>

                          {/* 3. Desain Pembelajaran */}
                          <tr>
                            <td className="border border-slate-300 p-3 font-bold bg-slate-50/55 text-slate-700">
                              3. Desain Pembelajaran
                            </td>
                            <td className="border border-slate-300 p-3 text-justify leading-relaxed text-slate-800 space-y-3 font-sans">
                              <div>
                                <span className="font-bold text-slate-600 block text-[10px] uppercase">Capaian Pembelajaran (CP):</span>
                                <p className="text-[11px] text-slate-700 mt-0.5 text-justify">{modulAjarMap[selectedTpForAjar].pembelajaranMendalam.desainPembelajaran?.capaianPembelajaran}</p>
                              </div>
                              <div>
                                <span className="font-bold text-slate-600 block text-[10px] uppercase">Lintas Disiplin Ilmu:</span>
                                <p className="text-[11px] text-slate-700 mt-0.5 text-justify">{modulAjarMap[selectedTpForAjar].pembelajaranMendalam.desainPembelajaran?.lintasDisiplinIlmu}</p>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                <div>
                                  <span className="font-bold text-slate-600 block text-[10px] uppercase">Tujuan Pembelajaran:</span>
                                  <p className="text-[11px] text-slate-700 mt-0.5">{modulAjarMap[selectedTpForAjar].pembelajaranMendalam.desainPembelajaran?.tujuanPembelajaran}</p>
                                </div>
                                <div>
                                  <span className="font-bold text-slate-600 block text-[10px] uppercase">Topik Pembelajaran:</span>
                                  <p className="text-[11px] text-slate-700 mt-0.5">{modulAjarMap[selectedTpForAjar].pembelajaranMendalam.desainPembelajaran?.topikPembelajaran}</p>
                                </div>
                              </div>
                              <div>
                                <span className="font-bold text-slate-600 block text-[10px] uppercase">Praktik Pedagogis per Pertemuan:</span>
                                <p className="text-[11px] text-slate-750 mt-0.5 whitespace-pre-line text-justify">{modulAjarMap[selectedTpForAjar].pembelajaranMendalam.desainPembelajaran?.praktikPedagogisPerPertemuan}</p>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                <div>
                                  <span className="font-bold text-slate-600 block text-[10px] uppercase">Kemitraan Pembelajaran:</span>
                                  <p className="text-[11px] text-slate-700 mt-0.5 text-justify">{modulAjarMap[selectedTpForAjar].pembelajaranMendalam.desainPembelajaran?.kemitraanPembelajaran}</p>
                                </div>
                                <div>
                                  <span className="font-bold text-slate-600 block text-[10px] uppercase">Lingkungan Pembelajaran:</span>
                                  <p className="text-[11px] text-slate-700 mt-0.5 text-justify">{modulAjarMap[selectedTpForAjar].pembelajaranMendalam.desainPembelajaran?.lingkunganPembelajaran}</p>
                                </div>
                              </div>
                              <div>
                                <span className="font-bold text-slate-600 block text-[10px] uppercase">Pemanfaatan Digital (Online Tools & Skenario):</span>
                                <p className="text-[11px] text-slate-700 mt-0.5 text-justify">{modulAjarMap[selectedTpForAjar].pembelajaranMendalam.desainPembelajaran?.pemanfaatanDigital}</p>
                              </div>
                            </td>
                          </tr>

                          {/* 4. Pengalaman Belajar */}
                          <tr>
                            <td className="border border-slate-300 p-3 font-bold bg-slate-50/55 text-slate-700">
                              4. Pengalaman Belajar
                            </td>
                            <td className="border border-slate-300 p-3 text-justify leading-relaxed text-slate-800 space-y-3 font-sans">
                              <div>
                                <span className="text-emerald-850 font-bold block text-[10px] uppercase">Pilar Memahami (Mindful Learning):</span>
                                <p className="text-[11px] text-slate-700 mt-0.5 text-justify">{modulAjarMap[selectedTpForAjar].pembelajaranMendalam.pengalamanBelajar?.memahami}</p>
                              </div>
                              <div>
                                <span className="text-blue-850 font-bold block text-[10px] uppercase">Pilar Mengaplikasikan (Meaningful Learning):</span>
                                <p className="text-[11px] text-slate-700 mt-0.5 text-justify">{modulAjarMap[selectedTpForAjar].pembelajaranMendalam.pengalamanBelajar?.mengaplikasi}</p>
                              </div>
                              <div>
                                <span className="text-amber-855 font-bold block text-[10px] uppercase">Pilar Merefleksikan (Joyful Learning):</span>
                                <p className="text-[11px] text-slate-700 mt-0.5 text-justify">{modulAjarMap[selectedTpForAjar].pembelajaranMendalam.pengalamanBelajar?.refleksi}</p>
                              </div>
                            </td>
                          </tr>

                          {/* 5. Asesmen Pembelajaran */}
                          <tr>
                            <td className="border border-slate-300 p-3 font-bold bg-slate-50/55 text-slate-700">
                              5. Asesmen Pembelajaran
                            </td>
                            <td className="border border-slate-300 p-3 text-justify leading-relaxed text-slate-800 space-y-3 font-sans">
                              <div>
                                <span className="font-bold text-slate-600 block text-[10px] uppercase">Asesmen Awal (Diagnostik/Apersepsi):</span>
                                <p className="text-[11px] text-slate-700 mt-0.5 text-justify">{modulAjarMap[selectedTpForAjar].pembelajaranMendalam.asesmenPembelajaran?.awal}</p>
                              </div>
                              <div>
                                <span className="font-bold text-slate-600 block text-[10px] uppercase">Asesmen Proses (Observasi, Rubrik, Diskusi):</span>
                                <p className="text-[11px] text-slate-700 mt-0.5 text-justify">{modulAjarMap[selectedTpForAjar].pembelajaranMendalam.asesmenPembelajaran?.proses}</p>
                              </div>
                              <div>
                                <span className="font-bold text-slate-600 block text-[10px] uppercase">Asesmen Akhir (Produk, Tugas, Presentasi, Portofolio):</span>
                                <p className="text-[11px] text-slate-700 mt-0.5 text-justify">{modulAjarMap[selectedTpForAjar].pembelajaranMendalam.asesmenPembelajaran?.akhir}</p>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Visual Tab Switcher Bar */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5 p-1.5 bg-slate-100 rounded-xl select-none mb-4 shadow-inner">
                  <button
                    onClick={() => setActiveDocTab("modul")}
                    className={`py-2 px-3 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      activeDocTab === "modul" 
                        ? "bg-white text-slate-900 shadow-sm" 
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <span>📖 Modul & DL</span>
                  </button>
                  <button
                    onClick={() => setActiveDocTab("bahan")}
                    className={`py-2 px-3 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      activeDocTab === "bahan" 
                        ? "bg-white text-slate-900 shadow-sm" 
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <span>📜 Bahan Ajar</span>
                    {modulAjarMap[selectedTpForAjar]?.generatedBahanAjar && (
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveDocTab("slide")}
                    className={`py-2 px-3 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      activeDocTab === "slide" 
                        ? "bg-white text-slate-900 shadow-sm" 
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <span>📺 Slide PPT</span>
                    {modulAjarMap[selectedTpForAjar]?.generatedPresentasi && (
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveDocTab("lkpd")}
                    className={`py-2 px-3 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      activeDocTab === "lkpd" 
                        ? "bg-white text-slate-900 shadow-sm" 
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <span>✏️ LKPD Siswa</span>
                    {modulAjarMap[selectedTpForAjar]?.generatedLkpd && (
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                    )}
                  </button>
                </div>

                {/* Subsections of Document */}
                <div className="space-y-6 border-t pt-4 font-sans select-text">
                  
                  {/* TAB 1: MODUL AJAR + DEEP LEARNING COMPONENT */}
                  {activeDocTab === "modul" && (
                    <div className="space-y-6 animate-fadeIn">
                      {/* Part 1: Identitas Umum */}
                      <div className="space-y-2">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 border-l-2 border-emerald-500 pl-2">
                          I. INFORMASI UMUM
                        </h3>
                        <div className="text-xs text-slate-800 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 pl-2">
                          <div><span className="font-bold text-slate-500">Sarana & Prasarana:</span> {modulAjarMap[selectedTpForAjar].identitas.saranaPrasarana}</div>
                          <div><span className="font-bold text-slate-500">Target Siswa:</span> {modulAjarMap[selectedTpForAjar].identitas.targetSiswa}</div>
                          <div><span className="font-bold text-slate-500">Profil Pancasila:</span> {modulAjarMap[selectedTpForAjar].identitas.profilPancasila.join(", ")}</div>
                          <div><span className="font-bold text-slate-500">Model Pembelajaran:</span> {modulAjarMap[selectedTpForAjar].identitas.modelPembelajaran}</div>
                        </div>
                      </div>

                      {/* Part 2: Komponen Inti */}
                      <div className="space-y-2">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 border-l-2 border-emerald-500 pl-2">
                          II. KOMPONEN INTI
                        </h3>
                        <div className="text-xs text-slate-800 space-y-3 bg-slate-50 p-3 rounded-lg border pl-2">
                          <div>
                            <span className="font-bold text-slate-500 block">Tujuan Pembelajaran:</span> 
                            <p className="mt-0.5 leading-relaxed font-semibold">{modulAjarMap[selectedTpForAjar].komponenInti.tujuanPembelajaran}</p>
                          </div>
                          <div>
                            <span className="font-bold text-slate-500 block">Pemahaman Bermakna:</span> 
                            <p className="mt-0.5 leading-relaxed text-slate-700 italic">&ldquo; {modulAjarMap[selectedTpForAjar].komponenInti.pemahamanBermakna} &rdquo;</p>
                          </div>
                          <div>
                            <span className="font-bold text-slate-500 block">Pertanyaan Pemantik:</span> 
                            <p className="mt-0.5 leading-relaxed text-slate-700">{modulAjarMap[selectedTpForAjar].komponenInti.pertanyaanPemantik}</p>
                          </div>
                          <div>
                            <span className="font-bold text-slate-500 block">Rencana Asesmen Awal (Diagnostik):</span> 
                            <p className="mt-0.5 leading-relaxed text-slate-700">{modulAjarMap[selectedTpForAjar].komponenInti.asesmenAwalDiagnostik}</p>
                          </div>
                        </div>
                      </div>

                      {/* Part 3: Langkah Pembelajaran */}
                      <div className="space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 border-l-2 border-emerald-500 pl-2">
                          III. KEGIATAN PEMBELAJARAN
                        </h3>

                        <div className="text-xs text-slate-800 space-y-3 pl-2">
                          <div className="border border-slate-100 p-3.5 rounded-lg bg-white shadow-xs">
                            <span className="font-bold text-slate-900 border-b pb-1 mb-2 block border-dashed text-[11px]">A. Kegiatan Pendahuluan (Apersepsi & Motivasi)</span>
                            <div className="space-y-1.5 leading-relaxed pl-1" dangerouslySetInnerHTML={{ __html: modulAjarMap[selectedTpForAjar].langkahPembelajaran.pendahuluan }}></div>
                          </div>

                          <div className={`border p-3.5 rounded-lg shadow-xs bg-white ${diffType !== "Tidak" ? "border-emerald-200" : "border-slate-100"}`}>
                            <span className="font-bold text-slate-900 border-b pb-1 mb-2 block border-dashed text-[11px] flex items-center justify-between">
                              <span>B. Kegiatan Inti ({diffType !== "Tidak" ? `Metode Diferensiasi: ${diffType}` : "Metode Aktif Inkuiri"})</span>
                              {diffType !== "Tidak" && <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded text-[8px]">Aktif</span>}
                            </span>
                            <div className="space-y-1.5 leading-relaxed pl-1 font-sans" dangerouslySetInnerHTML={{ __html: modulAjarMap[selectedTpForAjar].langkahPembelajaran.inti }}></div>
                          </div>

                          <div className="border border-slate-100 p-3.5 rounded-lg bg-white shadow-xs">
                            <span className="font-bold text-slate-900 border-b pb-1 mb-2 block border-dashed text-[11px]">C. Kegiatan Penutup (Sintesis & Evaluasi)</span>
                            <div className="space-y-1.5 leading-relaxed pl-1" dangerouslySetInnerHTML={{ __html: modulAjarMap[selectedTpForAjar].langkahPembelajaran.penutup }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: BAHAN AJAR TEORI */}
                  {activeDocTab === "bahan" && (
                    <div className="space-y-5 animate-fadeIn">
                      {modulAjarMap[selectedTpForAjar].generatedBahanAjar ? (
                        <>
                          {/* Banner Header */}
                          <div className="relative rounded-2xl overflow-hidden h-40 bg-slate-950 flex items-center p-6 border border-slate-100 shadow-sm">
                            <div className="absolute inset-0 opacity-15 bg-cover bg-center" style={{ backgroundImage: `url(https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&h=400&fit=crop)` }}></div>
                            <div className="relative z-10 text-white space-y-1">
                              <span className="bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 uppercase rounded-full">Bahan Ajar Teori</span>
                              <h2 className="text-base font-bold text-white tracking-tight">{modulAjarMap[selectedTpForAjar].tpText}</h2>
                              <p className="text-[10px] text-zinc-300">Konsep esensial dikompilasi AI • Kelas {config.grade}</p>
                            </div>
                          </div>

                          {/* Materi Reading Card */}
                          <div className="bg-white rounded-xl border p-5 space-y-3">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 border-l-2 border-emerald-500 pl-2 mb-2">
                              Uraian Teori Esensial
                            </h3>
                            <div className="text-xs leading-relaxed text-slate-800 whitespace-pre-line text-justify font-sans bg-slate-50/50 p-4 rounded-xl border border-dashed select-text">
                              {modulAjarMap[selectedTpForAjar].generatedBahanAjar?.materiBahanAjar}
                            </div>
                          </div>

                          {/* Graphical Concept Map Visualization */}
                          {modulAjarMap[selectedTpForAjar].generatedBahanAjar?.conceptMap && (
                            <div className="bg-white rounded-xl border p-5 space-y-4">
                              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 border-l-2 border-emerald-500 pl-2">
                                visualisasi grafik peta konsep (diagram mind-map)
                              </h3>
                              <p className="text-[10px] text-slate-500 italic">Diagram alur relasi konsep utama terstruktur dari AI yang mempermudah pemahaman kognitif murid.</p>
                              
                              <div className="border rounded-xl bg-slate-50/40 p-3 flex justify-center overflow-x-auto min-h-[260px]">
                                <svg width="440" height="250" className="max-w-full select-none">
                                  {/* Connection Path Lines */}
                                  {(() => {
                                    const nodes = modulAjarMap[selectedTpForAjar].generatedBahanAjar?.conceptMap?.nodes || [];
                                    const conns = modulAjarMap[selectedTpForAjar].generatedBahanAjar?.conceptMap?.connections || [];
                                    const numNodes = nodes.length;
                                    const centerX = 220;
                                    const centerY = 125;
                                    const r = 85;

                                    const nodePos = nodes.map((node, i) => {
                                      const angle = (i * 2 * Math.PI) / (numNodes || 1) - Math.PI / 2;
                                      return {
                                        id: node.id,
                                        label: node.label,
                                        x: numNodes === 1 ? centerX : centerX + r * Math.cos(angle),
                                        y: numNodes === 1 ? centerY : centerY + r * Math.sin(angle)
                                      };
                                    });

                                    return (
                                      <>
                                        {/* Draws Arrow Markers */}
                                        <defs>
                                          <marker id="arrow" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                            <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981" />
                                          </marker>
                                        </defs>

                                        {/* Paths */}
                                        {conns.map((conn, idx) => {
                                          const p1 = nodePos.find(n => n.id === conn.from);
                                          const p2 = nodePos.find(n => n.id === conn.to);
                                          if (!p1 || !p2) return null;
                                          return (
                                            <g key={idx}>
                                              <line 
                                                x1={p1.x} y1={p1.y} 
                                                x2={p2.x} y2={p2.y} 
                                                stroke="#a7f3d0" 
                                                strokeWidth="2" 
                                                markerEnd="url(#arrow)"
                                                strokeDasharray="4,4"
                                              />
                                              <rect 
                                                x={(p1.x + p2.x) / 2 - 20} 
                                                y={(p1.y + p2.y) / 2 - 7} 
                                                width="40" height="13" 
                                                rx="3" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1"
                                              />
                                              <text 
                                                x={(p1.x + p2.x) / 2} 
                                                y={(p1.y + p2.y) / 2 + 2} 
                                                textAnchor="middle" 
                                                fontSize="7" 
                                                fontWeight="600" 
                                                fill="#065f46"
                                              >
                                                {conn.label || "relasi"}
                                              </text>
                                            </g>
                                          );
                                        })}

                                        {/* Nodes */}
                                        {nodePos.map((n, i) => (
                                          <g key={n.id} className="cursor-pointer group">
                                            <rect 
                                              x={n.x - 45} 
                                              y={n.y - 18} 
                                              width="90" 
                                              height="36" 
                                              rx="8" 
                                              fill={i === 0 ? "#1e293b" : "#ffffff"} 
                                              stroke={i === 0 ? "#475569" : "#10b981"} 
                                              strokeWidth="2"
                                              className="transition duration-155 group-hover:scale-105"
                                            />
                                            <text 
                                              x={n.x} 
                                              y={n.y + 4} 
                                              textAnchor="middle" 
                                              fontSize="8" 
                                              fontWeight="700" 
                                              fill={i === 0 ? "#ffffff" : "#1e293b"}
                                            >
                                              {n.label.length > 18 ? n.label.slice(0, 16) + "..." : n.label}
                                            </text>
                                          </g>
                                        ))}
                                      </>
                                    );
                                  })()}
                                </svg>
                              </div>
                            </div>
                          )}

                          {/* Summary Terms Table */}
                          {modulAjarMap[selectedTpForAjar].generatedBahanAjar?.ringkasanTabel && (
                            <div className="bg-white rounded-xl border p-5 space-y-4">
                              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 border-l-2 border-emerald-500 pl-2">
                                Tabel Ringkasan Istilah & Fakta Pembelajaran
                              </h3>
                              <div className="overflow-x-auto">
                                <table className="w-full border-collapse border border-slate-200 text-xs text-left bg-white rounded-lg overflow-hidden shadow-xs">
                                  <thead>
                                    <tr className="bg-emerald-50/50 text-emerald-950 border-b border-slate-200 font-bold">
                                      {modulAjarMap[selectedTpForAjar].generatedBahanAjar?.ringkasanTabel?.headers?.map((h, hIdx) => (
                                        <th key={hIdx} className="p-2.5 border border-slate-200">{h}</th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-200 text-slate-700">
                                    {modulAjarMap[selectedTpForAjar].generatedBahanAjar?.ringkasanTabel?.rows?.map((row, rIdx) => (
                                      <tr key={rIdx} className="hover:bg-slate-50 transition">
                                        {row.map((val, cIdx) => (
                                          <td key={cIdx} className="p-2.5 border border-slate-200 font-medium">{val}</td>
                                        ))}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}

                          {/* Action update */}
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                            <span className="text-[11px] text-slate-500">Butuh merevisi materi ini? Hasilkan ulang dengan materi termutakhir.</span>
                            <button
                              disabled={isGeneratingBahanAjar}
                              onClick={handleGenerateBahanAjar}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 cursor-pointer text-white text-[11px] font-bold rounded-lg flex items-center shadow-xs transition"
                            >
                              <Sparkles className="w-3.5 h-3.5 mr-1" />
                              {isGeneratingBahanAjar ? "Membuat..." : "Hasilkan Ulang Bahan Ajar AI"}
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="p-8 border border-dashed text-center rounded-2xl bg-slate-50 text-slate-600 space-y-4 max-w-lg mx-auto">
                          <div className="mx-auto w-12 h-12 bg-emerald-50 flex items-center justify-center rounded-full text-emerald-600 animate-pulse">
                            <FileText className="w-6 h-6" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-bold text-slate-800 text-sm">Bahan Ajar Teori Belum Dibuat</h4>
                            <p className="text-xs text-slate-500">Anda dapat menyusun bahan bacaan terperinci, rangkuman, visualisasi grafik peta konsep, dan glossary tabel yang selaras secara mandiri.</p>
                          </div>
                          <button
                            disabled={isGeneratingBahanAjar}
                            onClick={handleGenerateBahanAjar}
                            className="mx-auto flex items-center justify-center py-2 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5 mr-1.5 animate-bounce" />
                            {isGeneratingBahanAjar ? "Sedang Mengompilasi..." : "Generate Bahan Ajar (Sekali Klik)"}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 3: SLIDE PRESENTASI PLAYER */}
                  {activeDocTab === "slide" && (
                    <div className="space-y-5 animate-fadeIn">
                      {modulAjarMap[selectedTpForAjar].generatedPresentasi?.slides ? (
                        <>
                          {/* PowerPoint Mockup Projector Canvas */}
                          {(() => {
                            const slides = modulAjarMap[selectedTpForAjar].generatedPresentasi?.slides || [];
                            const idx = Math.min(currentSlideIdx, slides.length - 1);
                            const slide = slides[idx] || slides[0];
                            if (!slide) return null;

                            return (
                              <div className="space-y-4">
                                <div className="border border-zinc-900 rounded-2xl bg-zinc-950 p-6 shadow-2xl relative overflow-hidden min-h-[340px] flex flex-col justify-between font-sans select-none text-white transition-all">
                                  {/* Projector Matrix Pattern */}
                                  <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
                                  
                                  {/* Slide Header */}
                                  <div className="relative z-10 flex items-center justify-between border-b border-zinc-850 pb-2 mb-4">
                                    <div className="flex items-center space-x-2">
                                      <span className="bg-emerald-500 text-[8px] font-bold px-1.5 py-0.5 rounded-md text-emerald-950">Slide {slide.slideNum}</span>
                                      <span className="text-[10px] text-zinc-400 font-semibold tracking-wide">{config.subject} • Fase {config.fase}</span>
                                    </div>
                                    <span className="text-[8px] uppercase font-bold tracking-widest text-zinc-500 bg-zinc-900/40 px-2 py-0.5 rounded border border-zinc-805">
                                      {slide.visualType} layout
                                    </span>
                                  </div>

                                  {/* Slide Mid Content (Two Columns for Graphics and Bullets) */}
                                  <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-5 items-center my-auto">
                                    {/* Left half: Bullets list */}
                                    <div className="md:col-span-6 space-y-3">
                                      <h2 className="text-sm md:text-base font-extrabold text-white tracking-tight leading-tight uppercase border-l-2 border-emerald-500 pl-2">
                                        {slide.title}
                                      </h2>
                                      <ul className="space-y-1.5 text-zinc-350 text-[11px] leading-relaxed pl-1 md:pl-2">
                                        {slide.bullets?.map((b: string, bIdx: number) => (
                                          <li key={bIdx} className="flex items-start">
                                            <span className="text-emerald-400 mr-2">✦</span>
                                            <span>{b}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>

                                    {/* Right half: High-Resolution Graphic / Diagram / Table element */}
                                    <div className="md:col-span-6 flex items-center justify-center p-2 rounded-xl bg-zinc-900/75 border border-zinc-800 min-h-[170px]">
                                      {/* CHART */}
                                      {slide.visualType === "grafik" && (
                                        <div className="w-full text-center space-y-2">
                                          <span className="text-[8px] font-bold text-emerald-400 block tracking-widest uppercase">{slide.visualData?.title || "ANALISIS GRAFIK TANTANGAN"}</span>
                                          <div className="flex justify-around items-end h-24 pt-3 px-2">
                                            {(slide.visualData?.labels || ["A", "B", "C", "D"]).map((lbl, idxBar) => {
                                              const pct = (slide.visualData?.values || [70, 85, 95, 60])[idxBar] || 50;
                                              return (
                                                <div key={idxBar} className="flex flex-col items-center flex-1 mx-1 max-w-[40px]">
                                                  <div className="text-[8px] font-bold text-zinc-300 mb-1">{pct}%</div>
                                                  <div 
                                                    className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-md transition-all duration-300" 
                                                    style={{ height: `${pct}%` }}
                                                  ></div>
                                                  <div className="text-[7px] text-zinc-450 font-semibold mt-1 truncate w-full pt-1 text-center">{lbl}</div>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      )}

                                      {/* TABLE */}
                                      {slide.visualType === "tabel" && (
                                        <div className="w-full overflow-hidden text-zinc-200">
                                          <span className="text-[8px] font-bold text-emerald-400 block tracking-widest uppercase text-center mb-1.5">{slide.visualData?.title || "TABEL METRIK DEFINISI"}</span>
                                          <div className="overflow-x-auto">
                                            <table className="w-full text-left text-[8px] border-collapse border border-zinc-800">
                                              <thead>
                                                <tr className="bg-zinc-850 font-bold border-b border-zinc-800">
                                                  {slide.visualData?.headers?.slice(0, 3).map((h, i) => (
                                                    <th key={i} className="p-1 border border-zinc-800">{h}</th>
                                                  ))}
                                                </tr>
                                              </thead>
                                              <tbody className="divide-y divide-zinc-800 text-zinc-300">
                                                {slide.visualData?.rows?.slice(0, 3).map((row, rI) => (
                                                  <tr key={rI} className="hover:bg-zinc-800">
                                                    {row.slice(0, 3).map((vStr, cI) => (
                                                      <td key={cI} className="p-1.5 border border-zinc-800 truncate max-w-[80px]">{vStr}</td>
                                                    ))}
                                                  </tr>
                                                ))}
                                              </tbody>
                                            </table>
                                          </div>
                                        </div>
                                      )}

                                      {/* PROCESS DIAGRAM */}
                                      {slide.visualType === "diagram" && (
                                        <div className="w-full text-center space-y-2 text-zinc-300">
                                          <span className="text-[8px] font-bold text-emerald-400 block tracking-widest uppercase">{slide.visualData?.title || "PROSES ALUR/LANGKAH BELAJAR"}</span>
                                          <div className="flex items-center justify-between sm:px-4 pt-3">
                                            {(slide.visualData?.nodes || ["Sesi 1", "Sesi 2", "Sesi 3"]).map((nodeLabel, idxNode) => (
                                              <React.Fragment key={idxNode}>
                                                <div className="flex flex-col items-center">
                                                  <div className="w-7 h-7 bg-emerald-500/10 border border-emerald-400 text-emerald-450 text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                                                    {idxNode + 1}
                                                  </div>
                                                  <span className="text-[7px] text-zinc-300 font-medium mt-1 w-16 truncate text-center leading-none">{nodeLabel}</span>
                                                </div>
                                                {idxNode < (slide.visualData?.nodes || []).length - 1 && (
                                                  <div className="flex-1 border-t border-dashed border-zinc-800 h-0.5 mx-1 animate-pulse"></div>
                                                )}
                                              </React.Fragment>
                                            ))}
                                          </div>
                                        </div>
                                      )}

                                      {/* IMAGE */}
                                      {slide.visualType === "gambar" && (
                                        <div className="w-full text-center space-y-1 relative h-[160px] overflow-hidden rounded-lg">
                                          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=700&h=300&fit=crop)` }}></div>
                                          <div className="absolute inset-x-0 bottom-0 bg-zinc-900/80 p-1.5 text-center text-[7px] text-zinc-200 backdrop-blur-xs">
                                            Ilustrasi: {slide.unsplashQuery || "Peta Belajar"}
                                          </div>
                                        </div>
                                      )}

                                      {/* BULLET/DEFAULT */}
                                      {slide.visualType === "bullet" && (
                                        <div className="w-full text-center space-y-1.5 p-2">
                                          <span className="text-[8px] font-bold text-emerald-400 block tracking-widest uppercase">{slide.visualData?.title || "IKHTISAR BELAJAR MANDIRI"}</span>
                                          <div className="text-[9px] text-zinc-400 italic leading-relaxed text-center font-sans">
                                            &ldquo; Interaktif draf visual dengan media layar lebar proyektor di ruangan kelas untuk keaktifan kelompok &rdquo;
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Slide Footer */}
                                  <div className="relative z-10 flex items-center justify-between border-t border-zinc-850 pt-2 mt-4 text-[7px] text-zinc-500">
                                    <span>{config.schoolName} • Triyanto, S.Pd.</span>
                                    <span>Halaman Slide {slide.slideNum} dari {slides.length}</span>
                                  </div>
                                </div>

                                {/* Slide Player Controls Panel */}
                                <div className="flex items-center justify-between bg-slate-50 border p-3 rounded-xl select-none">
                                  <div className="flex space-x-1.5">
                                    <button 
                                      disabled={idx === 0}
                                      onClick={() => setCurrentSlideIdx(prev => Math.max(0, prev - 1))}
                                      className="px-2.5 py-1 text-[11px] font-bold bg-white hover:bg-slate-100 rounded-lg border text-slate-800 disabled:opacity-40 cursor-pointer"
                                    >
                                      Sebelumnya
                                    </button>
                                    <button 
                                      disabled={idx === slides.length - 1}
                                      onClick={() => setCurrentSlideIdx(prev => Math.min(slides.length - 1, prev + 1))}
                                      className="px-2.5 py-1 text-[11px] font-bold bg-white hover:bg-slate-100 rounded-lg border text-slate-800 disabled:opacity-40 cursor-pointer"
                                    >
                                      Berikutnya
                                    </button>
                                  </div>

                                  {/* Dot Indicators */}
                                  <div className="flex items-center space-x-1">
                                    {slides.map((_, sIdx) => (
                                      <button 
                                        key={sIdx}
                                        onClick={() => setCurrentSlideIdx(sIdx)}
                                        className={`w-2 h-2 rounded-full transition ${sIdx === idx ? "bg-emerald-650 scale-125" : "bg-slate-200"}`}
                                      ></button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            );
                          })()}

                          {/* Action recreate */}
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                            <span className="text-[11px] text-slate-550">Ingin mengubah jumlah slide presentasi atau konten draf media visual?</span>
                            <button
                              disabled={isGeneratingPPT}
                              onClick={handleGeneratePPT}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 cursor-pointer text-white text-[11px] font-bold rounded-lg flex items-center shadow-xs transition"
                            >
                              <Sparkles className="w-3.5 h-3.5 mr-1" />
                              {isGeneratingPPT ? "Merevisi..." : "Hasilkan Ulang Slides AI"}
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="p-8 border border-dashed text-center rounded-2xl bg-slate-50 text-slate-600 space-y-4 max-w-lg mx-auto">
                          <div className="mx-auto w-12 h-12 bg-emerald-50 flex items-center justify-center rounded-full text-emerald-600 animate-pulse">
                            <Layout className="w-6 h-6" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-bold text-slate-800 text-sm">Media Paparan PowerPoint Belum Dibuat</h4>
                            <p className="text-xs text-slate-550">Dengan menekan tombol AI, draf PPT berorientas 16:9 yang memuat tabel penilaian, diagram langkah, grafik analisis, dan poin-poin visual siap diproduksi.</p>
                          </div>
                          <button
                            disabled={isGeneratingPPT}
                            onClick={handleGeneratePPT}
                            className="mx-auto flex items-center justify-center py-2 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5 mr-1.5 animate-bounce" />
                            {isGeneratingPPT ? "Menyusun Slides..." : "Generate Media Presentasi (AI)"}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 4: LKPD BERBASIS AKTIVITAS */}
                  {activeDocTab === "lkpd" && (
                    <div className="space-y-5 animate-fadeIn">
                      {modulAjarMap[selectedTpForAjar].generatedLkpd ? (
                        <>
                          {/* Rich Worksheet Paper Container */}
                          <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-xs space-y-5">
                            {/* Kop header of LKPD */}
                            <div className="text-center border-b pb-3 mb-2 space-y-1">
                              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                                Lembar Kerja Peserta Didik (LKPD LATIHAN)
                              </span>
                              <h2 className="text-sm font-extrabold text-slate-800 uppercase leading-snug">{config.schoolName}</h2>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2.5 text-[10px] text-slate-500 border-t border-dashed mt-2 font-semibold font-sans">
                                <div>Mapel: <span className="text-slate-800 font-bold">{config.subject}</span></div>
                                <div>Materi: <span className="text-slate-800 font-bold">Latihan TP Code {selectedTpForAjar}</span></div>
                                <div>Kelas: <span className="text-slate-800 font-bold">{config.grade}</span></div>
                                <div>Nama Siswa: <span className="text-slate-805 border-b border-dashed w-12 inline-block">...........</span></div>
                              </div>
                            </div>

                            {/* Section 1: Petunjuk Pembelajaran */}
                            <div className="space-y-2">
                              <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-800 flex items-center gap-1.5 col-gap-1">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                                A. Petunjuk Pembelajaran Siswa (Ceklist Mandiri)
                              </span>
                              <p className="text-[9px] text-slate-550 italic pl-3">Siswa diperkenankan memberi tanda cek (v) bila sudah membaca instruksi langkah belajar ini.</p>
                              <div className="grid grid-cols-1 gap-1.5 pl-3">
                                {modulAjarMap[selectedTpForAjar].generatedLkpd?.petunjuk?.map((item: string, idxInst) => (
                                  <label key={idxInst} className="flex items-start text-xs text-slate-705 cursor-pointer space-x-2 py-1 select-none">
                                    <input 
                                      type="checkbox" 
                                      className="text-emerald-600 focus:ring-emerald-500 rounded h-3.5 w-3.5 mt-0.5" 
                                    />
                                    <span className="font-medium text-slate-705 text-justify leading-snug">{item}</span>
                                  </label>
                                ))}
                              </div>
                            </div>

                            {/* Section 2: Aktivitas Pembelajaran */}
                            <div className="space-y-2 bg-slate-50 p-4 rounded-xl border">
                              <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-800 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                                B. Deskripsi Eksplorasi Penugasan Utama
                              </span>
                              <p className="text-xs leading-relaxed text-slate-800 pl-3 whitespace-pre-wrap font-sans text-justify leading-loose">
                                {modulAjarMap[selectedTpForAjar].generatedLkpd?.aktivitas}
                              </p>
                            </div>

                            {/* Section 3: ASSESSMENT GAUGE BAR / PROGRESS visual tracker */}
                            {modulAjarMap[selectedTpForAjar].generatedLkpd?.graphicData && (
                              <div className="space-y-3 bg-white p-4 border border-slate-100 rounded-xl">
                                <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-800 flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                                  C. Target Visual Kontrol Kelulusan Capaian
                                </span>
                                <div className="pl-3 space-y-2">
                                  <label className="text-[11px] font-bold text-slate-700">{modulAjarMap[selectedTpForAjar].generatedLkpd?.graphicData?.title}</label>
                                  <div className="space-y-2.5">
                                    {modulAjarMap[selectedTpForAjar].generatedLkpd?.graphicData?.items?.map((gItem, idxG) => (
                                      <div key={idxG} className="space-y-1">
                                        <div className="flex justify-between items-center text-[10px] font-bold">
                                          <span className="text-slate-650">{gItem.label}</span>
                                          <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-mono">{gItem.value} Poin/Persen</span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden shadow-inner font-mono">
                                          <div 
                                            className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                                            style={{ width: `${Math.min(gItem.value, 100)}%` }}
                                          ></div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Section 4: Rubrik Penilaian Table */}
                            {modulAjarMap[selectedTpForAjar].generatedLkpd?.rubrikTabel && (
                              <div className="space-y-3">
                                <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-800 flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                                  D. Rubrik Kriteria Capaian Penilaian Mandiri
                                </span>
                                <div className="overflow-x-auto pl-3">
                                  <table className="w-full border-collapse border border-slate-200 text-xs text-left bg-white rounded-lg overflow-hidden shadow-xs">
                                    <thead>
                                      <tr className="bg-emerald-50/50 text-emerald-950 border-b border-slate-200 font-bold">
                                        {modulAjarMap[selectedTpForAjar].generatedLkpd?.rubrikTabel?.headers?.map((h, hIdx) => (
                                          <th key={hIdx} className="p-2 border border-slate-200">{h}</th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 text-slate-700 font-sans">
                                      {modulAjarMap[selectedTpForAjar].generatedLkpd?.rubrikTabel?.rows?.map((row, rIdx) => (
                                        <tr key={rIdx} className="hover:bg-slate-50 transition">
                                          {row.map((val, cIdx) => (
                                            <td key={cIdx} className="p-2 border border-slate-200 font-medium">{val}</td>
                                          ))}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}

                            {/* Section 5: Pertanyaan Pemantik Logika */}
                            <div className="space-y-3">
                              <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-800 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                                E. Lembar Pertanyaan Tantangan Bernalar Kritis (HOTS)
                              </span>
                              <div className="space-y-4 pl-3">
                                {modulAjarMap[selectedTpForAjar].generatedLkpd?.pertanyaanPemantikLogika?.map((item: string, idxQ) => (
                                  <div key={idxQ} className="space-y-1">
                                    <label className="text-xs font-bold text-slate-850 leading-normal block">
                                      {idxQ + 1}. {item}
                                    </label>
                                    <textarea 
                                      placeholder="Ketik draf jawaban siswa di sini untuk simulasi..."
                                      className="w-full p-2 border border-slate-200 bg-white rounded-lg h-12 text-xs focus:ring-1 focus:ring-emerald-500 outline-none leading-relaxed font-sans"
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Action redo */}
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                            <span className="text-[11px] text-slate-550">Pertanyaan atau Rubrik kurang menantang? Hasilkan ulang instrumen LKPD.</span>
                            <button
                              disabled={isGeneratingLKPD}
                              onClick={handleGenerateLKPD}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 cursor-pointer text-white text-[11px] font-bold rounded-lg flex items-center shadow-xs transition"
                            >
                              <Sparkles className="w-3.5 h-3.5 mr-1" />
                              {isGeneratingLKPD ? "Menyusun..." : "Hasilkan Ulang LKPD AI"}
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="p-8 border border-dashed text-center rounded-2xl bg-slate-50 text-slate-600 space-y-4 max-w-lg mx-auto">
                          <div className="mx-auto w-12 h-12 bg-emerald-50 flex items-center justify-center rounded-full text-emerald-600 animate-pulse">
                            <CheckCircle className="w-6 h-6" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-bold text-slate-800 text-sm">Instrumen LKPD Interaktif Belum Dibuat</h4>
                            <p className="text-xs text-slate-550">Hasilkan draf penugasan siswa dengan kriteria asisten, tabel rubrik penilaian pencapaian tantangan, pemantik kognitif, dan visual gauge bar.</p>
                          </div>
                          <button
                            disabled={isGeneratingLKPD}
                            onClick={handleGenerateLKPD}
                            className="mx-auto flex items-center justify-center py-2 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5 mr-1.5 animate-bounce" />
                            {isGeneratingLKPD ? "Memformulasikan LKPD..." : "Generate Instrumen LKPD (AI)"}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                </div>

              </div>

              {/* --- COLLABORATION PANEL --- */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-5 select-none text-sans">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-3 border-slate-100 gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 font-display">
                      <Users className="w-4 h-4 text-emerald-600" />
                      Fasilitas Kolaborasi Guru (Satu Sekolah)
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Bagikan draf modul ajar ini untuk dikomentari dan dilibatkan oleh rekan sejawat di SDN Merdeka Jaya.
                    </p>
                  </div>

                  {/* Share Button Toggle */}
                  <button
                    onClick={() => handleToggleCollabShare(selectedTpForAjar)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
                      collabSharedDrafts[selectedTpForAjar]
                        ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <Share2 className="w-3.5 h-3.5 text-emerald-650" />
                    {collabSharedDrafts[selectedTpForAjar] ? "Draf Dibagikan" : "Bagikan ke Forum"}
                  </button>
                </div>

                {collabSharedDrafts[selectedTpForAjar] ? (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start text-xs font-medium">
                    
                    {/* Access Permissions Details Column */}
                    <div className="md:col-span-4 space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-150 text-xs text-left">
                      <span className="font-bold text-slate-900 text-[10px] block uppercase tracking-wider">Perizinan Akses (Permit)</span>
                      
                      <div className="space-y-2">
                        <label className="text-[9px] uppercase font-bold text-slate-500 block">Hak Akses Rekan Sekolah</label>
                        <select
                          value={collabPermissions[selectedTpForAjar] || "Hanya Pemilik Edit"}
                          onChange={(e) => handleChangePermissionMode(selectedTpForAjar, e.target.value as any)}
                          className="w-full text-xs p-1.5 border bg-white rounded-lg font-semibold"
                        >
                          <option value="Semua Guru Edit">Semua Guru (EDITOR)</option>
                          <option value="Hanya Pemilik Edit">Hanya Pemilik (VIEWER saja)</option>
                        </select>
                        <span className="text-[10px] text-slate-400 leading-normal block font-sans">
                          {collabPermissions[selectedTpForAjar] === "Semua Guru Edit"
                            ? "Rekan sejawat diizinkan mengedit isi jurnas / LKPD draf RPP ini."
                            : "Rekan sejawat hanya diizinkan membaca dan memberikan ulasan komentar."}
                        </span>
                      </div>

                      {/* Live Active Peers List */}
                      <div className="border-t pt-2 space-y-1.5">
                        <span className="text-[9.5px] uppercase font-bold text-slate-500 block">Daftar Rekan SDN:</span>
                        <div className="space-y-1 text-[11px] font-semibold text-slate-705">
                          <div className="flex items-center justify-between">
                            <span>👩‍🏫 Ibu Siti Aminah, S.Pd.</span>
                            <span className={`px-1.5 rounded text-[8px] uppercase font-black ${
                              collabPermissions[selectedTpForAjar] === "Semua Guru Edit" ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
                            }`}>
                              {collabPermissions[selectedTpForAjar] === "Semua Guru Edit" ? "Editor" : "Viewer"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>👨‍🏫 Pak Ahmad Fauzi, M.Pd.</span>
                            <span className={`px-1.5 rounded text-[8px] uppercase font-black ${
                              collabPermissions[selectedTpForAjar] === "Semua Guru Edit" ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
                            }`}>
                              {collabPermissions[selectedTpForAjar] === "Semua Guru Edit" ? "Editor" : "Viewer"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Review & Active Comments Hub Column */}
                    <div className="md:col-span-8 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 uppercase tracking-wide animate-pulse">Ulasan & Komentar Rekan Kerja</span>
                        <span className="bg-slate-100 text-slate-700 font-mono font-bold px-1.5 py-0.5 rounded text-[10px]">
                          {collabComments[selectedTpForAjar]?.length || 0} Ulasan
                        </span>
                      </div>

                      {/* List of comments */}
                      <div className="space-y-2 max-h-[170px] overflow-y-auto pr-1">
                        {collabComments[selectedTpForAjar]?.map((c) => (
                          <div key={c.id} className="p-2.5 rounded-lg border bg-slate-50/50 hover:bg-slate-50 text-xs leading-relaxed font-sans text-left">
                            <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium select-none mb-0.5 font-sans">
                              <span className="font-bold text-slate-700">{c.author}</span>
                              <span>{c.timestamp}</span>
                            </div>
                            <p className="text-slate-750 font-medium">{c.text}</p>
                          </div>
                        ))}

                        {(!collabComments[selectedTpForAjar] || collabComments[selectedTpForAjar].length === 0) && (
                          <span className="text-slate-400 italic text-xs block pl-1 text-left">Belum ada komentar tertulis di draf ini. Silakan simulasikan ulasan rekan guru di bawah.</span>
                        )}
                      </div>

                      {/* Comment input form */}
                      <div className="flex items-center space-x-2 border p-1 rounded-lg bg-slate-50">
                        <input
                          type="text"
                          value={commentInput}
                          onChange={(e) => setCommentInput(e.target.value)}
                          placeholder="Ketik ulasan masukan untuk draf ini..."
                          className="flex-grow px-2 py-1.5 bg-white text-xs border rounded-md"
                        />
                        <button
                          onClick={() => handleAddCollabComment(selectedTpForAjar)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-3.5 rounded-md text-xs transition cursor-pointer"
                        >
                          Kirim
                        </button>
                      </div>

                    </div>

                    {/* REVISIONS HISTORY LOGGER */}
                    <div className="md:col-span-6 bg-slate-50 p-3 rounded-xl border border-slate-205 text-xs space-y-2 text-left">
                      <span className="font-bold text-slate-800 uppercase tracking-wider text-[9.5px] flex items-center gap-1">
                        <History className="w-3.5 h-3.5 text-blue-600" />
                        Riwayat Log Kerja / Revisi (Sekolah)
                      </span>
                      <div className="space-y-2 max-h-[120px] overflow-y-auto pr-1 font-sans">
                        {collabRevisions[selectedTpForAjar]?.map((r) => (
                          <div key={r.id} className="text-[11px] leading-relaxed border-b pb-1.5 last:border-none border-slate-200">
                            <div className="flex items-center justify-between text-[9px] text-slate-400 font-medium font-sans">
                              <span className="font-extrabold text-slate-700">{r.editor}</span>
                              <span>{r.timestamp}</span>
                            </div>
                            <span className="text-slate-650 font-medium block mt-0.5">{r.action}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* CO-TEACHER ACTIONS INTERACTIVE SIMULATOR CARD */}
                    <div className="md:col-span-6 bg-amber-50/50 p-3 rounded-xl border border-amber-200 text-xs space-y-2 text-left">
                      <span className="font-bold text-amber-900 uppercase tracking-wider text-[9.5px] flex items-center gap-1">
                        <Play className="w-3.5 h-3.5 text-amber-650" />
                        Simulator Kontribusi (Uji Proteksi Hak Edit)
                      </span>
                      
                      <div className="space-y-1.5 font-sans">
                        <p className="text-[10px] text-slate-600 leading-relaxed font-medium">
                          Uji kecerdasan proteksi hak edit dengan berpura-pura menjadi guru sejawat berikut:
                        </p>
                        
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-700">Akun Rekan:</span>
                          <select
                            value={activeSimulationEmail}
                            onChange={(e) => setActiveSimulationEmail(e.target.value)}
                            className="px-2 py-1 text-xs border border-amber-250 bg-white rounded-md text-slate-800 font-bold"
                          >
                            <option value="siti.aminah@guru.sd.belajar.id">👩‍🏫 Ibu Siti Aminah (Editor)</option>
                            <option value="ahmad.fauzi@guru.sd.belajar.id">👨‍🏫 Pak Ahmad Fauzi (Viewer)</option>
                          </select>
                        </div>

                        <div className="flex items-center space-x-2 pt-1.5">
                          <button
                            onClick={() => handleSimulateCoTeacherComment(selectedTpForAjar)}
                            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-2.5 py-1.5 rounded-lg text-xs flex-grow transition cursor-pointer"
                          >
                            💬 Beri Masukan
                          </button>
                          <button
                            onClick={() => handleSimulateCoTeacherEdit(selectedTpForAjar)}
                            className="bg-purple-700 hover:bg-purple-800 text-white font-bold px-2.5 py-1.5 rounded-lg text-xs flex-grow transition cursor-pointer"
                          >
                            ✍️ Ubah Konten RPP
                          </button>
                        </div>

                        {collabSuccessMsg && (
                          <div className="bg-emerald-50 text-emerald-850 p-2.5 rounded-lg border border-emerald-250 font-bold text-[10.5px] mt-2">
                            {collabSuccessMsg}
                          </div>
                        )}

                        {collabErrorMsg && (
                          <div className="bg-red-50 text-red-800 p-2.5 rounded-lg border border-red-200 font-bold text-[10.5px] mt-2 leading-relaxed">
                            {collabErrorMsg}
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="p-6 bg-slate-50 border border-dashed rounded-xl text-center space-y-1">
                    <Users className="w-6 h-6 text-slate-400 mx-auto opacity-75 animate-bounce" />
                    <span className="text-xs font-bold text-slate-700 text-center block">Status Kolaborasi SDN Merdeka Jaya Belum Aktif</span>
                    <p className="text-[10.5px] text-slate-400 max-w-md mx-auto">Ketuk tombol &ldquo;Bagikan ke Forum&rdquo; di sebelah kanan untuk membagikan draf administrasi ini ke kepala sekolah dan guru-guru se-MGMP sekolah Anda.</p>
                  </div>
                )}
              </div>
            </>
          ) : (
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-12 text-center h-[500px] flex flex-col items-center justify-center space-y-3 text-slate-400">
                <FileText className="w-12 h-12 text-slate-300" />
                <h3 className="text-sm font-bold text-slate-600">Belum Ada Dokumen Terbentuk</h3>
                <p className="text-xs max-w-sm">Silakan pilih salah satu rumusan Tujuan Pembelajaran (TP) di sebelah kiri, kemudian ketuk tombol &ldquo;AI Solusi Modul Ajar&rdquo; untuk merancang berkas administrasi siap pakai.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sub-tab: LKPD */}
      {activeSubTab === "lkpd" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-left font-sans">
          {/* Left panel: Info & Controls */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-display flex items-center space-x-1.5">
                <ClipboardList className="w-4 h-4 text-emerald-600" />
                <span>Lembar Kerja Peserta Didik (LKPD)</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Instrumen evaluasi mandiri kerja praktik siswa dengan dilengkapi target visual capaian dan kriteria kelulusan.</p>
            </div>

            {/* Selector TP */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-700 font-sans">Pilih Tujuan Pembelajaran (TP)</label>
              <select
                value={selectedTpForAjar}
                onChange={e => setSelectedTpForAjar(e.target.value)}
                className="w-full text-xs p-2 border bg-white rounded-lg focus:ring-1 focus:ring-emerald-500 font-semibold"
              >
                {atpList.map(a => (
                  <option key={a.code} value={a.code}>
                    {a.code} - {a.tpText.slice(0, 60)}...
                  </option>
                ))}
              </select>
            </div>

            {/* Profile info metadata cards */}
            {selectedTpForAjar && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-150 space-y-2 text-xs font-medium font-sans">
                <div className="flex justify-between border-b pb-1.5 border-dashed">
                  <span className="text-slate-400 font-bold">Mata Pelajaran:</span>
                  <span className="text-slate-705 font-bold">{config.subject}</span>
                </div>
                <div className="flex justify-between border-b pb-1.5 border-dashed">
                  <span className="text-slate-400 font-bold">Kelas / Semester:</span>
                  <span className="text-slate-705 font-bold">{config.grade}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 block font-bold">TP Terkait:</span>
                  <p className="text-slate-700 italic border-l-2 border-emerald-500 pl-2 py-0.5 text-justify leading-relaxed text-[11px]">
                    {atpList.find(a => a.code === selectedTpForAjar)?.tpText}
                  </p>
                </div>
              </div>
            )}

            <button
              disabled={isGeneratingLKPD}
              onClick={handleGenerateLKPD}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 cursor-pointer text-white text-xs font-bold rounded-xl flex items-center justify-center shadow-xs transition"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {isGeneratingLKPD ? "Menyusun LKPD..." : "Generate Instrumen LKPD (AI)"}
            </button>

            {lkpdError && (
              <div className="p-3 bg-red-50 text-red-800 text-xs font-semibold rounded-lg border border-red-100">
                {lkpdError}
              </div>
            )}
          </div>

          {/* Right panel: Exhibit */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-5 shadow-sm min-h-[500px]">
            {selectedTpForAjar && modulAjarMap[selectedTpForAjar]?.generatedLkpd ? (
              <div className="space-y-5 animate-fadeIn">
                {/* Rich Worksheet Paper Container */}
                <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-xs space-y-5">
                  {/* Kop header of LKPD */}
                  <div className="text-center border-b pb-3 mb-2 space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                      Lembar Kerja Peserta Didik (LKPD LATIHAN)
                    </span>
                    <h2 className="text-sm font-extrabold text-slate-800 uppercase leading-snug">{config.schoolName}</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2.5 text-[10px] text-slate-500 border-t border-dashed mt-2 font-semibold font-sans">
                      <div>Mapel: <span className="text-slate-800 font-bold">{config.subject}</span></div>
                      <div>Materi: <span className="text-slate-800 font-bold">Latihan TP Code {selectedTpForAjar}</span></div>
                      <div>Kelas: <span className="text-slate-800 font-bold">{config.grade}</span></div>
                      <div>Nama Siswa: <span className="border-b border-dashed w-12 inline-block">...........</span></div>
                    </div>
                  </div>

                  {/* Section 1: Petunjuk Pembelajaran */}
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-800 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                      A. Petunjuk Pembelajaran Siswa (Ceklist Mandiri)
                    </span>
                    <p className="text-[9px] text-slate-550 italic pl-3">Siswa diperkenankan memberi tanda cek (v) bila sudah membaca instruksi langkah belajar ini.</p>
                    <div className="grid grid-cols-1 gap-1.5 pl-3 font-sans">
                      {modulAjarMap[selectedTpForAjar].generatedLkpd?.petunjuk?.map((item: string, idxInst) => (
                        <label key={idxInst} className="flex items-start text-xs text-slate-705 cursor-pointer space-x-2 py-1 select-none">
                          <input 
                            type="checkbox" 
                            className="text-emerald-600 focus:ring-emerald-500 rounded h-3.5 w-3.5 mt-0.5" 
                          />
                          <span className="font-semibold text-slate-755 text-justify leading-snug">{item}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Section 2: Aktivitas Pembelajaran */}
                  <div className="space-y-2 bg-slate-50 p-4 rounded-xl border">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-800 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                      B. Deskripsi Eksplorasi Penugasan Utama
                    </span>
                    <p className="text-xs leading-relaxed text-slate-800 pl-3 whitespace-pre-wrap font-sans text-justify">
                      {modulAjarMap[selectedTpForAjar].generatedLkpd?.aktivitas}
                    </p>
                  </div>

                  {/* Section 3: ASSESSMENT GAUGE BAR / PROGRESS visual tracker */}
                  {modulAjarMap[selectedTpForAjar].generatedLkpd?.graphicData && (
                    <div className="space-y-3 bg-white p-4 border border-slate-100 rounded-xl">
                      <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-800 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                        C. Target Visual Kontrol Kelulusan Capaian
                      </span>
                      <div className="pl-3 space-y-2">
                        <label className="text-[11px] font-bold text-slate-700">{modulAjarMap[selectedTpForAjar].generatedLkpd?.graphicData?.title}</label>
                        <div className="space-y-2.5">
                          {modulAjarMap[selectedTpForAjar].generatedLkpd?.graphicData?.items?.map((gItem, idxG) => (
                            <div key={idxG} className="space-y-1">
                              <div className="flex justify-between items-center text-[10px] font-bold">
                                <span className="text-slate-650">{gItem.label}</span>
                                <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-mono">{gItem.value} Poin/Persen</span>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden shadow-inner">
                                <div 
                                  className="bg-emerald-500 h-full rounded-full transition-all duration-305"
                                  style={{ width: `${Math.min(gItem.value, 100)}%` }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Section 4: Rubrik Penilaian Table */}
                  {modulAjarMap[selectedTpForAjar].generatedLkpd?.rubrikTabel && (
                    <div className="space-y-3">
                      <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-800 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                        D. Rubrik Kriteria Capaian Penilaian Mandiri
                      </span>
                      <div className="overflow-x-auto pl-3">
                        <table className="w-full border-collapse border border-slate-205 text-xs text-left bg-white rounded-lg overflow-hidden shadow-xs">
                          <thead>
                            <tr className="bg-emerald-50/50 text-emerald-950 border-b border-slate-200 font-bold">
                              {modulAjarMap[selectedTpForAjar].generatedLkpd?.rubrikTabel?.headers?.map((h, hIdx) => (
                                <th key={hIdx} className="p-2 border border-slate-200">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 text-slate-700 font-semibold font-sans">
                            {modulAjarMap[selectedTpForAjar].generatedLkpd?.rubrikTabel?.rows?.map((row, rIdx) => (
                              <tr key={rIdx} className="hover:bg-slate-50 transition">
                                {row.map((val, cIdx) => (
                                  <td key={cIdx} className="p-2 border border-slate-200 font-medium">{val}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Section 5: Pertanyaan Pemantik Logika */}
                  <div className="space-y-3 font-sans">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-800 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                      E. Lembar Pertanyaan Tantangan Bernalar Kritis (HOTS)
                    </span>
                    <div className="space-y-4 pl-3">
                      {modulAjarMap[selectedTpForAjar].generatedLkpd?.pertanyaanPemantikLogika?.map((item: string, idxQ) => (
                        <div key={idxQ} className="space-y-1">
                          <label className="text-xs font-bold text-slate-850 leading-normal block">
                            {idxQ + 1}. {item}
                          </label>
                          <textarea 
                            placeholder="Ketik draf jawaban siswa di sini untuk simulasi..."
                            className="w-full p-2 border border-slate-200 bg-white rounded-lg h-12 text-xs focus:ring-1 focus:ring-emerald-500 outline-none leading-relaxed font-sans"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400 h-[450px] flex flex-col items-center justify-center space-y-4 max-w-sm mx-auto">
                <div className="w-12 h-12 bg-emerald-50 flex items-center justify-center rounded-full text-emerald-600 animate-pulse">
                  <ClipboardList className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-850 text-sm">LKPD Latihan Belum Disusun</h4>
                  <p className="text-xs text-slate-550">Tekan tombol &ldquo;Generate Instrumen LKPD&rdquo; di sebelah kiri agar AI menyusun draf penugasan utama, pertanyaan evaluasi HOTS, dan tabel rubrik capaian mandiri siswa.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sub-tab: Bahan Ajar */}
      {activeSubTab === "bahan" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-left font-sans">
          {/* Left panel: Info & Controls */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-display flex items-center space-x-1.5">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span>Bahan Ajar Kognitif</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Teori dan intisari bacaan pendukung proses belajar yang memuat diagram peta pikiran interaktif relasi esensial.</p>
            </div>

            {/* Selector TP */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-700 font-sans">Pilih Tujuan Pembelajaran (TP)</label>
              <select
                value={selectedTpForAjar}
                onChange={e => setSelectedTpForAjar(e.target.value)}
                className="w-full text-xs p-2 border bg-white rounded-lg focus:ring-1 focus:ring-emerald-500 font-semibold"
              >
                {atpList.map(a => (
                  <option key={a.code} value={a.code}>
                    {a.code} - {a.tpText.slice(0, 60)}...
                  </option>
                ))}
              </select>
            </div>

            {/* Profile info metadata cards */}
            {selectedTpForAjar && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-150 space-y-2 text-xs font-medium font-sans">
                <div className="flex justify-between border-b pb-1.5 border-dashed">
                  <span className="text-slate-400 font-bold">Mata Pelajaran:</span>
                  <span className="text-slate-700 font-bold">{config.subject}</span>
                </div>
                <div className="flex justify-between border-b pb-1.5 border-dashed">
                  <span className="text-slate-400 font-bold">Kelas / Semester:</span>
                  <span className="text-slate-705 font-bold">{config.grade}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 block font-bold">TP Terkait:</span>
                  <p className="text-slate-700 italic border-l-2 border-emerald-500 pl-2 py-0.5 text-justify leading-relaxed text-[11px]">
                    {atpList.find(a => a.code === selectedTpForAjar)?.tpText}
                  </p>
                </div>
              </div>
            )}

            <button
              disabled={isGeneratingBahanAjar}
              onClick={handleGenerateBahanAjar}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 cursor-pointer text-white text-xs font-bold rounded-xl flex items-center justify-center shadow-xs transition"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {isGeneratingBahanAjar ? "Menyusun Bahan Ajar..." : "Generate Bahan Ajar (AI)"}
            </button>

            {bahanError && (
              <div className="p-3 bg-red-50 text-red-800 text-xs font-semibold rounded-lg border border-red-100">
                {bahanError}
              </div>
            )}
          </div>

          {/* Right panel: Exhibit */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-5 shadow-sm min-h-[500px]">
            {selectedTpForAjar && modulAjarMap[selectedTpForAjar]?.generatedBahanAjar ? (
              <div className="space-y-5 animate-fadeIn font-sans">
                {/* Banner Header */}
                <div className="relative rounded-2xl overflow-hidden h-40 bg-slate-950 flex items-center p-6 border border-slate-100 shadow-sm">
                  <div className="absolute inset-0 opacity-15 bg-cover bg-center" style={{ backgroundImage: `url(https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&h=400&fit=crop)` }}></div>
                  <div className="relative z-10 text-white space-y-1">
                    <span className="bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 uppercase rounded-full">Bahan Ajar Teori</span>
                    <h2 className="text-base font-bold text-white tracking-tight">{modulAjarMap[selectedTpForAjar].tpText}</h2>
                    <p className="text-[10px] text-zinc-300">Konsep esensial dikompilasi AI • Kelas {config.grade}</p>
                  </div>
                </div>

                {/* Materi Reading Card */}
                <div className="bg-white rounded-xl border p-5 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 border-l-2 border-emerald-500 pl-2 mb-2">
                    Uraian Teori Esensial
                  </h3>
                  <div className="text-xs leading-relaxed text-slate-800 whitespace-pre-line text-justify font-sans bg-slate-50/50 p-4 rounded-xl border border-dashed select-text">
                    {modulAjarMap[selectedTpForAjar].generatedBahanAjar?.materiBahanAjar}
                  </div>
                </div>

                {/* Graphical Concept Map Visualization */}
                {modulAjarMap[selectedTpForAjar].generatedBahanAjar?.conceptMap && (
                  <div className="bg-white rounded-xl border p-5 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 border-l-2 border-emerald-500 pl-2">
                      visualisasi grafik peta konsep (diagram mind-map)
                    </h3>
                    <p className="text-[10px] text-slate-500 italic">Diagram alur relasi konsep utama terstruktur dari AI yang mempermudah pemahaman kognitif murid.</p>
                    
                    <div className="border rounded-xl bg-slate-50/40 p-3 flex justify-center overflow-x-auto min-h-[260px]">
                      <svg width="440" height="250" className="max-w-full select-none">
                        {/* Connection Path Lines */}
                        {(() => {
                          const nodes = modulAjarMap[selectedTpForAjar].generatedBahanAjar?.conceptMap?.nodes || [];
                          const conns = modulAjarMap[selectedTpForAjar].generatedBahanAjar?.conceptMap?.connections || [];
                          const numNodes = nodes.length;
                          const centerX = 220;
                          const centerY = 125;
                          const r = 85;

                          const nodePos = nodes.map((node, i) => {
                            const angle = (i * 2 * Math.PI) / (numNodes || 1) - Math.PI / 2;
                            return {
                              id: node.id,
                              label: node.label,
                              x: numNodes === 1 ? centerX : centerX + r * Math.cos(angle),
                              y: numNodes === 1 ? centerY : centerY + r * Math.sin(angle)
                            };
                          });

                          return (
                            <>
                              <defs>
                                <marker id="arrow-sub-sc" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981" />
                                </marker>
                              </defs>

                              {conns.map((conn, idx) => {
                                const p1 = nodePos.find(n => n.id === conn.from);
                                const p2 = nodePos.find(n => n.id === conn.to);
                                if (!p1 || !p2) return null;
                                return (
                                  <g key={idx}>
                                    <line 
                                      x1={p1.x} y1={p1.y} 
                                      x2={p2.x} y2={p2.y} 
                                      stroke="#a7f3d0" 
                                      strokeWidth="2" 
                                      markerEnd="url(#arrow-sub-sc)"
                                      strokeDasharray="4,4"
                                    />
                                    <rect 
                                      x={(p1.x + p2.x) / 2 - 20} 
                                      y={(p1.y + p2.y) / 2 - 7} 
                                      width="40" height="13" 
                                      rx="3" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1"
                                    />
                                    <text 
                                      x={(p1.x + p2.x) / 2} 
                                      y={(p1.y + p2.y) / 2 + 2} 
                                      textAnchor="middle" 
                                      fontSize="7" 
                                      fontWeight="600" 
                                      fill="#065f46"
                                    >
                                      {conn.label || "relasi"}
                                    </text>
                                  </g>
                                );
                              })}

                              {nodePos.map((n, i) => (
                                <g key={n.id} className="cursor-pointer group">
                                  <rect 
                                    x={n.x - 45} 
                                    y={n.y - 18} 
                                    width="90" 
                                    height="36" 
                                    rx="8" 
                                    fill={i === 0 ? "#1e293b" : "#ffffff"} 
                                    stroke={i === 0 ? "#475569" : "#10b981"} 
                                    strokeWidth="2"
                                    className="transition duration-155 group-hover:scale-105"
                                  />
                                  <text 
                                    x={n.x} 
                                    y={n.y + 4} 
                                    textAnchor="middle" 
                                    fontSize="8" 
                                    fontWeight="700" 
                                    fill={i === 0 ? "#ffffff" : "#1e293b"}
                                  >
                                    {n.label.length > 18 ? n.label.slice(0, 16) + "..." : n.label}
                                  </text>
                                </g>
                              ))}
                            </>
                          );
                        })()}
                      </svg>
                    </div>
                  </div>
                )}

                {/* Summary Terms Table */}
                {modulAjarMap[selectedTpForAjar].generatedBahanAjar?.ringkasanTabel && (
                  <div className="bg-white rounded-xl border p-5 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 border-l-2 border-emerald-500 pl-2">
                      Tabel Ringkasan Istilah & Fakta Pembelajaran
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-slate-200 text-xs text-left bg-white rounded-lg overflow-hidden shadow-xs">
                        <thead>
                          <tr className="bg-emerald-50/50 text-emerald-950 border-b border-slate-205 font-bold">
                            {modulAjarMap[selectedTpForAjar].generatedBahanAjar?.ringkasanTabel?.headers?.map((h, hIdx) => (
                              <th key={hIdx} className="p-2.5 border border-slate-200">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 text-slate-700 font-semibold font-sans">
                          {modulAjarMap[selectedTpForAjar].generatedBahanAjar?.ringkasanTabel?.rows?.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-slate-50 transition">
                              {row.map((val, cIdx) => (
                                <td key={cIdx} className="p-2.5 border border-slate-200 font-medium">{val}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400 h-[450px] flex flex-col items-center justify-center space-y-4 max-w-sm mx-auto">
                <div className="w-12 h-12 bg-emerald-50 flex items-center justify-center rounded-full text-emerald-600 animate-pulse">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-850 text-sm">Bahan Ajar Teori Belum Disusun</h4>
                  <p className="text-xs text-slate-550">Tekan tombol &ldquo;Generate Bahan Ajar&rdquo; di sebelah kiri agar AI menyusun ulasan materi esensial mendalam, tabel glosarium istilah fakta penting, serta mind-map interaktif.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sub-tab: Slide Materi PPT */}
      {activeSubTab === "slide" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-left font-sans">
          {/* Left panel: Info & Controls */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-display flex items-center space-x-1.5">
                <Presentation className="w-4 h-4 text-emerald-600" />
                <span>Media Presentasi (Slides PPT)</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Media eksposisi draf layar lebar kelas berbasis konten visual seperti diagram alir proses, tabel komparasi, dan grafik representasi kualitatif.</p>
            </div>

            {/* Selector TP */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-700 font-sans">Pilih Tujuan Pembelajaran (TP)</label>
              <select
                value={selectedTpForAjar}
                onChange={e => setSelectedTpForAjar(e.target.value)}
                className="w-full text-xs p-2 border bg-white rounded-lg focus:ring-1 focus:ring-emerald-500 font-semibold"
              >
                {atpList.map(a => (
                  <option key={a.code} value={a.code}>
                    {a.code} - {a.tpText.slice(0, 60)}...
                  </option>
                ))}
              </select>
            </div>

            {/* Profile info metadata cards */}
            {selectedTpForAjar && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-150 space-y-2 text-xs font-medium font-sans">
                <div className="flex justify-between border-b pb-1.5 border-dashed font-sans">
                  <span className="text-slate-400 font-bold">Mata Pelajaran:</span>
                  <span className="text-slate-705 font-bold">{config.subject}</span>
                </div>
                <div className="flex justify-between border-b pb-1.5 border-dashed">
                  <span className="text-slate-400 font-bold">Kelas / Semester:</span>
                  <span className="text-slate-705 font-bold">{config.grade}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 block font-bold">TP Terkait:</span>
                  <p className="text-slate-700 italic border-l-2 border-emerald-500 pl-2 py-0.5 text-justify leading-relaxed text-[11px]">
                    {atpList.find(a => a.code === selectedTpForAjar)?.tpText}
                  </p>
                </div>
              </div>
            )}

            <button
              disabled={isGeneratingPPT}
              onClick={handleGeneratePPT}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 cursor-pointer text-white text-xs font-bold rounded-xl flex items-center justify-center shadow-xs transition"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {isGeneratingPPT ? "Merevisi Slides..." : "Generate Media Slides (AI)"}
            </button>

            {pptError && (
              <div className="p-3 bg-red-50 text-red-800 text-xs font-semibold rounded-lg border border-red-100">
                {pptError}
              </div>
            )}
          </div>

          {/* Right panel: Exhibit */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-5 shadow-sm min-h-[500px]">
            {selectedTpForAjar && modulAjarMap[selectedTpForAjar]?.generatedPresentasi?.slides ? (
              <div className="space-y-5 animate-fadeIn font-sans">
                {/* PowerPoint Mockup Projector Canvas */}
                {(() => {
                  const slides = modulAjarMap[selectedTpForAjar].generatedPresentasi?.slides || [];
                  const idx = Math.min(currentSlideIdx, slides.length - 1);
                  const slide = slides[idx] || slides[0];
                  if (!slide) return null;

                  return (
                    <div className="space-y-4">
                      <div className="border border-zinc-900 rounded-2xl bg-zinc-950 p-6 shadow-2xl relative overflow-hidden min-h-[340px] flex flex-col justify-between font-sans select-none text-white transition-all text-left">
                        {/* Projector Matrix Pattern */}
                        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
                        
                        {/* Slide Header */}
                        <div className="relative z-10 flex items-center justify-between border-b border-zinc-800 pb-2 mb-4">
                          <div className="flex items-center space-x-2">
                            <span className="bg-emerald-500 text-[8px] font-bold px-1.5 py-0.5 rounded-md text-emerald-950">Slide {slide.slideNum}</span>
                            <span className="text-[10px] text-zinc-400 font-semibold tracking-wide">{config.subject} • Fase {config.fase}</span>
                          </div>
                          <span className="text-[8px] uppercase font-bold tracking-widest text-zinc-500 bg-zinc-900/40 px-2 py-0.5 rounded border border-zinc-800">
                            {slide.visualType} layout
                          </span>
                        </div>

                        {/* Slide Mid Content */}
                        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-5 items-center my-auto">
                          {/* Left half: Bullets list */}
                          <div className="md:col-span-6 space-y-3">
                            <h2 className="text-sm md:text-base font-extrabold text-white tracking-tight leading-tight uppercase border-l-2 border-emerald-500 pl-2 text-left">
                              {slide.title}
                            </h2>
                            <ul className="space-y-1.5 text-zinc-350 text-[11px] leading-relaxed pl-1 md:pl-2 text-left font-sans">
                              {slide.bullets?.map((b: string, bIdx: number) => (
                                <li key={bIdx} className="flex items-start">
                                  <span className="text-emerald-400 mr-2">✦</span>
                                  <span>{b}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Right half: Graphical visual content */}
                          <div className="md:col-span-6 flex items-center justify-center p-2 rounded-xl bg-zinc-900/75 border border-zinc-805 min-h-[170px]">
                            {/* CHART */}
                            {slide.visualType === "grafik" && (
                              <div className="w-full text-center space-y-2">
                                <span className="text-[8px] font-bold text-emerald-400 block tracking-widest uppercase">{slide.visualData?.title || "ANALISIS GRAFIK TANTANGAN"}</span>
                                <div className="flex justify-around items-end h-24 pt-3 px-2">
                                  {(slide.visualData?.labels || ["A", "B", "C", "D"]).map((lbl, idxBar) => {
                                    const pct = (slide.visualData?.values || [70, 85, 95, 60])[idxBar] || 50;
                                    return (
                                      <div key={idxBar} className="flex flex-col items-center flex-1 mx-1 max-w-[40px]">
                                        <div className="text-[8px] font-bold text-zinc-350 mb-1">{pct}%</div>
                                        <div 
                                          className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-sm transition-all duration-300" 
                                          style={{ height: `${pct}%` }}
                                        ></div>
                                        <div className="text-[7px] text-zinc-400 font-semibold mt-1 truncate w-full pt-1 text-center">{lbl}</div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* TABLE */}
                            {slide.visualType === "tabel" && (
                              <div className="w-full overflow-hidden text-zinc-200">
                                <span className="text-[8px] font-bold text-emerald-400 block tracking-widest uppercase text-center mb-1.5">{slide.visualData?.title || "TABEL METRIK DEFINISI"}</span>
                                <div className="overflow-x-auto">
                                  <table className="w-full text-left text-[8px] border-collapse border border-zinc-800">
                                    <thead>
                                      <tr className="bg-zinc-850 font-bold border-b border-zinc-800">
                                        {slide.visualData?.headers?.slice(0, 3).map((h, i) => (
                                          <th key={i} className="p-1 border border-zinc-800">{h}</th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-800 text-zinc-300">
                                      {slide.visualData?.rows?.slice(0, 3).map((row, rI) => (
                                        <tr key={rI} className="hover:bg-zinc-800">
                                          {row.slice(0, 3).map((vStr, cI) => (
                                            <td key={cI} className="p-1.5 border border-zinc-800 truncate max-w-[80px]">{vStr}</td>
                                          ))}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}

                            {/* PROCESS DIAGRAM */}
                            {slide.visualType === "diagram" && (
                              <div className="w-full text-center space-y-2 text-zinc-350">
                                <span className="text-[8px] font-bold text-emerald-400 block tracking-widest uppercase">{slide.visualData?.title || "PROSES ALUR/LANGKAH BELAJAR"}</span>
                                <div className="flex items-center justify-between sm:px-4 pt-3">
                                  {(slide.visualData?.nodes || ["Sesi 1", "Sesi 2", "Sesi 3"]).map((nodeLabel, idxNode) => (
                                    <React.Fragment key={idxNode}>
                                      <div className="flex flex-col items-center">
                                        <div className="w-7 h-7 bg-emerald-500/10 border border-emerald-450 text-emerald-400 text-[10px] font-bold rounded-full flex items-center justify-center">
                                          {idxNode + 1}
                                        </div>
                                        <span className="text-[7px] text-zinc-300 font-medium mt-1 w-16 truncate text-center leading-none">{nodeLabel}</span>
                                      </div>
                                      {idxNode < (slide.visualData?.nodes || []).length - 1 && (
                                        <div className="flex-1 border-t border-dashed border-zinc-800 h-0.5 mx-1 animate-pulse"></div>
                                      )}
                                    </React.Fragment>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* IMAGE */}
                            {slide.visualType === "gambar" && (
                              <div className="w-full text-center space-y-1 relative h-[160px] overflow-hidden rounded-lg">
                                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=700&h=300&fit=crop)` }}></div>
                                <div className="absolute inset-x-0 bottom-0 bg-zinc-900/80 p-1.5 text-center text-[7px] text-zinc-200 backdrop-blur-xs">
                                  Ilustrasi: {slide.unsplashQuery || "Peta Belajar"}
                                </div>
                              </div>
                            )}

                            {/* BULLET/DEFAULT */}
                            {slide.visualType === "bullet" && (
                              <div className="w-full text-center space-y-1.5 p-2">
                                <span className="text-[8px] font-bold text-emerald-400 block tracking-widest uppercase">{slide.visualData?.title || "IKHTISAR BELAJAR MANDIRI"}</span>
                                <div className="text-[9px] text-zinc-400 italic leading-relaxed text-center font-sans">
                                  &ldquo; Interaktif draf visual dengan media layar lebar proyektor di ruangan kelas untuk keaktifan kelompok &rdquo;
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Slide Footer */}
                        <div className="relative z-10 flex items-center justify-between border-t border-zinc-850 pt-2 mt-4 text-[7px] text-zinc-550">
                          <span>{config.schoolName} • Triyanto, S.Pd.</span>
                          <span>Halaman Slide {slide.slideNum} dari {slides.length}</span>
                        </div>
                      </div>

                      {/* Slide Player Controls Panel */}
                      <div className="flex items-center justify-between bg-slate-50 border p-3 rounded-xl select-none">
                        <div className="flex space-x-1.5">
                          <button 
                            disabled={idx === 0}
                            onClick={() => setCurrentSlideIdx(prev => Math.max(0, prev - 1))}
                            className="px-2.5 py-1 text-[11px] font-bold bg-white hover:bg-slate-100 rounded-lg border text-slate-800 disabled:opacity-40 cursor-pointer"
                          >
                            Sebelumnya
                          </button>
                          <button 
                            disabled={idx === slides.length - 1}
                            onClick={() => setCurrentSlideIdx(prev => Math.min(slides.length - 1, prev + 1))}
                            className="px-2.5 py-1 text-[11px] font-bold bg-white hover:bg-slate-100 rounded-lg border text-slate-800 disabled:opacity-40 cursor-pointer"
                          >
                            Berikutnya
                          </button>
                        </div>

                        {/* Dot Indicators */}
                        <div className="flex items-center space-x-1">
                          {slides.map((_, sIdx) => (
                            <button 
                              key={sIdx}
                              onClick={() => setCurrentSlideIdx(sIdx)}
                              className={`w-2 h-2 rounded-full transition ${sIdx === idx ? "bg-emerald-650 scale-125" : "bg-slate-200"}`}
                            ></button>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400 h-[450px] flex flex-col items-center justify-center space-y-4 max-w-sm mx-auto">
                <div className="w-12 h-12 bg-emerald-50 flex items-center justify-center rounded-full text-emerald-600 animate-pulse">
                  <Presentation className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-850 text-sm">Media Presentasi Slides Belum Disusun</h4>
                  <p className="text-xs text-slate-550">Tekan tombol &ldquo;Generate Media Slides&rdquo; di sebelah kiri agar AI merumuskan media PPT interaktif berorientas proyektor dilengkapi grafis, tabel, dan diagram.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sub-tab: Asesmen Formatif */}
      {activeSubTab === "asesmen" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-left font-sans">
          {/* Left panel: Info & Controls */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4 font-sans">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-display flex items-center space-x-1.5">
                <CheckSquare className="w-4 h-4 text-emerald-600" />
                <span>Asesmen Formatif AI</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Hasilkan instrumen evaluasi harian berupa kuis pilihan ganda berbasis AKM/HOTS dan rubrik observasi proses kerja kelompok.</p>
            </div>

            {/* Selector TP */}
            <div className="space-y-1 text-left font-sans">
              <label className="block text-[11px] font-bold text-slate-700">Pilih Tujuan Pembelajaran (TP)</label>
              <select
                value={selectedTpForAjar}
                onChange={e => setSelectedTpForAjar(e.target.value)}
                className="w-full text-xs p-2 border bg-white rounded-lg focus:ring-1 focus:ring-emerald-500 font-semibold"
              >
                {atpList.map(a => (
                  <option key={a.code} value={a.code}>
                    {a.code} - {a.tpText.slice(0, 60)}...
                  </option>
                ))}
              </select>
            </div>

            {/* Profile info metadata cards */}
            {selectedTpForAjar && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-150 space-y-2 text-xs font-medium font-sans text-left">
                <div className="flex justify-between border-b pb-1.5 border-dashed">
                  <span className="text-slate-400 font-bold">Mata Pelajaran:</span>
                  <span className="text-slate-700 font-bold">{config.subject}</span>
                </div>
                <div className="flex justify-between border-b pb-1.5 border-dashed">
                  <span className="text-slate-400 font-bold">Kelas / Semester:</span>
                  <span className="text-slate-705 font-bold">{config.grade}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 block font-bold">Kutipan TP Terpilih:</span>
                  <p className="text-slate-705 italic border-l-2 border-emerald-500 pl-2 py-0.5 text-justify leading-relaxed text-[11px]">
                    {atpList.find(a => a.code === selectedTpForAjar)?.tpText}
                  </p>
                </div>
              </div>
            )}

            <button
              disabled={isGeneratingAsesmen}
              onClick={handleGenerateAsesmenFormatif}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 cursor-pointer text-white text-xs font-bold rounded-xl flex items-center justify-center shadow-xs transition"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {isGeneratingAsesmen ? "Menyusun Asesmen..." : "Generate Asesmen Formatif (AI)"}
            </button>

            {asesmenError && (
              <div className="p-3 bg-red-50 text-red-007 text-xs font-semibold rounded-lg border border-red-100">
                {asesmenError}
              </div>
            )}
          </div>

          {/* Right panel: Exhibit */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-5 shadow-sm min-h-[500px] text-left">
            {selectedTpForAjar && modulAjarMap[selectedTpForAjar]?.generatedAsesmenFormatif ? (
              <div className="space-y-6 animate-fadeIn font-sans">
                {/* Header of paper */}
                <div className="text-center border-b pb-3 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                    Skenario & Instrumen Asesmen Formatif Proses
                  </span>
                  <h2 className="text-sm font-extrabold text-slate-800 uppercase leading-snug">{config.schoolName}</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 text-[10px] text-slate-500 border-t border-dashed mt-2 font-semibold">
                    <div>Fase / Kelas: <span className="text-slate-850 font-bold">{config.fase} / {config.grade}</span></div>
                    <div>Bidang Studi: <span className="text-slate-850 font-bold">{config.subject}</span></div>
                    <div>Metode: <span className="text-slate-855 font-bold">Dual-Form (Tes & Non-Tes)</span></div>
                    <div>Kode TP: <span className="text-slate-855 font-bold">{selectedTpForAjar}</span></div>
                  </div>
                </div>

                {/* Section 1: Kuis Pilihan Ganda AKM/HOTS */}
                <div className="space-y-4 font-sans text-left">
                  <h4 className="text-xs font-extrabold text-slate-900 border-b pb-1.5 flex items-center justify-between">
                    <span>A. Kuis Formatif (Evaluasi Kognitif Mandiri)</span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-750 border border-emerald-100 px-2 py-0.5 rounded font-mono uppercase">5 Soal Pilihan Ganda</span>
                  </h4>

                  <div className="space-y-4">
                    {modulAjarMap[selectedTpForAjar].generatedAsesmenFormatif?.kuisPilihanGanda?.map((soal, idx) => (
                      <div key={soal.id || idx} className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-3 font-sans text-left">
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-xs font-bold text-slate-800 flex-grow text-justify">
                            {idx + 1}. {soal.questionText}
                          </span>
                          <span className="shrink-0 text-[9px] bg-slate-200 px-1.5 py-0.5 text-slate-650 rounded font-black uppercase">
                            Level: {soal.cognitiveLevel || "C3/HOTS"}
                          </span>
                        </div>

                        {/* Options list */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-1 font-sans">
                          {soal.options?.map((opt, optIdx) => {
                            const optionLetter = String.fromCharCode(65 + optIdx); // A, B, C, D
                            return (
                              <div
                                key={optIdx}
                                className="flex items-center space-x-2.5 p-2 bg-white rounded-lg border border-slate-150 hover:bg-slate-100 cursor-pointer"
                              >
                                <span className="w-5 h-5 bg-slate-100 border text-slate-700 rounded-full flex items-center justify-center text-[10px] font-bold">
                                  {optionLetter}
                                </span>
                                <span className="text-xs text-slate-705 font-medium">{opt}</span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Kunci Jawaban Toggleable info */}
                        <div className="pt-1 select-none flex items-center justify-between text-left font-sans">
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-150 rounded px-1.5 py-0.5">
                            Kunci Jawaban: {soal.correctAnswer}
                          </span>
                          <span className="text-[10px] text-slate-400">Topik: {soal.topic}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 2: Rubrik Kinerja Evaluasi Non-Tes */}
                {modulAjarMap[selectedTpForAjar].generatedAsesmenFormatif?.rubrikKinerja && (
                  <div className="space-y-3 text-left font-sans">
                    <h4 className="text-xs font-extrabold text-slate-905 border-b pb-1.5 flex items-center justify-between">
                      <span>B. Rubrik Observasi Penilaian Proses (Non-Tes)</span>
                      <span className="text-[10px] bg-amber-50 text-amber-805 border border-amber-100 px-2 py-0.5 rounded font-mono uppercase">Kriteria Kinerja</span>
                    </h4>

                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-slate-200 text-xs text-left bg-white rounded-lg overflow-hidden font-sans">
                        <thead>
                          <tr className="bg-slate-50 text-slate-800 border-b font-extrabold">
                            <th className="p-2 border border-slate-150">Kriteria Kinerja</th>
                            <th className="p-2 border border-slate-155 bg-emerald-50/50 text-emerald-950">Sangat Baik</th>
                            <th className="p-2 border border-slate-155 bg-blue-50/50 text-blue-950">Baik</th>
                            <th className="p-2 border border-slate-155 bg-yellow-50/50 text-yellow-950">Cukup</th>
                            <th className="p-2 border border-slate-155 bg-red-50/50 text-red-950">Bimbingan</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-semibold text-slate-750 font-sans">
                          {modulAjarMap[selectedTpForAjar].generatedAsesmenFormatif?.rubrikKinerja?.criteria?.map((crit, cIdx) => (
                            <tr key={crit.id || cIdx} className="hover:bg-slate-50 transition">
                              <td className="p-2 border border-slate-150 font-bold bg-slate-50/40 text-slate-900">{crit.name}</td>
                              <td className="p-2 border border-slate-150 text-[11px] leading-relaxed select-text">{crit.sangatBaik}</td>
                              <td className="p-2 border border-slate-150 text-[11px] leading-relaxed select-text">{crit.baik}</td>
                              <td className="p-2 border border-slate-150 text-[11px] leading-relaxed select-text">{crit.cukup}</td>
                              <td className="p-2 border border-slate-150 text-[11px] leading-relaxed select-text">{crit.perluBimbingan}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400 h-[450px] flex flex-col items-center justify-center space-y-4 max-w-sm mx-auto">
                <div className="w-12 h-12 bg-emerald-50 flex items-center justify-center rounded-full text-emerald-600 animate-pulse">
                  <CheckSquare className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-850 text-sm">Asesmen Formatif Belum Disusun</h4>
                  <p className="text-xs text-slate-550">Tekan tombol &ldquo;Generate Asesmen Formatif&rdquo; di sebelah kiri agar AI menyusun 5 butir soal pilgan ujian harian kognitif (AKM/HOTS) dan rubrik non-tes lembar observasi proses belajar.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
