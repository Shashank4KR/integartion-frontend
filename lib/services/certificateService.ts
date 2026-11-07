import { unwrapArray, unwrapData } from "@/lib/utils/unwrap";
import type {
  CertificateFormData,
  CertificateType,
  IssuedCertificateRecord,
  SchoolCertificateSettings,
} from "@/types/certificates";

const SETTINGS_KEY = "nomera_school_certificate_settings";
const ISSUED_KEY = "nomera_issued_certificates";
const BASE = "/api/certificates";

export const DEFAULT_SCHOOL_SETTINGS: SchoolCertificateSettings = {
  schoolName: "Nomera",
  affiliation: "Affiliated to Central Board of Secondary Education (CBSE)",
  schoolCode: "NOMERA-2026",
  udiseCode: "",
  address: "14 Campus Road",
  district: "Bengaluru",
  state: "Karnataka",
  pincode: "560001",
  phone: "+91 98765 43210",
  email: "office@nomera.edu",
  website: "https://nomera.edu",
  logoUrl: "",
  sealUrl: "",
  showWatermark: true,
  theme: "classic_gold",
  primaryColor: "#064e3b",
  accentColor: "#d97706",
  signatory1: {
    name: "",
    title: "Prepared By / Clerk",
  },
  signatory2: {
    name: "",
    title: "Class Teacher",
  },
  signatory3: {
    name: "",
    title: "Principal",
  },
};

export const INITIAL_FORM_DATA: Record<CertificateType, CertificateFormData> = {
  TC: {
    templateType: "TC",
    certificateNo: "TC-" + new Date().getFullYear() + "-0001",
    issueDate: new Date().toISOString().split("T")[0],
    studentName: "",
    admissionNo: "",
    rollNo: "",
    className: "",
    section: "",
    academicYear: "2026-2027",
    gender: "",
    fatherName: "",
    motherName: "",
    dob: "",
    dobWords: "",
    villageTown: "",
    district: "",
    state: "",
    dateOfAdmission: "",
    dateOfLeaving: new Date().toISOString().split("T")[0],
    passedToClass: "",
    boardExamDetails: "Secondary School Examination",
    duesCleared: "Yes",
    conduct: "Good",
    reasonForLeaving: "",
  },
  BONAFIDE: {
    templateType: "BONAFIDE",
    certificateNo: "BON-" + new Date().getFullYear() + "-0001",
    issueDate: new Date().toISOString().split("T")[0],
    studentName: "",
    admissionNo: "",
    rollNo: "",
    className: "",
    section: "",
    academicYear: "2026-2027",
    gender: "",
    fatherName: "",
    motherName: "",
    dob: "",
    dobWords: "",
    villageTown: "",
    district: "",
    state: "",
    conduct: "Good",
    customNote: "This certificate is issued on request for official verification and academic purposes.",
  },
  MERIT: {
    templateType: "MERIT",
    certificateNo: "MERIT-" + new Date().getFullYear() + "-0001",
    issueDate: new Date().toISOString().split("T")[0],
    certificateTitle: "CERTIFICATE OF MERIT",
    studentName: "",
    admissionNo: "",
    rollNo: "",
    className: "",
    section: "",
    academicYear: "2026-2027",
    gender: "",
    fatherName: "",
    motherName: "",
    dob: "",
    dobWords: "",
    villageTown: "",
    district: "",
    state: "",
    eventName: "",
    eventGenre: "Academic",
    achievement: "",
    eventDate: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    eventVenue: "School Campus",
  },
  CASTE_ENDORSEMENT: {
    templateType: "CASTE_ENDORSEMENT",
    certificateNo: "SCH-ENDORSE-" + new Date().getFullYear() + "-0001",
    issueDate: new Date().toISOString().split("T")[0],
    studentName: "",
    admissionNo: "",
    rollNo: "",
    className: "",
    section: "",
    academicYear: "2026-2027",
    gender: "",
    fatherName: "",
    motherName: "",
    dob: "",
    dobWords: "",
    villageTown: "",
    district: "",
    state: "",
    casteCategory: "General",
    subCaste: "",
    annualIncome: "",
    incomeInWords: "",
    purpose: "Scholarship Portal & Academic Records Endorsement",
  },
  CONDUCT: {
    templateType: "CONDUCT",
    certificateNo: "COND-" + new Date().getFullYear() + "-0001",
    issueDate: new Date().toISOString().split("T")[0],
    studentName: "",
    admissionNo: "",
    rollNo: "",
    className: "",
    section: "",
    academicYear: "2026-2027",
    gender: "",
    fatherName: "",
    motherName: "",
    dob: "",
    dobWords: "",
    villageTown: "",
    district: "",
    state: "",
    dateOfAdmission: "",
    conduct: "Good",
  },
};

// ==========================================
// Storage Helpers
// ==========================================
export function getSavedSchoolSettings(): SchoolCertificateSettings {
  if (typeof window === "undefined") return DEFAULT_SCHOOL_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SCHOOL_SETTINGS;
    const parsed = JSON.parse(raw);
    // Sanitize any previous legacy/sample school name
    if (
      parsed.schoolName &&
      (parsed.schoolName.toUpperCase().includes("HOLY CHILD") ||
        parsed.schoolName.includes("Nomera Global Academy"))
    ) {
      parsed.schoolName = "Nomera";
      localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...DEFAULT_SCHOOL_SETTINGS, ...parsed }));
    }
    return { ...DEFAULT_SCHOOL_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SCHOOL_SETTINGS;
  }
}

export function saveSchoolCertificateSettings(
  settings: SchoolCertificateSettings,
): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error("Failed to save school certificate settings:", err);
  }
}

export function getIssuedCertificates(): IssuedCertificateRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ISSUED_KEY);
    if (!raw) {
      localStorage.setItem(ISSUED_KEY, JSON.stringify([]));
      return [];
    }
    const parsed = JSON.parse(raw);
    // Purge any legacy sample mock certificates
    const cleaned = Array.isArray(parsed)
      ? parsed.filter(
          (r: IssuedCertificateRecord) =>
            !["cert-01", "cert-02", "cert-03"].includes(r.id) &&
            !["Aarav Sharma", "Priya Nair", "Rohan Varma"].includes(r.studentName)
        )
      : [];
    localStorage.setItem(ISSUED_KEY, JSON.stringify(cleaned));
    return cleaned;
  } catch {
    return [];
  }
}

export function saveIssuedCertificate(
  record: IssuedCertificateRecord,
): IssuedCertificateRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const existing = getIssuedCertificates();
    const updated = [record, ...existing.filter((r) => r.id !== record.id)];
    localStorage.setItem(ISSUED_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function deleteIssuedCertificate(id: string): IssuedCertificateRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const existing = getIssuedCertificates();
    const updated = existing.filter((r) => r.id !== id);
    localStorage.setItem(ISSUED_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

// ==========================================
// API Compatibility Functions
// ==========================================
export async function listCertificates(token: string): Promise<any[]> {
  try {
    const response = await fetch(`${BASE}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.ok) {
      const data = await response.json();
      const arr = unwrapArray(data);
      if (arr.length > 0) return arr;
    }
  } catch {
    // Fallback to local store
  }
  return getIssuedCertificates();
}

export async function generateCertificate(
  token: string,
  payload: any,
): Promise<any> {
  try {
    const response = await fetch(`${BASE}/generate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (response.ok) {
      return await response.json();
    }
  } catch {
    // Handled locally
  }
  return payload;
}
