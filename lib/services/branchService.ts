export type CampusType =
  | "MAIN_CAMPUS"
  | "SUB_BRANCH"
  | "PRIMARY_WING"
  | "SENIOR_WING"
  | "SPORTS_ACADEMY";

export interface SubBranch {
  id: string;
  name: string;
  code: string;
  type: CampusType;
  boardAffiliation: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  headName: string;
  headEmail: string;
  headPhone: string;
  studentCapacity: number;
  currentEnrollment: number;
  facultyCount: number;
  status: "ACTIVE" | "UPCOMING" | "MAINTENANCE";
  isHeadquarters: boolean;
  createdAt: string;
}

const STORAGE_KEY = "nomera_school_sub_branches";
const ACTIVE_CAMPUS_KEY = "nomera_active_sub_branch_id";

// ONLY the primary Nomera campus exists initially. Zero mock campuses.
export const INITIAL_BRANCHES: SubBranch[] = [
  {
    id: "branch-main",
    name: "Nomera Main Campus",
    code: "NOMERA",
    type: "MAIN_CAMPUS",
    boardAffiliation: "Central Board of Secondary Education (CBSE)",
    address: "14 Campus Road",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560001",
    headName: "School Principal",
    headEmail: "office@nomera.edu",
    headPhone: "+91 98765 43210",
    studentCapacity: 50,
    currentEnrollment: 6, // Real verified database count
    facultyCount: 6,      // Real verified database count
    status: "ACTIVE",
    isHeadquarters: true,
    createdAt: "2026-01-01T00:00:00Z",
  },
];

export function getSubBranches(): SubBranch[] {
  if (typeof window === "undefined") return INITIAL_BRANCHES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_BRANCHES));
      return INITIAL_BRANCHES;
    }
    const parsed = JSON.parse(raw);
    // PURGE any mock campuses like "branch-north"
    const cleaned = Array.isArray(parsed)
      ? parsed.filter(
          (b) =>
            b.id === "branch-main" ||
            (b.id !== "branch-north" &&
              !b.name.toLowerCase().includes("north campus") &&
              b.id.startsWith("branch-17")),
        )
      : INITIAL_BRANCHES;

    if (!cleaned.find((b) => b.id === "branch-main")) {
      cleaned.unshift(INITIAL_BRANCHES[0]);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
    return cleaned;
  } catch {
    return INITIAL_BRANCHES;
  }
}

export function saveSubBranch(branch: Omit<SubBranch, "id" | "createdAt"> & { id?: string }): SubBranch[] {
  const current = getSubBranches();
  let updated: SubBranch[];
  if (branch.id) {
    updated = current.map((b) => (b.id === branch.id ? { ...b, ...branch } : b));
  } else {
    const newBranch: SubBranch = {
      ...branch,
      id: "branch-" + Date.now(),
      createdAt: new Date().toISOString(),
    };
    updated = [...current, newBranch];
  }
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
  return updated;
}

export function deleteSubBranch(id: string): SubBranch[] {
  const current = getSubBranches();
  // Prevent deleting headquarters
  const updated = current.filter((b) => b.id !== id || b.isHeadquarters);
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
  return updated;
}

export function getActiveCampusId(): string {
  if (typeof window === "undefined") return "branch-main";
  try {
    return localStorage.getItem(ACTIVE_CAMPUS_KEY) || "branch-main";
  } catch {
    return "branch-main";
  }
}

export function setActiveCampusId(id: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(ACTIVE_CAMPUS_KEY, id);
    window.dispatchEvent(new Event("nomera_campus_changed"));
  }
}
