const BASE = "/api";

async function parseResponse<T>(response: Response, fallbackData: T): Promise<T> {
  if (!response.ok) return fallbackData;
  const text = await response.text();
  if (!text || !text.trim()) return fallbackData;
  try {
    const data = JSON.parse(text);
    if (data && typeof data === "object") {
      if ("data" in data && data.data !== undefined) return data.data as T;
      if ("items" in data && Array.isArray(data.items)) return data.items as T;
    }
    return data as T;
  } catch {
    return fallbackData;
  }
}

export interface OverviewReportData {
  totalStudents: number;
  attendanceRate: number;
  totalCollection: number;
  totalExpenses: number;
  booksIssued: number;
  hostelOccupancy: number;
  activeVehicles: number;
}

export async function fetchOverviewReport(token: string): Promise<OverviewReportData> {
  const headers = { Authorization: `Bearer ${token}` };

  const [studentsRes, attendanceRes, financeRes, libraryRes, hostelRes, transportRes] = await Promise.allSettled([
    fetch(`${BASE}/students`, { headers }),
    fetch(`${BASE}/attendance`, { headers }),
    fetch(`${BASE}/finance/overview`, { headers }),
    fetch(`${BASE}/library/reports/monthly`, { headers }),
    fetch(`${BASE}/hostel/dashboard/stats`, { headers }),
    fetch(`${BASE}/transport/vehicles`, { headers }),
  ]);

  const students = studentsRes.status === "fulfilled" ? await parseResponse<any[]>(studentsRes.value, []) : [];
  const attendance = attendanceRes.status === "fulfilled" ? await parseResponse<any[]>(attendanceRes.value, []) : [];
  const finance = financeRes.status === "fulfilled" ? await parseResponse<any>(financeRes.value, {}) : {};
  const library = libraryRes.status === "fulfilled" ? await parseResponse<any>(libraryRes.value, {}) : {};
  const hostel = hostelRes.status === "fulfilled" ? await parseResponse<any>(hostelRes.value, {}) : {};
  const vehicles = transportRes.status === "fulfilled" ? await parseResponse<any[]>(transportRes.value, []) : [];

  const totalStudents = students.length;
  const presentCount = attendance.filter((a) => String(a.status).toUpperCase() === "PRESENT").length;
  const attendanceRate = attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : 0;
  const totalCollection = Number(finance?.total_revenue ?? finance?.total_paid ?? 0);
  const totalExpenses = Number(finance?.total_expenses ?? 0);
  const booksIssued = Number(library?.total_borrowed ?? library?.borrowed_count ?? 0);
  const hostelOccupancy = Number(hostel?.total_allocated ?? hostel?.occupancy_rate ?? 0);
  const activeVehicles = vehicles.filter((v) => String(v.status ?? "ACTIVE").toUpperCase() === "ACTIVE").length;

  return {
    totalStudents,
    attendanceRate,
    totalCollection,
    totalExpenses,
    booksIssued,
    hostelOccupancy,
    activeVehicles,
  };
}

export async function fetchCategoryReportData(token: string, category: string): Promise<any[]> {
  const headers = { Authorization: `Bearer ${token}` };

  switch (category) {
    case "attendance": {
      const res = await fetch(`${BASE}/attendance`, { headers });
      return parseResponse<any[]>(res, []);
    }
    case "exams": {
      const res = await fetch(`${BASE}/exams`, { headers });
      return parseResponse<any[]>(res, []);
    }
    case "finance": {
      const res = await fetch(`${BASE}/finance/transactions`, { headers });
      return parseResponse<any[]>(res, []);
    }
    case "students": {
      const res = await fetch(`${BASE}/students`, { headers });
      return parseResponse<any[]>(res, []);
    }
    case "library": {
      const res = await fetch(`${BASE}/library/reports/most-borrowed`, { headers });
      return parseResponse<any[]>(res, []);
    }
    case "hostel": {
      const res = await fetch(`${BASE}/hostel/allocations`, { headers });
      return parseResponse<any[]>(res, []);
    }
    case "transport": {
      const res = await fetch(`${BASE}/transport/routes`, { headers });
      return parseResponse<any[]>(res, []);
    }
    default:
      return [];
  }
}
