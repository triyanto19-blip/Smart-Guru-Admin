/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

// Lazy initialize Gemini client to ensure app doesn't crash if key is missing on start
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("[Smart-Guru Admin] Warning: GEMINI_API_KEY is not defined in environment variables. Gemini features will fail to execute.");
      // Throw a friendly error that we will catch in our routes
      throw new Error("GEMINI_API_KEY is missing. Please set it in your Settings > Secrets panel.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

const app = express();
const PORT = 3000;

// Body Parsers
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// API 1: Generate ATP/Promes mapping based on settings
app.post("/api/generate/promes", async (req, res) => {
  try {
    const { phase, grade, subject, semester, weeklyJp, totalWeeks, schoolName } = req.body;
    const client = getGeminiClient();

    const prompt = `Anda adalah konsultan pendidikan Kurikulum Merdeka Indonesia draf profesional.
Berdasarkan parameter berikut, buatlah daftar Alur Tujuan Pembelajaran (ATP) dan distribusinya ke dalam Program Semester (Promes).
Fase: ${phase}
Kelas: ${grade}
Mata Pelajaran: ${subject}
Semester: ${semester}
Alokasi JP per Minggu: ${weeklyJp} JP
Total Minggu Efektif Pembelajaran: ${totalWeeks} Minggu (Total JP Efektif: ${totalWeeks * weeklyJp} JP)
Sekolah: ${schoolName || "Sekolah Contoh"}

Aturan Pembagian:
1. Buat sekitar 3 s.d. 5 Tujuan Pembelajaran (TP) yang logis, lengkap, dan berurutan untuk semester ini.
2. Setiap TP harus memiliki kode (e.g., "TP 1.1", "TP 1.2" dst).
3. Bagikan total JP secara proporsional ke masing-masing TP. Jumlah JP alokasi kumulatif harus sama dengan total JP Efektif (${totalWeeks * weeklyJp} JP).
4. Petakan minggu pelaksanaan untuk masing-masing TP (setiap TP berjalan pada minggu-minggu tertentu yang tidak saling tumpang tindih berlebihan). Target minggu berkisar antara 1 s.d. ${totalWeeks}.
5. Tuliskan teks tujuan pembelajaran (tpText) menggunakan kata kerja operasional (KKO) standar yang patuh pada Kurikulum Merdeka.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "Anda adalah pakar akademisi perencana pembelajaran kurikulum merdeka terbaik di Indonesia.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          description: "List of Alur Tujuan Pembelajaran (ATP) mapped with week distribution",
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              code: { type: Type.STRING, description: "E.g. TP 1.1, TP 1.2" },
              tpText: { type: Type.STRING, description: "Teks rumusan Tujuan Pembelajaran menggunakan KKO" },
              jpAllocation: { type: Type.INTEGER, description: "Jumlah JP yang dialokasikan, e.g. 8" },
              targetWeeks: {
                type: Type.ARRAY,
                items: { type: Type.INTEGER },
                description: "Daftar nomor minggu efektif saat TP ini diajarkan, misalnya [1, 2]"
              }
            },
            required: ["id", "code", "tpText", "jpAllocation", "targetWeeks"]
          }
        }
      }
    });

    const dataText = response.text;
    if (!dataText) {
      throw new Error("Gagal menerima respons dari AI");
    }

    res.json(JSON.parse(dataText));
  } catch (err: any) {
    console.error("Error generating Promes:", err);
    res.status(500).json({ error: err.message || "Gagal menghasilkan Program Semester" });
  }
});

/// API 2: Generate Modul Ajar (RPP+) with option for Differentiation
app.post("/api/generate/modul-ajar", async (req, res) => {
  try {
    const { 
      tpCode, 
      tpText, 
      schoolConfig, 
      differentiationType,
      jenjang = "SD",
      kelas = "",
      capaianPembelajaran = "",
      materiPelajaran = "",
      jumlahPertemuan = 1,
      durasiSetiapPertemuan = "2 x 35 menit",
      praktikPedagogisPerPertemuan = [],
      dimensiLulusan = []
    } = req.body;
    
    const client = getGeminiClient();

    const diffInstruction = differentiationType === "Gaya Belajar"
      ? "Wajib menyertakan strategi diferensiasi konten/proses untuk Gaya Belajar Visual (misal: infografik, bagan), Auditori (misal: diskusi kelompok, lagu/audio), dan Kinestetik (misal: simulasi fisik, eksperimen taktil) di dalam Kegiatan Inti."
      : differentiationType === "Diferensiasi Kognitif"
        ? "Wajib menyertakan diferensiasi kognitif: Kegiatan pembelajaran yang dibedakan untuk kelompok Paham Utuh (pemberian tantangan/eksplorasi mendalam), Paham Sebagian (bimbingan moderat & analogi), dan Belum Paham (scaffolding intensif, penggunaan benda konkret) di dalam Kegiatan Inti."
        : "Buat langkah pembelajaran aktif (active learning) yang bermakna bagi seluruh peserta didik (tidak ada instruksi diferensiasi khusus).";

    const prompt = `Buatlah draf MODUL AJAR (RPP+) Kurikulum Merdeka yang dirancang khusus dan berpusat pada PEMBELAJARAN MENDALAM (DEEP LEARNING) secara sangat rinci, lengkap, dan berkelas akreditasi A sesuai Standar Proses Permendikbudristek No. 16 Tahun 2022.

Tujuan Pembelajaran (TP) ini mengacu pada:
TP Kode: ${tpCode}
TP Deskripsi: ${tpText}
Nama Satuan Pendidikan: ${schoolConfig.schoolName}
Nama Guru: ${schoolConfig.teacherName}
NIP Guru: ${schoolConfig.teacherNip || "-"}
Nama Kepala Sekolah: ${schoolConfig.headmasterName}
NIP Kepala Sekolah: ${schoolConfig.headmasterNip || "-"}
Jenjang Pendidikan: ${jenjang}
Kelas Pilihan: ${kelas || schoolConfig.grade}
Mata Pelajaran (Mapel): ${schoolConfig.subject}
Semester: ${schoolConfig.semester}
Tahun Ajaran: ${schoolConfig.academicYear}
Capaian Pembelajaran (CP) Isian: ${capaianPembelajaran || "Sesuai dengan Panduan Pembelajaran & Asesmen"}
Materi Pelajaran Isian: ${materiPelajaran || tpText}
Jumlah Pertemuan: ${jumlahPertemuan} Pertemuan
Durasi Setiap Pertemuan: ${durasiSetiapPertemuan}
Masing-masing Praktik Pedagogis per Pertemuan terpilih: ${JSON.stringify(praktikPedagogisPerPertemuan)}
Dimensi Lulusan (Multi-pilihan): ${JSON.stringify(dimensiLulusan)}
Target Diferensiasi: ${differentiationType}
Instruksi Diferensiasi Khusus: ${diffInstruction}

INFORMASI PEDAGOGIS KHUSUS - PEMBELAJARAN MENDALAM (DEEP LEARNING):
Pembelajaran Mendalam harus tercermin di seluruh dokumen dengan detail langkah per langkah yang aplikatif dan tidak abstrak. Wajib memadukan 3 Pilar Pembelajaran Mendalam berikut:
1. MINDFUL LEARNING (Menyadari Esensi & Fokus): Pembelajaran yang membangun kesadaran penuh peserta didik terhadap tujuan belajar, fokus yang tajam, keselamatan psikologis, dan menumbuhkan rasa penasaran harian.
2. MEANINGFUL LEARNING (Keterulasan Bermakna/Kontekstual): Menghubungkan muatan ilmiah secara mendalam dengan kearifan lokal, realitas lingkungan sekitar anak, dan urgensi di kehidupan nyata murid.
3. JOYFUL LEARNING (Emosi Positif & Kegembiraan): Pembelajaran interaktif berbasis tantangan menyenangkan (desirable difficulties) yang memicu hormon dopamin belajar positif tanpa membebani mental.

LANGKAH INSTRUKSIONAL PEMBELAJARAN MENDALAM:
A. PADA KEGIATAN PENDAHULUAN (Isi di properti "pendahuluan"):
- 1. KONEKSI (Connecting - Apersepsi Bermakna): Pandu guru mengaitkan konsep prasyarat dengan pengalaman nyata sehari-hari anak secara menantang. Berikan stimulus visual/fenomena tak biasa.

B. PADA KEGIATAN INTI (Isi dengan detail sangat padat dan panjang di properti "inti"):
- 2. KONSEP (Conceptualizing - Konstruksi Skema Berpikir): Guru menyajikan peta representasi konsep ganda secara multi-sensori. Ajukan pertanyaan yang membimbing murid merumuskan definisi dan skema berpikir.
- 3. KONSTRUKSI AKTIF (Constructing - Pembuktian Ilmiah sesuai sintaks Pedagogis terpilih: ${JSON.stringify(praktikPedagogisPerPertemuan)}): Murid bekerja aktif (secara kolaboratif kelompok) merencanakan investigasi mandiri/praktikum, membongkar masalah konkret/studi kasus untuk membuktikan konsep keilmuan. Integrasikan Target Diferensiasi (${differentiationType}) secara mendalam di sini.
- 4. KOLABORASI & KOMUNIKASI (Collaborating & Communicating): Sesi berbagi hasil karya, saling menyanggah argumen ilmiah dengan etika kesopanan, dan pemberian umpan balik korektif (formative feedback) real-time dari guru.
- 5. KONTEKSTUALISASI KARYA (Applying/Applying to Context): Menghubungkan pemahaman baru untuk menciptakan solusi praktis atas masalah nyata di sekitar mereka.

C. PADA KEGIATAN PENUTUP (Isi di properti "penutup"):
- 6. REFLEKSI METAKOGNITIF (Reflecting): Pandu murid mengevaluasi cara berpikir mereka sendiri (metakognisi), perasaan emosi mereka selama belajar harian (Joyful meter), serta rencana perbaikan diri mandiri ke depan.

TUGAS TAMBAHAN WAJIB (Pemberian Output Komposisi Modul Mendalam):
Bentuk struktur dokumen "pembelajaranMendalam" yang lengkap dan mendalam dengan informasi sebagai berikut:
1. Identitas: Gabungkan nama sekolah, mapel, kelas/semester, dan durasi pertemuan ke draf rapi.
2. Identifikasi: Generate karakteristik siswa secara otomatis, cantumkan materi dan dimensi lulusan terpilih.
3. Desain Pembelajaran: Sediakan CP dari input, buat lintas disiplin ilmu yang terintegrasi (generate ilmiah kontekstual), cantumkan tujuan pembelajaran dari input, formulasikan topik pembelajaran (sesuai input), sebutkan pilihan praktik pedagogis tiap pertemuan beserta sintaksnya, sebutkan kemitraan pembelajaran (sekolah-rumah-ortu-komunitas), rancang lingkungan pembelajaran fisik kelas yang ergonomis & ramah fokus, serta sajikan pemanfaatan digital (berikan referensi tools online penunjang seperti Canva, PhET simulation, Mentimeter, Wordwall, atau Padlet beserta skenario penggunaannya).
4. Pengalaman Belajar: deskripsikan secara naratif taktis pilar 'Memahami' (berkesadaran/mindful), 'Mengaplikasi' (bermakna/meaningful dengan sintaks pedagogis), dan 'Refleksi' (menggembirakan/joyful).
5. Asesmen Pembelajaran: Jabarkan format operasional asesmen awal, proses, dan akhir.

Semua bagian teks di dalam "pembelajaranMendalam" WAJIB menggunakan bahasa Indonesia yang baik dan benar (sesuai EYD) dengan gaya penulisan yang rapi, berkelas, tata bahasa formal, serta terstruktur (dikondisikan untuk siap dirender dengan text-justify (rata kanan-kiri) secara estetik).`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "Anda adalah pengembang kurikulum nasional senior di Puskurjar Kemendikbudristek RI yang ahli menyusun draf modul ajar Kurikulum Merdeka Pembelajaran Mendalam berkualitas bintang lima.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tpCode: { type: Type.STRING },
            tpText: { type: Type.STRING },
            diferensiasiType: { type: Type.STRING },
            identitas: {
              type: Type.OBJECT,
              properties: {
                sekolah: { type: Type.STRING },
                fase: { type: Type.STRING },
                kelas: { type: Type.STRING },
                mapel: { type: Type.STRING },
                alokasiWaktu: { type: Type.STRING },
                profilPancasila: { type: Type.ARRAY, items: { type: Type.STRING } },
                saranaPrasarana: { type: Type.STRING },
                targetSiswa: { type: Type.STRING },
                modelPembelajaran: { type: Type.STRING }
              },
              required: ["sekolah", "fase", "kelas", "mapel", "alokasiWaktu", "profilPancasila", "saranaPrasarana", "targetSiswa", "modelPembelajaran"]
            },
            komponenInti: {
              type: Type.OBJECT,
              properties: {
                tujuanPembelajaran: { type: Type.STRING },
                pemahamanBermakna: { type: Type.STRING },
                pertanyaanPemantik: { type: Type.STRING },
                asesmenAwalDiagnostik: { type: Type.STRING, description: "Rencana asesmen awal/diagnostik kognitif singkat" }
              },
              required: ["tujuanPembelajaran", "pemahamanBermakna", "pertanyaanPemantik", "asesmenAwalDiagnostik"]
            },
            langkahPembelajaran: {
              type: Type.OBJECT,
              properties: {
                pendahuluan: { type: Type.STRING, description: "Kegiatan pendahuluan (salam, doa, motivasi, apersepsi; format markdown/HTML p tags)" },
                inti: { type: Type.STRING, description: "Kegiatan inti pembelajaran (aktif, berpusat pada murid, terapkan instruksi diferensiasi jika ada dan padukan sintaks pedagogis; format markdown/HTML yang terperinci)" },
                penutup: { type: Type.STRING, description: "Kegiatan penutup (refleksi, simpulan, evaluasi, tindak lanjut doa; format markdown/HTML)" }
              },
              required: ["pendahuluan", "inti", "penutup"]
            },
            materiBahanAjar: {
              type: Type.STRING,
              description: "Teori materi pelajaran esensial yang disusun secara lengkap, sistematis, ramah baca anak, terbagi dalam penjelasan sub-bagian menarik (format Markdown)."
            },
            pptOverview: {
              type: Type.OBJECT,
              properties: {
                slides: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      slideNum: { type: Type.INTEGER },
                      title: { type: Type.STRING },
                      content: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["slideNum", "title", "content"]
                  }
                }
              },
              required: ["slides"]
            },
            lkpd: {
              type: Type.OBJECT,
              properties: {
                petunjuk: { type: Type.ARRAY, items: { type: Type.STRING } },
                aktivitas: { type: Type.STRING, description: "Deskripsi aktivitas atau petualangan belajar yang harus dijalankan siswa (secara mandiri atau berkelompok)" },
                pertanyaanPemantikLogika: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Pertanyaan pemantik logika tingkat tinggi (HOTS) siswa" }
              },
              required: ["petunjuk", "aktivitas", "pertanyaanPemantikLogika"]
            },
            pembelajaranMendalam: {
              type: Type.OBJECT,
              properties: {
                identitas: {
                  type: Type.OBJECT,
                  properties: {
                    satuanPendidikan: { type: Type.STRING },
                    mataPelajaran: { type: Type.STRING },
                    kelasSemester: { type: Type.STRING },
                    durasiPertemuan: { type: Type.STRING }
                  },
                  required: ["satuanPendidikan", "mataPelajaran", "kelasSemester", "durasiPertemuan"]
                },
                identifikasi: {
                  type: Type.OBJECT,
                  properties: {
                    siswa: { type: Type.STRING, description: "Karakteristik target siswa terperinci secara otomatis" },
                    materiPelajaran: { type: Type.STRING },
                    capaianDimensiLulusan: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ["siswa", "materiPelajaran", "capaianDimensiLulusan"]
                },
                desainPembelajaran: {
                  type: Type.OBJECT,
                  properties: {
                    capaianPembelajaran: { type: Type.STRING },
                    lintasDisiplinIlmu: { type: Type.STRING, description: "Integrasikan deskripsi keterkaitan ilmiah lintas bidang studi" },
                    tujuanPembelajaran: { type: Type.STRING },
                    topikPembelajaran: { type: Type.STRING },
                    praktikPedagogisPerPertemuan: { type: Type.STRING, description: "Daftar per pertemuan, praktik pedagogis yang terpilih dan sintaks implementasi nyatanya" },
                    kemitraanPembelajaran: { type: Type.STRING, description: "Kemitraan sekolah dengan orang tua dan masyarakat sekitar" },
                    lingkunganPembelajaran: { type: Type.STRING, description: "Kondisi fisik dan mental kelas yang kondusif" },
                    pemanfaatanDigital: { type: Type.STRING, description: "Tools online beserta deskripsi integrasinya secara spesifik" }
                  },
                  required: ["capaianPembelajaran", "lintasDisiplinIlmu", "tujuanPembelajaran", "topikPembelajaran", "praktikPedagogisPerPertemuan", "kemitraanPembelajaran", "lingkunganPembelajaran", "pemanfaatanDigital"]
                },
                pengalamanBelajar: {
                  type: Type.OBJECT,
                  properties: {
                    memahami: { type: Type.STRING },
                    mengaplikasi: { type: Type.STRING },
                    refleksi: { type: Type.STRING }
                  },
                  required: ["memahami", "mengaplikasi", "refleksi"]
                },
                asesmenPembelajaran: {
                  type: Type.OBJECT,
                  properties: {
                    awal: { type: Type.STRING },
                    proses: { type: Type.STRING },
                    akhir: { type: Type.STRING }
                  },
                  required: ["awal", "proses", "akhir"]
                }
              },
              required: ["identitas", "identifikasi", "desainPembelajaran", "pengalamanBelajar", "asesmenPembelajaran"]
            }
          },
          required: ["tpCode", "tpText", "diferensiasiType", "identitas", "komponenInti", "langkahPembelajaran", "materiBahanAjar", "pptOverview", "lkpd", "pembelajaranMendalam"]
        }
      }
    });

    const dataText = response.text;
    res.json(JSON.parse(dataText || "{}"));
  } catch (err: any) {
    console.error("Error generating Modul Ajar:", err);
    res.status(500).json({ error: err.message || "Gagal menghasilkan Modul Ajar" });
  }
});

// API 2b: Generate LKPD (Lembar Kerja Peserta Didik) with Rich Visual, Table, Graphic data
app.post("/api/generate/lkpd", async (req, res) => {
  try {
    const { tpCode, tpText, schoolConfig, grade, subject } = req.body;
    const client = getGeminiClient();

    const prompt = `Buatlah draf LEMBAR KERJA PESERTA DIDIK (LKPD) Kurikulum Merdeka berkelas tinggi untuk:
Tujuan Pembelajaran (TP): [${tpCode}] ${tpText}
Kelas: ${grade || schoolConfig?.grade || "-"}
Mata Pelajaran: ${subject || schoolConfig?.subject || "-"}
Sekolah: ${schoolConfig?.schoolName || "SDN Merdeka Jaya"}

Sajikan LKPD ini secara interaktif, ramah anak, dan memicu kompetensi bernalar kritis (HOTS).
Wajib mengembalikan data terstruktur yang memuat:
1. Petunjuk belajar siswa terperinci.
2. Deskripsi aktivitas eksploratif atau petualangan belajar kelompok mandiri.
3. Sejumlah pertanyaan pemantik logika tingkat tinggi (HOTS).
4. Data grafik pencapaian target yang bisa divisualisasikan (contoh: target pengerjaan proyek, metrik kelulusan, atau statistik tantangan ilmiah).
5. Tabel Rubrik Penilaian Penugasan (memuat target kriteria, indikator, skor minimal-maksimal).
6. Kata kunci pencarian visual unik untuk Unsplash agar kita bisa merender gambar edukatif pendukung.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "Anda adalah pakar penulisan LKPD & instrumen asesmen formal Kurikulum Merdeka Kemendikbudristek RI.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tpCode: { type: Type.STRING },
            tpText: { type: Type.STRING },
            petunjuk: { type: Type.ARRAY, items: { type: Type.STRING } },
            aktivitas: { type: Type.STRING, description: "Penjelasan detail aktivitas belajar siswa" },
            pertanyaanPemantikLogika: { type: Type.ARRAY, items: { type: Type.STRING } },
            unsplashQuery: { type: Type.STRING, description: "Kata kunci bahasa Inggris pendek untuk Unsplash, misal: 'elementary science experiment', 'children math solve'" },
            graphicData: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                type: { type: Type.STRING, description: "bar, line, or pie" },
                items: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      label: { type: Type.STRING, description: "Kategori target/sesi" },
                      value: { type: Type.INTEGER, description: "Persentase/skor numerik" }
                    },
                    required: ["label", "value"]
                  }
                }
              },
              required: ["title", "type", "items"]
            },
            rubrikTabel: {
              type: Type.OBJECT,
              properties: {
                headers: { type: Type.ARRAY, items: { type: Type.STRING } },
                rows: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                }
              },
              required: ["headers", "rows"]
            }
          },
          required: ["tpCode", "tpText", "petunjuk", "aktivitas", "pertanyaanPemantikLogika", "unsplashQuery", "graphicData", "rubrikTabel"]
        }
      }
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (err: any) {
    console.error("Error generating LKPD:", err);
    res.status(500).json({ error: err.message || "Gagal menghasilkan LKPD" });
  }
});

