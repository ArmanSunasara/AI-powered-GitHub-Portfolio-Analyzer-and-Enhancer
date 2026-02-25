export const extractUsername = (url) => {
  if (!url || typeof url !== "string") {
    return null;
  }

  try {
    const trimmedUrl = url.trim();
    
    if (trimmedUrl.includes("github.com/")) {
      const match = trimmedUrl.match(/github\.com\/([^\/\s?#]+)/);
      return match ? match[1] : null;
    }
    
    return trimmedUrl.split("/")[0].split("?")[0].trim() || null;
  } catch {
    return null;
  }
};
