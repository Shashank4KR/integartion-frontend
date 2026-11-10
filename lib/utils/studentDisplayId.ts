type StudentDisplayIdParts = {
  joiningDate?: string | null;
  className?: string | null;
  section?: string | null;
  rollNumber?: string | null;
  admissionNumber?: string | null;
};

/** Builds the compact school-facing ID from the student’s roster details. */
export function studentDisplayId({
  joiningDate,
  className,
  section,
  rollNumber,
  admissionNumber,
}: StudentDisplayIdParts): string {
  const year = joiningDate?.match(/^(\d{4})/)?.[1]?.slice(-2);
  const grade = (className ?? "")
    .replace(/^(class|grade)\s*/i, "")
    .replace(/\s+/g, "");
  const sectionCode = section?.replace(/^section\s*/i, "").trim().toUpperCase();
  const roll = rollNumber?.trim();

  if (year && grade && sectionCode && roll) {
    const formattedRoll = /^\d+$/.test(roll) ? roll.padStart(3, "0") : roll.toUpperCase();
    return `S-${year}-${grade}${sectionCode}-${formattedRoll}`;
  }

  return admissionNumber || "ID pending";
}
