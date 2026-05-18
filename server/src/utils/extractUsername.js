const USERNAME_PATTERN = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$/;

export const extractUsername = (url) => {
  if (!url || typeof url !== "string") return null;

  const trimmed = url.trim();
  if (!trimmed) return null;

  let candidate = trimmed;

  const githubMatch = trimmed.match(/github\.com\/([^/\s?#]+)/i);
  if (githubMatch) {
    candidate = githubMatch[1];
  } else if (/[/:]/.test(trimmed)) {
    return null;
  }

  candidate = candidate.replace(/\.git$/i, "").trim();

  return USERNAME_PATTERN.test(candidate) ? candidate : null;
};
