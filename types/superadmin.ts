export type InstitutionType =
  | "COLLEGE"
  | "SCHOOL"
  | "UNIVERSITY"
  | "POLYTECHNIC";

export type DatabaseStrategy =
  | "DEDICATED_DATABASE"
  | "MULTI_TENANT_SCHEMA"
  | "VIRTUAL_PARTITION";

export type InstitutionStatus =
  | "ACTIVE"
  | "PROVISIONING"
  | "MAINTENANCE"
  | "SUSPENDED";

export interface DatabaseConfig {
  strategy: DatabaseStrategy;
  databaseName: string;
  dbHost: string;
  storageQuotaGb: number;
  storageUsedGb: number;
  connectionPoolSize: number;
  status: "CONNECTED" | "SYNCING" | "OFFLINE";
  lastBackupAt?: string;
}

export interface InstitutionAdmin {
  name: string;
  email: string;
  phone?: string;
}

export interface Institution {
  id: string;
  name: string;
  code: string;
  type: InstitutionType;
  boardAffiliation: string;
  city: string;
  state: string;
  country: string;
  status: InstitutionStatus;
  database: DatabaseConfig;
  admin: InstitutionAdmin;
  stats: {
    studentsCount: number;
    facultyCount: number;
    classesCount: number;
    activeUsersToday: number;
  };
  plan: "ENTERPRISE" | "PROFESSIONAL" | "STANDARD";
  createdAt: string;
  updatedAt: string;
}

export interface PlatformHealthMetric {
  service: string;
  status: "HEALTHY" | "DEGRADED" | "DOWN";
  latencyMs: number;
  uptimePct: number;
}
