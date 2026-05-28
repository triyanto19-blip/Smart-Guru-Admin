/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SchoolConfig, CalendarWeek, AlurTujuanPembelajaran, Student, DailyAttendance, TeachingJournal, CaseLog, KisiKisi, AssessmentRubric, StudentGrade } from "./types";

export const initialSchoolConfig: SchoolConfig = {
  schoolName: "SD Negeri Merdeka Jaya Jakarta",
  headmasterName: "Drs. H. Mulyono Sunarto, M.Pd.",
  headmasterNip: "196805121992031004",
  teacherName: "Triyanto, S.Pd.",
  teacherNip: "198909242015041002",
  phase: "C",
  grade: "Kelas 5",
  subject: "Ilmu Pengetahuan Alam dan Sosial (IPAS)",
  academicYear: "2025/2026",
  semester: "Ganjil",
  kktp: 70,
  weeklyJp: 4,
  schoolAddress: "Jl. Pendidikan Raya No. 45, Kecamatan Gambir, Jakarta Pusat, DKI Jakarta",
  schoolLogo: "",
  teacherSignatureType: "text",
  teacherSignatureData: "Triyanto, S.Pd.",
  headmasterSignatureType: "text",
  headmasterSignatureData: "Drs. H. Mulyono Sunarto, M.Pd.",
};

export const initialCalendarWeeks: CalendarWeek[] = [
  { weekNum: 1, dateRange: "14 - 18 Jul 2025", isEffective: true, activityName: "Belajar Efektif (TP 1.1)" },
  { weekNum: 2, dateRange: "21 - 25 Jul 2025", isEffective: true, activityName: "Belajar Efektif (TP 1.1)" },
  { weekNum: 3, dateRange: "28 Jul - 01 Agt 2025", isEffective: true, activityName: "Belajar Efektif (TP 1.2)" },
  { weekNum: 4, dateRange: "04 - 08 Agt 2025", isEffective: true, activityName: "Belajar Efektif (TP 1.2)" },
  { weekNum: 5, dateRange: "11 - 15 Agt 2025", isEffective: true, activityName: "Belajar Efektif (TP 1.3)" },
  { weekNum: 6, dateRange: "18 - 22 Agt 2025", isEffective: false, activityName: "HUT Kemerdekaan RI & Lomba Sekolah" },
  { weekNum: 7, dateRange: "25 - 29 Agt 2025", isEffective: true, activityName: "Belajar Efektif (TP 1.3)" },
  { weekNum: 8, dateRange: "01 - 05 Sep 2025", isEffective: true, activityName: "Belajar Efektif (TP 1.4)" },
  { weekNum: 9, dateRange: "08 - 12 Sep 2025", isEffective: true, activityName: "Belajar Efektif (TP 1.4)" },
  { weekNum: 10, dateRange: "15 - 19 Sep 2025", isEffective: false, activityName: "Sumatif Tengah Semester (STS)" },
  { weekNum: 11, dateRange: "22 - 26 Sep 2025", isEffective: true, activityName: "Belajar Efektif (TP 1.5)" },
  { weekNum: 12, dateRange: "29 Sep - 03 Okt 2025", isEffective: true, activityName: "Belajar Efektif (TP 1.5)" },
  { weekNum: 13, dateRange: "06 - 10 Okt 2025", isEffective: true, activityName: "Belajar Efektif (TP 1.6)" },
  { weekNum: 14, dateRange: "13 - 17 Okt 2025", isEffective: true, activityName: "Belajar Efektif (TP 1.6)" },
  { weekNum: 15, dateRange: "20 - 24 Okt 2025", isEffective: true, activityName: "Proyek Profil Pancasila (P5)" },
  { weekNum: 16, dateRange: "27 - 31 Okt 2025", isEffective: true, activityName: "Pendalaman Materi Akhir Semester" },
  { weekNum: 17, dateRange: "03 - 07 Nov 2025", isEffective: false, activityName: "Sumatif Akhir Semester (SAS)" },
  { weekNum: 18, dateRange: "10 - 14 Nov 2025", isEffective: false, activityName: "Class Meeting & Pembagian Rapor" },
];