// API 2c: Generate Bahan Ajar (Teori) with Concept Maps, Tables, Highlights
app.post("/api/generate/bahan-ajar", async (req, res) => {
  try {
    const { tpCode, tpText, schoolConfig, grade, subject } = req.body;
    const client = getGeminiClient();

    const prompt = `Susunlah BAHAN AJAR TEORI membaca esensial Kurikulum Merdeka yang ramah anak sekolah, mudah dipahami, menarik, dan informatif untuk:
Tujuan Pembelajaran (TP): [${tpCode}] ${tpText}
Kelas: ${grade || schoolConfig?.grade || "-"}
Mata Pelajaran: ${subject || schoolConfig?.subject || "-"}

Wajib menghasilkan data terstruktur yang memuat:
1. Uraian materi utama (Materi Bahan Ajar) dalam format teks naratif yang inspiratif.
2. Peta Konsep (Concept Map / Mind Map Nodes) yang memetakan keterkaitan konsep-konsep kunci secara visual.
3. Tabel ringkasan fakta/rumus/istilah penting.
4. Kata kunci pencarian gambar Unsplash yang sangat mewakili subjek teori ini.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "Anda adalah penulis buku ajar Kemendikbudristek nasional yang ahli dalam menyederhanakan konsep rumit menjadi bacaan yang menggugah emosi positif dan bernilai tinggi.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tpCode: { type: Type.STRING },
            tpText: { type: Type.STRING },
            materiBahanAjar: { type: Type.STRING, description: "Penjelasan teori dan isi bacaan utama pendukung guru dan murid, dukung dengan pembagian sub-judul" },
            unsplashQuery: { type: Type.STRING, description: "English keywords for Unsplash, e.g. 'green plants cells', 'fractions math'" },
            conceptMap: {
              type: Type.OBJECT,
              properties: {
                nodes: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      label: { type: Type.STRING },
                      details: { type: Type.STRING }
                    },
                    required: ["id", "label"]
                  }
                },
                connections: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      from: { type: Type.STRING },
                      to: { type: Type.STRING },
                      label: { type: Type.STRING }
                    },
                    required: ["from", "to"]
                  }
                }
              },
              required: ["nodes", "connections"]
            },
            ringkasanTabel: {
              type: Type.OBJECT,
              properties: {
                headers: { type: Type.ARRAY, items: { type: Type.STRING } },
                rows: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                }
              },
              required: ["headers", "rows"]
            }
          },
          required: ["tpCode", "tpText", "materiBahanAjar", "unsplashQuery", "conceptMap", "ringkasanTabel"]
        }
      }
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (err: any) {
    console.error("Error generating Bahan Ajar:", err);
    res.status(500).json({ error: err.message || "Gagal menghasilkan Bahan Ajar" });
  }
});

// API 2d: Generate File Presentasi (Slides Overview with Table, Graph, and Bullet formats)
app.post("/api/generate/presentasi", async (req, res) => {
  try {
    const { tpCode, tpText, schoolConfig, grade, subject } = req.body;
    const client = getGeminiClient();

    const prompt = `Buatlah draf rincian SLIDE PRESENTASI (Media Paparan PPT) interaktif Kurikulum Merdeka yang mencakup teori, tanya jawab singkat, dan visual konsep untuk:
Tujuan Pembelajaran (TP): [${tpCode}] ${tpText}
Kelas: ${grade || schoolConfig?.grade || "-"}
Mata Pelajaran: ${subject || schoolConfig?.subject || "-"}

Wajib menghasilkan 4 s.d 6 slide dengan struktur konten interaktif dan visual ganda.
Aturan:
Setiap slide harus mendefinisikan layout visualnya:
- Tipe visual (visualType): "tabel" (perbandingan/metrik), "grafik" (diagram batang/garis/lingkaran), "gambar" (ilustrasi Unsplash), "diagram" (langkah alur), atau "bullet" (poin-poin penjelas).
- Deskripsi visual atau data model visual yang mewujudkan tipe tersebut secara kreatif untuk langsung digambar di program presentasi.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "Anda adalah perancang media pembelajaran visual interaktif dan desainer presentasi interaktif draf guru.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tpCode: { type: Type.STRING },
            tpText: { type: Type.STRING },
            slides: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  slideNum: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
                  visualType: { type: Type.STRING, description: "Must be: tabel, grafik, gambar, diagram, or bullet" },
                  unsplashQuery: { type: Type.STRING, description: "Unsplash search keyword for this slide background/visual" },
                  visualData: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      headers: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Headers if type is table" },
                      rows: {
                        type: Type.ARRAY,
                        items: { type: Type.ARRAY, items: { type: Type.STRING } },
                        description: "Rows if type is table"
                      },
                      labels: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Labels if type is graph" },
                      values: { type: Type.ARRAY, items: { type: Type.INTEGER }, description: "Numerical values if type is graph" },
                      nodes: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Core nodes/steps if type is diagram" }
                    }
                  }
                },
                required: ["slideNum", "title", "bullets", "visualType", "unsplashQuery"]
              }
            }
          },
          required: ["tpCode", "tpText", "slides"]
        }
      }
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (err: any) {
    console.error("Error generating Presentasi:", err);
    res.status(500).json({ error: err.message || "Gagal menghasilkan Presentasi" });
  }
});

