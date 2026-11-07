"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Volume2,
  VolumeX,
  Play,
  Square,
  SkipForward,
  SkipBack,
  RotateCcw,
  Radio,
  Sliders,
  MapPin,
  Clock,
  Sparkles,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

export interface RouteStopItem {
  id?: string;
  stop_name: string;
  stop_order: number;
  pickup_time?: string;
}

export interface TransitRoute {
  id: string;
  routeName: string;
  routeColor?: string;
  startPoint?: string;
  endPoint?: string;
  stops?: number;
  stopsList?: RouteStopItem[];
  vehicle?: string;
  driver?: string;
}

interface MetroRouteAudioAnnouncerProps {
  routes: TransitRoute[];
  activeRouteId?: string;
  onSelectRoute?: (routeId: string) => void;
}

export default function MetroRouteAudioAnnouncer({
  routes,
  activeRouteId,
  onSelectRoute,
}: MetroRouteAudioAnnouncerProps) {
  // Active selected route
  const [selectedRouteId, setSelectedRouteId] = useState<string>(
    activeRouteId || (routes.length > 0 ? routes[0].id : "")
  );

  // Sync if prop changes
  useEffect(() => {
    if (activeRouteId) {
      setSelectedRouteId(activeRouteId);
    } else if (!selectedRouteId && routes.length > 0) {
      setSelectedRouteId(routes[0].id);
    }
  }, [activeRouteId, routes, selectedRouteId]);

  const currentRoute = routes.find((r) => r.id === selectedRouteId) || routes[0] || null;

  // Ordered stops for current route
  const [currentStops, setCurrentStops] = useState<string[]>([]);
  const [currentStopIndex, setCurrentStopIndex] = useState<number>(0);

  // Metro announcement settings
  const [doorSide, setDoorSide] = useState<"left" | "right">("left");
  const [language, setLanguage] = useState<"en" | "hi" | "campus">("en");
  const [volume, setVolume] = useState<number>(0.9);
  const [speechRate, setSpeechRate] = useState<number>(0.95);
  const [isChimeEnabled, setIsChimeEnabled] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [tickerMessage, setTickerMessage] = useState<string>("SYSTEM READY");
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceUri, setSelectedVoiceUri] = useState<string>("");

  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize speech voices
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const updateVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
      if (voices.length > 0 && !selectedVoiceUri) {
        // Prefer English (India or Great Britain) for metro realism
        const enInVoice = voices.find(
          (v) => v.lang.includes("en-IN") || v.lang.includes("en_IN")
        );
        const enGbVoice = voices.find(
          (v) => v.lang.includes("en-GB") || v.name.toLowerCase().includes("natural")
        );
        const defaultVoice = enInVoice || enGbVoice || voices[0];
        setSelectedVoiceUri(defaultVoice.voiceURI);
      }
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;

    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [selectedVoiceUri]);

  // Load stops when current route changes
  useEffect(() => {
    if (!currentRoute) {
      setCurrentStops([]);
      setCurrentStopIndex(0);
      setTickerMessage("NO ROUTE SELECTED");
      return;
    }

    let stops: string[] = [];
    if (Array.isArray(currentRoute.stopsList) && currentRoute.stopsList.length > 0) {
      stops = currentRoute.stopsList
        .slice()
        .sort((a, b) => (a.stop_order || 0) - (b.stop_order || 0))
        .map((s) => s.stop_name);
    }

    // If route has start and end points and no intermediate stops, construct them
    if (stops.length === 0) {
      const start = currentRoute.startPoint || "Nomera Main Campus";
      const end = currentRoute.endPoint || "City Center";
      stops = [start, `${start} Transit Hub`, `Central Ring Road`, end];
    }

    setCurrentStops(stops);
    setCurrentStopIndex(0);
    setTickerMessage(`ROUTE READY: ${currentRoute.routeName.toUpperCase()}`);
  }, [currentRoute]);

  // Play realistic Metro chime (Web Audio API)
  const playMetroChime = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      if (!isChimeEnabled) {
        resolve();
        return;
      }

      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) {
          resolve();
          return;
        }

        if (!audioContextRef.current || audioContextRef.current.state === "suspended") {
          audioContextRef.current = new AudioCtx();
        }

        const ctx = audioContextRef.current;
        const now = ctx.currentTime;

        // Metro 3-tone chime sequence: C5 (523Hz), E5 (659Hz), G5 (784Hz)
        const notes = [
          { freq: 523.25, start: 0.0, dur: 0.22 },
          { freq: 659.25, start: 0.18, dur: 0.22 },
          { freq: 783.99, start: 0.36, dur: 0.55 },
        ];

        notes.forEach(({ freq, start, dur }) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now + start);

          // Soft bell chime envelope
          gain.gain.setValueAtTime(0.001, now + start);
          gain.gain.exponentialRampToValueAtTime(0.35 * volume, now + start + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + start);
          osc.stop(now + start + dur + 0.05);
        });

        setTimeout(resolve, 850);
      } catch {
        resolve();
      }
    });
  }, [isChimeEnabled, volume]);

  // Construct Metro announcement speech text
  const getAnnouncementText = useCallback(
    (stopName: string, isFinal: boolean) => {
      const sideText = doorSide === "left" ? "on the left" : "on the right";

      if (language === "hi") {
        if (isFinal) {
          return `कृपया ध्यान दें। अगला स्टेशन ${stopName} है। यह इस रूट का अंतिम स्टेशन है। सभी यात्री कृपया यहाँ उतर जाएँ। धन्यवाद।`;
        }
        return `अगला स्टेशन ${stopName} है। दरवाज़े ${
          doorSide === "left" ? "बाईं तरफ" : "दायीं तरफ"
        } खुलेंगे। कृपया ध्यान दें।`;
      }

      if (language === "campus") {
        if (isFinal) {
          return `Attention students. We are approaching our destination: ${stopName}. Please check your belongings, school bags, and ID badges before alighting.`;
        }
        return `Nomera Campus Transit. Next stop is ${stopName}. Estimated arrival in two minutes. Students boarding or alighting at ${stopName}, please be ready.`;
      }

      // Default: High-fidelity Metro Train Style
      if (isFinal) {
        return `Attention passengers. Next stop is ${stopName}. This is the terminal destination of this route. All passengers, please deboard here. Thank you for traveling with Nomera Transit.`;
      }
      return `Attention please. Next stop: ${stopName}. Doors will open ${sideText}. Please mind the gap between the vehicle and the platform.`;
    },
    [doorSide, language]
  );

  // Trigger audio announcement
  const announceCurrentStop = useCallback(
    async (targetIndex?: number) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

      const index = typeof targetIndex === "number" ? targetIndex : currentStopIndex;
      if (currentStops.length === 0 || index >= currentStops.length) return;

      const stopName = currentStops[index];
      const isFinal = index === currentStops.length - 1;

      // Cancel any active speech
      window.speechSynthesis.cancel();
      setIsPlaying(true);
      setTickerMessage(`▶ ANNOUNCING: NEXT STOP ${stopName.toUpperCase()}...`);

      // 1. Play metro chime first
      await playMetroChime();

      // 2. Play speech synthesis
      const textToSpeak = getAnnouncementText(stopName, isFinal);
      const utterance = new SpeechSynthesisUtterance(textToSpeak);

      utterance.volume = volume;
      utterance.rate = speechRate;
      utterance.pitch = 1.05; // clear, pleasant announcement pitch

      // Select voice
      if (selectedVoiceUri) {
        const found = availableVoices.find((v) => v.voiceURI === selectedVoiceUri);
        if (found) utterance.voice = found;
      }

      utterance.onend = () => {
        setIsPlaying(false);
        setTickerMessage(`READY AT: ${stopName.toUpperCase()} (STOP ${index + 1}/${currentStops.length})`);
      };

      utterance.onerror = () => {
        setIsPlaying(false);
        setTickerMessage(`ANNOUNCEMENT COMPLETE: ${stopName.toUpperCase()}`);
      };

      window.speechSynthesis.speak(utterance);
    },
    [
      currentStopIndex,
      currentStops,
      playMetroChime,
      getAnnouncementText,
      volume,
      speechRate,
      selectedVoiceUri,
      availableVoices,
    ]
  );

  // Stop announcement
  const stopAnnouncement = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setTickerMessage("ANNOUNCEMENT STOPPED");
  };

  // Next stop
  const handleNextStop = () => {
    if (currentStopIndex < currentStops.length - 1) {
      const nextIdx = currentStopIndex + 1;
      setCurrentStopIndex(nextIdx);
      announceCurrentStop(nextIdx);
    }
  };

  // Previous stop
  const handlePrevStop = () => {
    if (currentStopIndex > 0) {
      const prevIdx = currentStopIndex - 1;
      setCurrentStopIndex(prevIdx);
      announceCurrentStop(prevIdx);
    }
  };

  const currentStopName = currentStops[currentStopIndex] || "No stops defined";
  const isFinalStop = currentStopIndex === currentStops.length - 1;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl text-white">
      {/* Top Header Bar */}
      <div className="bg-slate-950 px-5 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-wide">
                Metro Route Audio Announcer
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-mono font-semibold tracking-wider uppercase rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                PIS System
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Automated station chimes & voice announcements for campus transit buses (Metro style)
            </p>
          </div>
        </div>

        {/* Route Selector Dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="announcer-route-select" className="text-xs text-slate-400 font-medium">Route:</label>
          <select
            id="announcer-route-select"
            value={selectedRouteId}
            onChange={(e) => {
              const id = e.target.value;
              setSelectedRouteId(id);
              if (onSelectRoute) onSelectRoute(id);
            }}
            className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-500"
          >
            {routes.length === 0 ? (
              <option value="">No Routes Available</option>
            ) : (
              routes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.routeName} ({r.stopsList?.length || r.stops || 4} stops)
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {/* Retro-Modern LED Metro Ticker Bar */}
      <div className="bg-black px-4 py-2.5 border-b border-slate-800 flex items-center justify-between font-mono text-xs overflow-hidden">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping flex-shrink-0" />
          <span className="text-amber-400 font-bold uppercase tracking-wider truncate">
            {tickerMessage}
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-400 flex-shrink-0">
          <span>DOORS: <strong className="text-emerald-400 uppercase">{doorSide}</strong></span>
          <span>•</span>
          <span>CHIME: <strong className={isChimeEnabled ? "text-emerald-400" : "text-slate-500"}>{isChimeEnabled ? "ON" : "OFF"}</strong></span>
        </div>
      </div>

      {/* Main Announcer Stage */}
      <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Visual Station Progress (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-purple-400" />
                Transit Stop Progression ({currentStopIndex + 1} of {Math.max(1, currentStops.length)})
              </span>
              {isFinalStop && (
                <span className="text-[11px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                  Terminal Stop
                </span>
              )}
            </div>

            {/* Current Active Station Hero Card */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 relative overflow-hidden mb-4">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between text-xs text-purple-400 font-medium mb-1">
                <span>APPROACHING STATION</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Arriving Soon
                </span>
              </div>

              <div className="text-2xl font-black text-white tracking-wide flex items-center gap-2">
                <span>{currentStopName}</span>
                {isPlaying && (
                  <span className="inline-flex items-center gap-0.5 ml-2">
                    <span className="w-1.5 h-4 bg-emerald-400 animate-pulse rounded-full" />
                    <span className="w-1.5 h-6 bg-emerald-400 animate-pulse delay-75 rounded-full" />
                    <span className="w-1.5 h-3 bg-emerald-400 animate-pulse delay-150 rounded-full" />
                  </span>
                )}
              </div>

              <div className="mt-2 text-xs text-slate-400 italic">
                &ldquo;{getAnnouncementText(currentStopName, isFinalStop)}&rdquo;
              </div>
            </div>

            {/* Station Timeline Dots */}
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {currentStops.map((stop, idx) => {
                const isCurrent = idx === currentStopIndex;
                const isPassed = idx < currentStopIndex;
                return (
                  <button
                    key={`${stop}-${idx}`}
                    type="button"
                    onClick={() => {
                      setCurrentStopIndex(idx);
                      announceCurrentStop(idx);
                    }}
                    className={`w-full text-left flex items-center justify-between p-2 rounded transition text-xs ${
                      isCurrent
                        ? "bg-purple-950/60 border border-purple-500/40 text-purple-200"
                        : isPassed
                        ? "bg-slate-950/40 text-slate-500 hover:text-slate-300"
                        : "bg-slate-950/60 text-slate-300 hover:bg-slate-800/60"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isCurrent
                            ? "bg-purple-600 text-white shadow-lg shadow-purple-600/50"
                            : isPassed
                            ? "bg-slate-800 text-slate-500"
                            : "bg-slate-700 text-slate-300"
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <span className={`font-medium ${isCurrent ? "font-bold text-white" : ""}`}>
                        {stop}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isCurrent && (
                        <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] rounded border border-emerald-500/30 uppercase font-semibold">
                          Active
                        </span>
                      )}
                      <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Transport Driver Action Buttons */}
          <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => announceCurrentStop()}
              disabled={isPlaying || currentStops.length === 0}
              className="flex-1 min-w-[140px] px-4 py-2.5 bg-[#7c3aed] hover:bg-[#6d28d9] disabled:opacity-50 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
              <span>{isPlaying ? "Announcing..." : "Announce Current Stop"}</span>
            </button>

            <button
              type="button"
              onClick={handleNextStop}
              disabled={currentStopIndex >= currentStops.length - 1}
              className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
              title="Next Station"
            >
              <span>Next</span>
              <SkipForward className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handlePrevStop}
              disabled={currentStopIndex <= 0}
              className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
              title="Previous Station"
            >
              <SkipBack className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>

            {isPlaying && (
              <button
                type="button"
                onClick={stopAnnouncement}
                className="px-3 py-2.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                title="Mute / Stop announcement"
              >
                <Square className="w-3.5 h-3.5" />
                <span>Stop</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Audio & PIS Configuration (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-950/60 border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider pb-2 border-b border-slate-800">
              <Sliders className="w-3.5 h-3.5 text-purple-400" />
              <span>Announcement Controls</span>
            </div>

            {/* Announcement Style / Language */}
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                Announcement Mode:
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: "en", label: "Metro (EN)" },
                  { id: "campus", label: "Campus Bus" },
                  { id: "hi", label: "Hindi (HI)" },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setLanguage(mode.id as any)}
                    className={`py-1.5 px-2 text-center text-xs rounded font-medium transition ${
                      language === mode.id
                        ? "bg-purple-600 text-white font-semibold"
                        : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Metro Chime Toggle */}
            <div className="flex items-center justify-between py-1 border-y border-slate-800/80">
              <div>
                <div className="text-xs font-medium text-slate-200">Metro Chime Sound</div>
                <div className="text-[11px] text-slate-500">Play iconic 3-tone chime before speech</div>
              </div>
              <button
                type="button"
                onClick={() => setIsChimeEnabled(!isChimeEnabled)}
                className={`w-10 h-5 flex items-center rounded-full p-0.5 transition ${
                  isChimeEnabled ? "bg-purple-600 justify-end" : "bg-slate-700 justify-start"
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-md" />
              </button>
            </div>

            {/* Door Platform Side */}
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                Platform Exit Side:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDoorSide("left")}
                  className={`py-1.5 px-3 text-xs rounded font-medium transition text-center ${
                    doorSide === "left"
                      ? "bg-emerald-600 text-white font-semibold"
                      : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Doors Open Left
                </button>
                <button
                  type="button"
                  onClick={() => setDoorSide("right")}
                  className={`py-1.5 px-3 text-xs rounded font-medium transition text-center ${
                    doorSide === "right"
                      ? "bg-emerald-600 text-white font-semibold"
                      : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Doors Open Right
                </button>
              </div>
            </div>

            {/* Volume & Speed Sliders */}
            <div className="space-y-2.5">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Volume</span>
                  <span>{Math.round(volume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-full accent-purple-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Speech Tempo</span>
                  <span>{speechRate.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.75"
                  max="1.25"
                  step="0.05"
                  value={speechRate}
                  onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                  className="w-full accent-purple-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Test Chime Sound Pill */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={playMetroChime}
              className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Test Metro Chime Tone</span>
            </button>
            <div className="text-[11px] text-slate-500 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Web Audio API Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