export const initialStudents: Student[] = [
  { id: "S01", nisn: "0123456781", name: "Ahmad Fauzi", gender: "L" },
  { id: "S02", nisn: "0123456782", name: "Bunga Citra Lestari", gender: "P" },
  { id: "S03", nisn: "0123456783", name: "Candra Wijaya", gender: "L" },
  { id: "S04", nisn: "0123456784", name: "Dewi Sartika", gender: "P" },
  { id: "S05", nisn: "0123456785", name: "Eko Prasetyo", gender: "L" },
  { id: "S06", nisn: "0123456786", name: "Fitriani Handayani", gender: "P" },
  { id: "S07", nisn: "0123456787", name: "Guntur Saputra", gender: "L" },
  { id: "S08", nisn: "0123456788", name: "Hana Aqilah", gender: "P" },
  { id: "S09", nisn: "0123456789", name: "Irfan Hakim", gender: "L" },
  { id: "S10", nisn: "0123456790", name: "Julia Perez", gender: "P" },
  { id: "S11", nisn: "0123456791", name: "Kurniawan Dwi Y.", gender: "L" },
  { id: "S12", nisn: "0123456792", name: "Larasati Kirana", gender: "P" },
  { id: "S13", nisn: "0123456793", name: "Muhammad Rizky", gender: "L" },
  { id: "S14", nisn: "0123456794", name: "Nadia Vega", gender: "P" },
  { id: "S15", nisn: "0123456795", name: "Oki Setiana Dewi", gender: "P" },
];

export const initialAtpList: AlurTujuanPembelajaran[] = [
  { id: "ATP01", code: "TP 1.1", tpText: "Menganalisis hubungan antara bentuk dan fungsi bagian tubuh pada manusia dan hewan (pancaindra & organ gerak).", jpAllocation: 8, targetWeeks: [1, 2] },
  { id: "ATP02", code: "TP 1.2", tpText: "Menganalisis siklus hidup makhluk hidup di sekitarnya dan mengaitkannya dengan upaya pelestariannya.", jpAllocation: 8, targetWeeks: [3, 4] },
  { id: "ATP03", code: "TP 1.3", tpText: "Mengidentifikasi macam-macam gaya (gaya otot, pegas, gesek, magnet, gravitasi) serta pengaruhnya terhadap benda.", jpAllocation: 8, targetWeeks: [5, 7] },
  { id: "ATP04", code: "TP 1.4", tpText: "Menyelidiki berbagai bentuk energi (kinetik, potensial, panas, bunyi, cahaya) serta transformasinya dalam kehidupan sehari-hari.", jpAllocation: 8, targetWeeks: [8, 9] },
  { id: "ATP05", code: "TP 1.5", tpText: "Mendeskripsikan sistem organ pernapasan, pencernaan, dan peredaran darah manusia serta cara memelihara kesehatannya.", jpAllocation: 8, targetWeeks: [11, 12] },
  { id: "ATP06", code: "TP 1.6", tpText: "Menganalisis keterkaitan kondisi geografis wilayah Indonesia dengan keanekaragaman sosial budaya dan ekonomi.", jpAllocation: 8, targetWeeks: [13, 14] },
];

export const initialAttendance: DailyAttendance[] = [
  {
    date: "2026-05-25",
    records: {
      S01: "Hadir", S02: "Hadir", S03: "Sakit", S04: "Hadir", S05: "Hadir",
      S06: "Hadir", S07: "Hadir", S08: "Izin", S09: "Hadir", S10: "Hadir",
      S11: "Hadir", S12: "Hadir", S13: "Alpa", S14: "Hadir", S15: "Hadir"
    }
  },
  {
    date: "2026-05-26",
    records: {
      S01: "Hadir", S02: "Hadir", S03: "Hadir", S04: "Hadir", S05: "Hadir",
      S06: "Hadir", S07: "Hadir", S08: "Hadir", S09: "Hadir", S10: "Hadir",
      S11: "Hadir", S12: "Hadir", S13: "Hadir", S14: "Hadir", S15: "Hadir"
    }
  }
];

export const initialJournals: TeachingJournal[] = [
  {
    id: "J01",
    date: "2026-05-25",
    tpCode: "TP 1.1",
    topic: "Pancaindra Manusia (Fungsi Mata dan Telinga)",
    jpRealized: 4,
    status: "Selesai",
    notes: "Siswa sangat antusias melakukan percobaan menebak arah bunyi dengan mata tertutup. Pemahaman materi fungsi reseptor pendengaran tercapai dengan baik."
  },
  {
    id: "J02",
    date: "2026-05-26",
    tpCode: "TP 1.1",
    topic: "Organ Gerak Vertebrata & Avertebrata",
    jpRealized: 4,
    status: "Tersisa 1 sub-bab",
    notes: "Sebagian siswa masih sering keliru mengklasifikasikan siput dan kepiting ke dalam kelompok avertebrata. Sisa waktu digunakan untuk melatih penulisan nama ilmiah sederhana."
  }
];

