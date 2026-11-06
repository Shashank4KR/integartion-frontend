"use client";

import { useEffect, useState, useRef, useId } from "react";
import Card from "@/components/shared/Card";
import {
  Bell,
  Clock,
  BookOpen,
  Plus,
  Trash2,
  Volume2,
  VolumeX,
  Play,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
} from "lucide-react";

export interface StudyReminder {
  id: string;
  subject: string;
  topic: string;
  startTime: string; // HH:mm format, e.g. "18:30"
  durationMinutes: number;
  days: string[]; // ["Mon", "Tue", "Wed", "Thu", "Fri"]
  enabled: boolean;
  soundType: "CHIME" | "BELL" | "DIGITAL";
}

const STORAGE_KEY = "nomera_student_study_reminders";

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const DEFAULT_REMINDERS: StudyReminder[] = [
  {
    id: "rem-1",
    subject: "Mathematics",
    topic: "Calculus & Problem Sets",
    startTime: "18:00",
    durationMinutes: 60,
    days: ["Mon", "Wed", "Fri"],
    enabled: true,
    soundType: "CHIME",
  },
  {
    id: "rem-2",
    subject: "Science & Physics",
    topic: "Mechanics revision & formulas",
    startTime: "19:30",
    durationMinutes: 45,
    days: ["Mon", "Tue", "Thu", "Sat"],
    enabled: true,
    soundType: "BELL",
  },
  {
    id: "rem-3",
    subject: "English Literature",
    topic: "Essay drafting & reading",
    startTime: "20:30",
    durationMinutes: 30,
    days: ["Tue", "Thu", "Sun"],
    enabled: false,
    soundType: "DIGITAL",
  },
];

