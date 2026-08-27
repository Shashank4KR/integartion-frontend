"use client";

import { useState, useRef } from "react";
import { X, Upload, FileSpreadsheet, Download } from "lucide-react";
import Modal from "@/components/shared/Modal";
import { Button } from "@/components/ui/button";

interface ImportInvoicesDialogProps {
  open: boolean;
  onClose: () => void;
  onImport: (file: File) => void;
}

export default function ImportInvoicesDialog({ open, onClose, onImport }: ImportInvoicesDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setPreview(true);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setPreview(true);
    }
  };

  const handleImport = () => {
    if (file) {
      onImport(file);
      setFile(null);
      setPreview(false);
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Import Invoices" maxWidth="max-w-lg">
      <div className="space-y-4 pt-2">
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
            dragActive ? "border-[#7c3aed] bg-purple-50" : "border-slate-200 hover:border-purple-300"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx"
            onChange={handleFileChange}
            className="hidden"
          />
          <Upload className="mx-auto h-10 w-10 text-slate-400 mb-3" />
          <p className="text-sm font-medium text-slate-600 mb-1">
            Drag & drop your file here, or <span className="text-[#7c3aed] font-semibold">browse</span>
          </p>
          <p className="text-xs text-slate-400">Supported formats: CSV, XLSX</p>
        </div>
        <div className="flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={() => alert("Template downloaded")}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#7c3aed] hover:text-[#6d28d9] transition"
          >
            <Download className="h-4 w-4" />
            Download Template
          </button>
          {file && (
            <span className="text-xs text-slate-500">
              Selected: <span className="font-semibold text-slate-800">{file.name}</span>
            </span>
          )}
        </div>
        {preview && file && (
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="h-8 w-8 text-[#7c3aed]" />
              <div>
                <p className="text-sm font-semibold text-slate-800">{file.name}</p>
                <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(2)} KB</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2">Preview will be available after import</p>
          </div>
        )}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleImport}
            disabled={!file}
            className="bg-[#7c3aed] hover:bg-[#6d28d9] disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-lg px-4 py-2 text-sm font-semibold transition"
          >
            Import
          </button>
        </div>
      </div>
    </Modal>
  );
}

