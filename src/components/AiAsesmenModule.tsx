/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { SchoolConfig, AlurTujuanPembelajaran, QuestionItem, KisiKisi, AssessmentRubric } from "../types";
import { HeaderKop } from "./HeaderKop";
import { 
  Sparkles, FileText, CheckCircle2, ChevronRight, List, 
  HelpCircle, Copy, Printer, Download, BookOpen, AlertCircle,
  Plus, Trash2, Check, CheckSquare, Square, BarChart2, PlusCircle,
  Play, Filter, Search, ShieldCheck
} from "lucide-react";

interface AiAsesmenModuleProps {
  config: SchoolConfig;
  atpList: AlurTujuanPembelajaran[];
}

export interface QuestionItemWithMeta extends QuestionItem {
  isUsed: boolean;
  source: "AI Generated" | "Manual Input";
  studentPerformance: {
    timesAnswered: number;
    averageScorePercent: number;
  };
}

const DEFAULT_BANK_SOAL: QuestionItemWithMeta[] = [
  {
    id: "SOAL-001",
    tpCode: "TP 1.1",
    topic: "Metode Ilmiah",
    cognitiveLevel: "HOTS",
    questionText: "Budi ingin menguji pengaruh jenis air siraman terhadap kesuburan tanaman cabai hiasnya. Ia menyiapkan tiga pot tanaman sejenis dan menyiramnya masing-masing dengan air sumur, air cucian beras, dan air teh sisa. Variabel bebas dan variabel terikat yang tepat dalam penyelidikan Budi berturut-turut adalah...",
    options: [
      "Waktu penyiraman dan kesuburan tanaman cabai",
      "Jenis air penyiram dan kesuburan pertumbuhan tanaman cabai",
      "Suhu tanah pot dan volume air yang digunakan",
      "Kandungan hara tanah pot dan kelembapan kebun"
    ],
    correctAnswer: "B",
    isUsed: true,
    source: "AI Generated",
    studentPerformance: {
      timesAnswered: 32,
      averageScorePercent: 78
    }
  },
  {
    id: "SOAL-002",
    tpCode: "TP 1.2",
    topic: "Wujud Zat & Menguap",
    cognitiveLevel: "C2",
    questionText: "Ibu menjemur baju basah di bawah terik matahari siang, beberapa jam kemudian baju tersebut kering merata. Perubahan wujud zat yang terjadi pada air di dalam serat baju basah tersebut hingga hilang ke awan adalah...",
    options: [
      "Mencair karena mengalami pembekuan bertahap",
      "Menyublim karena menerima dinginnya udara bebas",
      "Menguap karena menyerap kalor (energi panas) matahari",
      "Mengembun karena melepaskan suhu panas ke bumi"
    ],
    correctAnswer: "C",
    isUsed: false,
    source: "Manual Input",
    studentPerformance: {
      timesAnswered: 18,
      averageScorePercent: 92
    }
  },
  {
    id: "SOAL-003",
    tpCode: "TP 1.3",
    topic: "Ekosistem & Rantai Makanan",
    cognitiveLevel: "C4",
    questionText: "Dalam ekosistem sawah terdapat rantai makanan: Padi -> Belalang -> Katak -> Ular -> Elang. Jika populasi katak mendadak punah akibat mewabahnya penyakit, akibat langsung yang terjadi pada kestabilan ekosistem tersebut adalah...",
    options: [
      "Populasi belalang akan menyusut pesat karena kekurangan predator katak",
      "Populasi ular akan berkurang drastis karena sumber mangsa katak menghilang",
      "Padi akan tumbuh sangat lambat karena kekurangan zat hara tanaman hias",
      "Populasi elang akan langsung bertambah padat karena ular bertambah banyak"
    ],
    correctAnswer: "B",
    isUsed: true,
    source: "AI Generated",
    studentPerformance: {
      timesAnswered: 45,
      averageScorePercent: 55
    }
  }
];

