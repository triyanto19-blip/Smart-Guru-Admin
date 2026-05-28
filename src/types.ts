/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// School Configuration & Academic General Settings
export interface SchoolConfig {
  schoolName: string;
  headmasterName: string;
  headmasterNip: string;
  teacherName: string;
  teacherNip: string;
  phase: "A" | "B" | "C" | "D" | "E" | "F";
  grade: string; // e.g., "Kelas 1", "Kelas 4", "Kelas 7"
  subject: string; // e.g., "Ilmu Pengetahuan Alam dan Sosial (IPAS)", "Matematika", etc.
  academicYear: string; // e.g., "2025/2026"
  semester: "Ganjil" | "Genap";
  kktp: number; // Kriteria Ketercapaian Tujuan Pembelajaran, default: 70
  weeklyJp: number; // Alokasi JP per minggu, e.g., 4
  schoolAddress?: string; // e.g., "Jl. Pendidikan Raya No. 45, Kecamatan Gambir, Jakarta Pusat..."
  schoolLogo?: string; // Base64 data URL string
  teacherSignatureType?: "upload" | "text";
  teacherSignatureData?: string; // Base64 image data OR text/name string
  headmasterSignatureType?: "upload" | "text";
  headmasterSignatureData?: string; // Base64 image data OR text/name string
}

// Teacher Profile assignment (multi-class / multi-subject representation)
export interface TeacherProfile {
  id: string;
  name: string;
  grade: string;
  subject: string;
}

// School Calendar Weeks
export interface CalendarWeek {
  weekNum: number;
  dateRange: string; // e.g., "14 - 18 Jul 2025"
  isEffective: boolean;
  activityName: string; // e.g., "Belajar Efektif", "Libur Semester", "PTS", "Pekan Olahraga"
}

// Tujuan Pembelajaran (TP) in ATP
export interface AlurTujuanPembelajaran {
  id: string;
  code: string; // e.g., "TP 1.1"
  tpText: string; // The TP content description
  jpAllocation: number; // e.g., 8 JP
  targetWeeks: number[]; // Week numbers mapped, e.g., [1, 2]
}

// Daily Attendance Records
export type AttendanceStatus = "Hadir" | "Sakit" | "Izin" | "Alpa" | "Belum Diisi";

export interface Student {
  id: string;
  nisn: string;
  name: string;
  gender: "L" | "P";
}

export interface DailyAttendance {
  date: string; // YYYY-MM-DD
  records: { [studentId: string]: AttendanceStatus };
}

// Daily Teaching Journal
export interface TeachingJournal {
  id: string;
  date: string; // YYYY-MM-DD
  tpCode: string; // e.g., "TP 1.1"
  topic: string; // Specific topic taught
  jpRealized: number; // number of hours taught
  status: "Selesai" | "Tersisa 1 sub-bab" | "Belum Dimulai" | "Perlu Pengulangan";
  notes: string; // Refleksi / Catatan Guru
}

// Behavior Case Logs (Buku Catatan Kasus)
export interface CaseLog {
  id: string;
  date: string;
  studentId: string;
  behaviorType: "Positif" | "Negatif";
  behaviorDescription: string; // e.g., "Membantu merapikan pojok baca secara sukarela" atau "Terlambat masuk kelas"
  followUp: string; // Tindak lanjut e.g., "Apresiasi di kelas", "Konseling personal setelah pulang sekolah"
}

// Assessment Kisi-kisi and Questions Item
export interface QuestionItem {
  id: string;
  tpCode: string;
  topic: string;
  cognitiveLevel: "C1" | "C2" | "C3" | "C4" | "C5" | "C6" | "LOTS" | "HOTS";
  questionText: string;
  options?: string[]; // MC Options: A, B, C, D (for Multiple Choice)
  correctAnswer: string; // Answer option (e.g., "A") or text for short-answer
}

export interface KisiKisi {
  id: string;
  tpCode: string;
  subjectName: string;
  examType: "Sumatif Tengah Semester" | "Sumatif Akhir Semester" | "Harian";
  questions: QuestionItem[];
}

// Performance Assessment Rubrics
export interface RubricCriterion {
  id: string;
  name: string; // e.g., "Sikap Presentasi", "Kesesuaian Materi"
  sangatBaik: string; // Descriptor for score 4
  baik: string;       // Descriptor for score 3
  cukup: string;      // Descriptor for score 2
  perluBimbingan: string; // Descriptor for score 1
}

export interface AssessmentRubric {
  id: string;
  tpCode: string;
  title: string; // e.g., "Rubrik Penilaian Presentasi Kelompok"
  criteria: RubricCriterion[];
}

