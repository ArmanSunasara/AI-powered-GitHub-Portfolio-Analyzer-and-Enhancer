/**
 * Extracts plain text from an uploaded resume buffer.
 *
 * Supports PDF (via unpdf — a serverless-friendly pdfjs wrapper), DOCX (via
 * mammoth), and plain text. The extracted text is sanitized the same way
 * untrusted GitHub README content is: control characters stripped and runaway
 * whitespace tightened, both to keep token usage sane and to blunt any
 * prompt-injection smuggled through invisible characters.
 *
 * Throws a user-facing Error when the type is unsupported or no text could be
 * recovered (e.g. a scanned/image-only PDF).
 */
import mammoth from "mammoth";

const MAX_CHARS = 18000; // comfortably below the ML-service 20k cap

// Strip control chars (except \n and \t) and tighten whitespace.
// eslint-disable-next-line no-control-regex
const CONTROL_CHAR_RE = /[\x00-\x08\x0B-\x1F\x7F]/g;

const sanitizeText = (text) =>
  String(text || "")
    .replace(CONTROL_CHAR_RE, " ")
    .replace(/\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{3,}/g, "  ")
    .trim();

const truncate = (text) =>
  text.length > MAX_CHARS ? `${text.slice(0, MAX_CHARS).trimEnd()}…` : text;

const extractPdf = async (buffer) => {
  // Imported lazily so the (somewhat heavy) pdfjs bundle only loads when a PDF
  // is actually uploaded.
  const { extractText, getDocumentProxy } = await import("unpdf");
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { text } = await extractText(pdf, { mergePages: true });
  return Array.isArray(text) ? text.join("\n") : text;
};

const extractDocx = async (buffer) => {
  const { value } = await mammoth.extractRawText({ buffer });
  return value;
};

/**
 * @param {Buffer} buffer       raw uploaded file
 * @param {string} originalname filename, used to infer the type
 * @param {string} [mimetype]   multer-provided MIME type (best-effort)
 * @returns {Promise<string>}   sanitized, length-capped resume text
 */
export const parseResume = async (buffer, originalname = "", mimetype = "") => {
  if (!buffer || buffer.length === 0) {
    throw new Error("Resume file is empty");
  }

  const ext = (originalname.split(".").pop() || "").toLowerCase();
  const mime = mimetype.toLowerCase();

  let raw = "";
  try {
    if (ext === "pdf" || mime.includes("pdf")) {
      raw = await extractPdf(buffer);
    } else if (
      ext === "docx" ||
      mime.includes("officedocument.wordprocessingml")
    ) {
      raw = await extractDocx(buffer);
    } else if (ext === "txt" || ext === "md" || mime.startsWith("text/")) {
      raw = buffer.toString("utf-8");
    } else {
      throw new Error(
        "Unsupported resume format. Upload a PDF, DOCX, or TXT file."
      );
    }
  } catch (err) {
    // Re-throw our own validation message untouched; wrap parser internals.
    if (err.message?.startsWith("Unsupported resume format")) throw err;
    throw new Error(
      "Could not read the resume. The file may be corrupted or password-protected."
    );
  }

  const text = truncate(sanitizeText(raw));
  if (text.length < 30) {
    throw new Error(
      "Couldn't extract readable text from the resume. If it's a scanned PDF, upload a text-based version."
    );
  }
  return text;
};
