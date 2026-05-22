/**
 * Parses an uploaded Excel buffer into a flat array of candidate rows.
 *
 * Only the first worksheet is read. The first non-empty row is treated as
 * the header. Column matching is case- and whitespace-insensitive so common
 * variants ("GitHub URL", "github_url", "Github") all resolve to the same
 * normalized field.
 *
 * Required column: github_url (any of: github, github_url, github url, profile).
 * Optional columns: name, email, college, resume_url, linkedin_url.
 */
import ExcelJS from "exceljs";

const HEADER_ALIASES = {
  github_url: ["github_url", "github url", "github", "profile", "github profile"],
  name: ["name", "full name", "student name", "candidate", "candidate name"],
  email: ["email", "email id", "email address"],
  college: ["college", "university", "institute", "school"],
  resume_url: ["resume_url", "resume url", "resume", "cv", "cv url"],
  linkedin_url: ["linkedin_url", "linkedin url", "linkedin"],
};

const normalize = (value) =>
  String(value ?? "").trim().toLowerCase().replace(/[\s_-]+/g, " ");

const buildHeaderMap = (headerRow) => {
  const map = {};
  headerRow.forEach((rawHeader, index) => {
    const normalized = normalize(rawHeader);
    if (!normalized) return;
    for (const [field, aliases] of Object.entries(HEADER_ALIASES)) {
      if (map[field] !== undefined) continue;
      if (aliases.some((alias) => normalize(alias) === normalized)) {
        map[field] = index;
        return;
      }
    }
  });
  return map;
};

const cellToString = (cell) => {
  if (cell === null || cell === undefined) return "";
  if (typeof cell === "string") return cell.trim();
  if (typeof cell === "number" || typeof cell === "boolean")
    return String(cell).trim();
  // Hyperlink / rich-text cells from ExcelJS arrive as objects
  if (typeof cell === "object") {
    if (typeof cell.text === "string") return cell.text.trim();
    if (typeof cell.hyperlink === "string") return cell.hyperlink.trim();
    if (Array.isArray(cell.richText)) {
      return cell.richText.map((part) => part.text || "").join("").trim();
    }
    if (cell.result !== undefined) return String(cell.result).trim();
  }
  return "";
};

export const parseShortlistExcel = async (buffer) => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    throw new Error("Uploaded file has no worksheets");
  }

  const rawRows = [];
  worksheet.eachRow({ includeEmpty: false }, (row) => {
    // row.values is 1-indexed; slice(1) gives a normal 0-indexed array
    const values = Array.isArray(row.values) ? row.values.slice(1) : [];
    rawRows.push(values.map(cellToString));
  });

  if (rawRows.length === 0) {
    throw new Error("Uploaded file is empty");
  }

  const headerMap = buildHeaderMap(rawRows[0]);
  if (headerMap.github_url === undefined) {
    throw new Error(
      'Excel must include a "github_url" column (also accepted: "github", "profile")'
    );
  }

  const dataRows = rawRows.slice(1);
  const candidates = [];
  for (const row of dataRows) {
    const candidate = {};
    for (const [field, index] of Object.entries(headerMap)) {
      const value = row[index];
      if (value) candidate[field] = value;
    }
    if (!candidate.github_url) continue;
    candidates.push(candidate);
  }

  return candidates;
};
