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
    certificateNo: "TC-2026-0093",
    issueDate: new Date().toISOString().split("T")[0],
    studentName: "Aarav Sharma",
    admissionNo: "ADM-2022-841",
    rollNo: "18",
    className: "Class 10",
    section: "A",
    academicYear: "2025-2026",
    gender: "Male",
    fatherName: "Rajesh Sharma",
    motherName: "Sunita Sharma",
    dob: "2009-08-15",
    dobWords: "Fifteenth of August Two Thousand Nine",
    villageTown: "Indiranagar",
    district: "Bengaluru",
    state: "Karnataka",
    dateOfAdmission: "2021-04-05",
    dateOfLeaving: new Date().toISOString().split("T")[0],
    passedToClass: "Class 11 (Senior Secondary)",
    boardExamDetails: "Secondary School Examination (AISSE)",
    duesCleared: "Yes",
    conduct: "Exemplary",
    reasonForLeaving: "Completion of School Course & Higher Studies",
  },
  BONAFIDE: {
    templateType: "BONAFIDE",
    certificateNo: "BON-2026-0145",
    issueDate: new Date().toISOString().split("T")[0],
    studentName: "Priya Nair",
    admissionNo: "ADM-2023-512",
    rollNo: "24",
    className: "Class 12 - Science",
    section: "A",
    academicYear: "2025-2026",
    gender: "Female",
    fatherName: "K. R. Nair",
    motherName: "Lekha Nair",
    dob: "2008-03-22",
    dobWords: "Twenty-Second of March Two Thousand Eight",
    villageTown: "Indiranagar",
    district: "Bengaluru",
    state: "Karnataka",
    conduct: "Exemplary",
    customNote: "This certificate is issued for passport verification and academic foundation fellowship purpose.",
  },
  MERIT: {
    templateType: "MERIT",
    certificateNo: "MERIT-2026-302",
    issueDate: new Date().toISOString().split("T")[0],
    certificateTitle: "CERTIFICATE OF MERIT & EXCELLENCE",
    studentName: "Rohan Varma",
    admissionNo: "ADM-2021-309",
    rollNo: "09",
    className: "Class 10",
    section: "B",
    academicYear: "2025-2026",
    gender: "Male",
    fatherName: "Vikram Varma",
    motherName: "Anita Varma",
    dob: "2009-11-10",
    dobWords: "Tenth of November Two Thousand Nine",
    villageTown: "Bengaluru",
    district: "Bengaluru Urban",
    state: "Karnataka",
    eventName: "Annual Inter-School Science & Robotics Championship 2026",
    eventGenre: "Competition",
    achievement: "First Prize - Gold Medal Winner",
    eventDate: "February 24, 2026",
    eventVenue: "State Science Center & Auditorium",
  },
  CASTE_ENDORSEMENT: {
    templateType: "CASTE_ENDORSEMENT",
    certificateNo: "SCH-ENDORSE-2026-077",
    issueDate: new Date().toISOString().split("T")[0],
    studentName: "Sneha Patil",
    admissionNo: "ADM-2022-650",
    rollNo: "31",
    className: "Class 9",
    section: "A",
    academicYear: "2025-2026",
    gender: "Female",
    fatherName: "Mahesh Patil",
    motherName: "Geetha Patil",
    dob: "2010-06-18",
    dobWords: "Eighteenth of June Two Thousand Ten",
    villageTown: "Hubballi",
    district: "Dharwad",
    state: "Karnataka",
    casteCategory: "OBC",
    subCaste: "Lingayat (Category 3B)",
    annualIncome: "1,50,000",
    incomeInWords: "One Lakh Fifty Thousand Rupees Only",
    purpose: "State / National Scholarship Portal (NSP / SSP) & Tuition Fee Concession",
  },
  CONDUCT: {
    templateType: "CONDUCT",
    certificateNo: "COND-2026-019",
    issueDate: new Date().toISOString().split("T")[0],
    studentName: "Devansh Mehra",
    admissionNo: "ADM-2020-112",
    rollNo: "12",
    className: "Class 12 - Commerce",
    section: "C",
    academicYear: "2025-2026",
    gender: "Male",
    fatherName: "Sanjay Mehra",
    motherName: "Pooja Mehra",
    dob: "2008-01-30",
    dobWords: "Thirtieth of January Two Thousand Eight",
    villageTown: "Indiranagar",
    district: "Bengaluru",
    state: "Karnataka",
    dateOfAdmission: "2020-04-10",
    conduct: "Exemplary",
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
    if (!raw || raw.includes("HOLY CHILD") || raw.includes("Sonitpur")) {
      const sample: IssuedCertificateRecord[] = [
        {
          id: "cert-01",
          certificateNo: "TC-2026-0093",
          templateType: "TC",
          studentName: "Aarav Sharma",
          admissionNo: "ADM-2022-841",
          className: "Class 10",
          issueDate: new Date().toISOString().split("T")[0],
          status: "ISSUED",
          formData: INITIAL_FORM_DATA.TC,
          schoolSettings: DEFAULT_SCHOOL_SETTINGS,
          createdAt: new Date().toISOString(),
        },
        {
          id: "cert-02",
          certificateNo: "BON-2026-0145",
          templateType: "BONAFIDE",
          studentName: "Priya Nair",
          admissionNo: "ADM-2023-512",
          className: "Class 12 - Science",
          issueDate: new Date().toISOString().split("T")[0],
          status: "ISSUED",
          formData: INITIAL_FORM_DATA.BONAFIDE,
          schoolSettings: DEFAULT_SCHOOL_SETTINGS,
          createdAt: new Date().toISOString(),
        },
      ];
      localStorage.setItem(ISSUED_KEY, JSON.stringify(sample));
      return sample;
    }
    return JSON.parse(raw);
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
      if (Array.isArray(data) && data.length > 0) return data;
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
