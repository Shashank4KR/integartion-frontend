"use client";

import { useEffect, useMemo, useState } from "react";
import MainLayout from "@/components/shared/layout/MainLayout";
import Sidebar from "@/components/shared/layout/Sidebar";
import DashboardHeader from "@/components/shared/layout/Header";
import Card from "@/components/shared/Card";
import type { EventGenre, EventItem, EventStatus, TargetAudienceRole } from "@/types/events";
import {
  deleteEventItem,
  deleteLiveEvent,
  getStoredEvents,
  INITIAL_EVENTS,
  saveEventItem,
  saveLiveEvent,
  fetchLiveEvents,
} from "@/lib/services/eventManagementService";
import { listClasses } from "@/lib/services/classService";
import { getToken } from "@/lib/auth";
import type { ClassResponse } from "@/types/entities/class";
import {
  Calendar,
  CalendarDays,
  Clock,
  Compass,
  Filter,
  Layers,
  MapPin,
  Megaphone,
  MoreVertical,
  PartyPopper,
  Pencil,
  Plus,
  Printer,
  RotateCcw,
  Search,
  Sparkles,
  Tag,
  Trash2,
  Trophy,
  UserCheck,
  Users,
  X,
} from "lucide-react";

const ALL_GENRES: { label: string; value: EventGenre; icon: any; color: string }[] = [
  { label: "Competitions", value: "COMPETITION", icon: Trophy, color: "bg-amber-100 text-amber-800 border-amber-300" },
  { label: "Celebrations", value: "CELEBRATION", icon: PartyPopper, color: "bg-pink-100 text-pink-800 border-pink-300" },
  { label: "Academic & STEM", value: "ACADEMIC", icon: Sparkles, color: "bg-purple-100 text-purple-800 border-purple-300" },
  { label: "Sports & Athletics", value: "SPORTS", icon: Trophy, color: "bg-emerald-100 text-emerald-800 border-emerald-300" },
  { label: "Meetings & PTM", value: "MEETING", icon: Users, color: "bg-blue-100 text-blue-800 border-blue-300" },
  { label: "Cultural Arts", value: "CULTURAL", icon: Compass, color: "bg-indigo-100 text-indigo-800 border-indigo-300" },
  { label: "Holidays & Trips", value: "HOLIDAY", icon: CalendarDays, color: "bg-orange-100 text-orange-800 border-orange-300" },
  { label: "Workshops", value: "WORKSHOP", icon: Layers, color: "bg-teal-100 text-teal-800 border-teal-300" },
  { label: "Examinations", value: "EXAMINATION", icon: Layers, color: "bg-rose-100 text-rose-800 border-rose-300" },
];

const TARGET_ROLES: { label: string; value: TargetAudienceRole }[] = [
  { label: "Entire School (Students, Parents & Staff)", value: "ALL" },
  { label: "Students Only", value: "STUDENTS" },
  { label: "Parents Only", value: "PARENTS" },
  { label: "Teachers & Staff Only", value: "TEACHERS" },
  { label: "Parents & Students", value: "PARENTS_AND_STUDENTS" },
];