export const initialCaseLogs: CaseLog[] = [
  {
    id: "CL01",
    date: "2026-05-25",
    studentId: "S01",
    behaviorType: "Positif",
    behaviorDescription: "Sangat proaktif membantu merapikan alat peraga laboratorium IPA setelah jam kelas selesai secara sukarela.",
    followUp: "Diberi apresiasi di depan kelas keesokan harinya untuk meningkatkan motivasi berbuat kebaikan bagi siswa lainnya."
  },
  {
    id: "CL02",
    date: "2026-05-26",
    studentId: "S13",
    behaviorType: "Negatif",
    behaviorDescription: "Ketahuan tidur bertumpu dagu saat guru menjelaskan organ gerak avertebrata di depan kelas.",
    followUp: "Diajak berdialog secara ramah di meja guru selepas kelas (pendekatan disiplin positif) untuk mencari tahu faktor kelelahan di rumah."
  }
];

export const initialGrades: StudentGrade[] = [
  { studentId: "S01", formativeGrades: { "TP 1.1": 85, "TP 1.2": 80, "TP 1.3": 90, "TP 1.4": 88 }, midtermGrade: 85, finalGrade: 86 },
  { studentId: "S02", formativeGrades: { "TP 1.1": 92, "TP 1.2": 88, "TP 1.3": 85, "TP 1.4": 94 }, midtermGrade: 90, finalGrade: 92 },
  { studentId: "S03", formativeGrades: { "TP 1.1": 65, "TP 1.2": 68, "TP 1.3": 60, "TP 1.4": 72 }, midtermGrade: 65, finalGrade: 68 }, // Remedial
  { studentId: "S04", formativeGrades: { "TP 1.1": 78, "TP 1.2": 82, "TP 1.3": 80, "TP 1.4": 85 }, midtermGrade: 80, finalGrade: 82 },
  { studentId: "S05", formativeGrades: { "TP 1.1": 60, "TP 1.2": 62, "TP 1.3": 58, "TP 1.4": 65 }, midtermGrade: 60, finalGrade: 61 }, // Remedial
  { studentId: "S06", formativeGrades: { "TP 1.1": 80, "TP 1.2": 78, "TP 1.3": 82, "TP 1.4": 80 }, midtermGrade: 80, finalGrade: 81 },
  { studentId: "S07", formativeGrades: { "TP 1.1": 74, "TP 1.2": 72, "TP 1.3": 75, "TP 1.4": 78 }, midtermGrade: 73, finalGrade: 75 },
  { studentId: "S08", formativeGrades: { "TP 1.1": 88, "TP 1.2": 90, "TP 1.3": 92, "TP 1.4": 91 }, midtermGrade: 88, finalGrade: 90 },
  { studentId: "S09", formativeGrades: { "TP 1.1": 55, "TP 1.2": 60, "TP 1.3": 65, "TP 1.4": 58 }, midtermGrade: 58, finalGrade: 60 }, // Remedial
  { studentId: "S10", formativeGrades: { "TP 1.1": 84, "TP 1.2": 85, "TP 1.3": 82, "TP 1.4": 86 }, midtermGrade: 85, finalGrade: 84 },
  { studentId: "S11", formativeGrades: { "TP 1.1": 76, "TP 1.2": 80, "TP 1.3": 78, "TP 1.4": 79 }, midtermGrade: 78, finalGrade: 77 },
  { studentId: "S12", formativeGrades: { "TP 1.1": 95, "TP 1.2": 92, "TP 1.3": 96, "TP 1.4": 94 }, midtermGrade: 94, finalGrade: 95 },
  { studentId: "S13", formativeGrades: { "TP 1.1": 50, "TP 1.2": 52, "TP 1.3": 48, "TP 1.4": 55 }, midtermGrade: 50, finalGrade: 52 }, // Remedial
  { studentId: "S14", formativeGrades: { "TP 1.1": 82, "TP 1.2": 80, "TP 1.3": 84, "TP 1.4": 85 }, midtermGrade: 83, finalGrade: 82 },
  { studentId: "S15", formativeGrades: { "TP 1.1": 78, "TP 1.2": 76, "TP 1.3": 80, "TP 1.4": 79 }, midtermGrade: 78, finalGrade: 78 },
];

