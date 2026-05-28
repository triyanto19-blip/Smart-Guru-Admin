import React, { useState, useRef, useEffect } from "react";
import { SchoolConfig } from "../types";
import { 
  Building, User, ShieldAlert, Image as ImageIcon, CheckCircle2, 
  Trash2, FileSignature, Sparkles, Upload, Eraser, Type, Edit2
} from "lucide-react";

interface SettingsModuleProps {
  config: SchoolConfig;
  setConfig: React.Dispatch<React.SetStateAction<SchoolConfig>>;
}

export const SettingsModule: React.FC<SettingsModuleProps> = ({ config, setConfig }) => {
  // Main settings state
  const [schoolName, setSchoolName] = useState(config.schoolName || "");
  const [schoolAddress, setSchoolAddress] = useState(config.schoolAddress || "");
  const [teacherName, setTeacherName] = useState(config.teacherName || "");
  const [teacherNip, setTeacherNip] = useState(config.teacherNip || "");
  const [headmasterName, setHeadmasterName] = useState(config.headmasterName || "");
  const [headmasterNip, setHeadmasterNip] = useState(config.headmasterNip || "");
  const [schoolLogo, setSchoolLogo] = useState(config.schoolLogo || "");

  // Signature active tabs / modes
  const [teacherSigType, setTeacherSigType] = useState<"upload" | "text" | "canvas">(
    config.teacherSignatureType === "upload" ? "upload" : "text"
  );
  const [headmasterSigType, setHeadmasterSigType] = useState<"upload" | "text" | "canvas">(
    config.headmasterSignatureType === "upload" ? "upload" : "text"
  );

  // Direct Input (text type) signatures
  const [teacherSigText, setTeacherSigText] = useState(config.teacherSignatureType === "text" ? (config.teacherSignatureData || "") : config.teacherName);
  const [headmasterSigText, setHeadmasterSigText] = useState(config.headmasterSignatureType === "text" ? (config.headmasterSignatureData || "") : config.headmasterName);

  // Font selections for text signature
  const [teacherSigFont, setTeacherSigFont] = useState<string>("font-cursive-1");
  const [headmasterSigFont, setHeadmasterSigFont] = useState<string>("font-cursive-2");

  // Temporary container for logo/uploaded signals
  const [successMsg, setSuccessMsg] = useState("");

  // HTML5 Canvas variables for direct hand-drawing signature
  const teacherCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const headmasterCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawingTeacher, setIsDrawingTeacher] = useState(false);
  const [isDrawingHeadmaster, setIsDrawingHeadmaster] = useState(false);

  // Logo Presets (lovely educational crests so users can play easily)
  const logoPresets = [
    { name: "Tut Wuri Handayani Silhouette", emoji: "🎓", color: "bg-blue-100 text-blue-800" },
    { name: "Pendidikan Klasik", emoji: "🏫", color: "bg-emerald-100 text-emerald-800" },
    { name: "Buku Pelita Pengetahuan", emoji: "📖", color: "bg-indigo-100 text-indigo-800" },
    { name: "Bintang Prestasi", emoji: "⭐", color: "bg-amber-100 text-amber-800" },
    { name: "Sains & Teknologi", emoji: "🔬", color: "bg-sky-100 text-sky-800" }
  ];

  // Helper: Convert file to Base64
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran berkas logo terlalu besar. Maksimal adalah 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setSchoolLogo(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>, isTeacher: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        if (isTeacher) {
          setConfig(prev => ({
            ...prev,
            teacherSignatureType: "upload",
            teacherSignatureData: reader.result as string
          }));
        } else {
          setConfig(prev => ({
            ...prev,
            headmasterSignatureType: "upload",
            headmasterSignatureData: reader.result as string
          }));
        }
        showNotification("Tanda tangan berhasil diunggah!");
      }
    };
    reader.readAsDataURL(file);
  };

  const showNotification = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => {
      setSuccessMsg("");
    }, 3500);
  };

  // Canvas Drawing Handlers - Teacher
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  const startDrawTeacher = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = teacherCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = "#1e3a8a"; // Deep navy blue ink
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const coords = getCoordinates(e, canvas);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    setIsDrawingTeacher(true);
  };

  const drawTeacher = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingTeacher) return;
    e.preventDefault();
    const canvas = teacherCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const coords = getCoordinates(e, canvas);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawTeacher = () => {
    setIsDrawingTeacher(false);
  };

  const clearTeacherCanvas = () => {
    const canvas = teacherCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveTeacherCanvas = () => {
    const canvas = teacherCanvasRef.current;
    if (!canvas) return;
    
    // Check if empty by reading image data
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const buffer = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const allBlank = !buffer.data.some(channel => channel !== 0);
    
    if (allBlank) {
      alert("Tanda tangan kosong! Gambar coretan terlebih dahulu sebelum menyimpan.");
      return;
    }

    const dataUrl = canvas.toDataURL("image/png");
    setConfig(prev => ({
      ...prev,
      teacherSignatureType: "upload",
      teacherSignatureData: dataUrl
    }));
    showNotification("Coretan tanda tangan guru berhasil disimpan!");
  };

  // Canvas Drawing Handlers - Headmaster
  const startDrawHeadmaster = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = headmasterCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = "#0f172a"; // Ink color dark slate
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const coords = getCoordinates(e, canvas);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    setIsDrawingHeadmaster(true);
  };

  const drawHeadmaster = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingHeadmaster) return;
    e.preventDefault();
    const canvas = headmasterCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const coords = getCoordinates(e, canvas);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawHeadmaster = () => {
    setIsDrawingHeadmaster(false);
  };

  const clearHeadmasterCanvas = () => {
    const canvas = headmasterCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveHeadmasterCanvas = () => {
    const canvas = headmasterCanvasRef.current;
    if (!canvas) return;
    
    // Check if empty
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const buffer = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const allBlank = !buffer.data.some(channel => channel !== 0);
    
    if (allBlank) {
      alert("Tanda tangan kosong! Gambar coretan terlebih dahulu.");
      return;
    }

    const dataUrl = canvas.toDataURL("image/png");
    setConfig(prev => ({
      ...prev,
      headmasterSignatureType: "upload",
      headmasterSignatureData: dataUrl
    }));
    showNotification("Coretan tanda tangan kepala sekolah berhasil disimpan!");
  };

  // Save text based signature (using Cursive font engine)
  const saveTextSignature = (isTeacher: boolean) => {
    if (isTeacher) {
      if (!teacherSigText.trim()) {
        alert("Masukkan teks/nama terlebih dahulu.");
        return;
      }
      setConfig(prev => ({
        ...prev,
        teacherSignatureType: "text",
        teacherSignatureData: teacherSigText
      }));
      showNotification("Nama tanda tangan guru berhasil disimpan!");
    } else {
      if (!headmasterSigText.trim()) {
        alert("Masukkan nama terlebih dahulu.");
        return;
      }
      setConfig(prev => ({
        ...prev,
        headmasterSignatureType: "text",
        headmasterSignatureData: headmasterSigText
      }));
      showNotification("Nama tanda tangan kepala sekolah berhasil disimpan!");
    }
  };

  // Global Save of core settings
  const handleSaveCoreSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolName.trim()) {
      alert("Nama sekolah wajib diisi!");
      return;
    }

    setConfig(prev => ({
      ...prev,
      schoolName: schoolName.trim(),
      schoolAddress: schoolAddress.trim(),
      teacherName: teacherName.trim(),
      teacherNip: teacherNip.trim(),
      headmasterName: headmasterName.trim(),
      headmasterNip: headmasterNip.trim(),
      schoolLogo: schoolLogo
    }));

    showNotification("Profil sekolah dan identitas guru berhasil disimpan!");
  };

  // Emoji Preset Selections
  const handleSelectPresetLogo = (emoji: string) => {
    // Generate simple logo with emojis or svg as dataUrl or store emoji itself
    // Let's create an elegant temporary canvas to compile emoji to a high-res circle badge PNG so it looks like a real logo on the documents!
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Draw background circle
      ctx.fillStyle = "#edf2f7";
      ctx.beginPath();
      ctx.arc(128, 128, 116, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw accent border
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(128, 128, 116, 0, Math.PI * 2);
      ctx.stroke();

      // Draw Emoji
      ctx.font = "120px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(emoji, 128, 132);

      setSchoolLogo(canvas.toDataURL("image/png"));
      showNotification(`Logo Sekolah diganti ke ikon preset ${emoji}!`);
    }
  };

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto pb-12">
      
      {/* Alert Notification */}
      {successMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 border border-slate-800 text-white font-semibold text-xs px-5 py-3 rounded-xl shadow-2xl flex items-center space-x-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Header Panel */}
      <div className="bg-[#0f172a] rounded-2xl p-6 text-white flex items-center justify-between shadow-md border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-blue-400">
            <Building className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Pengaturan Utama Dokumen</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black font-display tracking-tight">Setelan Profil & Legalitas</h1>
          <p className="text-xs text-slate-300 max-w-2xl">
            Sunting nama sekolah, alamat, detail guru/mata pelajaran, unggah logo, dan simpan tanda tangan digital untuk penyusunan rekap laporan presensi, mengajar, dan buku kasus.
          </p>
        </div>
        <div className="hidden md:block">
          <span className="text-6xl select-none">⚙️</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT PANEL: Core Text Forms & School Logo (8 cols on desktop) */}
        <form onSubmit={handleSaveCoreSettings} className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center">
                <Building className="w-4.5 h-4.5 mr-2 text-blue-600" />
                I. Lembaga Sekolah & Instansi
              </h2>
              <p className="text-[11px] text-slate-500">Sesuaikan data formal instansi sekolah tempat Anda bernaung.</p>
            </div>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 px-4 rounded-xl shadow-sm transition duration-150 cursor-pointer flex items-center"
            >
              Simpan Profil
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            
            {/* School Name */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Nama Lembaga / Sekolah</label>
              <input
                type="text"
                required
                value={schoolName}
                onChange={e => setSchoolName(e.target.value)}
                className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-bold text-slate-800"
                placeholder="Misal: SD Negeri Merdeka Jaya Jakarta"
              />
            </div>

            {/* School Address */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Alamat Lengkap Sekolah</label>
              <textarea
                value={schoolAddress}
                onChange={e => setSchoolAddress(e.target.value)}
                rows={2}
                className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none leading-relaxed text-slate-800 font-medium"
                placeholder="Misal: Jl. Pendidikan Raya No. 45, Kecamatan Gambir, Jakarta Pusat, DKI Jakarta • Telepon: (021) 555-0123"
              />
            </div>

            {/* School Logo Section */}
            <div className="space-y-2 border-t border-slate-100 pt-4">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Logo Instansi Sekolah</label>
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
                {/* Logo Preview */}
                <div className="md:col-span-3 flex justify-center">
                  {schoolLogo ? (
                    <div className="relative group">
                      <img 
                        src={schoolLogo} 
                        alt="Logo Sekolah" 
                        className="w-20 h-20 bg-white object-contain p-1 border-2 border-slate-300 rounded-xl shadow-xs" 
                        referrerPolicy="no-referrer"
                      />
                      <button
                        type="button"
                        onClick={() => setSchoolLogo("")}
                        className="absolute -top-2 -right-2 bg-red-650 hover:bg-red-750 text-white p-1 rounded-full shadow-md hover:scale-105 transition cursor-pointer"
                        title="Hapus Logo"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 border-2 border-dashed border-slate-300 rounded-xl bg-slate-100 flex flex-col items-center justify-center text-slate-400 select-none">
                      <ImageIcon className="w-6 h-6 text-slate-300" />
                      <span className="text-[9px] mt-1 font-bold">KOSONG</span>
                    </div>
                  )}
                </div>

                {/* Logo Action & Presets */}
                <div className="md:col-span-9 space-y-3">
                  <div className="space-y-1">
                    <span className="block text-[11px] font-bold text-slate-600">Pilihan 1: Unggah Gambar (PNG/JPG)</span>
                    <label className="inline-flex items-center px-4 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-xs transition duration-150">
                      <Upload className="w-3.5 h-3.5 mr-2 text-slate-500" />
                      Pilih Berkas Logo
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleLogoUpload} 
                        className="hidden" 
                      />
                    </label>
                  </div>

                  <div className="space-y-1">
                    <span className="block text-[11px] font-bold text-slate-600">Pilihan 2: Gunakan Ikon Cepat (Badges)</span>
                    <div className="flex flex-wrap gap-1.5">
                      {logoPresets.map((crest, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectPresetLogo(crest.emoji)}
                          className={`flex items-center px-2 py-1.5 rounded-lg text-xs font-bold border border-slate-200 bg-white hover:bg-slate-50 select-none transition`}
                          title={crest.name}
                        >
                          <span className="text-sm mr-1">{crest.emoji}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Teacher Details */}
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center">
                <User className="w-4.5 h-4.5 mr-2 text-indigo-500" />
                II. Identitas Penandatangan
              </h2>
              <p className="text-[11px] text-slate-500">Nama guru dan kepala sekolah beserta nomor induk kepegawaian (NIP).</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Teacher Fields */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                  <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Identitas Pendidik (Guru)</span>
                  
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500">NAMA LENGKAP GURU</label>
                    <input
                      type="text"
                      required
                      value={teacherName}
                      onChange={e => setTeacherName(e.target.value)}
                      className="w-full text-xs p-2.5 border border-slate-250 bg-white rounded-lg focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500">NOMOR INDUK PEGAWAI (NIP)</label>
                    <input
                      type="text"
                      value={teacherNip}
                      onChange={e => setTeacherNip(e.target.value)}
                      className="w-full text-xs p-2.5 border border-slate-250 bg-white rounded-lg font-mono text-slate-700"
                      placeholder="Tulis '-' jika tidak ada NIP/Honorer"
                    />
                  </div>
                </div>

                {/* Headmaster Fields */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                  <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Kepala Sekolah Penanggungjawab</span>
                  
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500">NAMA LENGKAP KEPALA SEKOLAH</label>
                    <input
                      type="text"
                      required
                      value={headmasterName}
                      onChange={e => setHeadmasterName(e.target.value)}
                      className="w-full text-xs p-2.5 border border-slate-250 bg-white rounded-lg focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500">NOMOR INDUK KEPEGAWAIAN (NIP KEPSEK)</label>
                    <input
                      type="text"
                      value={headmasterNip}
                      onChange={e => setHeadmasterNip(e.target.value)}
                      className="w-full text-xs p-2.5 border border-slate-250 bg-white rounded-lg font-mono text-slate-700"
                      placeholder="Masukkan NIP Kepala Sekolah"
                    />
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* Prompt Save Button */}
          <div className="border-t border-slate-100 pt-4 flex justify-end">
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-3 px-6 rounded-xl shadow-md transition hover:-translate-y-0.5 duration-150 cursor-pointer flex items-center"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Simpan Profil & Logo
            </button>
          </div>

        </form>

        {/* RIGHT PANEL: Digital Signatures Manager (5 cols on desktop) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* 1. TEACHER SIGNATURE MANAGER */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center">
                <FileSignature className="w-4.5 h-4.5 mr-2 text-indigo-600" />
                III. Tanda Tangan Guru
              </h2>
              <p className="text-[11px] text-slate-500">Buat, ketik, coret langsung atau unggah gambar tanda tangan Anda.</p>
            </div>

            {/* Current Signature Card Preview */}
            <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 flex items-center justify-between">
              <div>
                <span className="block text-[10px] text-slate-400 font-extrabold uppercase">Tanda Tangan Aktif Guru:</span>
                <span className="text-xs font-bold text-slate-800 mt-0.5 block">
                  {config.teacherSignatureType === "upload" ? "📸 Unggahan Berkas / Gambar" : "✍️ Cursive - Coretan Nama"}
                </span>
              </div>
              <div className="w-24 h-12 bg-white rounded border border-slate-200 flex items-center justify-center p-1 overflow-hidden">
                {config.teacherSignatureType === "upload" && config.teacherSignatureData ? (
                  <img src={config.teacherSignatureData} alt="Ttd Guru" className="max-h-full max-w-full object-contain mix-blend-multiply" referrerPolicy="no-referrer" />
                ) : config.teacherSignatureType === "text" && config.teacherSignatureData ? (
                  <span className="text-xs font-black italic select-none" style={{ fontFamily: "cursive, Georgia, serif" }}>
                    {config.teacherSignatureData}
                  </span>
                ) : (
                  <span className="text-[9px] text-slate-300 italic">Belum diset</span>
                )}
              </div>
            </div>

            {/* Tab navigation for drawing mode */}
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-lg text-center border">
              <button
                type="button"
                onClick={() => setTeacherSigType("text")}
                className={`text-[10px] font-bold py-1.5 px-1 rounded transition flex flex-col items-center justify-center ${
                  teacherSigType === "text" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Type className="w-3.5 h-3.5 mb-1 text-slate-500" />
                Ketik Nama
              </button>
              <button
                type="button"
                onClick={() => setTeacherSigType("canvas")}
                className={`text-[10px] font-bold py-1.5 px-1 rounded transition flex flex-col items-center justify-center ${
                  teacherSigType === "canvas" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Edit2 className="w-3.5 h-3.5 mb-1 text-slate-500" />
                Gambar Tangan
              </button>
              <button
                type="button"
                onClick={() => setTeacherSigType("upload")}
                className={`text-[10px] font-bold py-1.5 px-1 rounded transition flex flex-col items-center justify-center ${
                  teacherSigType === "upload" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Upload className="w-3.5 h-3.5 mb-1 text-slate-500" />
                Unggah File
              </button>
            </div>

            {/* TYPE TEXT SIGNATURE INTERACTIVE SCREEN */}
            {teacherSigType === "text" && (
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100 animate-fade-in">
                <span className="block text-[10px] font-bold text-slate-500 uppercase">1. Masukkan Teks Nama</span>
                <input
                  type="text"
                  value={teacherSigText}
                  onChange={e => setTeacherSigText(e.target.value)}
                  className="w-full text-xs p-2.5 border rounded-lg bg-white font-medium text-slate-800"
                  placeholder="Ketik nama Anda di sini"
                />

                <span className="block text-[10px] font-bold text-slate-500 uppercase mt-2">2. Pilih Gaya Typography Cursive</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTeacherSigText(teacherSigText);
                      setTeacherSigFont("font-cursive-1");
                    }}
                    className={`p-3 border rounded-xl text-center font-bold bg-white text-slate-800 active:scale-95 transition ${
                      teacherSigFont === "font-cursive-1" ? "border-indigo-600 ring-1 ring-indigo-100" : "border-slate-200"
                    }`}
                    style={{ fontFamily: "'Brush Script MT', cursive, Georgia, serif" }}
                  >
                    <span className="text-base">{teacherSigText || "Opsi 1"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTeacherSigText(teacherSigText);
                      setTeacherSigFont("font-cursive-2");
                    }}
                    className={`p-3 border rounded-xl text-center font-semibold italic bg-white text-slate-850 active:scale-95 transition ${
                      teacherSigFont === "font-cursive-2" ? "border-indigo-600 ring-1 ring-indigo-100" : "border-slate-200"
                    }`}
                    style={{ fontFamily: "'Lucida Handwriting', cursive, Georgia, serif" }}
                  >
                    <span className="text-sm">{teacherSigText || "Opsi 2"}</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => saveTextSignature(true)}
                  className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 rounded-lg transition"
                >
                  Gunakan Tanda Tangan Ketik Ini
                </button>
              </div>
            )}

            {/* DRAW CANVASSING DIRECT INPUT LIVE */}
            {teacherSigType === "canvas" && (
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100 animate-fade-in">
                <div className="flex justify-between items-center">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase">Coret Tanda Tangan Langsung (Mouse / Layar Sentuh)</span>
                  <button
                    type="button"
                    onClick={clearTeacherCanvas}
                    className="text-[10px] text-red-650 hover:text-red-750 font-bold flex items-center shadow-xs bg-white px-2 py-1 rounded border border-red-100"
                  >
                    <Eraser className="w-3 h-3 mr-1" /> Bersih
                  </button>
                </div>

                {/* Drawn pad canvas */}
                <div className="relative border border-slate-300 rounded-lg bg-white overflow-hidden cursor-crosshair">
                  <canvas
                    ref={teacherCanvasRef}
                    width={320}
                    height={120}
                    className="w-full h-[120px] bg-white block"
                    onMouseDown={startDrawTeacher}
                    onMouseMove={drawTeacher}
                    onMouseUp={stopDrawTeacher}
                    onMouseLeave={stopDrawTeacher}
                    onTouchStart={startDrawTeacher}
                    onTouchMove={drawTeacher}
                    onTouchEnd={stopDrawTeacher}
                  />
                  <div className="absolute bottom-1 right-2 text-[8px] text-slate-400 font-bold uppercase select-none pointer-events-none">
                    TINTA BIRU • DRAWING PAD
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={saveTeacherCanvas}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 rounded-lg transition shadow-sm"
                  >
                    Simpan Hasil Gambar Tangan
                  </button>
                </div>
              </div>
            )}

            {/* UPLOAD SIGNATURE IMAGE */}
            {teacherSigType === "upload" && (
              <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100 animate-fade-in text-center">
                <span className="block text-[10px] font-bold text-slate-500 uppercase text-left mb-2">Unggah Gambar Tanda Tangan</span>
                
                <label className="flex flex-col items-center justify-center p-6 bg-white border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-indigo-500 transition duration-150">
                  <Upload className="w-8 h-8 text-slate-400 mb-2" />
                  <span className="text-xs font-bold text-slate-700">Pilih / Seret Gambar Tanda Tangan</span>
                  <span className="text-[10px] text-slate-400 mt-1">Gunakan format PNG dengan latar transparan untuk hasil terbaik</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => handleSignatureUpload(e, true)}
                    className="hidden"
                  />
                </label>
              </div>
            )}

          </div>

          {/* 2. HEADMASTER SIGNATURE MANAGER */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center">
                <FileSignature className="w-4.5 h-4.5 mr-2 text-indigo-600" />
                IV. Tanda Tangan Kepala Sekolah
              </h2>
              <p className="text-[11px] text-slate-500">Atur tanda tangan digital yang mewakili Kepala Sekolah penanggungjawab.</p>
            </div>

            {/* Current Signature Card Preview */}
            <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 flex items-center justify-between">
              <div>
                <span className="block text-[10px] text-slate-400 font-extrabold uppercase">Tanda Tangan Aktif Kepala Sekolah:</span>
                <span className="text-xs font-bold text-slate-800 mt-0.5 block">
                  {config.headmasterSignatureType === "upload" ? "📸 Unggahan Berkas / Gambar" : "✍️ Cursive - Coretan Nama"}
                </span>
              </div>
              <div className="w-24 h-12 bg-white rounded border border-slate-200 flex items-center justify-center p-1 overflow-hidden">
                {config.headmasterSignatureType === "upload" && config.headmasterSignatureData ? (
                  <img src={config.headmasterSignatureData} alt="Ttd Kepsek" className="max-h-full max-w-full object-contain mix-blend-multiply" referrerPolicy="no-referrer" />
                ) : config.headmasterSignatureType === "text" && config.headmasterSignatureData ? (
                  <span className="text-xs font-black italic select-none" style={{ fontFamily: "cursive, Georgia, serif" }}>
                    {config.headmasterSignatureData}
                  </span>
                ) : (
                  <span className="text-[9px] text-slate-300 italic">Belum diset</span>
                )}
              </div>
            </div>

            {/* Tab navigation for drawing headmaster signature */}
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-lg text-center border">
              <button
                type="button"
                onClick={() => setHeadmasterSigType("text")}
                className={`text-[10px] font-bold py-1.5 px-1 rounded transition flex flex-col items-center justify-center ${
                  headmasterSigType === "text" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Type className="w-3.5 h-3.5 mb-1 text-slate-500" />
                Ketik Nama
              </button>
              <button
                type="button"
                onClick={() => setHeadmasterSigType("canvas")}
                className={`text-[10px] font-bold py-1.5 px-1 rounded transition flex flex-col items-center justify-center ${
                  headmasterSigType === "canvas" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Edit2 className="w-3.5 h-3.5 mb-1 text-slate-500" />
                Gambar Tangan
              </button>
              <button
                type="button"
                onClick={() => setHeadmasterSigType("upload")}
                className={`text-[10px] font-bold py-1.5 px-1 rounded transition flex flex-col items-center justify-center ${
                  headmasterSigType === "upload" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Upload className="w-3.5 h-3.5 mb-1 text-slate-500" />
                Unggah File
              </button>
            </div>

            {/* TYPE TEXT SIGNATURE HEADMASTER */}
            {headmasterSigType === "text" && (
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100 animate-fade-in font-display">
                <span className="block text-[10px] font-bold text-slate-500 uppercase">1. Masukkan Teks Nama Kepala Sekolah</span>
                <input
                  type="text"
                  value={headmasterSigText}
                  onChange={e => setHeadmasterSigText(e.target.value)}
                  className="w-full text-xs p-2.5 border rounded-lg bg-white font-medium text-slate-800"
                  placeholder="Ketik nama Kepala Sekolah"
                />

                <span className="block text-[10px] font-bold text-slate-500 uppercase mt-2">2. Pilih Gaya Typography Cursive</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setHeadmasterSigText(headmasterSigText);
                      setHeadmasterSigFont("font-cursive-1");
                    }}
                    className={`p-3 border rounded-xl text-center font-bold bg-white text-slate-800 active:scale-95 transition ${
                      headmasterSigFont === "font-cursive-1" ? "border-indigo-600 ring-1 ring-indigo-100" : "border-slate-200"
                    }`}
                    style={{ fontFamily: "'Brush Script MT', cursive, Georgia, serif" }}
                  >
                    <span className="text-base">{headmasterSigText || "Opsi 1"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setHeadmasterSigText(headmasterSigText);
                      setHeadmasterSigFont("font-cursive-2");
                    }}
                    className={`p-3 border rounded-xl text-center font-semibold italic bg-white text-slate-850 active:scale-95 transition ${
                      headmasterSigFont === "font-cursive-2" ? "border-indigo-600 ring-1 ring-indigo-100" : "border-slate-200"
                    }`}
                    style={{ fontFamily: "'Lucida Handwriting', cursive, Georgia, serif" }}
                  >
                    <span className="text-sm">{headmasterSigText || "Opsi 2"}</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => saveTextSignature(false)}
                  className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 rounded-lg transition"
                >
                  Gunakan Tanda Tangan Ketik Ini
                </button>
              </div>
            )}

            {/* DRAW CANVASSING HEADMASTER DIRECT SKETCH */}
            {headmasterSigType === "canvas" && (
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100 animate-fade-in">
                <div className="flex justify-between items-center">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase">Coret Tanda Tangan Langsung (Mouse / Layar Sentuh)</span>
                  <button
                    type="button"
                    onClick={clearHeadmasterCanvas}
                    className="text-[10px] text-red-650 hover:text-red-750 font-bold flex items-center shadow-xs bg-white px-2 py-1 rounded border border-red-100"
                  >
                    <Eraser className="w-3 h-3 mr-1" /> Bersih
                  </button>
                </div>

                {/* Draw Canvas pad */}
                <div className="relative border border-slate-300 rounded-lg bg-white overflow-hidden cursor-crosshair">
                  <canvas
                    ref={headmasterCanvasRef}
                    width={320}
                    height={120}
                    className="w-full h-[120px] bg-white block"
                    onMouseDown={startDrawHeadmaster}
                    onMouseMove={drawHeadmaster}
                    onMouseUp={stopDrawHeadmaster}
                    onMouseLeave={stopDrawHeadmaster}
                    onTouchStart={startDrawHeadmaster}
                    onTouchMove={drawHeadmaster}
                    onTouchEnd={stopDrawHeadmaster}
                  />
                  <div className="absolute bottom-1 right-2 text-[8px] text-slate-400 font-bold uppercase select-none pointer-events-none">
                    TINTA HITAM • DRAWING PAD
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={saveHeadmasterCanvas}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 rounded-lg transition shadow-sm"
                  >
                    Simpan Hasil Gambar Tangan
                  </button>
                </div>
              </div>
            )}

            {/* UPLOAD HEADMASTER SIGNATURE IMAGE */}
            {headmasterSigType === "upload" && (
              <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100 animate-fade-in text-center">
                <span className="block text-[10px] font-bold text-slate-500 uppercase text-left mb-2">Unggah Gambar Tanda Tangan Kepala Sekolah</span>
                
                <label className="flex flex-col items-center justify-center p-6 bg-white border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-indigo-500 transition duration-150">
                  <Upload className="w-8 h-8 text-slate-400 mb-2" />
                  <span className="text-xs font-bold text-slate-700">Pilih / Seret Gambar Tanda Tangan Kepsek</span>
                  <span className="text-[10px] text-slate-400 mt-1">Gunakan format PNG transparan untuk hasil terbaik</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => handleSignatureUpload(e, false)}
                    className="hidden"
                  />
                </label>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};