// Student Grade Entry
export interface StudentGrade {
  studentId: string;
  formativeGrades: { [tpCode: string]: number }; // Map of TP code to score e.g., 85
  midtermGrade: number; // UTS / STS
  finalGrade: number;   // UAS / SAS
  remedialScore?: number; // Score achieved after remediation
}

// Modular Ajar (RPP+) detail structure
export interface ModulAjar {
  tpCode: string;
  tpText: string;
  diferensiasiType: "Tidak" | "Gaya Belajar" | "Diferensiasi Kognitif";
  identitas: {
    sekolah: string;
    fase: string;
    kelas: string;
    mapel: string;
    alokasiWaktu: string;
    profilPancasila: string[];
    saranaPrasarana: string;
    targetSiswa: string;
    modelPembelajaran: string;
  };
  komponenInti: {
    tujuanPembelajaran: string;
    pemahamanBermakna: string;
    pertanyaanPemantik: string;
    asesmenAwalDiagnostik: string;
  };
  langkahPembelajaran: {
    pendahuluan: string;
    inti: string; // Contains differential activities if selected
    penutup: string;
  };
  materiBahanAjar: string; // Clean html or markdown of active reading text
  pptOverview: {
    slides: {
      slideNum: number;
      title: string;
      content: string[];
    }[];
  };
  lkpd: {
    petunjuk: string[];
    aktivitas: string;
    pertanyaanPemantikLogika: string[];
  };
  generatedLkpd?: {
    tpCode: string;
    tpText: string;
    petunjuk: string[];
    aktivitas: string;
    pertanyaanPemantikLogika: string[];
    unsplashQuery?: string;
    graphicData?: {
      title: string;
      type: string;
      items: { label: string; value: number }[];
    };
    rubrikTabel?: {
      headers: string[];
      rows: string[][];
    };
  };
  generatedBahanAjar?: {
    tpCode: string;
    tpText: string;
    materiBahanAjar: string;
    unsplashQuery?: string;
    conceptMap?: {
      nodes: { id: string; label: string; details?: string }[];
      connections: { from: string; to: string; label?: string }[];
    };
    ringkasanTabel?: {
      headers: string[];
      rows: string[][];
    };
  };
  generatedPresentasi?: {
    tpCode: string;
    tpText: string;
    slides: {
      slideNum: number;
      title: string;
      bullets: string[];
      visualType: string;
      unsplashQuery: string;
      visualData?: {
        title?: string;
        headers?: string[];
        rows?: string[][];
        labels?: string[];
        values?: number[];
        nodes?: string[];
      };
    }[];
  };
  generatedAsesmenFormatif?: {
    tpCode: string;
    tpText: string;
    kuisPilihanGanda: {
      id: string;
      tpCode: string;
      topic: string;
      cognitiveLevel: string;
      questionText: string;
      options: string[];
      correctAnswer: string;
    }[];
    rubrikKinerja?: {
      id: string;
      tpCode: string;
      title: string;
      criteria: {
        id: string;
        name: string;
        sangatBaik: string;
        baik: string;
        cukup: string;
        perluBimbingan: string;
      }[];
    };
  };
  pembelajaranMendalam?: {
    identitas: {
      satuanPendidikan: string;
      mataPelajaran: string;
      kelasSemester: string;
      durasiPertemuan: string;
    };
    identifikasi: {
      siswa: string;
      materiPelajaran: string;
      capaianDimensiLulusan: string[];
    };
    desainPembelajaran: {
      capaianPembelajaran: string;
      lintasDisiplinIlmu: string;
      tujuanPembelajaran: string;
      topikPembelajaran: string;
      praktikPedagogisPerPertemuan: { [pertemuanIdx: number]: string };
      kemitraanPembelajaran: string;
      lingkunganPembelajaran: string;
      pemanfaatanDigital: string;
    };
    pengalamanBelajar: {
      memahami: string; // (berkesadaran, bermakna, menggembirakan)
      mengaplikasi: string; // (berkesadaran, bermakna, menggembirakan)
      refleksi: string; // (berkesadaran, bermakna, menggembirakan)
    };
    asesmenPembelajaran: {
      awal: string;
      proses: string;
      akhir: string;
    };
  };
}

// Remedial & Pengayaan AI Outputs
export interface GroupFollowUp {
  tpCode: string;
  remedialMaterial: string; // short summary
  remedialQuestions: { question: string; guide: string }[];
  pengayaanCase: string; // high-level case study
  pengayaanTask: string; // project or critical-thinking assignment
}