export const sampleModulAjar: { [tpCode: string]: any } = {
  "TP 1.1": {
    tpCode: "TP 1.1",
    tpText: "Menganalisis hubungan antara bentuk dan fungsi bagian tubuh pada manusia dan hewan (pancaindra & organ gerak).",
    diferensiasiType: "Tidak",
    identitas: {
      sekolah: "SD Negeri Merdeka Jaya Jakarta",
      fase: "C",
      kelas: "Kelas 5",
      mapel: "Ilmu Pengetahuan Alam dan Sosial (IPAS)",
      alokasiWaktu: "8 JP (2 Kali Pertemuan x 4 JP)",
      profilPancasila: ["Beriman & Bertakwa kepada Tuhan YME", "Bernalar Kritis", "Gotong Royong"],
      saranaPrasarana: "Buku Paket IPAS, Gambar Sistem Indra & Rangka, LKPD Praktikum Indra, Slide PPT, Proyektor, Penutup Mata, Peluit",
      targetSiswa: "Peserta didik Reguler/Tipikal (Non-Berkebutuhan Khusus), Jumlah Siswa: 15 Anak",
      modelPembelajaran: "Inkuiri / Problem Based Learning (PBL) secara Berkelompok"
    },
    komponenInti: {
      tujuanPembelajaran: "Siswa mampu menganalisis keterkaitan bentuk fisik dengan fungsi fisiologis panca indra (mata dan telinga) manusia secara cermat melakukan penjelajahan taktil.",
      pemahamanBermakna: "Pahamilah bahwa kesempurnaan anatomi indra kita merupakan anugerah Sang Pencipta yang patut dijaga dengan pola hidup bersih agar fungsinya tetap prima menavigasi dunia fisik.",
      pertanyaanPemantik: "Bagaimana rasanya bila seharian kita belajar dengan mata terpejam penuh? Bagaimana telinga kita mendeteksi letak klakson motor di jalanan?",
      asesmenAwalDiagnostik: "Pre-test lisan kilat tentang 5 nama indra dan letaknya, kuesioner singkat gaya belajar terfokus."
    },
    langkahPembelajaran: {
      pendahuluan: `
<p><strong>1. Orientasi & Doa:</strong> Pembelajaran dimulai dengan salam pembuka hangat, berdoa dipimpin ketua kelas, dan pemeriksaan kelengkapan belajar murid.</p>
<p><strong>2. Apersepsi Kognitif:</strong> Guru meredupkan lampu tiba-tiba dan memutar suara rekaman jangkrik, meminta siswa menebak suara apa dan apa indra yang aktif.</p>
<p><strong>3. Motivasi Berfaedah:</strong> Guru menyiarkan tujuan pembelajaran, manfaat anatomi indra dalam kehidupan biologis sehari-hari, serta metode penjelajahan inkuri.</p>
      `,
      inti: `
<p><strong>Pertemuan 1 (Sistem Penglihatan/Mata):</strong></p>
<ul>
  <li>Siswa dibagi menjadi 3 tim kecil heterogen untuk menguji fokus pupil mata menggunakan senter redup secara bergantian.</li>
  <li>Tim mengamati melebarnya atau menyempitnya pupil saat cahaya didekatkan dan diganti jaraknya, dilanjutkan analisis mekanika cahaya.</li>
  <li>Setiap siswa merumuskan jalannya cahaya: Kornea -> Pupil -> Lensa -> Retina -> Saraf Optik -> Otak.</li>
</ul>
<br/>
<p><strong>Pertemuan 2 (Sistem Pendengaran/Telinga):</strong></p>
<ul>
  <li>Eksperimen 'Tebak Asal Suara': Satu perwakilan ditutup matanya, anggota tim membunyikan peluit atau ketukan dari sudut acak, siswa mengira jarak & arah.</li>
  <li>Guru memberikan pemantapan materi fungsi gendang telinga (membran timpani) menerima tekanan getaran udara.</li>
</ul>
      `,
      penutup: `
<p><strong>1. Sintesis & Refleksi:</strong> Murid bersama guru menyusun kesimpulan rute mekanika visual dan audiotori pada tabel rangkuman tulis.</p>
<p><strong>2. Evaluasi Formatif:</strong> Siswa mengisi kuis cepat 3 butir soal terkait refraksi visual dan fungsi koklea.</p>
<p><strong>3. Tindak Lanjut:</strong> Guru menginstruksikan siswa mencatat 2 perilaku sehat menjaga kebersihan kesehatan indra mata di rumah.</p>
      `
    },
    materiBahanAjar: `### MATERI AJAR: INDRA PENGLIHATAN DAN INDRA PENDENGARAN MANUSIA

Setiap makhluk hidup memerlukan sarana pendeteksi rangsangan eksternal demi mempertahankan hidupnya. Pada manusia, sarana pendeteksi tersebut berevolusi menjadi alat indra (reseptor sensorik). 

#### A. INDRA PENGLIHATAN (MATA)
Mata adalah organ indra yang peka terhadap gelombang elektromagnetik cahaya. Struktur mata terbagi menjadi dua bagian pelindung dan fungsional:
1. **Bagian Luar (Pelindung):** Alis mata (menahan keringat), kelopak mata (menutup bola mata agar basah), bulu mata (menghalau debu).
2. **Bagian Dalam (Fungsional):**
   - **Sklerat (Selaput Putih):** Lapisan pelindung luar yang kuat.
   - **Kornea:** Lapisan bening pelindung depan yang meloloskan berkas cahaya menerobos lensa.
   - **Pupil:** Celah sirkular hitam penadah kuantitas intensitas cahaya. Pupil membesar dalam gelap (midriasis) dan mengecil dalam benderang (miosis).
   - **Iris:** Selaput berpigmen pemberi corak warna mata yang meregulasi diameter pupil.
   - **Lensa Mata:** Media pembias cahaya elastis berkemampuan akomodasi mencembung/memipih agar bayangan jatuh tepat di bintik kuning retina.
   - **Retina:** Lapisan peka cahaya bersaraf fotoreseptor kerucut (sel warna) dan batang (sel peka redup).
   - **Saraf Optik:** Kabel komunikator penghantar impuls listrik tangkapan mata ke lobus oksipitalis otak besar untuk dipersepsikan sebagai objek visual tegak.

#### B. INDRA PENDENGARAN (TELINGA)
Telinga merubah gelombang mekanik bunyi menjadi sinyal bioelektrik otak. Anatominya meliputi:
1. **Telinga Luar:** Daun kartilago (menangkap dan corong bunyi) dan lubang saluran telinga luar (dilengkapi kelenjar serumen antibakteri).
2. **Telinga Tengah:** Membran timpani (gendang peka getar) dan tulang pendengaran (Maleus/Martil, Inkus/Landasan, Stapes/Sanggurdi) pengeras amplitudo getar mekanis.
3. **Telinga Dalam:** Koklea (rumah siput berisi organ korti bersilia peka fluida perilimfe) pengonversi gerak fisik zat alir menjadi pulsa elektrik, serta Saluran Setengah Lingkaran (semisirkular) pemelihara keseimbangan posisi tubuh (propriosepsi).`,
    pptOverview: {
      slides: [
        { slideNum: 1, title: "Selamat Datang di Dunia Indra Kita!", content: ["Melihat dunia benderang dan mendengar riuh alam", "Mengapa pancaindra esensial bagi biologi manusia?", "Peran Triyanto, S.Pd. - SDN Merdeka Jaya Jakarta"] },
        { slideNum: 2, title: "Indra Penglihatan: Anatomi Mata", content: ["Kornea & Iris: Pelindung & Pengatur Cahaya", "Lensa & Retina: Tempat Jatuhnya Bayangan Nyata Terbalik", "Saraf Optik: Penghubung Kilat ke Otak Kita"] },
        { slideNum: 3, title: "Indra Pendengaran: Getaran & Mekanika", content: ["Daun Telinga & Gendang Telinga peka getar jernih", "Koklea (Rumah Siput): Konverter Getaran Fluida", "Menjaga Keseimbangan Tubuh lewat Semisirkular"] },
        { slideNum: 4, title: "Ayo Jaga Kesehatan Pancaindra!", content: ["Bahaya radiasi layar gadget berlebihan", "Menghindari suara desibel bising merusak membran timpani", "Pemberian nutrisi Vitamin A secara teratur"] }
      ]
    },
    lkpd: {
      petunjuk: [
        "Bacalah seluruh petunjuk aktivitas ini secara saksama bersama kawan sekelompok.",
        "Siapkan alat penutup mata kain dan koin besi pencekel suara.",
        "Catatlah seluruh tebakan pada tabel pengamatan LKPD yang tersedia."
      ],
      aktivitas: "Eksperimen Lokalisasi Sumber Gelombang Bunyi: Siswa duduk berpasangan, salah satu menggunakan penutup mata. Pasangan lainnya mengetuk koin logam pada jarak 1 meter dari arah: Depan, Belakang, Samping Kanan, Samping Kiri. Pengisi mata harus menebak posisi sumber bunyi tanpa menoleh. Ulangi sebayak 5 percobaan acak, catat persentase akurasi.",
      pertanyaanPemantikLogika: [
        "Mengapa tebakan arah bunyi di samping kanan/kiri jauh lebih akurat dibanding tebakan persis di depan/belakang kepala?",
        "Tuliskan analisis kaitan jarak tempuh rambatan bunyi ke telinga kiri vs telinga kanan terhadap kecepatan persepsi visual otak."
      ]
    }
  }
};