// API 3: Generate exam blueprint item (Kisi-kisi & Butir Soal Kartu Soal)
app.post("/api/generate/kisi-kisi", async (req, res) => {
  try {
    const { tpCode, tpText, examType, questionCount, subjectName } = req.body;
    const client = getGeminiClient();

    const prompt = `Anda adalah seorang ahli evaluasi pembelajaran. Buat kisi-kisi dan butir soal evaluasi berdasarkan parameter berikut:
Mata Pelajaran: ${subjectName}
Jenis Evaluasi: ${examType}
Tujuan Pembelajaran: [${tpCode}] ${tpText}
Jumlah Butir Soal: ${questionCount} Soal

Aturan Soal:
1. Soal harus bervariasi dari aspek tingkat kognitif (LOTS ke HOTS, diwakili perwakilan C1 s.d C6).
2. Soal harus berupa pilihan ganda (Multiple Choice) yang dilengkapi opsi A, B, C, D serta kunci jawaban yang benar.
3. Soal harus relevan dengan TP yang dituju, dirumuskan dengan bahasa Indonesia baku yang jelas, presisi, dan bebas bias.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "Anda adalah pakar penulisan soal bersertifikat BNSP, ahli membuat soal standar AKM dan HOTS nasional.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          description: "List of evaluation question items with options and answers",
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              tpCode: { type: Type.STRING },
              topic: { type: Type.STRING, description: "Topik atau submateri terkait soal" },
              cognitiveLevel: { type: Type.STRING, description: "C1 / C2 / C3 / C4 / C5 / C6 / LOTS / HOTS" },
              questionText: { type: Type.STRING, description: "Rumusan teks kalimat pertanyaan/stimulus soal" },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Array berisi tepat 4 item opsi pilihan ganda berturut-turut A, B, C, D"
              },
              correctAnswer: { type: Type.STRING, description: "Kunci jawaban yang benar, contoh: 'A' atau 'B' atau 'C' atau 'D'" }
            },
            required: ["id", "tpCode", "topic", "cognitiveLevel", "questionText", "options", "correctAnswer"]
          }
        }
      }
    });

    const dataText = response.text;
    res.json(JSON.parse(dataText || "[]"));
  } catch (err: any) {
    console.error("Error generating Kisi-Kisi:", err);
    res.status(500).json({ error: err.message || "Gagal menghasilkan Kisi-Kisi Soal" });
  }
});

// API 4: Generate performance assessment rubric (Rubrik Penilaian Kinerja)
app.post("/api/generate/performance-rubric", async (req, res) => {
  try {
    const { tpCode, tpText, rubricTitle } = req.body;
    const client = getGeminiClient();

    const prompt = `Susunlah draf Rubrik Penilaian Analitik untuk evaluasi performa murid (seperti presentasi, proyek P5, atau praktikum) berdasarkan info berikut:
Judul Rubrik: ${rubricTitle}
Tujuan Pembelajaran: [${tpCode}] ${tpText}

Harap berikan 3 s.d. 4 kriteria penilaian esensial. Setiap kriteria harus didefinisikan dengan deskriptor kinerja yang jelas untuk tingkat skor berikut secara objektif:
- Sangat Baik (Skor 4)
- Baik (Skor 3)
- Cukup (Skor 2)
- Perlu Bimbingan (Skor 1)`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "Anda adalah pakar penjaminan mutu asesmen pendidikan Indonesia, terbiasa merumuskan rubrik analitis yang sangat adil dan deskriptif.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            tpCode: { type: Type.STRING },
            title: { type: Type.STRING },
            criteria: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING, description: "Nama aspek kriteria, misal: 'Kerja Sama Tim', 'Kesesuaian Konsep'" },
                  sangatBaik: { type: Type.STRING, description: "Deskriptor tingkat Sangat Baik (Skor 4)" },
                  baik: { type: Type.STRING, description: "Deskriptor tingkat Baik (Skor 3)" },
                  cukup: { type: Type.STRING, description: "Deskriptor tingkat Cukup (Skor 2)" },
                  perluBimbingan: { type: Type.STRING, description: "Deskriptor tingkat Perlu Bimbingan (Skor 1)" }
                },
                required: ["id", "name", "sangatBaik", "baik", "cukup", "perluBimbingan"]
              }
            }
          },
          required: ["id", "tpCode", "title", "criteria"]
        }
      }
    });

    const dataText = response.text;
    res.json(JSON.parse(dataText || "{}"));
  } catch (err: any) {
    console.error("Error generating Rubric:", err);
    res.status(500).json({ error: err.message || "Gagal menghasilkan Rubrik Penilaian" });
  }
});

// API 5: Generate Remedial and Pengayaan materials
app.post("/api/generate/remedial-pengayaan", async (req, res) => {
  try {
    const { tpCode, tpText } = req.body;
    const client = getGeminiClient();

    const prompt = `Anda adalah guru pengembang program asimilasi dan inklusivitas di kelas.
Berdasarkan Kriteria Ketercapaian (KKTP) dari pembelajaran Tujuan Pembelajaran berikut:
TP: [${tpCode}] ${tpText}

Buatlah materi dan latihan tindak lanjut berdiferensiasi:
1. PROGRAM REMEDIAL (Siswa yang belum mencapai target):
   - Teks ringkasan materi remedial (padat, bahasa lebih sederhana, disertai analogi mudah dimengerti).
   - Buatkan 3 butir soal perbaikan sederhana yang terpandu (dilengkapi panduan/clue cara menjawab).
2. PROGRAM PENGAYAAN (Siswa yang telah melampaui target):
   - Studi kasus analisis tingkat tinggi (HOTS) atau masalah kontekstual yang seru di dunia nyata.
   - Buatkan instruksi tugas mandiri kreatif / proyek eksplorasi kritis yang menantang.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "Anda adalah spesialis pendidikan inklusif dan diferensiasi kognitif siswa pasca-evaluasi.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tpCode: { type: Type.STRING },
            remedialMaterial: { type: Type.STRING, description: "Rangkuman teori perbaikan sederhana dalam format Markdown/HTML" },
            remedialQuestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING, description: "Pertanyaan ringkas pengetesan" },
                  guide: { type: Type.STRING, description: "Clue pembimbing kognitif cerdik bagi murid" }
                },
                required: ["question", "guide"]
              }
            },
            pengayaanCase: { type: Type.STRING, description: "Kasus analisis tingkat tinggi / stimulus HOTS dunia nyata" },
            pengayaanTask: { type: Type.STRING, description: "Instruksi penugasan eksploratif menantang" }
          },
          required: ["tpCode", "remedialMaterial", "remedialQuestions", "pengayaanCase", "pengayaanTask"]
        }
      }
    });

    const dataText = response.text;
    res.json(JSON.parse(dataText || "{}"));
  } catch (err: any) {
    console.error("Error generating Remedial/Pengayaan:", err);
    res.status(500).json({ error: err.message || "Gagal menghasilkan Program Remedial & Pengayaan" });
  }
});

// Vite Middleware & Front-end Static Asset Handling
const startServer = async () => {
  // Vite integration in Dev mode
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Prod static files serving
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Smart-Guru Admin] Server running on http://localhost:${PORT}`);
  });
};

startServer().catch((err) => {
  console.error("[Smart-Guru Admin] Failed to start server:", err);
});
