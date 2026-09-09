import Papa from "papaparse";
import { isValidEmail } from "./validation";

export interface ParsedLeads {
  valid: string[];
  invalidRows: string[];
}

/**
 * Accepts either a CSV with a header column containing "email"
 * (per the assignment's example) or a plain newline-separated list
 * with no header at all.
 */
export function parseLeadsCsv(fileText: string): ParsedLeads {
  const headerParse = Papa.parse<Record<string, string>>(fileText, {
    header: true,
    skipEmptyLines: true,
  });

  const emailColumn = headerParse.meta.fields?.find((field) =>
    field.trim().toLowerCase().includes("email")
  );

  const rawValues: string[] = [];

  if (emailColumn) {
    for (const row of headerParse.data) {
      const value = row[emailColumn];
      if (value != null) rawValues.push(value);
    }
  } else {
    const plainParse = Papa.parse<string[]>(fileText, { skipEmptyLines: true });
    for (const row of plainParse.data) {
      if (row[0]) rawValues.push(row[0]);
    }
  }

  const seen = new Set<string>();
  const valid: string[] = [];
  const invalidRows: string[] = [];

  for (const raw of rawValues) {
    const normalized = raw.trim().toLowerCase();
    if (!normalized) continue;

    if (!isValidEmail(normalized)) {
      invalidRows.push(raw.trim());
      continue;
    }

    if (seen.has(normalized)) continue;
    seen.add(normalized);
    valid.push(normalized);
  }

  return { valid, invalidRows };
}
