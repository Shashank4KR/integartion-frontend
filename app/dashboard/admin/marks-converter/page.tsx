"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import MainLayout from "@/components/shared/layout/MainLayout";
import Sidebar from "@/components/shared/layout/Sidebar";
import DashboardHeader from "@/components/shared/layout/Header";
import { COMPANY_INFO } from "@/lib/constants";
import {
  convertMarks,
  createConversionRule,
  getConversionHistory,
  getConversionRules,
  getMarksConverterOptions,
  updateConversionRule,
  type BoardDirection,
  type MarksConversionResult,
  type MarksConverterOptions,
  type MarksConversionRule,
  type MarksConversionHistoryEntry,
  type MarksRulePayload,
} from "@/lib/services/marksConverterService";
import {
  ArrowLeftRight,
  BadgeCheck,
  Calculator,
  Check,
  ExternalLink,
  FileCheck2,
  History,
  LoaderCircle,
  Pencil,
  Printer,
  RotateCcw,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

type FormState = {
  state: string;
  class_grade: string;
  subject: string;
  exam_type: string;
  academic_year: string;
  marks_obtained: string;
  source_max_marks: string;
  target_max_marks: string;
};

const INITIAL_FORM: FormState = {
  state: "Karnataka",
  class_grade: "Class 10",
  subject: "",
  exam_type: "Annual",
  academic_year: "2026-2027",
  marks_obtained: "",
  source_max_marks: "100",
  target_max_marks: "100",
};

const INITIAL_RULE: MarksRulePayload = {
  board_direction: "CBSE_TO_STATE",
  state: "Karnataka",
  class_grade: "Class 10",
  subject: "",
  exam_type: "Annual",
  academic_year: "2026-2027",
  source_max_marks: 100,
  target_max_marks: 100,
  method: "PROPORTIONAL",
  source_title: "",
  reference_url: "",
  is_official: false,
  is_active: true,
};

const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100 disabled:bg-slate-100";
const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500";

function toRulePayload(rule: MarksConversionRule): MarksRulePayload {
  return {
    board_direction: rule.board_direction,
    state: rule.state,
    class_grade: rule.class_grade,
    subject: rule.subject ?? "",
    exam_type: rule.exam_type,
    academic_year: rule.academic_year,
    source_max_marks: Number(rule.source_max_marks),
    target_max_marks: Number(rule.target_max_marks),
    method: rule.method,
    source_title: rule.source_title ?? "",
    reference_url: rule.reference_url ?? "",
    is_official: rule.is_official,
    is_active: rule.is_active,
  };
}

export default function MarksConverterPage() {
  const [direction, setDirection] = useState<BoardDirection>("CBSE_TO_STATE");
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [options, setOptions] = useState<MarksConverterOptions | null>(null);
  const [result, setResult] = useState<MarksConversionResult | null>(null);
  const [history, setHistory] = useState<MarksConversionHistoryEntry[]>([]);
  const [rules, setRules] = useState<MarksConversionRule[]>([]);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [ruleForm, setRuleForm] = useState<MarksRulePayload>(INITIAL_RULE);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [savingRule, setSavingRule] = useState(false);

  const refreshHistory = useCallback(async () => {
    setHistory(await getConversionHistory());
  }, []);

  const refreshRules = useCallback(async () => {
    if (!isAdmin) return;
    setRules(await getConversionRules());
  }, [isAdmin]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("nomera_user");
      const user = stored ? JSON.parse(stored) : null;
      const role = (user?.role?.role_name ?? user?.role_name ?? "").toUpperCase();
      setIsAdmin(["ADMIN", "SUPER_ADMIN", "SUPERADMIN"].includes(role));
    } catch {
      setIsAdmin(false);
    }
    Promise.all([getMarksConverterOptions(), getConversionHistory()])
      .then(([loadedOptions, loadedHistory]) => {
        setOptions(loadedOptions);
        setHistory(loadedHistory);
      })
      .catch((loadError: unknown) => setError(loadError instanceof Error ? loadError.message : "Could not load the marks converter."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    refreshRules().catch((loadError: unknown) => setAdminError(loadError instanceof Error ? loadError.message : "Could not load conversion rules."));
  }, [isAdmin, refreshRules]);

  const getBoardNames = (dir: BoardDirection, state: string) => {
    switch (dir) {
      case "CBSE_TO_STATE": return { source: "CBSE", target: `${state} State Board` };
      case "STATE_TO_CBSE": return { source: `${state} State Board`, target: "CBSE" };
      case "ICSE_TO_CBSE": return { source: "ICSE / ISC", target: "CBSE" };
      case "CBSE_TO_ICSE": return { source: "CBSE", target: "ICSE / ISC" };
      case "ICSE_TO_STATE": return { source: "ICSE / ISC", target: `${state} State Board` };
      case "STATE_TO_ICSE": return { source: `${state} State Board`, target: "ICSE / ISC" };
      default: return { source: "CBSE", target: `${state} State Board` };
    }
  };
  const { source: sourceBoard, target: targetBoard } = getBoardNames(direction, form.state);
  const matchingRule = useMemo(() => {
    const applicable = rules.filter((rule) =>
      rule.is_active && rule.is_official &&
      rule.board_direction === direction && rule.state === form.state &&
      rule.class_grade === form.class_grade && rule.exam_type === form.exam_type &&
      rule.academic_year === form.academic_year &&
      (!rule.subject || rule.subject.toLowerCase() === form.subject.trim().toLowerCase())
    );
    return applicable.find((rule) => rule.subject) ?? applicable[0];
  }, [rules, direction, form]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setError(null);
  }

  function resetForm() {
    setForm(INITIAL_FORM);
    setResult(null);
    setError(null);
  }

  async function handleConvert(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setResult(null);
    const marks = Number(form.marks_obtained);
    const sourceMax = Number(form.source_max_marks);
    const targetMax = Number(form.target_max_marks);
    if (!Number.isFinite(marks) || !Number.isFinite(sourceMax) || !Number.isFinite(targetMax)) {
      setError("Enter valid numbers for marks and both maximum marks.");
      return;
    }
    if (marks < 0) { setError("Marks obtained cannot be negative."); return; }
    if (sourceMax <= 0 || targetMax <= 0) { setError("Source and target maximum marks must be greater than zero."); return; }
    if (marks > sourceMax) { setError("Marks obtained cannot exceed the source maximum marks."); return; }
    setBusy(true);
    try {
      const converted = await convertMarks({
        board_direction: direction,
        state: form.state,
        class_grade: form.class_grade,
        subject: form.subject.trim() || null,
        exam_type: form.exam_type,
        academic_year: form.academic_year.trim(),
        marks_obtained: marks,
        source_max_marks: sourceMax,
        target_max_marks: targetMax,
      });
      setResult(converted);
      await refreshHistory();
    } catch (convertError) {
      setError(convertError instanceof Error ? convertError.message : "The marks could not be converted.");
    } finally {
      setBusy(false);
    }
  }

  async function saveRule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAdminError(null);
    if (ruleForm.is_official && (!ruleForm.source_title?.trim() || !ruleForm.reference_url?.trim())) {
      setAdminError("An official rule needs its source document title and reference URL.");
      return;
    }
    setSavingRule(true);
    try {
      const payload = { ...ruleForm, state: ruleForm.state.trim(), class_grade: ruleForm.class_grade.trim(), subject: ruleForm.subject?.trim() || null, exam_type: ruleForm.exam_type.trim(), academic_year: ruleForm.academic_year.trim(), source_title: ruleForm.source_title?.trim() || null, reference_url: ruleForm.reference_url?.trim() || null };
      if (editingRuleId) await updateConversionRule(editingRuleId, payload);
      else await createConversionRule(payload);
      setNotice(editingRuleId ? "Conversion rule updated." : "Conversion rule added.");
      setRuleForm(INITIAL_RULE);
      setEditingRuleId(null);
      await refreshRules();
    } catch (saveError) {
      setAdminError(saveError instanceof Error ? saveError.message : "Could not save this conversion rule.");
    } finally {
      setSavingRule(false);
    }
  }

  async function toggleRule(rule: MarksConversionRule) {
    setAdminError(null);
    try {
      await updateConversionRule(rule.id, { is_active: !rule.is_active });
      await refreshRules();
    } catch (toggleError) {
      setAdminError(toggleError instanceof Error ? toggleError.message : "Could not update this rule.");
    }
  }

  function beginRuleEdit(rule: MarksConversionRule) {
    setRuleForm(toRulePayload(rule));
    setEditingRuleId(rule.id);
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }

  return (
    <MainLayout sidebar={<Sidebar />} header={<DashboardHeader />}>
      <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
        <style jsx global>{`
          @media print {
            body * { visibility: hidden !important; }
            #marks-converter-print-result,
            #marks-converter-print-result * { visibility: visible !important; }
            #marks-converter-print-result { position: absolute; inset: 0; width: 100%; border: 0; box-shadow: none; }
          }
        `}</style>
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700"><Calculator className="h-3.5 w-3.5" /> Academic tools</p>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Marks Converter</h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-500">Cross-board academic equivalence calculator supporting CBSE, ICSE / ISC, and State Boards with proportional and 80/20 assessment weighting.</p>
          </div>
          <button type="button" onClick={() => window.print()} disabled={!result} className="print:hidden inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"><Printer className="h-4 w-4" /> Print result</button>
        </header>

        {error && <Alert tone="error" message={error} />}
        {notice && <Alert tone="success" message={notice} />}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-4 sm:p-6">
            <div className="mb-5 flex flex-wrap gap-2 rounded-xl bg-slate-100 p-1.5 sm:inline-flex">
              <DirectionButton active={direction === "CBSE_TO_STATE"} onClick={() => { setDirection("CBSE_TO_STATE"); setResult(null); }} label="CBSE → State Board" />
              <DirectionButton active={direction === "STATE_TO_CBSE"} onClick={() => { setDirection("STATE_TO_CBSE"); setResult(null); }} label="State Board → CBSE" />
              <DirectionButton active={direction === "ICSE_TO_CBSE"} onClick={() => { setDirection("ICSE_TO_CBSE"); setResult(null); }} label="ICSE → CBSE" />
              <DirectionButton active={direction === "CBSE_TO_ICSE"} onClick={() => { setDirection("CBSE_TO_ICSE"); setResult(null); }} label="CBSE → ICSE" />
              <DirectionButton active={direction === "ICSE_TO_STATE"} onClick={() => { setDirection("ICSE_TO_STATE"); setResult(null); }} label="ICSE → State Board" />
              <DirectionButton active={direction === "STATE_TO_ICSE"} onClick={() => { setDirection("STATE_TO_ICSE"); setResult(null); }} label="State Board → ICSE" />
            </div>
            <div className="grid gap-3 rounded-xl bg-gradient-to-r from-violet-50 via-white to-sky-50 p-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
              <BoardCard label="Source board" value={sourceBoard} />
              <ArrowLeftRight className="mx-auto h-5 w-5 text-violet-500" />
              <BoardCard label="Target board" value={targetBoard} />
            </div>
          </div>

          <form onSubmit={handleConvert} className="grid gap-x-5 gap-y-4 p-4 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
            <Field label="State board">
              <select className={inputClass} value={form.state} onChange={(event) => updateField("state", event.target.value)} disabled={loading}>
                {(options?.states ?? ["Karnataka", "Tamil Nadu", "Kerala", "Maharashtra"]).map((state) => <option key={state}>{state}</option>)}
              </select>
            </Field>
            <Field label="Class / grade">
              <select className={inputClass} value={form.class_grade} onChange={(event) => updateField("class_grade", event.target.value)} disabled={loading}>
                {(options?.classes ?? Array.from({ length: 12 }, (_, index) => `Class ${index + 1}`)).map((grade) => <option key={grade}>{grade}</option>)}
              </select>
            </Field>
            <Field label="Subject (optional)"><select className={inputClass} value={form.subject} onChange={(event) => updateField("subject", event.target.value)}><option value="">All subjects</option>{(options?.subjects ?? []).map((subject) => <option key={subject}>{subject}</option>)}</select></Field>
            <Field label="Examination type">
              <select className={inputClass} value={form.exam_type} onChange={(event) => updateField("exam_type", event.target.value)}>
                {(options?.exam_types ?? ["Annual", "Half Yearly", "Board Examination", "Other"]).map((exam) => <option key={exam}>{exam}</option>)}
              </select>
            </Field>
            <Field label="Academic year"><input className={inputClass} value={form.academic_year} onChange={(event) => updateField("academic_year", event.target.value)} placeholder="2026-2027" maxLength={20} required /></Field>
            <div className="hidden lg:block" />
            <Field label={`Marks obtained (${sourceBoard})`}><input className={inputClass} type="number" min="0" step="0.01" value={form.marks_obtained} onChange={(event) => updateField("marks_obtained", event.target.value)} placeholder="e.g. 80" required /></Field>
            <Field label="Source maximum marks"><input className={inputClass} type="number" min="0.01" step="0.01" value={form.source_max_marks} onChange={(event) => updateField("source_max_marks", event.target.value)} required /></Field>
            <Field label="Target examination maximum marks" hint={matchingRule ? `Set by verified rule: ${matchingRule.source_title}` : "Used for proportional estimate"}>
              <input className={inputClass} type="number" min="0.01" step="0.01" value={matchingRule ? matchingRule.target_max_marks : form.target_max_marks} onChange={(event) => updateField("target_max_marks", event.target.value)} disabled={!!matchingRule} required />
            </Field>

            {matchingRule && <div className="sm:col-span-2 lg:col-span-3"><p className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800"><BadgeCheck className="mt-0.5 h-4 w-4 shrink-0" /> Verified official rule applies to these selections. The configured target maximum is used and cannot be overridden.</p></div>}
            <div className="print:hidden flex flex-wrap gap-3 sm:col-span-2 lg:col-span-3">
              <button type="submit" disabled={busy || loading} className="inline-flex min-w-40 items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 disabled:cursor-wait disabled:opacity-60">{busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Calculator className="h-4 w-4" />} Convert Marks</button>
              <button type="button" onClick={resetForm} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"><RotateCcw className="h-4 w-4" /> Reset</button>
            </div>
          </form>
        </section>

        {result && <ResultCard result={result} />}

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4"><History className="h-5 w-5 text-violet-600" /><div><h2 className="font-semibold text-slate-900">Your conversion history</h2><p className="text-xs text-slate-500">Only your recent conversions are shown.</p></div></div>
          {loading ? <div className="p-8 text-center text-sm text-slate-500"><LoaderCircle className="mx-auto mb-2 h-5 w-5 animate-spin" />Loading history…</div> : history.length === 0 ? <p className="p-8 text-center text-sm text-slate-500">Your conversions will appear here.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Date</th><th className="px-5 py-3">Direction</th><th className="px-5 py-3">Class / subject</th><th className="px-5 py-3">Before</th><th className="px-5 py-3">Equivalent</th><th className="px-5 py-3">Method</th></tr></thead><tbody className="divide-y divide-slate-100">{history.map((entry) => <tr key={entry.id}><td className="px-5 py-3 text-slate-500">{new Date(entry.created_at).toLocaleDateString()}</td><td className="px-5 py-3 font-medium text-slate-700">{entry.board_direction === "CBSE_TO_STATE" ? "CBSE → State" : "State → CBSE"}</td><td className="px-5 py-3 text-slate-600">{entry.class_grade}{entry.subject ? ` · ${entry.subject}` : ""}</td><td className="px-5 py-3 tabular-nums">{entry.marks_obtained}/{entry.source_max_marks}</td><td className="px-5 py-3 font-semibold tabular-nums">{entry.target_marks}/{entry.target_max_marks}</td><td className="px-5 py-3">{entry.is_official ? <span className="text-emerald-700">Official rule</span> : <span className="text-amber-700">Estimate</span>}</td></tr>)}</tbody></table></div>}
        </section>

        {isAdmin && <AdminRulePanel rules={rules} options={options} ruleForm={ruleForm} setRuleForm={setRuleForm} editingRuleId={editingRuleId} savingRule={savingRule} error={adminError} onSave={saveRule} onEdit={beginRuleEdit} onToggle={toggleRule} onCancel={() => { setEditingRuleId(null); setRuleForm(INITIAL_RULE); }} />}

        <footer className="flex items-center justify-between border-t border-slate-200 px-1 py-4 text-xs text-slate-500 print:hidden"><span>{COMPANY_INFO.copyright}</span><span>Version {COMPANY_INFO.version}</span></footer>
      </div>
    </MainLayout>
  );
}

function DirectionButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return <button type="button" onClick={onClick} className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${active ? "bg-white text-violet-700 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>{label}</button>;
}

function BoardCard({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg bg-white/80 px-4 py-3"><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 font-semibold text-slate-800">{value}</p></div>;
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return <label className="block"><span className={labelClass}>{label}</span>{children}{hint && <span className="mt-1 block text-[11px] text-slate-400">{hint}</span>}</label>;
}

function Alert({ tone, message }: { tone: "error" | "success"; message: string }) {
  return <div role={tone === "error" ? "alert" : "status"} className={`rounded-xl border px-4 py-3 text-sm ${tone === "error" ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>{message}</div>;
}

function ResultCard({ result }: { result: MarksConversionResult }) {
  return <section id="marks-converter-print-result" className="rounded-2xl border border-violet-200 bg-white shadow-sm print:border-0 print:shadow-none">
    <div className="flex flex-col gap-3 border-b border-slate-100 bg-gradient-to-r from-violet-50 to-sky-50 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div><p className="text-xs font-semibold uppercase tracking-wide text-violet-600">Conversion result</p><h2 className="mt-1 text-lg font-bold text-slate-900">{result.source_board} <span className="text-violet-500">to</span> {result.target_board}</h2></div>
      <span className={`inline-flex items-center gap-1.5 self-start rounded-full px-3 py-1.5 text-xs font-bold ${result.is_official ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>{result.is_official ? <ShieldCheck className="h-3.5 w-3.5" /> : <Calculator className="h-3.5 w-3.5" />}{result.is_official ? "Verified official rule" : "Mathematical estimate"}</span>
    </div>
    <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
      <Metric label="Original marks" value={`${result.marks_obtained} / ${result.source_max_marks}`} />
      <Metric label="Equivalent target marks" value={`${result.target_marks} / ${result.target_max_marks}`} accent />
      <Metric label="Percentage" value={`${result.percentage}%`} />
      <Metric label="Rule / method" value={result.method} />
    </div>
    <div className="mx-5 mb-5 rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Formula used · rounded to 2 decimal places (half up)</p><p className="mt-1 font-mono text-sm text-slate-800">{result.formula}</p><p className={`mt-3 text-xs leading-5 ${result.is_official ? "text-emerald-800" : "text-amber-800"}`}>{result.status_note}</p>{result.reference_url && <a className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-violet-700 underline" href={result.reference_url} target="_blank" rel="noreferrer">{result.source_title ?? "Verified source"}<ExternalLink className="h-3 w-3" /></a>}</div>
  </section>;
}

function Metric({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return <div className={`rounded-xl border p-4 ${accent ? "border-violet-200 bg-violet-50" : "border-slate-100 bg-white"}`}><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className={`mt-2 text-lg font-bold ${accent ? "text-violet-700" : "text-slate-900"}`}>{value}</p></div>;
}

function AdminRulePanel({ rules, options, ruleForm, setRuleForm, editingRuleId, savingRule, error, onSave, onEdit, onToggle, onCancel }: {
  rules: MarksConversionRule[];
  options: MarksConverterOptions | null;
  ruleForm: MarksRulePayload;
  setRuleForm: (rule: MarksRulePayload) => void;
  editingRuleId: string | null;
  savingRule: boolean;
  error: string | null;
  onSave: (event: FormEvent<HTMLFormElement>) => void;
  onEdit: (rule: MarksConversionRule) => void;
  onToggle: (rule: MarksConversionRule) => void;
  onCancel: () => void;
}) {
  const set = <K extends keyof MarksRulePayload>(key: K, value: MarksRulePayload[K]) => setRuleForm({ ...ruleForm, [key]: value });
  return <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4"><ShieldCheck className="h-5 w-5 text-violet-600" /><div><h2 className="font-semibold text-slate-900">Administrator · conversion rules</h2><p className="text-xs text-slate-500">Rules are official only when an administrator verifies a cited source.</p></div></div>
    <div className="space-y-5 p-5">
      {error && <Alert tone="error" message={error} />}
      <form onSubmit={onSave} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Direction"><select className={inputClass} value={ruleForm.board_direction} onChange={(e) => set("board_direction", e.target.value as BoardDirection)}><option value="CBSE_TO_STATE">CBSE → State Board</option><option value="STATE_TO_CBSE">State Board → CBSE</option></select></Field>
        <Field label="State"><select className={inputClass} value={ruleForm.state} onChange={(e) => set("state", e.target.value)}>{(options?.states ?? []).map((state) => <option key={state}>{state}</option>)}</select></Field>
        <Field label="Class / grade"><select className={inputClass} value={ruleForm.class_grade} onChange={(e) => set("class_grade", e.target.value)}>{(options?.classes ?? []).map((grade) => <option key={grade}>{grade}</option>)}</select></Field>
        <Field label="Subject (blank = all)"><input className={inputClass} value={ruleForm.subject ?? ""} onChange={(e) => set("subject", e.target.value)} /></Field>
        <Field label="Exam type"><select className={inputClass} value={ruleForm.exam_type} onChange={(e) => set("exam_type", e.target.value)}>{(options?.exam_types ?? []).map((exam) => <option key={exam}>{exam}</option>)}</select></Field>
        <Field label="Effective academic year"><input className={inputClass} value={ruleForm.academic_year} onChange={(e) => set("academic_year", e.target.value)} required /></Field>
        <Field label="Source maximum"><input className={inputClass} type="number" min="0.01" step="0.01" value={ruleForm.source_max_marks} onChange={(e) => set("source_max_marks", Number(e.target.value))} required /></Field>
        <Field label="Target maximum"><input className={inputClass} type="number" min="0.01" step="0.01" value={ruleForm.target_max_marks} onChange={(e) => set("target_max_marks", Number(e.target.value))} required /></Field>
        <Field label="Method"><select className={inputClass} value={ruleForm.method} onChange={(e) => set("method", e.target.value)}><option value="PROPORTIONAL">Proportional scaling</option></select></Field>
        <Field label="Official source title"><input className={inputClass} value={ruleForm.source_title ?? ""} onChange={(e) => set("source_title", e.target.value)} placeholder="Board circular / document" /></Field>
        <Field label="Source reference URL"><input className={inputClass} type="url" value={ruleForm.reference_url ?? ""} onChange={(e) => set("reference_url", e.target.value)} placeholder="https://…" /></Field>
        <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm text-slate-700"><input type="checkbox" checked={ruleForm.is_official} onChange={(e) => set("is_official", e.target.checked)} className="h-4 w-4 accent-violet-600" /><span><span className="block font-semibold">Verified official rule</span><span className="text-xs text-slate-500">I checked the cited board document.</span></span></label>
        <div className="flex flex-wrap items-end gap-2 sm:col-span-2 lg:col-span-4"><button disabled={savingRule} className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{savingRule ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}{editingRuleId ? "Save rule" : "Add rule"}</button>{editingRuleId && <button type="button" onClick={onCancel} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600">Cancel edit</button>}</div>
      </form>
      <div className="overflow-x-auto rounded-xl border border-slate-200"><table className="w-full min-w-[880px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Board / state</th><th className="px-4 py-3">Class / subject</th><th className="px-4 py-3">Exam / year</th><th className="px-4 py-3">Scale</th><th className="px-4 py-3">Verification</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{rules.length === 0 ? <tr><td colSpan={7} className="px-4 py-7 text-center text-slate-500">No conversion rules have been added.</td></tr> : rules.map((rule) => <tr key={rule.id}><td className="px-4 py-3">{rule.board_direction === "CBSE_TO_STATE" ? "CBSE → State" : "State → CBSE"}<span className="block text-xs text-slate-500">{rule.state}</span></td><td className="px-4 py-3">{rule.class_grade}<span className="block text-xs text-slate-500">{rule.subject || "All subjects"}</span></td><td className="px-4 py-3">{rule.exam_type}<span className="block text-xs text-slate-500">{rule.academic_year}</span></td><td className="px-4 py-3 tabular-nums">{rule.source_max_marks} → {rule.target_max_marks}</td><td className="px-4 py-3">{rule.is_official ? <a className="inline-flex items-center gap-1 text-emerald-700 underline" href={rule.reference_url ?? undefined} target="_blank" rel="noreferrer"><FileCheck2 className="h-3.5 w-3.5" />Verified source</a> : <span className="text-amber-700">Estimate only</span>}</td><td className="px-4 py-3">{rule.is_active ? "Active" : "Inactive"}</td><td className="px-4 py-3"><div className="flex gap-2"><button type="button" onClick={() => onEdit(rule)} aria-label="Edit rule" className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"><Pencil className="h-4 w-4" /></button><button type="button" onClick={() => onToggle(rule)} aria-label={rule.is_active ? "Deactivate rule" : "Activate rule"} className="rounded-lg border border-slate-200 p-2 text-violet-700 hover:bg-violet-50">{rule.is_active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}</button></div></td></tr>)}</tbody></table></div>
    </div>
  </section>;
}