export const AiAsesmenModule: React.FC<AiAsesmenModuleProps> = ({ config, atpList }) => {
  const [activeSubTab, setActiveSubTab] = useState<"kisi" | "rubric" | "bank_soal">("bank_soal");

  // State: Dynamic Question Bank
  const [questionBank, setQuestionBank] = useState<QuestionItemWithMeta[]>(() => {
    const cached = localStorage.getItem("sg_question_bank");
    return cached ? JSON.parse(cached) : DEFAULT_BANK_SOAL;
  });

  // Sync Question Bank to localStorage
  useEffect(() => {
    localStorage.setItem("sg_question_bank", JSON.stringify(questionBank));
  }, [questionBank]);

  // State: Kisi-kisi Generator
  const [selectedTpForKisi, setSelectedTpForKisi] = useState<string>(atpList[0]?.code || "");
  const [examType, setExamType] = useState<"Sumatif Tengah Semester" | "Sumatif Akhir Semester" | "Harian">("Harian");
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [isGeneratingKisi, setIsGeneratingKisi] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<QuestionItem[]>([]);
  const [kisiError, setKisiError] = useState("");
  const [saveSuccessMessage, setSaveSuccessMessage] = useState("");

  // State: Rubric Generator
  const [selectedTpForRubric, setSelectedTpForRubric] = useState<string>(atpList[0]?.code || "");
  const [rubricTitle, setRubricTitle] = useState("Rubrik Penilaian Presentasi Kelompok");
  const [isGeneratingRubric, setIsGeneratingRubric] = useState(false);
  const [generatedRubric, setGeneratedRubric] = useState<AssessmentRubric | null>(null);
  const [rubricError, setRubricError] = useState("");

  // State: Manual Question Input Form
  const [showAddManualForm, setShowAddManualForm] = useState(false);
  const [newTpCode, setNewTpCode] = useState<string>(atpList[0]?.code || "");
  const [newTopic, setNewTopic] = useState("");
  const [newCognitiveLevel, setNewCognitiveLevel] = useState<"C1" | "C2" | "C3" | "C4" | "C5" | "C6" | "LOTS" | "HOTS">("C2");
  const [newQuestionText, setNewQuestionText] = useState("");
  const [newOptionA, setNewOptionA] = useState("");
  const [newOptionB, setNewOptionB] = useState("");
  const [newOptionC, setNewOptionC] = useState("");
  const [newOptionD, setNewOptionD] = useState("");
  const [newCorrectAnswer, setNewCorrectAnswer] = useState("A");

  // Filters for Question Bank view
  const [filterTp, setFilterTp] = useState("Semua");
  const [filterUsed, setFilterUsed] = useState("Semua");
  const [filterLevel, setFilterLevel] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");

  // Handler: Generate Kisi-Kisi & Questions from AI
  const handleGenerateKisiAndQuestions = async () => {
    if (!selectedTpForKisi) {
      setKisiError("Pilih Tujuan Pembelajaran (TP) terlebih dahulu.");
      return;
    }

    const currentTp = atpList.find(a => a.code === selectedTpForKisi);
    if (!currentTp) return;

    try {
      setIsGeneratingKisi(true);
      setKisiError("");
      setSaveSuccessMessage("");
      
      const response = await fetch("/api/generate/kisi-kisi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tpCode: currentTp.code,
          tpText: currentTp.tpText,
          examType: examType,
          questionCount: questionCount,
          subjectName: config.subject
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Gagal membangun kisi-kisi soal.");
      }

      const questionsList: QuestionItem[] = await response.json();
      setGeneratedQuestions(questionsList);

    } catch (err: any) {
      console.error(err);
      setKisiError(err.message || "Terdapat kegagalan server AI. Pastikan setelan token API benar.");
    } finally {
      setIsGeneratingKisi(false);
    }
  };

  // Save generated questions to Bank Soal
  const handleSaveToBankSoal = () => {
    if (generatedQuestions.length === 0) return;

    const formattedToBank: QuestionItemWithMeta[] = generatedQuestions.map(q => ({
      ...q,
      isUsed: false,
      source: "AI Generated",
      studentPerformance: {
        timesAnswered: 0,
        averageScorePercent: 0
      }
    }));

    // Deduplicate or append safely
    setQuestionBank(prev => {
      // Avoid exact question duplicates
      const filtered = formattedToBank.filter(newQ => !prev.some(oldQ => oldQ.questionText === newQ.questionText));
      return [...filtered, ...prev];
    });

    setSaveSuccessMessage(`Berhasil menyalin ${generatedQuestions.length} butir soal Kurikulum Merdeka ke dalam Bank Soal Dinamis Anda!`);
    setTimeout(() => setSaveSuccessMessage(""), 5000);
  };

  // Add Manual Question
  const handleAddManualQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.trim() || !newQuestionText.trim() || !newOptionA.trim() || !newOptionB.trim() || !newOptionC.trim() || !newOptionD.trim()) {
      alert("Harap mengisi seluruh kolom formulir butir soal dengan lengkap!");
      return;
    }

    const manualItem: QuestionItemWithMeta = {
      id: "MANUAL-" + Date.now(),
      tpCode: newTpCode,
      topic: newTopic,
      cognitiveLevel: newCognitiveLevel,
      questionText: newQuestionText,
      options: [newOptionA, newOptionB, newOptionC, newOptionD],
      correctAnswer: newCorrectAnswer,
      isUsed: false,
      source: "Manual Input",
      studentPerformance: {
        timesAnswered: 0,
        averageScorePercent: 0
      }
    };

    setQuestionBank(prev => [manualItem, ...prev]);
    setShowAddManualForm(false);
    
    // Reset Form
    setNewTopic("");
    setNewQuestionText("");
    setNewOptionA("");
    setNewOptionB("");
    setNewOptionC("");
    setNewOptionD("");
    setNewCorrectAnswer("A");

    // Temporarily trigger active tab flash
    setActiveSubTab("bank_soal");
  };

  // Toggle "isUsed"
  const toggleQuestionUsed = (id: string) => {
    setQuestionBank(prev => prev.map(q => q.id === id ? { ...q, isUsed: !q.isUsed } : q));
  };

  // Delete Question
  const deleteQuestion = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus butir soal ini dari Bank Soal?")) {
      setQuestionBank(prev => prev.filter(q => q.id !== id));
    }
  };

  // Simulates Throwing Question to Class to populate metrics
  const simulatePerformance = (id: string) => {
    setQuestionBank(prev => prev.map(q => {
      if (q.id === id) {
        const randomScore = Math.floor(Math.random() * 41) + 55; // 55% - 95%
        const addedTimes = Math.floor(Math.random() * 15) + 15; // 15 - 30 times
        
        const currentTimes = q.studentPerformance?.timesAnswered || 0;
        const currentAvg = q.studentPerformance?.averageScorePercent || 0;

        const newTimes = currentTimes + addedTimes;
        // Weighted average calculation
        const newAvg = Math.round(((currentAvg * currentTimes) + (randomScore * addedTimes)) / newTimes);

        return {
          ...q,
          isUsed: true,
          studentPerformance: {
            timesAnswered: newTimes,
            averageScorePercent: newAvg
          }
        };
      }
      return q;
    }));
  };

  const getDifficulty = (averagePercent: number) => {
    if (averagePercent === 0) return "Belum Ditotal";
    if (averagePercent < 65) return "Sukar";
    if (averagePercent > 85) return "Mudah";
    return "Sedang";
  };

  // Filter items in bank
  const filteredQuestionBank = questionBank.filter(q => {
    const matchesKeyword = q.questionText.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           q.topic.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTp = filterTp === "Semua" || q.tpCode === filterTp;
    const matchesUsed = filterUsed === "Semua" ? true : filterUsed === "Used" ? q.isUsed : !q.isUsed;
    const matchesLevel = filterLevel === "Semua" || q.cognitiveLevel === filterLevel;
    return matchesKeyword && matchesTp && matchesUsed && matchesLevel;
  });

  // Handler: Generate analytical performance Rubric
  const handleGenerateRubric = async () => {
    if (!selectedTpForRubric) {
      setRubricError("Pilih Tujuan Pembelajaran (TP) terlebih dahulu.");
      return;
    }

    try {
      setIsGeneratingRubric(true);
      setRubricError("");

      const response = await fetch("/api/generate/performance-rubric", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tpCode: selectedTpForRubric,
          tpText: atpList.find(a => a.code === selectedTpForRubric)?.tpText || "",
          rubricTitle: rubricTitle
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Gagal membangun rubrik analytical.");
      }

      const rubObject: AssessmentRubric = await response.json();
      setGeneratedRubric(rubObject);

    } catch (err: any) {
      console.error(err);
      setRubricError(err.message || "Kegagalan AI menyusun rubrik. Silakan cek koneksi.");
    } finally {
      setIsGeneratingRubric(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub tabs nav */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-2 gap-4">
        <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveSubTab("bank_soal")}
            className={`flex items-center px-4 py-1.5 rounded-md text-xs font-semibold transition ${
              activeSubTab === "bank_soal" ? "bg-white text-slate-800 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
            id="subtab-aiassess-bank"
          >
            <BarChart2 className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
            Bank Soal Dinamis
          </button>
          <button
            onClick={() => setActiveSubTab("kisi")}
            className={`flex items-center px-4 py-1.5 rounded-md text-xs font-semibold transition ${
              activeSubTab === "kisi" ? "bg-white text-slate-800 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
            id="subtab-aiassess-kisi"
          >
            <BookOpen className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
            Kisi-Kisi & Butir Soal
          </button>
          <button
            onClick={() => setActiveSubTab("rubric")}
            className={`flex items-center px-4 py-1.5 rounded-md text-xs font-semibold transition ${
              activeSubTab === "rubric" ? "bg-white text-slate-800 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
            id="subtab-aiassess-rubric"
          >
            <List className="w-3.5 h-3.5 mr-1.5 text-pink-500" />
            Rubrik Penilaian Kinerja
          </button>
        </div>
      </div>

      {/* Tab: Bank Soal Dinamis */}
      {activeSubTab === "bank_soal" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b pb-4 border-slate-100 gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 font-display">
                  <BarChart2 className="w-4 h-4 text-blue-600" />
                  Bank Soal Evaluasi Dinamis (Kurikulum Merdeka)
                </h3>
                <p className="text-xs text-slate-500 font-sans mt-0.5">Simpan draf evaluasi pintar, unggah soal mandiri, tandai penggunaan kelas, dan ketahui performa pemahaman siswa.</p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowAddManualForm(!showAddManualForm)}
                  className="flex items-center px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Buat Soal Manual
                </button>
              </div>
            </div>

            {/* Form: Add Manual Question */}
            {showAddManualForm && (
              <form onSubmit={handleAddManualQuestion} className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-12 flex items-center justify-between border-b pb-1.5">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <PlusCircle className="w-4 h-4 text-emerald-600" />
                    Input Evaluasi Manual Pengampu
                  </span>
                  <button type="button" onClick={() => setShowAddManualForm(false)} className="text-xs text-slate-400 font-bold hover:text-slate-600">Batal</button>
                </div>

                <div className="md:col-span-3">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Cakupan TP</label>
                  <select
                    value={newTpCode}
                    onChange={e => setNewTpCode(e.target.value)}
                    className="w-full text-xs p-2 border rounded-lg bg-white"
                  >
                    {atpList.map(a => (
                      <option key={a.id} value={a.code}>{a.code} - {a.tpText.slice(0, 30)}...</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-5">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Sub Topik Pembahasan</label>
                  <input
                    type="text"
                    value={newTopic}
                    onChange={e => setNewTopic(e.target.value)}
                    className="w-full text-xs p-2 border rounded-lg bg-white"
                    placeholder="Misal: Perubahan wujud cair ke gas"
                    required
                  />
                </div>

                <div className="md:col-span-4">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Level Kognitif</label>
                  <select
                    value={newCognitiveLevel}
                    onChange={e => setNewCognitiveLevel(e.target.value as any)}
                    className="w-full text-xs p-2 border rounded-lg bg-white"
                  >
                    <option value="C1">C1 - Mengingat (Retrieve)</option>
                    <option value="C2">C2 - Memahami (Understand)</option>
                    <option value="C3">C3 - Menerapkan (Apply)</option>
                    <option value="C4">C4 - Menganalisis (Analyze)</option>
                    <option value="C5">C5 - Mengevaluasi (Evaluate)</option>
                    <option value="C6">C6 - Mencipta (Create)</option>
                    <option value="LOTS">LOTS - Klasik</option>
                    <option value="HOTS">HOTS - Analisis Logika</option>
                  </select>
                </div>

                <div className="md:col-span-12 col-span-1">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Butir Kalimat Pertanyaan (Stimulus)</label>
                  <textarea
                    value={newQuestionText}
                    onChange={e => setNewQuestionText(e.target.value)}
                    rows={3}
                    className="w-full text-xs p-2.5 border rounded-lg bg-white leading-relaxed font-sans"
                    placeholder="Tuliskan kalimat stimulus berbasis literasi murid disini..."
                    required
                  />
                </div>

                <div className="md:col-span-6">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Opsi Pilihan A</label>
                  <input type="text" value={newOptionA} onChange={e => setNewOptionA(e.target.value)} className="w-full text-xs p-2 border rounded-lg bg-white" placeholder="Opsi A" required />
                </div>
                <div className="md:col-span-6">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Opsi Pilihan B</label>
                  <input type="text" value={newOptionB} onChange={e => setNewOptionB(e.target.value)} className="w-full text-xs p-2 border rounded-lg bg-white" placeholder="Opsi B" required />
                </div>
                <div className="md:col-span-6">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Opsi Pilihan C</label>
                  <input type="text" value={newOptionC} onChange={e => setNewOptionC(e.target.value)} className="w-full text-xs p-2 border rounded-lg bg-white" placeholder="Opsi C" required />
                </div>
                <div className="md:col-span-6">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Opsi Pilihan D</label>
                  <input type="text" value={newOptionD} onChange={e => setNewOptionD(e.target.value)} className="w-full text-xs p-2 border rounded-lg bg-white" placeholder="Opsi D" required />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Kunci Jawaban Benar</label>
                  <select value={newCorrectAnswer} onChange={e => setNewCorrectAnswer(e.target.value)} className="w-full text-xs p-2 border rounded-lg bg-white font-mono font-bold text-emerald-800">
                    <option value="A">Opsi A</option>
                    <option value="B">Opsi B</option>
                    <option value="C">Opsi C</option>
                    <option value="D">Opsi D</option>
                  </select>
                </div>

                <div className="md:col-span-9 flex items-end justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg text-xs transition"
                  >
                    Simpan Butir Evaluasi
                  </button>
                </div>
              </form>
            )}

            {/* Filter controls */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Cari butir soal / topik..."
                    className="pl-8 pr-2.5 py-1.5 text-xs bg-white rounded-lg border w-44"
                  />
                </div>

                <div>
                  <span className="text-slate-500 mr-1.5 font-bold">TP:</span>
                  <select value={filterTp} onChange={e => setFilterTp(e.target.value)} className="px-2 py-1 bg-white border rounded-lg text-xs">
                    <option value="Semua">Semua TP</option>
                    {Array.from(new Set(questionBank.map(q => q.tpCode))).map(code => (
                      <option key={code} value={code}>{code}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <span className="text-slate-500 mr-1.5 font-bold">Tingkat:</span>
                  <select value={filterLevel} onChange={e => setFilterLevel(e.target.value)} className="px-2 py-1 bg-white border rounded-lg text-xs font-mono">
                    <option value="Semua">Semua Level</option>
                    <option value="C1">C1</option>
                    <option value="C2">C2</option>
                    <option value="C3">C3</option>
                    <option value="C4">C4</option>
                    <option value="C5">C5</option>
                    <option value="C6">C6</option>
                    <option value="LOTS">LOTS</option>
                    <option value="HOTS">HOTS</option>
                  </select>
                </div>

                <div>
                  <span className="text-slate-500 mr-1.5 font-bold">Status:</span>
                  <select value={filterUsed} onChange={e => setFilterUsed(e.target.value)} className="px-2 py-1 bg-white border rounded-lg text-xs">
                    <option value="Semua">Semua Status</option>
                    <option value="Used">Pernah Digunakan</option>
                    <option value="Unused">Belum Digunakan</option>
                  </select>
                </div>
              </div>

              <div className="text-slate-500 font-bold">
                Ditemukan: <span className="text-slate-900 font-mono font-black">{filteredQuestionBank.length}</span> / {questionBank.length} Soal
              </div>
            </div>

            {/* Questions list display */}
            <div className="space-y-3.5 max-h-[600px] overflow-y-auto">
              {filteredQuestionBank.map((q) => {
                const diffLevel = getDifficulty(q.studentPerformance?.averageScorePercent || 0);

                return (
                  <div key={q.id} className="border border-slate-205 rounded-xl p-4 bg-white hover:shadow-xs hover:border-slate-350 transition flex flex-col md:flex-row md:items-start md:space-x-4 max-w-full relative overflow-hidden group">
                    
                    {/* Source badge indicator */}
                    <div className="absolute top-0 right-0 p-1">
                      <span className={`text-[8px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded ${
                        q.source === "AI Generated" ? "bg-blue-50 text-blue-800" : "bg-teal-50 text-teal-800"
                      }`}>
                        {q.source}
                      </span>
                    </div>

                    {/* Checkbox indicator of Used status */}
                    <div className="flex flex-col items-center space-y-1.5 mt-1 select-none flex-shrink-0 border-r pr-3 border-slate-100">
                      <button
                        onClick={() => toggleQuestionUsed(q.id)}
                        title="Tandai Sudah Digunakan"
                        className={`w-6 h-6 rounded-md flex items-center justify-center border transition ${
                          q.isUsed 
                            ? "bg-emerald-50 border-emerald-300 text-emerald-800" 
                            : "bg-slate-50 border-slate-200 text-slate-300 hover:text-slate-650"
                        }`}
                      >
                        <Check className={`w-4 h-4 transition ${q.isUsed ? "scale-105 stroke-[3px]" : "scale-0"}`} />
                      </button>
                      <span className="text-[9px] font-black tracking-wider uppercase text-slate-400">Used</span>
                    </div>

                    {/* Question Content */}
                    <div className="space-y-2 mt-2 md:mt-0 flex-grow">
                      {/* Meta titles */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="bg-slate-100 text-slate-800 font-mono font-black px-2 py-0.5 rounded text-[9px] tracking-widest">{q.tpCode}</span>
                        <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[9px] font-bold">{q.topic}</span>
                        <span className="bg-zinc-900 text-slate-100 px-2 py-0.5 rounded font-mono font-black text-[9px] tracking-wider">LEVEL {q.cognitiveLevel}</span>
                        {q.isUsed ? (
                          <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded text-[8px] font-black flex items-center gap-0.5">
                            <ShieldCheck className="w-3 h-3 text-emerald-700" />
                            PERNAH DIGUNAKAN
                          </span>
                        ) : (
                          <span className="bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded text-[8px] font-bold">SEDANG TERSEDIA (BELUM PAKAI)</span>
                        )}
                      </div>

                      {/* Question Text */}
                      <p className="text-xs font-bold text-slate-850 font-sans leading-relaxed">{q.questionText}</p>

                      {/* Options */}
                      {q.options && q.options.length === 4 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium text-slate-600 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                          <div className={q.correctAnswer === "A" ? "text-emerald-800 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded" : "flex items-center gap-1 pl-2 font-medium"}>
                            <span className="font-bold text-[11px] font-mono">A.</span> {q.options[0]}
                            {q.correctAnswer === "A" && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                          </div>
                          <div className={q.correctAnswer === "B" ? "text-emerald-800 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded" : "flex items-center gap-1 pl-2 font-medium"}>
                            <span className="font-bold text-[11px] font-mono">B.</span> {q.options[1]}
                            {q.correctAnswer === "B" && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                          </div>
                          <div className={q.correctAnswer === "C" ? "text-emerald-800 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded" : "flex items-center gap-1 pl-2 font-medium"}>
                            <span className="font-bold text-[11px] font-mono">C.</span> {q.options[2]}
                            {q.correctAnswer === "C" && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                          </div>
                          <div className={q.correctAnswer === "D" ? "text-emerald-800 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded" : "flex items-center gap-1 pl-2 font-medium"}>
                            <span className="font-bold text-[11px] font-mono">D.</span> {q.options[3]}
                            {q.correctAnswer === "D" && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-between border-t border-slate-100 pt-2 gap-2">
                        <span className="text-[10px] text-slate-500 font-sans">
                          Kunci Jawaban Siswa: <span className="bg-emerald-100 text-emerald-900 border border-emerald-200 px-1.5 py-0.5 rounded font-mono font-black">{q.correctAnswer}</span>
                        </span>

                        {/* Student Performance Tracker */}
                        <div className="flex items-center space-x-4 bg-slate-50 px-3 py-1 rounded-lg border">
                          <div className="text-[10px] font-sans">
                            <span className="text-slate-400 font-medium">Pengujian: </span>
                            <span className="text-slate-800 font-extrabold font-mono">{q.studentPerformance?.timesAnswered || 0} Kali</span>
                          </div>

                          <div className="flex items-center gap-1 text-[10px] font-sans">
                            <span className="text-slate-400 font-medium">Akurasi: </span>
                            <span className={`font-black font-mono ${
                              (q.studentPerformance?.averageScorePercent || 0) < 65 ? "text-red-700" :
                              (q.studentPerformance?.averageScorePercent || 0) > 85 ? "text-emerald-700" : "text-amber-700"
                            }`}>
                              {q.studentPerformance?.averageScorePercent || 0}% Benar
                            </span>
                          </div>

                          <div className="flex items-center gap-1 text-[10px] font-sans">
                            <span className="text-slate-400 font-medium">Kesulitan: </span>
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase text-white tracking-wider ${
                              diffLevel === "Sukar" ? "bg-red-500 text-white" :
                              diffLevel === "Sedang" ? "bg-amber-500 text-white" :
                              diffLevel === "Mudah" ? "bg-emerald-500 text-white" : "bg-slate-400"
                            }`}>
                              {diffLevel}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions Side */}
                    <div className="mt-3 md:mt-0 flex md:flex-col items-center justify-end space-x-2 md:space-x-0 md:space-y-1.5 flex-shrink-0 border-l pl-3 border-slate-100 select-none self-stretch">
                      <button
                        onClick={() => simulatePerformance(q.id)}
                        className="flex items-center justify-center p-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition text-[10px] font-bold gap-1 w-full"
                        title="Simulasikan pelemparan butir soal ini ke 24 siswa secara acak untuk menguji performa."
                      >
                        <Play className="w-3.5 h-3.5" />
                        Uji Kelas
                      </button>
                      <button
                        onClick={() => deleteQuestion(q.id)}
                        className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                        title="Hapus dari bank"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                );
              })}

              {filteredQuestionBank.length === 0 && (
                <div className="p-10 border-2 border-dashed rounded-xl border-slate-200 text-center text-slate-400">
                  <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <span className="font-bold text-slate-650 text-xs block">Tidak ada evaluasi yang sesuai kriteria penapisan.</span>
                  <p className="text-[11px] max-w-sm mx-auto mt-0.5">Ubah kata kunci pencarian, ganti filter TP, atau buat butir soal manual buatan sendiri menggunakan tombol hijau di atas.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Screen 1: Kisi-Kisi Maker */}
      {activeSubTab === "kisi" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left config form panel */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-display">Generator Butir Soal Evaluasi</h3>
              <p className="text-xs text-slate-500">Membangun soal evaluasi berbasis LOTS hingga tantangan logika HOTS.</p>
            </div>

            {/* Select TP */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Pilih Cakupan Materi TP</label>
              <select
                value={selectedTpForKisi}
                onChange={e => setSelectedTpForKisi(e.target.value)}
                className="w-full text-xs border rounded-lg p-2.5 focus:ring-1 focus:ring-emerald-500 bg-white font-semibold text-slate-800"
              >
                <option value="">-- Silakan Pilih --</option>
                {atpList.map(a => (
                  <option key={a.id} value={a.code}>{a.code} - {a.tpText}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Jenis Evaluasi</label>
                <select
                  value={examType}
                  onChange={e => setExamType(e.target.value as any)}
                  className="w-full text-xs border rounded-lg p-2.5 bg-white font-medium text-slate-850"
                >
                  <option value="Harian">Formatif Harian</option>
                  <option value="Sumatif Tengah Semester">Sumatif Tengah Semester (UTS)</option>
                  <option value="Sumatif Akhir Semester">Sumatif Akhir Semester (UAS)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Jumlah Soal</label>
                <select
                  value={questionCount}
                  onChange={e => setQuestionCount(parseInt(e.target.value))}
                  className="w-full text-xs border rounded-lg p-2.5 bg-white font-mono font-semibold"
                >
                  <option value={3}>3 Butir</option>
                  <option value={5}>5 Butir</option>
                  <option value={10}>10 Butir</option>
                </select>
              </div>
            </div>

            {/* Click to run */}
            <button
              onClick={handleGenerateKisiAndQuestions}
              disabled={isGeneratingKisi || !selectedTpForKisi}
              className="w-full flex items-center justify-center py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition disabled:opacity-50 text-[11px]"
              id="btn-do-generate-kisi"
            >
              <Sparkles className="w-4 h-4 mr-1.5 animate-bounce" />
              {isGeneratingKisi ? "Merumuskan Soal..." : "AI Bangun Kisi-Kisi & Soal"}
            </button>

            {isGeneratingKisi && (
              <div className="p-3 bg-slate-50 rounded-lg border text-[11px] text-slate-650 space-y-1 text-center font-sans">
                <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto pb-1"></div>
                <span className="font-semibold block animate-pulse">Menghitung taksonomi kognitif Bloom...</span>
              </div>
            )}

            {kisiError && (
              <div className="p-3 bg-red-50 text-red-800 text-[11px] rounded-lg border border-red-100 font-sans">
                <strong>Gagal:</strong> {kisiError}
              </div>
            )}

            {/* Save to Bank button inside Generator */}
            {generatedQuestions.length > 0 && (
              <div className="border-t pt-3.5 space-y-2">
                <button
                  onClick={handleSaveToBankSoal}
                  className="w-full flex items-center justify-center py-2 border bg-blue-50 border-blue-200 text-blue-800 font-bold hover:bg-blue-105 rounded-lg text-xs transition"
                >
                  <PlusCircle className="w-4 h-4 mr-1.5" />
                  Simpan Soal ke Bank Soal
                </button>
                {saveSuccessMessage && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-100 text-[10.5px] text-emerald-850 rounded-lg animate-pulse font-medium">
                    {saveSuccessMessage}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right report view panel */}
          <div className="lg:col-span-8 space-y-4">
            {generatedQuestions.length > 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6 max-h-[750px] overflow-y-auto">
                <div className="flex items-center justify-between border-b pb-3 sticky top-0 bg-white z-10 select-none">
                  <span className="text-xs bg-slate-100 text-slate-800 px-2 py-1 rounded font-bold font-mono">
                    MATERI-KODE: {selectedTpForKisi}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        window.print();
                      }}
                      className="flex items-center px-2.5 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-bold text-slate-700 transition"
                    >
                      <Printer className="w-3.5 h-3.5 mr-1" />
                      Cetak Lembar Soal
                    </button>
                  </div>
                </div>

                {/* Cover Kop */}
                <HeaderKop config={config} documentTitle={`KISI-KISI & LEMBAR BUTIR SOAL (${examType})`} />

                {/* Sub-A: Blueprints table (Kisi-kisi formal) */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 pl-2 border-l-2 border-slate-700">
                    BAGIAN A: TABEL KISI-KISI INSTRUMEN EVALUASI
                  </h3>
                  <div className="overflow-x-auto border rounded-xl border-slate-200 pl-2">
                    <table className="min-w-full text-[11px] text-left text-slate-600">
                      <thead className="bg-slate-50 font-bold text-slate-800">
                        <tr>
                          <th className="px-3 py-2 w-12 text-center">No</th>
                          <th className="px-3 py-2 w-28">Sub-Bahasan Topic</th>
                          <th className="px-3 py-2 w-20 text-center">Tingkat Kognitif</th>
                          <th className="px-3 py-2">Indikator Soal & Stimulus</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y bg-white">
                        {generatedQuestions.map((q, idx) => (
                          <tr key={q.id}>
                            <td className="px-3 py-2 text-center font-bold font-mono text-slate-400">{idx + 1}</td>
                            <td className="px-3 py-2 font-semibold text-slate-800">{q.topic}</td>
                            <td className="px-3 py-2 text-center"><span className="bg-slate-100 text-slate-900 px-2 py-0.5 rounded font-bold font-mono">{q.cognitiveLevel}</span></td>
                            <td className="px-3 py-2 text-slate-600 leading-relaxed max-w-xs truncate" title={q.questionText}>Mampu merespon stimulus analisis {q.topic.toLowerCase()} dengan model Pilihan Ganda.</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Sub-B: Lembar Soal Siswa (Printable sheet) */}
                <div className="space-y-4 pt-4 border-t border-slate-200">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 pl-2 border-l-2 border-slate-700">
                    BAGIAN B: LEMBAR SOAL EVALUASI SISWA (MULTI-PILIHAN)
                  </h3>
                  
                  <div className="text-[12px] text-slate-900 space-y-6 pl-2 leading-relaxed select-text">
                    {generatedQuestions.map((q, idx) => (
                      <div key={q.id} className="space-y-2">
                        <p className="font-bold">
                          {idx + 1}. {q.questionText}
                        </p>
                        {q.options && q.options.length === 4 && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-4 text-xs font-medium text-slate-700">
                            <div>A. {q.options[0]}</div>
                            <div>B. {q.options[1]}</div>
                            <div>C. {q.options[2]}</div>
                            <div>D. {q.options[3]}</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sub-C: Kunci Jawaban Resmi */}
                <div className="pt-4 border-t border-dashed border-slate-200 bg-slate-50 p-4 rounded-xl">
                  <span className="text-[9px] font-bold tracking-widest uppercase text-slate-500 block mb-2">Kunci Jawaban Resmi Pendidik</span>
                  <div className="grid grid-cols-5 gap-3 text-xs pl-2">
                    {generatedQuestions.map((q, idx) => (
                      <div key={q.id} className="font-semibold text-slate-850">
                        <span className="text-slate-405 font-mono">{idx + 1}.</span> Kunci: <span className="text-emerald-700 font-mono font-extrabold">{q.correctAnswer}</span>
                        <div className="text-[8px] text-slate-400 font-medium truncate" title={q.topic}>{q.topic}</div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-12 text-center h-[500px] flex flex-col items-center justify-center space-y-3 text-slate-400">
                <FileText className="w-12 h-12 text-slate-300" />
                <h3 className="text-sm font-bold text-slate-650">Dokumen Ujian Belum Dibuat</h3>
                <p className="text-xs max-w-sm">Tentukan cakupan materi TP di sebelah kiri, tentukan kuota sebaran jumlah soal kognitif, kemudian klik tombol AI untuk membangun draf lembar ujian siap cetak.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Screen 2: Perfomance Rubric Maker */}
      {activeSubTab === "rubric" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left panel */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-display">Analitis Rubrik Penilaian</h3>
              <p className="text-xs text-slate-500">Membantu guru mengukur kemampuan psikomotorik / afektif murid lewat rubrik deskriptif.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Pilih Cakupan Materi TP</label>
              <select
                value={selectedTpForRubric}
                onChange={e => setSelectedTpForRubric(e.target.value)}
                className="w-full text-xs border rounded-lg p-2.5 focus:ring-1 focus:ring-emerald-500 bg-white font-semibold text-slate-800"
              >
                <option value="">-- Silakan Pilih --</option>
                {atpList.map(a => (
                  <option key={a.id} value={a.code}>{a.code} - {a.tpText}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Judul / Kegiatan Asesmen Performa</label>
              <input
                type="text"
                value={rubricTitle}
                onChange={e => setRubricTitle(e.target.value)}
                className="w-full text-xs p-2.5 border rounded-lg bg-white font-medium text-slate-800 text-[11px]"
                placeholder="Misal: Proyek Kelompok Siklus Hidup"
                required
              />
            </div>

            {/* Do build */}
            <button
              onClick={handleGenerateRubric}
              disabled={isGeneratingRubric || !selectedTpForRubric}
              className="w-full flex items-center justify-center py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition disabled:opacity-50 text-[11px]"
              id="btn-do-generate-rubric"
            >
              <Sparkles className="w-4 h-4 mr-1.5 animate-bounce" />
              {isGeneratingRubric ? "Menyusun kriteria..." : "AI Bangun Rubrik Deskriptif"}
            </button>

            {isGeneratingRubric && (
              <div className="p-3 bg-slate-50 rounded-lg border text-[11px] text-slate-650 space-y-1 text-center font-sans font-medium">
                <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto pb-1 font-mono"></div>
                <span className="font-semibold block animate-pulse">Merumuskan performa deskriptor analitis...</span>
              </div>
            )}

            {rubricError && (
              <div className="p-3 bg-red-50 text-red-800 text-[11px] rounded-lg border border-red-100 font-sans">
                <strong>Gagal:</strong> {rubricError}
              </div>
            )}
          </div>

          {/* Right report panel */}
          <div className="lg:col-span-8 space-y-4">
            {generatedRubric ? (
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6 max-h-[750px] overflow-y-auto">
                <div className="flex items-center justify-between border-b pb-3 sticky top-0 bg-white z-10 select-none">
                  <span className="text-xs bg-slate-100 text-slate-800 px-2 py-1 rounded font-bold font-mono">
                    RUBRIC-TP: {selectedTpForRubric}
                  </span>
                  <button
                    onClick={() => {
                      window.print();
                    }}
                    className="flex items-center px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-xs font-bold text-white transition shadow-sm"
                  >
                    <Printer className="w-3.5 h-3.5 mr-1" />
                    Cetak Rubrik
                  </button>
                </div>

                {/* cover Kop */}
                <HeaderKop config={config} documentTitle={`DRAF RUBRIK EVALUASI KINERJA ANALITIS`} />

                <div className="space-y-4 border-t pt-4 font-sans select-text leading-relaxed">
                  <div className="p-3.5 bg-zinc-50 border border-slate-200 rounded-xl leading-relaxed text-xs">
                    <span className="font-bold text-slate-900">Deskripsi Aktivitas Evaluasi:</span>
                    <p className="mt-1 text-slate-755 font-medium">Asesmen unjuk kerja unjuk rasa dari murid bertajuk <strong>&ldquo; {generatedRubric.title} &rdquo;</strong>. Guru mengevaluasi aspek keterampilan sosial, presentasi kognitif, atau orisinalitas proyek berdasarkan instrumen deskriptor kualitas di bawah.</p>
                  </div>

                  {/* Criteria Grid matrix */}
                  <div className="overflow-x-auto border border-slate-205 rounded-xl">
                    <table className="min-w-full text-[10.5px] text-left text-slate-600 divide-y divide-slate-200">
                      <thead className="bg-slate-50 font-bold text-slate-700 select-none">
                        <tr className="divide-x">
                          <th className="px-3 py-2 text-left w-32">Kriteria Aspek</th>
                          <th className="px-3 py-2 text-center w-28 bg-emerald-50 text-emerald-950">Sangat Baik [4]</th>
                          <th className="px-3 py-2 text-center w-28 bg-teal-50 text-teal-950 font-bold">Baik [3]</th>
                          <th className="px-3 py-2 text-center w-28 bg-blue-50 text-blue-950">Cukup [2]</th>
                          <th className="px-3 py-2 text-center w-28 bg-amber-50 text-amber-950">Perlu Bimbingan [1]</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200 font-medium">
                        {generatedRubric.criteria?.map(crit => (
                          <tr key={crit.id} className="divide-x">
                            <td className="px-3 py-3 font-bold text-slate-905 bg-slate-50/50">{crit.name}</td>
                            <td className="px-3 py-3 text-slate-600 bg-emerald-50/10 leading-relaxed text-[10px]">{crit.sangatBaik}</td>
                            <td className="px-3 py-3 text-slate-600 bg-teal-50/10 leading-relaxed text-[10px]">{crit.baik}</td>
                            <td className="px-3 py-3 text-slate-600 bg-blue-50/10 leading-relaxed text-[10px]">{crit.cukup}</td>
                            <td className="px-3 py-3 text-slate-600 bg-amber-50/10 leading-relaxed text-[10px]">{crit.perluBimbingan}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            ) : (
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-12 text-center h-[500px] flex flex-col items-center justify-center space-y-3 text-slate-400">
                <List className="w-12 h-12 text-slate-300" />
                <h3 className="text-sm font-bold text-slate-650">Rubrik Kinerja Belum Dibentuk</h3>
                <p className="text-xs max-w-sm">Dapatkan draf matriks instrumen evaluasi performa seperti presentasi, proyek, portfolio, atau kegiatan P5 dengan mendefinisikan TP dan judul evaluasi di panel kiri.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
