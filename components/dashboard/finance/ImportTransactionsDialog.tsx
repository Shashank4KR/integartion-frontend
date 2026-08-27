"use client";

import { useState, useRef } from "react";
import Modal from "@/components/shared/Modal";
import { X, Upload, FileSpreadsheet, CheckCircle2 } from "lucide-react";

interface ImportTransactionsDialogProps {
  open: boolean;
  onClose: () => void;
  onImport: (file: File) => void;
}

export default function ImportTransactionsDialog({ open, onClose, onImport }: ImportTransactionsDialogProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleImport = () => {
    if (!selectedFile) return;
    setImporting(true);
    setTimeout(() => {
      setImporting(false);
      setImported(true);
      onImport(selectedFile);
    }, 1500);
  };

  const handleClose = () => {
    setSelectedFile(null);
    setImported(false);
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Import Transactions" maxWidth="max-w-lg">
      <div className="space-y-4 pt-2">
        {imported ? (
          <div className="text-center py-6 space-y-3">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
            <p className="text-base font-semibold text-slate-800">Import Complete</p>
            <p className="text-sm text-slate-500">{selectedFile?.name} has been processed successfully.</p>
            <div className="pt-3">
              <button
                type="button"
                onClick={handleClose}
                className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-lg px-6 py-2 text-sm font-semibold transition"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
                dragActive ? "border-[#7c3aed] bg-purple-50" : "border-slate-200 hover:border-purple-300"
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".csv,.xlsx"
                onChange={handleFileChange}
                className="hidden"
              />
              <FileSpreadsheet className="mx-auto h-10 w-10 text-slate-400 mb-3" />
              <p className="text-sm font-medium text-slate-600 mb-1">
                {selectedFile ? selectedFile.name : "Drag & drop your file here"}
              </p>
              {!selectedFile && <p className="text-xs text-slate-400">or click to browse</p>}
              <p className="text-xs text-slate-400 mt-2">Accepted formats: CSV, XLSX</p>
            </div>
            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => alert("Template download simulated")}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#7c3aed] hover:text-[#6d28d9] transition"
              >
                <Upload className="h-4 w-4" />
                Download Template
              </button>
              {selectedFile && (
                <span className="text-xs text-slate-500">
                  Selected: <span className="font-semibold text-slate-800">{selectedFile.name}</span>
                </span>
              )}
            </div>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleImport}
                disabled={!selectedFile || importing}
                className="bg-[#7c3aed] hover:bg-[#6d28d9] disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-lg px-4 py-2 text-sm font-semibold transition"
              >
                {importing ? "Importing..." : "Import"}
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