export default function StudyTimeReminder() {
  const [reminders, setReminders] = useState<StudyReminder[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [activeAlarm, setActiveAlarm] = useState<StudyReminder | null>(null);
  const [audioTesting, setAudioTesting] = useState(false);
  const [nextSessionText, setNextSessionText] = useState<string>("Checking schedule...");

  // Form State
  const [formSubject, setFormSubject] = useState("");
  const [formTopic, setFormTopic] = useState("");
  const [formStartTime, setFormStartTime] = useState("18:00");
  const [formDuration, setFormDuration] = useState(45);
  const [formDays, setFormDays] = useState<string[]>(["Mon", "Tue", "Wed", "Thu", "Fri"]);
  const [formSound, setFormSound] = useState<"CHIME" | "BELL" | "DIGITAL">("CHIME");

  const audioCtxRef = useRef<AudioContext | null>(null);

  // Load from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setReminders(JSON.parse(raw));
      } else {
        setReminders(DEFAULT_REMINDERS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_REMINDERS));
      }
    } catch {
      setReminders(DEFAULT_REMINDERS);
    }
  }, []);

  const saveReminders = (updated: StudyReminder[]) => {
    setReminders(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // storage quota
    }
  };

  // Play Web Audio Chime Alarm
  const playSound = (soundType: "CHIME" | "BELL" | "DIGITAL" = "CHIME") => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = audioCtxRef.current || new AudioCtx();
      audioCtxRef.current = ctx;

      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const now = ctx.currentTime;

      if (soundType === "CHIME") {
        // Melodic 3-tone campus chime
        const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now + idx * 0.2);

          gain.gain.setValueAtTime(0, now + idx * 0.2);
          gain.gain.linearRampToValueAtTime(0.3, now + idx * 0.2 + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.2 + 0.8);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.2);
          osc.stop(now + idx * 0.2 + 0.9);
        });
      } else if (soundType === "BELL") {
        // Resonant bell tone
        const freqs = [440, 880, 1320];
        freqs.forEach((f, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.value = f;
          gain.gain.setValueAtTime(0.2 / (i + 1), now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 2.0);
        });
      } else {
        // Digital pulsing alert beep
        for (let i = 0; i < 3; i++) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "square";
          osc.frequency.setValueAtTime(880, now + i * 0.18);
          gain.gain.setValueAtTime(0.15, now + i * 0.18);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.18 + 0.12);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.18);
          osc.stop(now + i * 0.18 + 0.15);
        }
      }
    } catch {
      // Audio not permitted or user interaction needed
    }
  };

  // Clock tick to evaluate alarms & calculate next session
  useEffect(() => {
    const checkClock = () => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, "0");
      const currentMinutes = String(now.getMinutes()).padStart(2, "0");
      const currentTimeStr = `${currentHours}:${currentMinutes}`;
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const currentDay = dayNames[now.getDay()];

      // Check for alarms matching this exact minute
      const triggered = reminders.find(
        (r) => r.enabled && r.startTime === currentTimeStr && r.days.includes(currentDay)
      );

      if (triggered && (!activeAlarm || activeAlarm.id !== triggered.id)) {
        setActiveAlarm(triggered);
        playSound(triggered.soundType);
      }

      // Calculate upcoming reminder
      const enabledList = reminders.filter((r) => r.enabled);
      if (enabledList.length === 0) {
        setNextSessionText("No active study alarms scheduled");
        return;
      }

      // Find closest upcoming reminder
      const sorted = [...enabledList].sort((a, b) => a.startTime.localeCompare(b.startTime));
      const nextToday = sorted.find((r) => r.startTime > currentTimeStr && r.days.includes(currentDay));
      if (nextToday) {
        setNextSessionText(`Next: ${nextToday.subject} today at ${nextToday.startTime}`);
      } else {
        const nextAny = sorted[0];
        setNextSessionText(`Next scheduled: ${nextAny.subject} at ${nextAny.startTime}`);
      }
    };

    checkClock();
    const timer = setInterval(checkClock, 15000); // Check every 15s
    return () => clearInterval(timer);
  }, [reminders, activeAlarm]);

  const toggleReminder = (id: string) => {
    const updated = reminders.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r));
    saveReminders(updated);
  };

  const deleteReminder = (id: string) => {
    const updated = reminders.filter((r) => r.id !== id);
    saveReminders(updated);
  };

  const handleDayToggle = (day: string) => {
    if (formDays.includes(day)) {
      if (formDays.length > 1) {
        setFormDays(formDays.filter((d) => d !== day));
      }
    } else {
      setFormDays([...formDays, day]);
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSubject.trim()) return;

    const newReminder: StudyReminder = {
      id: "rem-" + Date.now(),
      subject: formSubject.trim(),
      topic: formTopic.trim() || "Daily Study & Revision",
      startTime: formStartTime,
      durationMinutes: Number(formDuration) || 45,
      days: formDays,
      enabled: true,
      soundType: formSound,
    };

    saveReminders([...reminders, newReminder]);
    setIsAddOpen(false);
    setFormSubject("");
    setFormTopic("");
  };

  return (
    <Card className="p-6 border-slate-200/80 shadow-sm relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-purple-100/50 via-indigo-50/20 to-transparent pointer-events-none rounded-bl-full" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700 shadow-sm">
            <Bell className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              Study Time Reminder & Alarm
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                Live Alert
              </span>
            </h3>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <Clock className="w-3.5 h-3.5 text-purple-600" />
              <span>{nextSessionText}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setAudioTesting(true);
              playSound("CHIME");
              setTimeout(() => setAudioTesting(false), 1200);
            }}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-purple-700 hover:bg-purple-50 text-xs font-semibold flex items-center gap-1.5 transition"
            title="Test campus chime alarm sound"
          >
            <Volume2 className={`w-3.5 h-3.5 ${audioTesting ? "text-purple-600 animate-pulse" : ""}`} />
            <span>Test Chime</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Slot</span>
          </button>
        </div>
      </div>

      {/* Reminders List */}
      <div className="space-y-2.5 relative z-10">
        {reminders.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
            No study alarms configured. Click &quot;Add Slot&quot; to set up your study routine.
          </div>
        ) : (
          reminders.map((rem) => (
            <div
              key={rem.id}
              className={`p-3.5 rounded-xl border transition flex items-center justify-between gap-3 ${
                rem.enabled
                  ? "bg-white border-slate-200 hover:border-purple-300 shadow-sm"
                  : "bg-slate-50/70 border-slate-200/60 opacity-60"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                    rem.enabled ? "bg-purple-50 text-purple-700" : "bg-slate-200 text-slate-500"
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 truncate">
                      {rem.subject}
                    </span>
                    <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                      {rem.startTime}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      ({rem.durationMinutes} mins)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-slate-500 truncate">{rem.topic}</span>
                    <span className="text-[10px] text-slate-300">•</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {rem.days.join(", ")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Enable/Disable Toggle */}
                <button
                  type="button"
                  onClick={() => toggleReminder(rem.id)}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                    rem.enabled ? "bg-purple-600" : "bg-slate-300"
                  }`}
                  aria-label={rem.enabled ? "Disable study alarm" : "Enable study alarm"}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform shadow-sm ${
                      rem.enabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => deleteReminder(rem.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                  title="Delete Reminder"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Active Alarm Modal Banner (Fires when time strikes) */}
      {activeAlarm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border-4 border-purple-500 text-center space-y-4 animate-scale-up">
            <div className="w-20 h-20 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center mx-auto shadow-inner animate-bounce">
              <Bell className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-purple-600">
                Study Time Alarm!
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-1">
                Time to study: {activeAlarm.subject}
              </h2>
              <p className="text-sm text-slate-600 mt-1">{activeAlarm.topic}</p>
              <p className="text-xs font-mono text-purple-700 font-bold mt-2 bg-purple-50 inline-block px-3 py-1 rounded-full border border-purple-200">
                Duration: {activeAlarm.durationMinutes} Minutes
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  playSound(activeAlarm.soundType);
                }}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <Volume2 className="w-4 h-4 text-purple-600" />
                Ring Again
              </button>
              <button
                type="button"
                onClick={() => setActiveAlarm(null)}
                className="flex-1 py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center justify-center gap-1.5 transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                Start Studying
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Slot Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-slate-900 text-base">Schedule New Study Slot</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Subject Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mathematics, Science, Social Studies"
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Topic / Goal (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Practice Chapter 5 Exercises & Formulas"
                  value={formTopic}
                  onChange={(e) => setFormTopic(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={180}
                    value={formDuration}
                    onChange={(e) => setFormDuration(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Repeat on Days
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {DAYS_OF_WEEK.map((d) => {
                    const selected = formDays.includes(d);
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => handleDayToggle(d)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                          selected
                            ? "bg-purple-600 text-white shadow-sm"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Alarm Chime Tone
                </label>
                <select
                  value={formSound}
                  onChange={(e) => setFormSound(e.target.value as "CHIME" | "BELL" | "DIGITAL")}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="CHIME">Campus Melody Chime</option>
                  <option value="BELL">Resonant School Bell</option>
                  <option value="DIGITAL">Digital Alarm Beep</option>
                </select>
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm transition"
                >
                  Save Study Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Card>
  );
}
