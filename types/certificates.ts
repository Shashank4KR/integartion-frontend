export type CertificateType =
  | "TC"
  | "BONAFIDE"
  | "MERIT"
  | "CASTE_ENDORSEMENT"
  | "CONDUCT";

export type CertificateTheme =
  | "classic_gold"
  | "royal_navy"
  | "burgundy"
  | "emerald"
  | "slate_minimal";

export interface SignatoryConfig {
  name: string;
  title: string;
  signatureImage?: string;
}

export interface SchoolCertificateSettings {
  schoolName: string;
  affiliation: string;
  schoolCode: string;
  udiseCode: string;
  address: string;
  district: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  website: string;
  logoUrl: string;
  sealUrl: string;
  showWatermark: boolean;
  theme: CertificateTheme;
  primaryColor: string;
  accentColor: string;
  signatory1: SignatoryConfig; // e.g. Class Teacher / Verification Officer
  signatory2: SignatoryConfig; // e.g. Exam Controller / Head of Institution
  signatory3: SignatoryConfig; // e.g. Principal
}

export interface CertificateFormData {
  templateType: CertificateType;
  certificateNo: string;
  issueDate: string;
  studentId?: string;
  studentName: string;
  admissionNo: string;
  rollNo: string;
  className: string;
  section: string;
  academicYear: string;
  gender?: "Male" | "Female" | "Other" | "";
  fatherName: string;
  motherName: string;
  dob: string;
  dobWords: string;
  villageTown: string;
  district: string;
  state: string;
  
  // Transfer Certificate (TC) specific
  dateOfAdmission?: string;
  dateOfLeaving?: string;
  passedToClass?: string;
  boardExamDetails?: string;
  duesCleared?: "Yes" | "No";
  conduct?: "Satisfactory" | "Good" | "Very Good" | "Exemplary";
  reasonForLeaving?: string;

  // Merit / Participation specific
  certificateTitle?: string; // e.g. "CERTIFICATE OF PARTICIPATION", "CERTIFICATE OF MERIT", "CERTIFICATE OF EXCELLENCE"
  eventName?: string;
  eventGenre?: string;
  achievement?: string; // e.g. "Active Participation", "First Prize", "Runner Up"
  eventDate?: string;
  eventVenue?: string;

  // School Caste & Scholarship Endorsement specific
  casteCategory?: string; // "SC" | "ST" | "OBC" | "General" | "EWS"
  subCaste?: string;
  annualIncome?: string;
  incomeInWords?: string;
  purpose?: string; // e.g. "State / National Scholarship Portal (NSP/SSP)", "Fee Concession"
  
  // Custom remarks or custom text
  customNote?: string;
}

export interface IssuedCertificateRecord {
  id: string;
  certificateNo: string;
  templateType: CertificateType;
  studentName: string;
  admissionNo: string;
  className: string;
  issueDate: string;
  status: "ISSUED" | "DRAFT" | "CANCELLED";
  formData: CertificateFormData;
  schoolSettings: SchoolCertificateSettings;
  createdAt: string;
}
