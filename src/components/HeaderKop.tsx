/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { SchoolConfig } from "../types";
import { GraduationCap } from "lucide-react";

interface HeaderKopProps {
  config: SchoolConfig;
  documentTitle: string;
}

export const HeaderKop: React.FC<HeaderKopProps> = ({ config, documentTitle }) => {
  return (
    <div className="w-full text-black font-sans bg-white p-6 rounded-t-xl select-none" id="cop-surat-header">
      {/* Letterhead Header */}
      <div className="flex items-center justify-between border-b-4 border-double border-slate-900 pb-3">
        {/* Left Crest */}
        <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 border-2 border-slate-800 rounded-full bg-slate-50 text-slate-800">
          <GraduationCap className="w-10 h-10" />
        </div>

        {/* Center Text */}
        <div className="text-center flex-grow mx-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            KEMENTERIAN PENDIDIKAN, KEBUDAYAAN, RISET, DAN TEKNOLOGI
          </h4>
          <h3 className="text-sm font-extrabold uppercase tracking-widest text-slate-900 leading-tight">
            DINAS PENDIDIKAN PROVINSI DKI JAKARTA
          </h3>
          <h2 className="text-lg font-black uppercase text-slate-950 font-display">
            {config.schoolName}
          </h2>
          <p className="text-[10px] text-slate-600 italic">
            Jl. Pendidikan Raya No. 45, Kecamatan Gambir, Jakarta Pusat, DKI Jakarta • Telepon: (021) 555-0123 • Email: info@sdnmerdekajaya.sch.id
          </p>
        </div>

        {/* Right Crest Placeholder */}
        <div className="flex-shrink-0 w-16 h-16 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center flex-col text-[8px] text-slate-400 font-mono">
          <span>LOGO</span>
          <span>SEKOLAH</span>
        </div>
      </div>

      {/* Document Metas */}
      <div className="text-center mt-5 mb-3">
        <h1 className="text-base font-extrabold dark:text-slate-900 uppercase tracking-wide underline font-display decoration-2">
          {documentTitle}
        </h1>
        <p className="text-xs text-slate-600 mt-1">
          Tahun Ajaran {config.academicYear} • Semester {config.semester}
        </p>
      </div>

      {/* Metadata Grid */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-[11px] text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-200 mt-2">
        <div className="flex justify-between border-b border-dashed border-slate-200 pb-1">
          <span className="font-semibold text-slate-500">Mata Pelajaran:</span>
          <span className="font-medium text-slate-900">{config.subject}</span>
        </div>
        <div className="flex justify-between border-b border-dashed border-slate-200 pb-1">
          <span className="font-semibold text-slate-500">Kelas / Fase:</span>
          <span className="font-medium text-slate-900">{config.grade} / Fase {config.phase}</span>
        </div>
        <div className="flex justify-between border-b border-dashed border-slate-100 pb-0.5 sm:pb-1">
          <span className="font-semibold text-slate-500">Guru Pengampu:</span>
          <span className="font-medium text-slate-900">{config.teacherName} (NIP. {config.teacherNip || "-"})</span>
        </div>
        <div className="flex justify-between border-b border-dashed border-slate-100 pb-0.5 sm:pb-1">
          <span className="font-semibold text-slate-500">Kepala Sekolah:</span>
          <span className="font-medium text-slate-900">{config.headmasterName} (NIP. {config.headmasterNip || "-"})</span>
        </div>
      </div>
    </div>
  );
};
