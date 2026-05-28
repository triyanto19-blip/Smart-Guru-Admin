/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { SchoolConfig, CalendarWeek, AlurTujuanPembelajaran, Student, StudentGrade, GroupFollowUp } from "../types";
import { HeaderKop } from "./HeaderKop";
import { 
  Plus, Edit, Save, Trash2, Award, Sparkles, AlertTriangle, FileText, 
  Download, FileSpreadsheet, ListOrdered, GraduationCap, ChevronRight, Check, Copy 
} from "lucide-react";

interface AssessmentModuleProps {
  config: SchoolConfig;
  weeks: CalendarWeek[];
  atpList: AlurTujuanPembelajaran[];
  students: Student[];
  grades: StudentGrade[];
  setGrades: React.Dispatch<React.SetStateAction<StudentGrade[]>>;
}

export interface GroupFollowUpMap {
  [tpCode: string]: GroupFollowUp;
}

export const AssessmentModule: React.FC<AssessmentModuleProps> = ({
  config,
  weeks,
  atpList,
  students,
  grades,
  setGrades,
}) => {
  // Navigation
  const [activeSubTab, setActiveSubTab] = useState<"grades" | "remedial" | "erapor">("grades");

  // PMM Preview State
  const [showPmmPreview, setShowPmmPreview] = useState(false);

  // Local state for auto follow-up
  const [selectedTpForFollowUp, setSelectedTpForFollowUp] = useState<string>(atpList[0]?.code || "");
  const [followUpResults, setFollowUpResults] = useState<GroupFollowUpMap>({});
  const [isGeneratingFollowUp, setIsGeneratingFollowUp] = useState(false);
  const [generationStep, setGenerationStep] = useState("");
  const [apiError, setApiError] = useState("");

  // Grade adjustment state
  const handleUpdateGrade = (studentId: string, type: "formative" | "midterm" | "final" | "remedial", tpCode: string, value: number) => {
    setGrades(prev => {
      const hasRecord = prev.some(g => g.studentId === studentId);
      let list = [...prev];
      if (!hasRecord) {
        list.push({
          studentId,
          formativeGrades: {},
          midtermGrade: 0,
          finalGrade: 0
        });
      }
      return list.map(g => {
        if (g.studentId === studentId) {
          if (type === "formative") {
            return {
              ...g,
              formativeGrades: {
                ...g.formativeGrades,
                [tpCode]: value
              }
            };
          } else if (type === "midterm") {
            return { ...g, midtermGrade: value };
          } else if (type === "final") {
            return { ...g, finalGrade: value };
          } else if (type === "remedial") {
            return { ...g, remedialScore: value };
          }
        }
        return g;
      });
    });
  };

  // Safe getter for student grades
  const getStudentGrade = (studentId: string): StudentGrade => {
    const found = grades.find(g => g.studentId === studentId);
    if (found) return found;

    // Return blank if missing
    return {
      studentId,
      formativeGrades: {},
      midtermGrade: 0,
      finalGrade: 0
    };
  };

  // Calculate student average score across all TP + Midterm + Final
  const calculateStudentStats = (studentId: string) => {
    const g = getStudentGrade(studentId);
    const formativeValues = Object.values(g.formativeGrades);
    
    // Sumative has weight or average
    // In standard Kurikulum Merdeka, final score = (Average Formative + Midterm + Final) / 3
    const avgFormative = formativeValues.length > 0
      ? formativeValues.reduce((sum, v) => sum + v, 0) / formativeValues.length
      : 0;

    let finalValue = 0;
    if (formativeValues.length > 0) {
      finalValue = (avgFormative + g.midtermGrade + g.finalGrade) / 3;
    } else {
      finalValue = (g.midtermGrade + g.finalGrade) / 2;
    }

    // Apply remedial score override if remedial achieved and higher!
    const ultimateScore = g.remedialScore && g.remedialScore > finalValue
      ? Math.round(g.remedialScore)
      : Math.round(finalValue);

    const isPassed = ultimateScore >= config.kktp;

    return {
      avgFormative: Math.round(avgFormative),
      finalScore: Math.round(finalValue),
      ultimateScore,
      isPassed
    };
  };

  // Group class into remedial vs pengayaan based on KKTP threshold
  const getGroupsForAssessment = () => {
    const remedialList: { student: Student; score: number }[] = [];
    const pengayaanList: { student: Student; score: number }[] = [];

    students.forEach(s => {
      const stats = calculateStudentStats(s.id);
      if (stats.ultimateScore < config.kktp) {
        remedialList.push({ student: s, score: stats.ultimateScore });
      } else {
        pengayaanList.push({ student: s, score: stats.ultimateScore });
      }
    });

    return { remedialList, pengayaanList };
  };

  const { remedialList, pengayaanList } = getGroupsForAssessment();

  // API Call: Generate Remedial & Pengayaan Materials
  const handleGenerateFollowUpWithAI = async () => {
    if (!selectedTpForFollowUp) {
      setApiError("Pilih Tujuan Pembelajaran (TP) tindak lanjut terlebih dahulu.");
      return;
    }

    try {
      setIsGeneratingFollowUp(true);
      setApiError("");
      setGenerationStep("AI mengevaluasi sebaran murid remedial & pengayaan...");
      await new Promise(r => setTimeout(r, 500));

      setGenerationStep("AI menyusun materi teori perbaikan dan butir soal remedial terpandu...");
      await new Promise(r => setTimeout(r, 500));

      setGenerationStep("AI menyusun studi kasus tingkat tinggi dan draf proyek bagi murid berprestasi...");

      const response = await fetch("/api/generate/remedial-pengayaan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tpCode: selectedTpForFollowUp,
          tpText: atpList.find(a => a.code === selectedTpForFollowUp)?.tpText || "",
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gagal menghasilkan dokumen tindak lanjut.");
      }

      const result: GroupFollowUp = await response.json();
      setFollowUpResults(prev => ({
        ...prev,
        [selectedTpForFollowUp]: result
      }));

    } catch (err: any) {
      console.error(err);
      setApiError(err.message || "Terdapat gangguan server AI. Coba sesaat lagi.");
    } finally {
      setIsGeneratingFollowUp(false);
    }
  };

  // Mock template exporter
  const handleExportCsvErapor = () => {
    // Generates printable comma-separated sheet structure
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += `"KOP LAPORAN e-RAPOR KEMENTERIAN DIKBUDRISTEK"\n`;
    csvContent += `"Sekolah","${config.schoolName}"\n`;
    csvContent += `"Fase/Kelas","${config.phase}/${config.grade}"\n`;
    csvContent += `"Mata Pelajaran","${config.subject}"\n`;
    csvContent += `"Semester","${config.semester}"\n\n`;
    csvContent += "NISN,Nama Siswa,Rerata Formatif,Nilai Sumatif Tengah Semester,Nilai Sumatif Akhir Semester,Nilai Akhir,Status Kelulusan\n";

    students.forEach(s => {
      const g = getStudentGrade(s.id);
      const stats = calculateStudentStats(s.id);
      csvContent += `${s.nisn},"${s.name}",${stats.avgFormative},${g.midtermGrade},${g.finalGrade},${stats.ultimateScore},"${stats.isPassed ? 'TUNTAS' : 'BELUM TUNTAS'}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.href = encodedUri;
    link.download = `eRapor-Format-Import-${config.subject.replace(/\s+/g, '_')}.csv`;
    link.click();
  };

  const handleExportCsvPmm = () => {
    // Generates printable comma-separated sheet structure optimized for PMM upload
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += `"LAPORAN KINERJA GURU - REKAPITULASI PELAPORAN PMM (KEMENDIKBUDRISTEK)"\n`;
    csvContent += `"Sekolah","${config.schoolName}"\n`;
    csvContent += `"NPSN","${config.npsn || '20314545'}"\n`;
    csvContent += `"Mata Pelajaran","${config.subject}"\n`;
    csvContent += `"Fase/Kelas","Fase ${config.phase} / Kelas ${config.grade}"\n`;
    csvContent += `"Total TP Terang","${atpList.length} TP"\n`;
    csvContent += `"Ketuntasan Klasikal","${Math.round((pengayaanList.length / (students.length || 1)) * 100)}%"\n\n`;
    csvContent += "Email_Guru,Nama_Sekolah,Mata_Pelajaran,Fase_Kelas,Total_TP_Diajarkan,Persentase_Ketuntasan,Skor_Rerata_Kelas,Modul_Ajar_Bukti_Link,Rekomendasi_Tindak_Lanjut\n";

    let totalScoresSum = 0;
    students.forEach(s => {
      totalScoresSum += calculateStudentStats(s.id).ultimateScore;
    });
    const classAvg = students.length > 0 ? Math.round(totalScoresSum / students.length) : 0;
    const passRate = students.length > 0 ? Math.round((pengayaanList.length / students.length) * 100) : 0;

    csvContent += `"${config.principalEmail || 'triyanto19@guru.sd.belajar.id'}","${config.schoolName}","${config.subject}","Fase ${config.phase} / ${config.grade}",${atpList.length},${passRate}%,${classAvg},"https://pmm.kemdikbud.go.id/bukti-karya/rpp-rancangan-${config.subject.toLowerCase().replace(/\s+/g, '-')}-sd","Menerapkan metode berdifensiasi kognitif serta meluncurkan modul belajar remedial berkelanjutan di forum MGMP."\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.href = encodedUri;
    link.download = `PMM-Kinerja-Hasil-Belajar-${config.subject.replace(/\s+/g, '_')}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Selector SubTabs */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-2 gap-4">
        <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveSubTab("grades")}
            className={`flex items-center px-4 py-1.5 rounded-md text-xs font-semibold transition ${
              activeSubTab === "grades" ? "bg-white text-slate-800 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
            id="subtab-assessment-grid"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5" />
            Spreadsheet Nilai
          </button>
          <button
            onClick={() => setActiveSubTab("remedial")}
            className={`flex items-center px-4 py-1.5 rounded-md text-xs font-semibold transition ${
              activeSubTab === "remedial" ? "bg-white text-slate-800 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
            id="subtab-assessment-remedial"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            Program Tindak Lanjut (AI)
          </button>
          <button
            onClick={() => setActiveSubTab("erapor")}
            className={`flex items-center px-4 py-1.5 rounded-md text-xs font-semibold transition ${
              activeSubTab === "erapor" ? "bg-white text-slate-800 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
            id="subtab-assessment-export"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Ekspor e-Rapor & PMM
          </button>
        </div>

        {/* Global Statistics Badging */}
        <div className="flex items-center space-x-3 text-xs">
          <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-bold">
            Tuntas KKTP: {pengayaanList.length} Murid
          </span>
          <span className="bg-rose-100 text-rose-800 px-2.5 py-1 rounded-full font-bold">
            Remedial: {remedialList.length} Murid
          </span>
        </div>
      </div>

      {/* Panel 1: Grades Spreadsheet Grid */}
      {activeSubTab === "grades" && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 font-display">Spreadsheet Penilaian Akhir Capaian Siswa</h2>
            <p className="text-xs text-slate-500 font-sans">Sesuaikan nilai formatif harian TP, UTS/STS, UAS/SAS kelas. Total nilai dihitung otomatis secara proporsional.</p>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="min-w-full text-xs text-left text-slate-600">
              <thead className="bg-slate-50 text-[10px] uppercase text-slate-700 font-bold tracking-wider divide-x">
                <tr>
                  <th rowSpan={2} className="px-4 py-3 text-center w-12 bg-slate-100 border-b">No</th>
                  <th rowSpan={2} className="px-4 py-3 w-40 bg-slate-100 border-b">Nama Siswa</th>
                  {/* Formative Dynamic Headers from Scheduled TPs */}
                  <th colSpan={atpList.length || 1} className="px-4 py-1.5 text-center bg-slate-200 border-b text-[8px] font-extrabold tracking-widest text-slate-800">
                    NILAI ASESMEN FORMATIF (HARIAN JURNAL)
                  </th>
                  <th colSpan={3} className="px-4 py-1.5 text-center bg-amber-100 border-l border-b text-[8px] font-extrabold tracking-widest text-amber-900">
                    ASESMEN SUMATIF (UJIAN)
                  </th>
                  <th rowSpan={2} className="px-4 py-3 text-center w-24 bg-slate-950 text-white font-display uppercase tracking-widest text-[9px] font-black border-b">
                    Nilai Rapor
                  </th>
                  <th rowSpan={2} className="px-4 py-3 text-center w-24 bg-slate-100 border-b">Kelulusan KKTP ({config.kktp})</th>
                </tr>
                <tr className="bg-slate-100 text-[9px] divide-x">
                  {atpList.map(a => (
                    <th key={a.id} className="px-2 py-2 text-center font-mono text-slate-700 w-16" title={a.tpText}>
                      {a.code}
                    </th>
                  ))}
                  {atpList.length === 0 && <th className="px-2 py-2 text-center text-slate-400">Belum ada TP</th>}
                  
                  {/* Sumatives */}
                  <th className="px-3 py-2 text-center w-16 text-amber-800">STS</th>
                  <th className="px-3 py-2 text-center w-16 text-amber-800">SAS</th>
                  <th className="px-3 py-2 text-center w-16 text-emerald-800 font-semibold bg-emerald-50">REMEDI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {students.map((stu, index) => {
                  const g = getStudentGrade(stu.id);
                  const stats = calculateStudentStats(stu.id);

                  return (
                    <tr key={stu.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-4 py-2.5 text-center font-bold text-slate-400 font-mono">{index + 1}</td>
                      <td className="px-4 py-2.5">
                        <span className="block font-bold text-slate-900">{stu.name}</span>
                        <span className="block text-[8px] text-slate-400 font-mono font-bold tracking-wider">NISN: {stu.nisn}</span>
                      </td>

                      {/* Dynamic Formative inputs */}
                      {atpList.map(a => {
                        const score = g.formativeGrades[a.code] ?? 0;
                        return (
                          <td key={a.id} className="px-1 py-2 Text-center">
                            <input
                              type="number"
                              value={score === 0 ? "" : score}
                              onChange={e => handleUpdateGrade(stu.id, "formative", a.code, parseInt(e.target.value) || 0)}
                              className="w-12 mx-auto text-center border-0 p-1 font-mono hover:bg-slate-100 focus:bg-white rounded focus:ring-1 focus:ring-slate-500 font-semibold text-slate-800"
                              min="0" max="100"
                              placeholder="0"
                            />
                          </td>
                        );
                      })}
                      {atpList.length === 0 && <td className="px-2 py-3.5 text-slate-400 italic text-center">-</td>}

                      {/* Sumative STS */}
                      <td className="px-1 py-1.5 text-center bg-amber-50/20">
                        <input
                          type="number"
                          value={g.midtermGrade === 0 ? "" : g.midtermGrade}
                          onChange={e => handleUpdateGrade(stu.id, "midterm", "", parseInt(e.target.value) || 0)}
                          className="w-12 mx-auto text-center border-0 p-1 font-mono hover:bg-slate-100 focus:bg-white rounded focus:ring-1 focus:ring-amber-500 font-semibold text-amber-900"
                          min="0" max="100"
                          placeholder="0"
                        />
                      </td>

                      {/* Sumative SAS */}
                      <td className="px-1 py-1.5 text-center bg-amber-50/20">
                        <input
                          type="number"
                          value={g.finalGrade === 0 ? "" : g.finalGrade}
                          onChange={e => handleUpdateGrade(stu.id, "final", "", parseInt(e.target.value) || 0)}
                          className="w-12 mx-auto text-center border-0 p-1 font-mono hover:bg-slate-100 focus:bg-white rounded focus:ring-1 focus:ring-amber-500 font-semibold text-amber-900"
                          min="0" max="100"
                          placeholder="0"
                        />
                      </td>

                      {/* Remedial Score Column */}
                      <td className="px-1 py-1.5 text-center bg-emerald-50/20">
                        <input
                          type="number"
                          value={g.remedialScore ?? ""}
                          onChange={e => handleUpdateGrade(stu.id, "remedial", "", parseInt(e.target.value) || 0)}
                          className="w-12 mx-auto text-center border-0 p-1 font-mono hover:bg-emerald-100 focus:bg-white rounded focus:ring-1 focus:ring-emerald-500 font-bold text-emerald-800"
                          min="0" max="100"
                          placeholder="-"
                        />
                      </td>

                      {/* Final Ultimate Calcutaled Score */}
                      <td className="px-4 py-2.5 text-center bg-slate-900 text-white font-mono font-extrabold text-xs">
                        {stats.ultimateScore}
                      </td>

                      {/* KKTP Status badge */}
                      <td className="px-4 py-2.5 text-center">
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded ${
                          stats.isPassed 
                            ? "bg-emerald-100 text-emerald-800 font-medium" 
                            : "bg-red-100 text-red-800"
                        }`}>
                          {stats.isPassed ? "TUNTAS" : "REMEDIAL"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Panel 2: Remedial vs Pengayaan Program with Generative AI */}
      {activeSubTab === "remedial" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between border-b pb-3 border-slate-100 gap-2">
              <div>
                <h2 className="text-sm font-bold text-slate-900 font-display">Program Remedial & Pengayaan Berbasis AI</h2>
                <p className="text-xs text-slate-500">Memetakan siswa ke dalam 2 kelompok pasca evaluasi secara live dan merumuskan program bantuan belajar.</p>
              </div>

              {/* Action AI generator */}
              <button
                onClick={handleGenerateFollowUpWithAI}
                disabled={isGeneratingFollowUp || !selectedTpForFollowUp}
                className="flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                {isGeneratingFollowUp ? "Memetakan..." : "AI Hasilkan Program Diferensiasi"}
              </button>
            </div>

            {/* Error logs */}
            {apiError && (
              <div className="p-3 bg-red-105 text-red-800 text-xs rounded-xl flex items-center justify-between border">
                <span><strong>Gagal AI:</strong> {apiError}</span>
                <button onClick={() => setApiError("")} className="text-red-900 font-bold ml-2">X</button>
              </div>
            )}

            {/* Pedgogic Tracker step */}
            {isGeneratingFollowUp && (
              <div className="p-4 bg-slate-50 border rounded-xl flex flex-col items-center justify-center space-y-2">
                <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs text-slate-700 font-medium animate-pulse">{generationStep}</p>
              </div>
            )}

            {/* Configurations selectors of TP scope */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-slate-700 mb-1 uppercase tracking-wider">Tujuan Pembelajaran (TP) Terpilih</label>
                <select
                  value={selectedTpForFollowUp}
                  onChange={e => setSelectedTpForFollowUp(e.target.value)}
                  className="w-full text-xs p-2 border rounded-lg bg-white font-medium"
                >
                  {atpList.map(a => (
                    <option key={a.id} value={a.code}>{a.code} - {a.tpText}</option>
                  ))}
                </select>
              </div>

              <div className="text-xs text-slate-500 pl-2">
                <span className="font-bold text-slate-700">Analisis Kognitif:</span> 
                <p className="text-[11px] mt-0.5">{remedialList.length} siswa akan masuk modul remedial sederhana, {pengayaanList.length} siswa akan memperoleh modul eksplorasi HOTS.</p>
              </div>
            </div>

            {/* Distribution Layout Split */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Group A: Remedial Group (< KKTP) */}
              <div className="border border-red-200 bg-red-50/10 p-4 rounded-xl space-y-3">
                <div className="flex items-center space-x-2 text-red-800 font-bold text-xs border-b border-red-100 pb-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <h4>KELOMPOK REMEDIAL (Di Bawah KKTP {config.kktp} )</h4>
                  <span className="bg-red-100 text-red-800 text-[10px] px-2 py-0.5 rounded-full">{remedialList.length} Murid</span>
                </div>
                <ul className="list-decimal pl-5 text-xs text-slate-700 font-medium space-y-1 max-h-40 overflow-y-auto">
                  {remedialList.map(r => (
                    <li key={r.student.id}>
                      <span className="font-bold">{r.student.name}</span> (Nilai: <span className="text-red-700 font-mono font-black">{r.score}</span>)
                    </li>
                  ))}
                  {remedialList.length === 0 && (
                    <li className="text-slate-400 italic list-none text-center">Luar biasa! Semua siswa telah melampaui standar batas ketuntasan KKTP.</li>
                  )}
                </ul>
              </div>

              {/* Group B: Achievement / Pengayaan Group */}
              <div className="border border-emerald-200 bg-emerald-50/10 p-4 rounded-xl space-y-3">
                <div className="flex items-center space-x-2 text-emerald-800 font-bold text-xs border-b border-emerald-100 pb-2">
                  <Award className="w-4 h-4 text-emerald-600 animate-bounce" />
                  <h4>KELOMPOK PENGAYAAN (Sesuai/Atas KKTP {config.kktp} )</h4>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full">{pengayaanList.length} Murid</span>
                </div>
                <ul className="list-decimal pl-5 text-xs text-slate-700 font-medium space-y-1 max-h-40 overflow-y-auto">
                  {pengayaanList.map(r => (
                    <li key={r.student.id}>
                      <span className="font-bold">{r.student.name}</span> (Nilai: <span className="text-emerald-700 font-mono font-black">{r.score}</span>)
                    </li>
                  ))}
                  {pengayaanList.length === 0 && (
                    <li className="text-slate-400 italic list-none text-center">Belum ada murid di atas KKTP. Berikan bimbingan kognitif terarah di kelas.</li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Render followUpResults container if available */}
          {followUpResults[selectedTpForFollowUp] ? (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6 max-h-[600px] overflow-y-auto">
              <div className="flex items-center justify-between border-b pb-3">
                <span className="text-xs bg-slate-100 text-slate-800 px-2 py-1 rounded font-bold font-mono">DOKUMEN TINDAK LANJUT TP: {selectedTpForFollowUp}</span>
                <span className="text-[10px] text-slate-400 font-medium">Berdiferensiasi Kognitif • Kurikulum Merdeka</span>
              </div>

              {/* Official formal layout wrapper */}
              <HeaderKop config={config} documentTitle={`PROGRAM PELAKSANAAN REMEDIAL DAN PENGAYAAN (${selectedTpForFollowUp})`} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-4">
                
                {/* Visual Area 1: Remedial Material & Guidance Questions */}
                <div className="space-y-4 border-r pr-6 border-slate-100">
                  <div className="border bg-red-50/5 border-red-200 p-4 rounded-xl text-xs space-y-4">
                    <h3 className="font-bold text-red-800 uppercase tracking-widest text-[10px] border-b pb-1.5">MODUL BELAJAR MANDIRI REMEDIAL</h3>
                    
                    <div className="prose prose-sm text-slate-700 leading-relaxed font-sans whitespace-pre-wrap select-text">
                      {followUpResults[selectedTpForFollowUp].remedialMaterial}
                    </div>

                    <div className="space-y-3.5 border-t border-dashed border-red-200 pt-3">
                      <span className="font-bold text-red-900 uppercase text-[9px] block">Soal Perbaikan Sederhana & Clue Cepat</span>
                      <ol className="list-decimal pl-4 space-y-3">
                        {followUpResults[selectedTpForFollowUp].remedialQuestions?.map((item, idx) => (
                          <li key={idx} className="space-y-1 font-medium text-slate-850">
                            <p className="text-[11px] text-slate-900">{item.question}</p>
                            <p className="text-[10px] text-emerald-800 italic bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
                              <span className="font-bold font-sans not-italic text-emerald-900 border-none">Clue Pembimbing:</span> &ldquo;{item.guide}&rdquo;
                            </p>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </div>

                {/* Visual Area 2: Pengayaan Case Studies & Challenges */}
                <div className="space-y-4">
                  <div className="border bg-emerald-50/5 border-emerald-200 p-4 rounded-xl text-xs space-y-4">
                    <h3 className="font-bold text-emerald-800 uppercase tracking-widest text-[10px] border-b pb-1.5">KARTU TANTANGAN EKSTERNAL PENGAYAAN</h3>

                    <div className="space-y-2">
                      <span className="font-bold text-emerald-900 uppercase text-[9px] block">Stimulus HOTS / Studi Kasus Nyata</span>
                      <p className="text-[11px] text-slate-800 leading-relaxed font-medium bg-slate-50 border p-3 rounded-lg select-text">
                        {followUpResults[selectedTpForFollowUp].pengayaanCase}
                      </p>
                    </div>

                    <div className="space-y-2 border-t border-dashed border-emerald-200 pt-3">
                      <span className="font-bold text-emerald-900 uppercase text-[9px] block">Instruksi Tugas Eksplorasi Mandiri</span>
                      <p className="text-[11px] text-slate-705 leading-relaxed bg-slate-50 border p-3 rounded-lg select-text font-sans">
                        {followUpResults[selectedTpForFollowUp].pengayaanTask}
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-10 text-center text-slate-400 h-64 flex flex-col items-center justify-center space-y-2 font-sans">
              <FileText className="w-10 h-10 text-slate-300" />
              <h3 className="text-xs font-bold text-slate-650">Butuh Evaluasi Berdiferensiasi?</h3>
              <p className="text-[11px] max-w-sm">Dapatkan rangkuman pembelajaran asimilasi yang dipolakan khusus untuk membimbing kelompok remedial dan memicu tantangan baru bagi kelompok pencapaian.</p>
            </div>
          )}
        </div>
      )}

      {/* Panel 3: e-Rapor & PMM Export Simulator */}
      {activeSubTab === "erapor" && (() => {
        let totalScoresSum = 0;
        students.forEach(s => {
          totalScoresSum += calculateStudentStats(s.id).ultimateScore;
        });
        const classAvg = students.length > 0 ? Math.round(totalScoresSum / students.length) : 0;
        const passRate = students.length > 0 ? Math.round((pengayaanList.length / students.length) * 100) : 0;

        return (
          <div className="space-y-6 select-none font-sans">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="border-b pb-3">
                <h2 className="text-sm font-bold text-slate-900 font-display">Integrasi Portal Pelaporan Nasional (e-Rapor & platform PMM)</h2>
                <p className="text-xs text-slate-500 font-sans mt-0.5">Ekspor hasil penilaian asimilasi belajar Kurikulum Merdeka ke format impor dinas resmi Kemendikbudristek secara instan.</p>
              </div>

              {/* Grid 2 Columns for e-Rapor vs PMM */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Column Left: e-Rapor Exporter */}
                <div className="lg:col-span-5 bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4 font-sans">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-900 bg-white border px-2 py-0.5 rounded shadow-2xs">e-Rapor Kemendikbud</span>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans mt-1">
                    Unduh file CSV rekapitulasi nilai akhir per TP untuk diunggah langsung ke portal aplikasi e-Rapor Sekolah Dasar. Urutan NISN, Nilai Formatif, UTS, dan UAS diselaraskan otomatis.
                  </p>

                  <div className="space-y-2 pt-2 select-none">
                    <button
                      onClick={handleExportCsvErapor}
                      className="w-full flex items-center justify-between text-xs font-bold p-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white shadow transition-transform cursor-pointer"
                    >
                      <div className="flex items-center">
                        <FileSpreadsheet className="w-4.5 h-4.5 mr-2" />
                        <span>Download Template e-Rapor.CSV</span>
                      </div>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Schema Preview Mini Code Block */}
                  <div className="border rounded-xl p-3 bg-white space-y-2 font-mono text-[10px] text-slate-500">
                    <span className="font-bold text-slate-700 block">Struktur Kolam Ekspor e-Rapor:</span>
                    <div className="bg-slate-50 p-2 rounded border overflow-x-auto max-h-24 leading-relaxed font-semibold">
                      {`NISN,Nama_Siswa,Rerata_Formatif,STS,SAS,Nilai_Rapor\n`}
                      {students.slice(0, 2).map(s => {
                        const stats = calculateStudentStats(s.id);
                        const g = getStudentGrade(s.id);
                        return `${s.nisn},"${s.name.slice(0, 15)}",${stats.avgFormative},${g.midtermGrade},${g.finalGrade},${stats.ultimateScore}\n`;
                      })}
                    </div>
                  </div>
                </div>

                {/* Column Right: PMM e-Kinerja & Evidence Hub */}
                <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4 font-sans text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded shadow-2xs">Platform Merdeka Mengajar (PMM)</span>
                    <span className="bg-emerald-50 text-emerald-800 border border-emerald-150 px-2 py-0.5 rounded text-[9px] font-black">PMM READY</span>
                  </div>

                  <p className="text-xs text-slate-650 leading-relaxed font-sans">
                    Modul ekspor pelaporan indikator Kinerja Guru (e-Kinerja) terpadu di PMM untuk memuat bukti dukung, ringkasan ajar harian, serta asimilasi kriteria ketuntasan kelas.
                  </p>

                  {/* Checklist indicators based on user requirements */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-205 space-y-2 text-[11px] font-semibold text-slate-700 leading-relaxed">
                    <h5 className="font-extrabold text-[11px] uppercase text-slate-900 tracking-wider">Metrik Laporan Kinerja PMM:</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 font-sans">
                      <div className="flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-emerald-600 bg-emerald-100/50 p-0.5 rounded-full stroke-[3px]" />
                        <span>Ringkasan {atpList.length} TP Terjadwal</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-emerald-600 bg-emerald-100/50 p-0.5 rounded-full stroke-[3px]" />
                        <span>Rerata Kelas: {classAvg}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-emerald-600 bg-emerald-100/50 p-0.5 rounded-full stroke-[3px]" />
                        <span>Ketuntasan Klasikal: {passRate}%</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-emerald-600 bg-emerald-100/50 p-0.5 rounded-full stroke-[3px]" />
                        <span>{weeks.length} Bukti Ajar Jurnal digital</span>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Action boutons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 select-none">
                    <button
                      onClick={() => setShowPmmPreview(!showPmmPreview)}
                      className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-800 text-xs font-bold transition flex items-center justify-center gap-1 border border-slate-200 cursor-pointer"
                    >
                      <span>👁️ {showPmmPreview ? "Tutup" : "Pratinjau"} Naratif e-Kinerja</span>
                    </button>
                    <button
                      onClick={handleExportCsvPmm}
                      className="px-3 py-2.5 bg-blue-700 hover:bg-blue-800 text-white shadow-sm rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Unduh Laporan Kerja PMM</span>
                    </button>
                  </div>

                  {/* Narrative PMM Output Section */}
                  {showPmmPreview && (
                    <div className="p-4 bg-blue-50/40 rounded-xl border border-blue-150 leading-relaxed text-xs space-y-2 text-left animate-fadeIn font-sans">
                      <div className="flex items-center justify-between border-b border-blue-100 pb-1.5">
                        <span className="font-extrabold text-[10px] uppercase text-blue-900 font-sans">Saran Narasi Pelaporan e-Kinerja Guru PMM (Copy-Paste)</span>
                        <button
                          onClick={() => {
                            const pmmNarrativeText = `LAPORAN KINERJA GURU SDN MERDEKA JAYA\nFase/Kelas: Fase ${config.phase} / Kelas ${config.grade}\nMata Pelajaran: ${config.subject}\n\nRingkasan Kegiatan Pembelajaran: Telah terlaksana tuntas sebanyak ${atpList.length} Tujuan Pembelajaran (TP) efektif dalam satu semester yang mencakup analisis materi harian serta keterlibatan belajar siswa berbasis proyek.\n\nHasil Asesmen: Rata-rata capaian akhir peserta didik adalah ${classAvg} dari total ${students.length} murid, dengan target Ketuntasan Kriteria Minimal (KKTP: ${config.kktp}) mencapai tingkat klasikal ${passRate}%.\n\nBukti Dukung Ajar: Tersedia draf Modul Ajar kurikulum merdeka terdigitalisasi, log draf remedial kelompok, serta instrumen kisi-kisi butir soal.`;
                            navigator.clipboard.writeText(pmmNarrativeText);
                            alert("Narasi Pelaporan Kinerja PMM berhasil disalin!");
                          }}
                          className="text-[10px] font-black text-blue-800 hover:underline flex items-center gap-0.5"
                        >
                          <Copy className="w-3 h-3" />
                          Salin Narasi
                        </button>
                      </div>

                      <div className="text-slate-700 font-medium space-y-1.5 font-sans leading-relaxed select-text text-[11px]">
                        <p>
                          <strong>1. Ringkasan Kegiatan Pembelajaran:</strong> Berdasarkan data kalender sekolah efektif, mata pelajaran <em>{config.subject}</em> untuk <em>Kelas {config.grade}</em> di <strong>{config.schoolName}</strong> berhasil menyelesaikan total <strong>{atpList.length} Tujuan Pembelajaran (TP)</strong>. Kegiatan pembelajaran dilaksanakan dengan metode diferensiasi kognitif serta pelibatan kelompok belajar terarah dalam format RPP+ Kurikulum Merdeka.
                        </p>
                        <p>
                          <strong>2. Hasil Asesmen Akhir Semester:</strong> Evaluasi ketuntasan murid berdasarkan KKTP acuan <strong>({config.kktp})</strong> merangkum rata-rata asimilasi nilai kelas mencapai skor <strong>{classAvg}</strong>, dengan tingkat keberhasilan ketuntasan klasikal sebesar <strong>{passRate}%</strong> ({pengayaanList.length} dari {students.length} siswa).
                        </p>
                        <p>
                          <strong>3. Bukti Dukung Pembelajaran:</strong> Seluruh draf perencanaan administrasi diarsipkan lengkap bersama daftar riwayat log remedial mandiri, instrumen rubrik analitis, serta bank butir soal evaluasi taksonomi kognitif Bloom.
                        </p>
                      </div>
                    </div>
                  )}

                </div>

              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
