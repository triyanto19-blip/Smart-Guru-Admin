/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { SchoolConfig, CalendarWeek, AlurTujuanPembelajaran, Student, DailyAttendance, TeachingJournal, CaseLog } from "../types";
import { 
  Users, Calendar, BookOpen, AlertCircle, Plus, Check, CheckSquare, 
  Trash2, Award, Heart, ShieldAlert, Sliders, ChevronRight, UserCheck,
  FileSpreadsheet, Printer, Download, ClipboardList, FileDown
} from "lucide-react";

interface ExecutionModuleProps {
  config: SchoolConfig;
  weeks: CalendarWeek[];
  atpList: AlurTujuanPembelajaran[];
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  attendanceList: DailyAttendance[];
  setAttendanceList: React.Dispatch<React.SetStateAction<DailyAttendance[]>>;
  journals: TeachingJournal[];
  setJournals: React.Dispatch<React.SetStateAction<TeachingJournal[]>>;
  caseLogs: CaseLog[];
  setCaseLogs: React.Dispatch<React.SetStateAction<CaseLog[]>>;
}

export const ExecutionModule: React.FC<ExecutionModuleProps> = ({
  config,
  weeks,
  atpList,
  students,
  setStudents,
  attendanceList,
  setAttendanceList,
  journals,
  setJournals,
  caseLogs,
  setCaseLogs,
}) => {
  // Navigation
  const [activeTab, setActiveTab ] = useState<"attendance" | "journal" | "case" | "report">("attendance");

  // Selection dates
  const [currentDateString, setCurrentDateString] = useState("2026-05-28");

  // Local state for registering behavior
  const [newCaseStudentId, setNewCaseStudentId] = useState(students[0]?.id || "");
  const [newCaseType, setNewCaseType] = useState<"Positif" | "Negatif">("Positif");
  const [newCaseDesc, setNewCaseDesc] = useState("");
  const [newCaseFollowUp, setNewCaseFollowUp] = useState("");

  // Local state for adding journal
  const [manualTopic, setManualTopic] = useState("");
  const [manualJpRealized, setManualJpRealized] = useState(4);
  const [manualStatus, setManualStatus] = useState<"Selesai" | "Tersisa 1 sub-bab" | "Belum Dimulai" | "Perlu Pengulangan">("Selesai");
  const [manualNotes, setManualNotes] = useState("");

  // Local state for adding student
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentNisn, setNewStudentNisn] = useState("");
  const [newStudentGender, setNewStudentGender] = useState<"L" | "P">("L");
  const [showAddStudentField, setShowAddStudentField] = useState(false);

  // Local state for CSV Import
  const [showCsvImportField, setShowCsvImportField] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<string[][]>([]);
  const [nameColumnMapping, setNameColumnMapping] = useState<string>("");
  const [nisnColumnMapping, setNisnColumnMapping] = useState<string>("");
  const [genderColumnMapping, setGenderColumnMapping] = useState<string>("");
  const [importMethod, setImportMethod] = useState<"append" | "overwrite">("append");
  const [csvError, setCsvError] = useState<string>("");
  const [csvSuccess, setCsvSuccess] = useState<string>("");

  // Local state for Reports (Rekapitulasi & Laporan)
  const [reportType, setReportType] = useState<"rekap-absensi" | "rekap-jurnal" | "rekap-buku-catatan">("rekap-absensi");
  const [reportPeriod, setReportPeriod] = useState<"mingguan" | "bulanan" | "semesteran" | "tahunan" | "kustom">("bulanan");
  
  // Selection input options
  const [selectedWeekNum, setSelectedWeekNum] = useState<number>(1);
  const [selectedMonth, setSelectedMonth] = useState<number>(5); // Default is May (Mei) to match available mock dates
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedSemester, setSelectedSemester] = useState<"Ganjil" | "Genap">("Genap");
  const [customStartDate, setCustomStartDate] = useState<string>("2026-05-01");
  const [customEndDate, setCustomEndDate] = useState<string>("2026-05-31");
  
  // Customizable report signature details
  const [customTeacherName, setCustomTeacherName] = useState<string>(config.teacherName);
  const [customTeacherNip, setCustomTeacherNip] = useState<string>(config.teacherNip);
  const [customHeadmasterName, setCustomHeadmasterName] = useState<string>(config.headmasterName);
  const [customHeadmasterNip, setCustomHeadmasterNip] = useState<string>(config.headmasterNip);
  const [reportSignPlace, setReportSignPlace] = useState<string>("Jakarta");
  const [reportSignDate, setReportSignDate] = useState<string>("2026-05-28");

  const indonesianMonths = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const formatIndonesianDate = (dateStr: string): string => {
    if (!dateStr) return "-";
    const parts = dateStr.split("-");
    if (parts.length !== 3) return dateStr;
    const year = parts[0];
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return `${day} ${indonesianMonths[month]} ${year}`;
  };

  // Synchronized Start and End Dates based on active selections
  const getReportingDateRange = () => {
    let start = "2026-05-01";
    let end = "2026-05-31";

    if (reportPeriod === "mingguan") {
      // Return predefined or calculated weekly intervals matching mock calendar dates
      if (selectedWeekNum === 1) { 
        start = "2025-07-14"; end = "2025-07-18";
      } else if (selectedWeekNum === 2) {
        start = "2025-07-21"; end = "2025-07-25";
      } else if (selectedWeekNum === 3) {
        start = "2025-07-28"; end = "2025-08-01";
      } else if (selectedWeekNum === 4) {
        start = "2025-08-04"; end = "2025-08-08";
      } else if (selectedWeekNum === 5) {
        start = "2025-08-11"; end = "2025-08-15";
      } else if (selectedWeekNum === 6) {
        start = "2025-08-18"; end = "2025-08-22";
      } else if (selectedWeekNum === 7) {
        start = "2025-08-25"; end = "2025-08-29";
      } else if (selectedWeekNum === 8) {
        start = "2025-09-01"; end = "2025-09-05";
      } else if (selectedWeekNum === 9) {
        start = "2025-09-08"; end = "2025-09-12";
      } else if (selectedWeekNum === 10) {
        start = "2025-09-15"; end = "2025-09-19";
      } else if (selectedWeekNum === 11) {
        start = "2025-09-22"; end = "2025-09-26";
      } else if (selectedWeekNum === 12) {
        start = "2025-09-29"; end = "2025-10-03";
      } else if (selectedWeekNum === 13) {
        start = "2025-10-06"; end = "2025-10-10";
      } else if (selectedWeekNum === 14) {
        start = "2025-10-13"; end = "2025-10-17";
      } else if (selectedWeekNum === 15) {
        start = "2025-10-20"; end = "2025-10-24";
      } else if (selectedWeekNum === 16) {
        start = "2025-10-27"; end = "2025-10-31";
      } else if (selectedWeekNum === 17) {
        start = "2025-11-03"; end = "2025-11-07";
      } else if (selectedWeekNum === 18) {
        start = "2025-11-10"; end = "2025-11-14";
      } else {
        // Fallback or virtual week mapping containing mock records
        start = "2026-05-25"; end = "2026-05-29";
      }
    } else if (reportPeriod === "bulanan") {
      const yearStr = String(selectedYear);
      const monthStr = selectedMonth < 10 ? `0${selectedMonth}` : String(selectedMonth);
      const lastDay = new Date(selectedYear, selectedMonth, 0).getDate();
      start = `${yearStr}-${monthStr}-01`;
      end = `${yearStr}-${monthStr}-${lastDay}`;
    } else if (reportPeriod === "semesteran") {
      if (selectedSemester === "Ganjil") {
        start = `${config.academicYear.split("/")[0] || "2025"}-07-01`;
        end = `${config.academicYear.split("/")[0] || "2025"}-12-31`;
      } else {
        start = `${config.academicYear.split("/")[1] || "2026"}-01-01`;
        end = `${config.academicYear.split("/")[1] || "2026"}-06-30`;
      }
    } else if (reportPeriod === "tahunan") {
      const parts = config.academicYear.split("/");
      const startYear = parts[0] || "2025";
      const endYear = parts[1] || "2026";
      start = `${startYear}-07-01`;
      end = `${endYear}-06-30`;
    } else if (reportPeriod === "kustom") {
      start = customStartDate;
      end = customEndDate;
    }

    return { start, end };
  };

  const { start: activeStartDate, end: activeEndDate } = getReportingDateRange();

  // Filter lists based on calculated ranges
  const filteredAttendanceDates = attendanceList.filter(a => {
    return a.date >= activeStartDate && a.date <= activeEndDate;
  });

  const getStudentAttendanceMetrics = (studentId: string) => {
    let hadir = 0;
    let sakit = 0;
    let izin = 0;
    let alpa = 0;
    
    filteredAttendanceDates.forEach(day => {
      const record = day.records[studentId];
      if (record === "Hadir") hadir++;
      else if (record === "Sakit") sakit++;
      else if (record === "Izin") izin++;
      else if (record === "Alpa") alpa++;
    });

    const totalFilledDays = hadir + sakit + izin + alpa;
    const persentaseKehadiran = totalFilledDays > 0 ? Math.round((hadir / totalFilledDays) * 100) : 0;

    return { hadir, sakit, izin, alpa, totalFilledDays, persentaseKehadiran };
  };

  const filteredJournals = journals.filter(j => {
    return j.date >= activeStartDate && j.date <= activeEndDate;
  }).sort((a, b) => a.date.localeCompare(b.date));

  const filteredCaseLogs = caseLogs.filter(c => {
    return c.date >= activeStartDate && c.date <= activeEndDate;
  }).sort((a, b) => a.date.localeCompare(b.date));

  const getLaporanTitle = () => {
    let titleStr = "";
    if (reportType === "rekap-absensi") titleStr = "REKAPITULASI PRESENSI PESERTA DIDIK";
    if (reportType === "rekap-jurnal") titleStr = "REKAPITULASI JURNAL & AGENDA MENGAJAR GURU";
    if (reportType === "rekap-buku-catatan") titleStr = "REKAPITULASI CATATAN KASUS & PERKEMBANGAN SISWA";

    let suffixStr = "";
    if (reportPeriod === "mingguan") {
      suffixStr = `PEKAN KE-${selectedWeekNum}`;
    } else if (reportPeriod === "bulanan") {
      suffixStr = `BULAN ${indonesianMonths[selectedMonth - 1]?.toUpperCase()} ${selectedYear}`;
    } else if (reportPeriod === "semesteran") {
      suffixStr = `SEMESTER ${selectedSemester.toUpperCase()} (TAHUN AJARAN ${config.academicYear})`;
    } else if (reportPeriod === "tahunan") {
      suffixStr = `TAHUNAN (TAHUN AJARAN ${config.academicYear})`;
    } else {
      suffixStr = `PERIODE ${formatIndonesianDate(activeStartDate)} S.D. ${formatIndonesianDate(activeEndDate)}`;
    }

    return `${titleStr} - ${suffixStr}`;
  };

  const handleDownloadHtmlReport = () => {
    const docTitle = getLaporanTitle();
    
    // Determine the main table body style and values
    let tableHtml = "";
    if (reportType === "rekap-absensi") {
      tableHtml = `
        <table class="report-table">
          <thead>
            <tr>
              <th style="width: 5%">No</th>
              <th style="width: 15%">NISN</th>
              <th style="width: 35%">Nama Lengkap</th>
              <th style="width: 9%">L/P</th>
              <th style="width: 8%">Hadir</th>
              <th style="width: 8%">Sakit</th>
              <th style="width: 8%">Izin</th>
              <th style="width: 8%">Alpa</th>
              <th style="width: 12%">% Hadir</th>
            </tr>
          </thead>
          <tbody>
            ${students.map((s, idx) => {
              const metrics = getStudentAttendanceMetrics(s.id);
              return `
                <tr>
                  <td style="text-align: center">${idx + 1}</td>
                  <td style="font-family: monospace">${s.nisn}</td>
                  <td style="font-weight: bold">${s.name}</td>
                  <td style="text-align: center; font-weight: bold">${s.gender}</td>
                  <td style="text-align: center; color: #16a34a; font-weight: bold">${metrics.hadir}</td>
                  <td style="text-align: center; color: #d97706">${metrics.sakit}</td>
                  <td style="text-align: center; color: #2563eb">${metrics.izin}</td>
                  <td style="text-align: center; color: #dc2626">${metrics.alpa}</td>
                  <td style="text-align: center; font-weight: bold">${metrics.persentaseKehadiran}%</td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      `;
    } else if (reportType === "rekap-jurnal") {
      tableHtml = `
        <table class="report-table">
          <thead>
            <tr>
              <th style="width: 5%">No</th>
              <th style="width: 12%">Tanggal</th>
              <th style="width: 10%">TP Code</th>
              <th style="width: 25%">Materi / Kegiatan Pembelajaran</th>
              <th style="width: 8%">SKS/JP</th>
              <th style="width: 15%">Ketercapaian</th>
              <th style="width: 25%">Catatan Refleksi Guru</th>
            </tr>
          </thead>
          <tbody>
            ${filteredJournals.map((j, idx) => `
              <tr>
                <td style="text-align: center">${idx + 1}</td>
                <td style="white-space: nowrap">${formatIndonesianDate(j.date)}</td>
                <td style="font-weight: bold; text-align: center; font-family: monospace">${j.tpCode}</td>
                <td>${j.topic}</td>
                <td style="text-align: center">${j.jpRealized} JP</td>
                <td style="font-weight: bold; text-align: center">${j.status}</td>
                <td style="color: #4b5563; font-style: italic">${j.notes}</td>
              </tr>
            `).join("")}
            ${filteredJournals.length === 0 ? `<tr><td colspan="7" style="text-align: center; color: #9ca3af; font-style: italic; padding: 20px;">Tidak ada agenda mengajar terdaftar pada periode ini.</td></tr>` : ""}
          </tbody>
        </table>
      `;
    } else {
      tableHtml = `
        <table class="report-table">
          <thead>
            <tr>
              <th style="width: 5%">No</th>
              <th style="width: 12%">Tanggal</th>
              <th style="width: 28%">Peserta Didik (NISN)</th>
              <th style="width: 12%">Karakter</th>
              <th style="width: 25%">Deskripsi Kejadian / Peristiwa</th>
              <th style="width: 18%">Rencana Tindak Lanjut</th>
            </tr>
          </thead>
          <tbody>
            ${filteredCaseLogs.map((c, idx) => {
              const matchedS = students.find(s => s.id === c.studentId);
              return `
                <tr>
                  <td style="text-align: center">${idx + 1}</td>
                  <td style="white-space: nowrap">${formatIndonesianDate(c.date)}</td>
                  <td>
                    <div style="font-weight: bold">${matchedS?.name || "Siswa Terhapus"}</div>
                    <div style="font-size: 10px; color: #6b7280; font-family: monospace">${matchedS?.nisn || "-"} (${matchedS?.gender || "-"})</div>
                  </td>
                  <td style="text-align: center">
                    <span style="font-weight: bold; padding: 2px 6px; border-radius: 9999px; font-size: 10px; ${
                      c.behaviorType === "Positif" 
                        ? "background-color: #d1fae5; color: #065f46" 
                        : "background-color: #fee2e2; color: #991b1b"
                    }">
                      ${c.behaviorType}
                    </span>
                  </td>
                  <td>${c.behaviorDescription}</td>
                  <td style="font-weight: bold">${c.followUp}</td>
                </tr>
              `;
            }).join("")}
            ${filteredCaseLogs.length === 0 ? `<tr><td colspan="6" style="text-align: center; color: #9ca3af; font-style: italic; padding: 20px;">Tidak ada catatan kasus afektif pada periode ini.</td></tr>` : ""}
          </tbody>
        </table>
      `;
    }

    const htmlContent = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>${docTitle}</title>
  <style>
    body {
      font-family: inherit;
      font-family: "Nimbus Sans L", "Liberation Sans", Inter, Arial, sans-serif;
      color: #0c0a09;
      background: #ffffff;
      margin: 40px;
      line-height: 1.4;
    }
    .kop-panel {
      border-bottom: 4px double #1c1917;
      padding-bottom: 12px;
      margin-bottom: 20px;
    }
    .kop-table {
      width: 100%;
      border-collapse: collapse;
      border: none;
    }
    .kop-table td {
      border: none;
      padding: 0;
    }
    .kop-text {
      text-align: center;
      padding: 0 15px !important;
    }
    .kop-text h4 {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin: 0 0 3px 0;
      color: #374151;
    }
    .kop-text h3 {
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin: 0 0 3px 0;
      color: #111827;
    }
    .kop-text h2 {
      font-size: 18px;
      font-weight: 900;
      text-transform: uppercase;
      margin: 0 0 6px 0;
      color: #030712;
    }
    .kop-text p {
      font-size: 10px;
      font-style: italic;
      color: #4b5563;
      margin: 0;
    }
    .doc-meta {
      text-align: center;
      margin-top: 15px;
      margin-bottom: 15px;
    }
    .doc-meta h1 {
      font-size: 15px;
      font-weight: 800;
      text-decoration: underline;
      text-decoration-thickness: 1.5px;
      margin: 0;
    }
    .doc-meta p {
      font-size: 11px;
      color: #4b5563;
      margin: 5px 0 0 0;
    }
    .meta-grid {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #d1d5db;
      background-color: #f9fafb;
      margin-bottom: 25px;
      font-size: 11px;
    }
    .meta-grid td {
      border: 1px solid #e5e7eb;
      padding: 8px 12px;
      width: 50%;
    }
    .meta-label {
      color: #6b7280;
      font-weight: 600;
    }
    .meta-value {
      color: #111827;
      font-weight: 550;
      float: right;
    }
    .report-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
      margin-bottom: 35px;
    }
    .report-table th, .report-table td {
      border: 1px solid #1c1917;
      padding: 6px 8px;
      text-align: left;
    }
    .report-table th {
      background-color: #f3f4f6;
      font-weight: bold;
      text-transform: uppercase;
      font-size: 10px;
    }
    .signatures-panel {
      width: 100%;
      margin-top: 30px;
      page-break-inside: avoid;
    }
    .signatures-table {
      width: 100%;
      border-collapse: collapse;
      border: none;
      font-size: 11px;
    }
    .signatures-table td {
      border: none;
      padding: 10px;
      width: 50%;
      text-align: center;
      vertical-align: top;
    }
    .sign-date {
      margin-bottom: 15px;
      text-align: right;
      padding-right: 50px;
      font-size: 11px;
    }
    .sign-title {
      font-weight: bold;
      margin-bottom: 75px;
    }
    .sign-name {
      font-weight: bold;
      text-decoration: underline;
    }
    @media print {
      body {
        margin: 20px;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  
  <div class="kop-panel">
    <table class="kop-table">
      <tr>
        <td style="width: 70px; text-align: center;">
          <div style="font-size: 32px">🎓</div>
        </td>
        <td class="kop-text">
          <h4>KEMENTERIAN PENDIDIKAN, KEBUDAYAAN, RISET, DAN TEKNOLOGI</h4>
          <h3>DINAS PENDIDIKAN PROVINSI DKI JAKARTA</h3>
          <h2>${config.schoolName}</h2>
          <p>${config.schoolAddress || "Jl. Pendidikan Raya No. 45, Kecamatan Gambir, Jakarta Pusat, DKI Jakarta • Telepon: (021) 555-0123"}</p>
        </td>
        <td style="width: 70px; text-align: center;">
          ${config.schoolLogo ? `<img src="${config.schoolLogo}" style="max-width: 60px; max-height: 60px; object-fit: contain;" />` : `<div style="font-size: 10px; border: 1.5px dashed #9ca3af; padding: 6px; border-radius: 4px; font-weight: bold; color: #9ca3af;">LOGO SEKOLAH</div>`}
        </td>
      </tr>
    </table>
  </div>

  <div class="doc-meta">
    <h1>${docTitle.split(" - ")[0]}</h1>
    <p>Periode: ${docTitle.split(" - ")[1] || "Semua"}</p>
  </div>

  <table class="meta-grid">
    <tr>
      <td>
        <span class="meta-label">Mata Pelajaran:</span>
        <span class="meta-value">${config.subject}</span>
      </td>
      <td>
        <span class="meta-label">Kelas / Fase:</span>
        <span class="meta-value">${config.grade} / Fase ${config.phase}</span>
      </td>
    </tr>
    <tr>
      <td>
        <span class="meta-label">Tahun Ajaran / Semester:</span>
        <span class="meta-value">${config.academicYear} / Semester ${config.semester}</span>
      </td>
      <td>
        <span class="meta-label">Sensus Ketercapaian:</span>
        <span class="meta-value">KKTP: ${config.kktp}</span>
      </td>
    </tr>
  </table>

  ${tableHtml}

  <div class="signatures-panel">
    <div class="sign-date">${reportSignPlace}, ${formatIndonesianDate(reportSignDate)}</div>
    <table class="signatures-table">
      <tr>
        <td>
          <div style="margin-bottom: 5px;">Mengetahui,</div>
          <div class="sign-title" style="margin-bottom: ${config.headmasterSignatureData ? '10px' : '75px'};">Kepala Sekolah ${config.schoolName}</div>
          ${config.headmasterSignatureType === "upload" && config.headmasterSignatureData ? `<div style="height: 60px; display: flex; align-items: center; justify-content: center; margin-bottom: 10px;"><img src="${config.headmasterSignatureData}" style="max-height: 55px; max-width: 140px; object-fit: contain;" /></div>` : ''}
          ${config.headmasterSignatureType === "text" && config.headmasterSignatureData ? `<div style="height: 60px; display: flex; align-items: center; justify-content: center; margin-bottom: 10px; font-family: 'Brush Script MT', cursive, Georgia, serif; font-size: 16px; color: #1e3a8a; font-weight: bold; font-style: italic;">${config.headmasterSignatureData}</div>` : ''}
          <div class="sign-name">${customHeadmasterName}</div>
          <div style="font-family: monospace; font-size: 10px; margin-top: 2px;">NIP. ${customHeadmasterNip || "-"}</div>
        </td>
        <td>
          <div style="margin-bottom: 5px;">&nbsp;</div>
          <div class="sign-title" style="margin-bottom: ${config.teacherSignatureData ? '10px' : '75px'};">Guru Kelas / Mata Pelajaran</div>
          ${config.teacherSignatureType === "upload" && config.teacherSignatureData ? `<div style="height: 60px; display: flex; align-items: center; justify-content: center; margin-bottom: 10px;"><img src="${config.teacherSignatureData}" style="max-height: 55px; max-width: 140px; object-fit: contain;" /></div>` : ''}
          ${config.teacherSignatureType === "text" && config.teacherSignatureData ? `<div style="height: 60px; display: flex; align-items: center; justify-content: center; margin-bottom: 10px; font-family: 'Brush Script MT', cursive, Georgia, serif; font-size: 16px; color: #1e3a8a; font-weight: bold; font-style: italic;">${config.teacherSignatureData}</div>` : ''}
          <div class="sign-name">${customTeacherName}</div>
          <div style="font-family: monospace; font-size: 10px; margin-top: 2px;">NIP. ${customTeacherNip || "-"}</div>
        </td>
      </tr>
    </table>
  </div>

  <div class="no-print" style="margin-top: 40px; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 20px;">
    <button onclick="window.print()" style="padding: 10px 22px; font-weight: bold; background-color: #2563eb; color: #ffffff; border: none; border-radius: 6px; cursor: pointer; font-size: 13px;">Cetak Dokumen Sekarang</button>
  </div>

</body>
</html>
    `;

    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${docTitle.toLowerCase().replace(/[^a-z0-9]/g, "_")}.html`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadCsvReport = () => {
    const docTitle = getLaporanTitle();
    let csvStr = "";

    if (reportType === "rekap-absensi") {
      csvStr = "No,NISN,Nama Siswa,Gender,Hadir (H),Sakit (S),Izin (I),Alpa (A),Persentase Kehadiran (%)\n";
      students.forEach((s, idx) => {
        const metrics = getStudentAttendanceMetrics(s.id);
        csvStr += `${idx + 1},${s.nisn},"${s.name}",${s.gender},${metrics.hadir},${metrics.sakit},${metrics.izin},${metrics.alpa},${metrics.persentaseKehadiran}%\n`;
      });
    } else if (reportType === "rekap-jurnal") {
      csvStr = "No,Tanggal,TP Code,Topik Kegiatan Pembelajaran,SKS JP,Status,Notes\n";
      filteredJournals.forEach((j, idx) => {
        csvStr += `${idx + 1},${j.date},${j.tpCode},"${j.topic.replace(/"/g, '""')}",${j.jpRealized},${j.status},"${j.notes.replace(/"/g, '""')}"\n`;
      });
    } else {
      csvStr = "No,Tanggal,Nama Siswa,NISN,Gender,Karakter,Kejadian / Perilaku,Rencana Tindak Lanjut\n";
      filteredCaseLogs.forEach((c, idx) => {
        const matched = students.find(s => s.id === c.studentId);
        csvStr += `${idx + 1},${c.date},"${matched?.name || "Siswa Terhapus"}",${matched?.nisn || ""},${matched?.gender || ""},${c.behaviorType},"${c.behaviorDescription.replace(/"/g, '""')}","${c.followUp.replace(/"/g, '""')}"\n`;
      });
    }

    const blob = new Blob([csvStr], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${docTitle.toLowerCase().replace(/[^a-z0-9]/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  // 1. Digital Attendance Controller
  const getAttendanceRecordForDate = (dateStr: string): DailyAttendance => {
    const existing = attendanceList.find(a => a.date === dateStr);
    if (existing) return existing;

    // Return empty initial record if not exists
    const initialRecords: { [studentId: string]: any } = {};
    students.forEach(s => {
      initialRecords[s.id] = "Belum Diisi";
    });
    return { date: dateStr, records: initialRecords };
  };

  const handleUpdateStudentAttendance = (studentId: string, status: "Hadir" | "Sakit" | "Izin" | "Alpa" | "Belum Diisi") => {
    setAttendanceList(prev => {
      const idx = prev.findIndex(a => a.date === currentDateString);
      if (idx !== -1) {
        // Update existing date record
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          records: {
            ...updated[idx].records,
            [studentId]: status
          }
        };
        return updated;
      } else {
        // Create new date record
        const baseRecords: { [studentId: string]: any } = {};
        students.forEach(s => {
          baseRecords[s.id] = s.id === studentId ? status : "Belum Diisi";
        });
        return [...prev, { date: currentDateString, records: baseRecords }];
      }
    });
  };

  const attendanceRecord = getAttendanceRecordForDate(currentDateString);

  // Calculates attendance statistics
  const loggedRecords = Object.values(attendanceRecord.records);
  const totalStudents = students.length;
  const countHadir = loggedRecords.filter(r => r === "Hadir").length;
  const countSakit = loggedRecords.filter(r => r === "Sakit").length;
  const countIzin = loggedRecords.filter(r => r === "Izin").length;
  const countAlpa = loggedRecords.filter(r => r === "Alpa").length;
  const percentageHadir = totalStudents > 0 ? Math.round((countHadir / totalStudents) * 100) : 0;

  // 2. SSOT Calendar-to-Journal calculation: Determine today's scheduled TP
  // Based on current date week index, automatically select scheduled TP (Single Source of Truth)
  const getTodayScheduledTp = (): AlurTujuanPembelajaran | undefined => {
    // We mock specific weeks mapping
    const day = new Date(currentDateString).getDate();
    // Use modulo or a simple calculation to tie the date dynamically to a calendar week
    const weekIndex = (day % weeks.length) + 1;
    const currentWeekMeta = weeks.find(w => w.weekNum === weekIndex);
    
    if (currentWeekMeta && currentWeekMeta.isEffective) {
      // Find matching ATP string
      const match = currentWeekMeta.activityName.match(/TP\s*(\d+\.\d+)/);
      if (match) {
        const tpCode = "TP " + match[1];
        return atpList.find(atp => atp.code === tpCode);
      }
    }
    return atpList[0]; // fallback
  };

  const todayTp = getTodayScheduledTp();

  // Create teaching journal entry
  const handleAddJournal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!todayTp) return;

    const newJournal: TeachingJournal = {
      id: "JRN" + Date.now(),
      date: currentDateString,
      tpCode: todayTp.code,
      topic: manualTopic || `Pengenalan Materi ${todayTp.code}`,
      jpRealized: manualJpRealized,
      status: manualStatus,
      notes: manualNotes || "Siswa kondusif mengikuti pembelajaran aktif."
    };

    setJournals(prev => [newJournal, ...prev]);
    setManualTopic("");
    setManualNotes("");
  };

  // Add behavioral cases log
  const handleAddCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCaseStudentId || !newCaseDesc.trim()) return;

    const newCase: CaseLog = {
      id: "CASE" + Date.now(),
      date: currentDateString,
      studentId: newCaseStudentId,
      behaviorType: newCaseType,
      behaviorDescription: newCaseDesc,
      followUp: newCaseFollowUp || "Diapresiasi/Dibina secara edukatif"
    };

    setCaseLogs(prev => [newCase, ...prev]);
    setNewCaseDesc("");
    setNewCaseFollowUp("");
  };

  // Quick Action: Add new student
  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;

    const nisnNew = newStudentNisn.trim() || String(Math.floor(1000000000 + Math.random() * 9000000000));
    const newlyCreated: Student = {
      id: "STU" + Date.now(),
      nisn: nisnNew,
      name: newStudentName,
      gender: newStudentGender
    };

    setStudents(prev => [...prev, newlyCreated]);
    setNewStudentName("");
    setNewStudentNisn("");
    setShowAddStudentField(false);
  };

  // Quick Action: Delete existing student
  const handleDeleteStudent = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    if (confirm(`Apakah Anda yakin ingin menghapus murid "${student.name}" (NISN: ${student.nisn})? Catatan perkembangan karakter siswa ini juga akan terhapus dari sistem.`)) {
      setStudents(prev => prev.filter(s => s.id !== studentId));
      setCaseLogs(prev => prev.filter(c => c.studentId !== studentId));
      if (newCaseStudentId === studentId) {
        const remaining = students.filter(s => s.id !== studentId);
        setNewCaseStudentId(remaining[0]?.id || "");
      }
    }
  };

  // Local helper to parse CSV lines safely taking care of optional quotes
  const parseCsvLine = (line: string): string[] => {
    const result: string[] = [];
    let currentStr = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(currentStr.trim().replace(/^"|"$/g, ''));
        currentStr = "";
      } else {
        currentStr += char;
      }
    }
    result.push(currentStr.trim().replace(/^"|"$/g, ''));
    return result;
  };

  // Heuristics mapping finder pre-detecting Indonesian and English synonyms
  const autoDetectMappings = (headers: string[]) => {
    let detectedName = "";
    let detectedNisn = "";
    let detectedGender = "";

    headers.forEach(h => {
      const hLower = h.toLowerCase().trim();
      if (hLower.includes("nama") || hLower.includes("name") || hLower.includes("siswa") || hLower.includes("student") || hLower.includes("peserta")) {
        if (!detectedName) detectedName = h;
      } else if (hLower.includes("nisn") || hLower.includes("nis") || hLower.includes("id") || hLower.includes("no") || hLower.includes("nomor")) {
        if (!detectedNisn) detectedNisn = h;
      } else if (hLower.includes("jenis") || hLower.includes("gender") || hLower.includes("kelamin") || hLower.includes("jk") || hLower.includes("sex") || hLower.includes("l/p")) {
        if (!detectedGender) detectedGender = h;
      }
    });

    setNameColumnMapping(detectedName || headers[0] || "");
    setNisnColumnMapping(detectedNisn || "");
    setGenderColumnMapping(detectedGender || "");
  };

  const handleCsvFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    setCsvError("");
    setCsvSuccess("");

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split(/\r?\n/).map(line => line.trim()).filter(line => line !== "");
      
      if (lines.length < 2) {
        setCsvError("Dokumen CSV harus memiliki minimal 1 baris header dan 1 baris data.");
        return;
      }

      const headers = parseCsvLine(lines[0]);
      setCsvHeaders(headers);

      const rows = lines.slice(1).map(line => parseCsvLine(line));
      setCsvRows(rows);

      autoDetectMappings(headers);
    };
    reader.readAsText(file);
  };

  const generateImportedStudents = (): Student[] => {
    if (!nameColumnMapping) return [];

    const nameIdx = csvHeaders.indexOf(nameColumnMapping);
    const nisnIdx = nisnColumnMapping ? csvHeaders.indexOf(nisnColumnMapping) : -1;
    const genderIdx = genderColumnMapping ? csvHeaders.indexOf(genderColumnMapping) : -1;

    return csvRows.map((row, idx) => {
      const nameVal = (row[nameIdx] || `Siswa Baru ${idx + 1}`).trim();
      let nisnVal = nisnIdx !== -1 && row[nisnIdx] ? row[nisnIdx].trim() : "";
      
      if (!nisnVal) {
        nisnVal = String(Math.floor(1000000000 + Math.random() * 9000000000));
      }

      let genderVal: "L" | "P" = "L";
      if (genderIdx !== -1 && row[genderIdx]) {
        const rawGender = row[genderIdx].toLowerCase().trim();
        if (rawGender === "p" || rawGender.startsWith("peren") || rawGender.startsWith("f") || rawGender.startsWith("wanita") || rawGender === "w") {
          genderVal = "P";
        }
      }

      return {
        id: "STU_CSV_" + Date.now() + "_" + Math.floor(Math.random() * 1000) + "_" + idx,
        nisn: nisnVal,
        name: nameVal,
        gender: genderVal
      };
    }).filter(s => s.name !== "");
  };

  const handleConfirmCsvImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile || !nameColumnMapping) {
      setCsvError("Silakan pilih file CSV dan pastikan kolom nama terpetakan dengan benar.");
      return;
    }

    const imported = generateImportedStudents();
    if (imported.length === 0) {
      setCsvError("Gagal mengimpor: Tidak ada data nama siswa yang valid setelah pemetaan.");
      return;
    }

    if (importMethod === "overwrite") {
      if (confirm(`Peringatan: Anda memilih opsi 'Ganti Semua'. Ini akan menghapus ${students.length} siswa aktif pada profil ini dan menggantinya dengan ${imported.length} siswa baru dari CSV. Apakah Anda yakin?`)) {
        setStudents(imported);
        setCsvSuccess(`Berhasil mengganti database dengan ${imported.length} siswa dari CSV!`);
        resetCsvStates();
      }
    } else {
      setStudents(prev => [...prev, ...imported]);
      setCsvSuccess(`Berhasil mengimpor & menggabungkan ${imported.length} siswa baru dari CSV!`);
      resetCsvStates();
    }
  };

  const resetCsvStates = () => {
    setCsvFile(null);
    setCsvHeaders([]);
    setCsvRows([]);
    setNameColumnMapping("");
    setNisnColumnMapping("");
    setGenderColumnMapping("");
    setImportMethod("append");
    setTimeout(() => {
      setShowCsvImportField(false);
      setCsvSuccess("");
    }, 4000);
  };

  return (
    <div className="space-y-6">
      {/* Date Controllers & Sub-Navigation */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-2 gap-4">
        <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("attendance")}
            className={`flex items-center px-4 py-1.5 rounded-md text-xs font-semibold transition ${
              activeTab === "attendance" ? "bg-white text-slate-800 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
            id="subtab-execution-attendance"
          >
            <Users className="w-3.5 h-3.5 mr-1.5" />
            Presensi Kelas
          </button>
          <button
            onClick={() => setActiveTab("journal")}
            className={`flex items-center px-4 py-1.5 rounded-md text-xs font-semibold transition ${
              activeTab === "journal" ? "bg-white text-slate-800 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
            id="subtab-execution-journal"
          >
            <BookOpen className="w-3.5 h-3.5 mr-1.5" />
            Jurnal & Agenda Mengajar
          </button>
          <button
            onClick={() => setActiveTab("case")}
            className={`flex items-center px-4 py-1.5 rounded-md text-xs font-semibold transition ${
              activeTab === "case" ? "bg-white text-slate-800 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
            id="subtab-execution-case"
          >
            <Users className="w-3.5 h-3.5 mr-1.5" />
            Buku Catatan Kasus Siswa
          </button>
          <button
            onClick={() => setActiveTab("report")}
            className={`flex items-center px-4 py-1.5 rounded-md text-xs font-semibold transition ${
              activeTab === "report" ? "bg-white text-slate-800 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
            id="subtab-execution-report"
          >
            <ClipboardList className="w-3.5 h-3.5 mr-1.5 text-blue-500 font-bold" />
            Rekap & Laporan
          </button>
        </div>

        {/* Global date picker for harian */}
        {activeTab !== "report" && (
          <div className="flex items-center space-x-2 bg-white px-3 py-1 border border-slate-200 rounded-lg">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-500 font-medium">Tanggal Harian:</span>
            <input
              type="date"
              value={currentDateString}
              onChange={e => setCurrentDateString(e.target.value)}
              className="text-xs border-0 p-0 font-bold text-slate-800 focus:ring-0 w-28 cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* Contents based on Tab selected */}

      {/* Block 1: Digital Attendance */}
      {activeTab === "attendance" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Stats Bar */}
          <div className="lg:col-span-12 grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-center">
              <span className="block text-[10px] font-bold text-emerald-800 uppercase tracking-widest">Kehadiran Kelas</span>
              <span className="block text-2xl font-black text-emerald-600 font-mono mt-1">{percentageHadir}%</span>
            </div>
            <div className="bg-teal-50 border border-teal-100 p-4 rounded-xl text-center">
              <span className="block text-[10px] font-bold text-teal-800 uppercase tracking-widest">Siswa Hadir</span>
              <span className="block text-2xl font-black text-teal-600 font-mono mt-1">{countHadir} <span className="text-xs text-slate-400">Anak</span></span>
            </div>
            <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl text-center">
              <span className="block text-[10px] font-bold text-amber-800 uppercase tracking-widest">Siswa Sakit</span>
              <span className="block text-2xl font-black text-amber-600 font-mono mt-1">{countSakit} <span className="text-xs text-slate-400">Anak</span></span>
            </div>
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-center">
              <span className="block text-[10px] font-bold text-blue-800 uppercase tracking-widest">Siswa Izin</span>
              <span className="block text-2xl font-black text-blue-600 font-mono mt-1">{countIzin} <span className="text-xs text-slate-400">Anak</span></span>
            </div>
            <div className="bg-red-50 border border-red-100 p-4 rounded-xl text-center col-span-2 md:col-span-1">
              <span className="block text-[10px] font-bold text-red-800 uppercase tracking-widest">Alpa (Absen)</span>
              <span className="block text-2xl font-black text-red-600 font-mono mt-1">{countAlpa} <span className="text-xs text-slate-400">Anak</span></span>
            </div>
          </div>

          {/* Student attendance list table */}
          <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between border-b pb-3 border-slate-100 gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-display">Lembar Presensi Peserta Didik</h3>
                <p className="text-xs text-slate-500">Ketuk status untuk absensi siswa secara real-time pada tanggal terpilih.</p>
              </div>

              {/* Dual addition mode buttons: Manual and CSV Upload */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowAddStudentField(prev => !prev);
                    if (showCsvImportField) setShowCsvImportField(false);
                  }}
                  className={`flex items-center text-xs font-semibold px-3 py-1.5 rounded-lg border transition cursor-pointer select-none ${
                    showAddStudentField ? "bg-slate-100 text-slate-800 border-slate-300" : "text-slate-705 hover:bg-slate-50 hover:text-slate-900 border-slate-200"
                  }`}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  {showAddStudentField ? "Tutup Form" : "Tambah Manual"}
                </button>

                <button
                  onClick={() => {
                    setShowCsvImportField(prev => !prev);
                    if (showAddStudentField) setShowAddStudentField(false);
                  }}
                  className={`flex items-center text-xs font-semibold px-3 py-1.5 rounded-lg border transition cursor-pointer select-none ${
                    showCsvImportField ? "bg-blue-50 text-blue-700 border-blue-200" : "text-slate-705 hover:bg-slate-50 hover:text-slate-900 border-slate-200"
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 mr-1 text-slate-500" />
                  {showCsvImportField ? "Tutup Panel CSV" : "Unggah CSV"}
                </button>
              </div>
            </div>

            {/* CSV Import Layout */}
            {showCsvImportField && (
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-4 text-xs animate-fade-in text-left">
                <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 select-none">
                  <div className="p-1.5 bg-blue-100 rounded-lg text-blue-700 shrink-0">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-850 text-xs tracking-wide">Impor Daftar Siswa via CSV</h4>
                    <p className="text-[10px] text-slate-500 font-medium">Unggah berkas spreadsheet (.csv) kelas Anda dengan pemetaan dinamis</p>
                  </div>
                </div>

                {csvError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-center space-x-2 leading-relaxed">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span><strong>Error:</strong> {csvError}</span>
                  </div>
                )}
                {csvSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-250 text-emerald-800 rounded-xl flex items-center space-x-2 leading-relaxed">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[3px]" />
                    <span>{csvSuccess}</span>
                  </div>
                )}

                {!csvFile ? (
                  <div className="space-y-3">
                    <div className="border-2 border-dashed border-slate-350 rounded-xl p-6 bg-white hover:border-blue-400 transition cursor-pointer relative text-center select-none">
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleCsvFileSelection}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-[0px]"
                        title="Klik untuk memilih berkas CSV"
                      />
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center border border-slate-200">
                          <Plus className="w-5 h-5 text-slate-400" />
                        </div>
                        <span className="block font-bold text-slate-700 text-xs">Pilih Berkas CSV Anda</span>
                        <span className="block text-[10px] text-slate-400">Pastikan format penulisan file menggunakan ekstensi .csv</span>
                      </div>
                    </div>

                    <div className="bg-slate-100/70 p-3 rounded-lg text-[11px] text-slate-650 leading-relaxed font-sans space-y-1">
                      <span className="font-black text-slate-800 uppercase tracking-wide text-[9px] block">💡 Contoh Format Berkas CSV Ideal:</span>
                      <p>Sistem mendukung pemetaan fleksibel dari kolom CSV apa pun. Pastikan baris pertama berisi nama kolom. Contoh:</p>
                      <pre className="mt-1 font-mono text-[9px] bg-white p-2 rounded border leading-tight select-text overflow-x-auto text-slate-500">
{`no_induk,nama_lengkap,jenis_kelamin
0123456781,Ahmad Fauzi,L
0123456782,Bunga Citra Lestari,P`}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleConfirmCsvImport} className="space-y-4">
                    <div className="bg-white p-4 border border-slate-200 rounded-xl space-y-3 shadow-2xs">
                      <div className="flex items-center justify-between text-[11px] select-none">
                        <span className="font-semibold text-slate-600">Berkas aktif: <strong className="text-slate-900">{csvFile.name}</strong> ({csvRows.length} baris data)</span>
                        <button
                          type="button"
                          onClick={() => {
                            setCsvFile(null);
                            setCsvHeaders([]);
                            setCsvRows([]);
                          }}
                          className="text-red-600 hover:underline font-bold cursor-pointer"
                        >
                          Ganti File
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                        <div className="space-y-1">
                          <label className="block text-[10px] font-extrabold text-slate-500 uppercase">1. Pasangkan "Nama Lengkap" *</label>
                          <select
                            value={nameColumnMapping}
                            onChange={e => setNameColumnMapping(e.target.value)}
                            className="w-full text-xs p-2 border border-slate-200 bg-slate-50 rounded-lg focus:ring-1 focus:ring-blue-500 focus:bg-white outline-none font-bold"
                            required
                          >
                            <option value="">-- Pilih Kolom --</option>
                            {csvHeaders.map(h => (
                              <option key={h} value={h}>{h}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[10px] font-extrabold text-slate-500 uppercase">2. Pasangkan "NISN" (Opsional)</label>
                          <select
                            value={nisnColumnMapping}
                            onChange={e => setNisnColumnMapping(e.target.value)}
                            className="w-full text-xs p-2 border border-slate-200 bg-slate-50 rounded-lg focus:ring-1 focus:ring-blue-500 focus:bg-white outline-none"
                          >
                            <option value="">-- Kosong / Buat Otomatis --</option>
                            {csvHeaders.map(h => (
                              <option key={h} value={h}>{h}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[10px] font-extrabold text-slate-500 uppercase">3. Pasangkan "Gender" (Opsional)</label>
                          <select
                            value={genderColumnMapping}
                            onChange={e => setGenderColumnMapping(e.target.value)}
                            className="w-full text-xs p-2 border border-slate-200 bg-slate-50 rounded-lg focus:ring-1 focus:ring-blue-500 focus:bg-white outline-none"
                          >
                            <option value="">-- Kosong (Set L) --</option>
                            {csvHeaders.map(h => (
                              <option key={h} value={h}>{h}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {nameColumnMapping && (
                      <div className="space-y-1.5">
                        <span className="font-extrabold text-slate-500 text-[9px] uppercase tracking-wider block">👁️ Pratinjau Pemetaan Impor (5 Siswa Pertama)</span>
                        <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
                          <table className="min-w-full text-[11px] text-left text-slate-600 font-sans leading-relaxed">
                            <thead className="bg-slate-50 text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                              <tr className="divide-x divide-slate-100 border-b border-slate-100">
                                <th scope="col" className="px-3 py-1 text-center w-10">No</th>
                                <th scope="col" className="px-3 py-1 w-24 font-mono">NISN</th>
                                <th scope="col" className="px-3 py-1">Nama Lengkap</th>
                                <th scope="col" className="px-3 py-1 text-center w-20">Gender</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                              {generateImportedStudents().slice(0, 5).map((s, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50">
                                  <td className="px-3 py-1.5 text-center text-slate-400 font-mono">{idx + 1}</td>
                                  <td className="px-3 py-1.5 font-mono text-slate-400">{s.nisn}</td>
                                  <td className="px-3 py-1.5 text-slate-900 font-bold">{s.name}</td>
                                  <td className="px-3 py-1.5 text-center font-bold text-slate-700">
                                    {s.gender === "L" ? "Laki-laki (L)" : "Perempuan (P)"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-250 select-none">
                      <div className="flex items-center space-x-3 bg-white p-2 border rounded-lg">
                        <span className="font-bold text-slate-500 block text-[10px] uppercase">Metode Impor:</span>
                        <label className="inline-flex items-center space-x-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="import_method"
                            value="append"
                            checked={importMethod === "append"}
                            onChange={() => setImportMethod("append")}
                            className="text-blue-600 focus:ring-0"
                          />
                          <span className="font-semibold text-slate-800 text-xs">Gabung (Append)</span>
                        </label>
                        <label className="inline-flex items-center space-x-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="import_method"
                            value="overwrite"
                            checked={importMethod === "overwrite"}
                            onChange={() => setImportMethod("overwrite")}
                            className="text-blue-600 focus:ring-0"
                          />
                          <span className="font-bold text-red-650 text-xs">Ganti Semua (Overwrite)</span>
                        </label>
                      </div>

                      <div className="flex space-x-2 ml-auto">
                        <button
                          type="button"
                          onClick={() => {
                            setCsvFile(null);
                            setCsvHeaders([]);
                            setCsvRows([]);
                          }}
                          className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 hover:text-slate-900 font-semibold text-slate-650 transition cursor-pointer"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          disabled={!nameColumnMapping}
                          className="px-4 py-1.5 rounded-lg bg-blue-600 font-bold text-white hover:bg-blue-700 transition disabled:opacity-40 shadow-xs cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Check className="w-4 h-4 font-black shrink-0 stroke-[3px]" />
                          <span>Mulai Impor ({csvRows.length} Siswa)</span>
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            )}

            {showAddStudentField && (
              <form onSubmit={handleAddStudent} className="bg-slate-50 border p-3 rounded-xl grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1">Nama Lengkap Murid</label>
                  <input
                    type="text"
                    value={newStudentName}
                    onChange={e => setNewStudentName(e.target.value)}
                    className="w-full text-xs p-2 border rounded-lg bg-white"
                    placeholder="Nama lengkap"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1">NISN (Opsional)</label>
                  <input
                    type="text"
                    value={newStudentNisn}
                    onChange={e => setNewStudentNisn(e.target.value)}
                    className="w-full text-xs p-2 border rounded-lg bg-white font-mono"
                    placeholder="0123..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1">Jenis Kelamin</label>
                  <select
                    value={newStudentGender}
                    onChange={e => setNewStudentGender(e.target.value as any)}
                    className="w-full text-xs p-2 border rounded-lg bg-white"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
                <div>
                  <button type="submit" className="w-full text-xs font-bold py-2 px-3 bg-slate-850 bg-slate-900 text-white rounded-lg hover:bg-black transition">
                    Masukkan Siswa
                  </button>
                </div>
              </form>
            )}

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="min-w-full text-xs text-left text-slate-600">
                <thead className="bg-slate-50 text-[10px] uppercase text-slate-700 font-bold tracking-wider">
                  <tr>
                    <th scope="col" className="px-4 py-3 w-16 text-center">No</th>
                    <th scope="col" className="px-4 py-3 w-28">NISN</th>
                    <th scope="col" className="px-4 py-3">Nama Lengkap</th>
                    <th scope="col" className="px-4 py-3 w-16 text-center">L/P</th>
                    <th scope="col" className="px-4 py-3 w-64 text-center">Tandai Status Presensi</th>
                    <th scope="col" className="px-4 py-3 w-16 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white shadow-xs">
                  {students.map((stu, index) => {
                    const status = attendanceRecord.records[stu.id] || "Belum Diisi";

                    return (
                      <tr key={stu.id} className="hover:bg-slate-50/50 transition">
                        <td className="px-4 py-3 text-center font-bold text-slate-500 font-mono">{index + 1}</td>
                        <td className="px-4 py-3 font-mono text-slate-500">{stu.nisn}</td>
                        <td className="px-4 py-3 font-semibold text-slate-900">{stu.name}</td>
                        <td className="px-4 py-3 text-center font-bold">{stu.gender}</td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center space-x-1.5 p-0.5 bg-slate-100 rounded-lg max-w-[210px] mx-auto">
                            <button
                              onClick={() => handleUpdateStudentAttendance(stu.id, "Hadir")}
                              className={`text-[10px] font-bold px-2 py-1 rounded-md transition ${
                                status === "Hadir" ? "bg-emerald-500 text-white shadow-xs" : "text-slate-600 hover:bg-slate-200"
                              }`}
                            >
                              H
                            </button>
                            <button
                              onClick={() => handleUpdateStudentAttendance(stu.id, "Sakit")}
                              className={`text-[10px] font-bold px-2 py-1 rounded-md transition ${
                                status === "Sakit" ? "bg-amber-500 text-white shadow-xs" : "text-slate-600 hover:bg-slate-200"
                              }`}
                            >
                              S
                            </button>
                            <button
                              onClick={() => handleUpdateStudentAttendance(stu.id, "Izin")}
                              className={`text-[10px] font-bold px-2 py-1 rounded-md transition ${
                                status === "Izin" ? "bg-blue-500 text-white shadow-xs" : "text-slate-600 hover:bg-slate-200"
                              }`}
                            >
                              I
                            </button>
                            <button
                              onClick={() => handleUpdateStudentAttendance(stu.id, "Alpa")}
                              className={`text-[10px] font-bold px-2 py-1 rounded-md transition ${
                                status === "Alpa" ? "bg-red-500 text-white shadow-xs" : "text-slate-600 hover:bg-slate-200"
                              }`}
                            >
                              A
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleDeleteStudent(stu.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg hover:text-rose-800 transition cursor-pointer inline-flex items-center justify-center"
                            title="Hapus Murid"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {students.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-slate-400 italic">Belum ada data siswa terdaftar.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Guidelines Sidebar */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Ketentuan Kode Absensi Rapor</h4>
            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-start">
                <span className="w-5 h-5 bg-emerald-500 text-white text-[10px] font-bold rounded-md flex items-center justify-center mr-3 mt-0.5">H</span>
                <div>
                  <span className="font-bold text-slate-800">Hadir:</span> Siswa tercatat aktif menyimak instruksi klasikal penuh.
                </div>
              </div>
              <div className="flex items-start">
                <span className="w-5 h-5 bg-amber-500 text-white text-[10px] font-bold rounded-md flex items-center justify-center mr-3 mt-0.5">S</span>
                <div>
                  <span className="font-bold text-slate-800">Sakit:</span> Didukung surat dokter / konfirmasi orang tua secara resmi.
                </div>
              </div>
              <div className="flex items-start">
                <span className="w-5 h-5 bg-blue-500 text-white text-[10px] font-bold rounded-md flex items-center justify-center mr-3 mt-0.5">I</span>
                <div>
                  <span className="font-bold text-slate-800">Izin:</span> Keperluan mendesak keluarga yang dapat dimaklumi.
                </div>
              </div>
              <div className="flex items-start">
                <span className="w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-md flex items-center justify-center mr-3 mt-0.5">A</span>
                <div>
                  <span className="font-bold text-slate-800">Alpa (Tanpa Keterangan):</span> Ketidakhadiran bolos tanpa pemberitahuan valid.
                </div>
              </div>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-[11px] text-emerald-800 mt-2">
              <strong>Persentase Kehadiran:</strong> Akumulasi data absensi harian ini akan secara otomatis dihitung dan dipetakan ke dalam template tabel ekspor berkas <strong>e-Rapor Kementerian</strong> di akhir semester.
            </div>
          </div>
        </div>
      )}

      {/* Block 2: Agenda & Teaching Journal */}
      {activeTab === "journal" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Quick Add Journal Agenda Form */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-display">Tulis Agenda Harian Baru</h3>
              <p className="text-xs text-slate-500">Materi esensial pembelajaran ditarik otomatis dari target Promes hari ini.</p>
            </div>

            {todayTp ? (
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-xs text-emerald-800 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-bold">Target Promes Terjadwal (SSOT):</span>
                  <p className="mt-1 font-semibold">{todayTp.code} - {todayTp.tpText}</p>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg text-xs text-amber-800">
                Pekan saat ini diklasifikasikan sebagai <strong>Minggu Non-Efektif</strong> di Kalender Akademik. Silakan tulis aktivitas non-akademik di bawah ini.
              </div>
            )}

            <form onSubmit={handleAddJournal} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Sub-Bab/Sub-Topik Pembelajaran</label>
                <input
                  type="text"
                  value={manualTopic}
                  onChange={e => setManualTopic(e.target.value)}
                  className="w-full p-2 border rounded-lg bg-white placeholder:text-slate-400"
                  placeholder="Misal: Mekanika Visual Lensa & Retina"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Terlaksana (JP)</label>
                  <input
                    type="number"
                    value={manualJpRealized}
                    onChange={e => setManualJpRealized(parseInt(e.target.value) || 4)}
                    className="w-full p-2 border rounded-lg bg-white font-mono"
                    min="1" max="10"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Status Ketercapaian</label>
                  <select
                    value={manualStatus}
                    onChange={e => setManualStatus(e.target.value as any)}
                    className="w-full p-2.5 border rounded-lg bg-white"
                  >
                    <option value="Selesai">Selesai</option>
                    <option value="Tersisa 1 sub-bab">Tersisa 1 sub-bab</option>
                    <option value="Belum Dimulai">Belum Dimulai</option>
                    <option value="Perlu Pengulangan">Perlu Pengulangan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Refleksi / Catatan Khusus Guru</label>
                <textarea
                  value={manualNotes}
                  onChange={e => setManualNotes(e.target.value)}
                  className="w-full p-2 border rounded-lg bg-white placeholder:text-slate-400"
                  rows={3}
                  placeholder="Contoh: Siswa antusias mempraktikan indra pendengar..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold py-2.5 rounded-lg transition shadow-sm flex items-center justify-center"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Catat Agenda Harian
              </button>
            </form>
          </div>

          {/* Past Journal Logs Table */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-display">Log Jurnal Mengajar Guru</h3>
              <p className="text-xs text-slate-500">Rekapitulasi ketercapaian materi kelas dari hari ke hari selama semester berjalan.</p>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[480px]">
              {journals.map(j => (
                <div key={j.id} className="border border-slate-200 p-4 rounded-xl hover:shadow-xs transition bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 bg-slate-200 px-2.5 py-0.5 rounded-full font-mono">{j.date}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      j.status === "Selesai" 
                        ? "bg-emerald-100 text-emerald-800" 
                        : j.status === "Tersisa 1 sub-bab"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-red-100 text-red-800"
                    }`}>
                      {j.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 font-mono block">CAPAIAN CAP ( {j.tpCode} )</span>
                    <h4 className="text-xs font-bold text-slate-900 mt-0.5">{j.topic}</h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed italic bg-white p-2.5 rounded-lg border border-slate-100">{j.notes}</p>
                  <div className="text-[10px] text-slate-400 text-right">
                    Durasi: <span className="font-bold text-slate-600">{j.jpRealized} JP</span>
                  </div>
                </div>
              ))}
              {journals.length === 0 && (
                <div className="text-center p-8 text-slate-400 italic text-xs">Belum ada log jurnal mengajar tercatat.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Block 3: Behavior Case Logs */}
      {activeTab === "case" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Quick Input Case Form */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-display">Log Catatan Perkembangan Karakter</h3>
              <p className="text-xs text-slate-500">Catat perilaku positif (apresiasi afektif) atau perbaikan disiplin positif siswa.</p>
            </div>

            <form onSubmit={handleAddCase} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Pilih Peserta Didik</label>
                <select
                  value={newCaseStudentId}
                  onChange={e => setNewCaseStudentId(e.target.value)}
                  className="w-full p-2 border rounded-lg bg-white font-medium"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.nisn})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Kategori Perilaku</label>
                <div className="grid grid-cols-2 gap-3 mt-1">
                  <button
                    type="button"
                    onClick={() => setNewCaseType("Positif")}
                    className={`p-2.5 rounded-lg border text-xs font-bold flex items-center justify-center transition ${
                      newCaseType === "Positif" 
                        ? "bg-emerald-500 text-white border-emerald-400" 
                        : "bg-slate-50 hover:bg-slate-100 text-slate-700"
                    }`}
                  >
                    <Heart className="w-4 h-4 mr-1.5" />
                    Karakter Positif
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewCaseType("Negatif")}
                    className={`p-2.5 rounded-lg border text-xs font-bold flex items-center justify-center transition ${
                      newCaseType === "Negatif" 
                        ? "bg-rose-500 text-white border-rose-400" 
                        : "bg-slate-50 hover:bg-slate-100 text-slate-700"
                    }`}
                  >
                    <ShieldAlert className="w-4 h-4 mr-1.5" />
                    Perlu Pembinaan
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Deskripsi Perilaku / Kejadian</label>
                <textarea
                  value={newCaseDesc}
                  onChange={e => setNewCaseDesc(e.target.value)}
                  className="w-full p-2 border rounded-lg bg-white placeholder:text-slate-400"
                  rows={3}
                  placeholder="Misal: Membantu menerangkan konsep ke teman kelas yang kesulitan..."
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Rencana Tindak Lanjut</label>
                <input
                  type="text"
                  value={newCaseFollowUp}
                  onChange={e => setNewCaseFollowUp(e.target.value)}
                  className="w-full p-2 border rounded-lg bg-white placeholder:text-slate-400"
                  placeholder="Misal: Diberi bintang apresiasi papan nilai afektif"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold py-2.5 rounded-lg transition shadow-sm flex items-center justify-center"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Masukkan Buku Rekap Kasus
              </button>
            </form>
          </div>

          {/* Historical Table Case List */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-display">Buku Rekap Kasus Afektif</h3>
              <p className="text-xs text-slate-500">Daftar kejadian perilaku siswa untuk memenuhi instrumen penilaian afektif Kurikulum Merdeka.</p>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="min-w-full text-xs text-left text-slate-600">
                <thead className="bg-slate-50 text-[10px] uppercase text-slate-700 font-bold tracking-wider">
                  <tr>
                    <th scope="col" className="px-4 py-3 w-28">Tanggal</th>
                    <th scope="col" className="px-4 py-3 w-40">Siswa</th>
                    <th scope="col" className="px-4 py-3 text-center w-20">Karakter</th>
                    <th scope="col" className="px-4 py-3">Kejadian & Tindak Lanjut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {caseLogs.map(c => {
                    const matchedStudent = students.find(s => s.id === c.studentId);
                    return (
                      <tr key={c.id} className="hover:bg-slate-50/50 transition">
                        <td className="px-4 py-3 font-mono text-slate-500">{c.date}</td>
                        <td className="px-4 py-3">
                          <span className="block font-semibold text-slate-950">{matchedStudent?.name || "Siswa Terhapus"}</span>
                          <span className="block text-[10px] text-slate-400 font-mono">{matchedStudent?.nisn}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                            c.behaviorType === "Positif" 
                              ? "bg-emerald-100 text-emerald-800 font-medium" 
                              : "bg-red-100 text-red-800"
                          }`}>
                            {c.behaviorType}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-700 leading-relaxed space-y-1">
                          <p className="font-medium text-slate-800">{c.behaviorDescription}</p>
                          <p className="text-[10px] text-slate-500"><span className="font-semibold text-slate-700">Tindak Lanjut:</span> {c.followUp}</p>
                        </td>
                      </tr>
                    );
                  })}
                  {caseLogs.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-slate-400 italic">Belum ada rekapan tindakan afektif.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Block 4: Reports & Rekapitulasi (Mingguan, Bulanan, Semesteran, Tahunan) */}
      {activeTab === "report" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Inject Dynamic Printing CSS to isolate #print-area perfectly */}
          <style dangerouslySetInnerHTML={{__html: `
            @media print {
              /* Ensure only the print container is visible */
              body * {
                visibility: hidden !important;
              }
              #print-area, #print-area * {
                visibility: visible !important;
              }
              #print-area {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                box-shadow: none !important;
                border: none !important;
                background-color: white !important;
                color: black !important;
              }
              /* Hide page-breaks or excess borders */
              .no-print {
                display: none !important;
              }
            }
          `}} />

          {/* Left Column: Filter and Report Configurations */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-5 no-print text-left">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 font-display flex items-center">
                <Sliders className="w-4 h-4 mr-2 text-indigo-500" />
                Konfigurasi Laporan
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Atur tipe laporan, periode rekapitulasi, dan legalitas tanda tangan dokumen.</p>
            </div>

            {/* Select 1: Report Type / Jenis Dokumen */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">1. Jenis Laporan</label>
              <select
                value={reportType}
                onChange={e => setReportType(e.target.value as any)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-slate-50 text-slate-800 font-semibold focus:ring-slate-500 focus:border-slate-500 cursor-pointer"
              >
                <option value="rekap-absensi">📊 Rekap Presensi / Absensi Kelas</option>
                <option value="rekap-jurnal">📖 Rekap Jurnal & Agenda Mengajar</option>
                <option value="rekap-buku-catatan">📓 Rekap Buku Catatan Kasus Siswa</option>
              </select>
            </div>

            {/* Select 2: Report Period Option */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">2. Periode Rekapitulasi</label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-1 gap-1.5 bg-slate-100 p-1.5 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => setReportPeriod("mingguan")}
                  className={`text-[11px] font-bold py-1.5 px-2 rounded-md transition select-none flex items-center justify-center ${
                    reportPeriod === "mingguan" ? "bg-white text-slate-800 shadow-sm border border-slate-200" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Mingguan
                </button>
                <button
                  type="button"
                  onClick={() => setReportPeriod("bulanan")}
                  className={`text-[11px] font-bold py-1.5 px-2 rounded-md transition select-none flex items-center justify-center ${
                    reportPeriod === "bulanan" ? "bg-white text-slate-800 shadow-sm border border-slate-200" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Bulanan
                </button>
                <button
                  type="button"
                  onClick={() => setReportPeriod("semesteran")}
                  className={`text-[11px] font-bold py-1.5 px-2 rounded-md transition select-none flex items-center justify-center ${
                    reportPeriod === "semesteran" ? "bg-white text-slate-800 shadow-sm border border-slate-200" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Semesteran
                </button>
                <button
                  type="button"
                  onClick={() => setReportPeriod("tahunan")}
                  className={`text-[11px] font-bold py-1.5 px-2 rounded-md transition select-none flex items-center justify-center ${
                    reportPeriod === "tahunan" ? "bg-white text-slate-800 shadow-sm border border-slate-200" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Tahunan
                </button>
                <button
                  type="button"
                  onClick={() => setReportPeriod("kustom")}
                  className={`text-[11px] font-bold py-1.5 px-2 rounded-md transition select-none flex items-center justify-center ${
                    reportPeriod === "kustom" ? "bg-white text-slate-800 shadow-sm border border-slate-200" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Custom Tanggal
                </button>
              </div>
            </div>

            {/* Dynamic selectors matching selection of period */}
            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-3">
              <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Parameter Periode</span>

              {/* Mingguan Options */}
              {reportPeriod === "mingguan" && (
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-600">Pilih Pekan Akademik</label>
                  <select
                    value={selectedWeekNum}
                    onChange={e => setSelectedWeekNum(parseInt(e.target.value, 10))}
                    className="w-full text-xs p-2 border rounded-md bg-white font-medium cursor-pointer focus:ring-indigo-500"
                  >
                    {weeks.map(w => (
                      <option key={w.weekNum} value={w.weekNum}>
                        Pekan {w.weekNum} ({w.dateRange})
                      </option>
                    ))}
                    <option value={99}>Pekan Cadangan (Mei 25-29, 2026)</option>
                  </select>
                  <p className="text-[10px] text-slate-400 italic">Mencakup agenda pengajaran dan presensi harian pada pekan kurikulum terpilih.</p>
                </div>
              )}

              {/* Bulanan Options */}
              {reportPeriod === "bulanan" && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-600">Bulan</label>
                    <select
                      value={selectedMonth}
                      onChange={e => setSelectedMonth(parseInt(e.target.value, 15))}
                      className="w-full text-xs p-2 border rounded-md bg-white cursor-pointer focus:ring-indigo-500 font-medium"
                    >
                      {indonesianMonths.map((m, idx) => (
                        <option key={idx} value={idx + 1}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-600">Tahun</label>
                    <select
                      value={selectedYear}
                      onChange={e => setSelectedYear(parseInt(e.target.value, 10))}
                      className="w-full text-xs p-2 border rounded-md bg-white cursor-pointer focus:ring-indigo-500 font-medium"
                    >
                      <option value={2025}>2025</option>
                      <option value={2026}>2026</option>
                      <option value={2027}>2027</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Semesteran Options */}
              {reportPeriod === "semesteran" && (
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-600">Pilih Semester Aktif</label>
                  <select
                    value={selectedSemester}
                    onChange={e => setSelectedSemester(e.target.value as any)}
                    className="w-full text-xs p-2 border rounded-md bg-white cursor-pointer focus:ring-indigo-500 font-semibold"
                  >
                    <option value="Ganjil">Semester Ganjil (Juli - Desember)</option>
                    <option value="Genap">Semester Genap (Januari - Juni)</option>
                  </select>
                  <p className="text-[10px] text-slate-400 italic">Mengambil data keseluruhan dalam lingkup semester Kurikulum Merdeka berjalan.</p>
                </div>
              )}

              {/* Tahunan Parameters (No selection needed, uses SchoolConfig academicYear) */}
              {reportPeriod === "tahunan" && (
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-600">Tahun Ajaran Aktif</label>
                  <input
                    type="text"
                    value={`TAHUN AJARAN ${config.academicYear}`}
                    disabled
                    className="w-full text-xs p-2 border bg-slate-100 rounded-md text-slate-600 font-bold"
                  />
                  <p className="text-[10px] text-slate-400 italic">Laporan tahunan mendata seluruh berkas dari {config.academicYear.split("/")[0]} s.d. {config.academicYear.split("/")[1]}.</p>
                </div>
              )}

              {/* Kustom Options */}
              {reportPeriod === "kustom" && (
                <div className="space-y-2">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-600">Tanggal Mulai</label>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={e => setCustomStartDate(e.target.value)}
                      className="w-full text-xs p-2 border rounded-md focus:ring-indigo-500 font-medium"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-600">Tanggal Selesai</label>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={e => setCustomEndDate(e.target.value)}
                      className="w-full text-xs p-2 border rounded-md focus:ring-indigo-500 font-medium"
                    />
                  </div>
                </div>
              )}

              {/* Active Resolved range preview badges */}
              <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500 flex flex-col justify-between font-medium">
                <span>Rentang Tanggal Terkalkulasi:</span>
                <span className="font-extrabold text-slate-800 font-mono tracking-wide bg-indigo-50 text-indigo-700 px-2 py-0.5 mt-1 rounded border border-indigo-100 text-center">
                  {formatIndonesianDate(activeStartDate)} s.d. {formatIndonesianDate(activeEndDate)}
                </span>
              </div>
            </div>

            {/* Accordion 3: Custom Signatures Block Settings */}
            <div className="space-y-3 pt-2 border-t border-slate-100 text-xs">
              <span className="block text-xs font-bold text-slate-700 uppercase tracking-wide">3. Bukti Hukum & Tanda Tangan</span>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500">Kota Pengesahan</label>
                  <input
                    type="text"
                    value={reportSignPlace}
                    onChange={e => setReportSignPlace(e.target.value)}
                    className="w-full p-2 border rounded-md bg-white font-medium text-slate-700 focus:ring-indigo-500"
                    placeholder="Contoh: Jakarta"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500">Tanggal Ttd</label>
                  <input
                    type="date"
                    value={reportSignDate}
                    onChange={e => setReportSignDate(e.target.value)}
                    className="w-full p-2 border rounded-md bg-white font-medium text-slate-700 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Teacher Sign details */}
              <div className="space-y-1.5 border-t border-slate-100 pt-2 bg-slate-50/50 p-2 rounded border">
                <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Identifikasi Guru</span>
                <div className="space-y-1">
                  <input
                    type="text"
                    value={customTeacherName}
                    onChange={e => setCustomTeacherName(e.target.value)}
                    className="w-full p-1.5 text-[11px] border rounded bg-white"
                    placeholder="Nama Lengkap Guru"
                  />
                  <input
                    type="text"
                    value={customTeacherNip}
                    onChange={e => setCustomTeacherNip(e.target.value)}
                    className="w-full p-1.5 text-[11px] border rounded bg-white font-mono"
                    placeholder="NIP Guru"
                  />
                </div>
              </div>

              {/* Headmaster Sign details */}
              <div className="space-y-1.5 bg-slate-50/50 p-2 rounded border">
                <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Identifikasi Kepala Sekolah</span>
                <div className="space-y-1">
                  <input
                    type="text"
                    value={customHeadmasterName}
                    onChange={e => setCustomHeadmasterName(e.target.value)}
                    className="w-full p-1.5 text-[11px] border rounded bg-white"
                    placeholder="Nama Kepala Sekolah"
                  />
                  <input
                    type="text"
                    value={customHeadmasterNip}
                    onChange={e => setCustomHeadmasterNip(e.target.value)}
                    className="w-full p-1.5 text-[11px] border rounded bg-white font-mono"
                    placeholder="NIP Kepala Sekolah"
                  />
                </div>
              </div>
            </div>

            {/* Call to action panel */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => window.print()}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold py-2.5 rounded-lg transition shadow-sm flex items-center justify-center cursor-pointer"
              >
                <Printer className="w-4 h-4 mr-2" />
                Cetak Laporan / PDF
              </button>

              <button
                onClick={handleDownloadHtmlReport}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 rounded-lg transition shadow-sm flex items-center justify-center cursor-pointer"
              >
                <Download className="w-4 h-4 mr-2" />
                Unduh Lengkap Surat (HTML)
              </button>

              <button
                onClick={handleDownloadCsvReport}
                className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold py-2.5 rounded-lg transition shadow-sm flex items-center justify-center border border-emerald-200 cursor-pointer"
              >
                <FileDown className="w-4 h-4 mr-2 text-emerald-600" />
                Unduh Data Ringkas (CSV)
              </button>
            </div>
          </div>

          {/* Right Column: High Fidelity A4 Paper Layout Live Preview */}
          <div className="lg:col-span-8 bg-slate-100 p-2 md:p-6 rounded-2xl border border-slate-200/80 shadow-inner flex justify-center text-left">
            <div 
              id="print-area" 
              className="bg-white text-black max-w-[810px] w-full p-4 md:p-10 shadow-2xl border border-slate-300 rounded-xl font-sans text-xs select-none relative"
            >
              
              {/* Paper header watermarks/indicators */}
              <div className="absolute top-3 right-3 text-[9px] text-slate-300 font-mono uppercase tracking-wider no-print select-none">
                Live Preview (A4 Paper Draft)
              </div>

              {/* 1. Kop Surat Kop Header */}
              <div className="border-b-4 border-double border-slate-900 pb-3" id="cop-surat-header">
                <div className="flex items-center justify-between">
                  {/* Left Crest */}
                  <div className="flex-shrink-0 flex items-center justify-center w-14 h-14 border-2 border-slate-800 rounded-full bg-slate-50 text-slate-800">
                    <span className="text-2xl">🎓</span>
                  </div>

                  {/* Center Text */}
                  <div className="text-center flex-grow mx-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-700 leading-none">
                      KEMENTERIAN PENDIDIKAN, KEBUDAYAAN, RISET, DAN TEKNOLOGI
                    </h4>
                    <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-slate-900 leading-snug mt-1">
                      DINAS PENDIDIKAN PROVINSI DKI JAKARTA
                    </h3>
                    <h2 className="text-sm font-black uppercase text-slate-950 tracking-wide mt-1">
                      {config.schoolName}
                    </h2>
                    <p className="text-[9px] text-slate-600 italic mt-0.5">
                      {config.schoolAddress || "Jl. Pendidikan Raya No. 45, Kecamatan Gambir, Jakarta Pusat, DKI Jakarta • Telepon: (021) 555-0123"}
                    </p>
                  </div>

                  {/* Right Crest Placeholder or Custom Logo */}
                  <div className="flex-shrink-0 w-14 h-14 border border-slate-200 rounded-lg flex items-center justify-center overflow-hidden">
                    {config.schoolLogo ? (
                      <img src={config.schoolLogo} alt="Logo" className="w-14 h-14 object-contain" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-[7px] text-slate-405 font-mono font-bold leading-tight">
                        <span>LOGO</span>
                        <span>SEKOLAH</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. Document Heading & Metas */}
              <div className="text-center mt-5 mb-4">
                <h1 className="text-xs font-black uppercase tracking-wide underline decoration-2 font-mono">
                  {getLaporanTitle().split(" - ")[0]}
                </h1>
                <p className="text-[10px] text-slate-600 mt-1 font-bold">
                  {getLaporanTitle().split(" - ")[1] || ""}
                </p>
              </div>

              {/* 3. Primary Subject Metas */}
              <table className="w-full border border-slate-300 bg-slate-50/50 text-[10px] text-slate-800 mb-5 rounded">
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="p-2 w-1/2 border-r border-slate-200">
                      <span className="font-bold text-slate-500">Mata Pelajaran:</span>
                      <strong className="block text-slate-900 text-xs">{config.subject}</strong>
                    </td>
                    <td className="p-2 w-1/2">
                      <span className="font-bold text-slate-500">Kelas / Fase / Semester:</span>
                      <strong className="block text-slate-900 text-xs">
                        {config.grade} / Fase {config.phase} / Semester {config.semester}
                      </strong>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 w-1/2 border-r border-slate-200">
                      <span className="font-bold text-slate-500">Tahun Ajaran Kurikulum:</span>
                      <strong className="block text-slate-900 text-xs">{config.academicYear}</strong>
                    </td>
                    <td className="p-2 w-1/2">
                      <span className="font-bold text-slate-500">Sensus & Target Sekolah:</span>
                      <strong className="block text-slate-900 text-xs">KKTP: {config.kktp} % • JP Mingguan: {config.weeklyJp}</strong>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* 4. Filtered Content Table */}

              {/* Rekap Absensi */}
              {reportType === "rekap-absensi" && (
                <div className="space-y-2">
                  <div className="overflow-x-auto border border-black rounded">
                    <table className="min-w-full text-[10px] text-left text-black divide-y divide-black">
                      <thead className="bg-slate-100 font-bold">
                        <tr className="divide-x divide-black text-center">
                          <th className="px-1.5 py-1.5 w-8">No</th>
                          <th className="px-2 py-1.5 w-24 text-left">NISN</th>
                          <th className="px-2 py-1.5 text-left">Nama Murid</th>
                          <th className="px-2 py-1.5 w-10">L/P</th>
                          <th className="px-2 py-1.5 w-12 text-emerald-700">Hadir</th>
                          <th className="px-2 py-1.5 w-12 text-amber-700">Sakit</th>
                          <th className="px-2 py-1.5 w-12 text-blue-700 font-bold">Izin</th>
                          <th className="px-2 py-1.5 w-12 text-red-700 font-bold">Alpa</th>
                          <th className="px-2 py-1.5 w-14 font-mono">% Hadir</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black font-medium leading-relaxed">
                        {students.map((stu, sIdx) => {
                          const met = getStudentAttendanceMetrics(stu.id);
                          return (
                            <tr key={stu.id} className="divide-x divide-black hover:bg-slate-50/20">
                              <td className="px-2 py-1 text-center font-bold">{sIdx + 1}</td>
                              <td className="px-2 py-1 font-mono text-slate-600 font-semibold">{stu.nisn}</td>
                              <td className="px-2 py-1 font-bold text-slate-900">{stu.name}</td>
                              <td className="px-2 py-1 text-center font-bold">{stu.gender}</td>
                              <td className="px-2 py-1 text-center font-black text-emerald-600">{met.hadir}</td>
                              <td className="px-2 py-1 text-center font-black text-amber-600">{met.sakit}</td>
                              <td className="px-2 py-1 text-center font-black text-blue-600">{met.izin}</td>
                              <td className="px-2 py-1 text-center font-black text-red-600">{met.alpa}</td>
                              <td className="px-2 py-1 text-center font-bold font-mono text-slate-900">{met.persentaseKehadiran}%</td>
                            </tr>
                          );
                        })}
                        {students.length === 0 && (
                          <tr>
                            <td colSpan={9} className="px-4 py-8 text-center italic text-slate-400 font-semibold">Tidak ada data murid terdaftar.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-[9px] text-slate-500 italic mt-1 leading-normal font-bold">
                    * Catat: Jumlah rekapitulasi dihitung berdasarkan data {filteredAttendanceDates.length} lembar presensi harian kelas yang diisi guru sepanjang periode terpilih.
                  </p>
                </div>
              )}

              {/* Rekap Jurnal Mengajar */}
              {reportType === "rekap-jurnal" && (
                <div className="space-y-2">
                  <div className="overflow-x-auto border border-black rounded">
                    <table className="min-w-full text-[10px] text-left text-black divide-y divide-black">
                      <thead className="bg-slate-100 font-bold">
                        <tr className="divide-x divide-black text-center text-[9px] uppercase tracking-wider">
                          <th className="px-2 py-2 w-8">No</th>
                          <th className="px-2 py-2 w-28 text-left">Tanggal</th>
                          <th className="px-2 py-2 w-16">Kode TP</th>
                          <th className="px-2 py-2 text-left">Materi Pokok Pembelajaran</th>
                          <th className="px-1.5 py-2 w-12">JP</th>
                          <th className="px-2 py-2 w-20">Ketercapaian</th>
                          <th className="px-2 py-2 text-left w-36">Catatan Pendukung / Refleksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black font-medium leading-relaxed">
                        {filteredJournals.map((j, jIdx) => (
                          <tr key={j.id} className="divide-x divide-black hover:bg-slate-50/20">
                            <td className="px-2 py-1.5 text-center font-bold">{jIdx + 1}</td>
                            <td className="px-2 py-1.5 font-bold font-mono text-slate-600">{formatIndonesianDate(j.date)}</td>
                            <td className="px-2 py-1.5 font-mono font-extrabold text-indigo-700 text-center bg-indigo-50/10">{j.tpCode}</td>
                            <td className="px-2 py-1.5 font-semibold text-slate-900 leading-snug">{j.topic}</td>
                            <td className="px-1.5 py-1.5 text-center font-bold">{j.jpRealized} JP</td>
                            <td className="px-2 py-1.5 text-center"><span className="font-extrabold text-indigo-900">{j.status}</span></td>
                            <td className="px-2 py-1.5 text-slate-600 italic text-[9px] mt-0.5 leading-snug">{j.notes}</td>
                          </tr>
                        ))}
                        {filteredJournals.length === 0 && (
                          <tr>
                            <td colSpan={7} className="px-4 py-8 text-center italic text-slate-400 font-semibold">Tidak ada jurnal mengajar terdaftar pada periode terpilih.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Rekap Buku Catatan Kasus */}
              {reportType === "rekap-buku-catatan" && (
                <div className="space-y-2">
                  <div className="overflow-x-auto border border-black rounded">
                    <table className="min-w-full text-[10px] text-left text-black divide-y divide-black">
                      <thead className="bg-slate-100 font-bold">
                        <tr className="divide-x divide-black text-center text-[9px]">
                          <th className="px-2 py-2 w-8">No</th>
                          <th className="px-2 py-2 w-24 text-left">Tanggal</th>
                          <th className="px-2 py-2 text-left w-40">Siswa (NISN)</th>
                          <th className="px-2 py-2 w-20">Karakter</th>
                          <th className="px-2 py-2 text-left">Kejadian & Peristiwa Perilaku</th>
                          <th className="px-2 py-2 text-left w-36">Tindak Lanjut</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black font-medium leading-relaxed">
                        {filteredCaseLogs.map((c, cIdx) => {
                          const sData = students.find(s => s.id === c.studentId);
                          return (
                            <tr key={c.id} className="divide-x divide-black hover:bg-slate-50/20">
                              <td className="px-2 py-1.5 text-center font-bold">{cIdx + 1}</td>
                              <td className="px-2 py-1.5 font-bold font-mono text-slate-600">{formatIndonesianDate(c.date)}</td>
                              <td className="px-2 py-1.5">
                                <span className="block font-bold text-slate-900">{sData?.name || "Siswa Terhapus"}</span>
                                <span className="block text-[8px] font-mono text-slate-400 font-bold">{sData?.nisn} ({sData?.gender})</span>
                              </td>
                              <td className="px-2 py-1.5 text-center">
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                                  c.behaviorType === "Positif" 
                                    ? "bg-emerald-100 text-emerald-800 font-bold font-medium" 
                                    : "bg-red-100 text-red-800 font-bold"
                                }`}>
                                  {c.behaviorType}
                                </span>
                              </td>
                              <td className="px-2 py-1.5 leading-snug font-medium text-slate-800">{c.behaviorDescription}</td>
                              <td className="px-2 py-1.5 leading-snug font-bold text-slate-900">{c.followUp}</td>
                            </tr>
                          );
                        })}
                        {filteredCaseLogs.length === 0 && (
                          <tr>
                            <td colSpan={6} className="px-4 py-8 text-center italic text-slate-400 font-semibold">Tidak ada catatan perilaku/kasus afektif terdaftar pada periode terpilih.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 5. Signature Section / Tanda Tangan Lengkap */}
              <div className="mt-8 page-break-inside-avoid">
                {/* Signee Metadata City, Custom Date */}
                <div className="text-right text-[10px] text-slate-900 font-medium mb-3 mr-12 font-mono">
                  {reportSignPlace}, {formatIndonesianDate(reportSignDate)}
                </div>

                {/* Left/Right Signing Blocks */}
                <table className="w-full text-[10.5px] border-none text-black leading-normal">
                  <tbody>
                    <tr className="border-none">
                      <td className="w-1/2 text-center p-2 align-top border-none">
                        <div className="mb-0.5 text-slate-600 font-medium">Mengetahui,</div>
                        <div className="font-extrabold uppercase text-slate-900 tracking-wide">
                          Kepala Sekolah {config.schoolName}
                        </div>
                        
                        {/* Space for hand signature */}
                        {config.headmasterSignatureType === "upload" && config.headmasterSignatureData ? (
                          <div className="h-16 flex items-center justify-center p-1">
                            <img src={config.headmasterSignatureData} alt="Ttd Kepala Sekolah" className="max-h-full max-w-full object-contain mix-blend-multiply" referrerPolicy="no-referrer" />
                          </div>
                        ) : config.headmasterSignatureType === "text" && config.headmasterSignatureData ? (
                          <div className="h-16 flex items-center justify-center text-[16px] text-blue-800 font-bold select-none" style={{ fontFamily: "'Brush Script MT', cursive, Georgia, serif" }}>
                            {config.headmasterSignatureData}
                          </div>
                        ) : (
                          <div className="h-16 flex items-center justify-center font-serif text-[10px] text-slate-300 italic select-none">
                            ( Tanda Tangan & STEMPEL )
                          </div>
                        )}

                        {/* Name and NIP */}
                        <div className="font-black text-slate-950 underline decoration-1 text-xs">
                          {customHeadmasterName}
                        </div>
                        <div className="font-mono text-[9px] text-slate-500 font-bold mt-0.5">
                          NIP. {customHeadmasterNip || "-"}
                        </div>
                      </td>
                      
                      <td className="w-1/2 text-center p-2 align-top border-none">
                        <div className="mb-0.5 text-slate-600 font-medium">&nbsp;</div>
                        <div className="font-extrabold uppercase text-slate-900 tracking-wide">
                          Guru Kelas / Bidang Studi
                        </div>
                        
                        {/* Space for hand signature */}
                        {config.teacherSignatureType === "upload" && config.teacherSignatureData ? (
                          <div className="h-16 flex items-center justify-center p-1">
                            <img src={config.teacherSignatureData} alt="Ttd Guru" className="max-h-full max-w-full object-contain mix-blend-multiply" referrerPolicy="no-referrer" />
                          </div>
                        ) : config.teacherSignatureType === "text" && config.teacherSignatureData ? (
                          <div className="h-16 flex items-center justify-center text-[16px] text-blue-800 font-bold select-none" style={{ fontFamily: "'Brush Script MT', cursive, Georgia, serif" }}>
                            {config.teacherSignatureData}
                          </div>
                        ) : (
                          <div className="h-16 flex items-center justify-center font-serif text-[10px] text-slate-300 italic select-none">
                            ( Tanda Tangan )
                          </div>
                        )}

                        {/* Name and NIP */}
                        <div className="font-black text-slate-950 underline decoration-1 text-xs">
                          {customTeacherName}
                        </div>
                        <div className="font-mono text-[9px] text-slate-500 font-bold mt-0.5">
                          NIP. {customTeacherNip || "-"}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

            </div>
          </div>

        </div>
      )}
    </div>
  );
};

