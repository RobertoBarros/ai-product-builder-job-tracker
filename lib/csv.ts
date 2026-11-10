/**
 * Minimal CSV parser (RFC 4180): comma separated, fields may be wrapped in
 * double quotes, "" inside quotes is a literal quote, quoted fields may contain
 * commas and line breaks. Handles \n and \r\n line endings and a UTF-8 BOM.
 * Returns one array of fields per record; blank lines are skipped.
 */
export function parseCsv(text: string): string[][] {
  const input = text.replace(/^﻿/, "");
  const records: string[][] = [];
  let record: string[] = [];
  let field = "";
  let inQuotes = false;

  const endRecord = () => {
    record.push(field);
    if (!(record.length === 1 && record[0].trim() === "")) records.push(record);
    record = [];
    field = "";
  };

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];

    if (inQuotes) {
      if (ch === '"') {
        if (input[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      record.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && input[i + 1] === "\n") i++;
      endRecord();
    } else {
      field += ch;
    }
  }

  if (inQuotes) throw new Error("The file has a quote (\") that is never closed.");
  if (field !== "" || record.length > 0) endRecord();
  return records;
}