export default function AdminEventsPage({ initialGenre = "ALL" }: { initialGenre?: string }) {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [classes, setClasses] = useState<ClassResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterGenre, setFilterGenre] = useState<string>(initialGenre);
  const [filterAudience, setFilterAudience] = useState<string>("ALL");
  const [filterClass, setFilterClass] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [selectedDetailEvent, setSelectedDetailEvent] = useState<EventItem | null>(null);

  // Form State
  const defaultEventForm: Omit<EventItem, "id"> = {
    title: "",
    genre: "COMPETITION",
    targetAudience: "STUDENTS",
    targetClasses: ["All Classes"],
    startDate: new Date().toISOString().split("T")[0],
    startTime: "09:00 AM",
    endDate: new Date().toISOString().split("T")[0],
    endTime: "04:00 PM",
    venue: "Main Campus Auditorium",
    description: "",
    eligibility: "",
    registrationRequired: false,
    maxParticipants: 50,
    registrationDeadline: "",
    coordinatorName: "",
    coordinatorContact: "",
    prizes: "",
    status: "UPCOMING",
    registeredCount: 0,
  };

  const [formState, setFormState] = useState<Omit<EventItem, "id">>(defaultEventForm);
  const [selectedClassInput, setSelectedClassInput] = useState("All Classes");

  useEffect(() => {
    // 1. Immediately purge any legacy mock data and load real stored events
    setEvents(getStoredEvents());

    // 2. Query real live events from backend PostgreSQL
    const token = getToken();
    if (token) {
      fetchLiveEvents(token)
        .then((live) => {
          if (Array.isArray(live)) setEvents(live);
        })
        .catch(() => {});

      listClasses(token)
        .then((data) => {
          if (Array.isArray(data)) setClasses(data);
        })
        .catch((err) => console.warn("Failed to fetch classes:", err));
    }
  }, []);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const matchGenre = filterGenre === "ALL" || e.genre === filterGenre;
      const matchAudience = filterAudience === "ALL" || e.targetAudience === filterAudience;
      const matchClass =
        filterClass === "ALL" ||
        !e.targetClasses ||
        e.targetClasses.length === 0 ||
        e.targetClasses.includes("All Classes") ||
        e.targetClasses.includes(filterClass);
      const matchStatus = filterStatus === "ALL" || e.status === filterStatus;
      const q = searchQuery.toLowerCase();
      const matchSearch =
        e.title.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q) ||
        (e.coordinatorName && e.coordinatorName.toLowerCase().includes(q)) ||
        e.description.toLowerCase().includes(q);

      return matchGenre && matchAudience && matchClass && matchStatus && matchSearch;
    });
  }, [events, filterGenre, filterAudience, filterClass, filterStatus, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = events.length;
    const competitions = events.filter((e) => e.genre === "COMPETITION").length;
    const celebrations = events.filter((e) => e.genre === "CELEBRATION").length;
    const upcoming = events.filter((e) => e.status === "UPCOMING").length;
    const totalRegistrations = events.reduce((acc, curr) => acc + (curr.registeredCount || 0), 0);
    return { total, competitions, celebrations, upcoming, totalRegistrations };
  }, [events]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingEvent(null);
    setFormState(defaultEventForm);
    setSelectedClassInput("All Classes");
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (event: EventItem) => {
    setEditingEvent(event);
    setFormState({ ...event });
    setSelectedClassInput(event.targetClasses[0] || "All Classes");
    setIsModalOpen(true);
  };

  // Save Event
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.title.trim()) {
      alert("Event title is required");
      return;
    }

    const eventToSave: EventItem = {
      ...formState,
      id: editingEvent ? editingEvent.id : "evt-" + Date.now(),
      targetClasses: [selectedClassInput],
      createdAt: editingEvent?.createdAt || new Date().toISOString(),
    };

    const token = getToken();
    const updated = await saveLiveEvent(eventToSave, token);
    setEvents(updated);
    setIsModalOpen(false);
  };

  // Delete Event
  const handleDeleteEvent = async (id: string) => {
    if (confirm("Are you sure you want to delete this event?")) {
      const token = getToken();
      const updated = await deleteLiveEvent(id, token);
      setEvents(updated);
      if (selectedDetailEvent?.id === id) setSelectedDetailEvent(null);
    }
  };

  // Presets Quick-Fill
  const handleApplyPreset = (presetType: "competition" | "celebration" | "ptm" | "sports") => {
    if (presetType === "competition") {
      setFormState((prev) => ({
        ...prev,
        title: "Inter-House Science & Debate Competition 2026",
        genre: "COMPETITION",
        targetAudience: "STUDENTS",
        venue: "Senior Block Auditorium",
        description: "Intra-school debate contest on modern environmental challenges and scientific innovations.",
        eligibility: "Open to 2 speakers per house from Class 9, 10, 11, 12.",
        registrationRequired: true,
        maxParticipants: 32,
        prizes: "1st: Gold Trophy & Certificates | 2nd: Silver Trophy",
        coordinatorName: "English & Science Faculty Club",
      }));
      setSelectedClassInput("Class 10");
    } else if (presetType === "celebration") {
      setFormState((prev) => ({
        ...prev,
        title: "National Independence Day & Cultural Fest",
        genre: "CELEBRATION",
        targetAudience: "ALL",
        venue: "Central Campus Grounds",
        description: "Flag hoisting ceremony, patriotic choir performances, drill displays, and distribution of sweets.",
        registrationRequired: false,
        coordinatorName: "Cultural Committee",
      }));
      setSelectedClassInput("All Classes");
    } else if (presetType === "ptm") {
      setFormState((prev) => ({
        ...prev,
        title: "Class 10 & 12 Board Exam Readiness Parent-Teacher Meeting",
        genre: "MEETING",
        targetAudience: "PARENTS_AND_STUDENTS",
        venue: "Respective Classrooms & Audio-Visual Hall",
        description: "Detailed one-on-one progress discussion with parents covering syllabus completion, model exam marks, and study planner.",
        registrationRequired: false,
        coordinatorName: "Academic Dean",
      }));
      setSelectedClassInput("Class 10");
    } else if (presetType === "sports") {
      setFormState((prev) => ({
        ...prev,
        title: "Annual Track & Field Athletic Championship",
        genre: "SPORTS",
        targetAudience: "STUDENTS",
        venue: "School Sports Complex",
        description: "Track races, high jump, shot put, relay championships, and award ceremonies.",
        registrationRequired: true,
        maxParticipants: 100,
        coordinatorName: "Physical Education Department",
      }));
      setSelectedClassInput("All Classes");
    }
  };

  // Genre Badge Helper
  const getGenreBadge = (genre: EventGenre) => {
    const found = ALL_GENRES.find((g) => g.value === genre);
    if (!found) return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">OTHER</span>;
    const Icon = found.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${found.color}`}>
        <Icon className="w-3 h-3" />
        {found.label}
      </span>
    );
  };

  return (
    <MainLayout sidebar={<Sidebar />} header={<DashboardHeader />}>
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
        {/* Header Title & Actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-pink-100 text-pink-600">
              <Calendar className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {initialGenre === "COMPETITION" ? "Competitions" : "Events & Activities Management"}
              </h1>
              <p className="text-xs md:text-sm text-slate-500">
                {initialGenre === "COMPETITION"
                  ? "Browse and manage school competitions using live event records."
                  : "Organize school competitions, cultural celebrations, academic seminars, sports meets, and target events by respective class, students, or parents."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              Print Calendar
            </button>
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 rounded-xl bg-[#7c3aed] text-white text-xs font-bold hover:bg-[#6d28d9] transition shadow-md flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {initialGenre === "COMPETITION" ? "Create Competition" : "Create Event / Activity"}
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
          <Card className="p-4 border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">Total Events</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.total}</h3>
              </div>
              <span className="p-2.5 rounded-xl bg-purple-50 text-[#7c3aed]">
                <CalendarDays className="w-5 h-5" />
              </span>
            </div>
          </Card>

          <Card
            className="p-4 border-slate-200 cursor-pointer hover:border-amber-300 transition"
            onClick={() => setFilterGenre(filterGenre === "COMPETITION" ? "ALL" : "COMPETITION")}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-amber-700">Competitions</p>
                <h3 className="text-2xl font-black text-amber-900 mt-1">{stats.competitions}</h3>
              </div>
              <span className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                <Trophy className="w-5 h-5" />
              </span>
            </div>
          </Card>

          <Card
            className="p-4 border-slate-200 cursor-pointer hover:border-pink-300 transition"
            onClick={() => setFilterGenre(filterGenre === "CELEBRATION" ? "ALL" : "CELEBRATION")}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-pink-700">Celebrations</p>
                <h3 className="text-2xl font-black text-pink-900 mt-1">{stats.celebrations}</h3>
              </div>
              <span className="p-2.5 rounded-xl bg-pink-50 text-pink-600">
                <PartyPopper className="w-5 h-5" />
              </span>
            </div>
          </Card>

          <Card className="p-4 border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-emerald-700">Upcoming Active</p>
                <h3 className="text-2xl font-black text-emerald-900 mt-1">{stats.upcoming}</h3>
              </div>
              <span className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                <Clock className="w-5 h-5" />
              </span>
            </div>
          </Card>

          <Card className="p-4 border-slate-200 col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-blue-700">Registrations</p>
                <h3 className="text-2xl font-black text-blue-900 mt-1">{stats.totalRegistrations}</h3>
              </div>
              <span className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                <UserCheck className="w-5 h-5" />
              </span>
            </div>
          </Card>
        </div>

        {/* Multi-Dimensional Filter Bar */}
        <Card className="p-4 border-slate-200 shadow-sm space-y-3">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search event, venue, or coordinator..."
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-purple-200"
              />
            </div>

            {/* Dropdown Filters */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Genre Filter */}
              <select
                value={filterGenre}
                onChange={(e) => setFilterGenre(e.target.value)}
                className="border border-slate-200 rounded-xl py-2 px-3 text-xs bg-white text-slate-800 outline-none"
              >
                <option value="ALL">All Genres</option>
                {ALL_GENRES.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>

              {/* Target Audience Filter */}
              <select
                value={filterAudience}
                onChange={(e) => setFilterAudience(e.target.value)}
                className="border border-slate-200 rounded-xl py-2 px-3 text-xs bg-white text-slate-800 outline-none"
              >
                <option value="ALL">All Audiences</option>
                <option value="STUDENTS">Students Only</option>
                <option value="PARENTS">Parents Only</option>
                <option value="PARENTS_AND_STUDENTS">Parents & Students</option>
                <option value="TEACHERS">Teachers & Staff</option>
              </select>

              {/* Class Target Filter */}
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="border border-slate-200 rounded-xl py-2 px-3 text-xs bg-white text-slate-800 outline-none"
              >
                <option value="ALL">All Grades / Classes</option>
                <option value="Class 10">Class 10</option>
                <option value="Class 12">Class 12</option>
                <option value="Class 9">Class 9</option>
                <option value="Class 8">Class 8</option>
                <option value="Class 7">Class 7</option>
                <option value="Class 6">Class 6</option>
                <option value="Class 5">Class 5</option>
                {classes.map((c) => (
                  <option key={c.id} value={`${c.class_name} ${c.section}`}>
                    {c.class_name} {c.section}
                    {c.class_name} {c.section}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-slate-200 rounded-xl py-2 px-3 text-xs bg-white text-slate-800 outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="UPCOMING">Upcoming</option>
                <option value="COMPLETED">Completed</option>
              </select>

              {(filterGenre !== "ALL" || filterAudience !== "ALL" || filterClass !== "ALL" || filterStatus !== "ALL" || searchQuery) && (
                <button
                  onClick={() => {
                    setFilterGenre("ALL");
                    setFilterAudience("ALL");
                    setFilterClass("ALL");
                    setFilterStatus("ALL");
                    setSearchQuery("");
                  }}
                  className="p-2 text-slate-400 hover:text-slate-600 transition"
                  title="Reset Filters"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Genre Pills */}
          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 self-center mr-1">Quick Genre:</span>
            <button
              onClick={() => setFilterGenre("ALL")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                filterGenre === "ALL" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All
            </button>
            {ALL_GENRES.map((g) => (
              <button
                key={g.value}
                onClick={() => setFilterGenre(g.value)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                  filterGenre === g.value
                    ? "bg-[#7c3aed] text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <g.icon className="w-3 h-3" />
                {g.label}
              </button>
            ))}
          </div>
        </Card>

        {/* Event Cards Grid */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-700 text-base">No events matching criteria</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Try adjusting your genre or audience filters, or click the button below to schedule a new event.
            </p>
            <button
              onClick={handleOpenCreate}
              className="mt-4 px-4 py-2 bg-[#7c3aed] text-white text-xs font-bold rounded-xl hover:bg-[#6d28d9] transition shadow"
            >
              Create New Event
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredEvents.map((event) => (
              <Card
                key={event.id}
                className="p-5 border-slate-200 hover:shadow-lg transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  {/* Genre & Audience Bar */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    {getGenreBadge(event.genre)}
                    <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      {event.status}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-slate-900 text-base group-hover:text-[#7c3aed] transition line-clamp-2">
                    {event.title}
                  </h3>

                  {/* Date & Time */}
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold mt-2.5">
                    <Calendar className="w-3.5 h-3.5 text-[#7c3aed] flex-shrink-0" />
                    <span>
                      {event.startDate} {event.startTime && `• ${event.startTime}`}
                    </span>
                  </div>

                  {/* Venue */}
                  <div className="flex items-center gap-2 text-xs text-slate-600 mt-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                    <span className="truncate">{event.venue}</span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 mt-3 line-clamp-3 leading-relaxed">
                    {event.description}
                  </p>

                  {/* Customization Details (Audience & Target Classes) */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-[11px]">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Users className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                      <span>
                        Audience: <strong className="text-slate-900">{event.targetAudience.replace(/_/g, " ")}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-700">
                      <Tag className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                      <span>
                        Classes: <strong className="text-slate-900">{event.targetClasses.join(", ")}</strong>
                      </span>
                    </div>

                    {event.prizes && (
                      <div className="flex items-center gap-2 text-amber-800 font-medium">
                        <Trophy className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                        <span className="truncate">{event.prizes}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] text-slate-500">
                    {event.registrationRequired ? (
                      <span className="text-emerald-700 font-semibold">
                        {event.registeredCount || 0} / {event.maxParticipants || "∞"} Registered
                      </span>
                    ) : (
                      <span>Open Attendance</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(event)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-purple-700 hover:bg-purple-50 transition"
                      title="Edit Event"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Delete Event"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* ======================================================== */}
        {/* CREATE / EDIT EVENT MODAL                                */}
        {/* ======================================================== */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 md:p-8 space-y-5 my-8 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {editingEvent ? "Edit Event / Activity" : "Create & Customize Event"}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Assign genre, target specific student classes or parents, and configure registration.
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Presets Bar */}
              {!editingEvent && (
                <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100">
                  <p className="text-[11px] font-bold text-purple-900 mb-2">⚡ Quick Event Presets:</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleApplyPreset("competition")}
                      className="px-2.5 py-1 text-xs font-semibold bg-white border border-purple-200 text-purple-800 rounded-lg hover:bg-purple-100 transition shadow-xs"
                    >
                      🏆 Science / Debate Contest
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPreset("celebration")}
                      className="px-2.5 py-1 text-xs font-semibold bg-white border border-pink-200 text-pink-800 rounded-lg hover:bg-pink-100 transition shadow-xs"
                    >
                      🎉 Cultural / National Celebration
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPreset("ptm")}
                      className="px-2.5 py-1 text-xs font-semibold bg-white border border-blue-200 text-blue-800 rounded-lg hover:bg-blue-100 transition shadow-xs"
                    >
                      🤝 Class 10/12 PTM
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPreset("sports")}
                      className="px-2.5 py-1 text-xs font-semibold bg-white border border-emerald-200 text-emerald-800 rounded-lg hover:bg-emerald-100 transition shadow-xs"
                    >
                      ⚽ Sports Meet
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={handleSaveEvent} className="space-y-4 text-xs">
                {/* Event Title */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Event Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formState.title}
                    onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-sm text-slate-900 font-semibold"
                    placeholder="e.g. Annual Inter-School Science Hackathon"
                  />
                </div>

                {/* Genre & Target Audience */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Genre / Category</label>
                    <select
                      value={formState.genre}
                      onChange={(e) => setFormState({ ...formState, genre: e.target.value as EventGenre })}
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-slate-900 bg-white font-medium"
                    >
                      {ALL_GENRES.map((g) => (
                        <option key={g.value} value={g.value}>
                          {g.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Target Audience</label>
                    <select
                      value={formState.targetAudience}
                      onChange={(e) =>
                        setFormState({ ...formState, targetAudience: e.target.value as TargetAudienceRole })
                      }
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-slate-900 bg-white font-medium"
                    >
                      {TARGET_ROLES.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Target Class / Grade */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Target Class / Grade Customization
                  </label>
                  <select
                    value={selectedClassInput}
                    onChange={(e) => setSelectedClassInput(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-slate-900 bg-white font-semibold"
                  >
                    <option value="All Classes">All Classes / Entire School</option>
                    <option value="Class 10">Class 10 Only</option>
                    <option value="Class 12">Class 12 Only</option>
                    <option value="Class 9">Class 9 Only</option>
                    <option value="Class 8">Class 8 Only</option>
                    <option value="Class 7">Class 7 Only</option>
                    <option value="Class 6">Class 6 Only</option>
                    <option value="Class 5">Class 5 Only</option>
                    <option value="Primary Section (KG - Class 5)">Primary Section (KG - Class 5)</option>
                    <option value="Middle Section (Class 6 - 8)">Middle Section (Class 6 - 8)</option>
                    <option value="Secondary & Senior (Class 9 - 12)">Secondary & Senior (Class 9 - 12)</option>
                    {classes.map((c) => (
                      <option key={c.id} value={`${c.class_name} ${c.section}`}>
                    {c.class_name} {c.section}
                    {c.class_name} {c.section}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dates & Times */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Start Date</label>
                    <input
                      type="date"
                      required
                      value={formState.startDate}
                      onChange={(e) => setFormState({ ...formState, startDate: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl p-2 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Start Time</label>
                    <input
                      type="text"
                      value={formState.startTime}
                      onChange={(e) => setFormState({ ...formState, startTime: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl p-2 text-slate-900"
                      placeholder="09:00 AM"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">End Date</label>
                    <input
                      type="date"
                      required
                      value={formState.endDate}
                      onChange={(e) => setFormState({ ...formState, endDate: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl p-2 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">End Time</label>
                    <input
                      type="text"
                      value={formState.endTime}
                      onChange={(e) => setFormState({ ...formState, endTime: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl p-2 text-slate-900"
                      placeholder="05:00 PM"
                    />
                  </div>
                </div>

                {/* Venue */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Venue / Location</label>
                  <input
                    type="text"
                    value={formState.venue}
                    onChange={(e) => setFormState({ ...formState, venue: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-2 text-slate-900"
                    placeholder="e.g. Auditorium / Sports Ground"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Description & Guidelines</label>
                  <textarea
                    rows={3}
                    value={formState.description}
                    onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-2 text-slate-900 leading-relaxed"
                    placeholder="Provide details about the event, rules, schedule..."
                  />
                </div>

                {/* Competition Awards & Eligibility (if competition) */}
                {formState.genre === "COMPETITION" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-amber-50/50 rounded-xl border border-amber-200">
                    <div>
                      <label className="font-bold text-amber-900 block mb-1">Prizes & Awards</label>
                      <input
                        type="text"
                        value={formState.prizes}
                        onChange={(e) => setFormState({ ...formState, prizes: e.target.value })}
                        className="w-full border border-amber-200 rounded-lg p-2 text-slate-900 bg-white"
                        placeholder="1st: Gold Trophy | 2nd: Silver"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-amber-900 block mb-1">Eligibility Criteria</label>
                      <input
                        type="text"
                        value={formState.eligibility}
                        onChange={(e) => setFormState({ ...formState, eligibility: e.target.value })}
                        className="w-full border border-amber-200 rounded-lg p-2 text-slate-900 bg-white"
                        placeholder="Teams of 2 to 4 students"
                      />
                    </div>
                  </div>
                )}

                {/* Coordinator & Registration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Coordinator Name</label>
                    <input
                      type="text"
                      value={formState.coordinatorName}
                      onChange={(e) => setFormState({ ...formState, coordinatorName: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl p-2 text-slate-900"
                      placeholder="Faculty In-Charge"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Contact Email / Phone</label>
                    <input
                      type="text"
                      value={formState.coordinatorContact}
                      onChange={(e) => setFormState({ ...formState, coordinatorContact: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl p-2 text-slate-900"
                      placeholder="coordinator@school.edu"
                    />
                  </div>
                </div>

                {/* Registration Settings */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 block">Registration Required</span>
                    <span className="text-[11px] text-slate-500">Enable attendee slot reservation & headcounts</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formState.registrationRequired}
                      onChange={(e) => setFormState({ ...formState, registrationRequired: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#7c3aed]"></div>
                  </label>
                </div>

                {formState.registrationRequired && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Max Participant Slots</label>
                      <input
                        type="number"
                        value={formState.maxParticipants}
                        onChange={(e) => setFormState({ ...formState, maxParticipants: Number(e.target.value) })}
                        className="w-full border border-slate-200 rounded-xl p-2 text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Registration Deadline</label>
                      <input
                        type="date"
                        value={formState.registrationDeadline}
                        onChange={(e) => setFormState({ ...formState, registrationDeadline: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl p-2 text-slate-900"
                      />
                    </div>
                  </div>
                )}

                {/* Submit Buttons */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-semibold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#7c3aed] text-white font-bold rounded-xl hover:bg-[#6d28d9] transition shadow-md"
                  >
                    {editingEvent ? "Save Changes" : "Create Event"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
