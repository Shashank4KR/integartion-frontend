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

export const INITIAL_BRANCHES: SubBranch[] = [
  {
    id: "branch-main",
    name: "Nomera Main Campus",
    code: "NOM-HQ",
    type: "MAIN_CAMPUS",
    boardAffiliation: "Central Board of Secondary Education (CBSE)",
    address: "14 Campus Road, Central Square",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560001",
    headName: "Dr. K. S. Rao",
    headEmail: "principal.main@nomera.edu",
    headPhone: "+91 98765 43210",
    studentCapacity: 1200,
    currentEnrollment: 6, // Real database count
    facultyCount: 6,      // Real database count
    status: "ACTIVE",
    isHeadquarters: true,
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "branch-north",
    name: "Nomera North Campus (Sub-Branch)",
    code: "NOM-NORTH",
    type: "SUB_BRANCH",
    boardAffiliation: "CBSE / State Board",
    address: "88 Ring Road, Yelahanka",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560064",
    headName: "Mrs. Meenakshi Sundaram",
    headEmail: "head.north@nomera.edu",
    headPhone: "+91 98765 43220",
    studentCapacity: 600,
    currentEnrollment: 0,
    facultyCount: 0,
    status: "ACTIVE",
    isHeadquarters: false,
    createdAt: "2026-02-15T00:00:00Z",
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
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_BRANCHES;
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
